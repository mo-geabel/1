'use client';

import { useLanguage } from './LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'tr' : 'en')}
      className="relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-card-bg/50 backdrop-blur-xl border border-border-color hover:border-primary/50 transition-all group overflow-hidden"
      aria-label="Toggle Language"
    >
      <Globe className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-widest min-w-[20px] text-center">
        {locale}
      </span>
      
      {/* Subtle hover sparkle */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
    </button>
  );
}
