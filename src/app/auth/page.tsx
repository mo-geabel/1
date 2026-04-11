'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthTabContent from '@/components/AuthTabContent';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader2 } from 'lucide-react';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[150px] pointer-events-none transition-colors" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none transition-colors" />

      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <AuthTabContent eventId={eventId} />
      </div>
    </div>
  );
}

export default function UnifiedAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Access...</p>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
