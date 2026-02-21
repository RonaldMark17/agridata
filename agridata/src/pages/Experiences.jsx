import React, { useState, useEffect } from 'react';
import { experiencesAPI, farmersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Calendar, MapPin, User, Plus, X,
  Trophy, AlertTriangle, Lightbulb, Sprout, Landmark, Pin,
  ChevronLeft, ChevronRight, Activity, Filter, Info, Loader2,
  Search, Download, ThumbsUp, Share2, ExternalLink, Image as ImageIcon,
  FileText, Check
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace('/api', '');

// --- Skeleton Component ---
const ExperienceSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-[#0b241f] rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 sm:p-8 animate-pulse shadow-sm">
        <div className="flex justify-between mb-4 sm:mb-6">
          <div className="h-10 w-10 sm:h-14 sm:w-14 bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl"></div>
          <div className="h-5 sm:h-6 w-20 sm:w-24 bg-slate-50 dark:bg-white/5 rounded-full"></div>
        </div>
        <div className="h-5 sm:h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded-lg mb-3 sm:mb-4"></div>
        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <div className="h-2.5 sm:h-3 w-full bg-slate-50 dark:bg-white/5 rounded"></div>
          <div className="h-2.5 sm:h-3 w-5/6 bg-slate-50 dark:bg-white/5 rounded"></div>
        </div>
        <div className="pt-4 sm:pt-6 border-t border-slate-50 dark:border-white/5 space-y-3 sm:space-y-4">
          <div className="h-2.5 sm:h-3 w-1/2 bg-slate-100 dark:bg-white/5 rounded"></div>
          <div className="h-2.5 sm:h-3 w-1/3 bg-slate-100 dark:bg-white/5 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  // Data Controls
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const { user, hasPermission } = useAuth();
  const canCreate = hasPermission(['admin', 'researcher', 'data_encoder']);

  const initialFormState = {
    farmer_id: '',
    experience_type: 'Success Story',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    location: '',
    context: '',
    impact_level: 'Medium',
    attachment: null
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
      setTimeout(() => setLoading(false), 800);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await farmersAPI.getAll({ per_page: 1000 });
      setFarmers(response.data.farmers);
    } catch (error) { console.error('Error fetching farmers:', error); }
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
      setShowCreateModal(false);
      fetchExperiences();
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error creating experience:', error);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    const headers = ["Title", "Type", "Farmer", "Location", "Impact", "Date", "Likes"];
    const rows = experiences.map(e => [
      `"${e.title}"`, e.experience_type, `"${e.farmer_name}"`,
      `"${e.location}"`, e.impact_level, e.date_recorded, e.likes_count || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `knowledge_base_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  // --- PERSISTENT LIKE ENGINE (Optimistic Updates) ---
  const toggleVote = async (id, e) => {
    if (e) e.stopPropagation();

    const index = experiences.findIndex(exp => exp.id === id);
    if (index === -1) return;

    const exp = experiences[index];
    const currentlyLiked = exp.is_liked_by_me;

    // UI Update immediately
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...exp,
      is_liked_by_me: !currentlyLiked,
      likes_count: currentlyLiked ? Math.max(0, exp.likes_count - 1) : exp.likes_count + 1
    };
    setExperiences(updatedExperiences);

    if (selectedExperience?.id === id) {
      setSelectedExperience(updatedExperiences[index]);
    }

    try {
      await experiencesAPI.toggleLike(id);
    } catch (error) {
      // Rollback if server fails
      setExperiences(experiences);
      console.error("Failed to sync like with server");
    }
  };

  const handleShare = async (exp) => {
    const shareData = {
      title: `AgriData: ${exp.title}`,
      text: `Insight by ${exp.farmer_name}:\n\n"${exp.description}"`,
      url: window.location.href,
    };
    try {
      if (navigator.share) { await navigator.share(shareData); }
      else {
        await navigator.clipboard.writeText(`${shareData.text}\n\nRead more at: ${shareData.url}`);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch (err) { console.error("Error sharing:", err); }
  };

  // --- HELPERS ---
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeStyles = (type) => {
    const styles = {
      'Success Story': { icon: Trophy, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
      'Challenge': { icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' },
      'Innovation': { icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
      'Farming Practice': { icon: Sprout, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20' },
      'Cultural Tradition': { icon: Landmark, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' },
      'Other': { icon: Pin, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', border: 'border-slate-200 dark:border-white/10' }
    };
    return styles[type] || styles['Other'];
  };

  const filteredExperiences = experiences.filter(exp => {
    const matchesTab = activeTab === 'All' || exp.experience_type === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      exp.title.toLowerCase().includes(searchLower) ||
      exp.description.toLowerCase().includes(searchLower) ||
      exp.location?.toLowerCase().includes(searchLower) ||
      exp.farmer_name?.toLowerCase().includes(searchLower);
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Success Story', 'Challenge', 'Innovation', 'Farming Practice', 'Cultural Tradition'];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans transition-colors duration-300 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700">

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 sm:gap-6 px-4 pt-6 sm:pt-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-emerald-600 rounded-lg text-white shadow-lg">
                <BookOpen size={16} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Knowledge Repo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Field Wisdom</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl">Collective insights capturing field-tested success and innovation.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-bold dark:text-white outline-none"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleExport} disabled={isExporting} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-black text-[9px] uppercase text-slate-500 dark:text-slate-400 shadow-sm">
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} <span>Export</span>
              </button>
              {canCreate && (
                <button onClick={() => setShowCreateModal(true)} className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-xl">
                  <Plus size={14} /> <span>Record</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="mx-4">
          <div className="bg-white dark:bg-[#0b241f] p-1.5 rounded-xl sm:rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1 min-w-max">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all ${activeTab === tab ? 'bg-slate-900 dark:bg-emerald-500 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                    }`}>{tab}</button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px] px-4">
          {loading ? <ExperienceSkeleton /> : filteredExperiences.length === 0 ? (
            <div className="py-32 text-center"><h3 className="text-xl font-black dark:text-white uppercase">No Results Found</h3></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {filteredExperiences.map((exp) => {
                const style = getTypeStyles(exp.experience_type);
                const Icon = style.icon;
                return (
                  <div key={exp.id} onClick={() => setSelectedExperience(exp)}
                    className="group bg-white dark:bg-[#0b241f] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`p-3 rounded-xl ${style.bg} ${style.color}`}><Icon size={20} /></div>
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase border ${exp.impact_level === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{exp.impact_level}</span>
                    </div>
                    <div className="space-y-3 mb-6 flex-1 relative z-10">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight line-clamp-2">{exp.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{exp.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2 pr-4 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-emerald-600 shrink-0"><User size={12} /></div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{exp.farmer_name}</p>
                          <p className="text-[8px] text-slate-400 font-black">{formatDate(exp.date_recorded)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button 
    onClick={(e) => toggleVote(exp.id, e)}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
        exp.is_liked_by_me // <--- Use the variable from the API
        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' 
        : 'bg-slate-50 dark:bg-white/5 text-slate-400'
    }`}
>
    <ThumbsUp 
        size={14} 
        className={exp.is_liked_by_me ? 'fill-current' : ''} 
    />
    <span className="text-[10px] font-black">{exp.likes_count || 0}</span>
</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* READ MODE MODAL */}
        {selectedExperience && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedExperience(null)} />
            <div className="relative bg-white dark:bg-[#0b241f] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-[2.5rem] shadow-2xl flex flex-col border dark:border-white/10 animate-in zoom-in-95">
              <div className="p-6 sm:p-8 border-b dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-black/20 shrink-0 pt-safe">
                <div className="space-y-2">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTypeStyles(selectedExperience.experience_type).bg} ${getTypeStyles(selectedExperience.experience_type).color}`}>
                    {selectedExperience.experience_type}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase leading-tight">{selectedExperience.title}</h2>
                </div>
                <button onClick={() => setSelectedExperience(null)} className="p-2 text-slate-400"><X size={24} /></button>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 no-scrollbar pb-safe">
                <p className="text-sm sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedExperience.description}</p>
                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contributor</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedExperience.farmer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedExperience.location || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-col sm:flex-row justify-end gap-3 shrink-0 pb-safe">
                <button onClick={() => handleShare(selectedExperience)} className="px-6 py-3.5 border rounded-xl font-bold uppercase text-[10px] sm:w-auto">Share</button>
                <button onClick={() => toggleVote(selectedExperience.id)} className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black uppercase text-[10px] shadow-xl ${selectedExperience.is_liked_by_me ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  <ThumbsUp size={14} className={selectedExperience.is_liked_by_me ? 'fill-current' : ''} />
                  {selectedExperience.is_liked_by_me ? 'Helpful' : 'Mark Helpful'}
                  <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-md">{selectedExperience.likes_count || 0}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @supports (padding-top: env(safe-area-inset-top)) {
          .pt-safe { padding-top: max(1.25rem, env(safe-area-inset-top)); }
          .pb-safe { padding-bottom: max(1.25rem, env(safe-area-inset-bottom)); }
        }
      `}} />
    </div>
  );
}