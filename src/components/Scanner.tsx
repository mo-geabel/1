'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, MapPin, Loader2, CheckCircle2, 
  XCircle, UserPlus, Info, RefreshCw, 
  ChevronRight, Mail, User, Smartphone, Sparkles
} from 'lucide-react';
import { checkInAction } from '@/actions/attendance';
import { useSearchParams } from 'next/navigation';

function ScannerContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const [status, setStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error' | 'register'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const fetchLocation = () => {
    if (typeof window === 'undefined') return;
    setError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setError(null);
        },
        (err) => {
          let msg = 'Location access failed. ';
          if (err.code === 1) msg += 'Please enable location permissions.';
          else if (err.code === 2) msg += 'Position unavailable.';
          else msg += err.message;
          setError(msg);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported.');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (tokenFromUrl && location && status === 'idle') {
      setActiveToken(tokenFromUrl);
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl, location, status]);


  const handleVerify = async (token: string, registrationData?: typeof regData) => {
    if (!location) {
      setError('Waiting for GPS location...');
      return;
    }

    setLoading(true);
    if (!registrationData) setStatus('verifying');
    setError(null);

    const result = await checkInAction({
      token,
      latitude: location.lat,
      longitude: location.lng,
      registrationData
    }) as any;

    if (result.success) {
      setEventTitle(result.eventTitle || '');
      setUserName(result.userName || 'Student');
      setStatus('success');
    } else if (result.requiresRegistration) {
      setEventTitle(result.eventTitle || '');
      // Use the new registration token for form submission
      setActiveToken(result.registrationToken || token);
      setStatus('register');
    } else {
      setStatus('error');
      setError(result.error || 'Verification failed.');
    }
    setLoading(false);
  };

  const startScanner = () => {
    setStatus('scanning');
  };

  const initScannerRef = (element: HTMLDivElement | null) => {
    if (!element || status !== 'scanning' || scannerRef.current) return;

    try {
      const scanner = new Html5Qrcode(element.id);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          try {
            let token = decodedText;
            if (decodedText.startsWith('http')) {
              const url = new URL(decodedText);
              token = url.searchParams.get('token') || decodedText;
            }
            scanner.stop().then(() => {
              scannerRef.current = null;
              setActiveToken(token);
              handleVerify(token);
            }).catch(console.error);
          } catch (e) {
            console.error('Invalid QR code');
          }
        },
        (errorMessage) => {
          // Silent during active scanning
        }
      ).catch((err) => {
        console.error('Camera start error:', err);
        setError('Camera blocked. Please check your browser permissions and ensure you are using HTTPS.');
        setStatus('error');
      });
      
      scannerRef.current = scanner;
    } catch (err) {
      console.error('Scanner init error:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        const scanner = scannerRef.current as Html5Qrcode;
        if (scanner.isScanning) {
          scanner.stop().then(() => {
            scanner.clear();
          }).catch(console.error);
        }
        scannerRef.current = null;
      }
    };
  }, []);

  if (status === 'success') {
    return (
      <div className="w-full max-w-lg bg-card-bg/60 backdrop-blur-3xl border border-border-color p-12 rounded-4xl text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
        <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Access Granted!</h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
          <Sparkles className="w-3 h-3" />
          Verified: {userName}
        </div>
        <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed px-4">
          Your presence has been successfully recorded for:
        </p>
        <div className="p-6 bg-card-bg border border-border-color rounded-3xl font-black text-lg shadow-sm group-hover:border-green-500/40 transition-colors">
          {eventTitle}
        </div>
      </div>
    );
  }

  if (status === 'register' && activeToken) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card-bg/60 backdrop-blur-3xl border border-border-color p-8 rounded-4xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Identify Yourself</h2>
          <p className="text-gray-500 text-xs font-medium px-4">
            We've verified your location for <span className="text-blue-500 font-bold">{eventTitle}</span>. Provide your details to complete check-in.
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(activeToken, regData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  value={regData.firstName}
                  onChange={(e) => setRegData({...regData, firstName: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                  placeholder="John"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  value={regData.lastName}
                  onChange={(e) => setRegData({...regData, lastName: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                required
                type="email"
                value={regData.email}
                onChange={(e) => setRegData({...regData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative group">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                required
                value={regData.phone}
                onChange={(e) => setRegData({...regData, phone: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border-color rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/40 transition-all font-bold text-sm"
                placeholder="+90 XXX XXX XX XX"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Check-in <ChevronRight className="w-4 h-4" /></>}
          </button>
        </form>

  
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card-bg/60 backdrop-blur-3xl border border-border-color p-10 rounded-4xl text-center shadow-2xl w-full"
          >
            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <Camera className="w-10 h-10 text-blue-400" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">Welcome to the Event Portal</h1>
            <p className="text-gray-500 mt-4 text-sm leading-relaxed mb-10">Scan the QR code displayed at the event entrance to mark your presence.</p>
            
            <div className="space-y-4">
              <button 
                onClick={startScanner}
                disabled={!location}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center justify-center gap-3"
              >
                {!location && !error ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking Location...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Open Camera Scanner
                  </>
                )}
              </button>
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-3 text-left">
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-500 text-xs leading-relaxed font-medium">{error}</p>
                  </div>
                  <button 
                    onClick={() => fetchLocation()}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Location Check
                  </button>
                </div>
              )}

              {location && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                  <MapPin className="w-3 h-3" />
                  Location Secured
                </div>
              )}
            </div>
          </motion.div>
        )}

        {status === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden group rounded-4xl border border-border-color shadow-2xl"
          >
            <div 
              id="reader" 
              ref={initScannerRef}
              className="w-full overflow-hidden" 
            />
            <div className="absolute inset-0 pointer-events-none border-20 border-background/80" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-4 border-blue-500 rounded-3xl pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400 animate-scan shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
            </div>

            <button 
              onClick={() => setStatus('idle')}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl text-white text-sm font-bold backdrop-blur-md transition-all shadow-xl shadow-red-500/20"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {status === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center p-12 bg-card-bg/60 backdrop-blur-3xl rounded-4xl border border-border-color shadow-2xl"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Verifying Presence</h2>
            <p className="text-gray-500 leading-relaxed max-w-[200px] mx-auto text-sm">Validating QR code and GPS location. Please hold on.</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-4xl shadow-2xl"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Verification Denied</h2>
            <p className="text-red-400 font-medium mb-10 leading-relaxed text-sm px-4">{error}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="w-full bg-card-bg hover:bg-card-bg/80 py-4 rounded-2xl font-bold text-foreground border border-border-color transition-all shadow-xl active:scale-[0.98]"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        #reader {
          border: none !important;
          background: var(--card-bg) !important;
        }
        #reader video {
          border-radius: 0 !important;
          object-fit: cover;
        }
        #reader__dashboard_section_csr button {
          display: none;
        }
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function Scanner() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 bg-card-bg/40 border border-border-color rounded-4xl">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading Scanner Components...</p>
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
