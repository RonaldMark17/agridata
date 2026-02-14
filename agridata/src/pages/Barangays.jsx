import React, { useState, useEffect } from 'react';
import { barangaysAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, MapPin, Users, Sprout, 
  X, Info, TrendingUp, ChevronLeft, ChevronRight, Activity, Globe, Loader2
} from 'lucide-react';

// --- Skeleton Component (Dark Mode Compatible) ---
const BarangaySkeleton = () => (
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
          <div className="flex justify-between"><div className="h-4 w-20 bg-slate-50 dark:bg-white/5 rounded"></div><div className="h-4 w-12 bg-slate-100 dark:bg-white/5 rounded"></div></div>
          <div className="space-y-3">
            <div className="h-2 w-full bg-slate-50 dark:bg-white/5 rounded-full"></div>
            <div className="h-2 w-2/3 bg-slate-50 dark:bg-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function Barangays() {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    name: '', municipality: '', province: '',
    region: 'Region IV-A (CALABARZON)',
    population: '', total_households: '', agricultural_households: ''
  });

  useEffect(() => {
    fetchBarangays();
  }, []);

  const fetchBarangays = async () => {
    setLoading(true);
    try {
      const response = await barangaysAPI.getAll();
      setBarangays(response.data);
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await barangaysAPI.create(formData);
      setShowModal(false);
      fetchBarangays();
      setFormData({
        name: '', municipality: '', province: '',
        region: 'Region IV-A (CALABARZON)',
        population: '', total_households: '', agricultural_households: ''
      });
    } catch (error) {
      console.error('Error creating barangay:', error);
    }
  };

  const canCreate = hasPermission(['admin', 'data_encoder']);

  const filteredBarangays = barangays.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.municipality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgriPercentage = (b) => {
    if (!b.total_households || !b.agricultural_households) return 0;
    return ((b.agricultural_households / b.total_households) * 100).toFixed(1);
  };

  const totalPopulation = barangays.reduce((sum, b) => sum + (Number(b.population) || 0), 0);
  const totalAgriHouseholds = barangays.reduce((sum, b) => sum + (Number(b.agricultural_households) || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 py-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                <Globe size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">Territorial Mapping</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Community Profiles</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Comprehensive demographic and agricultural data per barangay.</p>
          </div>
          
          {canCreate && (
            <button 
              onClick={() => setShowModal(true)} 
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add Barangay</span>
            </button>
          )}
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {[
            { label: 'Mapped Units', val: barangays.length, icon: MapPin, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Regional Population', val: totalPopulation.toLocaleString(), icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Active Agri Units', val: totalAgriHouseholds.toLocaleString(), icon: Sprout, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
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

        {/* Search Bar */}
        <div className="px-4">
          <div className="bg-white dark:bg-[#0b241f] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm p-2 flex items-center transition-colors">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="text"
                className="w-full pl-16 pr-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600"
                placeholder="Filter communities by name or municipality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Barangays Grid */}
        <div className="px-4 pb-20">
          {loading ? (
            <BarangaySkeleton />
          ) : filteredBarangays.length === 0 ? (
            <div className="py-32 bg-white dark:bg-[#0b241f] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/10 text-center transition-colors">
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-full inline-flex text-slate-200 dark:text-slate-700 mb-8">
                <MapPin size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Location Not Found</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium mt-3">Try refining your search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBarangays.map((b) => {
                const agriPerc = getAgriPercentage(b);
                return (
                  <div key={b.id} className="group bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] dark:hover:shadow-black/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="p-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className="min-w-0">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight truncate">{b.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="p-1 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-md">
                                <MapPin size={12} />
                             </div>
                             <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{b.municipality}</span>
                          </div>
                        </div>
                        <div className="text-slate-100 dark:text-white/5 group-hover:text-emerald-500 transition-colors shrink-0">
                          <TrendingUp size={32} />
                        </div>
                      </div>

                      <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-white/5">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Population</p>
                             <p className="text-xl font-black text-slate-900 dark:text-white">{(b.population || 0).toLocaleString()}</p>
                          </div>
                          <div className="text-right space-y-1">
                             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Agri Coverage</p>
                             <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{agriPerc}%</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="w-full bg-slate-50 dark:bg-black/20 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                              style={{ width: `${agriPerc}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL REDESIGN - DARK MODE OPTIMIZED */}
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
            <div className="relative bg-white dark:bg-[#041d18] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border dark:border-white/5">
              
              <div className="p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl z-10 shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">New Barangay Profile</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">Register territorial data for agricultural tracking.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-300 dark:text-slate-600">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                {/* Location Section */}
                <div className="space-y-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 flex items-center gap-3">
                    <Activity size={14} /> Geographical Context
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Barangay Name</label>
                      <input type="text" required className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name..." />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Municipality</label>
                      <input type="text" required className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.municipality} onChange={(e) => setFormData({ ...formData, municipality: e.target.value })} placeholder="Enter municipality..." />
                    </div>
                  </div>
                </div>

                {/* Demographics Section */}
                <div className="space-y-8 pb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 flex items-center gap-3">
                    <Users size={14} /> Demographic Specs
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Population</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.population} onChange={(e) => setFormData({ ...formData, population: e.target.value })} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Total Households</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.total_households} onChange={(e) => setFormData({ ...formData, total_households: e.target.value })} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Agri Units</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.agricultural_households} onChange={(e) => setFormData({ ...formData, agricultural_households: e.target.value })} />
                    </div>
                  </div>
                </div>
              </form>

              <div className="px-10 py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-6 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Discard Draft</button>
                <button onClick={handleSubmit} className="px-12 py-5 bg-emerald-600 dark:bg-emerald-600 text-white dark:text-[#041d18] rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 active:scale-95 transition-all">Save Profile</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}