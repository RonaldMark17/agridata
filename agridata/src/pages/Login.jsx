import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sprout, Loader2, Lock, Mail, Activity, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [otp, setOtp] = useState('');
  
  // --- LOGIN STATES ---
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth(); 

  // STEP 1: Submit Username/Password
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(credentials); 
      
      // FIX: Strict Checks. Only navigate/switch if we explicitly got a success response.
      if (response?.otp_required) {
        setStep('otp'); 
      } else if (response?.access_token || response?.user) {
        // Only navigate if we actually have a token/user
        navigate('/dashboard'); 
      } else {
        // If response is empty (e.g. error swallowed), do not navigate.
        // The catch block below usually handles 401s, but this catches logic gaps.
        if (!error) setError('Invalid credentials or server response.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
      // Do NOT navigate on error
    } finally {
      setLoading(false);
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
      
      // FIX: Strict Check for token before navigating
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

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
              <Activity size={18} />
              <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* --- VIEW 1: CREDENTIALS --- */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Handle</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      name="username"
                      type="text"
                      required
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
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
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
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
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Digits only
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