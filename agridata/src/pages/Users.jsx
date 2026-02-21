import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI, organizationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, ShieldCheck, Microscope, PenTool, Eye, 
  Building, Lock, X, Edit2, Search,
  Fingerprint, Loader2, AlertCircle, 
  Ban, CheckCircle, Trash2, Filter, Download, ArrowUpDown
} from 'lucide-react';

// --- Skeleton Component ---
const UserSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-white/5">
        <td className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-100 dark:bg-white/5 rounded-xl shrink-0"></div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-3 sm:h-4 w-24 sm:w-32 bg-slate-100 dark:bg-white/5 rounded"></div>
              <div className="h-2 sm:h-3 w-16 sm:w-20 bg-slate-50 dark:bg-white/5 rounded"></div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 sm:px-6 sm:py-5"><div className="h-6 sm:h-7 w-20 sm:w-24 bg-slate-50 dark:bg-white/5 rounded-md sm:rounded-lg"></div></td>
        <td className="px-4 py-4 sm:px-6 sm:py-5"><div className="h-3 sm:h-4 w-24 sm:w-32 bg-slate-50 dark:bg-white/5 rounded"></div></td>
        <td className="px-4 py-4 sm:px-6 sm:py-5"><div className="h-5 sm:h-6 w-16 sm:w-20 bg-slate-50 dark:bg-white/5 rounded-full"></div></td>
        <td className="px-4 py-4 sm:px-6 sm:py-5 text-right"><div className="h-8 w-20 sm:h-10 sm:w-24 bg-slate-50 dark:bg-white/5 rounded-lg sm:rounded-xl ml-auto"></div></td>
      </tr>
    ))}
  </>
);

const ROLE_OPTIONS = ['All', 'admin', 'researcher', 'data_encoder', 'viewer'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [isExporting, setIsExporting] = useState(false);
  const [transactionError, setTransactionError] = useState('');

  const initialForm = {
    username: '', email: '', password: '', confirmPassword: '', full_name: '', role: 'viewer', organization: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { 
    fetchUsers(); 
    fetchOrganizations();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizationsAPI.getAll();
      setOrganizations(response.data);
    } catch (error) {
      console.error('Organization fetch error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 

    setSubmitting(true);
    setTransactionError('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.full_name.trim()) {
      setTransactionError('Identification fields cannot be empty.');
      setSubmitting(false);
      return;
    }

    if (!editingUser && formData.password !== formData.confirmPassword) {
        setTransactionError('Security keys (passwords) do not match.');
        setSubmitting(false);
        return;
    }

    try {
      const payload = {
        ...formData,
        organization: formData.organization || null
      };

      if (editingUser) {
        if (!payload.password) delete payload.password;
        delete payload.confirmPassword;
        await usersAPI.update(editingUser.id, payload);
      } else {
        delete payload.confirmPassword;
        await authAPI.register(payload);
      }
      
      closeModal();
      await fetchUsers(); 
    } catch (error) {
      const backendMessage = error?.response?.data?.error 
                          || error?.response?.data?.message 
                          || error?.message 
                          || 'Transaction rejected by server.';
      setTransactionError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (!isAdmin) return;
    const newStatus = !targetUser.is_active;
    const confirmMessage = newStatus 
      ? `Re-authorize access for ${targetUser.full_name}?` 
      : `Revoke system access for ${targetUser.full_name}?`;

    if (window.confirm(confirmMessage)) {
      try {
        await usersAPI.update(targetUser.id, { is_active: newStatus });
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === targetUser.id ? { ...u, is_active: newStatus } : u
        ));
      } catch (error) {
        alert(`Failed to update status.`);
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (!isAdmin) return;
    if (window.confirm(`PERMANENTLY OFFBOARD USER: ${name}? This action cannot be undone.`)) {
        try {
            await usersAPI.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert(error.response?.data?.error || "Deletion failed.");
        }
    }
  };

  const handleEdit = (targetUser) => {
    if (!isAdmin) return;
    setEditingUser(targetUser);
    setFormData({
      username: targetUser.username,
      email: targetUser.email,
      password: '',
      confirmPassword: '',
      full_name: targetUser.full_name,
      role: targetUser.role,
      organization: targetUser.organization_id || '' 
    });
    setTransactionError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialForm);
    setTransactionError('');
  };

  const handleExport = () => {
    setIsExporting(true);
    const headers = ["Username", "Full Name", "Email", "Role", "Status", "Organization"];
    const rows = users.map(u => {
        const orgName = organizations.find(o => o.id === u.organization_id)?.name || 'Independent';
        return [u.username, `"${u.full_name}"`, u.email, u.role, u.is_active ? 'Active' : 'Disabled', `"${orgName}"`];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `user_registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const filteredUsers = users
    .filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              u.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
        return sortOrder === 'asc' 
            ? a.full_name.localeCompare(b.full_name) 
            : b.full_name.localeCompare(a.full_name);
    });

  const roleConfigs = {
    admin: { icon: ShieldCheck, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' },
    researcher: { icon: Microscope, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
    data_encoder: { icon: PenTool, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
    viewer: { icon: Eye, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', border: 'border-slate-200 dark:border-white/10' }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 transition-colors duration-300 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-8 animate-in fade-in duration-700 px-2 sm:px-4">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 pt-4 sm:pt-6 px-2 sm:px-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-3">
              <div className="p-1 sm:p-2 bg-emerald-600 rounded-lg text-white shadow-lg shrink-0">
                <ShieldCheck size={14} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Governance Module</span>
            </div>
            <h1 className="text-xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Identity Governance</h1>
            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 sm:mt-2">Manage team access and secure system credentials.</p>
          </div>
          
          <div className="flex flex-row items-center gap-2 w-full lg:w-auto">
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
            >
                {isExporting ? <Loader2 size={12} className="animate-spin sm:w-[14px] sm:h-[14px]" /> : <Download size={12} className="sm:w-[14px] sm:h-[14px]" />}
                <span>Export</span>
            </button>
            
            {isAdmin && (
              <button 
                  onClick={() => setShowModal(true)} 
                  className="flex-1 lg:flex-none group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
              >
                  <UserPlus size={12} className="sm:w-[14px] sm:h-[14px] group-hover:rotate-12 transition-transform" />
                  <span>Onboard</span>
              </button>
            )}
          </div>
        </header>

        {/* DATA CONTAINER */}
        <div className="bg-white dark:bg-[#0b241f] rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden transition-all">
          
          {/* TOOLBAR */}
          <div className="p-3 sm:p-6 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-5">
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
              <div className="relative flex-[2] sm:max-w-sm">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search identity..."
                    className="w-full pl-8 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-white/5 border-none rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-[10px] sm:text-sm font-bold dark:text-white shadow-inner outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-48">
                    <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={12} />
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full pl-7 sm:pl-11 pr-6 py-2.5 sm:py-3 bg-slate-50 dark:bg-white/5 border-none rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 shadow-inner outline-none appearance-none cursor-pointer"
                    >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r} className="dark:bg-[#0b241f]">{r.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2.5 sm:p-3 bg-slate-50 dark:bg-white/5 rounded-lg sm:rounded-xl text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                >
                    <ArrowUpDown size={14} className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}/>
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 tracking-widest uppercase shrink-0">
              <Fingerprint size={12} /> Monitoring Active
            </div>
          </div>

          {/* FLUID HORIZONTAL SCROLL TABLE */}
          <div className="overflow-x-auto w-full no-scrollbar">
            {/* Removed table-fixed and adjusted padding to naturally fit columns without overlapping */}
            <table className="w-full text-left min-w-[700px] sm:min-w-[900px] whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Identity</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Privilege</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Affiliation</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Security</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {loading ? (
                  <UserSkeleton />
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No matching identities</td></tr>
                ) : (
                  filteredUsers.map((u) => {
                  const roleStyle = roleConfigs[u.role] || roleConfigs['viewer'];
                  const orgName = organizations.find(o => o.id === u.organization_id)?.name || 'Independent';
                  
                  return (
                    <tr key={u.id} className={`group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300 ${!u.is_active ? 'opacity-60 grayscale' : ''}`}>
                      
                      {/* Identity Column */}
                      <td className="px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black shadow-inner border border-slate-100 dark:border-white/10 shrink-0 text-xs sm:text-sm ${u.is_active ? 'bg-slate-50 dark:bg-[#020c0a] text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                            {u.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className={`text-[11px] sm:text-sm font-black ${u.is_active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>{u.full_name}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Privilege Column */}
                      <td className="px-4 py-4 sm:px-6 sm:py-5">
                        {/* Removed truncate max-w-full to stop "DATA EN..." issue */}
                        <span className={`inline-block px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] font-black uppercase tracking-wider border ${roleStyle.bg} ${roleStyle.color} ${roleStyle.border}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Affiliation Column */}
                      <td className="px-4 py-4 sm:px-6 sm:py-5">
                        <div className="text-[10px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 max-w-[150px] sm:max-w-[200px] truncate">
                           {orgName}
                        </div>
                      </td>

                      {/* Security Status Column */}
                      <td className="px-4 py-4 sm:px-6 sm:py-5">
                          <div className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${u.is_active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span>{u.is_active ? 'Active' : 'Locked'}</span>
                        </div>
                      </td>

                      {/* Operations Column */}
                      <td className="px-4 py-4 sm:px-6 sm:py-5 text-right">
                        <div className="flex justify-end gap-1.5 sm:gap-2">
                          <button 
                            onClick={() => handleEdit(u)} 
                            disabled={!isAdmin}
                            className="p-2 sm:p-2.5 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 hover:text-emerald-600 rounded-lg sm:rounded-xl shadow-sm disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                          >
                            <Edit2 size={14} className="sm:w-[16px] sm:h-[16px]" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(u)} 
                            disabled={!isAdmin}
                            className="p-2 sm:p-2.5 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 hover:text-amber-600 rounded-lg sm:rounded-xl shadow-sm disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                          >
                            {u.is_active ? <Ban size={14} className="sm:w-[16px] sm:h-[16px]" /> : <CheckCircle size={14} className="sm:w-[16px] sm:h-[16px]" />}
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id, u.full_name)} 
                            disabled={!isAdmin}
                            className="p-2 sm:p-2.5 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 hover:text-rose-600 rounded-lg sm:rounded-xl shadow-sm disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                          >
                            <Trash2 size={14} className="sm:w-[16px] sm:h-[16px]" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ONBOARD/EDIT MODAL (RESTRICTED TO ADMIN) */}
        {showModal && isAdmin && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4 md:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={closeModal} />
            
            <div className="relative bg-white dark:bg-[#041d18] rounded-none sm:rounded-[3rem] shadow-2xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 border-none sm:border dark:border-white/5">
              
              <div className="p-6 sm:p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl shrink-0 pt-safe">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">{editingUser ? 'Update Identity' : 'Onboard User'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-xs sm:text-sm mt-1">Define credentials and privilege levels.</p>
                </div>
                <button onClick={closeModal} className="p-2 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl sm:rounded-2xl transition-all text-slate-300 dark:text-slate-600 shrink-0">
                  <X size={24} className="sm:w-[28px] sm:h-[28px]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 sm:space-y-12 no-scrollbar pb-safe">
                {transactionError && (
                  <div className="p-4 sm:p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl sm:rounded-[2rem] flex items-center gap-3 sm:gap-4 text-rose-600 dark:text-rose-400 animate-in slide-in-from-top-4">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-[10px] sm:text-sm font-bold leading-relaxed">{transactionError}</p>
                  </div>
                )}

                <div className="space-y-6 sm:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-1.5 sm:space-y-3">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username</label>
                      <input type="text" required disabled={!!editingUser} className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm font-bold dark:text-white shadow-inner disabled:opacity-40 outline-none transition-all" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 sm:space-y-3">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Network Email</label>
                      <input type="email" required className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
                    <input type="text" required className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-1.5 sm:space-y-3">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Governance Role</label>
                      <select className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm font-bold dark:text-white shadow-inner appearance-none outline-none cursor-pointer" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                        <option value="viewer" className="dark:bg-[#041d18]">Viewer</option>
                        <option value="data_encoder" className="dark:bg-[#041d18]">Data Encoder</option>
                        <option value="researcher" className="dark:bg-[#041d18]">Scientific Researcher</option>
                        <option value="admin" className="dark:bg-[#041d18]">Global Admin</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-3">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Institutional Affiliation</label>
                      <select className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm font-bold dark:text-white shadow-inner appearance-none outline-none cursor-pointer" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })}>
                        <option value="" className="dark:bg-[#041d18]">Select Entity...</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id} className="dark:bg-[#041d18]">{org.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{editingUser ? 'Credential Reset (Leave blank to keep)' : 'Access Key (Password)'}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="relative">
                            <Lock className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={16} />
                            <input type="password" required={!editingUser} className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Passkey" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={16} />
                            <input type="password" required={!editingUser || formData.password.length > 0} className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm" />
                        </div>
                    </div>
                  </div>
                </div>
              </form>

              <div className="px-6 py-6 sm:px-10 sm:py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-6 shrink-0 pb-safe">
                <button type="button" onClick={closeModal} className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 bg-white sm:bg-transparent rounded-xl sm:rounded-none border border-slate-200 sm:border-none dark:bg-transparent dark:border-none transition-colors text-center">Abort</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-[1.25rem] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl sm:shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  <span>{editingUser ? 'Commit Changes' : 'Onboard Identity'}</span>
                </button>
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