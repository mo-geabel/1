import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { events, users, attendance } from './schema';
import { eq, desc } from 'drizzle-orm';
import { jwtVerify, SignJWT } from 'jose';
import { getDistance } from 'geolib';

const JWT_SECRET = process.env.JWT_SECRET || 'hickimseonubilmez';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function diagnose() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('--- Attendance Logic Diagnostics ---');

  // 1. Fetch Latest Event
  const [event] = await db.select().from(events).orderBy(desc(events.date)).limit(1);
  if (!event) {
    console.error('❌ No events found in database. Please run seed first.');
    return;
  }

  console.log(`📍 Event: "${event.title}"`);
  console.log(`📍 Location: ${event.latitude}, ${event.longitude} (Radius: ${event.radius}m)`);

  // 2. Generate Token (Simulating qr.ts)
  const token = await new SignJWT({ 
    eventId: event.id, 
    timestamp: Date.now() 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('70s')
    .sign(encodedSecret);
  
  console.log('✅ Token Generated Successfully');

  // 3. Test Cases
  const testCases = [
    { name: 'Perfect Match (Same Coords)', lat: event.latitude, lng: event.longitude },
    { name: 'Slight Offset (100m away)', lat: event.latitude + 0.0009, lng: event.longitude },
    { name: 'Far Away (Istanbul to London)', lat: 51.5074, lng: -0.1278 },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting Case: ${tc.name}`);
    
    // Proximity logic (Simulating attendance.ts)
    const distance = getDistance(
      { latitude: tc.lat, longitude: tc.lng },
      { latitude: event.latitude, longitude: event.longitude }
    );
    
    console.log(`   📏 Calculated Distance: ${distance}m`);
    
    if (distance > event.radius) {
      console.log(`   ❌ DENIED: Too far by ${distance - event.radius}m`);
    } else {
      console.log(`   ✅ GRANTED: Within radius`);
    }

    // JWT Verification logic (Simulating attendance.ts)
    try {
      const { payload } = await jwtVerify(token, encodedSecret);
      console.log(`   ✅ JWT: Valid (EventID Match: ${payload.eventId === event.id})`);
    } catch (err: any) {
      console.log(`   ❌ JWT: Invalid or Expired (${err.message})`);
    }
  }

  console.log('\n--- Diagnostics Complete ---');
}

diagnose().catch(console.error);
