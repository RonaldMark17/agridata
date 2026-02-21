import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sprout, Loader2, Lock, Mail, Activity, ArrowRight, ShieldCheck, Smartphone, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [otp, setOtp] = useState('');
  
  // --- LOGIN STATES ---
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- SMART SECURITY LOCKOUT (Per-User Tracking) ---
  const [attemptsRecord, setAttemptsRecord] = useState({}); // { 'email@test.com': { count: 3, lockedUntil: 170000000 } }
  const [now, setNow] = useState(Date.now());
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION_MS = 30000; // 30 seconds

  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth(); 

  // Ticking clock to drive the countdown UI smoothly
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Check the current status of the typed username
  const currentUserKey = credentials.username.trim().toLowerCase();
  const currentRecord = attemptsRecord[currentUserKey] || { count: 0, lockedUntil: null };
  const isLocked = currentRecord.lockedUntil && currentRecord.lockedUntil > now;
  const remainingSeconds = isLocked ? Math.ceil((currentRecord.lockedUntil - now) / 1000) : 0;

  // STEP 1: Submit Username/Password
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    setLoading(true);
    
    // If the lock expired, we treat their current attempt count as 0
    let activeCount = currentRecord.count;
    if (currentRecord.lockedUntil && currentRecord.lockedUntil <= now) {
      activeCount = 0;
    }

    try {
      const response = await login(credentials); 
      
      // On Success: Clear security record for this user
      setAttemptsRecord(prev => {
        const newRecord = { ...prev };
        delete newRecord[currentUserKey];
        return newRecord;
      });
      
      if (response?.otp_required) {
        setStep('otp'); 
      } else if (response?.access_token || response?.user) {
        navigate('/dashboard'); 
      } else {
        triggerFailedAttempt(activeCount, 'Invalid credentials or server response.');
      }
    } catch (err) {
      console.error(err);
      triggerFailedAttempt(activeCount, err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Manage failed attempts per username
  const triggerFailedAttempt = (currentCount, errorMessage) => {
    const newCount = currentCount + 1;
    const willLock = newCount >= MAX_ATTEMPTS;

    setAttemptsRecord(prev => ({
      ...prev,
      [currentUserKey]: {
        count: newCount,
        lockedUntil: willLock ? Date.now() + LOCKOUT_DURATION_MS : null
      }
    }));

    if (willLock) {
      setError(`Too many failed attempts for ${credentials.username}. Account temporarily locked.`);
    } else {
      setError(`${errorMessage} (${MAX_ATTEMPTS - newCount} attempts remaining)`);
    }
  };

  // STEP 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await verifyOtp({ 
        username: credentials.username, 
        otp: otp 
      });
      
      if (response?.access_token) {
        navigate('/dashboard');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    // Clear API errors when they type, unless they are currently locked out
    if (error && !isLocked) setError('');
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans selection:bg-emerald-100">
      
      {/* LEFT SIDE: Brand Dossier */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-[#041d18] overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale-[0.2]"
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
          alt="Field Registry"
        />
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between p-20 w-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-2xl shadow-emerald-500/40">
              <Sprout size={28} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white uppercase">AgriData</span>
              <span className="text-[10px] font-black text-emerald-500 tracking-[0.4em] uppercase">Systems Hub</span>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-8 text-emerald-400">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Security Active</span>
            </div>
            <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8 uppercase">
              The Intelligence <br />
              <span className="text-emerald-500 italic font-serif lowercase">of</span> Agriculture.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Synthesizing regional datasets into actionable agricultural insights. Securely manage yields, land metrics, and community demographics.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-10">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 Institutional Registry</div>
            <div className="flex gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Security</span>
              <span>Privacy</span>
              <span>Network Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Auth Module */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
        <div className="mx-auto w-full max-w-sm">

          <header className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">
              {step === 'otp' ? 'Security Check' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400 font-medium">
              {step === 'otp' 
                ? 'Enter the 6-digit code sent to your registered email.' 
                : 'Initialize session protocol to continue.'}
            </p>
          </header>

          {/* Dynamic Error / Lockout Banner */}
          {(error || isLocked) && (
            <div className={`mb-8 p-4 border rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${isLocked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
              {isLocked ? <ShieldAlert size={18} className="shrink-0" /> : <Activity size={18} className="shrink-0" />}
              <p className="text-[11px] leading-relaxed font-black uppercase tracking-widest">
                {isLocked ? `Security Lock Active. Wait ${remainingSeconds}s.` : error}
              </p>
            </div>
          )}

          {/* --- VIEW 1: CREDENTIALS --- */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Handle</label>
                  <div className="relative group">
                    <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isLocked ? 'text-red-300' : 'text-slate-300 group-focus-within:text-emerald-500'}`} size={18} />
                    {/* Notice: Username input is NEVER disabled, so they can backspace and fix it! */}
                    <input
                      name="username"
                      type="text"
                      required
                      className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none shadow-inner ${isLocked ? 'border-red-200 focus:ring-4 focus:ring-red-500/10' : 'border-transparent focus:ring-4 focus:ring-emerald-500/5'}`}
                      placeholder="Username or email"
                      value={credentials.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
                    <Link to="/forgot-password" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700">Lost Key?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isLocked ? 'text-slate-200' : 'text-slate-300 group-focus-within:text-emerald-500'}`} size={18} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLocked}
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner disabled:opacity-40 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLocked}
                className={`w-full flex items-center justify-center gap-3 py-5 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all ${
                  isLocked 
                    ? 'bg-red-600 shadow-red-600/20 cursor-not-allowed' 
                    : 'bg-slate-900 shadow-slate-200 hover:bg-slate-800 active:scale-95 disabled:opacity-50'
                }`}
              >
                {isLocked ? (
                  <>Account Locked ({remainingSeconds}s)</>
                ) : loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>Initialize Session <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* --- VIEW 2: OTP VERIFICATION --- */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Two-Factor Code</label>
                <div className="relative group">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner tracking-[0.5em]"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>Verify & Access <ShieldCheck size={16} /></>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep('credentials')}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel and return to login
              </button>
            </form>
          )}

          {step === 'credentials' && (
            <footer className="mt-12 pt-8 border-t border-slate-50 text-center">
              <p className="text-slate-400 font-bold text-xs">
                New to the system? <br className="sm:hidden" />
                <Link to="/register" className="text-emerald-600 uppercase tracking-widest font-black ml-1 hover:text-emerald-700 transition-colors">Apply for Onboarding</Link>
              </p>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}