import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmersAPI, barangaysAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Download, Plus, ChevronLeft, ChevronRight, 
  Eye, Edit, MapPin, Ruler, Trash2, X, Calendar, Info, Loader2, ArrowUpDown,
  Phone, GraduationCap, Briefcase, DollarSign, Sprout, Building2, User, Activity, Globe
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace(/\/api\/?$/, '');

// --- Skeleton Loader Component ---
const TableSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-10 py-7">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-slate-100 rounded-2xl"></div>
            <div className="space-y-3">
              <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
              <div className="h-3 w-24 bg-slate-50 rounded-md"></div>
            </div>
          </div>
        </td>
        <td className="px-10 py-7"><div className="h-6 w-32 bg-slate-50 rounded-xl"></div></td>
        <td className="px-10 py-7"><div className="h-8 w-24 bg-slate-50 rounded-xl"></div></td>
        <td className="px-10 py-7 text-right"><div className="h-10 w-10 bg-slate-50 rounded-xl ml-auto"></div></td>
      </tr>
    ))}
  </>
);

export default function FarmersList() {
  const [farmers, setFarmers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission(['admin', 'researcher', 'data_encoder']);
  const canDelete = hasPermission(['admin']);

  useEffect(() => { fetchBarangays(); }, []);
  useEffect(() => { fetchFarmers(); }, [currentPage, search, selectedBarangay, sortBy, sortOrder]);

  const fetchBarangays = async () => {
    try {
      const response = await barangaysAPI.getAll();
      setBarangays(response.data);
    } catch (error) { console.error('Error:', error); }
  };

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 20, sort_by: sortBy, sort_order: sortOrder };
      if (search) params.search = search;
      if (selectedBarangay) params.barangay_id = selectedBarangay;
      const response = await farmersAPI.getAll(params);
      setFarmers(response.data.farmers);
      setTotalPages(response.data.pages);
    } catch (error) { console.error('Error:', error); }
    finally { setTimeout(() => setLoading(false), 800); }
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split('-');
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); 
  };

  const handleExport = async () => {
    try {
        setExporting(true);
        const response = await farmersAPI.exportData();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `farmers_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) { alert("Export failed."); }
    finally { setExporting(false); }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await farmersAPI.getById(id);
      setSelectedFarmer(response.data);
      setShowViewModal(true);
    } catch (error) { alert("Could not load details."); }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Revoke profile for ${name}?`)) {
      try {
        await farmersAPI.delete(id);
        fetchFarmers();
      } catch (error) { alert("Delete failed."); }
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  const formatCurrency = (val) => val ? `₱${Number(val).toLocaleString()}` : 'N/A';
  
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    let cleanPath = path.trim().replace(/^\//, '').replace(/^uploads\//, '').replace(/^static\/uploads\//, '');
    return `${API_BASE_URL}/static/uploads/${cleanPath}?t=${Date.now()}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-emerald-100 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* 1. HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200">
                <Globe size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">Census Bureau</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Farmer Directory</h1>
            <p className="text-slate-500 font-medium mt-2">Centralized data engine for agricultural profiling and land tracking.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={handleExport} 
              disabled={exporting}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm disabled:opacity-50"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>{exporting ? 'Processing' : 'Export Ledger'}</span>
            </button>
            {canEdit && (
              <Link to="/farmers/new" className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all">
                <Plus size={16} /> <span>Onboard Farmer</span>
              </Link>
            )}
          </div>
        </header>

        {/* 2. CONTROL HUB */}
        <div className="px-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-3 flex flex-col xl:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Query database by name, code, or identity..."
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  className="w-full pl-16 pr-10 py-5 bg-slate-50 border-none rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 appearance-none outline-none cursor-pointer focus:ring-4 focus:ring-emerald-500/5 shadow-inner"
                  value={selectedBarangay}
                  onChange={(e) => { setSelectedBarangay(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">Territory: All</option>
                  {barangays.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="relative flex-1 sm:w-64">
                <ArrowUpDown className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  className="w-full pl-16 pr-10 py-5 bg-slate-50 border-none rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 appearance-none outline-none cursor-pointer focus:ring-4 focus:ring-emerald-500/5 shadow-inner"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                >
                  <option value="created_at-desc">Sort: Newest</option>
                  <option value="last_name-asc">Sort: Name (A-Z)</option>
                  <option value="farm_size_hectares-desc">Sort: Size (High)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABLE DATA */}
        <div className="px-4">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                    <th className="px-10 py-6">Core Identity</th>
                    <th className="px-10 py-6">Assigned Territory</th>
                    <th className="px-10 py-6">Land Allocation</th>
                    <th className="px-10 py-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? <TableSkeleton /> : farmers.map((farmer) => (
                    <tr key={farmer.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-700 font-black shadow-inner border border-slate-100 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                            {farmer.profile_image ? (
                                <img src={getImageUrl(farmer.profile_image)} alt={farmer.first_name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-lg">{getInitials(farmer.full_name)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 tracking-tight">{farmer.full_name}</p>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1 inline-flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                               #{farmer.farmer_code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                          <MapPin size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                          {farmer.barangay?.name || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50/50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-100/50">
                          <Ruler size={14} /> {farmer.farm_size_hectares || 0} Hectares
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => handleViewDetails(farmer.id)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 rounded-xl shadow-sm transition-all"><Eye size={18} /></button>
                          {canEdit && <button onClick={() => navigate(`/farmers/${farmer.id}/edit`)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl shadow-sm transition-all"><Edit size={18} /></button>}
                          {canDelete && <button onClick={() => handleDelete(farmer.id, farmer.full_name)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl shadow-sm transition-all"><Trash2 size={18} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="px-10 py-8 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stream <span className="text-slate-900">{currentPage}</span> / {totalPages}</p>
                <div className="flex gap-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all shadow-sm"><ChevronLeft size={20}/></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all shadow-sm"><ChevronRight size={20}/></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- 4. DOSSIER SLIDE-OVER --- */}
        {showViewModal && selectedFarmer && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-end overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowViewModal(false)} />
            
            <div className="relative bg-white h-[96%] w-full max-w-xl shadow-2xl flex flex-col transform animate-in slide-in-from-right duration-500 rounded-l-[3.5rem] mr-0 my-auto border-y border-l border-slate-100">
              <div className="p-10 flex justify-between items-center border-b border-slate-50 bg-white/80 backdrop-blur-xl shrink-0 rounded-tl-[3.5rem]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shadow-inner"><Activity size={20}/></div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Profile Dossier</h2>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-all"><X size={28}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
                {/* Visual Identity */}
                <div className="text-center space-y-6">
                  <div className="h-40 w-40 mx-auto rounded-[3rem] bg-slate-50 flex items-center justify-center text-5xl font-black text-emerald-700 shadow-inner border-8 border-white ring-1 ring-slate-100 overflow-hidden">
                    {selectedFarmer.profile_image ? (
                        <img src={getImageUrl(selectedFarmer.profile_image)} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        getInitials(selectedFarmer.full_name)
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">{selectedFarmer.full_name}</h3>
                    <div className="inline-flex items-center gap-3 mt-4 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                      <span className="text-emerald-700 font-black uppercase tracking-widest text-[10px]">Reference: {selectedFarmer.farmer_code}</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Territory', val: selectedFarmer.barangay?.name, icon: MapPin, color: 'text-slate-400', bg: 'bg-slate-50' },
                    { label: 'Land Area', val: `${selectedFarmer.farm_size_hectares} ha`, icon: Ruler, color: 'text-blue-500', bg: 'bg-blue-50/50' },
                    { label: 'Tenure', val: selectedFarmer.years_farming + ' yrs', icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50/50' },
                    { label: 'Status', val: selectedFarmer.land_ownership, icon: User, color: 'text-purple-500', bg: 'bg-purple-50/50' },
                  ].map((m, i) => (
                    <div key={i} className={`${m.bg} p-5 rounded-[2rem] border border-white/50 flex flex-col gap-1 shadow-sm`}>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${m.color}`}><m.icon size={12} /> {m.label}</span>
                      <span className="text-sm font-black text-slate-700 truncate">{m.val || 'Data Pending'}</span>
                    </div>
                  ))}
                </div>

                {/* Demographics Block */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-2">Personal Identity</p>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 shadow-inner"><Calendar size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Birth & Demographics</p>
                                <p className="text-sm font-bold text-slate-800">{selectedFarmer.age}y • {selectedFarmer.gender} • Born {selectedFarmer.birth_date || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 shadow-inner"><Phone size={20}/></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Protocol</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{selectedFarmer.contact_number || 'No link established'}</p>
                                <p className="text-[11px] text-slate-400 font-medium mt-1 truncate italic">{selectedFarmer.address || 'Location data not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Economic Profile Block */}
                <div className="space-y-6 pb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/50 ml-2">Economic Matrix</p>
                    <div className="bg-emerald-900/5 p-8 rounded-[2.5rem] border border-emerald-500/10 space-y-6">
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-inner"><DollarSign size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Gross Annual Income</p>
                                <p className="text-xl font-black text-slate-800">{formatCurrency(selectedFarmer.annual_income)}</p>
                                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-tighter mt-1 opacity-60">Source: {selectedFarmer.income_source}</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="px-10 py-10 bg-slate-50 border-t border-slate-100 flex gap-6 shrink-0 rounded-bl-[3.5rem]">
                <button 
                  onClick={() => { setShowViewModal(false); navigate(`/farmers/${selectedFarmer.id}/edit`); }}
                  className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Edit size={16} /> Update Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}