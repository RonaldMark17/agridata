import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  User, Mail, Lock, Sprout, Loader2, 
  ArrowRight, Activity, Fingerprint, ShieldCheck, 
  ChevronLeft, ShieldAlert, CheckCircle2
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'viewer',
    terms: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak' });
  
  const navigate = useNavigate();

  // Password matching logic
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  // Simple Password Strength Checker
  useEffect(() => {
    const pass = formData.password;
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Secure'];
    setPasswordStrength({ score, label: labels[score] });
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.terms) {
      setError('You must agree to the data security protocol.');
      return;
    }
    if (passwordStrength.score < 2) {
      setError('Please create a stronger password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // We don't send confirmPassword to the API
      const { confirmPassword, terms, ...submitData } = formData;
      await authAPI.register(submitData);
      navigate('/login', { state: { message: 'Account created. Waiting for admin approval.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try a different username.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value.trim() 
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-emerald-100 relative">
      <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.4] bg-[center_top_-1px]" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)' }} />

      {/* LEFT SIDE: Security Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden z-10 shadow-2xl">
        <div className="absolute inset-0 z-0 bg-grid-slate-700/[0.2] bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to top, transparent, black)' }} />
        
        <div className="relative z-10 flex flex-col justify-between p-16 xl:p-24 w-full">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-md">
              <Sprout size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">AgriData</span>
              <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">Secure Portal</span>
            </div>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 mb-6 text-emerald-400">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encryption</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-6">
              Safety First. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Secure Access.</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              We protect your data with verified protocols. Your account will be active once an administrator confirms your identity.
            </p>
          </div>

          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest pt-8 border-t border-slate-800">
            Security Version: Auth-Sec v3.1
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 relative z-10 overflow-y-auto py-12 no-scrollbar">
        <div className="w-full max-w-lg mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200">
          
          <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-[10px] uppercase mb-8 transition-all">
             <ChevronLeft size={14} /> Back to Login
          </button>

          <header className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-500 font-medium">Please fill in your details to request access.</p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 animate-in fade-in">
              <ShieldAlert size={18} className="shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600" size={16} />
                <input name="full_name" type="text" required className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10" placeholder="e.g. Juan Dela Cruz" value={formData.full_name} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Username</label>
                <input name="username" type="text" required className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10" placeholder="User handle" value={formData.username} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <input name="email" type="email" required className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10" placeholder="name@agency.gov" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <span className={`text-[10px] font-bold uppercase ${passwordStrength.score > 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                   Security: {passwordStrength.label}
                </span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600" size={16} />
                <input name="password" type="password" required className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10" placeholder="Min. 8 characters" value={formData.password} onChange={handleChange} />
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-full flex-1 transition-all border-r border-white ${i < passwordStrength.score ? 'bg-emerald-500' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPasswordMatch ? 'text-emerald-500' : 'text-slate-400'}`} size={16} />
                <input 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  className={`w-full pl-11 pr-10 py-3 bg-white border rounded-xl text-sm outline-none transition-all focus:ring-4 ${
                    formData.confirmPassword === '' 
                      ? 'border-slate-300 focus:ring-emerald-500/10' 
                      : isPasswordMatch 
                        ? 'border-emerald-500 focus:ring-emerald-500/10' 
                        : 'border-rose-400 focus:ring-rose-500/10'
                  }`} 
                  placeholder="Repeat your password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                />
                {isPasswordMatch && <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in" />}
              </div>
            </div>

            {/* Protocol Agreement */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  I agree to follow the <span className="text-emerald-600 font-bold">Data Security Rules</span>. I know my activity will be monitored for safety.
                </p>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-all disabled:opacity-70 active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Request Access <ArrowRight size={16} /></>}
            </button>
          </form>

          <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium text-xs">
              Already have an account? 
              <Link to="/login" className="text-emerald-600 font-bold ml-1.5 hover:underline">Sign In</Link>
            </p>
          </footer>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-grid-slate-200 { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E"); }
        .bg-grid-slate-700 { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E"); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}