'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Mail, Lock, User, 
  Smartphone, GraduationCap, ChevronRight, Sparkles,
  LockKeyhole, UserPlus, Fingerprint, Loader2, Info
} from 'lucide-react';
import { loginAction, registerAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export default function AuthTabContent({ eventId, onAuthSuccess }: { eventId?: string; onAuthSuccess?: (role: string) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    // For registration, we always default to PARTICIPANT from the action, 
    // for login, it is detected from the database.
    const action = mode === 'login' ? loginAction : registerAction;
    const result = await action(formData) as any;

    if (result.success) {
      if (mode === 'login') {
        if (onAuthSuccess) {
          onAuthSuccess(result.role);
        } else {
          // The action now returns the correct role-specific redirect
          const target = result.redirect || '/participant/dashboard';
          router.push(target);
        }
      } else {
        setMode('login');
        setError('Account created! Please sign in to access your portal.');
      }
    } else {
      setError(result.error || 'Authentication failed.');
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card-bg/60 backdrop-blur-3xl border border-border-color p-8 md:p-10 rounded-4xl shadow-2xl relative overflow-hidden group transition-colors">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-30" />

        <div className="text-center mb-10 pt-4">
          <motion.div
            layout
            className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-600/20"
          >
            {mode === 'login' ? <LockKeyhole className="w-10 h-10 text-blue-500" /> : <UserPlus className="w-10 h-10 text-blue-500" />}
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 flex items-center justify-center gap-3">
            {mode === 'login' ? 'Welcome Back' : 'Join the Event'}
          </h2>
          <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
            Access the attendance tracking portal with your university credentials.
          </p>
        </div>

        {eventId && mode === 'register' && (
          <div className="mb-8 p-5 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center gap-5 text-left shadow-sm">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest leading-relaxed">
              Scan Verified! <br/>
              Create account to log attendance.
            </p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">First Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        name="firstName"
                        required={mode === 'register'}
                        placeholder="John"
                        className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Last Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        name="lastName"
                        required={mode === 'register'}
                        placeholder="Doe"
                        className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      name="phone"
                      type="tel"
                      required={mode === 'register'}
                      placeholder="+90 XXX XXX XX XX"
                      className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                name="email"
                type="email"
                required
                placeholder="name@university.edu"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 text-[10px] uppercase font-black tracking-widest ${error.includes('created') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
            >
              <Fingerprint className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            disabled={loading}
            className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all relative group shadow-2xl shadow-blue-500/30 overflow-hidden active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Authenticate' : 'Complete Profile'}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-color text-center">
          <p className="text-gray-500 font-medium text-[10px] md:text-xs">
            {mode === 'login' ? (
              <>New user? <button onClick={() => setMode('register')} className="text-blue-500 font-black hover:underline uppercase tracking-widest ml-1">Create Account</button></>
            ) : (
              <>Already registered? <button onClick={() => setMode('login')} className="text-blue-500 font-black hover:underline uppercase tracking-widest ml-1">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
