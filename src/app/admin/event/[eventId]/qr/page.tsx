'use client';

import { useEffect, useState, use } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQrToken } from '@/actions/qr';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Clock, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function EventQrPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [qrSize, setQrSize] = useState(200);

  useEffect(() => {
    const handleResize = () => {
      setQrSize(window.innerWidth < 768 ? 180 : 220);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center bg-card-bg/50 backdrop-blur-3xl border border-border-color rounded-2xl p-1.5 shadow-xl transition-all z-50">
        <Link 
          href="/admin/dashboard"
          className="p-2.5 rounded-xl hover:bg-primary/5 text-gray-400 hover:text-primary transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">{t('dashboard')}</span>
        </Link>
        <div className="h-6 w-px bg-border-color mx-1.5" />
        <ThemeToggle minimal />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full"
      >
        <div className="bg-card-bg/60 backdrop-blur-3xl border border-border-color rounded-[2.5rem] overflow-hidden p-8 lg:p-12 text-center shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Live Attendance System</h1>
            <p className="text-gray-500 text-sm font-medium">Scan the QR code below to record your participation.</p>
          </div>

          <div className="relative inline-block p-8 md:p-10 bg-white rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.05)] border-4 border-border-color">
            <AnimatePresence mode="wait">
              {loading && !token ? (
                <div key="loader" className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] flex items-center justify-center bg-gray-50 rounded-2xl">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
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
                    size={qrSize} 
                    fgColor="#000"
                    bgColor="#fff"
                    includeMargin={false}
                    level="H"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Corner decorations for QR container */}
            <div className="absolute top-4 left-4 w-8 h-8 rounded-tl-3xl border-t-4 border-l-4 border-primary" />
            <div className="absolute top-4 right-4 w-8 h-8 rounded-tr-3xl border-t-4 border-r-4 border-primary" />
            <div className="absolute bottom-4 left-4 w-8 h-8 rounded-bl-3xl border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-4 right-4 w-8 h-8 rounded-br-3xl border-b-4 border-r-4 border-primary" />
          </div>

          <div className="mt-12 space-y-6">
            {/* Timer */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold tracking-widest text-lg shadow-sm">
              <Clock className="w-5 h-5" />
              00:{timeLeft.toString().padStart(2, '0')}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Dyanamic rotation active
              </div>
              <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">A secure, encrypted QR code is generated every 60 seconds. Late arrivals must scan current valid codes.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
