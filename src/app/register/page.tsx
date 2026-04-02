'use client';

import { useState, Suspense } from 'react';
import { checkInAction } from '@/actions/attendance';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ChevronRight, Loader2, ArrowLeft, ShieldCheck, HeartPulse } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Missing QR token. Please scan again.');
      setLoading(false);
      return;
    }

    const result = await checkInAction({
      token: token,
      latitude: lat,
      longitude: lng,
      registrationData: {
        firstName: formData.get('name') as string,
        lastName: formData.get('surname') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
      }
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Registration failed.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-green-500/10 border border-green-500/20 rounded-[3rem] max-w-md shadow-2xl relative"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 ring-8 ring-green-500/10 animate-pulse">
            <HeartPulse className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">Registration Confirmed!</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">Thank you for registering. Your attendance has been successfully recorded for this event.</p>
          <button 
            onClick={() => router.push('/scan')}
            className="w-full bg-card-bg hover:bg-card-bg/80 py-4 rounded-2xl font-bold text-foreground border border-border-color transition-all shadow-xl active:scale-[0.98]"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 py-12 items-center relative overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-card-bg/50 backdrop-blur-xl border border-border-color text-gray-500 hover:text-foreground transition-all flex items-center gap-2 group shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <ThemeToggle />
        </div>

        <div className="bg-card-bg/60 backdrop-blur-3xl border border-border-color p-10 rounded-[3rem] shadow-2xl relative group">
          {/* Header */}
          <div className="mb-10 text-left">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-105 transition-transform duration-500 shadow-inner">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">Participant Registration</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-[280px]">Please provide your details to verify your attendance at this event.</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Name</label>
                <div className="relative">
                  <input
                    name="name"
                    placeholder="Enter your name"
                    required
                    className="w-full pl-4 pr-4 py-4 bg-background border border-border-color rounded-2xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm font-medium shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Surname</label>
                <div className="relative">
                  <input
                    name="surname"
                    placeholder="Enter your surname"
                    required
                    className="w-full pl-4 pr-4 py-4 bg-background border border-border-color rounded-2xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm font-medium shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
              <div className="relative group/field font-medium">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within/field:text-blue-400 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-2xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Phone (Optional)</label>
              <div className="relative group/field font-medium">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500 group-focus-within/field:text-blue-400 transition-colors" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+90 555 --- -- --"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-2xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-5 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative group overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalize Registration <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> </>}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border-color flex items-center gap-3 text-gray-500 justify-center">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Encrypted Verification</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
