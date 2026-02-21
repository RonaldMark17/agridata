import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmersAPI, barangaysAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Download, Plus, ChevronLeft, ChevronRight, 
  Eye, Edit, MapPin, Ruler, Trash2, X, Calendar, Loader2, ArrowUpDown,
  Phone, Briefcase, DollarSign, Globe, LayoutList, LayoutGrid, PieChart, 
  TrendingUp, Activity, User, Wheat, Baby, GraduationCap, Tag,
  Building, BookOpen, Clock, FileText
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace(/\/api\/?$/, '');

// --- Skeleton Loader ---
const TableSkeleton = ({ viewMode }) => (
  viewMode === 'list' ? (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-10 py-7">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-slate-100 dark:bg-white/5 rounded-2xl"></div>
              <div className="space-y-3">
                <div className="h-4 w-48 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
                <div className="h-3 w-24 bg-slate-50 dark:bg-white/5 rounded-md"></div>
              </div>
            </div>
          </td>
          <td className="px-10 py-7"><div className="h-6 w-32 bg-slate-50 dark:bg-white/5 rounded-xl"></div></td>
          <td className="px-10 py-7"><div className="h-8 w-24 bg-slate-50 dark:bg-white/5 rounded-xl"></div></td>
          <td className="px-10 py-7 text-right"><div className="h-10 w-10 bg-slate-50 dark:bg-white/5 rounded-xl ml-auto"></div></td>
        </tr>
      ))}
    </>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] animate-pulse"></div>
      ))}
    </div>
  )
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
  
  // View Mode State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  const navigate = useNavigate();
  
  const { user } = useAuth();
  const canEdit = user && ['admin', 'researcher', 'data_encoder'].includes(user.role);
  const canDelete = user && user.role === 'admin';

  useEffect(() => { fetchBarangays(); }, []);
  useEffect(() => { fetchFarmers(); }, [currentPage, search, selectedBarangay, sortBy, sortOrder]);

  // Aggregate Metrics
  const totalHectares = farmers.reduce((acc, f) => acc + (f.farm_size_hectares || 0), 0);
  const avgIncome = farmers.length > 0 ? farmers.reduce((acc, f) => acc + (f.annual_income || 0), 0) / farmers.length : 0;

  const fetchBarangays = async () => {
    try {
      const response = await barangaysAPI.getAll();
      setBarangays(response.data);
    } catch (error) { console.error('Error fetching barangays:', error); }
  };

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 20, sort_by: sortBy, sort_order: sortOrder };
      if (search) params.search = search;
      if (selectedBarangay) params.barangay_id = selectedBarangay;
      
      const response = await farmersAPI.getAll(params);
      
      if (response.data && response.data.farmers) {
        setFarmers(response.data.farmers);
        setTotalPages(response.data.pages || 1);
      } else {
        setFarmers([]);
      }
    } catch (error) { 
      console.error('Error fetching farmers:', error);
      setFarmers([]); 
    } finally { 
      setTimeout(() => setLoading(false), 800); 
    }
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

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'owner': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'tenant': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'lessee': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      default: return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border-slate-200 dark:border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 pb-20 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* 1. HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 pt-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                <Globe size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">Census Bureau</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Farmer Directory</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Centralized data engine for agricultural profiling and land tracking.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={handleExport} 
              disabled={exporting}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-100 transition-all shadow-sm disabled:opacity-50"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>{exporting ? 'Processing' : 'Export Ledger'}</span>
            </button>
            {canEdit && (
              <Link to="/farmers/new" className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all">
                <Plus size={16} /> <span>Onboard Farmer</span>
              </Link>
            )}
          </div>
        </header>

        {/* 2. METRICS BAR */}
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-500/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-[#0b241f] rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm"><PieChart size={20}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-500">Total Land Coverage</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{totalHectares.toLocaleString()} <span className="text-sm font-bold text-slate-400">ha</span></p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50/50 dark:bg-blue-500/5 p-6 rounded-[2rem] border border-blue-100/50 dark:border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-[#0b241f] rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm"><TrendingUp size={20}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 dark:text-blue-500">Avg. Annual Income</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(avgIncome)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CONTROL HUB */}
        <div className="px-4">
          <div className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm p-3 flex flex-col xl:flex-row items-center gap-4 transition-all">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Query database by name, code, or identity..."
                className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-white/5 border-none rounded-[1.5rem] text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
              <div className="flex bg-slate-50 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-white/5">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3.5 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#041d18] text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutList size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-3.5 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#041d18] text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={20} />
                </button>
              </div>

              <div className="relative flex-1 sm:w-56">
                <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <select
                  className="w-full pl-16 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-none rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none outline-none cursor-pointer focus:ring-4 focus:ring-emerald-500/5 shadow-inner"
                  value={selectedBarangay}
                  onChange={(e) => { setSelectedBarangay(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Areas</option>
                  {barangays.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="relative flex-1 sm:w-56">
                <ArrowUpDown className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <select
                  className="w-full pl-16 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-none rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 appearance-none outline-none cursor-pointer focus:ring-4 focus:ring-emerald-500/5 shadow-inner"
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

        {/* 4. DATA DISPLAY */}
        <div className="px-4">
          <div className="bg-white dark:bg-[#0b241f] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden transition-all hover:shadow-2xl">
            
            {viewMode === 'list' ? (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-emerald-500/50 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100 dark:border-white/5">
                      <th className="px-10 py-6">Core Identity</th>
                      <th className="px-10 py-6">Assigned Territory</th>
                      <th className="px-10 py-6">Status & Tenure</th>
                      <th className="px-10 py-6 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {loading ? <TableSkeleton viewMode="list" /> : farmers.map((farmer) => (
                      <tr key={farmer.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black shadow-inner border border-slate-100 dark:border-white/10 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                              {farmer.profile_image ? (
                                <img src={getImageUrl(farmer.profile_image)} alt={farmer.first_name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-lg">{getInitials(farmer.full_name)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                {farmer.full_name} {farmer.suffix && <span className="text-xs text-slate-400 font-bold ml-1">{farmer.suffix}</span>}
                              </p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-1 inline-flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                               #{farmer.farmer_code}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <MapPin size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                            {farmer.barangay?.name || 'Unassigned'}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(farmer.land_ownership)}`}>
                            {farmer.land_ownership || 'Unknown'}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium ml-1">{farmer.years_farming} years exp.</p>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button onClick={() => handleViewDetails(farmer.id)} className="p-3 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 rounded-xl shadow-sm transition-all"><Eye size={18} /></button>
                            {canEdit && <button onClick={() => navigate(`/farmers/${farmer.id}/edit`)} className="p-3 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 rounded-xl shadow-sm transition-all"><Edit size={18} /></button>}
                            {canDelete && <button onClick={() => handleDelete(farmer.id, farmer.full_name)} className="p-3 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 rounded-xl shadow-sm transition-all"><Trash2 size={18} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // GRID VIEW
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-slate-50/50 dark:bg-black/10">
                {loading ? <TableSkeleton viewMode="grid" /> : farmers.map((farmer) => (
                  <div key={farmer.id} className="bg-white dark:bg-[#041d18] p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group flex flex-col gap-6 relative overflow-hidden">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black shadow-inner border border-slate-100 dark:border-white/10 overflow-hidden">
                        {farmer.profile_image ? (
                          <img src={getImageUrl(farmer.profile_image)} alt={farmer.first_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl">{getInitials(farmer.full_name)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white leading-tight">
                          {farmer.full_name} {farmer.suffix && <span className="text-xs text-slate-400">{farmer.suffix}</span>}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">{farmer.barangay?.name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Area</p>
                        <p className="font-bold text-slate-800 dark:text-white">{farmer.farm_size_hectares} <span className="text-xs text-slate-400">ha</span></p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Tenure</p>
                        <p className="font-bold text-slate-800 dark:text-white">{farmer.years_farming} <span className="text-xs text-slate-400">yrs</span></p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex gap-2">
                      <button onClick={() => handleViewDetails(farmer.id)} className="flex-1 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">Profile</button>
                      {canEdit && <button onClick={() => navigate(`/farmers/${farmer.id}/edit`)} className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"><Edit size={18}/></button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="px-10 py-8 bg-white dark:bg-[#0b241f] flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-white/5 gap-6">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Stream <span className="text-slate-900 dark:text-white">{currentPage}</span> / {totalPages}</p>
                <div className="flex gap-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 bg-slate-50 dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 disabled:opacity-30 transition-all shadow-sm"><ChevronLeft size={20}/></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 bg-slate-50 dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 disabled:opacity-30 transition-all shadow-sm"><ChevronRight size={20}/></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- 4. DOSSIER SLIDE-OVER --- */}
        {showViewModal && selectedFarmer && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-end overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowViewModal(false)} />
            
            <div className="relative bg-white dark:bg-[#041d18] h-[96%] w-full max-w-2xl shadow-2xl flex flex-col transform animate-in slide-in-from-right duration-500 rounded-l-[3.5rem] mr-0 my-auto border-y border-l border-slate-100 dark:border-white/5">
              <div className="p-10 flex justify-between items-center border-b border-slate-50 dark:border-white/5 bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl shrink-0 rounded-tl-[3.5rem]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-inner"><Activity size={20}/></div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Profile Dossier</h2>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-slate-300 dark:text-slate-600 transition-all"><X size={28}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
                
                {/* Visual Identity */}
                <div className="text-center space-y-6">
                  <div className="h-40 w-40 mx-auto rounded-[3rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-5xl font-black text-emerald-700 dark:text-emerald-400 shadow-inner border-8 border-white dark:border-[#0b241f] ring-1 ring-slate-100 dark:ring-white/5 overflow-hidden transition-all">
                    {selectedFarmer.profile_image ? (
                        <img src={getImageUrl(selectedFarmer.profile_image)} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        getInitials(selectedFarmer.full_name)
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                      {selectedFarmer.full_name} {selectedFarmer.suffix && <span className="text-lg text-slate-400">{selectedFarmer.suffix}</span>}
                    </h3>
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="inline-flex items-center px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                          <span className="text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest text-[10px]">Code: {selectedFarmer.farmer_code}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
                          <Building size={12} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-700 dark:text-blue-400 font-black uppercase tracking-widest text-[10px] truncate max-w-[150px]">
                              {selectedFarmer.organization?.name || 'Independent'}
                          </span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Territory', val: selectedFarmer.barangay?.name, icon: MapPin, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-white/5' },
                    { label: 'Land Area', val: `${selectedFarmer.farm_size_hectares} ha`, icon: Ruler, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-500/5' },
                    { label: 'Tenure', val: selectedFarmer.years_farming + ' yrs', icon: Briefcase, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-500/5' },
                    { label: 'Status', val: selectedFarmer.land_ownership, icon: User, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-500/5' },
                  ].map((m, i) => (
                    <div key={i} className={`${m.bg} p-5 rounded-[2rem] border border-white/50 dark:border-white/5 flex flex-col gap-1 shadow-sm`}>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${m.color}`}><m.icon size={12} /> {m.label}</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{m.val || 'Data Pending'}</span>
                    </div>
                  ))}
                </div>

                {/* Demographics Block */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700 ml-2">Personal Identity</p>
                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 dark:text-slate-500 shadow-inner"><Calendar size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Birth & Demographics</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedFarmer.age}y • {selectedFarmer.gender} • {selectedFarmer.civil_status}</p>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">Born: {selectedFarmer.birth_date || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 dark:text-slate-500 shadow-inner"><Phone size={20}/></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Contact Protocol</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{selectedFarmer.contact_number || 'No link established'}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 truncate italic">{selectedFarmer.address || 'Location data not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 dark:text-slate-500 shadow-inner"><GraduationCap size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Education Level</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedFarmer.education_level || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Economic & Yield Matrix */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/50 dark:text-emerald-500/30 ml-2">Economic Matrix</p>
                    <div className="bg-emerald-900/5 dark:bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/10 dark:border-emerald-500/20 space-y-6">
                        
                        <div className="flex items-start gap-6">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl shadow-inner"><DollarSign size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Gross Annual Income</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(selectedFarmer.annual_income)}</p>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter mt-1 opacity-80">Source: {selectedFarmer.income_source}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-emerald-500/10">
                           <div className="flex items-center gap-2 mb-4 text-emerald-800 dark:text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                              <Briefcase size={12}/> Occupations
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/60 dark:bg-black/20 p-4 rounded-2xl">
                                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Primary</p>
                                 <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedFarmer.primary_occupation || 'Farming'}</p>
                              </div>
                              <div className="bg-white/60 dark:bg-black/20 p-4 rounded-2xl">
                                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Secondary</p>
                                 <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedFarmer.secondary_occupation || 'None'}</p>
                              </div>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Crop Yield Data */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/50 dark:text-amber-500/30 ml-2">Agricultural Yield</p>
                    <div className="bg-amber-50 dark:bg-amber-500/5 p-8 rounded-[2.5rem] border border-amber-500/10 dark:border-amber-500/20">
                        {selectedFarmer.products && selectedFarmer.products.length > 0 ? (
                           <div className="space-y-3">
                              {selectedFarmer.products.map((p, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-white/60 dark:bg-black/20 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                       <Wheat size={16} className="text-amber-600 dark:text-amber-500"/>
                                       <div>
                                          <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                             {p.product_name} 
                                             {p.is_primary && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[8px] rounded-md uppercase tracking-wider font-black">Primary</span>}
                                          </p>
                                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Est. Price: ₱{p.selling_price || 0}</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="font-black text-amber-700 dark:text-amber-500">{p.production_volume}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.unit}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="text-sm font-medium text-slate-500 italic text-center py-4">No yield data recorded.</p>
                        )}
                    </div>
                </div>

                {/* NEW: Recorded Experiences */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600/50 dark:text-indigo-500/30 ml-2">Field Experiences</p>
                    <div className="bg-indigo-50 dark:bg-indigo-500/5 p-8 rounded-[2.5rem] border border-indigo-500/10 dark:border-indigo-500/20">
                        {selectedFarmer.experiences && selectedFarmer.experiences.length > 0 ? (
                           <div className="space-y-4">
                              {selectedFarmer.experiences.map((exp, i) => (
                                 <div key={i} className="p-5 bg-white/60 dark:bg-black/20 rounded-2xl border border-indigo-100 dark:border-white/5">
                                     <div className="flex justify-between items-start mb-3">
                                         <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                             {exp.experience_type}
                                         </span>
                                         <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {new Date(exp.date_recorded).toLocaleDateString()}</span>
                                     </div>
                                     <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1.5">{exp.title}</p>
                                     <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{exp.description}</p>
                                     {exp.impact_level && (
                                         <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 mt-4 uppercase tracking-widest">Impact Level: {exp.impact_level}</p>
                                     )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="text-sm font-medium text-slate-500 italic text-center py-4">No field experiences logged.</p>
                        )}
                    </div>
                </div>

                {/* UPDATED: Family & Succession */}
                <div className="space-y-6 pb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/50 dark:text-blue-500/30 ml-2">Family & Succession</p>
                    <div className="bg-blue-50 dark:bg-blue-500/5 p-8 rounded-[2.5rem] border border-blue-500/10 dark:border-blue-500/20">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-blue-500/10">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner"><Baby size={20}/></div>
                              <div>
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Institutional Lineage Registry</h4>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Descendants: {selectedFarmer.number_of_children || 0}</p>
                              </div>
                           </div>
                           <div className="text-right">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Succession Status</p>
                             <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedFarmer.children_farming_involvement ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
                                {selectedFarmer.children_farming_involvement ? 'Active Continuity' : 'No Succession'}
                             </span>
                           </div>
                        </div>
                        
                        {selectedFarmer.children && selectedFarmer.children.length > 0 ? (
                           <div className="space-y-4">
                              {selectedFarmer.children.map((c, i) => (
                                 <div key={i} className="p-5 bg-white/60 dark:bg-black/20 rounded-2xl flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                                {c.name}
                                                {c.continues_farming && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[8px] uppercase tracking-widest rounded-md border border-emerald-200 dark:border-emerald-500/30">Successor</span>}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{c.age}y • {c.gender} • {c.education_level}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Involvement</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.involvement_level || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Child Details */}
                                    {(c.current_occupation || c.notes) && (
                                        <div className="pt-3 border-t border-blue-500/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {c.current_occupation && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Current Occupation</p>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{c.current_occupation}</p>
                                                </div>
                                            )}
                                            {c.notes && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Remarks</p>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 italic line-clamp-2">"{c.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-6 text-center border-2 border-dashed border-blue-500/20 rounded-2xl bg-white/40 dark:bg-black/10">
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {selectedFarmer.number_of_children > 0 
                                  ? `Census indicates ${selectedFarmer.number_of_children} descendant(s), but no detailed profiles have been appended.`
                                  : 'No lineage or descendant data on record.'}
                              </p>
                           </div>
                        )}
                    </div>
                </div>

                {/* UPDATED: System Meta Footer */}
                <div className="pt-10 pb-6 flex flex-col items-center justify-center text-center space-y-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Globe size={14} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">System Registry Data</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-4 py-2 rounded-xl">DB ID: #{selectedFarmer.id}</span>
                        <span className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-4 py-2 rounded-xl">Encoded By: {selectedFarmer.data_encoder_id || 'System Auth'}</span>
                        <span className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-4 py-2 rounded-xl">Registered: {new Date(selectedFarmer.created_at).toLocaleString()}</span>
                        {selectedFarmer.updated_at && (
                            <span className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-4 py-2 rounded-xl">Last Revision: {new Date(selectedFarmer.updated_at).toLocaleString()}</span>
                        )}
                    </div>
                </div>

              </div>

              <div className="px-10 py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex gap-6 shrink-0 rounded-bl-[3.5rem]">
                <button 
                  onClick={() => { setShowViewModal(false); navigate(`/farmers/${selectedFarmer.id}/edit`); }}
                  className="flex-1 py-5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#041d18] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 dark:hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Edit size={16} /> Update Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}