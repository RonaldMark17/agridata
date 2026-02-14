import React, { useState, useEffect } from 'react';
import { surveysAPI } from '../services/api';
import { 
  ClipboardList, Plus, Search, FileText, Calendar, 
  Edit2, Trash2, X, Save, Loader2, CheckCircle2, AlertCircle, 
  BarChart3, Clock
} from 'lucide-react';

export default function SurveyQuestionnaires() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      setSurveys(response.data);
    } catch (err) {
      console.error(err);
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

  const handleEdit = (survey) => {
    setEditingSurvey(survey);
    setFormData({
      title: survey.title,
      description: survey.description || '',
      category: survey.category || 'General',
      is_active: survey.is_active
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSurvey(null);
    setFormData(initialForm);
    setError('');
  };

  const filteredSurveys = surveys.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-indigo-100 transition-colors duration-300 pb-20">
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
        <div className="px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search survey archives..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] shadow-sm text-sm font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-500/20 p-4 flex items-center justify-between px-8 transition-colors">
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
          ) : filteredSurveys.map(survey => (
            <div key={survey.id} className="group bg-white dark:bg-[#0b241f] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all relative overflow-hidden flex flex-col h-full">
              
              <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(survey)} className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors dark:text-slate-400"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(survey.id)} className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors dark:text-slate-400"><Trash2 size={16}/></button>
              </div>

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${survey.is_active ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600'}`}>
                  <FileText size={24} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400">
                    {survey.category}
                  </span>
                  {survey.is_active && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  )}
                </div>
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
                  <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest">v1.0</span>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
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
                      <option value="General" className="dark:bg-[#041d18]">General</option>
                      <option value="Socio-Economic" className="dark:bg-[#041d18]">Socio-Economic</option>
                      <option value="Production" className="dark:bg-[#041d18]">Production</option>
                      <option value="Environmental" className="dark:bg-[#041d18]">Environmental</option>
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