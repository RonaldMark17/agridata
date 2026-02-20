import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI, authAPI } from '../services/api'; 
import { 
  LayoutDashboard, Users, BookOpen, Beaker, Map, 
  ShoppingBasket, UsersRound, History, LogOut, 
  Menu, X, Sprout, ChevronRight, Bell, Search,
  PanelLeftClose, PanelLeftOpen, Settings, Sun, Moon, Monitor,
  AlertCircle, Building2, ClipboardList, CheckCheck, Trash2,
  Activity, RefreshCw, Smartphone, ShieldCheck,MapPinned
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- PERSISTENCE & THEME ---
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('agri-sidebar-collapsed') === 'true');
  const [theme, setTheme] = useState(() => localStorage.getItem('agri-theme') || 'system');
  
  // --- [FIX] INITIALIZE STATE CORRECTLY ---
  const [otpEnabled, setOtpEnabled] = useState(() => {
    if (!user) return false;
    return user.otp_enabled === true || user.otp_enabled === 1 || user.otp_enabled === "1" || user.otp_enabled === "true";
  });
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Modal States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const isModalActive = settingsOpen || showLogoutConfirm;

  // --- FUNCTIONAL NOTIFICATIONS STATE ---
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  // --- [FIX] SYNC WITH SERVER ON LOAD ---
  useEffect(() => {
    const syncSecuritySettings = async () => {
      if (!user) return;
      try {
        const response = await authAPI.getCurrentUser();
        const serverUser = response.data;
        const isServerEnabled = 
          serverUser.otp_enabled === true || 
          serverUser.otp_enabled === 1 || 
          serverUser.otp_enabled === "1" ||
          serverUser.otp_enabled === "true";

        if (isServerEnabled !== otpEnabled) {
            setOtpEnabled(isServerEnabled);
        }
      } catch (err) {
        console.warn("Could not sync security settings:", err);
      }
    };

    syncSecuritySettings();
  }, [user, settingsOpen]);

  // --- NOTIFICATION ENGINE ---
  const fetchNotifications = async () => {
    if (!user) return; 
    try {
      const response = await notificationsAPI.getAll();
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn("Notification sync delayed");
      }
    }
  };

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await notificationsAPI.markAsRead(id);
    } catch (err) { 
      console.error("Failed to mark read:", err); 
    }
  };

  // --- NEW: REDIRECTION LOGIC ---
  const handleNotificationClick = (notification) => {
    // 1. Mark as Read
    if (!notification.is_read) {
        markAsRead(notification.id);
    }
    
    // 2. Close Dropdown
    setShowNotifications(false);

    // 3. Determine Route based on Title or Message Keywords
    const text = (notification.title + " " + notification.message).toLowerCase();
    
    if (text.includes('farmer') || text.includes('lineage') || text.includes('succession')) {
        navigate('/farmers');
    } else if (text.includes('survey') || text.includes('instrument') || text.includes('protocol')) {
        navigate('/surveys');
    } else if (text.includes('research') || text.includes('project')) {
        navigate('/projects');
    } else if (text.includes('experience') || text.includes('knowledge')) {
        navigate('/experiences');
    } else if (text.includes('organization')) {
        navigate('/organizations');
    } else if (text.includes('barangay') || text.includes('territory')) {
        navigate('/barangays');
    } else if (text.includes('commodity') || text.includes('product')) {
        navigate('/products');
    } else if (text.includes('user') || text.includes('account')) {
        navigate('/users');
    } else {
        // Default to dashboard if no keyword matches
        navigate('/dashboard');
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await notificationsAPI.markAllRead();
    } catch (err) { console.error("Failed to mark all read:", err); }
  };

  const clearNotifications = async () => {
    if (window.confirm("Purge all notification records?")) {
      setNotifications([]); 
      try {
        await notificationsAPI.deleteAll();
      } catch (err) { 
        console.error("Failed to clear:", err);
        fetchNotifications();
      }
    }
  };

  // --- OTP TOGGLE HANDLER ---
  const handleToggleOtp = async () => {
    // PREVENT ADMIN FROM DISABLING
    if (user?.role === 'admin' && otpEnabled) {
      alert("System Protocol: Administrators cannot disable Two-Factor Authentication.");
      return;
    }

    const newState = !otpEnabled;
    setOtpEnabled(newState); 
    
    try {
      await authAPI.toggleOtp(newState);
    } catch (error) {
      console.error("Failed to toggle OTP:", error);
      setOtpEnabled(!newState); 
      alert("Failed to update security settings. Check connection.");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]); 

  // --- THEME ENGINE ---
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'dark') root.classList.add('dark');
      else if (theme === 'light') root.classList.add('light');
      else root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };
    applyTheme();
    localStorage.setItem('agri-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('agri-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Geospatial Map', href: '/map', icon: MapPinned },
    { name: 'Farmers', href: '/farmers', icon: Users },
    { name: 'Experiences', href: '/experiences', icon: BookOpen },
    { name: 'Research Projects', href: '/projects', icon: Beaker },
    { name: 'Surveys', href: '/surveys', icon: ClipboardList },
    { name: 'Barangays', href: '/barangays', icon: Map },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
    { name: 'Products', href: '/products', icon: ShoppingBasket },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'User Management', href: '/users', icon: UsersRound });
    navigation.push({ name: 'Activity Logs', href: '/logs', icon: History });
  }

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="h-screen bg-[#F8FAFC] dark:bg-[#020c0a] overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      
      {/* CONTENT WRAPPER */}
      <div className={`flex w-full h-full transition-all duration-300 ease-out ${isModalActive ? 'filter blur-sm brightness-75 scale-[0.99] pointer-events-none' : ''}`}>
        
        {/* MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-[110] bg-white dark:bg-[#041d18] text-slate-600 dark:text-white border-r border-slate-200 dark:border-white/5 shadow-2xl transition-all duration-500 lg:translate-x-0 lg:relative lg:flex lg:flex-col overflow-x-hidden ${sidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-[90px]' : 'lg:w-[280px]'}`}>
          <div className="flex flex-col h-full w-full">
            <div className={`h-20 flex-shrink-0 flex items-center border-b border-slate-100 dark:border-white/5 transition-all duration-500 ${isCollapsed ? 'justify-center' : 'px-8 justify-between'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg shrink-0">
                  <Sprout size={22} className="text-white" />
                </div>
                {(!isCollapsed || sidebarOpen) && (
                  <div className="flex flex-col animate-in fade-in slide-in-from-left-4">
                    <span className="text-lg font-bold leading-none text-slate-900 dark:text-white uppercase tracking-tighter">AgriData</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1">Systems</span>
                  </div>
                )}
              </div>
              <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-white rounded-lg transition-all">
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.name} to={item.href} className={`flex items-center rounded-xl transition-all duration-300 group relative ${(isCollapsed && !sidebarOpen) ? 'justify-center h-12 w-12 mx-auto' : 'gap-4 px-4 h-12'} ${isActive ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-white'}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {(!isCollapsed || sidebarOpen) && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 mt-auto border-t border-slate-100 dark:border-white/5">
              <div className={`flex items-center rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 transition-all duration-500 ${(isCollapsed && !sidebarOpen) ? 'justify-center p-2' : 'p-3 gap-3'}`}>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-bold text-white shadow-lg">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                {(!isCollapsed || sidebarOpen) && (
                  <div className="flex-1 min-w-0 animate-in fade-in">
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-slate-100">{user?.full_name}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mt-0.5">{user?.role?.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setShowLogoutConfirm(true)} className={`mt-3 w-full flex items-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-bold text-[10px] uppercase tracking-widest ${isCollapsed ? 'justify-center h-12' : 'gap-4 px-4 h-12'}`}>
                <LogOut size={18} className="shrink-0" />
                {(!isCollapsed || sidebarOpen) && <span className="ml-1">Log Out</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <header className="h-20 bg-white/80 dark:bg-[#041d18]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-4 sm:px-6 md:px-10 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                <Menu size={24} />
              </button>
              <nav className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-emerald-500/50">
                <span>Portal</span>
                {pathSegments.map((segment, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight size={12} />
                    <span className={idx === pathSegments.length - 1 ? 'text-slate-900 dark:text-white' : ''}>{segment.replace(/-/g, ' ')}</span>
                  </React.Fragment>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-5">
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}>
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-[#041d18] animate-bounce">{unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-[#0b241f] rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden z-[100] animate-in fade-in zoom-in-95">
                    <div className="p-5 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-sm dark:text-white uppercase tracking-tight">Recent Alerts</h3>
                      <div className="flex gap-2">
                        <button onClick={fetchNotifications} title="Refresh" className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"><RefreshCw size={14}/></button>
                        <button onClick={markAllAsRead} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg"><CheckCheck size={14}/></button>
                        <button onClick={clearNotifications} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-xs italic">Clear channel</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-5 border-b dark:border-white/5 last:border-0 flex gap-4 cursor-pointer transition-all ${!n.is_read ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : 'opacity-60 hover:opacity-100'}`}>
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`} />
                            <div className="min-w-0">
                              <p className={`text-sm tracking-tight leading-snug ${!n.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium'}`}>{n.title}</p>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                              <p className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600 mt-2 tracking-widest">{n.created_at_human || 'Just now'}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setSettingsOpen(true)} className="p-2.5 text-slate-400 hover:text-emerald-600 transition-all"><Settings size={20} /></button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#020c0a] no-scrollbar">
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* SETTINGS POPUP MODAL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-white dark:bg-[#0b241f] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border dark:border-white/10">
            <div className="p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">System Preferences</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Personalize environment</p>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-10 space-y-10">
              
              {/* DISPLAY MODE */}
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2"><Activity size={14} /> Display Mode</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[{ id: 'light', icon: Sun, label: 'Light' }, { id: 'dark', icon: Moon, label: 'Dark' }, { id: 'system', icon: Monitor, label: 'System' }].map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)} className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${theme === t.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-50 dark:border-white/5 text-slate-400'}`}>
                      <t.icon size={22} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* SECURITY PROTOCOLS (OTP) */}
              <section className="pt-6 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                  <ShieldCheck size={14} /> Security Protocols
                </h4>
                <div className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-colors ${otpEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Auth (OTP)</p>
                      <p className="text-[10px] font-medium text-slate-400">Require email code verification on login</p>
                      {/* FIX: Warning indicator for admins */}
                      {user?.role === 'admin' && otpEnabled && (
                        <p className="text-[9px] font-bold text-rose-500 mt-1 uppercase tracking-widest">Required for Admins</p>
                      )}
                    </div>
                  </div>
                  
                  {/* FIX: Disable button visually and programmatically if Admin */}
                  <button 
                    onClick={handleToggleOtp} 
                    disabled={user?.role === 'admin' && otpEnabled}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none 
                      ${otpEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'} 
                      ${user?.role === 'admin' && otpEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 transform ${otpEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </section>

              <button onClick={() => { setSettingsOpen(false); setShowLogoutConfirm(true); }} className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-3"><LogOut size={18} /><span>Terminate Session</span></button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white dark:bg-[#0b241f] rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center border dark:border-white/10 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertCircle size={40} /></div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2 dark:text-white">End Session?</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Access keys will be cleared. Verification required to resume protocol.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full py-4 bg-slate-900 dark:bg-emerald-500 text-white dark:text-[#041d18] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">Confirm Termination</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden !important; }
        .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 300ms; }
      `}} />
    </div>
  );
}