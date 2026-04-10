import { db } from '@/db';
import { events, attendance, participants } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { ArrowLeft, Download, Users, Calendar, MapPin, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import AttendanceList from '@/components/AttendanceList';
import ParticipantUpload from '@/components/ParticipantUpload';
import SyncAbsencesTrigger from '@/components/SyncAbsencesTrigger';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function AttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  // 1. Fetch Event Details
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="bg-card-bg/60 backdrop-blur-xl p-12 rounded-[3rem] border border-border-color shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
          <p className="text-gray-500 mb-8 max-w-sm">The event you are looking for does not exist or has been removed.</p>
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 bg-card-bg hover:bg-card-bg/80 px-8 py-3 rounded-2xl font-bold text-foreground transition-all border border-border-color shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Participants and their Attendance Records
  const records = await db.select({
    id: attendance.id,
    timestamp: attendance.timestamp,
    status: attendance.status,
    latitude: attendance.latitude,
    longitude: attendance.longitude,
    participant: {
      id: participants.id,
      name: participants.name,
      surname: participants.surname,
      email: participants.email,
      phone: participants.phone,
      isRegistered: participants.isRegistered
    }
  })
  .from(participants)
  .leftJoin(attendance, eq(participants.id, attendance.participantId))
  .where(eq(participants.eventId, eventId))
  .orderBy(desc(attendance.timestamp), desc(participants.createdAt));

  // Map the records to ensure local types are satisfied if needed, 
  // but since we are in a Server Component, we can just pass them.
  // The 'any' cast on the join result is often needed with complex inner joins in Drizzle 
  // if the select object doesn't perfectly match the inferred schema.

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Header Section */}
      <div className="bg-card-bg/50 backdrop-blur-3xl border-b border-border-color sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center py-8 gap-6">
            <div className="flex items-start gap-4">
              <Link 
                href="/admin/dashboard"
                className="p-3 bg-card-bg/50 border border-border-color hover:bg-card-bg rounded-2xl transition-all group shrink-0 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                  <span className="hover:text-blue-500">ADMIN</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                  <span className="hover:text-blue-500">EVENTS</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                  <span className="text-blue-500">ATTENDANCE</span>
                </nav>
                <h1 className="text-3xl font-extrabold tracking-tight">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-5 mt-3 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    {records.length} Attendees Recorded
                  </div>
                  <SyncAbsencesTrigger eventId={eventId} eventDate={event.date} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href={`/admin/event/${eventId}/qr`}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
              >
                Launch QR Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Bulk Upload Section */}
        <ParticipantUpload eventId={eventId} />

        {/* Attendance Listing Client Component */}
        <AttendanceList initialRecords={records} eventTitle={event.title} eventId={eventId} />
      </main>
    </div>
  );
}
