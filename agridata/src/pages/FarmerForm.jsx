import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { farmersAPI, barangaysAPI } from '../services/api';
import {
  Save, X, Upload, Sprout, MapPin, User,
  Calendar, Phone, DollarSign, Ruler, Trash2,
  Plus, Loader2, ChevronLeft, AlertCircle
} from 'lucide-react';

// Get Base URL for image previews
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace('/api', '');

export default function FarmerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [barangays, setBarangays] = useState([]);
  const [error, setError] = useState('');

  // Image Preview State
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    extension_name: '', // e.g., Jr., Sr.
    birth_date: '',
    gender: 'Male',
    civil_status: 'Single',
    barangay_id: '',
    address: '',
    contact_number: '',
    education_level: 'High School Graduate',
    primary_occupation: 'Farming',
    years_farming: 0,
    farm_size_hectares: 0,
    land_ownership: 'Owner', // Owner, Tenant, etc.
    annual_income: 0,
    income_source: 'Farming',
    profile_image: null, // File object
    products: [] // Array of { product_name, is_primary, production_volume, unit }
  });

  // --- Initial Data Fetching ---
  useEffect(() => {
    fetchBarangays();
    if (isEditMode) {
      fetchFarmerDetails();
    }
  }, [id]);

  const fetchBarangays = async () => {
    try {
      const response = await barangaysAPI.getAll();
      setBarangays(response.data);
    } catch (err) {
      console.error("Failed to load barangays", err);
    }
  };

  const fetchFarmerDetails = async () => {
    try {
      const response = await farmersAPI.getById(id);
      const data = response.data;

      // Set Image Preview if exists
      // Safe image URL builder
      const getImageUrl = (path) => {
        if (!path) return null;

        if (path.startsWith('http')) return path;

        let cleanPath = path.trim();

        if (cleanPath.startsWith('/')) {
          cleanPath = cleanPath.slice(1);
        }

        // remove duplicate folders
        if (cleanPath.startsWith('uploads/')) {
          cleanPath = cleanPath.replace(/^uploads\//, '');
        }

        if (cleanPath.startsWith('static/uploads/')) {
          cleanPath = cleanPath.replace(/^static\/uploads\//, '');
        }

        const url = `${API_BASE_URL}/static/uploads/${cleanPath}`
          .replace(/([^:]\/)\/+/g, "$1");

        return `${url}?t=${Date.now()}`;
      };

      // Set Image Preview if exists
      if (data.profile_image) {
        setImagePreview(getImageUrl(data.profile_image));
      }


      setFormData({
        ...data,
        barangay_id: data.barangay?.id || data.barangay_id || '',
        products: data.products || [],
        profile_image: null // Reset file input, keep preview
      });
    } catch (err) {
      setError('Could not load farmer details.');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Product/Crop Handlers
  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { product_name: '', is_primary: false, production_volume: 0, unit: 'kg' }]
    }));
  };

  const removeProduct = (index) => {
    const newProducts = [...formData.products];
    newProducts.splice(index, 1);
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData(prev => ({ ...prev, products: newProducts }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use FormData for file uploads
      const data = new FormData();

      // Append simple fields
      Object.keys(formData).forEach(key => {
        if (key === 'products') {
          // Serialize products array
          data.append('products', JSON.stringify(formData.products));
        } else if (key === 'profile_image') {
          if (formData.profile_image instanceof File) {
            data.append('profile_image', formData.profile_image);
          }
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (isEditMode) {
        await farmersAPI.update(id, data);
      } else {
        await farmersAPI.create(data);
      }

      navigate('/farmers');
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || 'Failed to save farmer profile. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/farmers" className="text-slate-400 hover:text-emerald-600 transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Farmer Profile' : 'New Farmer Registration'}
            </h1>
          </div>
          <p className="text-slate-500 ml-7">
            {isEditMode ? 'Update existing records and crop data.' : 'Add a new agricultural producer to the database.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: Identity & Image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Upload Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="relative group w-40 h-40 mb-4">
              <div className={`w-full h-full rounded-full overflow-hidden border-4 border-slate-50 shadow-inner flex items-center justify-center bg-slate-100 ${!imagePreview ? 'border-dashed border-slate-300' : ''}`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                <Upload size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Profile Photo</p>
            <p className="text-xs text-slate-400">Click image to upload</p>
          </div>

          {/* Basic Info Card */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-50">
              <User size={18} className="text-emerald-500" /> Personal Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" placeholder="e.g. Juan" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" placeholder="e.g. Dela Cruz" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Birth Date</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-xl text-sm font-semibold text-slate-600 transition-all outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 rounded-xl text-sm font-semibold text-slate-600 transition-all outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Location & Contact */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-50">
            <MapPin size={18} className="text-blue-500" /> Location & Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Barangay</label>
              <select required name="barangay_id" value={formData.barangay_id} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm font-semibold text-slate-600 transition-all outline-none">
                <option value="">Select Barangay</option>
                {barangays.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Street Address / Purok</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" placeholder="House No., Street, Purok" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" placeholder="0912 345 6789" />
            </div>
          </div>
        </div>

        {/* SECTION 3: Farm & Economic Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-50">
              <Ruler size={18} className="text-amber-500" /> Farm Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Size (Hectares)</label>
                <input type="number" step="0.01" name="farm_size_hectares" value={formData.farm_size_hectares} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Years Farming</label>
                <input type="number" name="years_farming" value={formData.years_farming} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Land Ownership</label>
                <select name="land_ownership" value={formData.land_ownership} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-0 rounded-xl text-sm font-semibold text-slate-600 transition-all outline-none">
                  <option value="Owner">Owner</option>
                  <option value="Tenant">Tenant</option>
                  <option value="Leaseholder">Leaseholder</option>
                  <option value="Caretaker">Caretaker</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-50">
              <DollarSign size={18} className="text-purple-500" /> Socio-Economic
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Education Level</label>
                <select name="education_level" value={formData.education_level} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-purple-500 focus:ring-0 rounded-xl text-sm font-semibold text-slate-600 transition-all outline-none">
                  <option value="Elementary">Elementary</option>
                  <option value="High School Graduate">High School Graduate</option>
                  <option value="College Undergraduate">College Undergraduate</option>
                  <option value="College Graduate">College Graduate</option>
                  <option value="Vocational">Vocational</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Annual Income</label>
                  <input type="number" name="annual_income" value={formData.annual_income} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-purple-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Income Source</label>
                  <input type="text" name="income_source" value={formData.income_source} onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-purple-500 focus:ring-0 rounded-xl text-sm font-semibold transition-all outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Production / Crops */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sprout size={18} className="text-emerald-500" /> Production & Crops
            </h3>
            <button type="button" onClick={addProduct} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
              <Plus size={14} /> Add Crop
            </button>
          </div>

          <div className="space-y-3">
            {formData.products.length === 0 && (
              <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No crops added yet. Click "Add Crop" to record production.
              </div>
            )}

            {formData.products.map((product, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-end p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Crop Name</label>
                  <input type="text" placeholder="e.g. Rice, Corn"
                    value={product.product_name}
                    onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:border-emerald-500 focus:ring-0 outline-none"
                  />
                </div>
                <div className="w-full md:w-32 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Volume</label>
                  <input type="number" placeholder="0"
                    value={product.production_volume}
                    onChange={(e) => handleProductChange(index, 'production_volume', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:border-emerald-500 focus:ring-0 outline-none"
                  />
                </div>
                <div className="w-full md:w-24 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Unit</label>
                  <select
                    value={product.unit}
                    onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:border-emerald-500 focus:ring-0 outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="tons">tons</option>
                    <option value="sacks">sacks</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pb-2 md:pb-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      checked={product.is_primary}
                      onChange={(e) => handleProductChange(index, 'is_primary', e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="text-xs font-bold text-slate-500">Primary</span>
                  </label>
                </div>
                <button type="button" onClick={() => removeProduct(index)} className="p-2.5 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 pb-20">
          <button type="button" onClick={() => navigate('/farmers')} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isEditMode ? 'Update Farmer' : 'Save Farmer'}
          </button>
        </div>
      </form>
    </div>
  );
}