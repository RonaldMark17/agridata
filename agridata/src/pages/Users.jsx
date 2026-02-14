import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../services/api';
import { 
  UserPlus, ShieldCheck, Microscope, PenTool, Eye, 
  Building, Lock, X, Edit2, Trash2, Search,
  CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';

// --- Skeleton Component for User Rows ---
const UserSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
            </div>
          </div>
        </td>
        <td className="px-8 py-5"><div className="h-6 w-24 bg-gray-100 rounded-lg"></div></td>
        <td className="px-8 py-5"><div className="h-4 w-28 bg-gray-50 rounded"></div></td>
        <td className="px-8 py-5"><div className="h-5 w-20 bg-gray-100 rounded-full"></div></td>
        <td className="px-8 py-5 text-right"><div className="h-8 w-8 bg-gray-50 rounded-lg ml-auto"></div></td>
      </tr>
    ))}
  </>
);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', full_name: '', role: 'viewer', organization: ''
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
      } else {
        await authAPI.register(formData);
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this user? Access will be revoked immediately.')) {
      try {
        await usersAPI.delete(id);
        fetchUsers();
      } catch (error) { alert('Failed to delete user'); }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username, email: user.email, password: '',
      full_name: user.full_name, role: user.role, organization: user.organization || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', full_name: '', role: 'viewer', organization: '' });
  };

  const roleConfigs = {
    admin: { icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    researcher: { icon: Microscope, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    data_encoder: { icon: PenTool, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    viewer: { icon: Eye, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">Manage team access and system permissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 w-full md:w-auto"
        >
          <UserPlus className="w-5 h-5 mr-2" /> Add User
        </button>
      </div>

      {/* Stats - Stacks on small mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Object.entries(roleConfigs).map(([role, config]) => {
          const Icon = config.icon;
          return (
            <div key={role} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 md:p-3 rounded-xl ${config.bg} ${config.color}`}>
                  <Icon size={20} className="md:w-6 md:h-6" />
                </div>
                <span className="text-xl md:text-2xl font-black text-gray-900">
                  {users.filter(u => u.role === role).length}
                </span>
              </div>
              <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                {role.replace('_', ' ')}s
              </p>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-8 py-4">Identity</th>
                <th className="px-8 py-4">Role & Access</th>
                <th className="px-8 py-4">Organization</th>
                <th className="px-8 py-4">Security Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <UserSkeleton /> : filteredUsers.map((user) => {
                const roleStyle = roleConfigs[user.role] || roleConfigs['viewer'];
                const RoleIcon = roleStyle.icon;
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                          {user.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{user.full_name}</p>
                          <p className="text-xs text-gray-400 italic truncate">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${roleStyle.bg} ${roleStyle.color} ${roleStyle.border}`}>
                        <RoleIcon size={12} className="mr-1.5" />
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-600">
                      <div className="flex items-center gap-2 truncate max-w-[150px]">
                        <Building size={14} className="text-gray-300 shrink-0" />
                        {user.organization || 'Independent'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.is_active ? 'Verified' : 'Suspended'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adaptive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col transform transition-all">
            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingUser ? 'Profile Update' : 'New Identity'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
                  <input type="text" required disabled={!!editingUser} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-50" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input type="email" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Legal Name</label>
                <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="viewer">Viewer</option><option value="data_encoder">Data Encoder</option><option value="researcher">Researcher</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organization</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{editingUser ? 'Reset Password (Optional)' : 'Secret Key'}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input type="password" required={!editingUser} placeholder={editingUser ? "Leave blank to keep" : "••••••••"} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>

              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck size={16} /> Access Privileges
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[11px] text-emerald-700 font-medium">
                   {formData.role === 'admin' && <><div className="flex items-center gap-1.5"><CheckCircle2 size={12}/> User Governance</div><div className="flex items-center gap-1.5"><CheckCircle2 size={12}/> Global Deletion</div></>}
                   {formData.role !== 'viewer' && <div className="flex items-center gap-1.5"><CheckCircle2 size={12}/> Data Entry</div>}
                   <div className="flex items-center gap-1.5"><CheckCircle2 size={12}/> Profile Access</div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={closeModal} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-gray-400">Discard</button>
                <button type="submit" className="w-full sm:w-auto px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}