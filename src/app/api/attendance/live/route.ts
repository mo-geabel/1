import { db } from '@/db';
import { attendance, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
  }

  try {
    const [latest] = await db.select({
      id: attendance.id,
      timestamp: attendance.timestamp,
      userName: users.firstName,
      userLastName: users.lastName,
    })
    .from(attendance)
    .leftJoin(users, eq(attendance.userId, users.id))
    .where(eq(attendance.eventId, eventId))
    .orderBy(desc(attendance.timestamp))
    .limit(1);

    return NextResponse.json({ latest: latest || null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
