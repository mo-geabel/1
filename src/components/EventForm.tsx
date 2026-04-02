'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Type, AlignLeft, 
  Target, Loader2, Save, Map as MapIcon, Globe, Map as MapLayers, 
  Pin, Navigation, Sparkles, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ThemeToggle } from '@/components/ThemeToggle';

// Dynamic import for Leaflet (client-side only)
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-card-bg/50 border border-border-color rounded-2xl flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <Target className="w-10 h-10 text-blue-500 opacity-20" />
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Map Module...</span>
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
      <div className="bg-card-bg/50 backdrop-blur-3xl border-b border-border-color sticky top-0 z-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href="/admin/dashboard"
                className="p-3 bg-card-bg border border-border-color rounded-2xl hover:bg-card-bg/80 transition-all group shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                  {title}
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-none mt-1">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button 
                form="event-form"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form id="event-form" action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-8 p-10 bg-card-bg/40 border border-border-color rounded-[3rem] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                  <Type className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Session Basics</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Session Title</label>
                <input
                  name="title"
                  required
                  defaultValue={initialData?.title}
                  placeholder="e.g. Surgery Clinical Rounds"
                  className="w-full px-6 py-4 bg-background border border-border-color rounded-[1.25rem] text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Description (Optional)</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={initialData?.description || ''}
                  placeholder="Details about the session..."
                  className="w-full px-6 py-4 bg-background border border-border-color rounded-[1.25rem] text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-medium text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date & Time</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="date"
                    type="datetime-local"
                    required
                    defaultValue={initialData ? formatDateTime(initialData.date) : ''}
                    className="w-full pl-12 pr-6 py-4 bg-background border border-border-color rounded-[1.25rem] text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm scheme-light dark:scheme-dark"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Verification Radius (m)</label>
                <div className="relative group">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="radius"
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
                    className="w-full pl-12 pr-6 py-4 bg-background border border-border-color rounded-[1.25rem] text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-6 rounded-4xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="p-10 bg-card-bg/40 border border-border-color rounded-[3rem] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                    <MapLayers className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Location Verified Check-in</h3>
                    <p className="text-gray-500 text-sm font-medium">Define where the student must be to record attendance.</p>
                  </div>
                </div>

                <div className="flex p-2 bg-background/80 rounded-2xl border border-border-color shadow-inner">
                  <button
                    type="button"
                    onClick={() => setLocationMode('map')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${locationMode === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-foreground'}`}
                  >
                    <Globe className="w-4 h-4" />
                    Interactive Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('manual')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${locationMode === 'manual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-foreground'}`}
                  >
                    <Pin className="w-4 h-4" />
                    Manual Coords
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
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="p-4 bg-background border border-border-color rounded-2xl flex flex-col gap-1 shadow-sm">
                        <span className="text-[8px] font-black text-blue-500 tracking-[0.2em] uppercase">Latitude</span>
                        <span className="text-lg font-black tracking-tighter">{coords.lat.toFixed(6)}</span>
                      </div>
                      <div className="p-4 bg-background border border-border-color rounded-2xl flex flex-col gap-1 shadow-sm">
                        <span className="text-[8px] font-black text-blue-500 tracking-[0.2em] uppercase">Longitude</span>
                        <span className="text-lg font-black tracking-tighter">{coords.lng.toFixed(6)}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual-entry"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10"
                  >
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Latitude</label>
                       <input
                         type="number"
                         step="any"
                         value={coords.lat}
                         onChange={(e) => setCoords({...coords, lat: parseFloat(e.target.value) || 0})}
                         className="w-full px-6 py-5 bg-background border border-border-color rounded-[1.25rem] text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-black text-2xl tracking-tighter shadow-sm"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Longitude</label>
                       <input
                         type="number"
                         step="any"
                         value={coords.lng}
                         onChange={(e) => setCoords({...coords, lng: parseFloat(e.target.value) || 0})}
                         className="w-full px-6 py-5 bg-background border border-border-color rounded-[1.25rem] text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-black text-2xl tracking-tighter shadow-sm"
                       />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-start gap-4 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <MapIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-wider">
                  Precise location verification is active. Students must be within {radius} meters of the selected point to successfully record their attendance.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
