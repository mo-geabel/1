import { db } from '@/db';
import { attendance, events, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { decode } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { 
  Calendar, MapPin, CheckCircle2, Clock, 
  User, Smartphone, Mail, LayoutDashboard, LogOut,
  Sparkles, ShieldCheck, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return decode(token) as { id: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

export default async function ParticipantDashboard() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== 'PARTICIPANT') {
    redirect('/auth');
  }

  // Fetch full user details and their attendance history
  const [userData] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
  const attendances = await db.select({
    id: attendance.id,
    timestamp: attendance.timestamp,
    status: attendance.status,
    eventTitle: events.title,
    eventDate: events.date,
  })
  .from(attendance)
  .leftJoin(events, eq(attendance.eventId, events.id))
  .where(eq(attendance.userId, sessionUser.id))
  .orderBy(desc(attendance.timestamp));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-border-color bg-card-bg/50 backdrop-blur-3xl sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight block">Student Portal</span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">Attendance History</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <div className="h-8 w-px bg-border-color" />
              <form action={logoutAction}>
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold text-sm transition-colors group">
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar / Profile Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-card-bg/60 backdrop-blur-3xl border border-border-color p-8 rounded-4xl shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] group-hover:bg-blue-500/10 transition-all" />
              
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-600/20">
                  <User className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">{userData.firstName} {userData.lastName}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mt-3">
                  Verified Student
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group/item">
                  <div className="p-3 bg-card-bg border border-border-color rounded-2xl group-hover/item:text-blue-500 transition-colors shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold truncate">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="p-3 bg-card-bg border border-border-color rounded-2xl group-hover/item:text-blue-500 transition-colors shadow-sm">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-bold">{userData.phone || 'Not Provided'}</p>
                  </div>
                </div>
              </div>

              <Link 
                href="/"
                className="mt-12 w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                Join New Session
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card-bg/40 border border-border-color p-8 rounded-4xl text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Verified</p>
                <p className="text-4xl font-black text-blue-500 tracking-tighter">{attendances.length}</p>
              </div>
              <div className="bg-card-bg/40 border border-border-color p-8 rounded-4xl text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Rank</p>
                <p className="text-4xl font-black text-foreground tracking-tighter shrink-0">#1</p>
              </div>
            </div>
          </div>

          {/* Attendance History List */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                Attendance Timeline
                <Clock className="w-5 h-5 text-gray-400" />
              </h3>
            </div>

            <div className="space-y-4">
              {attendances.length === 0 ? (
                <div className="p-16 bg-card-bg/40 border border-dashed border-border-color rounded-4xl text-center">
                  <div className="w-20 h-20 bg-gray-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">No Verified Presence Yet</h4>
                  <p className="text-gray-500 max-w-xs mx-auto font-medium text-sm">Once you scan a live event QR code, your attendance records will appear here.</p>
                </div>
              ) : (
                attendances.map((item) => (
                  <div 
                    key={item.id}
                    className="p-6 bg-card-bg/60 backdrop-blur-3xl border border-border-color rounded-4xl hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm group"
                  >
                    <div className="flex items-start gap-5">
                      <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black mb-1">{item.eventTitle}</h4>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border-color">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Status</p>
                        <div className="text-green-500 font-black text-sm flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" />
                           VERIFIED
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
