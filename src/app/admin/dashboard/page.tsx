import { db } from '@/db';
import { events } from '@/db/schema';
import { desc } from 'drizzle-orm';
import AdminDashboardContent from '@/components/AdminDashboardContent';

export default async function AdminDashboardPage() {
  const allEvents = await db.select().from(events).orderBy(desc(events.date));

  return <AdminDashboardContent initialEvents={allEvents} />;
}
