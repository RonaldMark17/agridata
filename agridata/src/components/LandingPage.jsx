import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, ArrowRight, BarChart3, Users, Globe, 
  ShieldCheck, ChevronRight, Leaf, Tractor, Activity,
  Menu, X, CheckCircle2, MessageSquare, HelpCircle,
  Smartphone, Database, Map, Plus, Zap, Shield, 
  Award, Landmark, Building2 // Added missing Plus and extra icons
} from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5 sm:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-lg shrink-0">
              <Sprout size={20} className="text-white sm:w-[24px] sm:h-[24px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight uppercase leading-none text-slate-900">AgriData</span>
              <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Systems Hub</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Solutions</a>
            <a href="#process" className="hover:text-emerald-600 transition-colors">Process</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-500 hover:text-slate-900 px-2">Sign In</Link>
            <Link to="/register" className="group flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl">
              Get Started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
                {mobileMenuOpen ? <X size={24}/> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-5 duration-300 shadow-xl">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">Solutions</a>
                <a href="#process" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">Process</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">Pricing</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">FAQ</a>
                <hr className="border-slate-100" />
                <Link to="/login" className="text-lg font-bold text-emerald-600">Sign In to Portal</Link>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-24 pb-12 sm:pt-48 sm:pb-32">
        <div className="absolute top-[-5%] right-[-5%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-100 rounded-full blur-[80px] sm:blur-[120px] -z-10 opacity-60" />
        <div className="absolute bottom-[10%] left-[-10%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-blue-100 rounded-full blur-[80px] sm:blur-[100px] -z-10 opacity-60" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-6 sm:mb-8">
            <Leaf size={12} /> Next Gen Agricultural Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 sm:mb-8">
            Cultivating Data. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Harvesting Insights.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-500 font-medium leading-relaxed mb-8 sm:mb-10 px-2">
            A centralized registry system designed to empower agricultural communities. 
            Securely manage farmer profiles, track crop yields, and generate actionable regional analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
              <Tractor size={18} /> Join the Registry
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              View Analytics Demo
            </a>
          </div>

          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto border-t border-slate-200 pt-8 sm:pt-10">
            {[
              { label: 'Registered Farmers', val: '12,500+' },
              { label: 'Barangays Covered', val: '48' },
              { label: 'Data Points', val: '1.2M' },
              { label: 'Uptime', val: '99.9%' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{stat.val}</div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- PARTNERS SECTION (NEW) --- */}
      <section className="py-12 bg-white/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Powering Regional Progress With</p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2 font-black text-slate-900"><Landmark size={20}/> LGU LAGUNA</div>
                <div className="flex items-center gap-2 font-black text-slate-900"><Award size={20}/> DAR PHILIPPINES</div>
                <div className="flex items-center gap-2 font-black text-slate-900"><Building2 size={20}/> DOST REGION IV-A</div>
            </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="process" className="py-20 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12 sm:gap-20">
            <div className="flex-1 space-y-6 sm:space-y-8 text-center md:text-left">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">Simplified Data <br />Lifecycle</h2>
              <p className="text-slate-500 text-base sm:text-lg">Transforming raw fieldwork into institutional intelligence shouldn't be complicated.</p>
              
              <div className="space-y-4 text-left max-w-md mx-auto md:mx-0">
                <ProcessStep number="01" title="Digital Enrollment" desc="Onboard farmers via mobile-optimized forms with geolocation." icon={Smartphone} />
                <ProcessStep number="02" title="Centralized Registry" desc="Store yield data and socio-economic logs in a secure database." icon={Database} />
                <ProcessStep number="03" title="Visual Analysis" desc="Generate heatmaps and bar charts for regional output." icon={Map} />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative bg-emerald-600 rounded-[2.5rem] sm:rounded-[3.5rem] p-4 sm:p-8 shadow-2xl rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800" 
                  alt="Analytics Dashboard Preview" 
                  className="rounded-[1.5rem] sm:rounded-[2.5rem] shadow-lg"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 sm:p-6 rounded-3xl shadow-xl animate-bounce">
                  <Activity className="text-emerald-600 mb-2" />
                  <div className="text-[10px] font-black uppercase text-slate-400">System Pulse</div>
                  <div className="text-xl font-black text-slate-900">OPTIMAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 px-2">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">System Capabilities</h2>
            <p className="text-slate-500">Built for researchers and government units to streamline data collection.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={Users} title="Farmer Profiling" desc="Digital identities including socio-economic data and land ownership." />
            <FeatureCard icon={BarChart3} title="Yield Analytics" desc="Visual tracking of production volumes across different crops." />
            <FeatureCard icon={Globe} title="Geo-Tagging" desc="Map-based monitoring of agricultural zones for better planning." />
            <FeatureCard icon={ShieldCheck} title="Secure Registry" desc="Role-based access control ensuring total constituent privacy." />
            <FeatureCard icon={Activity} title="Project Tracking" desc="Monitor progress and impact of research and LGU initiatives." />
            <FeatureCard icon={Sprout} title="Crop Management" desc="Database of regional crop varieties and growth cycles." />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION (NEW) --- */}
      <section id="pricing" className="py-20 sm:py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 sm:mb-20">
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 uppercase italic">Service Tiers</h2>
                <p className="text-slate-400">Scale the platform according to your administrative reach.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <PricingCard 
                    title="Cooperative Entry" 
                    price="FREE" 
                    desc="Perfect for local farmers associations managing up to 100 members."
                    features={['Up to 100 Farmer Profiles', 'Basic Yield Analytics', 'CSV Data Exports', 'Standard Support']}
                />
                <PricingCard 
                    title="Municipal Elite" 
                    price="LGU" 
                    desc="Institutional access for city-wide agricultural office management."
                    features={['Unlimited Profiles', 'Geospatial Heatmaps', 'Research Project Hub', 'Priority Security & API', 'Custom Reporting']}
                    isFeatured={true}
                />
            </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="impact" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase italic">Impact Stories</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <TestimonialCard quote="We now know exactly who needs assistance based on real yield history." author="Engr. Mateo Cruz" role="Provincial Office" />
                <TestimonialCard quote="Geo-tagging allowed us to secure insurance for our farmers 2x faster." author="Maria Santos" role="Co-op Manager" />
                <TestimonialCard quote="Clean, exported CSV data saves me weeks of manual processing." author="Dr. Alan Rivera" role="Lead Researcher" />
            </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12 sm:mb-16">
                <div className="flex justify-center mb-4 text-emerald-600"><HelpCircle size={32}/></div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Common Queries</h2>
            </div>
            <div className="space-y-3">
                <FAQItem question="Who owns the data in the registry?" answer="The data is owned by the registering institution (LGU/Cooperative). AgriData acts only as the secure storage and processing layer." />
                <FAQItem question="Does the system support offline mode?" answer="Yes. The system is designed with a 'Local-First' architecture for mobile data entry in areas with weak cellular signals." />
                <FAQItem question="Is there a limit on how much data we can export?" answer="No. Premium tiers can perform unlimited high-speed bulk exports of all regional data for external audit." />
            </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-emerald-600 rounded-3xl sm:rounded-[4rem] p-8 sm:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">Modernize Your <br />Agricultural Data Today</h2>
              <Link to="/register" className="inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-white text-emerald-600 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all w-full sm:w-auto">
                Get Started <ChevronRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16 text-center sm:text-left">
            <div className="sm:col-span-2 flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-600 rounded-lg"><Sprout size={20} className="text-white" /></div>
                <span className="text-xl font-black text-slate-900 uppercase">AgriData</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">Empowering the agricultural sector through secure, efficient, and intelligent management systems.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Navigation</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#features" className="hover:text-emerald-600">Solutions</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600">Plans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Security</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-emerald-600">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-600">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 AgriData Systems. SECURE PROTOCOL ACTIVE.</p>
            <div className="flex gap-4">
              {['FB', 'TW', 'LI'].map(s => <div key={s} className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">{s}</div>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="group p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-emerald-100 hover:shadow-2xl transition-all duration-300">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all text-slate-400 border border-slate-100">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessStep({ number, title, desc, icon: Icon }) {
    return (
        <div className="flex gap-4 group">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-[10px] group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">{number}</div>
                <div className="flex-1 w-px bg-slate-100 my-1" />
            </div>
            <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="text-emerald-600" />
                    <h4 className="font-black text-slate-900 uppercase text-sm">{title}</h4>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function PricingCard({ title, price, desc, features, isFeatured = false }) {
    return (
        <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full ${isFeatured ? 'bg-emerald-600 border-emerald-500 shadow-2xl scale-105 z-10' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${isFeatured ? 'text-emerald-200' : 'text-slate-400'}`}>{title}</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black">{price}</span>
                {price !== 'LGU' && <span className="text-slate-400 font-bold">/mo</span>}
            </div>
            <p className={`text-sm mb-8 font-medium leading-relaxed ${isFeatured ? 'text-emerald-50' : 'text-slate-400'}`}>{desc}</p>
            <div className="space-y-4 mb-10 flex-1">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold">
                        <CheckCircle2 size={16} className={isFeatured ? 'text-emerald-300' : 'text-emerald-500'} />
                        <span className={isFeatured ? 'text-white' : 'text-slate-200'}>{f}</span>
                    </div>
                ))}
            </div>
            <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isFeatured ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                {price === 'LGU' ? 'Contact Government Sales' : 'Start Trial'}
            </button>
        </div>
    );
}

function TestimonialCard({ quote, author, role }) {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-emerald-500">
            <MessageSquare className="text-emerald-500/20 mb-6" size={28} />
            <p className="text-slate-600 text-sm font-medium italic mb-6 leading-relaxed">"{quote}"</p>
            <div>
                <p className="font-black text-slate-900 uppercase text-xs tracking-widest">{author}</p>
                <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest mt-1">{role}</p>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div onClick={() => setIsOpen(!isOpen)} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 hover:border-emerald-200 transition-all cursor-pointer group">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex justify-between items-center group-hover:text-emerald-600 transition-colors">
                {question}
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45 text-emerald-500' : 'text-slate-300'}`}>
                    <Plus size={18} />
                </div>
            </h4>
            {isOpen && (
                <p className="text-slate-500 text-xs sm:text-sm mt-4 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {answer}
                </p>
            )}
        </div>
    );
}