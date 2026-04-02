import { db } from '@/db';
import { events, attendance } from '@/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import AdminDashboardContent from '@/components/AdminDashboardContent';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const allEvents = await db.select({
    id: events.id,
    title: events.title,
    description: events.description,
    date: events.date,
    latitude: events.latitude,
    longitude: events.longitude,
    radius: events.radius,
    participantCount: sql<number>`count(${attendance.id})`.as('participantCount'),
  })
  .from(events)
  .leftJoin(attendance, eq(events.id, attendance.eventId))
  .groupBy(events.id)
  .orderBy(desc(events.date));

  return <AdminDashboardContent initialEvents={allEvents} />;
}
