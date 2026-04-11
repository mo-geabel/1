'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, ChevronRight, 
  LockKeyhole, Loader2, UserCheck, 
  Building2, ShieldCheck, Check
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { loginAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export default function AuthTabContent({ onAuthSuccess }: { eventId?: string; onAuthSuccess?: (role: string) => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await loginAction(formData) as any;

    if (result.success) {
      if (onAuthSuccess) {
        onAuthSuccess(result.role);
      } else {
        router.push(result.redirect || '/admin/dashboard');
      }
    } else {
      setError(result.error === 'Invalid email or password.' ? t('invalid_credentials') : (result.error || t('auth_failed')));
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card-bg/60 backdrop-blur-3xl border border-border-color p-8 md:p-10 rounded-4xl shadow-2xl relative overflow-hidden group transition-colors">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-30" />

        <div className="text-center mb-10 pt-4">
          <motion.div
            layout
            className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20"
          >
            <LockKeyhole className="w-10 h-10 text-primary" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            {t('admin_portal')}
          </h2>
          <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
            {t('authorized_access_only')}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('email_address')}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                name="email"
                type="email"
                required
                placeholder="admin@safespeech.com.tr"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('password')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest bg-red-500/10 text-red-500 border border-red-500/20"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all relative group shadow-2xl shadow-primary/30 overflow-hidden active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  {t('authenticate_admin')}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
