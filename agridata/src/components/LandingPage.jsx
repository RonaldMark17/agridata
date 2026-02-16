import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, ArrowRight, BarChart3, Users, Globe, 
  ShieldCheck, ChevronRight, Leaf, Tractor, Activity
} from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-lg">
              <Sprout size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-black tracking-tight uppercase leading-none ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>AgriData</span>
              <span className="text-[10px] font-black text-emerald-600 tracking-[0.3em] uppercase">Systems Hub</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Solutions</a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors">Impact</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-500 hover:text-slate-900">Sign In</Link>
            <Link to="/register" className="group flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
              Get Started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Leaf size={12} /> Next Gen Agricultural Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Cultivating Data. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Harvesting Insights.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            A centralized registry system designed to empower agricultural communities. 
            Securely manage farmer profiles, track crop yields, and generate actionable regional analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200 hover:bg-emerald-500 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <Tractor size={18} /> Join the Registry
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
              View Analytics Demo
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-slate-200 pt-10">
            {[
              { label: 'Registered Farmers', val: '12,500+' },
              { label: 'Barangays Covered', val: '48' },
              { label: 'Data Points', val: '1.2M' },
              { label: 'Uptime', val: '99.9%' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-black text-slate-900">{stat.val}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Enterprise-Grade Tools for Agriculture</h2>
            <p className="text-slate-500">Built for researchers, local government units, and cooperatives to streamline data collection and analysis.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Users} 
              title="Farmer Profiling" 
              desc="Comprehensive digital identities including socio-economic data, land ownership metrics, and household demographics."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Yield Analytics" 
              desc="Real-time visualization of production volumes across different crops, seasons, and barangays."
            />
            <FeatureCard 
              icon={Globe} 
              title="Geo-Tagging" 
              desc="Map-based monitoring of agricultural zones to optimize resource allocation and disaster response."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure Registry" 
              desc="Role-based access control and encrypted database ensuring the privacy of sensitive constituent data."
            />
            <FeatureCard 
              icon={Activity} 
              title="Project Tracking" 
              desc="Monitor the progress and impact of research initiatives and government-funded agricultural programs."
            />
            <FeatureCard 
              icon={Sprout} 
              title="Crop Management" 
              desc="Database of regional crop varieties, growth cycles, and market value estimations."
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-[#041d18] rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
            {/* Accents */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to Modernize Your Data?</h2>
              <p className="text-emerald-100/80 text-lg max-w-2xl mx-auto mb-10">
                Join the network of forward-thinking agricultural institutions. 
                Start making data-driven decisions today.
              </p>
              <Link to="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest shadow-2xl hover:bg-emerald-400 hover:-translate-y-1 transition-all">
                Create Account <ChevronRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Sprout size={20} className="text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 uppercase">AgriData</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Empowering the agricultural sector through secure, efficient, and intelligent data management systems.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-emerald-600">Features</a></li>
                <li><a href="#" className="hover:text-emerald-600">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-600">API Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-emerald-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-600">Data Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 AgriData Systems. All rights reserved.</p>
            <div className="flex gap-6 text-slate-400">
              {/* Social placeholders */}
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
              <div className="w-5 h-5 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 text-slate-400 border border-slate-100 group-hover:border-emerald-500">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}