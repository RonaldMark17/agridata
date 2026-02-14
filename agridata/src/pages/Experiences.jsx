import React, { useState, useEffect } from 'react';
import { experiencesAPI, farmersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Calendar, MapPin, User, Plus, X, 
  Trophy, AlertTriangle, Lightbulb, Sprout, Landmark, Pin,
  ChevronLeft, ChevronRight, Activity, Filter, Info, Loader2
} from 'lucide-react';

// --- Skeleton Component (Dark Mode Compatible) ---
const ExperienceSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-[#0b241f] rounded-[2rem] border border-slate-100 dark:border-white/5 p-8 animate-pulse shadow-sm">
        <div className="flex justify-between mb-6">
          <div className="h-14 w-14 bg-slate-100 dark:bg-white/5 rounded-2xl"></div>
          <div className="h-6 w-24 bg-slate-50 dark:bg-white/5 rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded-lg mb-4"></div>
        <div className="space-y-3 mb-8">
          <div className="h-3 w-full bg-slate-50 dark:bg-white/5 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-50 dark:bg-white/5 rounded"></div>
        </div>
        <div className="pt-6 border-t border-slate-50 dark:border-white/5 space-y-4">
          <div className="h-3 w-1/2 bg-slate-100 dark:bg-white/5 rounded"></div>
          <div className="h-3 w-1/3 bg-slate-100 dark:bg-white/5 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(['admin', 'researcher', 'data_encoder']);

  const initialFormState = {
    farmer_id: '',
    experience_type: 'Success Story',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    location: '',
    context: '',
    impact_level: 'Medium'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchExperiences();
    fetchFarmers();
  }, [currentPage]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const response = await experiencesAPI.getAll({ page: currentPage });
      setExperiences(response.data.experiences);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await farmersAPI.getAll({ per_page: 1000 });
      setFarmers(response.data.farmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const handleFarmerChange = (e) => {
    const selectedId = e.target.value;
    const selectedFarmer = farmers.find(f => f.id.toString() === selectedId);
    let autoLocation = '';
    if (selectedFarmer && selectedFarmer.barangay) {
      autoLocation = `${selectedFarmer.barangay.name}, ${selectedFarmer.barangay.municipality}`;
    }
    setFormData({ ...formData, farmer_id: selectedId, location: autoLocation });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await experiencesAPI.create(formData);
      setShowModal(false);
      fetchExperiences();
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error creating experience:', error);
    }
  };

  const getTypeStyles = (type) => {
    const styles = {
      'Success Story': { icon: Trophy, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
      'Challenge': { icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' },
      'Innovation': { icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
      'Farming Practice': { icon: Sprout, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20' },
      'Cultural Tradition': { icon: Landmark, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' },
      'Other': { icon: Pin, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', border: 'border-slate-200 dark:border-white/10' }
    };
    return styles[type] || styles['Other'];
  };

  const filteredExperiences = activeTab === 'All' 
    ? experiences 
    : experiences.filter(exp => exp.experience_type === activeTab);

  const tabs = ['All', 'Success Story', 'Challenge', 'Innovation', 'Farming Practice', 'Cultural Tradition'];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                <BookOpen size={18} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">Knowledge Repository</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Field Experiences</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">A collective intelligence hub of local farming wisdom.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {canCreate && (
              <button 
                onClick={() => setShowModal(true)} 
                className="group flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Record New Experience</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="bg-white dark:bg-[#0b241f] p-2 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-x-auto no-scrollbar mx-2">
          <nav className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px] px-2">
          {loading ? (
            <ExperienceSkeleton />
          ) : filteredExperiences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#0b241f] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/10 mx-2">
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full text-slate-200 dark:text-slate-700 mb-6">
                <Info size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">No Experiences Found</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium mt-2">Try switching categories or record a new entry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {filteredExperiences.map((exp) => {
                const style = getTypeStyles(exp.experience_type);
                const Icon = style.icon;
                return (
                  <div key={exp.id} className="group bg-white dark:bg-[#0b241f] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                    {/* Background Decorative Element */}
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${style.bg} opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-3xl`} />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className={`p-4 rounded-[1.25rem] ${style.bg} ${style.color} shadow-inner transition-transform duration-500 group-hover:scale-110`}>
                        <Icon size={28} />
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        exp.impact_level === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' :
                        exp.impact_level === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' :
                        'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'
                      }`}>
                        {exp.impact_level} Impact
                      </span>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight line-clamp-2">
                        {exp.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-4 relative">
                        <span className="text-emerald-300 dark:text-emerald-500/30 text-3xl absolute -left-4 -top-2 opacity-50 font-serif">"</span>
                        {exp.description}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-slate-50 dark:border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                          <User size={14} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{exp.farmer_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                        <MapPin size={14} className="shrink-0" />
                        <span className="text-xs font-semibold truncate">{exp.location || 'Remote Location'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                        <Calendar size={14} className="shrink-0" />
                        <span className="text-xs font-semibold">{new Date(exp.date_recorded).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-[#0b241f] px-8 py-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm mx-2 mb-10">
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Showing Page <span className="text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="p-3 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="p-3 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* MODAL - REDESIGNED FOR DARK MODE */}
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-white dark:bg-[#041d18] rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border dark:border-white/5">
              
              <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#041d18] shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Record Field Knowledge</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">Capture insights directly from the field.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-slate-400 dark:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Involved Farmer</label>
                    <select className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-inner appearance-none" value={formData.farmer_id} onChange={handleFarmerChange} required>
                      <option value="" className="dark:bg-[#041d18]">Choose Farmer...</option>
                      {farmers.map((f) => (<option key={f.id} value={f.id} className="dark:bg-[#041d18]">{f.full_name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Experience Type</label>
                    <select className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-inner appearance-none" value={formData.experience_type} onChange={(e) => setFormData({ ...formData, experience_type: e.target.value })} required>
                      <option value="Success Story" className="dark:bg-[#041d18]">Success Story</option>
                      <option value="Challenge" className="dark:bg-[#041d18]">Challenge</option>
                      <option value="Innovation" className="dark:bg-[#041d18]">Innovation</option>
                      <option value="Farming Practice" className="dark:bg-[#041d18]">Farming Practice</option>
                      <option value="Cultural Tradition" className="dark:bg-[#041d18]">Cultural Tradition</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Headline / Title</label>
                  <input type="text" placeholder="e.g., Breakthrough Organic Pest Control Method" className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-inner outline-none" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Detailed Narrative</label>
                  <textarea rows={5} placeholder="Describe the experience in detail..." className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm font-medium dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 shadow-inner outline-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Event Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-inner outline-none" value={formData.date_recorded} onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Impact Level</label>
                    <select className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-inner appearance-none" value={formData.impact_level} onChange={(e) => setFormData({ ...formData, impact_level: e.target.value })}>
                      <option value="Low" className="dark:bg-[#041d18]">Low</option>
                      <option value="Medium" className="dark:bg-[#041d18]">Medium</option>
                      <option value="High" className="dark:bg-[#041d18]">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Specific Location</label>
                    <input type="text" placeholder="Brgy/Sitio..." className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-inner outline-none" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                </div>

                <div className="pt-8 flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-slate-50 dark:border-white/5">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Discard Draft</button>
                  <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#041d18] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 active:scale-95 transition-all">Submit Knowledge Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}