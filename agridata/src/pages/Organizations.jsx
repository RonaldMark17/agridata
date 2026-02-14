import React, { useState, useEffect } from 'react';
import { organizationsAPI } from '../services/api';
import { 
  Building2, Plus, Search, MapPin, Globe, 
  Users, Edit2, Trash2, X, Save, Loader2, 
  Briefcase, Building, AlertCircle
} from 'lucide-react';

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const initialForm = {
    name: '',
    type: 'Cooperative',
    description: '',
    location: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await organizationsAPI.getAll();
      setOrganizations(response.data);
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
      if (editingOrg) {
        await organizationsAPI.update(editingOrg.id, formData);
      } else {
        await organizationsAPI.create(formData);
      }
      closeModal();
      fetchOrganizations();
    } catch (err) {
      setError(err.response?.data?.error || 'Transaction failed. Name might be duplicate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Dissolve this organizational record? This may detach linked farmers.')) {
      try {
        await organizationsAPI.delete(id);
        setOrganizations(prev => prev.filter(o => o.id !== id));
      } catch (err) {
        alert('Cannot delete: Organization has active members.');
      }
    }
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      type: org.type || 'Cooperative',
      description: org.description || '',
      location: org.location || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrg(null);
    setFormData(initialForm);
    setError('');
  };

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Government': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'NGO': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'Cooperative': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-white/5 dark:text-slate-400 dark:border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-blue-100 transition-colors duration-300 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 py-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-200 dark:shadow-none">
                <Building2 size={20} />
              </div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Network Registry</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Institutional Partners</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage cooperatives, agencies, and funding bodies.</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-blue-500 active:scale-95 transition-all"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Register Entity</span>
          </button>
        </header>

        {/* SEARCH BAR */}
        <div className="px-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search partner network..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] shadow-sm text-sm font-bold dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-64 bg-white dark:bg-[#0b241f] rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-white/5 shadow-sm" />)
          ) : filteredOrgs.map(org => (
            <div key={org.id} className="group bg-white dark:bg-[#0b241f] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all relative overflow-hidden flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(org)} className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors dark:text-slate-400"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(org.id)} className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors dark:text-slate-400"><Trash2 size={16}/></button>
                </div>
              </div>

              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl border transition-colors ${getTypeStyle(org.type)}`}>
                    <Building size={24} />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 uppercase tracking-tight">{org.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border mb-4 transition-colors ${getTypeStyle(org.type)}`}>
                  {org.type || 'Organization'}
                </span>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                  {org.description || 'No institutional description available.'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center gap-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                <MapPin size={14} />
                <span className="truncate">{org.location || 'Headquarters: Unspecified'}</span>
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
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingOrg ? 'Update Entity' : 'Register Entity'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">Define institutional parameters.</p>
                </div>
                <button onClick={closeModal} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-300 dark:text-slate-600"><X size={28} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                
                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-500/20">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" placeholder="e.g. Laguna Rice Cooperative" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Entity Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-sm font-bold dark:text-white shadow-inner outline-none appearance-none cursor-pointer">
                      <option value="Cooperative" className="dark:bg-[#041d18]">Cooperative</option>
                      <option value="Government" className="dark:bg-[#041d18]">Government Agency</option>
                      <option value="NGO" className="dark:bg-[#041d18]">NGO / Non-Profit</option>
                      <option value="Private" className="dark:bg-[#041d18]">Private Corporation</option>
                      <option value="Association" className="dark:bg-[#041d18]">Farmers Association</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Headquarters</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" placeholder="City, Province" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description & Mandate</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 text-sm font-bold dark:text-slate-200 shadow-inner outline-none min-h-[120px] transition-all" placeholder="Brief summary of the organization..." />
                </div>

              </form>

              <div className="px-10 py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-6 shrink-0">
                <button type="button" onClick={closeModal} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Cancel</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="px-12 py-5 bg-blue-600 dark:bg-blue-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{editingOrg ? 'Save Changes' : 'Register Entity'}</span>
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