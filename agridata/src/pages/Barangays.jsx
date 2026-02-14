import React, { useState, useEffect } from 'react';
import { barangaysAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, MapPin, Users, Sprout, 
  X, Info, TrendingUp, ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- Skeleton Component for Barangay Cards ---
const BarangaySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-48 bg-gray-100 rounded"></div>
          </div>
          <div className="h-8 w-8 bg-gray-50 rounded-lg"></div>
        </div>
        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="flex justify-between"><div className="h-3 w-16 bg-gray-100 rounded"></div><div className="h-3 w-12 bg-gray-200 rounded"></div></div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-100 rounded"></div>
            <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
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
      setTimeout(() => setLoading(false), 500);
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
      alert('Failed to create barangay record.');
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
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Community Profiles</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">Agricultural mapping per barangay.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center justify-center px-5 md:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Barangay
          </button>
        )}
      </div>

      {/* Stats Summary - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: 'Registered Barangays', val: barangays.length, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Population', val: totalPopulation.toLocaleString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Agri Households', val: totalAgriHouseholds.toLocaleString(), icon: Sprout, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 md:gap-5">
            <div className={`p-3 md:p-4 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon size={24} className="md:w-6 md:h-6 w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm text-sm"
          placeholder="Filter communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Barangays Grid / Skeleton */}
      {loading ? (
        <BarangaySkeleton />
      ) : filteredBarangays.length === 0 ? (
        <div className="py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center px-4">
          <p className="text-gray-500 font-medium">No communities found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredBarangays.map((b) => {
            const agriPerc = getAgriPercentage(b);
            return (
              <div key={b.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{b.name}</h3>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                        <MapPin size={14} className="shrink-0" /> <span className="truncate">{b.municipality}</span>
                      </p>
                    </div>
                    <div className="text-emerald-100 group-hover:text-emerald-500 transition-colors shrink-0">
                      <TrendingUp size={24} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Population</span>
                      <span className="font-bold text-gray-900">{(b.population || 0).toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span>Agricultural Coverage</span>
                        <span className="text-emerald-600">{agriPerc}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
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

      {/* Adaptive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform transition-all">
            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">New Barangay</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                  <Info size={14} /> Location Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Name</label>
                    <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Municipality</label>
                    <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.municipality} onChange={(e) => setFormData({ ...formData, municipality: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-[10px]">
                  <Users size={14} /> Demographics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Population</label>
                    <input type="number" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" value={formData.population} onChange={(e) => setFormData({ ...formData, population: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Households</label>
                    <input type="number" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" value={formData.total_households} onChange={(e) => setFormData({ ...formData, total_households: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Agri Units</label>
                    <input type="number" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" value={formData.agricultural_households} onChange={(e) => setFormData({ ...formData, agricultural_households: e.target.value })} />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-500">Discard</button>
              <button onClick={handleSubmit} className="w-full sm:w-auto px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all">Save Barangay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}