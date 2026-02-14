import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, X, Search, Filter, Wheat, 
  Dog, Bird, Fish, Trees, Box, Info, Activity, ChevronRight
} from 'lucide-react';

// --- Skeleton Component ---
const ProductSkeleton = () => (
  <div className="space-y-12 animate-pulse">
    <div className="flex gap-6 overflow-hidden no-scrollbar">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="min-w-[160px] flex-1 h-40 bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl mx-auto"></div>
          <div className="h-3 w-16 bg-slate-50 rounded-full mx-auto"></div>
          <div className="h-6 w-10 bg-slate-100 rounded-lg mx-auto"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 h-72 space-y-6">
          <div className="flex justify-between">
            <div className="h-14 w-14 bg-slate-100 rounded-2xl"></div>
            <div className="h-6 w-20 bg-slate-50 rounded-full"></div>
          </div>
          <div className="h-6 w-3/4 bg-slate-100 rounded-lg"></div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-50 rounded"></div>
            <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({ name: '', category: 'Crops', description: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.create(formData);
      setShowModal(false);
      fetchProducts();
      setFormData({ name: '', category: 'Crops', description: '' });
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const canCreate = hasPermission(['admin', 'researcher']);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const categoryMap = {
    'Crops': { icon: Wheat, color: 'text-emerald-600', bg: 'bg-emerald-50', active: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
    'Livestock': { icon: Dog, color: 'text-amber-600', bg: 'bg-amber-50', active: 'bg-amber-500', shadow: 'shadow-amber-200' },
    'Poultry': { icon: Bird, color: 'text-orange-600', bg: 'bg-orange-50', active: 'bg-orange-500', shadow: 'shadow-orange-200' },
    'Fishery': { icon: Fish, color: 'text-blue-600', bg: 'bg-blue-50', active: 'bg-blue-500', shadow: 'shadow-blue-200' },
    'Forestry': { icon: Trees, color: 'text-green-600', bg: 'bg-green-50', active: 'bg-green-500', shadow: 'shadow-green-200' },
    'Other': { icon: Box, color: 'text-slate-600', bg: 'bg-slate-50', active: 'bg-slate-500', shadow: 'shadow-slate-200' }
  };

  const getTheme = (cat) => categoryMap[cat] || categoryMap['Other'];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-emerald-100 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200">
                <Activity size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">Supply Chain Registry</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Commodity Registry</h1>
            <p className="text-slate-500 font-medium mt-2">Centralized database for regional agricultural and livestock outputs.</p>
          </div>
          
          {canCreate && (
            <button 
              onClick={() => setShowModal(true)} 
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add Commodity</span>
            </button>
          )}
        </header>

        {loading ? (
          <div className="px-4"><ProductSkeleton /></div>
        ) : (
          <>
            {/* Category Quick Filters */}
            <div className="px-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-6 min-w-max pb-4">
                {Object.entries(categoryMap).map(([name, theme]) => {
                  const count = products.filter(p => p.category === name).length;
                  const isActive = filterCategory === name;
                  const Icon = theme.icon;

                  return (
                    <button
                      key={name}
                      onClick={() => setFilterCategory(isActive ? '' : name)}
                      className={`flex-1 min-w-[160px] p-6 rounded-[2.5rem] border transition-all duration-500 text-center flex flex-col items-center group relative overflow-hidden
                        ${isActive 
                          ? `${theme.bg} border-transparent shadow-xl ${theme.shadow} -translate-y-2` 
                          : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}
                    >
                      <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 ${isActive ? `${theme.active} text-white scale-110 shadow-lg` : `${theme.bg} ${theme.color} group-hover:scale-110`}`}>
                        <Icon size={28} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? theme.color : 'text-slate-400'}`}>{name}</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Architecture */}
            <div className="px-4">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-3 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Search commodities by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative w-full md:w-72">
                  <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="w-full pl-16 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="px-4">
              {filteredProducts.length === 0 ? (
                <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                  <div className="p-8 bg-slate-50 rounded-full inline-flex text-slate-200 mb-8">
                    <Box size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Registry Entry Not Found</h3>
                  <p className="text-slate-400 font-medium mt-3">Try adjusting your category or search filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => {
                    const theme = getTheme(product.category);
                    const Icon = theme.icon;
                    return (
                      <div key={product.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden">
                        {/* Interactive Background Glow */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${theme.bg} opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-3xl`} />
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className={`p-4 rounded-2xl ${theme.bg} ${theme.color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <Icon size={28} />
                          </div>
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${theme.bg} ${theme.color} border-slate-100 shadow-sm`}>
                            {product.category}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-400 line-clamp-3 leading-relaxed mb-10 flex-grow italic">
                          "{product.description || 'System data: No commodity background provided for this entry.'}"
                        </p>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-2 text-slate-300">
                             <Info size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Scientific ID: {product.id}</span>
                          </div>
                          <button className="p-2 bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-90">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* MODERN MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
              
              <div className="p-10 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-10 shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Add Commodity</h2>
                  <p className="text-slate-400 font-medium text-sm mt-1">Append new output types to the regional registry.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-300">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commodity Name</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold shadow-inner" placeholder="e.g. Arabica Coffee Beans" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Group</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Crops', 'Livestock', 'Poultry', 'Fishery', 'Forestry', 'Other'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.category === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commodity Background</label>
                  <textarea className="w-full px-6 py-5 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium shadow-inner min-h-[140px]" placeholder="Outline seasonal availability, variety specs, or regional notes..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </form>

              <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-6 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Abort</button>
                <button type="submit" className="px-12 py-5 bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all">Record Commodity</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}