import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { users, events, attendance, participants } from './schema';
import { eq, desc, and } from 'drizzle-orm';

async function verifyDatabaseCheckin() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('--- Database Check-in Route Test ---');

  try {
    // 1. Fetch an Event
    const [event] = await db.select().from(events).orderBy(desc(events.date)).limit(1);
    if (!event) {
      console.error('❌ No events found. Run seed first.');
      return;
    }
    console.log(`📍 Testing for Event: "${event.title}" (${event.id})`);

    // 2. Generate a unique test participant
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`👤 Creating Test Participant: ${testEmail}`);

    const [testParticipant] = await db.insert(participants).values({
      eventId: event.id,
      email: testEmail,
      name: 'Checkin',
      surname: 'Test',
      phone: '+123456789',
      isRegistered: true,
    }).returning();

    console.log(`✅ Participant Created: ID = ${testParticipant.id}`);

    // 3. Attempt Attendance Insertion (The sensitive route)
    console.log(`📝 Recording Attendance...`);
    const [newAttendance] = await db.insert(attendance).values({
      eventId: event.id,
      participantId: testParticipant.id,
      latitude: event.latitude,
      longitude: event.longitude,
      status: 'VALID',
    }).returning();

    console.log(`✅ Attendance Recorded: ID = ${newAttendance.id}`);
    console.log(`🚀 RESULT: DATABASE ROUTE IS WORKING PERFECTLY!`);

    // Cleanup (optional)
    await db.delete(attendance).where(eq(attendance.id, newAttendance.id));
    await db.delete(participants).where(eq(participants.id, testParticipant.id));

  } catch (err: any) {
    console.error('❌ DATABASE ROUTE FAILED!');
    console.error(err);
  }

  console.log('\n--- Test Complete ---');
}

verifyDatabaseCheckin().catch(console.error);
