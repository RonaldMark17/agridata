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

  // --- SMART SECURITY LOCKOUT (Persistent Tracking) ---
  // Initialize from localStorage so it survives page refreshes
  const [attemptsRecord, setAttemptsRecord] = useState(() => {
    try {
      const saved = localStorage.getItem('agridata_auth_attempts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [now, setNow] = useState(Date.now());
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION_MS = 30000; // 30 seconds

  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth(); 

  // Sync attempts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('agridata_auth_attempts', JSON.stringify(attemptsRecord));
  }, [attemptsRecord]);

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
    if (error && !isLocked) setError('');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-emerald-100 relative">
      {/* SaaS Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.4] bg-[center_top_-1px]" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)' }} />
      
      {/* LEFT SIDE: Brand Dossier (Enterprise Look) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden z-10 shadow-2xl">
        <div className="absolute inset-0 z-0 bg-grid-slate-700/[0.2] bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to top, transparent, black)' }} />
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between p-16 xl:p-24 w-full">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <Sprout size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">AgriData</span>
              <span className="text-[9px] font-semibold text-emerald-400 tracking-[0.2em] uppercase mt-1">Systems</span>
            </div>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 mb-6 text-emerald-400">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Security Active</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-6">
              The Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">of Agriculture.</span>
            </h2>
            <p className="text-slate-400 text-sm xl:text-base font-medium leading-relaxed">
              Synthesizing regional datasets into actionable agricultural insights. Securely manage yields, land metrics, and community demographics through a unified portal.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-8 mt-12">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">© 2026 Institutional Registry</div>
            <div className="flex gap-6 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Security</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Auth Module */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 relative z-10">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-2">
          <div className="p-2 bg-emerald-600 rounded-lg shadow-sm shrink-0">
            <Sprout size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">AgriData</span>
            <span className="text-[8px] font-semibold text-emerald-600 tracking-[0.2em] uppercase mt-0.5">Systems</span>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200">

          <header className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              {step === 'otp' ? 'Security Check' : 'Welcome back'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {step === 'otp' 
                ? 'Enter the 6-digit code sent to your registered email.' 
                : 'Enter your credentials to access the portal.'}
            </p>
          </header>

          {/* Dynamic Error / Lockout Banner */}
          {(error || isLocked) && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 border ${isLocked ? 'bg-red-50 border-red-200 text-red-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              {isLocked ? <ShieldAlert size={18} className="shrink-0 mt-0.5" /> : <Activity size={18} className="shrink-0 mt-0.5" />}
              <p className="text-xs font-semibold leading-relaxed">
                {isLocked ? `Security lock active. Please wait ${remainingSeconds} seconds before trying again.` : error}
              </p>
            </div>
          )}

          {/* --- VIEW 1: CREDENTIALS --- */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLocked ? 'text-red-300' : 'text-slate-400 group-focus-within:text-emerald-600'}`} size={16} />
                  <input
                    name="username"
                    type="text"
                    required
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-slate-900 transition-all outline-none shadow-sm ${isLocked ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-400'}`}
                    placeholder="Username or email address"
                    value={credentials.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLocked ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-emerald-600'}`} size={16} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLocked}
                    className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-400 transition-all outline-none shadow-sm disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLocked}
                className={`w-full flex items-center justify-center gap-2 py-3.5 mt-2 text-white rounded-xl font-bold text-sm shadow-md transition-all ${
                  isLocked 
                    ? 'bg-red-600 shadow-red-600/20 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed'
                }`}
              >
                {isLocked ? (
                  <>Account Locked ({remainingSeconds}s)</>
                ) : loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>Log In <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* --- VIEW 2: OTP VERIFICATION --- */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Verification Code</label>
                <div className="relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-400 transition-all outline-none shadow-sm tracking-[0.5em] text-center"
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
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-500 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>Verify & Access <ShieldCheck size={16} /></>
                )}
              </button>
              
              <div className="pt-2 text-center">
                <button 
                  type="button" 
                  onClick={() => setStep('credentials')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel and return to login
                </button>
              </div>
            </form>
          )}

          {step === 'credentials' && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium text-xs">
                New to the system? 
                <Link to="/register" className="text-emerald-600 font-bold ml-1.5 hover:text-emerald-700 transition-colors">Sign up</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global CSS Map Overrides for Grid */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bg-grid-slate-200 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
        .bg-grid-slate-700 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
      `}} />
    </div>
  );
}