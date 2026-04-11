'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, LogOut, Plus, 
  Trash2, QrCode, BarChart, Users,
  Building2, Calendar, MapPin, ExternalLink, Edit
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/actions/auth';
import { deleteEventAction } from '@/actions/event';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageContext';

export default function AdminDashboardContent({ initialEvents }: { initialEvents: any[] }) {
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
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
          <div className="flex justify-between h-16 md:h-20 items-center">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <span className="text-base md:text-xl font-bold tracking-tight">{t('admin_panel')}</span>
                <p className="text-[9px] md:text-[10px] text-primary font-bold uppercase tracking-[0.2em] leading-none mt-1">{t('faculty')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-5">
              <LanguageToggle />
              <ThemeToggle />
              <div className="h-6 md:h-8 w-px bg-border-color mx-1 md:mx-2 hidden sm:block" />
              <form action={logoutAction}>
                <button className="p-2 md:p-2.5 rounded-xl bg-card-bg border border-border-color hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all group shadow-sm active:scale-95">
                  <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-8 md:mb-16">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              {t('events_sessions')}
            </h2>
            <p className="text-gray-500 mt-2 md:mt-3 text-sm md:text-lg font-medium max-w-lg">{t('manage_sessions_desc')}</p>
          </div>
          <Link 
            href="/admin/event/new"
            className="flex items-center gap-2 md:gap-3 bg-primary hover:bg-primary/90 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-white transition-all shadow-xl shadow-primary/20 active:scale-[0.98] group text-sm md:text-base w-fit"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
            {t('create_new_event')}
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {initialEvents.map((event) => (
            <div key={event.id} className="group bg-card-bg border border-border-color rounded-3xl overflow-hidden hover:border-primary/40 transition-all hover:translate-y-[-6px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] shadow-sm">
              <div className="p-6 md:p-10">
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className="p-3 md:p-4 bg-primary/10 rounded-2xl border border-primary/10 shadow-inner">
                    <Calendar className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/event/${event.id}/edit`}
                      className="p-2 rounded-xl bg-card-bg border border-border-color text-gray-400 hover:text-primary transition-all hover:bg-primary/10"
                      title="Edit Session"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={async () => {
                        if (confirm(t('confirm_delete'))) {
                          await deleteEventAction(event.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-card-bg border border-border-color text-gray-400 hover:text-red-500 transition-all hover:bg-red-500/10"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors leading-tight">{event.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm line-clamp-2 mb-6 md:mb-8 leading-relaxed font-medium">{event.description}</p>
                
                <div className="space-y-3 md:space-y-4 pt-6 md:pt-8 border-t border-border-color">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 font-bold tracking-tight">
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      <span className="truncate">{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs">
                      <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      {event.participantCount || 0}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex border-t border-border-color bg-card-bg/50">
                <Link 
                  href={`/admin/event/${event.id}/qr`}
                  className="flex-1 flex items-center justify-center gap-2 md:gap-3 py-4 md:py-6 text-xs md:text-sm font-bold hover:bg-primary hover:text-white transition-all border-r border-border-color uppercase tracking-widest group/btn"
                >
                  <QrCode className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform" />
                  {t('live_qr')}
                </Link>
                <Link 
                  href={`/admin/event/${event.id}/attendance`}
                  className="flex-1 flex items-center justify-center gap-2 md:gap-3 py-4 md:py-6 text-xs md:text-sm font-bold hover:bg-foreground hover:text-background transition-all uppercase tracking-widest group/btn"
                >
                  <Users className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform" />
                  {t('statistics')}
                  <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-50" />
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
            <h2 className="text-2xl font-bold text-foreground">{t('no_sessions')}</h2>
            <p className="text-gray-500 mt-3 max-w-sm font-medium leading-relaxed">{t('manage_sessions_desc')}</p>
            <Link 
              href="/admin/event/new"
              className="mt-10 px-8 py-3.5 bg-background border border-border-color rounded-2xl font-bold text-foreground hover:bg-card-bg transition-all shadow-sm active:scale-[0.98]"
            >
              {t('start_first_session')}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
