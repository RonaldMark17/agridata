import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, ArrowRight, BarChart3, Users, Globe, 
  ShieldCheck, ChevronRight, Activity, Menu, X, 
  CheckCircle2, MessageSquare, HelpCircle,
  Smartphone, Database, Map, Plus, Landmark, 
  Award, Building2, Tractor 
} from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full overflow-x-hidden scroll-smooth flex flex-col">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-[999] transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-white shadow-sm py-2.5 sm:py-4' : 'bg-transparent py-4 sm:py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 z-50">
            <div className="p-1.5 sm:p-2.5 bg-emerald-600 rounded-lg sm:rounded-2xl shadow-lg shadow-emerald-600/30 shrink-0">
              <Sprout className="text-white w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-black tracking-tight uppercase leading-none text-slate-900">AgriData</span>
              <span className="text-[7px] sm:text-[10px] font-black text-emerald-600 tracking-[0.2em] sm:tracking-[0.3em] uppercase mt-0.5">Systems Hub</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Solutions</a>
            <a href="#process" className="hover:text-emerald-600 transition-colors">Process</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 z-50">
            <Link to="/login" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors px-2">Sign In</Link>
            <Link to="/register" className="hidden sm:flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl sm:rounded-[1.25rem] text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 transition-colors bg-white shadow-sm border border-slate-100 rounded-md focus:outline-none">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed left-0 right-0 bottom-0 top-[56px] bg-white flex flex-col items-center justify-start pt-8 pb-20 overflow-y-auto gap-4 lg:hidden transition-all duration-300 px-6 ${mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4 pointer-events-none'}`}>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 w-full text-center py-2 active:bg-slate-50 rounded-lg transition-colors">Solutions</a>
          <a href="#process" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 w-full text-center py-2 active:bg-slate-50 rounded-lg transition-colors">Process</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 w-full text-center py-2 active:bg-slate-50 rounded-lg transition-colors">Pricing</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 w-full text-center py-2 active:bg-slate-50 rounded-lg transition-colors">FAQ</a>
          <div className="w-12 h-px bg-slate-200 my-2 shrink-0" />
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-1 py-2 w-full text-center active:bg-emerald-50 rounded-lg transition-colors">Sign In to Portal</Link>
          <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full max-w-[240px] flex justify-center py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform shrink-0 mt-2">
            Get Started Now
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-28 pb-10 sm:pt-48 sm:pb-32 overflow-hidden px-4">
        <div className="absolute top-0 right-[-20%] w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-emerald-200/50 rounded-full blur-[80px] sm:blur-[160px] -z-10" />
        <div className="absolute bottom-0 left-[-20%] w-[250px] sm:w-[600px] h-[250px] sm:h-[600px] bg-blue-200/40 rounded-full blur-[80px] sm:blur-[160px] -z-10" />

        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-1 sm:py-2.5 bg-white border border-emerald-100 rounded-full text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6 sm:mb-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
            </span>
            Next Gen Agricultural Intelligence
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 uppercase break-words">
            Cultivating Data. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Harvesting Insights.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xs sm:text-xl text-slate-500 font-medium leading-relaxed mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            A centralized registry system designed to empower agricultural communities. 
            Securely manage farmer profiles, track crop yields, and generate actionable regional analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-[240px] mx-auto sm:max-w-none animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link to="/register" className="w-full sm:w-auto px-5 sm:px-10 py-3 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-[1.25rem] text-[9px] sm:text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 sm:hover:-translate-y-1 transition-all flex items-center justify-center gap-2 sm:gap-3">
              <Tractor className="w-4 h-4 sm:w-5 sm:h-5" /> Join the Registry
            </Link>
            <a href="#features" className="w-full sm:w-auto px-5 sm:px-10 py-3 sm:py-5 bg-white text-slate-600 border border-slate-200 rounded-xl sm:rounded-[1.25rem] text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
              Explore Features
            </a>
          </div>

          <div className="mt-10 sm:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto border-t border-slate-200/60 pt-6 sm:pt-14 animate-in fade-in duration-1000 delay-500">
            {[
              { label: 'Registered Farmers', val: '12,500+' },
              { label: 'Barangays Covered', val: '48' },
              { label: 'Data Points', val: '1.2M' },
              { label: 'System Uptime', val: '99.9%' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group p-2">
                <div className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter group-hover:scale-110 group-hover:text-emerald-600 transition-all duration-500">{stat.val}</div>
                <div className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 sm:mt-3">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- PARTNERS SECTION --- */}
      <section className="py-6 sm:py-16 bg-white border-y border-slate-100 relative z-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 overflow-hidden">
          <p className="text-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 sm:mb-10">Powering Regional Progress Alongside</p>
          <div className="flex flex-row flex-wrap justify-center items-center gap-x-4 gap-y-3 sm:gap-20 opacity-70 sm:opacity-40 sm:grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center justify-center gap-1.5 font-black text-slate-900 tracking-tighter text-xs sm:text-xl uppercase"><Landmark className="text-emerald-600 w-3.5 h-3.5 sm:w-6 sm:h-6"/> LGU Laguna</div>
            <div className="flex items-center justify-center gap-1.5 font-black text-slate-900 tracking-tighter text-xs sm:text-xl uppercase"><Award className="text-emerald-600 w-3.5 h-3.5 sm:w-6 sm:h-6"/> DAR Phil</div>
            <div className="flex items-center justify-center gap-1.5 font-black text-slate-900 tracking-tighter text-xs sm:text-xl uppercase"><Building2 className="text-emerald-600 w-3.5 h-3.5 sm:w-6 sm:h-6"/> DOST Reg IV-A</div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="process" className="py-10 sm:py-24 overflow-hidden relative px-4">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24">
            <div className="flex-1 space-y-6 sm:space-y-8 text-center lg:text-left w-full">
              <div>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 sm:mb-3 block">System Workflow</span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase break-words">Simplified Data <br className="hidden lg:block"/>Lifecycle</h2>
                <p className="text-slate-500 text-xs sm:text-base mt-3 sm:mt-4 max-w-xl mx-auto lg:mx-0 font-medium">Transforming fragmented agricultural fieldwork into cohesive, institutional intelligence has never been this streamlined.</p>
              </div>
              
              <div className="text-left max-w-sm mx-auto lg:mx-0 w-full flex flex-col">
                <ProcessStep number="01" title="Digital Enrollment" desc="Onboard farmers via mobile-optimized interfaces designed for rapid field deployment." icon={Smartphone} />
                <ProcessStep number="02" title="Centralized Registry" desc="Safely compile yield data, socio-economic logs, and territorial markers in one secure vault." icon={Database} />
                <ProcessStep number="03" title="Visual Analysis" desc="Instantly generate executive heatmaps and automated charts for policy formulation." icon={Map} isLast={true} />
              </div>
            </div>
            
            <div className="flex-1 w-full relative mt-4 lg:mt-0">
              <div className="relative bg-emerald-600 rounded-2xl sm:rounded-[3.5rem] p-2.5 sm:p-8 shadow-xl sm:rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800 to-transparent opacity-50 rounded-2xl sm:rounded-[3.5rem]" />
                <img 
                  src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800" 
                  alt="Analytics Dashboard Preview" 
                  className="rounded-xl sm:rounded-[2.5rem] shadow-lg relative z-10 w-full h-auto object-cover aspect-[4/3] sm:aspect-auto"
                />
                
                <div className="absolute -bottom-3 right-1 sm:-bottom-10 sm:-right-10 bg-white p-2.5 sm:p-8 rounded-xl sm:rounded-[2rem] shadow-xl z-20 sm:animate-bounce hover:-translate-y-2 transition-transform duration-300">
                  <Activity className="text-emerald-600 mb-1 sm:mb-3 w-4 h-4 sm:w-7 sm:h-7" />
                  <div className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 sm:mb-1">System Pulse</div>
                  <div className="text-sm sm:text-2xl font-black text-slate-900 tracking-tight">OPTIMAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-10 sm:py-24 bg-white relative px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-20">
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 sm:mb-3 block">Core Infrastructure</span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase mb-3 leading-none">System Capabilities</h2>
            <p className="text-slate-500 text-xs sm:text-base font-medium">Enterprise-grade modules engineered specifically for local government units and research institutions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <FeatureCard icon={Users} color="text-blue-600" bg="bg-blue-50" title="Farmer Profiling" desc="Establish complete digital identities including socio-economic backgrounds and generational succession data." />
            <FeatureCard icon={BarChart3} color="text-emerald-600" bg="bg-emerald-50" title="Yield Analytics" desc="Dynamic visual tracking of production volumes across multiple commodity categories." />
            <FeatureCard icon={Globe} color="text-indigo-600" bg="bg-indigo-50" title="Geo-Tagging" desc="Interactive map-based monitoring of agricultural zones to optimize resource distribution." />
            <FeatureCard icon={ShieldCheck} color="text-rose-600" bg="bg-rose-50" title="Secure Registry" desc="Strict role-based access controls and encrypted databases ensuring total constituent privacy." />
            <FeatureCard icon={Activity} color="text-amber-600" bg="bg-amber-50" title="Project Tracking" desc="Monitor the lifecycle, budget, and direct impact of localized agricultural research initiatives." />
            <FeatureCard icon={Sprout} color="text-teal-600" bg="bg-teal-50" title="Knowledge Repo" desc="A collaborative archive of field-tested farming practices, challenges, and success stories." />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-10 sm:py-24 bg-slate-900 text-white overflow-hidden relative px-4">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-500 rounded-full blur-[100px] sm:blur-[150px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-blue-500 rounded-full blur-[100px] sm:blur-[150px]" />
        </div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-20">
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Deployment Setup</span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 uppercase">Service Tiers</h2>
            <p className="text-slate-400 text-xs sm:text-base font-medium max-w-lg mx-auto">Scale the platform architecture according to your administrative reach.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
            <PricingCard 
              title="Cooperative Entry" 
              price="FREE" 
              desc="Perfect for local farmers associations establishing their first digital footprints."
              features={['Up to 100 Farmer Profiles', 'Basic Yield Analytics', 'CSV Data Exports', 'Standard Support']}
            />
            <PricingCard 
              title="Municipal Elite" 
              price="LGU" 
              desc="Full institutional access for comprehensive city-wide agricultural management."
              features={['Unlimited Profiles', 'Geospatial Heatmaps', 'Research Project Hub', 'Priority Security & API', 'Custom Reporting']}
              isFeatured={true}
            />
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="impact" className="py-10 sm:py-24 bg-slate-50 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-8 sm:mb-20">
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 block">Verified Results</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Impact Stories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            <TestimonialCard quote="We now know exactly who needs assistance based on real yield history, eliminating guesswork in our budget." author="Engr. Mateo Cruz" role="Provincial Office" />
            <TestimonialCard quote="Geo-tagging allowed us to process and secure crop insurance for our constituents twice as fast." author="Maria Santos" role="Co-op Manager" />
            <TestimonialCard quote="Clean, readily exported CSV data saves my academic team weeks of manual processing." author="Dr. Alan Rivera" role="Lead Researcher" />
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-10 sm:py-24 bg-white px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <div className="flex justify-center mb-3"><HelpCircle className="text-slate-300 w-6 h-6 sm:w-10 sm:h-10"/></div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Common Queries</h2>
          </div>
          <div className="space-y-2 sm:space-y-4">
            <FAQItem question="Who owns the data in the registry?" answer="The data is exclusively owned by the registering institution (LGU/Cooperative). AgriData acts purely as the secure structural framework and processing layer." />
            <FAQItem question="Does the system support offline mode?" answer="Yes. The system is designed with progressive web app capabilities allowing for delayed sync when doing field encoding in areas with weak cellular signals." />
            <FAQItem question="Is there a limit on how much data we can export?" answer="No. Authorized administrators can perform unlimited, high-speed bulk exports of all regional data for external auditing and processing." />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-8 sm:py-20 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[150px] sm:w-[400px] h-[150px] sm:h-[400px] bg-emerald-500/20 rounded-full blur-[50px] sm:blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[150px] sm:w-[400px] h-[150px] sm:h-[400px] bg-blue-500/20 rounded-full blur-[50px] sm:blur-[100px]" />
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-2xl sm:text-5xl font-black text-white mb-3 sm:mb-6 tracking-tight uppercase leading-[1.1]">Modernize Your <br className="hidden sm:block"/>Data Architecture</h2>
              <p className="text-slate-400 text-xs sm:text-base mb-6 sm:mb-10 font-medium max-w-md mx-auto">Join leading municipalities in upgrading their agricultural intelligence operations.</p>
              <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-[1.25rem] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/40 active:scale-95 hover:bg-emerald-500 sm:hover:scale-105 transition-all">
                Initialize Setup <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-10 sm:pt-16 pb-6 sm:pb-8 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-16 text-center sm:text-left">
            <div className="sm:col-span-2 flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                <div className="p-1.5 sm:p-2 bg-emerald-600 rounded-lg sm:rounded-xl"><Sprout className="text-white w-4 h-4 sm:w-5 sm:h-5" /></div>
                <div className="flex flex-col text-left">
                  <span className="text-base sm:text-lg font-black text-slate-900 uppercase leading-none tracking-tight">AgriData</span>
                  <span className="text-[6px] sm:text-[7px] font-black text-emerald-600 tracking-[0.3em] uppercase mt-0.5">Systems Hub</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-sm font-medium leading-relaxed max-w-xs">Empowering the agricultural sector through secure, efficient, and intelligent administrative frameworks.</p>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <h4 className="font-black text-slate-900 mb-3 sm:mb-5 uppercase tracking-widest text-[9px] sm:text-[10px]">Navigation</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Solutions</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600 transition-colors">Plans</a></li>
                <li><Link to="/login" className="hover:text-emerald-600 transition-colors">Portal Login</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <h4 className="font-black text-slate-900 mb-3 sm:mb-5 uppercase tracking-widest text-[9px] sm:text-[10px]">Security</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Data Compliance</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5 sm:pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">© 2026 AgriData Systems. SECURE PROTOCOL ACTIVE.</p>
            <div className="flex gap-2">
              {['FB', 'TW', 'LI'].map(s => <div key={s} className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 rounded-lg flex items-center justify-center text-[8px] sm:text-[9px] font-black text-slate-400 border border-slate-100 transition-colors cursor-pointer">{s}</div>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function FeatureCard({ icon: Icon, title, desc, color, bg }) {
  return (
    <div className="group p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className={`w-10 h-10 sm:w-14 sm:h-14 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2} />
      </div>
      <h3 className="text-sm sm:text-lg font-black text-slate-900 mb-1.5 sm:mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-[11px] sm:text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessStep({ number, title, desc, icon: Icon, isLast = false }) {
    return (
        <div className="flex gap-3 sm:gap-5 group h-full">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-200 group-hover:border-emerald-500 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shrink-0 text-[10px] sm:text-xs">{number}</div>
                {!isLast && <div className="w-0.5 flex-1 min-h-[16px] bg-slate-100 group-hover:bg-emerald-100 my-1.5 transition-colors duration-500" />}
            </div>
            <div className={`pb-6 sm:pb-10 pt-1`}>
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <Icon className="text-emerald-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs sm:text-base group-hover:text-emerald-600 transition-colors">{title}</h4>
                </div>
                <p className="text-slate-500 text-[11px] sm:text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function PricingCard({ title, price, desc, features, isFeatured = false }) {
    return (
        <div className={`p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full ${isFeatured ? 'bg-emerald-600 border-emerald-500 shadow-2xl lg:scale-105 z-10' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 backdrop-blur-sm'}`}>
            <h3 className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-3 sm:mb-5 ${isFeatured ? 'text-emerald-200' : 'text-slate-400'}`}>{title}</h3>
            <div className="flex items-baseline gap-1.5 mb-4 sm:mb-6">
                <span className="text-3xl sm:text-5xl font-black tracking-tighter">{price}</span>
                {price !== 'LGU' && <span className="text-slate-400 font-bold text-xs sm:text-sm">/mo</span>}
            </div>
            <p className={`text-[11px] sm:text-sm mb-6 sm:mb-8 font-medium leading-relaxed ${isFeatured ? 'text-emerald-50' : 'text-slate-400'}`}>{desc}</p>
            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1 border-t border-white/10 pt-5 sm:pt-6">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[10px] sm:text-sm font-bold tracking-wide">
                        <CheckCircle2 className={`shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFeatured ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span className={isFeatured ? 'text-white' : 'text-slate-200'}>{f}</span>
                    </div>
                ))}
            </div>
            <button className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isFeatured ? 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl shadow-black/10 sm:hover:scale-[1.02]' : 'bg-slate-700 text-white hover:bg-slate-600 sm:hover:scale-[1.02]'}`}>
                {price === 'LGU' ? 'Contact Gov Sales' : 'Start Free Trial'}
            </button>
        </div>
    );
}

function TestimonialCard({ quote, author, role }) {
    return (
        <div className="bg-white p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-emerald-50 rounded-bl-[40px] sm:rounded-bl-[80px] -z-10 group-hover:scale-110 transition-transform duration-500" />
            <MessageSquare className="text-emerald-500/30 mb-4 sm:mb-6 w-5 h-5 sm:w-6 sm:h-6" />
            <p className="text-slate-600 text-[11px] sm:text-sm font-medium italic mb-6 sm:mb-8 leading-relaxed flex-1">"{quote}"</p>
            <div className="border-t border-slate-50 pt-4 sm:pt-5">
                <p className="font-black text-slate-900 uppercase text-[8px] sm:text-[10px] tracking-widest mb-0.5 sm:mb-1">{author}</p>
                <p className="text-emerald-600 font-bold text-[7px] sm:text-[8px] uppercase tracking-widest">{role}</p>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div onClick={() => setIsOpen(!isOpen)} className="bg-white rounded-[1rem] sm:rounded-[1.5rem] border border-slate-100 p-4 sm:p-6 hover:border-emerald-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex justify-between items-center uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                <span className="pr-3 leading-relaxed">{question}</span>
                <div className={`p-1.5 rounded-lg transition-all duration-500 shrink-0 ${isOpen ? 'rotate-45 bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50'}`}>
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
            </h4>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-2.5 sm:mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-slate-500 text-[11px] sm:text-xs font-medium leading-relaxed border-t border-slate-50 pt-2.5 sm:pt-4">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}