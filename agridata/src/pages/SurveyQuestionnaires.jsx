import React, { useState, useEffect } from 'react';
import { surveysAPI } from '../services/api';
import { 
  ClipboardList, Plus, Search, FileText, Calendar, 
  Edit2, Trash2, X, Save, Loader2, CheckCircle2, AlertCircle, 
  BarChart3, Clock, Copy, Download, Eye, Filter, Terminal, Tag
} from 'lucide-react';

// --- CONSTANTS ---
const SURVEY_CATEGORIES = ['General', 'Socio-Economic', 'Production', 'Environmental'];

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
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState('');

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

  // --- FILTERING LOGIC ---
  const filteredSurveys = surveys.filter(s => {
    const title = s.title ? s.title.toLowerCase() : '';
    const category = s.category ? s.category.toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    // 1. Search Filter
    const matchesSearch = title.includes(search) || category.includes(search);
    
    // 2. Category Filter
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;

    // 3. Time Filter
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

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-indigo-100 transition-colors duration-300 pb-20 relative">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 py-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                <ClipboardList size={20} />
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Data Collection Hub</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Survey Instruments</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage field questionnaires and data gathering protocols.</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Create Instrument</span>
          </button>
        </header>

        {/* SEARCH & METRICS */}
        <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-[2]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search survey archives..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] shadow-sm text-sm font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            </div>

            {/* Time Filter */}
            <div className="relative flex-1">
              <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] shadow-sm text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative flex-1">
              <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] shadow-sm text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                <option value="All">All Categories</option>
                {SURVEY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Metric */}
          <div className="lg:col-span-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-500/20 p-4 flex items-center justify-between px-8 transition-colors">
             <div className="flex items-center gap-3">
               <BarChart3 size={20} className="text-indigo-600 dark:text-indigo-400"/>
               <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Active Protocols</span>
             </div>
             <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{surveys.filter(s => s.is_active).length}</span>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-64 bg-white dark:bg-[#0b241f] rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-white/5 shadow-sm" />)
          ) : filteredSurveys.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">No instruments match your criteria</div>
          ) : (
            filteredSurveys.map(survey => (
              <div key={survey.id} className="group bg-white dark:bg-[#0b241f] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all relative overflow-hidden flex flex-col h-full">
                
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest ${survey.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                  {survey.is_active ? 'Active' : 'Draft'}
                </div>

                <div className="mb-6 mt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${survey.is_active ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600'}`}>
                      <FileText size={24} />
                    </div>
                    {/* Action Menu */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handlePreview(survey)} title="Preview" className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"><Eye size={16}/></button>
                      <button onClick={() => handleClone(survey)} title="Duplicate" className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-blue-500 transition-colors"><Copy size={16}/></button>
                      <button onClick={() => handleExport(survey)} title="Export JSON" className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-amber-500 transition-colors"><Download size={16}/></button>
                      <button onClick={() => handleEdit(survey)} title="Edit" className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(survey.id)} title="Archive" className="p-2 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  
                  <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400 mb-3 inline-block">
                    {survey.category || 'General'}
                  </span>
                  
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">{survey.title}</h3>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                    {survey.description || 'No descriptive metadata available for this instrument.'}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{survey.created_at ? new Date(survey.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest">ID: {survey.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PREVIEW MODAL */}
        {showPreviewModal && selectedSurvey && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPreviewModal(false)} />
            <div className="relative bg-white dark:bg-[#041d18] rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-white/5">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-black/20">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">Preview Mode</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">v1.0</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedSurvey.title}</h2>
                    </div>
                    <button onClick={() => setShowPreviewModal(false)} className="p-2 bg-white dark:bg-white/10 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
                </div>
                <div className="p-8 overflow-y-auto space-y-6 no-scrollbar">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{selectedSurvey.description || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</p>
                            {/* FIX: Added fallback if category is null */}
                            <p className="font-bold text-slate-800 dark:text-white">{selectedSurvey.category || 'General'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                            <p className={`font-bold ${selectedSurvey.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>{selectedSurvey.is_active ? 'Live Deployment' : 'Draft / Archived'}</p>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Terminal size={12}/> JSON Metadata</p>
                        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[10px] overflow-x-auto font-mono">
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
            <div className="relative bg-white dark:bg-[#041d18] rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border dark:border-white/5">
              
              <div className="p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl shrink-0 z-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingSurvey ? 'Edit Protocol' : 'New Instrument'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">Define survey parameters and metadata.</p>
                </div>
                <button onClick={closeModal} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-300 dark:text-slate-600"><X size={28} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                
                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-500/20">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold">{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Instrument Title</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" placeholder="e.g. 2026 Rice Yield Assessment" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold dark:text-white shadow-inner outline-none appearance-none cursor-pointer">
                      {SURVEY_CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="dark:bg-[#041d18]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deployment Status</label>
                    <div className={`w-full px-6 py-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${formData.is_active ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-600'}`}
                         onClick={() => setFormData(p => ({...p, is_active: !p.is_active}))}>
                       {formData.is_active ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 dark:border-slate-700" />}
                       <span className="text-xs font-black uppercase tracking-widest">{formData.is_active ? 'Active Deployment' : 'Draft / Archived'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pb-6">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Abstract / Instructions</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold dark:text-slate-200 shadow-inner outline-none min-h-[120px] transition-all" placeholder="Briefly describe the purpose of this survey..." />
                </div>

              </form>

              <div className="px-10 py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-6 shrink-0">
                <button type="button" onClick={closeModal} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Cancel</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="px-12 py-5 bg-indigo-600 dark:bg-indigo-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-500 dark:hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{editingSurvey ? 'Save Protocol' : 'Create Instrument'}</span>
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