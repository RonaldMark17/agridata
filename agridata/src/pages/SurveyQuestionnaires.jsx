import React, { useState, useEffect } from 'react';
import { surveysAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, Plus, Search, FileText, Calendar, 
  Edit2, Trash2, X, Save, Loader2, CheckCircle2, AlertCircle, 
  BarChart3, Clock, Copy, Download, Eye, Filter, Terminal, Tag,
  ChevronLeft, ChevronRight, Activity, FileArchive
} from 'lucide-react';

// --- CONSTANTS ---
const SURVEY_CATEGORIES = ['General', 'Socio-Economic', 'Production', 'Environmental'];

// --- SKELETON COMPONENT ---
const SurveySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 animate-pulse shadow-sm">
        <div className="flex justify-between mb-6">
          <div className="space-y-3 flex-1">
            <div className="h-6 w-32 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
            <div className="h-4 w-48 bg-slate-50 dark:bg-white/5 rounded-md"></div>
          </div>
          <div className="h-12 w-12 bg-slate-50 dark:bg-white/5 rounded-2xl"></div>
        </div>
        <div className="space-y-5 pt-6 border-t border-slate-50 dark:border-white/5">
          <div className="space-y-3">
            <div className="h-2 w-full bg-slate-50 dark:bg-white/5 rounded-full"></div>
            <div className="h-2 w-2/3 bg-slate-50 dark:bg-white/5 rounded-full"></div>
            <div className="h-2 w-4/5 bg-slate-50 dark:bg-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function SurveyQuestionnaires() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Selection States
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');

  const { hasPermission } = useAuth();
  const canManage = hasPermission(['admin', 'researcher']);
  const ITEMS_PER_PAGE = 9;

  const initialForm = {
    title: '',
    description: '',
    category: 'General',
    is_active: true
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await surveysAPI.getAll();
      setSurveys(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setSurveys([]); 
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingSurvey) {
        await surveysAPI.update(editingSurvey.id, formData);
      } else {
        await surveysAPI.create(formData);
      }
      closeModal();
      fetchSurveys();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save survey protocol.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Archive this survey instrument? Existing response data may be affected.')) {
      try {
        await surveysAPI.delete(id);
        setSurveys(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert('Cannot delete: Survey has linked responses.');
      }
    }
  };

  // --- FEATURES ---
  const handleClone = (survey) => {
    setFormData({
      title: `${survey.title} (Copy)`,
      description: survey.description || '',
      category: survey.category || 'General',
      is_active: false 
    });
    setEditingSurvey(null); 
    setShowModal(true);
  };

  const handleExport = (survey) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(survey, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `survey_${survey.id}_export.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleEdit = (survey) => {
    setEditingSurvey(survey);
    setFormData({
      title: survey.title || '',
      description: survey.description || '',
      category: survey.category || 'General',
      is_active: survey.is_active === true || survey.is_active === 1
    });
    setShowModal(true);
  };

  const handlePreview = (survey) => {
    setSelectedSurvey(survey);
    setShowPreviewModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSurvey(null);
    setFormData(initialForm);
    setError('');
  };

  // --- FILTERING & PAGINATION LOGIC ---
  const filteredSurveys = surveys.filter(s => {
    const title = s.title ? s.title.toLowerCase() : '';
    const category = s.category ? s.category.toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = title.includes(search) || category.includes(search);
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;

    let matchesTime = true;
    if (timeFilter !== 'all' && s.created_at) {
      const surveyDate = new Date(s.created_at);
      const now = new Date();
      const daysDiff = (now - surveyDate) / (1000 * 3600 * 24);
      if (timeFilter === 'week') matchesTime = daysDiff <= 7;
      if (timeFilter === 'month') matchesTime = daysDiff <= 30;
    }
    
    return matchesSearch && matchesCategory && matchesTime;
  });

  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE);
  const paginated = filteredSurveys.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Stats
  const activeCount = surveys.filter(s => s.is_active).length;
  const draftCount = surveys.length - activeCount;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 transition-colors duration-300 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 py-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                <ClipboardList size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">Data Collection Hub</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Survey Instruments</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage field questionnaires and data gathering protocols.</p>
          </div>
          
          {canManage && (
            <button 
              onClick={() => setShowModal(true)} 
              className="flex-1 lg:flex-none group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Create Instrument</span>
            </button>
          )}
        </header>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {[
            { label: 'Total Instruments', val: surveys.length, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Active Protocols', val: activeCount, icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Drafts & Archived', val: draftCount, icon: FileArchive, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          ].map((stat, i) => (
            <div key={i} className="group bg-white dark:bg-[#0b241f] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-6 relative overflow-hidden">
               <div className={`p-5 rounded-2xl ${stat.bg} ${stat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div className="min-w-0 relative z-10">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</p>
              </div>
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} opacity-10 dark:opacity-5 group-hover:scale-150 transition-transform duration-700`} />
            </div>
          ))}
        </div>

        {/* TOOLBAR: SEARCH & FILTERS */}
        <div className="px-4 flex flex-col md:flex-row gap-4">
          <div className="bg-white dark:bg-[#0b241f] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm p-2 flex items-center transition-colors flex-[2]">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search survey archives..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-16 pr-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b241f] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm p-2 flex items-center gap-4 px-4 flex-1 w-full md:w-auto">
            <Clock size={18} className="text-slate-400 ml-2" />
            <select 
              value={timeFilter}
              onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer appearance-none w-full pr-8"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#0b241f] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm p-2 flex items-center gap-4 px-4 flex-1 w-full md:w-auto">
            <Tag size={18} className="text-slate-400 ml-2" />
            <select 
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer appearance-none w-full pr-8"
            >
              <option value="All">All Categories</option>
              {SURVEY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="px-4">
          {loading ? (
            <SurveySkeleton />
          ) : paginated.length === 0 ? (
            <div className="py-32 bg-white dark:bg-[#0b241f] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/10 text-center transition-colors">
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-full inline-flex text-slate-200 dark:text-slate-700 mb-8">
                <ClipboardList size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Instruments Found</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium mt-3">Try refining your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginated.map((survey) => (
                <div key={survey.id} className="group bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-500 overflow-hidden relative flex flex-col h-full">
                  
                  {/* Status Badge */}
                  <div className={`absolute top-0 left-0 px-6 py-2 rounded-br-3xl text-[9px] font-black uppercase tracking-widest ${survey.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                    {survey.is_active ? 'Active' : 'Draft'}
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={() => handlePreview(survey)} className="p-2 bg-white dark:bg-black/40 backdrop-blur-md rounded-xl text-slate-400 hover:text-emerald-500 shadow-sm border border-slate-100 dark:border-white/10"><Eye size={16}/></button>
                      {canManage && (
                        <>
                          <button onClick={() => handleClone(survey)} className="p-2 bg-white dark:bg-black/40 backdrop-blur-md rounded-xl text-slate-400 hover:text-blue-500 shadow-sm border border-slate-100 dark:border-white/10"><Copy size={16}/></button>
                          <button onClick={() => handleExport(survey)} className="p-2 bg-white dark:bg-black/40 backdrop-blur-md rounded-xl text-slate-400 hover:text-amber-500 shadow-sm border border-slate-100 dark:border-white/10"><Download size={16}/></button>
                          <button onClick={() => handleEdit(survey)} className="p-2 bg-white dark:bg-black/40 backdrop-blur-md rounded-xl text-slate-400 hover:text-indigo-500 shadow-sm border border-slate-100 dark:border-white/10"><Edit2 size={16}/></button>
                          <button onClick={() => handleDelete(survey.id)} className="p-2 bg-white dark:bg-black/40 backdrop-blur-md rounded-xl text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 dark:border-white/10"><Trash2 size={16}/></button>
                        </>
                      )}
                  </div>

                  <div className="p-10 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6 mt-2">
                      <div className="min-w-0">
                        <div className="p-1 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-md inline-flex mb-3">
                          <Tag size={12} className="mr-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{survey.category || 'General'}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight line-clamp-2">{survey.title}</h3>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6 pt-6 border-t border-slate-50 dark:border-white/5">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                        {survey.description || 'No descriptive metadata available for this instrument.'}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{survey.created_at ? new Date(survey.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <span>ID: {survey.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-[#0b241f] px-10 py-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm mx-4 transition-colors">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                Page <span className="text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex gap-4">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-4 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 transition-all shadow-sm">
                <ChevronLeft size={20} />
                </button>
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-4 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 transition-all shadow-sm">
                <ChevronRight size={20} />
                </button>
            </div>
            </div>
        )}

        {/* PREVIEW MODAL */}
        {showPreviewModal && selectedSurvey && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPreviewModal(false)} />
            <div className="relative bg-white dark:bg-[#041d18] rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-white/5">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-black/20 shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">Preview Mode</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedSurvey.title}</h2>
                    </div>
                    <button onClick={() => setShowPreviewModal(false)} className="p-3 bg-white dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X size={20}/></button>
                </div>
                <div className="p-10 overflow-y-auto space-y-8 no-scrollbar">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Abstract / Instructions</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-6 rounded-2xl">{selectedSurvey.description || 'No descriptive text provided.'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Category</p>
                            <p className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">{selectedSurvey.category || 'General'}</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                            <p className={`font-bold uppercase tracking-tight ${selectedSurvey.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>{selectedSurvey.is_active ? 'Live Deployment' : 'Draft / Archived'}</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Terminal size={12}/> JSON Metadata</p>
                        <pre className="bg-slate-900 dark:bg-black text-emerald-400 p-6 rounded-2xl text-xs overflow-x-auto font-mono shadow-inner border border-slate-800 dark:border-white/10">
                            {JSON.stringify(selectedSurvey, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* CREATE/EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={closeModal} />
            <div className="relative bg-white dark:bg-[#041d18] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border dark:border-white/5">
              
              <div className="p-8 sm:p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl z-10 shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingSurvey ? 'Edit Protocol' : 'New Instrument'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">Define survey parameters and metadata.</p>
                </div>
                <button type="button" onClick={closeModal} disabled={submitting} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-300 dark:text-slate-600 disabled:opacity-50">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-12 no-scrollbar">
                
                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-500/20">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold">{error}</span>
                  </div>
                )}

                <div className="space-y-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 flex items-center gap-3">
                    <FileText size={14} /> Instrument Details
                  </p>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Instrument Title</label>
                    <input type="text" required disabled={submitting} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all disabled:opacity-60" placeholder="e.g. 2026 Rice Yield Assessment" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category</label>
                      <select disabled={submitting} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none appearance-none cursor-pointer disabled:opacity-60">
                        {SURVEY_CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="dark:bg-[#041d18]">{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deployment Status</label>
                      <div className={`w-full px-6 py-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${formData.is_active ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-600'}`}
                           onClick={() => !submitting && setFormData(p => ({...p, is_active: !p.is_active}))}>
                         {formData.is_active ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 dark:border-slate-700" />}
                         <span className="text-xs font-black uppercase tracking-widest">{formData.is_active ? 'Active Deployment' : 'Draft / Archived'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pb-6">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Abstract / Instructions</label>
                  <textarea disabled={submitting} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-slate-200 shadow-inner outline-none min-h-[120px] transition-all disabled:opacity-60" placeholder="Briefly describe the purpose of this survey..." />
                </div>

              </form>

              <div className="px-10 py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-6 shrink-0">
                <button type="button" disabled={submitting} onClick={closeModal} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors disabled:opacity-50">Discard</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="px-12 py-5 bg-emerald-600 dark:bg-emerald-600 text-white dark:text-[#041d18] rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingSurvey ? 'Update Protocol' : 'Save Protocol'
                    )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}