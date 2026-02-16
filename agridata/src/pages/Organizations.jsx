import React, { useState, useEffect } from 'react';
import { organizationsAPI } from '../services/api';
import { 
  Building2, Plus, Search, MapPin, Globe, 
  Users, Edit2, Trash2, X, Save, Loader2, 
  Briefcase, Building, AlertCircle, Filter, Download, ArrowUpDown, Eye, PieChart
} from 'lucide-react';

const ORG_TYPES = ['Cooperative', 'Government', 'NGO', 'Private', 'Association'];

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // NEW: View Modal
  
  // Selection & Forms
  const [editingOrg, setEditingOrg] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null); // NEW: For View Mode
  const [error, setError] = useState('');

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // NEW: Filter by Type
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' }); // NEW: Sorting
  const [isExporting, setIsExporting] = useState(false);

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

  // --- NEW FEATURES ---

  const handleExport = () => {
    setIsExporting(true);
    const headers = ["Name", "Type", "Location", "Description"];
    const rows = organizations.map(o => [
      `"${o.name}"`, o.type, `"${o.location}"`, `"${o.description}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `partners_registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleSort = () => {
    setSortConfig(prev => ({
      key: 'name',
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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

  const handleView = (org) => {
    setSelectedOrg(org);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowViewModal(false);
    setEditingOrg(null);
    setSelectedOrg(null);
    setFormData(initialForm);
    setError('');
  };

  // --- FILTER & SORT LOGIC ---
  const filteredOrgs = organizations
    .filter(o => {
      const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || o.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortConfig.direction === 'asc') {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Government': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'NGO': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'Cooperative': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Private': return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-white/5 dark:text-slate-400 dark:border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-blue-100 transition-colors duration-300 pb-20 relative">
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

        {/* CONTROLS (Search, Filter, Export) */}
        <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-[2]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search partner network..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] shadow-sm text-sm font-bold dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="relative flex-1">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] shadow-sm text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                <option value="All">All Entities</option>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Sort & Export */}
            <div className="flex gap-2">
                <button onClick={handleSort} className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
                    <ArrowUpDown size={20} className={sortConfig.direction === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'}/>
                </button>
                <button onClick={handleExport} disabled={isExporting} className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm">
                    {isExporting ? <Loader2 className="animate-spin" size={20}/> : <Download size={20}/>}
                </button>
            </div>
          </div>

          {/* Metric Card */}
          <div className="lg:col-span-4 bg-blue-50 dark:bg-blue-500/10 rounded-[1.5rem] border border-blue-100 dark:border-blue-500/20 p-4 flex items-center justify-between px-8 transition-colors">
             <div className="flex items-center gap-3">
               <PieChart size={20} className="text-blue-600 dark:text-blue-400"/>
               <span className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest">Total Partners</span>
             </div>
             <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{organizations.length}</span>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-64 bg-white dark:bg-[#0b241f] rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-white/5 shadow-sm" />)
          ) : filteredOrgs.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">No organizations match your criteria</div>
          ) : (
            filteredOrgs.map(org => (
              <div key={org.id} className="group bg-white dark:bg-[#0b241f] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all relative overflow-hidden flex flex-col justify-between h-full">
                
                {/* Action Menu (Hover) */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <button onClick={() => handleView(org)} className="p-2 bg-slate-50 dark:bg-black/40 backdrop-blur-md hover:text-emerald-500 rounded-xl transition-colors text-slate-400 border border-slate-100 dark:border-white/10"><Eye size={16}/></button>
                  <button onClick={() => handleEdit(org)} className="p-2 bg-slate-50 dark:bg-black/40 backdrop-blur-md hover:text-blue-600 rounded-xl transition-colors text-slate-400 border border-slate-100 dark:border-white/10"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(org.id)} className="p-2 bg-slate-50 dark:bg-black/40 backdrop-blur-md hover:text-rose-600 rounded-xl transition-colors text-slate-400 border border-slate-100 dark:border-white/10"><Trash2 size={16}/></button>
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
            ))
          )}
        </div>

        {/* VIEW MODAL (New) */}
        {showViewModal && selectedOrg && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={closeModal} />
                <div className="relative bg-white dark:bg-[#041d18] rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border dark:border-white/5">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">Entity Profile</h3>
                        <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${getTypeStyle(selectedOrg.type)}`}>
                                <Building size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight mb-2">{selectedOrg.name}</h2>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{selectedOrg.type}</span>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><MapPin size={12}/> Location</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedOrg.location || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">About</p>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{selectedOrg.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* EDIT/CREATE MODAL */}
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
                      {ORG_TYPES.map(t => <option key={t} value={t} className="dark:bg-[#041d18]">{t}</option>)}
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