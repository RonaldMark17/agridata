import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  User, Mail, Lock, Sprout, Loader2, 
  ArrowRight, Activity, Fingerprint, ShieldCheck, 
  ChevronLeft, Globe 
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'viewer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(formData);
      navigate('/login', { state: { message: 'Identity created. Requesting admin verification.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Identity registration protocol failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans selection:bg-emerald-100">
      
      {/* LEFT SIDE: Brand Dossier (Mirror of Login) */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-[#041d18] overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale-[0.4]"
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop"
          alt="Registry Onboarding"
        />
        
        {/* Dynamic Glow Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between p-20 w-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-2xl shadow-emerald-500/40">
              <Sprout size={28} className="text-white" />
            </div>
            <div className="flex flex-col text-white">
              <span className="text-2xl font-black tracking-tight uppercase">AgriData</span>
              <span className="text-[10px] font-black text-emerald-500 tracking-[0.4em] uppercase">Systems Hub</span>
            </div>
          </div>
          
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-8 text-emerald-400">
              <Globe size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Network Access</span>
            </div>
            <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8 uppercase">
              Join the <br />
              <span className="text-emerald-500 italic font-serif lowercase text-5xl">Agricultural</span> Registry.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Standardizing the way we collect, analyze, and deploy agricultural research. Request access to join our network of certified researchers and data analysts.
            </p>
          </div>
          
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-10 border-t border-white/5">
            Institutional Provisioning Protocol v2.6.0
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Module */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-md py-12">
          
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-all mb-12 group">
             <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Authentication
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
               <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 shadow-inner">
                  <Fingerprint size={16} />
               </div>
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Protocol Onboarding</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Request Access</h2>
            <p className="text-slate-400 font-medium">Provision a new digital identity for the network.</p>
          </header>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
              <Activity size={18} />
              <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    name="full_name"
                    type="text"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
                    placeholder="e.g. Macky Masalonga"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Username & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
                    placeholder="macky_m"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
                    placeholder="name@agri.ph"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Create Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Note Box */}
            <div className="p-6 bg-emerald-900/5 rounded-3xl border border-emerald-500/10">
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2 mb-2">
                <ShieldCheck size={14} /> Provisioning Note
              </p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Requests are processed by system administrators. Standard access will be set to <span className="font-bold text-emerald-600">'Viewer'</span> level until credential audit is finalized.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Generate Identity <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Existing Account? 
              <Link to="/login" className="text-emerald-600 font-black ml-2 hover:text-emerald-700 transition-colors underline underline-offset-4">Authenticate</Link>
            </p>
          </footer>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}