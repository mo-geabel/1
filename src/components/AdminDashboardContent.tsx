'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, QrCode, ExternalLink, LogOut, Edit, Trash2, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import { deleteEventAction } from '@/actions/event';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminDashboardContent({ initialEvents }: { initialEvents: any[] }) {
  const router = useRouter();

  useEffect(() => {
    // Refresh the router cache every 30 seconds to show "newly registered" participants
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="border-b border-border-color bg-card-bg/50 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">Admin Dashboard</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-none mt-1 text-center md:text-left">Faculty of Medicine</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full animate-pulse shadow-sm">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Live Feed Active</span>
              </div>
              <ThemeToggle />
              <div className="h-8 w-px bg-border-color mx-2 hidden sm:block" />
              <form action={logoutAction}>
                <button className="p-2.5 rounded-2xl bg-card-bg border border-border-color hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all group shadow-sm active:scale-95">
                  <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">Events & Sessions</h2>
            <p className="text-gray-500 mt-3 text-lg font-medium max-w-lg">Create and manage your sessions, generate live QR codes, and export attendance statistics.</p>
          </div>
          <Link 
            href="/admin/event/new"
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-3xl font-bold text-white transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            Create New Event
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialEvents.map((event) => (
            <div key={event.id} className="group bg-card-bg border border-border-color rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all hover:translate-y-[-6px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] shadow-sm">
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10 shadow-inner">
                    <Calendar className="w-7 h-7 text-blue-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/event/${event.id}/edit`}
                      className="p-2 rounded-xl bg-card-bg border border-border-color text-gray-400 hover:text-blue-500 transition-all hover:bg-blue-500/10"
                      title="Edit Session"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete "${event.title}"? This will permanently remove all attendance records for this event.`)) {
                          await deleteEventAction(event.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-card-bg border border-border-color text-gray-400 hover:text-red-500 transition-all hover:bg-red-500/10"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">Active Session</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-500 transition-colors leading-tight">{event.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">{event.description}</p>
                
                <div className="space-y-4 pt-8 border-t border-border-color">
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-bold tracking-tight">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="truncate">{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-bold tracking-tight">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>{event.participantCount} Attendees Recorded</span>
                  </div>
                </div>
              </div>
              
              <div className="flex border-t border-border-color bg-card-bg/50">
                <Link 
                  href={`/admin/event/${event.id}/qr`}
                  className="flex-1 flex items-center justify-center gap-3 py-6 text-sm font-bold hover:bg-blue-600 hover:text-white transition-all border-r border-border-color uppercase tracking-widest group/btn"
                >
                  <QrCode className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  Live QR
                </Link>
                <Link 
                  href={`/admin/event/${event.id}/attendance`}
                  className="flex-1 flex items-center justify-center gap-3 py-6 text-sm font-bold hover:bg-foreground hover:text-background transition-all uppercase tracking-widest group/btn"
                >
                  <Users className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  Statistics
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {initialEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 bg-card-bg/20 rounded-[3rem] border-2 border-dashed border-border-color text-center shadow-inner">
            <div className="w-20 h-20 bg-card-bg rounded-3xl flex items-center justify-center mb-6 text-gray-300 border border-border-color shadow-sm">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">No sessions scheduled</h3>
            <p className="text-gray-500 mt-3 max-w-sm font-medium leading-relaxed">Create your first event session to start recording real-time attendance with dynamic QR codes.</p>
            <Link 
              href="/admin/event/new"
              className="mt-10 px-8 py-3.5 bg-background border border-border-color rounded-2xl font-bold text-foreground hover:bg-card-bg transition-all shadow-sm active:scale-[0.98]"
            >
              Start First Session
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
