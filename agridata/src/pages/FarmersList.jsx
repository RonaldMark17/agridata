import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmersAPI, barangaysAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Download, Plus, ChevronLeft, ChevronRight, 
  Eye, Edit, MapPin, Ruler, Trash2, X, Calendar, Info, Loader2, ArrowUpDown,
  Phone, GraduationCap, Briefcase, DollarSign, Sprout, Building2, User
} from 'lucide-react';

// Get Base URL for images (Assumes API is at http://localhost:5001/api)
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace('/api', '');

// --- Skeleton Loader Component ---
const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-slate-50 last:border-none">
        <td className="px-8 py-6"><div className="h-10 w-10 bg-slate-200 rounded-xl"></div></td>
        <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-200 rounded mb-2"></div><div className="h-3 w-20 bg-slate-100 rounded"></div></td>
        <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
        <td className="px-8 py-6"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
        <td className="px-8 py-6 text-right"><div className="h-8 w-8 bg-slate-50 rounded-lg ml-auto"></div></td>
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
  
  // Sorting State
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  
  // Detail Modal State
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const canEdit = hasPermission(['admin', 'researcher', 'data_encoder']);
  const canDelete = hasPermission(['admin']);

  useEffect(() => { fetchBarangays(); }, []);
  
  // Trigger fetch when these dependencies change
  useEffect(() => { 
    fetchFarmers(); 
  }, [currentPage, search, selectedBarangay, sortBy, sortOrder]);

  const fetchBarangays = async () => {
    try {
      const response = await barangaysAPI.getAll();
      setBarangays(response.data);
    } catch (error) { 
      console.error('Error fetching barangays:', error); 
    }
  };

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage,
        per_page: 20,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      if (search) params.search = search;
      if (selectedBarangay) params.barangay_id = selectedBarangay;
      
      const response = await farmersAPI.getAll(params);
      
      setFarmers(response.data.farmers);
      setTotalPages(response.data.pages);
    } catch (error) { 
      console.error('Error fetching farmers:', error); 
    } finally { 
      setTimeout(() => setLoading(false), 400); 
    }
  };

  // --- Handlers ---
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchFarmers();
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [field, order] = value.split('-');
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
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.setAttribute('download', `farmers_export_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to download export file.");
    } finally {
        setExporting(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await farmersAPI.getById(id);
      setSelectedFarmer(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error loading farmer details:", error);
      alert("Could not load farmer details.");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await farmersAPI.delete(id);
        if (farmers.length === 1 && currentPage > 1) {
            setCurrentPage(p => p - 1);
        } else {
            fetchFarmers();
        }
      } catch (error) { 
        console.error("Delete error:", error);
        alert("Delete failed. This farmer may have linked records."); 
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };
  
  const formatCurrency = (val) => val ? `₱${Number(val).toLocaleString()}` : 'N/A';
  
  // Helper to construct full image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // If the path already starts with /, use it directly (assumes it's already /static/uploads/...)
    if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
    // Otherwise, construct the full path
    return `${API_BASE_URL}/uploads/${path}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Farmer Directory</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage agricultural profiles, track land usage, and monitor demographics.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExport} 
            disabled={exporting}
            className="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {exporting ? <Loader2 size={18} className="mr-2 animate-spin text-slate-400" /> : <Download size={18} className="mr-2 text-slate-400 group-hover:text-slate-600 transition-colors" />}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          {canEdit && (
            <Link to="/farmers/new" className="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all shadow-md">
              <Plus size={18} className="mr-2" /> Add Farmer
            </Link>
          )}
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              name="search"
              placeholder="Search by name, ID, or keyword..."
              className="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-2xl focus:bg-slate-50 focus:ring-0 text-sm font-medium placeholder:text-slate-400 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="h-px md:h-12 w-full md:w-px bg-slate-100 mx-2"></div>
          
          {/* Barangay Filter */}
          <div className="md:w-64 relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <select
              className="w-full pl-12 pr-10 py-4 bg-transparent border-none rounded-2xl focus:bg-slate-50 focus:ring-0 text-sm font-bold text-slate-600 appearance-none outline-none cursor-pointer"
              value={selectedBarangay}
              onChange={(e) => { setSelectedBarangay(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Barangays</option>
              {barangays.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="h-px md:h-12 w-full md:w-px bg-slate-100 mx-2"></div>

          {/* Sort Dropdown */}
          <div className="md:w-56 relative group">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <select
              className="w-full pl-12 pr-10 py-4 bg-transparent border-none rounded-2xl focus:bg-slate-50 focus:ring-0 text-sm font-bold text-slate-600 appearance-none outline-none cursor-pointer"
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="last_name-asc">Name (A-Z)</option>
              <option value="last_name-desc">Name (Z-A)</option>
              <option value="farm_size_hectares-desc">Farm Size (High-Low)</option>
              <option value="farm_size_hectares-asc">Farm Size (Low-High)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </form>
      </div>

      {/* 3. RESPONSIVE TABLE */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50/80 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Farmer Profile</th>
                <th className="px-8 py-6">Location</th>
                <th className="px-8 py-6">Land Data</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <TableSkeleton /> : farmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      {/* Avatar / Photo */}
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-700 font-bold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 overflow-hidden border border-slate-100">
                        {farmer.profile_image ? (
                            <img 
                              src={getImageUrl(farmer.profile_image)} 
                              alt={farmer.first_name} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                console.error('Image load error for farmer:', farmer.id);
                                e.target.style.display = 'none';
                                const initials = getInitials(farmer.full_name);
                                e.target.parentElement.innerHTML = `<span class="text-emerald-700 font-bold text-sm">${initials}</span>`;
                              }}
                            />
                        ) : (
                            <span className="text-sm">{getInitials(farmer.full_name)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{farmer.full_name}</p>
                        <p className="text-xs text-emerald-600 font-bold tracking-wide mt-0.5 inline-flex items-center bg-emerald-50 px-2 py-0.5 rounded-md">
                           #{farmer.farmer_code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                      <MapPin size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      {farmer.barangay?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100/50">
                      <Ruler size={14} /> {farmer.farm_size_hectares || 0} ha
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleViewDetails(farmer.id)} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Quick View">
                        <Eye size={18} />
                      </button>
                      {canEdit && (
                        <button onClick={() => navigate(`/farmers/${farmer.id}/edit`)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Profile">
                          <Edit size={18} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(farmer.id, farmer.full_name)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && farmers.length === 0 && (
                  <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-slate-400">
                          <p className="font-medium">No farmers found matching your criteria.</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="p-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:hover:bg-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="p-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:hover:bg-white transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- SLIDE-OVER VIEW MODAL --- */}
      {showViewModal && selectedFarmer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={() => setShowViewModal(false)} />
          
          <div className="relative bg-white h-full w-full max-w-lg shadow-2xl flex flex-col transform animate-in slide-in-from-right duration-500 rounded-l-[40px]">
            <div className="px-8 py-8 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><Info size={20}/></div>
                <h2 className="text-xl font-bold text-slate-900">Farmer Profile</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
              {/* 1. Header Profile */}
              <div className="text-center space-y-5">
                <div className="h-32 w-32 mx-auto rounded-[32px] bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-4xl font-bold text-emerald-700 shadow-inner border-4 border-white ring-1 ring-slate-100 overflow-hidden">
                  {selectedFarmer.profile_image ? (
                      <img 
                        src={getImageUrl(selectedFarmer.profile_image)} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          console.error('Modal image load error');
                          e.target.style.display = 'none';
                          const initials = getInitials(selectedFarmer.full_name);
                          e.target.parentElement.innerHTML = `<span class="text-4xl font-bold text-emerald-700">${initials}</span>`;
                        }}
                      />
                  ) : (
                      getInitials(selectedFarmer.full_name)
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{selectedFarmer.full_name}</h3>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    <span className="text-emerald-700 font-bold uppercase tracking-widest text-[10px]">ID: {selectedFarmer.farmer_code}</span>
                  </div>
                </div>
              </div>

              {/* 2. Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> Location</span>
                  <span className="text-sm font-bold text-slate-700 truncate">{selectedFarmer.barangay?.name || 'N/A'}</span>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1"><Ruler size={10} /> Land Area</span>
                  <span className="text-sm font-bold text-blue-700">{selectedFarmer.farm_size_hectares || 0} ha</span>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1"><Briefcase size={10} /> Experience</span>
                  <span className="text-sm font-bold text-amber-700">{selectedFarmer.years_farming || 0} Years</span>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-3xl border border-purple-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1"><User size={10} /> Status</span>
                  <span className="text-sm font-bold text-purple-700 truncate">{selectedFarmer.land_ownership || 'Unknown'}</span>
                </div>
              </div>

              {/* 3. Personal Information */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3 ml-1">Personal Details</h4>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 mt-0.5"><Calendar size={18} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Demographics</p>
                            <p className="text-sm font-bold text-slate-800">{selectedFarmer.age} Years Old • {selectedFarmer.gender}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Born: {selectedFarmer.birth_date || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 mt-0.5"><Phone size={18} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Contact & Address</p>
                            <p className="text-sm font-bold text-slate-800">{selectedFarmer.contact_number || 'No contact number'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{selectedFarmer.address || 'No address on file'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 mt-0.5"><GraduationCap size={18} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Education</p>
                            <p className="text-sm font-bold text-slate-800">{selectedFarmer.education_level}</p>
                        </div>
                    </div>
                </div>
              </div>

              {/* 4. Economic Profile */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3 ml-1">Economic Profile</h4>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 mt-0.5"><DollarSign size={18} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Annual Income</p>
                            <p className="text-sm font-bold text-slate-800">{formatCurrency(selectedFarmer.annual_income)}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Source: {selectedFarmer.income_source || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 mt-0.5"><Briefcase size={18} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Occupation</p>
                            <p className="text-sm font-bold text-slate-800">Primary: {selectedFarmer.primary_occupation || 'None'}</p>
                            {selectedFarmer.secondary_occupation && (
                                <p className="text-xs text-slate-500 mt-0.5">Secondary: {selectedFarmer.secondary_occupation}</p>
                            )}
                        </div>
                    </div>
                    {selectedFarmer.organization && (
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 mt-0.5"><Building2 size={18} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Affiliation</p>
                                <p className="text-sm font-bold text-slate-800">{selectedFarmer.organization.name}</p>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* 5. Production & Crops */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-3 ml-1">Production</h4>
                {selectedFarmer.products && selectedFarmer.products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {selectedFarmer.products.map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Sprout size={16} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{prod.product_name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{prod.is_primary ? 'Primary Crop' : 'Secondary'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">{Number(prod.production_volume || 0).toLocaleString()} {prod.unit}</p>
                                    <p className="text-xs text-slate-500">Vol / Harvest</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-sm font-medium text-slate-400">No production data recorded.</p>
                    </div>
                )}
              </div>

            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4 sticky bottom-0">
              <button 
                onClick={() => { setShowViewModal(false); navigate(`/farmers/${selectedFarmer.id}/edit`); }}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Edit size={18} /> Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}