'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Type, 
   Loader2, Save, Map as MapIcon, Globe, Map as MapLayers,
  Pin, Navigation, ShieldCheck, Building2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/components/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

// Dynamic import for Leaflet (client-side only)
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-card-bg/50 border border-border-color rounded-3xl flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <Building2 className="w-10 h-10 text-primary opacity-20" />
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Initialising Secure Map...</span>
      </div>
    </div>
  )
});

interface EventFormProps {
  initialData?: {
    title: string;
    description: string | null;
    date: Date;
    latitude: number;
    longitude: number;
    radius: number;
  };
  onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  title: string;
  subtitle: string;
}

export default function EventForm({ initialData, onSubmit, title, subtitle }: EventFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<'map' | 'manual'>('map');
  
  // Initialize coords from initialData or fallback to Istanbul
  const [coords, setCoords] = useState({ 
    lat: initialData?.latitude ?? 41.0082, 
    lng: initialData?.longitude ?? 28.9784 
  });
  
  const [radius, setRadius] = useState(initialData?.radius ?? 200);

  // Helper for datetime-local input string format
  const formatDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    formData.append('latitude', coords.lat.toString());
    formData.append('longitude', coords.lng.toString());

    const result = await onSubmit(formData);
    if (result.success) {
      router.refresh(); // Force refresh to clear any stale cache
      router.push('/admin/dashboard');
    } else {
      setError(result.error || 'Operation failed.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="bg-card-bg/50 backdrop-blur-3xl border-b border-border-color sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6">
              <Link 
                href="/admin/dashboard"
                className="p-2 md:p-3 bg-card-bg border border-border-color rounded-xl hover:bg-card-bg/80 transition-all group shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <h1 className="text-base md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 md:gap-3">
                  {title}
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </h1>
                <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5 md:mt-1">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-4">
              <ThemeToggle />
              <button 
                form="event-form"
                disabled={loading}
                className="bg-primary hover:bg-primary-hover px-3.5 md:px-8 py-2 md:py-3.5 rounded-xl font-bold text-white transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2 md:gap-3 disabled:opacity-50 text-[11px] md:text-base"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                <span className="hidden sm:inline">{t('save_details')}</span>
                <span className="sm:hidden">{t('save')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 md:py-12">
        <form id="event-form" action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-12">
          
          <div className="lg:col-span-4 space-y-4 md:space-y-10">
            <div className="space-y-4 md:space-y-8 p-4 md:p-10 bg-card-bg/40 border border-border-color rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Type className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{t('session_basics')}</h3>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('session_title')}</label>
                <input
                  name="title"
                  required
                  defaultValue={initialData?.title}
                  placeholder="e.g. Corporate Meeting"
                  className="w-full px-4 md:px-6 py-2.5 md:py-4 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-[13px] md:text-sm"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('description')} ({t('optional')})</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={initialData?.description || ''}
                  placeholder="Details about the session..."
                  className="w-full px-4 md:px-6 py-2.5 md:py-4 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-medium text-[13px] md:text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('date_time')}</label>
                <div className="relative group">
                  <Calendar className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    name="date"
                    type="datetime-local"
                    required
                    defaultValue={initialData ? formatDateTime(initialData.date) : ''}
                    className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-2.5 md:py-4 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-[13px] md:text-sm scheme-light dark:scheme-dark"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('verification_radius')}</label>
                <div className="relative group">
                  <Navigation className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    name="radius"
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
                    className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-2.5 md:py-4 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-[13px] md:text-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-4 md:space-y-10">
            <div className="p-4 md:p-10 bg-card-bg/40 border border-border-color rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2.5 md:p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <MapLayers className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">{t('venue_verification')}</h3>
                    <p className="text-gray-500 text-xs md:text-sm font-medium">{t('venue_desc')}</p>
                  </div>
                </div>

                <div className="flex p-1.5 bg-background/80 rounded-xl border border-border-color shadow-inner w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setLocationMode('map')}
                    className={`flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${locationMode === 'map' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-foreground'}`}
                  >
                    <Globe className="w-3.5 h-3.5 md:w-4 h-4" />
                    {t('interactive_map')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('manual')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-0.5 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${locationMode === 'manual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-foreground'}`}
                  >
                    <Pin className="w-3.5 h-3.5 md:w-4 h-4" />
                    {t('manual_coords')}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {locationMode === 'map' ? (
                  <motion.div
                    key="map-picker"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-4"
                  >
                    <LocationPicker 
                      lat={coords.lat} 
                      lng={coords.lng} 
                      onChange={(lat, lng) => setCoords({ lat, lng })} 
                    />
                    <div className="grid grid-cols-2 gap-3 md:gap-6 pt-3 md:pt-4">
                      <div className="p-3 md:p-4 bg-background border border-border-color rounded-xl flex flex-col gap-0.5 md:gap-1 shadow-sm">
                        <span className="text-[7px] md:text-[8px] font-bold text-primary tracking-[0.2em] uppercase">{t('latitude')}</span>
                        <span className="text-sm md:text-lg font-bold tracking-tighter">{coords.lat.toFixed(6)}</span>
                      </div>
                      <div className="p-3 md:p-4 bg-background border border-border-color rounded-xl flex flex-col gap-0.5 md:gap-1 shadow-sm">
                        <span className="text-[7px] md:text-[8px] font-bold text-primary tracking-[0.2em] uppercase">{t('longitude')}</span>
                        <span className="text-sm md:text-lg font-bold tracking-tighter">{coords.lng.toFixed(6)}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual-entry"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 py-6 md:py-10"
                  >
                    <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('latitude')}</label>
                       <input
                         type="number"
                         step="any"
                         value={coords.lat}
                         onChange={(e) => setCoords({...coords, lat: parseFloat(e.target.value) || 0})}
                         className="w-full px-4 md:px-6 py-3.5 md:py-5 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-lg md:text-2xl tracking-tighter shadow-sm"
                       />
                     </div>
                     <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('longitude')}</label>
                       <input
                         type="number"
                         step="any"
                         value={coords.lng}
                         onChange={(e) => setCoords({...coords, lng: parseFloat(e.target.value) || 0})}
                         className="w-full px-4 md:px-6 py-3.5 md:py-5 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-lg md:text-2xl tracking-tighter shadow-sm"
                       />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-start gap-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <MapIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-[0.2em]">
                  {t('venue_verification_enforced').replace('{radius}', radius.toString())}
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
