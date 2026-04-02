import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  console.log('Dropping old Prisma tables...');
  await sql`DROP TABLE IF EXISTS "Attendance" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Participant" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Event" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Admin" CASCADE`;
  await sql`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE`;
  console.log('Tables dropped successfully!');
}

main().catch(console.error);
