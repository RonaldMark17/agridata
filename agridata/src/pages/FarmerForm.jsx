import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { farmersAPI, barangaysAPI, organizationsAPI } from '../services/api';
import { 
  Save, ArrowLeft, Loader2, User, MapPin, Ruler, GraduationCap, 
  Briefcase, Phone, Calendar, Building2, Sprout, Camera, X
} from 'lucide-react';

// Get Base URL for images
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace('/api', '');

// --- Skeleton Component ---
const FormSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-6 pb-12 px-4 md:px-0 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-64 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="h-6 w-32 bg-slate-200 rounded"></div>
            <div className="space-y-4">
            <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
            <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
            </div>
        </div>
        ))}
    </div>
  </div>
);

export default function FarmerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Reference Data
  const [barangays, setBarangays] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  
  // Image State
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [formData, setFormData] = useState({
    // Identity
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    farmer_code: '',
    birth_date: '',
    age: '',
    gender: 'Male',
    
    // Contact & Location
    barangay_id: '',
    address: '',
    contact_number: '',
    
    // Socio-Economic
    education_level: 'Elementary',
    primary_occupation: '',
    secondary_occupation: '',
    annual_income: '',
    income_source: '',
    number_of_children: '0',
    
    // Farm Details
    farm_size_hectares: '',
    land_ownership: 'Owner',
    years_farming: '',
    organization_id: '',
    children_farming_involvement: false
  });

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch all reference data in parallel
        const [barangayRes, orgRes] = await Promise.all([
            barangaysAPI.getAll(),
            organizationsAPI.getAll()
        ]);
        
        setBarangays(barangayRes.data);
        setOrganizations(orgRes.data);

        if (isEditMode) {
            await fetchFarmerDetails();
        } else {
            // Generate a temporary code or leave blank
            setFormData(prev => ({...prev, farmer_code: `FARM-${new Date().getFullYear()}-XXXX`}));
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setTimeout(() => setFetching(false), 300);
      }
    };
    init();
  }, [id]);

  // Cleanup object URLs when component unmounts or when new file is selected
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const fetchFarmerDetails = async () => {
    try {
      const res = await farmersAPI.getById(id);
      const data = res.data;
      
      console.log('📥 Fetched farmer data:', data);
      console.log('📷 Profile image from backend:', data.profile_image);
      
      // Parse backend data to form state
      setFormData({
        first_name: data.first_name || '',
        middle_name: data.middle_name || '',
        last_name: data.last_name || '',
        suffix: data.suffix || '',
        farmer_code: data.farmer_code || '',
        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
        age: data.age || '',
        gender: data.gender || 'Male',
        
        barangay_id: data.barangay_id || '',
        address: data.address || '',
        contact_number: data.contact_number || '',
        
        education_level: data.education_level || 'Elementary',
        primary_occupation: data.primary_occupation || '',
        secondary_occupation: data.secondary_occupation || '',
        annual_income: data.annual_income || '',
        income_source: data.income_source || '',
        number_of_children: data.number_of_children || '0',
        
        farm_size_hectares: data.farm_size_hectares || '',
        land_ownership: data.land_ownership || 'Owner',
        years_farming: data.years_farming || '',
        organization_id: data.organization_id || '',
        children_farming_involvement: data.children_farming_involvement || false
      });

      // If backend returns an image URL, set it
      if (data.profile_image) {
        const imageUrl = getImageUrl(data.profile_image);
        console.log('🖼️ Constructed image URL:', imageUrl);
        setExistingImageUrl(imageUrl);
        setPreviewImage(imageUrl);
      }
    } catch (err) {
      console.error('❌ Error loading farmer data:', err);
      alert("Error loading farmer data");
      navigate('/farmers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    console.log('='.repeat(80));
    console.log('📷 IMAGE CHANGE EVENT');
    console.log('='.repeat(80));
    console.log('File selected:', file);
    
    if (file) {
      console.log('📄 File details:');
      console.log('  - Name:', file.name);
      console.log('  - Type:', file.type);
      console.log('  - Size:', file.size, 'bytes');
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        console.error('❌ Invalid file type:', file.type);
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        e.target.value = '';
        return;
      }
      console.log('✅ File type is valid');

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        console.error('❌ File too large:', file.size);
        alert('Image size must be less than 5MB');
        e.target.value = '';
        return;
      }
      console.log('✅ File size is valid');

      // Revoke previous blob URL if it exists
      if (previewImage && previewImage.startsWith('blob:')) {
        console.log('🗑️ Revoking old blob URL:', previewImage);
        URL.revokeObjectURL(previewImage);
      }
      
      // Create local preview URL
      const objectUrl = URL.createObjectURL(file);
      console.log('🖼️ Created preview URL:', objectUrl);
      
      setPreviewImage(objectUrl);
      setSelectedFile(file);
      
      console.log('✅ Image state updated successfully');
      console.log('='.repeat(80));
    } else {
      console.log('⚠️ No file selected');
    }
  };

  const handleRemoveImage = () => {
    console.log('🗑️ Removing image...');
    
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setSelectedFile(null);
    setExistingImageUrl(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
    
    console.log('✅ Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('='.repeat(80));
    console.log('📤 FORM SUBMISSION');
    console.log('='.repeat(80));
    console.log('Is Edit Mode:', isEditMode);
    console.log('Selected File:', selectedFile);
    console.log('Form Data:', formData);

    try {
      // Create FormData object for file upload support
      const payload = new FormData();

      // Append standard fields
      payload.append('first_name', formData.first_name);
      payload.append('last_name', formData.last_name);
      payload.append('farmer_code', formData.farmer_code);
      payload.append('gender', formData.gender);
      payload.append('age', formData.age ? parseInt(formData.age, 10) : '');
      
      // Optional Strings
      if (formData.middle_name) payload.append('middle_name', formData.middle_name);
      if (formData.suffix) payload.append('suffix', formData.suffix);
      if (formData.birth_date) payload.append('birth_date', formData.birth_date);
      if (formData.address) payload.append('address', formData.address);
      if (formData.contact_number) payload.append('contact_number', formData.contact_number);
      
      // IDs & Numbers
      if (formData.barangay_id) payload.append('barangay_id', parseInt(formData.barangay_id, 10));
      if (formData.organization_id) payload.append('organization_id', parseInt(formData.organization_id, 10));
      payload.append('number_of_children', formData.number_of_children ? parseInt(formData.number_of_children, 10) : 0);
      if (formData.years_farming) payload.append('years_farming', parseInt(formData.years_farming, 10));
      
      // Floats
      payload.append('farm_size_hectares', formData.farm_size_hectares ? parseFloat(formData.farm_size_hectares) : 0);
      if (formData.annual_income) payload.append('annual_income', parseFloat(formData.annual_income));

      // Other Strings
      payload.append('education_level', formData.education_level);
      payload.append('land_ownership', formData.land_ownership);
      if (formData.primary_occupation) payload.append('primary_occupation', formData.primary_occupation);
      if (formData.secondary_occupation) payload.append('secondary_occupation', formData.secondary_occupation);
      if (formData.income_source) payload.append('income_source', formData.income_source);
      payload.append('children_farming_involvement', formData.children_farming_involvement);

      // Append File if selected
      if (selectedFile) {
        console.log('📎 Appending image file to FormData:');
        console.log('  - File name:', selectedFile.name);
        console.log('  - File type:', selectedFile.type);
        console.log('  - File size:', selectedFile.size, 'bytes');
        payload.append('profile_image', selectedFile);
        console.log('✅ Image file appended to payload');
      } else {
        console.log('⚠️ No image file to upload');
      }

      // Log FormData contents
      console.log('📦 FormData contents:');
      for (let [key, value] of payload.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      console.log('🚀 Sending request to backend...');

      let response;
      if (isEditMode) {
        console.log(`📝 UPDATE farmer ID=${id}`);
        response = await farmersAPI.update(id, payload);
      } else {
        console.log('✨ CREATE new farmer');
        response = await farmersAPI.create(payload);
      }
      
      console.log('✅ Response received:', response.data);
      console.log('='.repeat(80));
      
      // Show success alert
      alert(`Farmer ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      navigate('/farmers');
    } catch (err) {
      console.error('='.repeat(80));
      console.error('❌ SUBMISSION ERROR');
      console.error('='.repeat(80));
      console.error('Error object:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      console.error('='.repeat(80));
      
      const errorMessage = err.response?.data?.error || "Failed to save record. Please check your inputs.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to construct full image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
    return `${API_BASE_URL}/uploads/${path}`;
  };

  if (fetching) return <FormSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 md:px-0 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/farmers')} 
          className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all text-slate-500 shadow-sm active:scale-95 group"
          title="Go back"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isEditMode ? 'Update Profile' : 'New Farmer Registration'}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {isEditMode ? `Editing record for: ${formData.first_name} ${formData.last_name}` : 'Complete all required fields below.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* === SECTION 1: IDENTITY === */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><User size={20} /></div>
                <h3 className="font-bold text-gray-900">Personal Identity</h3>
            </div>
            
            <div className="space-y-6">
                
                {/* --- Profile Photo Upload --- */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                            {previewImage ? (
                                <img 
                                  src={previewImage} 
                                  alt="Preview" 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    console.error('❌ Image failed to load:', previewImage);
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="text-slate-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                                  }}
                                />
                            ) : (
                                <User size={48} className="text-slate-300" />
                            )}
                            {/* Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        
                        {/* Remove Button */}
                        {previewImage && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
                            title="Remove image"
                          >
                            <X size={16} />
                          </button>
                        )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-3">
                      {selectedFile ? `✅ ${selectedFile.name} selected` : (existingImageUrl ? 'Tap to change photo' : 'Tap to upload photo')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG, GIF or WebP • Max 5MB</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">First Name *</label>
                        <input name="first_name" required value={formData.first_name} onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" placeholder="First Name" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Name *</label>
                        <input name="last_name" required value={formData.last_name} onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" placeholder="Last Name" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Middle Name</label>
                        <input name="middle_name" value={formData.middle_name} onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" placeholder="(Optional)" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suffix</label>
                        <input name="suffix" value={formData.suffix} onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" placeholder="Jr, Sr, III" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Farmer Code (ID)</label>
                    <input name="farmer_code" value={formData.farmer_code} onChange={handleInputChange} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-bold text-emerald-700 tracking-wide" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Age *</label>
                        <input type="number" name="age" required value={formData.age} onChange={handleInputChange} min="1" max="120"
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium cursor-pointer">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" />
                    </div>
                </div>
            </div>
        </div>

        {/* === SECTION 2: CONTACT & LOCATION === */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><MapPin size={20} /></div>
                <h3 className="font-bold text-gray-900">Contact & Location</h3>
            </div>
            
            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Barangay *</label>
                    <select name="barangay_id" required value={formData.barangay_id} onChange={handleInputChange} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium cursor-pointer">
                        <option value="">Select Barangay...</option>
                        {barangays.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Street Address / Purok</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2"
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium resize-none" placeholder="House No., Street Name, Purok" />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input name="contact_number" value={formData.contact_number} onChange={handleInputChange} 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium" placeholder="09XX-XXX-XXXX" />
                    </div>
                </div>
            </div>
        </div>

        {/* === SECTION 3: SOCIO-ECONOMIC === */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><GraduationCap size={20} /></div>
                <h3 className="font-bold text-gray-900">Socio-Economic Profile</h3>
            </div>
            
            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Education Level *</label>
                    <select name="education_level" value={formData.education_level} onChange={handleInputChange} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none font-medium cursor-pointer">
                        <option value="No Formal Education">No Formal Education</option>
                        <option value="Elementary">Elementary</option>
                        <option value="High School">High School</option>
                        <option value="Vocational">Vocational</option>
                        <option value="College">College</option>
                        <option value="Post-Graduate">Post-Graduate</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Occupation</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input name="primary_occupation" value={formData.primary_occupation} onChange={handleInputChange} 
                                className="w-full pl-10 pr-3 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium text-sm" placeholder="e.g. Farming" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Secondary Occupation</label>
                        <input name="secondary_occupation" value={formData.secondary_occupation} onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium text-sm" placeholder="e.g. Carpentry" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Annual Income (₱)</label>
                        <input type="number" name="annual_income" value={formData.annual_income} onChange={handleInputChange} min="0" step="0.01"
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Income Source</label>
                        <input name="income_source" value={formData.income_source} onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium" placeholder="e.g. Farming" />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1 space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No. of Children</label>
                        <input type="number" name="number_of_children" value={formData.number_of_children} onChange={handleInputChange} min="0"
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium" />
                    </div>
                    <div className="flex-1 pt-6">
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                            <input type="checkbox" name="children_farming_involvement" checked={formData.children_farming_involvement} onChange={handleInputChange} 
                                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-xs font-bold text-slate-600">Children assist in farm?</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* === SECTION 4: FARM DETAILS === */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Sprout size={20} /></div>
                <h3 className="font-bold text-gray-900">Farm Information</h3>
            </div>
            
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Farm Size (Hectares) *</label>
                        <div className="relative">
                            <Ruler size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="number" step="0.01" name="farm_size_hectares" required value={formData.farm_size_hectares} onChange={handleInputChange} min="0"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none font-medium" placeholder="0.00" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Years Farming</label>
                        <input type="number" name="years_farming" value={formData.years_farming} onChange={handleInputChange} min="0"
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Land Ownership Status</label>
                    <select name="land_ownership" value={formData.land_ownership} onChange={handleInputChange} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none font-medium cursor-pointer">
                        <option value="Owner">Owner</option>
                        <option value="Tenant">Tenant</option>
                        <option value="Tenant">Lessee</option>
                        <option value="Rent-free with consent">Rent-free with consent</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Affiliated Organization</label>
                    <div className="relative">
                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select name="organization_id" value={formData.organization_id} onChange={handleInputChange} 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none font-medium cursor-pointer">
                            <option value="">None / Independent</option>
                            {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* === FORM ACTIONS (Sticky Footer) === */}
        <div className="lg:col-span-2 sticky bottom-4 z-10">
            <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                <button 
                    type="button" onClick={() => navigate('/farmers')}
                    className="px-6 py-3 rounded-xl text-slate-300 font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                    Cancel
                </button>
                <button 
                    type="submit" disabled={loading}
                    className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />}
                    {isEditMode ? 'Update Profile' : 'Save Record'}
                </button>
            </div>
        </div>

      </form>
    </div>
  );
}