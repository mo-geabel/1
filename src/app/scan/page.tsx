import Scanner from '@/components/Scanner';
import { Suspense } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-4 py-12 md:p-8 transition-colors duration-300">
      {/* Top Brand */}
      <div className="flex flex-col items-center gap-2 mb-10">
        <div className="px-5 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Secure Attendance</span>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="w-full max-w-lg mb-auto">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-20 bg-card-bg/40 border border-border-color rounded-[3rem]">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Initializing Scanner...</p>
          </div>
        }>
          <Scanner />
        </Suspense>
      </div>

      {/* Bottom Footer */}
      <div className="mt-12 group flex flex-col items-center gap-6">
        <div className="flex items-center gap-8 text-gray-400">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-foreground">{new Date().getFullYear()}</span>
            <span className="text-[10px] uppercase tracking-tighter opacity-50">Est. Year</span>
          </div>
          <div className="w-px h-8 bg-border-color" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-foreground">GPS</span>
            <span className="text-[10px] uppercase tracking-tighter opacity-50">Verified</span>
          </div>
          <div className="w-px h-8 bg-border-color" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-foreground">SSL</span>
            <span className="text-[10px] uppercase tracking-tighter opacity-50">Encrypted</span>
          </div>
        </div>
        
        <p className="text-gray-500 text-xs text-center max-w-[200px] leading-relaxed">
          Attendance verification system v1.2
        </p>
      </div>
    </div>
  );
}
