import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function inspectTable() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('--- List of all tables ---');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.table(tables);

    console.log('--- Inspecting users table ---');
    const userColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    console.table(userColumns);

    console.log('--- Inspecting participants table ---');
    const participantColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'participants'
    `;
    console.table(participantColumns);

    console.log('--- Inspecting attendance table ---');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'attendance'
    `;
    console.log('Columns in "attendance":');
    console.table(columns);

    const enumValues = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname = 'attendance_status'
    `;
    console.log('Values in "attendance_status" enum:');
    console.table(enumValues);

  } catch (err: any) {
    console.error('❌ Inspection failed:', err.message);
  }
}

inspectTable();
