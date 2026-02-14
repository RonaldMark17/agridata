import React, { useState, useEffect } from 'react';
import { experiencesAPI, farmersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Calendar, MapPin, User, Plus, X, 
  Trophy, AlertTriangle, Lightbulb, Sprout, Landmark, Pin,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// --- Skeleton Component for Experiences ---
const ExperienceSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
          <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2 mb-6">
          <div className="h-3 w-full bg-gray-100 rounded"></div>
          <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
        </div>
        <div className="pt-4 border-t border-gray-50 space-y-2">
          <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
          <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(['admin', 'researcher', 'data_encoder']);

  const initialFormState = {
    farmer_id: '',
    experience_type: 'Success Story',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    location: '',
    context: '',
    impact_level: 'Medium'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchExperiences();
    fetchFarmers();
  }, [currentPage]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const response = await experiencesAPI.getAll({ page: currentPage });
      setExperiences(response.data.experiences);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      // Small timeout for visual smoothness
      setTimeout(() => setLoading(false), 500);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await farmersAPI.getAll({ per_page: 1000 });
      setFarmers(response.data.farmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const handleFarmerChange = (e) => {
    const selectedId = e.target.value;
    const selectedFarmer = farmers.find(f => f.id.toString() === selectedId);
    let autoLocation = '';
    if (selectedFarmer && selectedFarmer.barangay) {
      autoLocation = `${selectedFarmer.barangay.name}, ${selectedFarmer.barangay.municipality}`;
    }
    setFormData({ ...formData, farmer_id: selectedId, location: autoLocation });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await experiencesAPI.create(formData);
      setShowModal(false);
      fetchExperiences();
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error creating experience:', error);
    }
  };

  const getTypeStyles = (type) => {
    const styles = {
      'Success Story': { icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
      'Challenge': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-l-amber-500' },
      'Innovation': { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-l-blue-500' },
      'Farming Practice': { icon: Sprout, color: 'text-green-700', bg: 'bg-green-50', border: 'border-l-green-600' },
      'Cultural Tradition': { icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-l-purple-500' },
      'Other': { icon: Pin, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-l-gray-500' }
    };
    return styles[type] || styles['Other'];
  };

  const getImpactBadge = (level) => {
    const colors = { 'High': 'bg-red-100 text-red-800 border-red-200', 'Medium': 'bg-amber-100 text-amber-800 border-amber-200', 'Low': 'bg-blue-100 text-blue-800 border-blue-200' };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredExperiences = activeTab === 'All' 
    ? experiences 
    : experiences.filter(exp => exp.experience_type === activeTab);

  const tabs = ['All', 'Success Story', 'Challenge', 'Innovation', 'Farming Practice', 'Cultural Tradition'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Field Knowledge Base</h1>
          <p className="text-gray-500 text-sm mt-1">Local wisdom and farming narratives.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowModal(true)} 
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Record Experience
          </button>
        )}
      </div>

      {/* Responsive Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <nav className="-mb-px flex space-x-6 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-all`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <ExperienceSkeleton />
        ) : filteredExperiences.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-gray-500 px-4">No experiences listed under "{activeTab}" for this page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((exp) => {
              const style = getTypeStyles(exp.experience_type);
              const Icon = style.icon;
              return (
                <div key={exp.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col border-l-4 ${style.border}`}>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-xl ${style.bg} ${style.color}`}><Icon size={22} /></div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getImpactBadge(exp.impact_level)}`}>
                        {exp.impact_level} Impact
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 uppercase">{exp.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-4 leading-relaxed italic">"{exp.description}"</p>
                  </div>
                  <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 mt-auto">
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center"><User size={14} className="text-emerald-600 mr-2 shrink-0" /><span className="font-bold truncate">{exp.farmer_name}</span></div>
                      <div className="flex items-center"><MapPin size={14} className="text-gray-400 mr-2 shrink-0" /><span className="truncate">{exp.location || 'No location set'}</span></div>
                      <div className="flex items-center"><Calendar size={14} className="mr-2 shrink-0" /><span>{new Date(exp.date_recorded).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200 gap-4">
          <div className="text-sm text-gray-500">Page <span className="font-semibold text-gray-900">{currentPage}</span> of {totalPages}</div>
          <div className="flex w-full sm:w-auto gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex-1 sm:flex-none p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors flex justify-center"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex-1 sm:flex-none p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors flex justify-center"><ChevronRight size={20} /></button>
          </div>
        </div>
      )}

      {/* Adaptive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
              <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Record Experience</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Farmer Source</label>
                    <select className="w-full border-gray-200 rounded-xl py-3 text-sm focus:ring-emerald-500" value={formData.farmer_id} onChange={handleFarmerChange} required>
                      <option value="">Select Farmer...</option>
                      {farmers.map((f) => (<option key={f.id} value={f.id}>{f.full_name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Category</label>
                    <select className="w-full border-gray-200 rounded-xl py-3 text-sm focus:ring-emerald-500" value={formData.experience_type} onChange={(e) => setFormData({ ...formData, experience_type: e.target.value })} required>
                      <option value="Success Story">Success Story</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Innovation">Innovation</option>
                      <option value="Farming Practice">Farming Practice</option>
                      <option value="Cultural Tradition">Cultural Tradition</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">Title</label>
                  <input type="text" placeholder="Headline..." className="w-full border-gray-200 rounded-xl py-3 text-sm" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">Description</label>
                  <textarea rows={4} placeholder="Details..." className="w-full border-gray-200 rounded-xl text-sm" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Date</label>
                    <input type="date" className="w-full border-gray-200 rounded-xl py-3 text-sm" value={formData.date_recorded} onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Impact</label>
                    <select className="w-full border-gray-200 rounded-xl py-3 text-sm" value={formData.impact_level} onChange={(e) => setFormData({ ...formData, impact_level: e.target.value })}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Location</label>
                    <input type="text" className="w-full border-gray-200 rounded-xl py-3 text-sm" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                </div>

                <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-500">Discard</button>
                  <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">Save Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}