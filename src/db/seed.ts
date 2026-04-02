import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { users, events, attendance } from './schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('Seeding database...');

  // Clear existing data
  await db.delete(attendance);
  await db.delete(events);
  await db.delete(users);

  // 1. Create Admin
  const [admin] = await db.insert(users).values({
    email: 'admin@faculty.edu',
    password: 'password123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'ADMIN',
  }).returning();

  // 2. Create an Example Event
  const [event] = await db.insert(events).values({
    title: 'Advanced Medical Research Symposium',
    description: 'A prestigious gathering of medical professionals to discuss the future of clinical attendance systems.',
    date: new Date('2026-05-20T09:00:00Z'),
    latitude: 41.1054,
    longitude: 29.0236,
    radius: 500,
    qrSecret: 'faculty-secret-2026-symposium',
  }).returning();

  // 3. Pre-create some participants
  await db.insert(users).values([
    { email: 'student1@university.edu', firstName: 'Ahmet', lastName: 'Yılmaz', password: 'password123', role: 'PARTICIPANT' },
    { email: 'student2@university.edu', firstName: 'Ayşe', lastName: 'Demir', password: 'password123', role: 'PARTICIPANT' },
    { email: 'student3@university.edu', firstName: 'Mehmet', lastName: 'Kaya', password: 'password123', role: 'PARTICIPANT' },
  ]);

  console.log('Seed data created successfully!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
