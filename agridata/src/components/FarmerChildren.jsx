import React, { useState } from 'react';
import { farmersAPI } from '../services/api';
import { 
  Users, Plus, X, Save, Loader2, GraduationCap, 
  Briefcase, Sprout, User, AlertCircle, Edit, Trash2, Heart
} from 'lucide-react';

export default function FarmerChildren({ farmerId, children = [], onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // --- MODIFICATION ENGINE ---
  const [editingId, setEditingId] = useState(null); 

  const initialForm = {
    name: '',
    age: '',
    gender: 'Male',
    education_level: 'High School',
    current_occupation: '',
    continues_farming: false,
    involvement_level: 'None',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Switch protocol to Edit Mode and fill form data
  const handleEditClick = (child) => {
    setEditingId(child.id);
    setFormData({
      name: child.name || '',
      age: child.age || '',
      gender: child.gender || 'Male',
      education_level: child.education_level || 'High School',
      current_occupation: child.current_occupation || '',
      continues_farming: child.continues_farming || false,
      involvement_level: child.involvement_level || 'None',
      notes: child.notes || ''
    });
    setShowModal(true);
  };

  // Reset internal states upon closure
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent triggering parent form submission
    }
    
    if (!farmerId) return;

    setLoading(true);
    setError('');

    try {
      if (editingId) {
        // PROTOCOL: Update Existing Identity
        await farmersAPI.updateChild(farmerId, editingId, formData);
      } else {
        // PROTOCOL: Create New Identity
        await farmersAPI.addChild(farmerId, formData);
      }
      
      closeModal();
      if (onUpdate) onUpdate(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Registry modification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChild = async (childId, name) => {
    if (window.confirm(`Revoke profile for ${name} from registry?`)) {
      try {
        await farmersAPI.deleteChild(farmerId, childId);
        if (onUpdate) onUpdate();
      } catch (err) {
        alert("Deletion protocol failed.");
      }
    }
  };

  // Guard: Locks family section until main profile is saved
  if (!farmerId) {
    return (
      <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-center border-dashed">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Registry Locked</p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 font-medium">Finalize the primary profile to enable lineage documentation.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0b241f] p-10 md:p-12 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 pb-2 border-b border-slate-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl shadow-inner"><Users size={20} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Family & Succession</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Institutional Lineage Registry</p>
          </div>
        </div>
        <button 
          type="button" // CRITICAL: Prevent parent form submission
          onClick={() => setShowModal(true)}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform"/> Append Record
        </button>
      </div>

      {/* DATA LIST GRID */}
      <div className="space-y-4">
        {children.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">No lineage records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child, idx) => (
              <div key={idx} className="group relative p-6 bg-slate-50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] border border-slate-100 dark:border-white/5 rounded-[2rem] transition-all hover:shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${child.gender === 'Female' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20'}`}>
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm tracking-tight">{child.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{child.age} Yrs</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                        type="button" // CRITICAL: Prevent parent form submission
                        onClick={() => handleEditClick(child)} 
                        className="p-2 bg-white dark:bg-[#041d18] rounded-lg text-slate-400 hover:text-emerald-500 border border-slate-100 dark:border-white/5 shadow-sm transition-all"
                    >
                        <Edit size={14} />
                    </button>
                    <button 
                        type="button" // CRITICAL: Prevent parent form submission
                        onClick={() => handleDeleteChild(child.id, child.name)} 
                        className="p-2 bg-white dark:bg-[#041d18] rounded-lg text-slate-400 hover:text-rose-500 border border-slate-100 dark:border-white/5 shadow-sm transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold">
                    <GraduationCap size={12} className="text-slate-300 dark:text-slate-600" />
                    <span className="truncate">{child.education_level}</span>
                  </div>
                  {child.continues_farming && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[9px] tracking-[0.2em]"><Sprout size={10} /> Successor</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- IDENTITY MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8">
          {/* BACKGROUND OVERLAY */}
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={closeModal} 
          />
          
          {/* MODAL CONTENT: e.stopPropagation() stops the click from hitting the background overlay */}
          <div 
            className="relative bg-white dark:bg-[#041d18] rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-white/5"
            onClick={(e) => e.stopPropagation()} 
          >
            
            <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl shrink-0 z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {editingId ? 'Modify Identity' : 'Enroll Identity'}
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">
                   {editingId ? `Spec Revision: #MOD-${editingId}` : 'Initial Registry Protocol'}
                </p>
              </div>
              <button 
                type="button"
                onClick={closeModal} 
                className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-slate-400 dark:text-slate-600 transition-all"
              >
                <X size={24}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-500/20">
                  <AlertCircle size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={16} />
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Current Age</label>
                  <input required type="number" name="age" value={formData.age} onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none cursor-pointer">
                    <option value="Male">Male</option><option value="Female">Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Academic Cycle</label>
                  <select name="education_level" value={formData.education_level} onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none cursor-pointer">
                    <option value="Elementary">Elementary Cycle</option>
                    <option value="High School">High School Diploma</option>
                    <option value="College">Academic Degree</option>
                    <option value="Vocational">Vocational Certificate</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Primary Occupation</label>
                  <input type="text" name="current_occupation" value={formData.current_occupation} onChange={handleInputChange} placeholder="e.g. Student, Labor"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white shadow-inner focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                </div>
              </div>

              {/* SUCCESSION PROTOCOL */}
              <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100 dark:border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-400 border-b border-emerald-100/50 dark:border-white/5 pb-2">
                  <Sprout size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Succession Protocol</span>
                </div>
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500/80">Labor Continuity Eligibility?</span>
                  <div className={`w-12 h-7 flex items-center rounded-full p-1 duration-300 transition-colors ${formData.continues_farming ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                    <div className={`bg-white dark:bg-slate-200 w-5 h-5 rounded-full shadow-md transform duration-300 ${formData.continues_farming ? 'translate-x-5' : ''}`} />
                  </div>
                  <input type="checkbox" name="continues_farming" checked={formData.continues_farming} onChange={handleInputChange} className="hidden" />
                </label>

                {formData.continues_farming && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400/60 uppercase tracking-widest ml-1 mb-2 block">Intensity</label>
                    <select name="involvement_level" value={formData.involvement_level} onChange={handleInputChange}
                      className="w-full px-6 py-3 bg-white dark:bg-[#0b241f] border-none rounded-xl text-sm font-bold shadow-sm outline-none text-emerald-800 dark:text-emerald-200 cursor-pointer">
                      <option value="High">High - Direct Labor</option>
                      <option value="Moderate">Moderate - Part-time</option>
                      <option value="Low">Low - Seasonal Only</option>
                    </select>
                  </div>
                )}
              </div>

            </form>

            <div className="p-8 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-end gap-4 shrink-0">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-8 py-4 text-xs font-black text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 uppercase tracking-widest transition-colors"
              >
                Abort
              </button>
              <button 
                type="submit" // Matches form onSubmit
                onClick={handleSubmit} 
                disabled={loading}
                className="px-10 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                <span>{editingId ? 'Update Record' : 'Commit Entry'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}