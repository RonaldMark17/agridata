import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, X, Search, Filter, Wheat, 
  Dog, Bird, Fish, Trees, Box, Info, Activity, ChevronRight, Loader2,
  Edit, Trash2, Download, Eye, ArrowUpDown, AlertCircle, Save // <-- Add Save here
} from 'lucide-react';

// --- Skeleton Component ---
const ProductSkeleton = () => (
  <div className="space-y-12 animate-pulse">
    <div className="flex gap-6 overflow-hidden no-scrollbar">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="min-w-[160px] flex-1 h-40 bg-white dark:bg-[#0b241f] rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 space-y-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl mx-auto"></div>
          <div className="h-3 w-16 bg-slate-50 dark:bg-white/5 rounded-full mx-auto"></div>
          <div className="h-6 w-10 bg-slate-100 dark:bg-white/5 rounded-lg mx-auto"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 h-72 space-y-6">
          <div className="flex justify-between">
            <div className="h-14 w-14 bg-slate-100 dark:bg-white/5 rounded-2xl"></div>
            <div className="h-6 w-20 bg-slate-50 dark:bg-white/5 rounded-full"></div>
          </div>
          <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-50 dark:bg-white/5 rounded"></div>
            <div className="h-3 w-5/6 bg-slate-50 dark:bg-white/5 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // State
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const { hasPermission } = useAuth();
  const canManage = hasPermission(['admin', 'researcher']);

  const initialForm = { name: '', category: 'Crops', description: '' };
  const [formData, setFormData] = useState(initialForm);

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
    setSubmitting(true);
    setError('');

    try {
      if (editingProduct) {
        // FIX: Now calling the actual API update endpoint
        await productsAPI.update(editingProduct.id, formData);
      } else {
        await productsAPI.create(formData);
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.error || "Failed to save commodity. Name might be duplicate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Archive this commodity? This action cannot be undone.")) {
      try {
        // FIX: Now calling the actual API delete endpoint
        await productsAPI.delete(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        alert(err.response?.data?.error || "Cannot delete commodity. It is likely linked to existing farmers.");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || ''
    });
    setShowModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowViewModal(false);
    setEditingProduct(null);
    setSelectedProduct(null);
    setFormData(initialForm);
    setError('');
  };

  const handleExport = () => {
    setIsExporting(true);
    const headers = ["ID", "Name", "Category", "Description"];
    const rows = products.map(p => [p.id, `"${p.name}"`, p.category, `"${p.description}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `commodities_registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  // --- Filtering & Sorting ---
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    });

  const categories = [...new Set(products.map(p => p.category))];

  const categoryMap = {
    'Crops': { icon: Wheat, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', active: 'bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-none' },
    'Livestock': { icon: Dog, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', active: 'bg-amber-500', shadow: 'shadow-amber-200 dark:shadow-none' },
    'Poultry': { icon: Bird, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', active: 'bg-orange-500', shadow: 'shadow-orange-200 dark:shadow-none' },
    'Fishery': { icon: Fish, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', active: 'bg-blue-500', shadow: 'shadow-blue-200 dark:shadow-none' },
    'Forestry': { icon: Trees, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', active: 'bg-green-500', shadow: 'shadow-green-200 dark:shadow-none' },
    'Other': { icon: Box, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', active: 'bg-slate-500', shadow: 'shadow-slate-200 dark:shadow-none' }
  };

  const getTheme = (cat) => categoryMap[cat] || categoryMap['Other'];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 transition-colors duration-300 pb-20 relative">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 py-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                <Activity size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">Supply Chain Registry</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Commodity Registry</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Centralized database for regional agricultural and livestock outputs.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
            >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>Export CSV</span>
            </button>
            {canManage && (
              <button 
                onClick={() => setShowModal(true)} 
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Add Commodity</span>
              </button>
            )}
          </div>
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
                          : 'bg-white dark:bg-[#0b241f] border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-emerald-500/30 shadow-sm'}`}
                    >
                      <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 ${isActive ? `${theme.active} text-white scale-110 shadow-lg` : `${theme.bg} ${theme.color} group-hover:scale-110`}`}>
                        <Icon size={28} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? theme.color : 'text-slate-400 dark:text-slate-500'}`}>{name}</span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Architecture */}
            <div className="px-4 flex flex-col md:flex-row gap-4">
              <div className="bg-white dark:bg-[#0b241f] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm p-2 flex items-center transition-all flex-1">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="text"
                    className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Search commodities by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="hidden md:block w-px h-8 bg-slate-100 dark:bg-white/10 mx-2"></div>
                <div className="relative w-full md:w-64">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <select
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none cursor-pointer"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="" className="dark:bg-[#0b241f]">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat} className="dark:bg-[#0b241f]">{cat}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="bg-white dark:bg-[#0b241f] p-4 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:text-emerald-600 transition-colors"
              >
                <ArrowUpDown size={20} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'}/>
              </button>
            </div>

            {/* Content Grid */}
            <div className="px-4">
              {filteredProducts.length === 0 ? (
                <div className="py-32 bg-white dark:bg-[#0b241f] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/10 text-center transition-colors">
                  <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-full inline-flex text-slate-200 dark:text-slate-700 mb-8">
                    <Box size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registry Entry Not Found</h3>
                  <p className="text-slate-400 dark:text-slate-500 font-medium mt-3">Try adjusting your category or search filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => {
                    const theme = getTheme(product.category);
                    const Icon = theme.icon;
                    return (
                      <div key={product.id} className="group bg-white dark:bg-[#0b241f] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] dark:hover:shadow-black/40 hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden h-full">
                        {/* Interactive Background Glow */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${theme.bg} opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-3xl`} />
                        
                        {/* Action Menu (New Feature) */}
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <button onClick={() => handleView(product)} className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-400 hover:text-emerald-500 shadow-sm border border-slate-100 dark:border-white/10"><Eye size={16}/></button>
                            {canManage && (
                                <>
                                    <button onClick={() => handleEdit(product)} className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-400 hover:text-blue-500 shadow-sm border border-slate-100 dark:border-white/10"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 dark:border-white/10"><Trash2 size={16}/></button>
                                </>
                            )}
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className={`p-4 rounded-2xl ${theme.bg} ${theme.color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <Icon size={28} />
                          </div>
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${theme.bg} ${theme.color} border-slate-100 dark:border-white/5 shadow-sm`}>
                            {product.category}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {product.name}
                        </h3>
                        
                        <div className="flex-grow">
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 line-clamp-3 leading-relaxed mb-6 italic">
                            "{product.description || 'System data: No commodity background provided for this entry.'}"
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600">
                             <Info size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">ID: {product.id}</span>
                          </div>
                          <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 dark:text-slate-500 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-600 transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* VIEW MODAL (NEW) */}
        {showViewModal && selectedProduct && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={closeModal} />
                <div className="relative bg-white dark:bg-[#041d18] rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border dark:border-white/5">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">Commodity Details</h3>
                        <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                <Wheat size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight mb-2">{selectedProduct.name}</h2>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedProduct.category}</span>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Description / Specs</p>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                {selectedProduct.description || "No detailed description available in the registry."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* CREATE/EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
            <div className="relative bg-white dark:bg-[#041d18] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border dark:border-white/5">
              
              <div className="p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl z-10 shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingProduct ? 'Edit Commodity' : 'Add Commodity'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">Manage regional output registry.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-300 dark:text-slate-600">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                
                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-500/20">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold">{error}</span>
                    </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Commodity Name</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" placeholder="e.g. Arabica Coffee Beans" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Classification Group</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {['Crops', 'Livestock', 'Poultry', 'Fishery', 'Forestry', 'Other'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.category === cat ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Commodity Background</label>
                  <textarea className="w-full px-6 py-5 bg-slate-50 dark:bg-white/5 border-none rounded-3xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium dark:text-slate-200 shadow-inner min-h-[140px] outline-none transition-all" placeholder="Outline seasonal availability, variety specs, or regional notes..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </form>

              <div className="px-10 py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-6 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Abort</button>
                <button 
                    type="submit" 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-12 py-5 bg-emerald-600 dark:bg-emerald-600 text-white dark:text-[#041d18] rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                    <span>{editingProduct ? 'Save Changes' : 'Record Commodity'}</span>
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