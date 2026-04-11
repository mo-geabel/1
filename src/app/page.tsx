'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ShieldCheck, CheckCircle2, 
  Lock, LayoutDashboard, UserCheck,
  ArrowRight, ScanLine
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageContext';
import AuthTabContent from '@/components/AuthTabContent';

export default function HomeCommandCenter() {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      const hasSession = document.cookie.includes('session');
      setIsLoggedIn(hasSession);
      
      // In a real app we'd fetch role from a server action or local storage if cached
      // For now we rely on the component mount to trigger basic visibility
    };
    checkSession();
  }, []);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden flex flex-col">
      {/* Structured Background Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1a1a1e_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      {/* Header */}
      <header className="relative z-50 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg md:text-xl font-bold tracking-tight block leading-tight">{t('faculty_portal')}</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none">{t('portal_center')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
          {isLoggedIn && (
            <Link 
              href="/admin/dashboard" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-card-bg border border-border-color rounded-xl text-xs font-bold hover:bg-border-color transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('admin_panel')}
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-7xl mx-auto w-full pb-20">
        
        <div className="w-full max-w-md">
          <AuthTabContent onAuthSuccess={handleAuthSuccess} />
        </div>

      </main>

      {/* Persistent Footer */}
      <footer className="relative z-10 p-10 border-t border-border-color/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <span className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-4 h-4" />
                {t('ssl_secured')}
              </span>
              <span className="flex items-center gap-2 text-primary/80">
                <CheckCircle2 className="w-4 h-4" />
                {t('interface_v2')}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400">
              &copy; 2026 {t('faculty')}. {t('built_for')}
            </p>
        </div>
      </footer>
    </div>
  );
}
