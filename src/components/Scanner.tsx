'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, MapPin, Loader2, CheckCircle2, 
  XCircle, UserPlus, Info, RefreshCw, 
  ChevronRight, Mail, User, Smartphone, 
  Search, ArrowRight, ShieldCheck, Building2,
  ScanLine, UserCheck
} from 'lucide-react';
import { checkInAction, validateScanAction, lookupParticipantAction } from '@/actions/attendance';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import toast from 'react-hot-toast';

type ScannerStatus = 'idle' | 'scanning' | 'verifying' | 'ask-email' | 'searching' | 'register' | 'success' | 'error';

function ScannerContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [email, setEmail] = useState('');
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const fetchLocation = async (isRetry = false) => {
    if (typeof window === 'undefined') return;
    setError(null);

    // Security context check
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname);
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && !isIP) {
      const msg = 'Security Error: Geolocation requires HTTPS. This browser blocks location on insecure connections.';
      console.error(msg);
      setError(msg);
      return;
    }

    if ('geolocation' in navigator) {
      const options = { 
        enableHighAccuracy: !isRetry, 
        timeout: 15000, 
        maximumAge: isRetry ? 60000 : 0 
      };
      
      console.log(`Requesting location (High accuracy: ${!isRetry})...`);

      // Wrap in a promise so we can await it properly
      return new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setError(null);
            resolve();
          },
          (err) => {
            const errCode = err?.code;
            const errMsg = err?.message || 'No specific error message provided';
            
            // Fallback logic: retry with lower accuracy on position unavailable / timeout
            if (!isRetry && (errCode === 2 || errCode === 3 || errCode === undefined)) {
              console.warn('High-accuracy GPS failed, trying Wi-Fi/Cell fallback...');
              fetchLocation(true).then(resolve);
              return;
            }

            let msg = '';
            if (errCode === 1) msg = 'Location Permission Denied. Please check your phone settings.';
            else if (errCode === 2) msg = 'Position Unavailable. Move to an area with better signal.';
            else if (errCode === 3) msg = 'Request Timed Out. Your GPS is taking too long to respond.';
            else msg = errMsg;
            
            setError(`${msg} (Error Code: ${errCode || '?'})`);
            resolve();
          },
          options
        );
      });
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // On mount: silently try to get location ONLY if already permitted.
  // Safari blocks prompts without a user gesture, so we use a short timeout
  // to avoid triggering a prompt. If it fails silently, the user will tap
  // the button which counts as a user gesture and will trigger the real prompt.
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    // Try with a short timeout — if location is already permitted this succeeds fast.
    // If not permitted, this will silently fail on Safari (no prompt shown).
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationChecked(true);
      },
      () => {
        // Silently ignore — user will tap the button to trigger the real prompt
        console.log('Auto-location not available (this is normal on Safari). User must tap to grant.');
        setLocationChecked(true);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  // AUTO-VERIFY if token is in URL
  useEffect(() => {
    if (tokenFromUrl && location && status === 'idle') {
      handleInitialScan(tokenFromUrl);
    }
  }, [tokenFromUrl, location, status]);

  // Step 1: Initial Scan Validation
  const handleInitialScan = async (token: string) => {
    setLoading(true);
    setStatus('verifying');
    setError(null);

    const result = await validateScanAction({
      token,
      latitude: location?.lat || null,
      longitude: location?.lng || null,
    });

    if (result.success && result.sessionToken) {
      setSessionToken(result.sessionToken);
      setEventTitle(result.eventTitle || '');
      setStatus('ask-email');
    } else {
      setStatus('error');
      setError(result.error || t('auth_failed'));
    }
    setLoading(false);
  };

  // Step 2: Email Lookup
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;

    setLoading(true);
    setStatus('searching');
    
    const result = await lookupParticipantAction(email, sessionToken);

    if (result.error) {
      toast.error(result.error === 'Invalid email or password.' ? t('invalid_credentials') : (result.error || t('auth_failed')));
      setStatus('error');
      setError(result.error === 'Invalid email or password.' ? t('invalid_credentials') : (result.error || t('auth_failed')));
    } else if (result.recognized) {
      // AUTOMATIC CHECK-IN for recognized users
      const checkInResult = await checkInAction({
        token: sessionToken,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        registrationData: {
          email: result.email!,
          firstName: result.name!,
          lastName: result.surname!,
          phone: '', // Optional for existing
        }
      }) as any;

      if (checkInResult.success) {
        setUserName(`${result.name} ${result.surname}`);
        setStatus('success');
      } else {
        setStatus('error');
        setError(checkInResult.error || t('auth_failed'));
      }
    } else {
      // NEW USER: Transition to full registration
      setStatus('register');
    }
    setLoading(false);
  };

  // Step 3: Registration Submit
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;

    setLoading(true);
    const result = await checkInAction({
      token: sessionToken,
      latitude: location?.lat || null,
      longitude: location?.lng || null,
      registrationData: {
        email,
        ...regData
      }
    }) as any;

    if (result.success) {
      setUserName(`${regData.firstName} ${regData.lastName}`);
      setStatus('success');
    } else {
      toast.error(result.error || t('auth_failed'));
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
        qrbox: { width: 220, height: 220 },
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
              handleInitialScan(token);
            }).catch(console.error);
          } catch (e) {
            console.error('Invalid QR code');
          }
        },
        (errorMessage) => {}
      ).catch((err) => {
        setError(t('camera_blocked'));
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
      <div className="w-full max-w-lg bg-card-bg/60 backdrop-blur-3xl border border-border-color p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{t('access_granted')}</h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
          <UserCheck className="w-3 h-3" />
          {t('welcome_user')}, {userName}
        </div>
        <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed px-4">
          {t('presence_recorded_for')}
        </p>
        <div className="p-6 bg-card-bg border border-border-color rounded-2xl font-bold text-lg shadow-sm group-hover:border-primary/40 transition-colors mb-8 text-primary">
          {eventTitle}
        </div>
      </div>
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
            className="bg-card-bg/60 backdrop-blur-3xl border border-border-color p-10 rounded-3xl text-center shadow-2xl w-full"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-[0_0_40px_rgba(113,82,250,0.1)]">
              <ScanLine className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">{t('scanner_welcome')}</h1>
            <p className="text-gray-500 mt-4 text-sm leading-relaxed mb-10 font-medium">{t('scanner_desc')}</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => {
                  if (!location) {
                    fetchLocation();
                  } else {
                    startScanner();
                  }
                }}
                className="w-full bg-primary hover:bg-primary/90 py-4 rounded-xl font-bold text-white transition-all shadow-xl shadow-primary/20 active:scale-[0.98] group flex items-center justify-center gap-3"
              >
                {!location && !locationChecked && !error ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('verify_location')}
                  </>
                ) : !location ? (
                  <>
                    <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {t('verify_location')}
                  </>
                ) : (
                  <>
                    <ScanLine className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {t('retry_location')}
                  </>
                )}
              </button>
              
              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex flex-col gap-3 text-left">
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-500 text-xs leading-relaxed font-bold">{error}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => fetchLocation()}
                      className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-foreground transition-colors p-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('retry_location')}
                    </button>
                    
                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                      <button 
                        onClick={() => {
                          setLocation({ lat: 0, lng: 0 }); // Simulate location
                          setError(null);
                          toast.success('Location Bypassed (Dev Mode)');
                        }}
                        className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors p-2 border border-white/10 rounded-xl bg-white/5"
                      >
                        <Info className="w-3 h-3" />
                        Skip for Testing (Localhost Only)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {location && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-3 h-3" />
                  {t('location_secured')}
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
            className="relative overflow-hidden group rounded-3xl border border-border-color shadow-2xl"
          >
            <div 
              id="reader" 
              ref={initScannerRef}
              className="w-full overflow-hidden" 
            />
            <div className="absolute inset-0 pointer-events-none border-20 border-background/80" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] border-2 border-primary rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-primary animate-scan shadow-[0_0_15px_rgba(113,82,250,0.8)]" />
            </div>

            <button 
              onClick={() => setStatus('idle')}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl text-white text-sm font-bold backdrop-blur-md transition-all shadow-xl shadow-red-500/20"
            >
              {t('scanning_cancel')}
            </button>
          </motion.div>
        )}

        {(status === 'verifying' || status === 'searching') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center p-12 bg-card-bg/60 backdrop-blur-3xl rounded-3xl border border-border-color shadow-2xl"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {status === 'verifying' ? <ShieldCheck className="w-8 h-8 text-primary" /> : <Search className="w-8 h-8 text-primary" />}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
              {status === 'verifying' ? t('verifying_scan') : t('identifying_you')}
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-[200px] mx-auto text-sm">
              {status === 'verifying' ? t('verifying_scan_desc') : t('identifying_you_desc')}
            </p>
          </motion.div>
        )}

        {status === 'ask-email' && (
          <motion.div
            key="ask-email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-card-bg/60 backdrop-blur-3xl border border-border-color p-10 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">{t('enter_email')}</h2>
              <p className="text-gray-500 text-xs font-semibold">{t('verify_identity_for')} <span className="text-primary">{eventTitle}</span></p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@safespeech.com.tr"
                  className="w-full pl-11 pr-4 py-4 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {t('continue')} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {status === 'register' && (
          <motion.div 
            key="register"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-card-bg/60 backdrop-blur-3xl border border-border-color p-8 rounded-3xl shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">{t('complete_registration')}</h2>
              <p className="text-gray-500 text-xs font-semibold mb-3">{t('reg_not_found')}</p>
              <div className="inline-flex py-1 px-3 bg-card-bg border border-border-color rounded-full text-[10px] font-bold text-primary">{email}</div>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">{t('first_name')}</label>
                  <input
                    required
                    value={regData.firstName}
                    onChange={(e) => setRegData({...regData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">{t('last_name')}</label>
                  <input
                    required
                    value={regData.lastName}
                    onChange={(e) => setRegData({...regData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">{t('phone_number')}</label>
                <div className="relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    value={regData.phone}
                    onChange={(e) => setRegData({...regData, phone: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-color rounded-xl text-foreground focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm"
                    placeholder="+90 XXX XXX XX XX"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('complete_checkin')}
              </button>
            </form>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-red-500/5 border border-red-500/10 rounded-3xl shadow-2xl"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{t('verification_denied')}</h2>
            <p className="text-red-500/80 font-bold mb-10 leading-relaxed text-sm px-4">{error}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="w-full bg-card-bg hover:bg-border-color py-4 rounded-xl font-bold text-foreground border border-border-color transition-all shadow-xl active:scale-[0.98]"
            >
              {t('try_again')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        #reader { border: none !important; background: var(--card-bg) !important; }
        #reader video { border-radius: 0 !important; object-fit: cover; }
        #reader__dashboard_section_csr button { display: none; }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
}

export default function Scanner() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 bg-card-bg/40 border border-border-color rounded-3xl">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">{(typeof window !== 'undefined' && localStorage.getItem('NEXT_LOCALE') === 'tr') ? 'Sistem Yükleniyor...' : 'Loading System Components...'}</p>
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
