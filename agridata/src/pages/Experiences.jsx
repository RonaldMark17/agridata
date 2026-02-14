import React, { useState, useEffect } from 'react';
import { experiencesAPI, farmersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Calendar, MapPin, User, Plus, X, 
  Trophy, AlertTriangle, Lightbulb, Sprout, Landmark, Pin,
  ChevronLeft, ChevronRight, Activity, Filter, Info
} from 'lucide-react';

// --- Skeleton Component ---
const ExperienceSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 animate-pulse shadow-sm">
        <div className="flex justify-between mb-6">
          <div className="h-14 w-14 bg-slate-100 rounded-2xl"></div>
          <div className="h-6 w-24 bg-slate-50 rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-100 rounded-lg mb-4"></div>
        <div className="space-y-3 mb-8">
          <div className="h-3 w-full bg-slate-50 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
        </div>
        <div className="pt-6 border-t border-slate-50 space-y-4">
          <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
          <div className="h-3 w-1/3 bg-slate-100 rounded"></div>
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
      'Success Story': { icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      'Challenge': { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
      'Innovation': { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      'Farming Practice': { icon: Sprout, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
      'Cultural Tradition': { icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
      'Other': { icon: Pin, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' }
    };
    return styles[type] || styles['Other'];
  };

  const filteredExperiences = activeTab === 'All' 
    ? experiences 
    : experiences.filter(exp => exp.experience_type === activeTab);

  const tabs = ['All', 'Success Story', 'Challenge', 'Innovation', 'Farming Practice', 'Cultural Tradition'];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-emerald-100">
      <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-200">
                <BookOpen size={18} />
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Knowledge Repository</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Field Experiences</h1>
            <p className="text-slate-500 font-medium mt-2">A collective intelligence hub of local farming wisdom.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {canCreate && (
              <button 
                onClick={() => setShowModal(true)} 
                className="group flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Record New Experience</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar mx-2">
          <nav className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
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
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mx-2">
              <div className="p-6 bg-slate-50 rounded-full text-slate-200 mb-6">
                <Info size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">No Experiences Found</h3>
              <p className="text-slate-400 font-medium mt-2">Try switching categories or record a new entry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {filteredExperiences.map((exp) => {
                const style = getTypeStyles(exp.experience_type);
                const Icon = style.icon;
                return (
                  <div key={exp.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                    {/* Background Decorative Element */}
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${style.bg} opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-3xl`} />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className={`p-4 rounded-[1.25rem] ${style.bg} ${style.color} shadow-inner transition-transform duration-500 group-hover:scale-110`}>
                        <Icon size={28} />
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        exp.impact_level === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        exp.impact_level === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {exp.impact_level} Impact
                      </span>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight line-clamp-2">
                        {exp.title}
                      </h3>
                      <p className="text-slate-500 font-medium leading-relaxed italic line-clamp-4 relative">
                        <span className="text-emerald-300 text-3xl absolute -left-4 -top-2 opacity-50 font-serif">"</span>
                        {exp.description}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-slate-50 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-600 shadow-inner">
                          <User size={14} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 truncate">{exp.farmer_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-slate-400">
                        <MapPin size={14} className="shrink-0" />
                        <span className="text-xs font-semibold truncate">{exp.location || 'Remote Location'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-slate-400">
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
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-8 py-6 rounded-[2rem] border border-slate-100 shadow-sm mx-2 mb-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Showing Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* MODAL - REDESIGNED */}
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
              
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Record Field Knowledge</h2>
                  <p className="text-slate-400 text-sm font-medium mt-1">Capture insights directly from the field.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Involved Farmer</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-inner" value={formData.farmer_id} onChange={handleFarmerChange} required>
                      <option value="">Choose Farmer...</option>
                      {farmers.map((f) => (<option key={f.id} value={f.id}>{f.full_name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience Type</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-inner" value={formData.experience_type} onChange={(e) => setFormData({ ...formData, experience_type: e.target.value })} required>
                      <option value="Success Story">Success Story</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Innovation">Innovation</option>
                      <option value="Farming Practice">Farming Practice</option>
                      <option value="Cultural Tradition">Cultural Tradition</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headline / Title</label>
                  <input type="text" placeholder="e.g., Breakthrough Organic Pest Control Method" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-inner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Narrative</label>
                  <textarea rows={5} placeholder="Describe the experience in detail..." className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 shadow-inner" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Date</label>
                    <input type="date" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-inner" value={formData.date_recorded} onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Impact Level</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-inner" value={formData.impact_level} onChange={(e) => setFormData({ ...formData, impact_level: e.target.value })}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specific Location</label>
                    <input type="text" placeholder="Brgy/Sitio..." className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-inner" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                </div>

                <div className="pt-8 flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-slate-50">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard Draft</button>
                  <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all">Submit Knowledge Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}