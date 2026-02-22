import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, ArrowRight, BarChart3, Users, Globe, 
  ShieldCheck, ChevronRight, Activity, Menu, X, 
  CheckCircle2, MessageSquare, HelpCircle,
  Smartphone, Database, Map, Plus, Landmark, 
  Award, Building2, Tractor, ArrowUpRight 
} from 'lucide-react';

/* ============================= */
/* ===== ANIMATED COUNTER ====== */
/* ============================= */

const AnimatedCounter = ({ value, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const endValue = parseFloat(value.replace(/,/g, '')) || 0;
    
    if (endValue === 0) return;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      setCount(endValue * easeProgress);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  let displayValue = count.toLocaleString('en-US', { 
    maximumFractionDigits: value.includes('.') ? 1 : 0 
  });
  
  return <>{displayValue}{suffix}</>;
};

/* ============================= */
/* ===== SCROLL REVEAL HOOK ==== */
/* ============================= */

const useScrollReveal = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return [ref, isVisible];
};

/* ============================= */
/* ========= MAIN PAGE ========= */
/* ============================= */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [featuresRef, featuresVisible] = useScrollReveal();
  const [processRef, processVisible] = useScrollReveal();
  const [pricingRef, pricingVisible] = useScrollReveal();
  const [impactRef, impactVisible] = useScrollReveal();
  const [faqRef, faqVisible] = useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full overflow-x-hidden scroll-smooth flex flex-col relative">
      
      {/* --- ENTERPRISE NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-[1000] transition-all duration-300 border-b ${scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-4'}`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between relative z-[1001]">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="p-1.5 bg-emerald-600 rounded-lg shadow-sm shrink-0">
              <Sprout className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none uppercase">AgriData</span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mt-0.5">Systems</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Solutions</a>
            <a href="#process" className="hover:text-emerald-600 transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-[11px] font-bold uppercase text-slate-600 hover:text-slate-900 transition-colors px-2">Sign In</Link>
            <Link to="/register" className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm group shrink-0">
              Get Started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-lg focus:outline-none shrink-0 relative z-[1001]">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU OVERLAY --- */}
        <div className={`fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center gap-3 md:hidden transition-all duration-300 px-6 ${mobileMenuOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible -translate-y-8 pointer-events-none'}`}>
          <div className="w-full flex flex-col gap-2 mt-4 max-w-sm">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-4 bg-slate-50 rounded-xl transition-all">Solutions</a>
              <a href="#process" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-4 bg-slate-50 rounded-xl transition-all">Architecture</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-4 bg-slate-50 rounded-xl transition-all">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-4 bg-slate-50 rounded-xl transition-all">Docs</a>
          </div>
          <div className="w-full h-px bg-slate-100 my-4 max-w-sm shrink-0" />
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold uppercase text-slate-600 mb-2 py-3 w-full max-w-sm text-center hover:bg-slate-50 rounded-lg transition-colors">Sign In to Portal</Link>
          <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full max-w-sm flex justify-center py-4 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md active:scale-95 transition-transform shrink-0 mt-1">
            Get Started Now
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-12 sm:pt-40 sm:pb-20 px-4 isolate bg-white border-b border-slate-200">
        <div className="absolute inset-0 z-[-1] bg-grid-slate-100/[0.8] bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }} />
        
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Next Gen Agricultural Intelligence
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 uppercase">
            Cultivating Data. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Harvesting Insights.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-500 font-medium leading-relaxed mb-8">
            A centralized registry system engineered for local governments. Securely manage farmer profiles, track geospatial crop yields, and generate definitive regional analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[280px] sm:max-w-none mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
            <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
              Initialize Platform <ArrowUpRight className="w-4 h-4 shrink-0" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
              Explore Architecture
            </a>
          </div>

          <div className="mt-12 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto border-t border-slate-100 pt-8 sm:pt-12 animate-in fade-in duration-1000 delay-500">
            {[
              { label: 'Registered Profiles', val: '12500', suffix: '+' },
              { label: 'Barangays Covered', val: '48', suffix: '' },
              { label: 'Data Points Logged', val: '1.2', suffix: 'M' },
              { label: 'System Uptime', val: '99.9', suffix: '%' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  <AnimatedCounter value={stat.val} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- PARTNERS SECTION --- */}
      <section className="py-6 bg-slate-50 border-b border-slate-200 relative z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 overflow-hidden">
          <p className="text-center text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">Trusted by regional authorities</p>
          <div className="flex flex-row flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800 text-xs sm:text-base cursor-default"><Landmark size={18} className="text-slate-600 shrink-0"/> LGU Laguna</div>
            <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800 text-xs sm:text-base cursor-default"><Award size={18} className="text-slate-600 shrink-0"/> DAR Phil</div>
            <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800 text-xs sm:text-base cursor-default"><Building2 size={18} className="text-slate-600 shrink-0"/> DOST</div>
          </div>
        </div>
      </section>

      {/* --- SYSTEM WORKFLOW SECTION --- */}
      <section id="process" className="py-16 sm:py-24 overflow-hidden relative px-4 bg-white">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div ref={processRef} className={`flex-1 space-y-6 text-center lg:text-left w-full transition-all duration-1000 ${processVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 mb-2 block uppercase tracking-widest">Deployment Pipeline</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">Streamlined Data Integration</h2>
                <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">Transform fragmented fieldwork into cohesive, institutional intelligence with minimal onboarding friction.</p>
              </div>
              
              <div className="text-left max-w-xs mx-auto lg:mx-0 w-full flex flex-col pt-4">
                <ProcessStep number="01" title="Digital Enrollment" desc="Onboard farmers via mobile-optimized interfaces designed for rapid field deployment." icon={Smartphone} />
                <ProcessStep number="02" title="Centralized Registry" desc="Safely compile yield data, socio-economic logs, and territorial markers in an encrypted vault." icon={Database} />
                <ProcessStep number="03" title="Visual Analysis" desc="Instantly generate executive heatmaps and automated CSV reports for policy formulation." icon={Map} isLast={true} />
              </div>
            </div>
            
            <div className={`flex-1 w-full relative mt-8 lg:mt-0 transition-all duration-1000 delay-300 ${processVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative bg-slate-100 rounded-2xl p-2 border border-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800" 
                  alt="Analytics Dashboard Preview" 
                  className="rounded-xl shadow-md relative z-10 w-full h-auto object-cover aspect-[4/3] sm:aspect-[16/10]"
                />
                <div className="absolute -bottom-3 -right-2 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-5 rounded-xl shadow-xl z-20 border border-slate-100 flex items-center gap-3 animate-float">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Activity className="text-emerald-600 w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">System Status</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Fully Operational
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CAPABILITIES SECTION --- */}
      <section id="features" className="py-16 sm:py-20 bg-slate-50 relative px-4 border-t border-slate-200">
        <div className="max-w-[1200px] mx-auto">
          <div ref={featuresRef} className={`text-center max-w-2xl mx-auto mb-10 sm:mb-16 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-[10px] font-bold text-blue-600 mb-2 block uppercase tracking-widest">Core Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3 uppercase">Enterprise Capabilities</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Modular tools engineered for local government units and agricultural research institutions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <FeatureCard icon={Users} title="Farmer Profiling" desc="Establish complete digital identities including socio-economic backgrounds and generational succession data." delay="100" visible={featuresVisible} />
            <FeatureCard icon={BarChart3} title="Yield Analytics" desc="Dynamic visual tracking of production volumes across multiple commodity categories." delay="150" visible={featuresVisible} />
            <FeatureCard icon={Globe} title="Geo-Tagging" desc="Interactive map-based monitoring of agricultural zones to optimize resource distribution." delay="200" visible={featuresVisible} />
            <FeatureCard icon={ShieldCheck} title="Secure Registry" desc="Strict role-based access controls and encrypted databases ensuring total constituent privacy." delay="250" visible={featuresVisible} />
            <FeatureCard icon={Activity} title="Project Tracking" desc="Monitor the lifecycle, budget, and direct impact of localized agricultural research initiatives." delay="300" visible={featuresVisible} />
            <FeatureCard icon={Sprout} title="Knowledge Repo" desc="A collaborative archive of field-tested farming practices, challenges, and success stories." delay="350" visible={featuresVisible} />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" ref={pricingRef} className="py-16 sm:py-20 bg-slate-900 text-white relative px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-700/[0.05] bg-[center_top_-1px]" />
        <div className={`max-w-[1000px] mx-auto relative z-10 transition-all duration-1000 ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[10px] font-bold text-emerald-400 mb-2 block uppercase tracking-widest">Flexible Licensing</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 uppercase">Service Tiers</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-sm mx-auto">Scale the platform architecture according to your administrative reach and budget.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
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
      <section id="impact" ref={impactRef} className="py-16 sm:py-20 bg-white px-4 border-b border-slate-100">
        <div className={`max-w-[1200px] mx-auto transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[10px] font-bold text-emerald-600 mb-2 block uppercase tracking-widest">Verified Impact</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">Institutional Success</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TestimonialCard quote="We now know exactly who needs assistance based on real yield history, eliminating guesswork in our budget." author="Engr. Mateo Cruz" role="Provincial Office" delay="100" />
            <TestimonialCard quote="Geo-tagging allowed us to process and secure crop insurance for our constituents twice as fast." author="Maria Santos" role="Co-op Manager" delay="200" />
            <TestimonialCard quote="Clean, readily exported CSV data saves my academic team weeks of manual processing." author="Dr. Alan Rivera" role="Lead Researcher" delay="300" />
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" ref={faqRef} className="py-16 sm:py-20 bg-slate-50 px-4">
        <div className={`max-w-2xl mx-auto transition-all duration-1000 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3"><HelpCircle className="text-slate-300 w-8 h-8 sm:w-10 sm:h-10 shrink-0"/></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase leading-none">Technical Queries</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <FAQItem question="Who retains ownership of the registry data?" answer="Data sovereignty is guaranteed. The records are exclusively owned by the registering institution (LGU/Cooperative). AgriData operates strictly as the secure framework." />
            <FAQItem question="Is offline field encoding supported?" answer="Yes. The system utilizes progressive web app standards, allowing enumerators to log profiles without connectivity and sync automatically when returning online." />
            <FAQItem question="Are there limits on data exportation?" answer="No. Authorized administrators possess unrestricted rights to execute high-speed CSV exports of the entire regional database for independent auditing." />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-12 sm:py-16 px-4 bg-white relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-slate-900 rounded-2xl p-8 sm:p-14 text-center relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 z-0 bg-grid-slate-700/[0.1] bg-[bottom_1px_center]" />
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight uppercase leading-tight">Modernize Your <br className="hidden sm:block"/>Data Infrastructure</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 font-medium max-w-sm mx-auto">Join leading municipalities in upgrading their agricultural intelligence operations today.</p>
              <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shrink-0">
                Initialize Setup <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-10 pb-6 px-4 relative z-10">
        <div className="max-w-[1200px] mx-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900 rounded-md shrink-0"><Sprout className="text-white w-4 h-4 shrink-0" /></div>
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none">AgriData Systems</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Institutional Registry. Secure Protocol Active.</p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'GitHub'].map(s => <div key={s} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 cursor-pointer">{s}</div>)}
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bg-grid-slate-100 { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23f1f5f9'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E"); }
        .bg-grid-slate-700 { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E"); }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}} />
    </div>
  );
}

/* ============================= */
/* ===== HELPER COMPONENTS ===== */
/* ============================= */

function FeatureCard({ icon: Icon, title, desc, visible, delay }) {
  return (
    <div 
      style={{ transitionDelay: `${delay}ms` }}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-4 h-4 text-slate-700 shrink-0" strokeWidth={2} />
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1.5 tracking-tight uppercase">{title}</h3>
      <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessStep({ number, title, desc, icon: Icon, isLast = false }) {
  return (
    <div className="flex gap-4 group h-full">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">{number}</div>
        {!isLast && <div className="w-px flex-1 min-h-[16px] bg-slate-200 my-1.5 shrink-0" />}
      </div>
      <div className="pb-6 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="text-slate-400 w-3.5 h-3.5 shrink-0" />
          <h4 className="font-bold text-slate-900 tracking-tight text-sm uppercase">{title}</h4>
        </div>
        <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, desc, features, isFeatured = false }) {
  return (
    <div className={`p-6 sm:p-8 rounded-xl border transition-all duration-300 flex flex-col h-full ${isFeatured ? 'bg-white border-slate-200 shadow-lg lg:scale-105' : 'bg-slate-800 border-slate-700'}`}>
      <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isFeatured ? 'text-emerald-600' : 'text-slate-400'}`}>{title}</h3>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className={`text-3xl font-extrabold tracking-tight ${isFeatured ? 'text-slate-900' : 'text-white'}`}>{price}</span>
        {price !== 'LGU' && <span className={`font-semibold text-xs ${isFeatured ? 'text-slate-500' : 'text-slate-400'}`}>/mo</span>}
      </div>
      <p className={`text-xs mb-6 font-medium leading-relaxed ${isFeatured ? 'text-slate-600' : 'text-slate-400'}`}>{desc}</p>
      <div className={`space-y-3 mb-6 flex-1 border-t pt-5 ${isFeatured ? 'border-slate-100' : 'border-slate-700'}`}>
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 size={14} className={`shrink-0 ${isFeatured ? 'text-emerald-500' : 'text-slate-500'}`} />
            <span className={isFeatured ? 'text-slate-700' : 'text-slate-300'}>{f}</span>
          </div>
        ))}
      </div>
      <button className={`w-full py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shrink-0 ${isFeatured ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
        {price === 'LGU' ? 'Contact Sales' : 'Select Plan'}
      </button>
    </div>
  );
}

function TestimonialCard({ quote, author, role, delay }) {
  return (
    <div style={{ transitionDelay: `${delay}ms` }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-100 transition-all duration-500 flex flex-col h-full">
      <MessageSquare className="text-slate-100 mb-4 w-5 h-5 shrink-0" />
      <p className="text-slate-600 text-xs font-medium leading-relaxed flex-1 italic">"{quote}"</p>
      <div className="mt-5 pt-5 border-t border-slate-50">
        <p className="font-bold text-slate-900 text-xs uppercase tracking-tight">{author}</p>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{role}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div onClick={() => setIsOpen(!isOpen)} className="bg-white rounded-xl border border-slate-200 p-4 transition-all duration-300 cursor-pointer hover:border-slate-300 shadow-sm">
      <h4 className="font-bold text-slate-900 text-xs flex justify-between items-center uppercase tracking-tight">
        <span className="pr-4 leading-relaxed">{question}</span>
        <div className={`p-1 rounded-md transition-all duration-300 shrink-0 ${isOpen ? 'bg-slate-100 rotate-45' : 'text-slate-400'}`}>
          <Plus className="w-3.5 h-3.5 shrink-0" />
        </div>
      </h4>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-2 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="text-slate-500 text-xs font-medium leading-relaxed pt-2">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}