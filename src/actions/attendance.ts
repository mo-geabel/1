'use server';

import { db } from '@/db';
import { events, users, attendance } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import { getDistance } from 'geolib';
import { cookies } from 'next/headers';
import { getEncodedSecret, getJwtSecret } from '@/lib/auth';

const encodedSecret = getEncodedSecret();

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
      payload = result.payload as { eventId: string; timestamp: number };
    } catch (err) {
      return { error: 'Invalid or expired QR code. Please scan again.', status: 'EXPIRED_QR' };
    }

    const { eventId } = payload;
    
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
        return { 
          error: `Location verification failed. You are too far from the event (${distance}m away). Max radius is ${event.radius}m.`,
          status: 'INVALID_LOCATION',
          distance
        };
      }
    } else {
      return { error: 'GPS location is required for verification.', status: 'INVALID_LOCATION' };
    }

    // 3. Identification (Session or Registration)
    let userId: string;
    let userName: string;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (data.registrationData) {
      // HANDLE INLINE REGISTRATION
      const { email, firstName, lastName, phone, role = 'PARTICIPANT' } = data.registrationData;
      
      // Check if user already exists
      let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user) {
        // Create new user (PASSWORD IS MOCKED AS 'STUB' FOR SEAMLESS FLOW IF NOT PROVIDED)
        // In a real high-security app, we'd force a password, but for this 'seamless' requirement, 
        // we'll assume the student just needs their name and email verified for this session.
        const [newUser] = await db.insert(users).values({
          email,
          firstName,
          lastName,
          phone,
          password: 'TEMPORARY_ACCESS', // Real apps would require a password later
          role: role as any,
        }).returning();
        user = newUser;
      }

      userId = user.id;
      userName = `${user.firstName} ${user.lastName}`;

      // Create session for the new/found user
      const tokenString = await new SignJWT({ 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: userName
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
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
        const decoded = payload as { id: string, name?: string, role: string };
        userId = decoded.id;
        userName = decoded.name || 'Student';
      } catch (e) {
        return { error: 'Invalid session. Please login again.' };
      }
    } else {
      // GUEST FLOW (Needs registration)
      return { 
        requiresRegistration: true, 
        eventId: event.id,
        eventTitle: event.title,
        message: 'Location verified! Please identify yourself to complete check-in.' 
      };
    }

    // 4. Record Attendance
    const [existing] = await db.select().from(attendance).where(
      and(
        eq(attendance.eventId, event.id),
        eq(attendance.userId, userId)
      )
    ).limit(1);

    if (existing) {
      return { success: true, eventTitle: event.title, userName, alreadyCheckedIn: true };
    }

    await db.insert(attendance).values({
      eventId: event.id,
      userId,
      latitude: data.latitude,
      longitude: data.longitude,
      status: 'VALID',
    });

    return { success: true, eventTitle: event.title, userName };

  } catch (err) {
    console.error('Check-in error detailed:', err);
    return { error: 'An unexpected error occurred during verification.' };
  }
}
