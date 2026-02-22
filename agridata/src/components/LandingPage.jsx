import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, ArrowRight, BarChart3, Users, Globe, 
  ShieldCheck, ChevronRight, Activity, Menu, X, 
  CheckCircle2, MessageSquare, HelpCircle,
  Smartphone, Database, Map, Plus, Landmark, 
  Award, Building2, Tractor 
} from 'lucide-react';

// --- Animated Counter for Stats ---
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

  // Format with commas, handle special cases like "1.2" for "1.2M"
  let displayValue = count.toLocaleString('en-US', { maximumFractionDigits: value.includes('.') ? 1 : 0 });
  
  return <>{displayValue}{suffix}</>;
};

// --- Scroll Reveal Hook ---
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

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reveal Refs for Sections
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
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full overflow-x-hidden scroll-smooth flex flex-col relative">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-[1000] transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-white/90 backdrop-blur-md shadow-sm py-2.5 sm:py-4' : 'bg-transparent py-4 sm:py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between relative z-[1001]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2.5 bg-emerald-600 rounded-lg sm:rounded-2xl shadow-lg shadow-emerald-600/30 shrink-0 group hover:scale-105 transition-transform cursor-pointer">
              <Sprout className="text-white w-4 h-4 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-lg sm:text-2xl font-black tracking-tight uppercase leading-none text-slate-900">AgriData</span>
              <span className="text-[7px] sm:text-[10px] font-black text-emerald-600 tracking-[0.2em] sm:tracking-[0.3em] uppercase mt-0.5">Systems Hub</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-emerald-600 hover:-translate-y-0.5 transition-all">Solutions</a>
            <a href="#process" className="hover:text-emerald-600 hover:-translate-y-0.5 transition-all">Process</a>
            <a href="#pricing" className="hover:text-emerald-600 hover:-translate-y-0.5 transition-all">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 hover:-translate-y-0.5 transition-all">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors px-2">Sign In</Link>
            <Link to="/register" className="hidden sm:flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl sm:rounded-[1.25rem] text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group shrink-0">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 transition-colors bg-white shadow-sm border border-slate-100 rounded-md focus:outline-none shrink-0 relative z-[1001]">
              {mobileMenuOpen ? <X className="w-5 h-5 shrink-0" /> : <Menu className="w-5 h-5 shrink-0" />}
            </button>
          </div>
        </div>

        {/* --- FIXED MOBILE MENU OVERLAY --- */}
        <div className={`fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center pt-20 pb-10 gap-4 lg:hidden transition-all duration-300 px-6 ${mobileMenuOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible -translate-y-8 pointer-events-none'}`}>
          <div className="w-full flex flex-col gap-3 mt-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-5 bg-slate-50 rounded-2xl active:scale-95 transition-all">Solutions</a>
              <a href="#process" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-5 bg-slate-50 rounded-2xl active:scale-95 transition-all">Process</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-5 bg-slate-50 rounded-2xl active:scale-95 transition-all">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 w-full text-center py-5 bg-slate-50 rounded-2xl active:scale-95 transition-all">FAQ</a>
          </div>
          <div className="w-12 h-1 bg-slate-100 rounded-full my-4 shrink-0" />
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2 py-4 w-full text-center active:bg-emerald-50 rounded-xl transition-colors">Sign In to Portal</Link>
          <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full max-w-[300px] flex justify-center py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-transform shrink-0">
            Get Started Now
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-28 pb-10 sm:pt-48 sm:pb-32 overflow-hidden px-4 isolate">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-[-20%] w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-emerald-200/50 rounded-full blur-[80px] sm:blur-[160px] -z-10 animate-blob" />
        <div className="absolute bottom-0 left-[-20%] w-[250px] sm:w-[600px] h-[250px] sm:h-[600px] bg-blue-200/40 rounded-full blur-[80px] sm:blur-[160px] -z-10 animate-blob animation-delay-2000" />

        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-1 sm:py-2.5 bg-white border border-emerald-100 rounded-full text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6 sm:mb-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-[280px] sm:max-w-none mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link to="/register" className="w-full sm:w-auto px-5 sm:px-10 py-4 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-[1.25rem] text-[9px] sm:text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 sm:hover:-translate-y-1 transition-all flex items-center justify-center gap-2 sm:gap-3 group">
              <Tractor className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:translate-x-1 transition-transform" /> Join the Registry
            </Link>
            <a href="#features" className="w-full sm:w-auto px-5 sm:px-10 py-4 sm:py-5 bg-white text-slate-600 border border-slate-200 rounded-xl sm:rounded-[1.25rem] text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-emerald-200 active:scale-95 sm:hover:-translate-y-1 transition-all shadow-sm flex items-center justify-center gap-2">
              Explore Features
            </a>
          </div>

          <div className="mt-16 sm:mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto border-t border-slate-200/60 pt-8 sm:pt-14 animate-in fade-in duration-1000 delay-500">
            {[
              { label: 'Registered Farmers', val: '12500', suffix: '+' },
              { label: 'Barangays Covered', val: '48', suffix: '' },
              { label: 'Data Points', val: '1.2', suffix: 'M' },
              { label: 'System Uptime', val: '99.9', suffix: '%' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group p-2 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 rounded-3xl transition-all duration-500">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter group-hover:scale-110 group-hover:text-emerald-600 transition-all duration-500">
                  <AnimatedCounter value={stat.val} suffix={stat.suffix} />
                </div>
                <div className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 sm:mt-3 group-hover:text-slate-600 transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- PARTNERS SECTION --- */}
      <section className="py-6 sm:py-16 bg-white border-y border-slate-100 relative z-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 overflow-hidden">
          <p className="text-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 sm:mb-10">Powering Regional Progress Alongside</p>
          <div className="flex flex-row flex-wrap justify-center items-center gap-x-6 gap-y-4 sm:gap-20 opacity-70 sm:opacity-40 sm:grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-black text-slate-900 tracking-tighter text-sm sm:text-xl uppercase hover:text-emerald-600 transition-colors cursor-default"><Landmark className="text-emerald-600 w-4 h-4 sm:w-6 sm:h-6 shrink-0"/> LGU Laguna</div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-black text-slate-900 tracking-tighter text-sm sm:text-xl uppercase hover:text-emerald-600 transition-colors cursor-default"><Award className="text-emerald-600 w-4 h-4 sm:w-6 sm:h-6 shrink-0"/> DAR Phil</div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-black text-slate-900 tracking-tighter text-sm sm:text-xl uppercase hover:text-emerald-600 transition-colors cursor-default"><Building2 className="text-emerald-600 w-4 h-4 sm:w-6 sm:h-6 shrink-0"/> DOST Reg IV-A</div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="process" className="py-12 sm:py-24 overflow-hidden relative px-4">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
            <div ref={processRef} className={`flex-1 space-y-6 sm:space-y-8 text-center lg:text-left w-full transition-all duration-1000 ${processVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
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
            
            <div className={`flex-1 w-full relative mt-4 lg:mt-0 transition-all duration-1000 delay-300 ${processVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative bg-emerald-600 rounded-2xl sm:rounded-[3.5rem] p-2.5 sm:p-8 shadow-2xl sm:rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800 to-transparent opacity-50 rounded-2xl sm:rounded-[3.5rem]" />
                <img 
                  src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800" 
                  alt="Analytics Dashboard Preview" 
                  className="rounded-xl sm:rounded-[2.5rem] shadow-lg relative z-10 w-full h-auto object-cover aspect-[4/3] sm:aspect-auto"
                />
                
                <div className="absolute -bottom-4 -right-2 sm:-bottom-10 sm:-right-10 bg-white p-3 sm:p-8 rounded-xl sm:rounded-[2rem] shadow-2xl z-20 animate-float hover:scale-110 transition-transform duration-300 cursor-default border border-slate-100">
                  <Activity className="text-emerald-600 mb-1.5 sm:mb-3 w-5 h-5 sm:w-8 sm:h-8 shrink-0" />
                  <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 sm:mb-1">System Pulse</div>
                  <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">OPTIMAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-12 sm:py-24 bg-white relative px-4 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto">
          <div ref={featuresRef} className={`text-center max-w-3xl mx-auto mb-10 sm:mb-20 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 sm:mb-3 block">Core Infrastructure</span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase mb-3 leading-none">System Capabilities</h2>
            <p className="text-slate-500 text-xs sm:text-base font-medium">Enterprise-grade modules engineered specifically for local government units and research institutions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard icon={Users} color="text-blue-600" bg="bg-blue-50" title="Farmer Profiling" desc="Establish complete digital identities including socio-economic backgrounds and generational succession data." delay="100" visible={featuresVisible} />
            <FeatureCard icon={BarChart3} color="text-emerald-600" bg="bg-emerald-50" title="Yield Analytics" desc="Dynamic visual tracking of production volumes across multiple commodity categories." delay="200" visible={featuresVisible} />
            <FeatureCard icon={Globe} color="text-indigo-600" bg="bg-indigo-50" title="Geo-Tagging" desc="Interactive map-based monitoring of agricultural zones to optimize resource distribution." delay="300" visible={featuresVisible} />
            <FeatureCard icon={ShieldCheck} color="text-rose-600" bg="bg-rose-50" title="Secure Registry" desc="Strict role-based access controls and encrypted databases ensuring total constituent privacy." delay="400" visible={featuresVisible} />
            <FeatureCard icon={Activity} color="text-amber-600" bg="bg-amber-50" title="Project Tracking" desc="Monitor the lifecycle, budget, and direct impact of localized agricultural research initiatives." delay="500" visible={featuresVisible} />
            <FeatureCard icon={Sprout} color="text-teal-600" bg="bg-teal-50" title="Knowledge Repo" desc="A collaborative archive of field-tested farming practices, challenges, and success stories." delay="600" visible={featuresVisible} />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" ref={pricingRef} className="py-12 sm:py-24 bg-slate-900 text-white overflow-hidden relative px-4">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-500 rounded-full blur-[100px] sm:blur-[150px] animate-blob" />
          <div className="absolute bottom-[10%] left-[10%] w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-blue-500 rounded-full blur-[100px] sm:blur-[150px] animate-blob animation-delay-2000" />
        </div>
        <div className={`max-w-[1400px] mx-auto relative z-10 transition-all duration-1000 ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-10 sm:mb-20">
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Deployment Setup</span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 uppercase">Service Tiers</h2>
            <p className="text-slate-400 text-xs sm:text-base font-medium max-w-lg mx-auto">Scale the platform architecture according to your administrative reach.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
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
      <section id="impact" ref={impactRef} className="py-12 sm:py-24 bg-slate-50 px-4">
        <div className={`max-w-[1400px] mx-auto transition-all duration-1000 ${impactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-10 sm:mb-20">
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 block">Verified Results</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Impact Stories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <TestimonialCard quote="We now know exactly who needs assistance based on real yield history, eliminating guesswork in our budget." author="Engr. Mateo Cruz" role="Provincial Office" delay="100" />
            <TestimonialCard quote="Geo-tagging allowed us to process and secure crop insurance for our constituents twice as fast." author="Maria Santos" role="Co-op Manager" delay="200" />
            <TestimonialCard quote="Clean, readily exported CSV data saves my academic team weeks of manual processing." author="Dr. Alan Rivera" role="Lead Researcher" delay="300" />
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" ref={faqRef} className="py-12 sm:py-24 bg-white px-4 border-t border-slate-100">
        <div className={`max-w-3xl mx-auto transition-all duration-1000 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-10 sm:mb-16">
            <div className="flex justify-center mb-3"><HelpCircle className="text-slate-300 w-8 h-8 sm:w-10 sm:h-10 shrink-0"/></div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Common Queries</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <FAQItem question="Who owns the data in the registry?" answer="The data is exclusively owned by the registering institution (LGU/Cooperative). AgriData acts purely as the secure structural framework and processing layer." />
            <FAQItem question="Does the system support offline mode?" answer="Yes. The system is designed with progressive web app capabilities allowing for delayed sync when doing field encoding in areas with weak cellular signals." />
            <FAQItem question="Is there a limit on how much data we can export?" answer="No. Authorized administrators can perform unlimited, high-speed bulk exports of all regional data for external auditing and processing." />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-10 sm:py-20 px-4 bg-white relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-20 text-center relative overflow-hidden shadow-2xl hover:shadow-emerald-900/20 transition-shadow duration-700">
            <div className="absolute top-0 right-0 w-[150px] sm:w-[400px] h-[150px] sm:h-[400px] bg-emerald-500/20 rounded-full blur-[50px] sm:blur-[100px] animate-blob" />
            <div className="absolute bottom-0 left-0 w-[150px] sm:w-[400px] h-[150px] sm:h-[400px] bg-blue-500/20 rounded-full blur-[50px] sm:blur-[100px] animate-blob animation-delay-2000" />
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tight uppercase leading-[1.1]">Modernize Your <br className="hidden sm:block"/>Data Architecture</h2>
              <p className="text-slate-400 text-sm sm:text-base mb-8 sm:mb-10 font-medium max-w-md mx-auto">Join leading municipalities in upgrading their agricultural intelligence operations.</p>
              <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-12 py-4 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-[1.25rem] font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/40 active:scale-95 hover:bg-emerald-500 sm:hover:scale-105 transition-all shrink-0">
                Initialize Setup <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-10 sm:pt-16 pb-6 sm:pb-8 px-4 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-16 text-center sm:text-left">
            <div className="sm:col-span-2 flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 cursor-default">
                <div className="p-1.5 sm:p-2 bg-emerald-600 rounded-lg sm:rounded-xl shrink-0"><Sprout className="text-white w-4 h-4 sm:w-5 sm:h-5 shrink-0" /></div>
                <div className="flex flex-col text-left">
                  <span className="text-base sm:text-lg font-black text-slate-900 uppercase leading-none tracking-tight">AgriData</span>
                  <span className="text-[6px] sm:text-[7px] font-black text-emerald-600 tracking-[0.3em] uppercase mt-0.5">Systems Hub</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-sm font-medium leading-relaxed max-w-xs">Empowering the agricultural sector through secure, efficient, and intelligent administrative frameworks.</p>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <h4 className="font-black text-slate-900 mb-4 sm:mb-5 uppercase tracking-widest text-[9px] sm:text-[10px]">Navigation</h4>
              <ul className="space-y-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <li><a href="#features" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">Solutions</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">Plans</a></li>
                <li><Link to="/login" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">Portal Login</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <h4 className="font-black text-slate-900 mb-4 sm:mb-5 uppercase tracking-widest text-[9px] sm:text-[10px]">Security</h4>
              <ul className="space-y-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <li><a href="#" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">Data Compliance</a></li>
                <li><a href="#" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 sm:pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">© 2026 AgriData Systems. SECURE PROTOCOL ACTIVE.</p>
            <div className="flex gap-2">
              {['FB', 'TW', 'LI'].map(s => <div key={s} className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-400 border border-slate-100 hover:-translate-y-1 transition-all cursor-pointer shadow-sm">{s}</div>)}
            </div>
          </div>
        </div>
      </footer>

      {/* Global Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}} />
    </div>
  );
}

// --- HELPER COMPONENTS ---

function FeatureCard({ icon: Icon, title, desc, color, bg, visible, delay }) {
  return (
    <div 
      style={{ transitionDelay: `${delay}ms` }}
      className={`group p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shrink-0`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" strokeWidth={2} />
      </div>
      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 sm:mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessStep({ number, title, desc, icon: Icon, isLast = false }) {
    return (
        <div className="flex gap-4 sm:gap-6 group h-full">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-200 group-hover:border-emerald-500 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shrink-0 text-xs sm:text-sm shadow-sm group-hover:shadow-emerald-500/30">{number}</div>
                {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-slate-100 group-hover:bg-emerald-100 my-2 transition-colors duration-500 shrink-0" />}
            </div>
            <div className={`pb-8 sm:pb-12 pt-1 sm:pt-2`}>
                <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                    <Icon className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm sm:text-lg group-hover:text-emerald-600 transition-colors">{title}</h4>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function PricingCard({ title, price, desc, features, isFeatured = false }) {
    return (
        <div className={`p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full hover:-translate-y-2 ${isFeatured ? 'bg-emerald-600 border-emerald-500 shadow-2xl lg:scale-105 z-10 shadow-emerald-900/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 backdrop-blur-sm'}`}>
            <h3 className={`text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] mb-4 sm:mb-5 ${isFeatured ? 'text-emerald-200' : 'text-slate-400'}`}>{title}</h3>
            <div className="flex items-baseline gap-2 mb-5 sm:mb-6">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter">{price}</span>
                {price !== 'LGU' && <span className="text-slate-400 font-bold text-sm sm:text-base">/mo</span>}
            </div>
            <p className={`text-xs sm:text-sm mb-8 sm:mb-10 font-medium leading-relaxed ${isFeatured ? 'text-emerald-50' : 'text-slate-400'}`}>{desc}</p>
            <div className="space-y-4 sm:space-y-5 mb-10 sm:mb-12 flex-1 border-t border-white/10 pt-6 sm:pt-8">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-bold tracking-wide">
                        <CheckCircle2 className={`shrink-0 w-4 h-4 sm:w-5 sm:h-5 ${isFeatured ? 'text-emerald-300' : 'text-emerald-500'}`} />
                        <span className={isFeatured ? 'text-white' : 'text-slate-200'}>{f}</span>
                    </div>
                ))}
            </div>
            <button className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest transition-all active:scale-95 shrink-0 ${isFeatured ? 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl shadow-black/10 sm:hover:scale-[1.02]' : 'bg-slate-700 text-white hover:bg-slate-600 sm:hover:scale-[1.02]'}`}>
                {price === 'LGU' ? 'Contact Gov Sales' : 'Start Free Trial'}
            </button>
        </div>
    );
}

function TestimonialCard({ quote, author, role, delay }) {
    return (
        <div style={{ transitionDelay: `${delay}ms` }} className="bg-white p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-emerald-50 rounded-bl-[40px] sm:rounded-bl-[80px] -z-10 group-hover:scale-125 transition-transform duration-700" />
            <MessageSquare className="text-emerald-500/30 mb-5 sm:mb-8 w-6 h-6 sm:w-8 sm:h-8 shrink-0 group-hover:text-emerald-500/50 transition-colors" />
            <p className="text-slate-600 text-xs sm:text-sm font-medium italic mb-8 sm:mb-10 leading-relaxed flex-1">"{quote}"</p>
            <div className="border-t border-slate-50 pt-5 sm:pt-6">
                <p className="font-black text-slate-900 uppercase text-[9px] sm:text-[11px] tracking-widest mb-1 sm:mb-1.5">{author}</p>
                <p className="text-emerald-600 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest">{role}</p>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div onClick={() => setIsOpen(!isOpen)} className={`bg-white rounded-[1.25rem] sm:rounded-[2rem] border p-5 sm:p-8 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md ${isOpen ? 'border-emerald-200' : 'border-slate-100 hover:border-emerald-100'}`}>
            <h4 className="font-black text-slate-900 text-sm sm:text-base flex justify-between items-center uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                <span className="pr-4 leading-relaxed">{question}</span>
                <div className={`p-2 rounded-xl transition-all duration-500 shrink-0 ${isOpen ? 'rotate-45 bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50'}`}>
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                </div>
            </h4>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-3 sm:mt-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed border-t border-slate-50 pt-3 sm:pt-5">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}