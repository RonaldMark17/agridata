import React, { useState, useEffect } from 'react';
import { experiencesAPI, farmersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Calendar, MapPin, User, Plus, X, 
  Trophy, AlertTriangle, Lightbulb, Sprout, Landmark, Pin,
  ChevronLeft, ChevronRight, Activity, Filter, Info, Loader2,
  Search, Download, ThumbsUp, Share2, ExternalLink, Image as ImageIcon,
  FileText, Check, MessageSquare, Send, Clock, Lock, Unlock, Edit2, Trash2
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
  
  // Modals & Interactivity
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null); 
  const [commentText, setCommentText] = useState('');
  
  // Comment Edit State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Data Controls
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const { user } = useAuth();
  const canCreate = user && ['admin', 'researcher', 'data_encoder'].includes(user.role);

  const initialFormState = {
    farmer_id: '',
    experience_type: 'Success Story',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    location: '',
    context: '',
    impact_level: 'Medium',
    comments_enabled: true 
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

  const handleToggleComments = async () => {
    if (!selectedExperience) return;
    const newStatus = selectedExperience.comments_enabled === false ? true : false;
    
    const updatedExperience = { ...selectedExperience, comments_enabled: newStatus };
    setSelectedExperience(updatedExperience);
    setExperiences(prev => prev.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp));

    try {
      if (experiencesAPI.update) {
        await experiencesAPI.update(updatedExperience.id, { comments_enabled: newStatus });
      }
    } catch (error) {
      console.error("Failed to toggle comments status:", error);
    }
  };

  // --- UPGRADED COMMENT SUBMISSION ENGINE ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedExperience) return;

    // Create a temporary ID so the UI updates instantly
    const tempId = Date.now();
    const tempComment = {
      id: tempId, 
      user_id: user?.id, 
      user_name: user?.full_name || 'Current User',
      text: commentText,
      likes_count: 0,
      is_liked_by_me: false,
      created_at: new Date().toISOString()
    };

    // 1. Optimistically update the UI
    const updatedExperience = {
      ...selectedExperience,
      comments: [...(selectedExperience.comments || []), tempComment],
      comments_count: (selectedExperience.comments_count || 0) + 1
    };
    setSelectedExperience(updatedExperience);
    setExperiences(prev => prev.map(exp => exp.id === selectedExperience.id ? updatedExperience : exp));
    setCommentText('');

    // 2. Sync with backend and SWAP the temporary ID with the real Database ID
    try {
      if (experiencesAPI.addComment) {
        const response = await experiencesAPI.addComment(selectedExperience.id, { text: tempComment.text });
        
        // Grab the actual saved comment from the backend
        const realComment = response.data.comment;
        
        const finalExperience = {
            ...updatedExperience,
            comments: updatedExperience.comments.map(c => c.id === tempId ? realComment : c)
        };
        
        setSelectedExperience(finalExperience);
        setExperiences(prev => prev.map(exp => exp.id === selectedExperience.id ? finalExperience : exp));
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Database Error: Failed to save comment. Please make sure you ran the SQL script in phpMyAdmin.");
      
      // Revert the UI if it failed to save
      const revertedExperience = {
        ...selectedExperience,
        comments: selectedExperience.comments.filter(c => c.id !== tempId),
        comments_count: Math.max(0, (selectedExperience.comments_count || 1) - 1)
      };
      setSelectedExperience(revertedExperience);
      setExperiences(prev => prev.map(exp => exp.id === selectedExperience.id ? revertedExperience : exp));
    }
  };

  const handleEditCommentClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    const updatedComments = selectedExperience.comments.map(c => 
      c.id === commentId ? { ...c, text: editCommentText } : c
    );
    const updatedExperience = { ...selectedExperience, comments: updatedComments };
    
    setSelectedExperience(updatedExperience);
    setExperiences(prev => prev.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp));
    setEditingCommentId(null);

    try {
      if (experiencesAPI.updateComment) {
        await experiencesAPI.updateComment(selectedExperience.id, commentId, { text: editCommentText });
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("Failed to save your edit.");
      fetchExperiences(); 
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    const updatedComments = selectedExperience.comments.filter(c => c.id !== commentId);
    const updatedExperience = { 
      ...selectedExperience, 
      comments: updatedComments,
      comments_count: Math.max(0, (selectedExperience.comments_count || 1) - 1)
    };

    setSelectedExperience(updatedExperience);
    setExperiences(prev => prev.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp));

    try {
      if (experiencesAPI.deleteComment) {
        await experiencesAPI.deleteComment(selectedExperience.id, commentId);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment.");
      fetchExperiences(); 
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    const updatedComments = selectedExperience.comments.map(c => {
      if (c.id === commentId) {
        const currentlyLiked = c.is_liked_by_me;
        return {
          ...c,
          is_liked_by_me: !currentlyLiked,
          likes_count: currentlyLiked ? Math.max(0, (c.likes_count || 1) - 1) : (c.likes_count || 0) + 1
        };
      }
      return c;
    });

    const updatedExperience = { ...selectedExperience, comments: updatedComments };
    setSelectedExperience(updatedExperience);
    setExperiences(prev => prev.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp));

    try {
      if (experiencesAPI.toggleCommentLike) {
        await experiencesAPI.toggleCommentLike(selectedExperience.id, commentId);
      }
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    const headers = ["Title", "Type", "Farmer", "Location", "Impact", "Date", "Likes", "Comments"];
    const rows = experiences.map(e => [
      `"${e.title}"`, e.experience_type, `"${e.farmer_name}"`, 
      `"${e.location}"`, e.impact_level, e.date_recorded, e.likes_count || 0, e.comments_count || 0
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

  const toggleVote = async (id, e) => {
    if (e) e.stopPropagation();
    
    const index = experiences.findIndex(exp => exp.id === id);
    if (index === -1) return;

    const exp = experiences[index];
    const currentlyLiked = exp.is_liked_by_me;
    
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...exp,
      is_liked_by_me: !currentlyLiked,
      likes_count: currentlyLiked ? Math.max(0, exp.likes_count - 1) : exp.likes_count + 1
    };
    setExperiences(updatedExperiences);

    if (selectedExperience?.id === id) {
        setSelectedExperience({
          ...selectedExperience, 
          is_liked_by_me: !currentlyLiked,
          likes_count: currentlyLiked ? Math.max(0, exp.likes_count - 1) : exp.likes_count + 1
        });
    }

    try {
      await experiencesAPI.toggleLike(id);
    } catch (error) {
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
                <button onClick={() => setShowCreateModal(true)} className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors">
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
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all ${
                    activeTab === tab ? 'bg-slate-900 dark:bg-emerald-500 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
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
                      
                      {/* COMMENT COUNT AND LIKE BUTTON */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 px-2 text-slate-400">
                          <MessageSquare size={14} />
                          <span className="text-[10px] font-black">{exp.comments_count || 0}</span>
                        </div>

                        <button 
                            onClick={(e) => toggleVote(exp.id, e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                exp.is_liked_by_me 
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' 
                                : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-500'
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

        {/* --- FIXED: CREATE EXPERIENCE MODAL --- */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowCreateModal(false)} />
            
            <div className="relative bg-[#f8fafc] dark:bg-[#020c0a] w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col border dark:border-white/10 animate-in zoom-in-95 max-h-[90vh]">
              
              <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#0b241f] rounded-t-[2.5rem] shrink-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase">Record Experience</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Log field observations and success stories.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Select Farmer</label>
                    <select required value={formData.farmer_id} onChange={handleFarmerChange} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none">
                      <option value="" disabled>Select a registered farmer...</option>
                      {farmers.map(f => (
                        <option key={f.id} value={f.id}>{f.first_name} {f.last_name} ({f.farmer_code})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Experience Type</label>
                    <select value={formData.experience_type} onChange={(e) => setFormData({...formData, experience_type: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none">
                      <option value="Success Story">Success Story</option>
                      <option value="Challenge">Challenge / Issue</option>
                      <option value="Innovation">Innovation / Experiment</option>
                      <option value="Farming Practice">Farming Practice</option>
                      <option value="Cultural Tradition">Cultural Tradition</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Title</label>
                  <input type="text" required placeholder="e.g., Successfully transitioned to organic fertilizers..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Detailed Description</label>
                  <textarea required rows="4" placeholder="Describe the experience, methods used, and outcomes..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Impact Level</label>
                    <select value={formData.impact_level} onChange={(e) => setFormData({...formData, impact_level: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none">
                      <option value="Low">Low Impact</option>
                      <option value="Medium">Medium Impact</option>
                      <option value="High">High Impact</option>
                    </select>
                  </div>
                </div>

              </form>

              <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b241f] rounded-b-[2.5rem] shrink-0 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
                <button type="button" onClick={handleSubmit} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all">Submit Record</button>
              </div>

            </div>
          </div>
        )}

        {/* --- REDESIGNED READ & COMMENT MODAL --- */}
        {selectedExperience && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => { setSelectedExperience(null); setCommentText(''); setEditingCommentId(null); }} />
                
                <div className="relative bg-[#f8fafc] dark:bg-[#020c0a] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-[2.5rem] shadow-2xl flex flex-col border dark:border-white/10 animate-in zoom-in-95 duration-300">
                    
                    {/* Header Fixed */}
                    <div className="p-5 sm:p-8 border-b dark:border-white/5 flex justify-between items-start bg-white dark:bg-[#0b241f] shrink-0 pt-safe sm:rounded-t-[2.5rem]">
                        <div className="space-y-2">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTypeStyles(selectedExperience.experience_type).bg} ${getTypeStyles(selectedExperience.experience_type).color}`}>
                                {selectedExperience.experience_type}
                            </span>
                            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase leading-tight pr-4">{selectedExperience.title}</h2>
                        </div>
                        <button onClick={() => { setSelectedExperience(null); setCommentText(''); setEditingCommentId(null); }} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">
                          <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Body (Description + Meta + Comments) */}
                    <div className="overflow-y-auto flex-1 no-scrollbar flex flex-col">
                        
                        {/* Core Content */}
                        <div className="p-5 sm:p-8 bg-white dark:bg-[#0b241f] space-y-6 sm:space-y-8">
                          <p className="text-sm sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedExperience.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                              <div className="space-y-1 min-w-0">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> Contributor</span>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedExperience.farmer_name}</p>
                              </div>
                              <div className="space-y-1 min-w-0 border-l border-slate-200 dark:border-white/10 pl-4">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Location</span>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedExperience.location || 'N/A'}</p>
                              </div>
                          </div>

                          {/* Social Actions (Like, Share, Toggle Comments) */}
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button 
                              onClick={() => toggleVote(selectedExperience.id)} 
                              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${selectedExperience.is_liked_by_me ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                            >
                                <ThumbsUp size={14} className={selectedExperience.is_liked_by_me ? 'fill-current' : ''}/> 
                                {selectedExperience.is_liked_by_me ? 'Helpful' : 'Mark Helpful'} 
                                <span className="ml-1 px-1.5 py-0.5 bg-black/10 rounded-md">{selectedExperience.likes_count || 0}</span>
                            </button>
                            <button onClick={() => handleShare(selectedExperience)} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
                              <Share2 size={14}/> Share
                            </button>
                            
                            {/* DISABLE COMMENTS TOGGLE FOR ADMINS/CREATORS */}
                            {canCreate && (
                              <button 
                                onClick={handleToggleComments} 
                                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm ml-auto"
                              >
                                {selectedExperience.comments_enabled === false ? (
                                  <><Unlock size={14} className="text-emerald-500" /> Enable Discussion</>
                                ) : (
                                  <><Lock size={14} className="text-rose-500" /> Disable Discussion</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Discussion / Comments Section */}
                        <div className="p-5 sm:p-8 flex-1">
                          <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">
                            <MessageSquare size={16} className={selectedExperience.comments_enabled === false ? 'text-slate-400' : 'text-emerald-600'} /> 
                            Discussion ({selectedExperience.comments?.length || 0})
                          </h4>

                          <div className="space-y-4 sm:space-y-5">
                            {selectedExperience.comments && selectedExperience.comments.length > 0 ? (
                              selectedExperience.comments.map((c, i) => (
                                <div key={c.id || i} className="flex gap-3 sm:gap-4 group animate-in slide-in-from-bottom-2">
                                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 border border-emerald-200 dark:border-emerald-500/30 mt-1">
                                    {c.user_name?.charAt(0) || 'U'}
                                  </div>
                                  <div className="flex-1 flex flex-col gap-1">
                                    <div className="bg-white dark:bg-[#0b241f] border border-slate-100 dark:border-white/5 p-4 sm:p-5 rounded-2xl rounded-tl-none shadow-sm">
                                      
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{c.user_name}</span>
                                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                            <Clock size={10}/> {new Date(c.created_at).toLocaleDateString()}
                                          </span>
                                        </div>

                                        {/* Owner Actions: Edit / Delete */}
                                        {c.user_id === user?.id && editingCommentId !== c.id && (
                                          <div className="flex gap-1.5 sm:gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditCommentClick(c)} className="text-blue-500 hover:text-blue-600 p-1 bg-blue-50 dark:bg-blue-500/10 rounded-md">
                                              <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => handleDeleteComment(c.id)} className="text-rose-500 hover:text-rose-600 p-1 bg-rose-50 dark:bg-rose-500/10 rounded-md">
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Inline Editor OR Normal Text */}
                                      {editingCommentId === c.id ? (
                                        <div className="mt-2 space-y-2 animate-in fade-in">
                                          <textarea 
                                            value={editCommentText} 
                                            onChange={(e) => setEditCommentText(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-all resize-none min-h-[60px]"
                                          />
                                          <div className="flex justify-end gap-2">
                                            <button onClick={handleCancelEdit} className="text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white uppercase tracking-widest px-3 py-1.5">Cancel</button>
                                            <button onClick={() => handleSaveEditComment(c.id)} disabled={!editCommentText.trim()} className="text-[9px] sm:text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg uppercase tracking-widest px-4 py-1.5 disabled:opacity-50 transition-colors">Save Edit</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                                      )}
                                      
                                    </div>
                                    
                                    {/* NEW: COMMENT LIKE/DISLIKE FEATURE */}
                                    <div className="flex items-center gap-3 px-2">
                                      <button 
                                        onClick={() => handleToggleCommentLike(c.id)}
                                        className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${c.is_liked_by_me ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                      >
                                        <ThumbsUp size={12} className={c.is_liked_by_me ? 'fill-current' : ''} />
                                        <span>{c.likes_count || 0}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 sm:py-12 bg-white/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                {selectedExperience.comments_enabled === false ? (
                                  <>
                                    <Lock size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">Discussion Locked.</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Comments are turned off for this experience.</p>
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">No field notes yet.</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Be the first to share your perspective on this experience.</p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                    </div>

                    {/* Fixed Footer: Conditionally render Input Bar OR Disabled Message */}
                    <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b241f] shrink-0 pb-safe sm:rounded-b-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
                      {selectedExperience.comments_enabled !== false ? (
                        <form onSubmit={handleCommentSubmit} className="flex items-end gap-2 sm:gap-3">
                          <div className="flex-1 relative">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment..."
                              rows="1"
                              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 sm:py-4 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-all resize-none min-h-[44px] sm:min-h-[52px]"
                              onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = (e.target.scrollHeight) + 'px';
                              }}
                            />
                          </div>
                          <button 
                            type="submit" 
                            disabled={!commentText.trim()}
                            className="h-[44px] sm:h-[52px] px-5 sm:px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 shrink-0"
                          >
                            <span className="hidden sm:inline">Post</span>
                            <Send size={16} className="sm:w-[18px] sm:h-[18px] -ml-1 sm:ml-0" />
                          </button>
                        </form>
                      ) : (
                        <div className="w-full py-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Lock size={14} /> Comments have been disabled by the author
                          </p>
                        </div>
                      )}
                    </div>

                </div>
            </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
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