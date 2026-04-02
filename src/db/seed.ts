import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { admins, events, participants } from './schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('Seeding database...');

  // Clear existing data
  await db.delete(schema.attendance);
  await db.delete(schema.participants);
  await db.delete(schema.events);
  await db.delete(schema.admins);

  // Create Admin
  const [admin] = await db.insert(admins).values({
    email: 'admin@faculty.edu',
    password: 'password123',
  }).returning();

  // Create an Example Event
  const [event] = await db.insert(events).values({
    title: 'Summer Medical Conference 2024',
    description: 'Annual medical research conference for faculty members and students.',
    date: new Date('2024-07-15T09:00:00Z'),
    latitude: 41.1054,
    longitude: 29.0236,
    radius: 200,
    qrSecret: 'super-secret-rotation-key',
  }).returning();

  // Pre-registered participants
  await db.insert(participants).values([
    { name: 'Ahmet', surname: 'Yılmaz', email: 'ahmet@example.com', isRegistered: true, eventId: event.id },
    { name: 'Ayşe', surname: 'Demir', email: 'ayse@example.com', isRegistered: true, eventId: event.id },
    { name: 'Mehmet', surname: 'Kaya', email: 'mehmet@example.com', isRegistered: true, eventId: event.id },
  ]);

  console.log('Seed data created successfully!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
