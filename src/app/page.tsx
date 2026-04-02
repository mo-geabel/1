'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, ShieldCheck, Sparkles, 
  Lock, LayoutDashboard, Fingerprint,
  ArrowRight, Info
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import AuthTabContent from '@/components/AuthTabContent';
import Scanner from '@/components/Scanner';

export default function HomeCommandCenter() {
  const [activeTab, setActiveTab] = useState<'auth' | 'scan'>('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      const hasSession = document.cookie.includes('session');
      setIsLoggedIn(hasSession);
      
      // In a real app we'd fetch role from a server action or local storage if cached
      // For now we rely on the component mount to trigger basic visibility
    };
    checkSession();
  }, [activeTab]);

  const handleAuthSuccess = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    
    if (role === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    } else {
      setActiveTab('scan');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden flex flex-col">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight block">Faculty Portal</span>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">Command Center</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn && (
            <div className="h-8 w-px bg-border-color hidden md:block" />
          )}
          {isLoggedIn && (
            <Link 
              href="/participant/dashboard" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-card-bg border border-border-color rounded-xl text-xs font-bold hover:bg-border-color transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              My Portal
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-7xl mx-auto w-full pb-20">
        
        {/* Tab Switcher */}
        <div className="w-full max-w-md mb-12">
          <div className="flex p-2 bg-card-bg/40 backdrop-blur-3xl border border-border-color rounded-4xl shadow-xl relative">
            <motion.div 
              className="absolute inset-2 bg-blue-600 rounded-3xl shadow-lg shadow-blue-600/20"
              initial={false}
              animate={{ x: activeTab === 'auth' ? 0 : '100.5%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: 'calc(50% - 8px)' }}
            />
            
            <button
              onClick={() => setActiveTab('auth')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest relative z-10 transition-colors duration-300 ${activeTab === 'auth' ? 'text-white' : 'text-gray-500 hover:text-foreground'}`}
            >
              <Fingerprint className="w-5 h-5" />
              Access Portal
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest relative z-10 transition-colors duration-300 ${activeTab === 'scan' ? 'text-white' : 'text-gray-500 hover:text-foreground'}`}
            >
              <QrCode className="w-5 h-5" />
              QR Check-in
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="w-full transition-all duration-500">
          <AnimatePresence mode="wait">
            {activeTab === 'auth' ? (
              <motion.div
                key="auth-tab"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AuthTabContent onAuthSuccess={handleAuthSuccess} />
              </motion.div>
            ) : (
              <motion.div
                key="scan-tab"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
              >
                <Scanner />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Persistent Footer */}
      <footer className="relative z-10 p-10 border-t border-border-color/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
             <span className="flex items-center gap-2 text-blue-500">
               <ShieldCheck className="w-4 h-4" />
               SSL Secured
             </span>
             <span className="flex items-center gap-2 text-indigo-500">
               <Sparkles className="w-4 h-4" />
               v2.0 Interface
             </span>
           </div>
           <p className="text-[10px] font-bold text-gray-400">
             &copy; 2026 Faculty of Medicine. Built for Advanced Clinical Attendance.
           </p>
        </div>
      </footer>
    </div>
  );
}
