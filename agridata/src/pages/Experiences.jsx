import React, { useState, useEffect } from 'react';
import { experiencesAPI, farmersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Calendar, MapPin, User, Plus, X, 
  Trophy, AlertTriangle, Lightbulb, Sprout, Landmark, Pin,
  ChevronLeft, ChevronRight, Activity, Filter, Info, Loader2,
  Search, Download, ThumbsUp, Share2, ExternalLink, Image as ImageIcon,
  FileText
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace('/api', '');

// --- Skeleton Component ---
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
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null); // For Read Mode
  
  // Data Controls
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [votes, setVotes] = useState({}); // Local state for "likes"

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
    impact_level: 'Medium',
    attachment: null // New field placeholder
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
    } catch (error) { console.error('Error fetching farmers:', error); }
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
      setShowCreateModal(false);
      fetchExperiences();
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error creating experience:', error);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simulate CSV generation
    const headers = ["Title", "Type", "Farmer", "Location", "Impact", "Date"];
    const rows = experiences.map(e => [
      `"${e.title}"`, e.experience_type, `"${e.farmer_name}"`, 
      `"${e.location}"`, e.impact_level, e.date_recorded
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `knowledge_base_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const toggleVote = (id, e) => {
    e.stopPropagation();
    setVotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  // --- Advanced Filtering Logic ---
  const filteredExperiences = experiences.filter(exp => {
    const matchesTab = activeTab === 'All' || exp.experience_type === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchLower) ||
      exp.description.toLowerCase().includes(searchLower) ||
      exp.location?.toLowerCase().includes(searchLower) ||
      exp.farmer_name?.toLowerCase().includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Success Story', 'Challenge', 'Innovation', 'Farming Practice', 'Cultural Tradition'];

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    let cleanPath = path.trim().replace(/^\//, '').replace(/^uploads\//, '').replace(/^static\/uploads\//, '');
    return `${API_BASE_URL}/static/uploads/${cleanPath}?t=${Date.now()}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 transition-colors duration-300 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* 1. Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 px-4 pt-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                <BookOpen size={18} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">Knowledge Repository</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Field Experiences</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-2xl">A collective intelligence hub of local farming wisdom, capturing challenges, innovations, and success stories from the field.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search knowledge..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden sm:inline">Export</span>
              </button>

              {canCreate && (
                <button 
                  onClick={() => setShowCreateModal(true)} 
                  className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Record Entry</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Categories Tab Bar */}
        <div className="mx-4">
          <div className="bg-white dark:bg-[#0b241f] p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wide transition-all duration-300 ${
                    activeTab === tab 
                    ? 'bg-slate-900 dark:bg-emerald-500 text-white shadow-md' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 3. Content Area */}
        <div className="min-h-[500px] px-4">
          {loading ? (
            <ExperienceSkeleton />
          ) : filteredExperiences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#0b241f] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/10">
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full text-slate-300 dark:text-slate-700 mb-6">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">No Matches Found</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium mt-2">Try adjusting your filters or search query.</p>
              {canCreate && (
                <button onClick={() => { setSearchQuery(''); setActiveTab('All'); setShowCreateModal(true); }} className="mt-6 text-emerald-600 font-bold text-sm hover:underline">
                  Or record a new experience
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExperiences.map((exp) => {
                const style = getTypeStyles(exp.experience_type);
                const Icon = style.icon;
                const isVoted = votes[exp.id];

                return (
                  <div 
                    key={exp.id} 
                    onClick={() => setSelectedExperience(exp)}
                    className="group bg-white dark:bg-[#0b241f] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col h-full"
                  >
                    {/* Background Decorative Element */}
                    <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full ${style.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none`} />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`p-4 rounded-[1.25rem] ${style.bg} ${style.color} shadow-inner transition-transform duration-500 group-hover:rotate-6`}>
                        <Icon size={24} />
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        exp.impact_level === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' :
                        exp.impact_level === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' :
                        'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'
                      }`}>
                        {exp.impact_level} Impact
                      </span>
                    </div>

                    <div className="space-y-4 mb-6 flex-1 relative z-10">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight line-clamp-2">
                        {exp.title}
                      </h3>
                      
                      {/* Context/Location Snippet */}
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <MapPin size={12} /> {exp.location || 'Unknown Location'}
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-3">
                        {exp.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner border border-white dark:border-white/5">
                          {/* Use image if available, else user icon */}
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{exp.farmer_name}</span>
                            <span className="text-[9px] text-slate-400">{new Date(exp.date_recorded).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                            onClick={(e) => toggleVote(exp.id, e)}
                            className={`p-2.5 rounded-xl transition-all ${isVoted ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-500'}`}
                        >
                            <ThumbsUp size={16} className={isVoted ? 'fill-current' : ''} />
                        </button>
                        <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 transition-colors">
                            <ExternalLink size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. READ MODE MODAL (New Feature) */}
        {selectedExperience && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedExperience(null)} />
                <div className="relative bg-white dark:bg-[#0b241f] w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-white/10">
                    
                    {/* Modal Header */}
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-black/20">
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getTypeStyles(selectedExperience.experience_type).bg} ${getTypeStyles(selectedExperience.experience_type).color} ${getTypeStyles(selectedExperience.experience_type).border}`}>
                                    {selectedExperience.experience_type}
                                </span>
                                <span className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">
                                    {new Date(selectedExperience.date_recorded).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{selectedExperience.title}</h2>
                        </div>
                        <button onClick={() => setSelectedExperience(null)} className="p-3 bg-white dark:bg-white/10 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-all"><X size={24}/></button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                        {/* Narrative */}
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {selectedExperience.description}
                            </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Contributor</span>
                                <p className="font-bold text-slate-900 dark:text-white">{selectedExperience.farmer_name}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> Location</span>
                                <p className="font-bold text-slate-900 dark:text-white">{selectedExperience.location || 'N/A'}</p>
                            </div>
                            {selectedExperience.context && (
                                <div className="space-y-1 sm:col-span-2 pt-4 border-t border-slate-200 dark:border-white/10">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info size={12}/> Contextual Notes</span>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">"{selectedExperience.context}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-end gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-all">
                            <Share2 size={16}/> Share
                        </button>
                        <button onClick={() => toggleVote(selectedExperience.id, { stopPropagation: () => {} })} className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl ${votes[selectedExperience.id] ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
                            <ThumbsUp size={16} className={votes[selectedExperience.id] ? 'fill-current' : ''}/> {votes[selectedExperience.id] ? 'Helpful' : 'Mark Helpful'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 5. CREATE MODAL (Enhanced) */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)} />
            
            <div className="relative bg-white dark:bg-[#041d18] rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border dark:border-white/5">
              
              <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#041d18] shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Record Field Knowledge</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">Capture insights directly from the field.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-slate-400 dark:text-slate-600 transition-colors">
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
                
                {/* Image Upload UI Placeholder */}
                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <ImageIcon size={32} className="text-slate-300 dark:text-slate-600 mb-2"/>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Attach Photos / Evidence</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Supports JPG, PNG (Max 5MB)</p>
                </div>

                <div className="pt-8 flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-slate-50 dark:border-white/5">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Discard Draft</button>
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