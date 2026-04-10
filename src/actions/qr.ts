'use server';

import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';

import { getEncodedSecret } from '@/lib/auth';

export async function generateQrToken(eventId: string) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  
  if (!event) {
    throw new Error('Event not found');
  }

  // Token is valid for 2 minutes
  const expires = new Date(Date.now() + 2 * 60 * 1000);
  
  const token = await new SignJWT({ 
    eventId: event.id, 
    type: 'attendance_scan',
    timestamp: Date.now() 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2m')
    .sign(getEncodedSecret());

  return { token, expires: expires.toISOString() };
}
