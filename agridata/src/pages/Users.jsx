import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI, organizationsAPI } from '../services/api';
import { 
  UserPlus, ShieldCheck, Microscope, PenTool, Eye, 
  Building, Lock, X, Edit2, Search,
  Fingerprint, Loader2, AlertCircle, 
  Ban, CheckCircle, UserX, UserCheck, Trash2, Filter, Download, ArrowUpDown
} from 'lucide-react';

// --- Skeleton Component ---
const UserSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-10 py-6">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 bg-slate-100 dark:bg-white/5 rounded-xl"></div>
            <div className="space-y-3">
              <div className="h-4 w-40 bg-slate-100 dark:bg-white/5 rounded"></div>
              <div className="h-3 w-24 bg-slate-50 dark:bg-white/5 rounded"></div>
            </div>
          </div>
        </td>
        <td className="px-10 py-6"><div className="h-8 w-28 bg-slate-50 dark:bg-white/5 rounded-xl"></div></td>
        <td className="px-10 py-6"><div className="h-4 w-32 bg-slate-50 dark:bg-white/5 rounded"></div></td>
        <td className="px-10 py-6"><div className="h-6 w-20 bg-slate-50 dark:bg-white/5 rounded-full"></div></td>
        <td className="px-10 py-6"><div className="h-10 w-20 bg-slate-50 dark:bg-white/5 rounded-xl ml-auto"></div></td>
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
  
  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc
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
        // Only include password if changed
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

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const action = newStatus ? 'ACTIVATE' : 'DISABLE';
    const confirmMessage = newStatus 
      ? `Re-authorize access for ${user.full_name}?` 
      : `Revoke system access for ${user.full_name}? This will block their login immediately.`;

    if (window.confirm(confirmMessage)) {
      try {
        await usersAPI.update(user.id, { is_active: newStatus });
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === user.id ? { ...u, is_active: newStatus } : u
        ));
      } catch (error) {
        alert(`Failed to ${action.toLowerCase()} user. Check network connection.`);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("PERMANENTLY OFFBOARD USER? This will remove their login and unlink their records. This action cannot be undone.")) {
        try {
            await usersAPI.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert(error.response?.data?.error || "Deletion failed. You cannot delete yourself or the primary admin.");
        }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: '',
      full_name: user.full_name,
      role: user.role,
      organization: user.organization_id || '' 
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

  // --- Filtering Logic ---
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
    admin: { icon: ShieldCheck, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' },
    researcher: { icon: Microscope, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
    data_encoder: { icon: PenTool, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
    viewer: { icon: Eye, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', border: 'border-slate-100 dark:border-white/10' }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 transition-colors duration-300 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 py-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">Governance Module</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Identity Governance</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage team access and secure system credentials.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
            >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>Export CSV</span>
            </button>
            <button 
                onClick={() => setShowModal(true)} 
                className="flex-1 lg:flex-none group flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all"
            >
                <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
                <span>Onboard Identity</span>
            </button>
          </div>
        </header>

        {/* TABLE SECTION */}
        <div className="px-4">
          <div className="bg-white dark:bg-[#0b241f] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden transition-all hover:shadow-2xl">
            <div className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input 
                    type="text" 
                    placeholder="Query identity..."
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 shadow-inner outline-none appearance-none cursor-pointer"
                    >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r} className="dark:bg-[#0b241f]">{r.replace('_', ' ')}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-emerald-600 transition-colors"
                >
                    <ArrowUpDown size={20} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'}/>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 tracking-widest uppercase">
                <Fingerprint size={14} /> Active Session Monitoring
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100 dark:border-white/5">
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6">Privilege</th>
                    <th className="px-10 py-6">Affiliation</th>
                    <th className="px-10 py-6">Security</th>
                    <th className="px-10 py-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No matching identities found</td></tr>
                  ) : (
                    filteredUsers.map((user) => {
                    const roleStyle = roleConfigs[user.role] || roleConfigs['viewer'];
                    const orgName = organizations.find(o => o.id === user.organization_id)?.name || 'Independent';
                    
                    return (
                      <tr key={user.id} className={`group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300 ${!user.is_active ? 'opacity-60 bg-slate-50 dark:bg-black/20 grayscale' : ''}`}>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black shadow-inner border border-slate-100 dark:border-white/10 group-hover:scale-110 transition-transform ${user.is_active ? 'bg-slate-50 dark:bg-[#020c0a] text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                              {user.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className={`text-sm font-black ${user.is_active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-600 line-through'}`}>{user.full_name}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold lowercase">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${roleStyle.bg} ${roleStyle.color} ${roleStyle.border}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Building size={14} className="text-slate-300 dark:text-slate-600"/> {orgName}
                        </td>
                        <td className="px-10 py-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.is_active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {user.is_active ? 'Active' : 'Disabled'}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button onClick={() => handleEdit(user)} className="p-2.5 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl shadow-sm transition-all">
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleToggleStatus(user)} 
                                className={`p-2.5 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-xl shadow-sm transition-all ${user.is_active ? 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                                title={user.is_active ? "Disable User" : "Enable User"}
                            >
                                {user.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                            </button>
                            {/* DELETE BUTTON */}
                            <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-2.5 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl shadow-sm transition-all"
                                title="Offboard User"
                            >
                                <Trash2 size={16} />
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
        </div>

        {/* MODAL REDESIGNED FOR DARK MODE */}
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={closeModal} />
            <div className="relative bg-white dark:bg-[#041d18] rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border dark:border-white/5">
              <div className="p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-xl shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{editingUser ? 'Update Identity' : 'Onboard User'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">Define technical credentials and system privilege levels.</p>
                </div>
                <button onClick={closeModal} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-300 dark:text-slate-600"><X size={28} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                {transactionError && (
                  <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-[2rem] flex items-center gap-4 text-rose-600 dark:text-rose-400 animate-in slide-in-from-top-4">
                    <div className="p-2 bg-white dark:bg-[#041d18] rounded-xl shadow-sm"><AlertCircle size={20} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest">Transaction Security Alert</p>
                      <p className="text-sm font-bold truncate tracking-tight">{transactionError}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username</label>
                      <input type="text" required disabled={!!editingUser} className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner disabled:opacity-40 outline-none transition-all" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Network Email</label>
                      <input type="email" required className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
                    <input type="text" required className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Governance Role</label>
                      <select className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner appearance-none outline-none transition-all cursor-pointer" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                        <option value="viewer" className="dark:bg-[#041d18]">Viewer (Read-Only)</option>
                        <option value="data_encoder" className="dark:bg-[#041d18]">Data Encoder</option>
                        <option value="researcher" className="dark:bg-[#041d18]">Scientific Researcher</option>
                        <option value="admin" className="dark:bg-[#041d18]">Global Admin</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Institutional Affiliation</label>
                      <select className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner appearance-none outline-none transition-all cursor-pointer" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })}>
                        <option value="" className="dark:bg-[#041d18]">Select Entity...</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id} className="dark:bg-[#041d18]">{org.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* PASSWORD SECTION */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{editingUser ? 'Credential Reset (Leave blank to keep)' : 'Access Key (Password)'}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                            <input type="password" required={!editingUser} className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingUser ? "New Password" : "Create password"} />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                            <input type="password" required={!editingUser || formData.password.length > 0} className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold dark:text-white shadow-inner outline-none transition-all" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm password" />
                        </div>
                    </div>
                  </div>
                </div>
              </form>

              <div className="px-10 py-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-6 shrink-0">
                <button type="button" onClick={closeModal} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Abort Operation</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="px-12 py-5 bg-emerald-600 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  <span>{editingUser ? 'Commit Changes' : 'Onboard Identity'}</span>
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