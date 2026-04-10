'use server';

import { db } from '@/db';
import { events, users, attendance, participants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import { getDistance } from 'geolib';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getEncodedSecret, getJwtSecret } from '@/lib/auth';

const encodedSecret = getEncodedSecret();

export async function validateScanAction(data: {
  token: string;
  latitude: number | null;
  longitude: number | null;
}) {
  try {
    // 1. Verify QR Token
    const encodedSecret = getEncodedSecret();
    let payload;
    try {
      const result = await jwtVerify(data.token, encodedSecret);
      payload = result.payload as { eventId: string; type: string; timestamp: number };
    } catch (err: any) {
      if (err.code === 'ERR_JWT_EXPIRED') {
        return { error: 'Scan session expired. Please scan again.', status: 'EXPIRED_QR' };
      }
      return { error: 'Invalid QR code. Please scan again.', status: 'EXPIRED_QR' };
    }

    const { eventId } = payload;
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) return { error: 'Event not found.' };

    // 2. Proximity Check
    if (data.latitude && data.longitude) {
      const distance = getDistance(
        { latitude: data.latitude, longitude: data.longitude },
        { latitude: event.latitude, longitude: event.longitude }
      );
      if (distance > event.radius) {
        return { error: `Too far from event site (${(distance/1000).toFixed(1)}km away).`, status: 'INVALID_LOCATION' };
      }
    } else {
      return { error: 'GPS location required.', status: 'INVALID_LOCATION' };
    }

    // Return a session token that proves QR + GPS is valid
    const sessionToken = await new SignJWT({ 
      eventId: event.id, 
      lat: data.latitude, 
      lng: data.longitude,
      type: 'scan_session'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(encodedSecret);

    return { success: true, sessionToken, eventTitle: event.title, eventId: event.id };
  } catch (err) {
    return { error: 'Validation failed.' };
  }
}

export async function lookupParticipantAction(email: string, sessionToken: string) {
  try {
    const { payload } = await jwtVerify(sessionToken, encodedSecret);
    const { eventId } = payload as { eventId: string };
    
    const [participant] = await db.select().from(participants).where(
      and(
        eq(participants.eventId, eventId),
        eq(participants.email, email.toLowerCase().trim())
      )
    ).limit(1);

    if (participant) {
      return { 
        recognized: true, 
        name: participant.name, 
        surname: participant.surname,
        email: participant.email
      };
    }
    return { recognized: false, email };
  } catch (err) {
    return { error: 'Session expired or invalid.' };
  }
}

export async function checkInAction(data: {
  token: string;
  latitude: number | null;
  longitude: number | null;
  registrationData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role?: 'PARTICIPANT' | 'ADMIN';
  };
}) {
  try {
    // 1. Verify QR Token
    let payload;
    const secret = getJwtSecret();
    const encodedSecret = getEncodedSecret();

    try {
      const result = await jwtVerify(data.token, encodedSecret);
      payload = result.payload as { eventId: string; type: string; timestamp: number };
    } catch (err: any) {
      if (err.code === 'ERR_JWT_EXPIRED') {
        return { error: 'Your scan session has expired. Please scan the QR code again.', status: 'EXPIRED_QR' };
      }
      return { error: 'Invalid or corrupted QR code. Please scan again.', status: 'EXPIRED_QR' };
    }

    const { eventId, type } = payload;
    
    // Security: 'registration_submit' token can only be used if registrationData is provided
    if (type === 'registration_submit' && !data.registrationData) {
      return { error: 'Invalid operation. Please scan the QR code again.', status: 'EXPIRED_QR' };
    }
    
    // Fetch Event
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) {
      return { error: 'Event not found.' };
    }

    // 2. Proximity Check
    if (data.latitude && data.longitude) {
      const distance = getDistance(
        { latitude: data.latitude, longitude: data.longitude },
        { latitude: event.latitude, longitude: event.longitude }
      );

      if (distance > event.radius) {
        const distanceKm = (distance / 1000).toFixed(1);
        return { 
          error: `Location verification failed. You are ${distanceKm}km away from the event. (Max allowed: ${event.radius}m)`,
          status: 'INVALID_LOCATION',
          distance
        };
      }
    } else {
      return { error: 'GPS location is required for verification.', status: 'INVALID_LOCATION' };
    }

    // 3. Identification (Session or Registration)
    let participantEmail: string;
    let participantFirstName: string;
    let participantLastName: string;
    let participantPhone: string | null = null;
    let isWalkIn = false;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (data.registrationData) {
      // HANDLE INLINE REGISTRATION
      const { email, firstName, lastName, phone } = data.registrationData;
      participantEmail = email;
      participantFirstName = firstName;
      participantLastName = lastName;
      participantPhone = phone;
      isWalkIn = true;

      // Optional: Update/Create user record for authentication persistence
      let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        await db.insert(users).values({
          email,
          firstName,
          lastName,
          phone,
          password: 'TEMPORARY_ACCESS',
          role: 'PARTICIPANT',
        });
      }

      // Create session so they don't have to register again
      const tokenString = await new SignJWT({ 
        email, 
        role: 'PARTICIPANT',
        name: `${firstName} ${lastName}`
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(encodedSecret);
      
      cookieStore.set('session', tokenString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

    } else if (sessionToken) {
      // LOGGED IN USER FLOW
      try {
        const { payload } = await jwtVerify(sessionToken, encodedSecret);
        const decoded = payload as { email: string, name?: string };
        participantEmail = decoded.email;
        
        // Fetch full details from users table to be safe
        const [user] = await db.select().from(users).where(eq(users.email, participantEmail)).limit(1);
        if (user) {
          participantFirstName = user.firstName || 'Student';
          participantLastName = user.lastName || '';
          participantPhone = user.phone;
        } else {
          participantFirstName = decoded.name?.split(' ')[0] || 'Student';
          participantLastName = decoded.name?.split(' ').slice(1).join(' ') || '';
        }
      } catch (e) {
        return { error: 'Invalid session. Please login again.' };
      }
    } else {
      // GUEST FLOW (Needs registration)
      // Generate a longer lived registration token (15 mins) to allow form completion
      const registrationToken = await new SignJWT({ 
        eventId: event.id, 
        type: 'registration_submit',
        timestamp: Date.now() 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(encodedSecret);

      return { 
        requiresRegistration: true, 
        registrationToken,
        eventId: event.id,
        eventTitle: event.title,
        message: 'Location verified! Please identify yourself to complete check-in.' 
      };
    }

    // 4. Resolve Participant Record
    let [participant] = await db.select().from(participants).where(
      and(
        eq(participants.eventId, event.id),
        eq(participants.email, participantEmail.toLowerCase().trim())
      )
    ).limit(1);

    const wasPreRegistered = !!participant;

    if (!participant) {
      // Create participant for this event (Walk-in / Extra)
      [participant] = await db.insert(participants).values({
        eventId: event.id,
        email: participantEmail.toLowerCase().trim(),
        name: participantFirstName,
        surname: participantLastName,
        phone: participantPhone,
        isRegistered: false, // Walk-ins aren't 'pre-registered'
      }).returning();
    }

    // 5. Record Attendance
    const [existing] = await db.select().from(attendance).where(
      and(
        eq(attendance.eventId, event.id),
        eq(attendance.participantId, participant.id)
      )
    ).limit(1);

    if (existing) {
      return { success: true, eventTitle: event.title, userName: `${participantFirstName} ${participantLastName}`, alreadyCheckedIn: true };
    }

    await db.insert(attendance).values({
      eventId: event.id,
      participantId: participant.id,
      latitude: data.latitude,
      longitude: data.longitude,
      status: wasPreRegistered ? 'VALID' : 'EXTRA',
    });

    return { success: true, eventTitle: event.title, userName: `${participantFirstName} ${participantLastName}`, status: wasPreRegistered ? 'VALID' : 'EXTRA' };

  } catch (err) {
    console.error('Check-in error detailed:', err);
    return { error: 'An unexpected error occurred during verification.' };
  }
}

/**
 * Marks pre-registered participants as ABSENT if they haven't checked in within 24 hours of the event start.
 */
export async function syncAbsencesAction(eventId: string) {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) return { error: 'Event not found' };

    // Check if 24 hours have passed since the event date
    const eventBegin = new Date(event.date);
    const twentyFourHoursAfter = new Date(eventBegin.getTime() + 24 * 60 * 60 * 1000);
    
    if (new Date() < twentyFourHoursAfter) {
      return { success: true, message: 'Too early to mark absences (24 hour rule).' };
    }

    // Find pre-registered participants who don't have an attendance record
    const subquery = db.select({ id: attendance.participantId }).from(attendance).where(eq(attendance.eventId, eventId));
    
    const targetParticipants = await db.select({
      id: participants.id
    })
    .from(participants)
    .where(
      and(
        eq(participants.eventId, eventId),
        eq(participants.isRegistered, true),
        // Use sql template to check for NOT IN subquery
        // sql`id NOT IN (${subquery})`
      )
    );

    // Filter out those who already have attendance (Drizzle doesn't support NOT IN easily with subqueries in all drivers, so we'll do a simple filter or join)
    // Actually, let's just fetch all participants and all attendances and diff them for safety.
    const allPreReg = await db.select().from(participants).where(and(eq(participants.eventId, eventId), eq(participants.isRegistered, true)));
    const allAttendance = await db.select().from(attendance).where(eq(attendance.eventId, eventId));
    const attendedIds = new Set(allAttendance.map(a => a.participantId));

    const absentParticipants = allPreReg.filter(p => !attendedIds.has(p.id));

    if (absentParticipants.length === 0) {
      return { success: true, message: 'No new absences found.' };
    }

    const absentRecords = absentParticipants.map(p => ({
      eventId,
      participantId: p.id,
      status: 'ABSENT' as const,
      timestamp: new Date(), // Marking them absent now
    }));

    // Use onConflictDoNothing in case they were already marked absent
    await db.insert(attendance).values(absentRecords).onConflictDoNothing();

    revalidatePath(`/admin/event/${eventId}/attendance`);
    return { success: true, count: absentRecords.length };
  } catch (err) {
    console.error('Sync absences error:', err);
    return { error: 'Failed to sync absences.' };
  }
}
