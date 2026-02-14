import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, X, Search, Filter, Wheat, 
  Dog, Bird, Fish, Trees, Box, Info 
} from 'lucide-react';

// --- Skeleton Component for Products ---
const ProductSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Stats Skeleton */}
    <div className="flex gap-4 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="min-w-[120px] flex-1 h-32 bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl mx-auto"></div>
          <div className="h-2 w-12 bg-gray-50 rounded mx-auto"></div>
          <div className="h-4 w-8 bg-gray-200 rounded mx-auto"></div>
        </div>
      ))}
    </div>
    {/* Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-64 space-y-4">
          <div className="flex justify-between">
            <div className="h-10 w-10 bg-gray-100 rounded-xl"></div>
            <div className="h-5 w-16 bg-gray-50 rounded-full"></div>
          </div>
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-50 rounded"></div>
            <div className="h-3 w-5/6 bg-gray-50 rounded"></div>
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
      setTimeout(() => setLoading(false), 500);
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
      alert('Failed to create product');
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
    'Crops': { icon: Wheat, color: 'emerald' },
    'Livestock': { icon: Dog, color: 'amber' },
    'Poultry': { icon: Bird, color: 'orange' },
    'Fishery': { icon: Fish, color: 'blue' },
    'Forestry': { icon: Trees, color: 'green' },
    'Other': { icon: Box, color: 'gray' }
  };

  const getCategoryTheme = (cat) => categoryMap[cat] || categoryMap['Other'];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Commodity Registry</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">Management of local agricultural outputs.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center justify-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Product
          </button>
        )}
      </div>

      {loading ? (
        <ProductSkeleton />
      ) : (
        <>
          {/* Quick Filter Stats - Horizontal Scroll on Mobile */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 min-w-max md:min-w-full">
              {Object.entries(categoryMap).map(([name, theme]) => {
                const count = products.filter(p => p.category === name).length;
                const isActive = filterCategory === name;
                const Icon = theme.icon;

                return (
                  <button
                    key={name}
                    onClick={() => setFilterCategory(isActive ? '' : name)}
                    className={`p-4 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center min-w-[120px] md:min-w-0
                      ${isActive 
                        ? `bg-${theme.color}-50 border-${theme.color}-200 shadow-md ring-2 ring-${theme.color}-500 ring-offset-2` 
                        : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'}`}
                  >
                    <div className={`p-3 rounded-xl mb-2 transition-colors ${isActive ? `bg-${theme.color}-500 text-white` : `bg-${theme.color}-50 text-${theme.color}-600`}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{name}</span>
                    <span className="text-xl font-black text-gray-900">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm text-sm"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-12 pr-10 py-3.5 md:py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm appearance-none font-medium text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Products Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center px-4">
                <Info size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No products match your current filters.</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const theme = getCategoryTheme(product.category);
                const Icon = theme.icon;
                return (
                  <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-${theme.color}-50 text-${theme.color}-600`}><Icon size={24} /></div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${theme.color}-50 text-${theme.color}-700 border border-${theme.color}-100`}>
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight uppercase">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed grow">{product.description || 'No detailed description available.'}</p>
                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                      <button className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                        View Details <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-[32px] sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col transform transition-all">
            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Add Commodity</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Product Identity</label>
                <input type="text" required className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium" placeholder="e.g. Hybrid Rice" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Category Group</label>
                <select className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium appearance-none" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Crops">Crops</option><option value="Livestock">Livestock</option><option value="Poultry">Poultry</option><option value="Fishery">Fishery</option><option value="Forestry">Forestry</option><option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Product Background</label>
                <textarea className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm min-h-[120px]" placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-sm font-bold text-gray-500 order-2 sm:order-1">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all order-1 sm:order-2">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}