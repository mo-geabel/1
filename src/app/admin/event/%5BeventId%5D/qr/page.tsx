'use client';

import { useEffect, useState, use, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQrToken } from '@/actions/qr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, RefreshCw, Clock, ArrowLeft, 
  ShieldCheck, UserCheck, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function EventQrPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Live Notifications State
  const [notification, setNotification] = useState<{ name: string } | null>(null);
  const lastIdRef = useRef<string | null>(null);

  const refreshToken = async () => {
    try {
      setLoading(true);
      const data = await generateQrToken(eventId);
      setToken(data.token);
      setTimeLeft(60);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Poll for live attendance
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/attendance/live?eventId=${eventId}`);
        const data = await res.json();
        
        if (data.latest) {
          if (lastIdRef.current && lastIdRef.current !== data.latest.id) {
            // New attendance detected!
            setNotification({ name: `${data.latest.userName} ${data.latest.userLastName}` });
            setTimeout(() => setNotification(null), 5000);
          }
          lastIdRef.current = data.latest.id;
        }
      } catch (e) {
        console.error('Polling failed:', e);
      }
    };

    const interval = setInterval(poll, 5000); // 5 second polling
    poll(); // Initial check
    
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    refreshToken();
  }, [eventId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !loading) {
      refreshToken();
    }
  }, [timeLeft, loading]);

  const scanUrl = token ? `${window.location.origin}/scan?token=${token}` : '';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Notifications Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-100 w-full max-w-sm px-4"
          >
            <div className="bg-blue-600 border border-blue-400 p-6 rounded-3xl shadow-2xl flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Attendee Joined</p>
                <p className="text-xl font-bold tracking-tight">{notification.name}</p>
              </div>
              <div className="ml-auto">
                <Sparkles className="w-6 h-6 text-orange-300 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 left-8 flex items-center gap-4">
        <Link 
          href="/admin/dashboard"
          className="p-3 rounded-2xl bg-card-bg/50 backdrop-blur-xl border border-border-color text-gray-400 hover:text-foreground transition-all flex items-center gap-2 group shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-card-bg/60 backdrop-blur-3xl border border-border-color rounded-4xl overflow-hidden p-10 lg:p-16 text-center shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
          
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-2 flex items-center justify-center gap-3">
              Event Live Hub
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </h1>
            <p className="text-gray-500 text-sm font-medium">Automatic attendance monitoring active.</p>
          </div>

          <div className="relative inline-block p-12 bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.05)] border-4 border-border-color transition-colors">
            <AnimatePresence mode="wait">
              {loading && !token ? (
                <div key="loader" className="w-[280px] h-[280px] flex items-center justify-center bg-gray-50 rounded-2xl">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              ) : (
                <motion.div
                  key={token}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <QRCodeSVG 
                    value={scanUrl} 
                    size={280} 
                    fgColor="#000"
                    bgColor="#fff"
                    includeMargin={false}
                    level="H"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 rounded-tl-3xl border-t-4 border-l-4 border-blue-600" />
            <div className="absolute top-4 right-4 w-8 h-8 rounded-tr-3xl border-t-4 border-r-4 border-blue-600" />
            <div className="absolute bottom-4 left-4 w-8 h-8 rounded-bl-3xl border-b-4 border-l-4 border-blue-600" />
            <div className="absolute bottom-4 right-4 w-8 h-8 rounded-br-3xl border-b-4 border-r-4 border-blue-600" />
          </div>

          <div className="mt-12 space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold tracking-widest text-lg shadow-sm">
              <Clock className="w-5 h-5" />
              00:{timeLeft.toString().padStart(2, '0')}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Secure rotation active
              </div>
              <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">Token refreshes automatically every minute. Real-time arrival notifications will appear at the top.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
