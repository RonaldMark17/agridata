import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, Beaker, Map, 
  ShoppingBasket, UsersRound, History, LogOut, 
  Menu, X, Sprout, ChevronRight, Bell, Search,
  PanelLeftClose, PanelLeftOpen, Settings, Sun, Moon, Monitor,
  AlertCircle
} from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Functional States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New Logout State
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Farmer Registered', desc: 'Juan Dela Cruz from Brgy. San Jose', time: '2m ago', unread: true },
    { id: 2, title: 'Project Update', desc: 'Rice Yield Study Phase 2 is active', time: '1h ago', unread: true },
    { id: 3, title: 'System Maintenance', desc: 'Scheduled update at 12:00 AM', time: '5h ago', unread: false },
  ]);

  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // --- LOGOUT ENGINE ---
  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Farmers', href: '/farmers', icon: Users },
    { name: 'Experiences', href: '/experiences', icon: BookOpen },
    { name: 'Research Projects', href: '/projects', icon: Beaker },
    { name: 'Barangays', href: '/barangays', icon: Map },
    { name: 'Products', href: '/products', icon: ShoppingBasket },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'User Management', href: '/users', icon: UsersRound });
    navigation.push({ name: 'Activity Logs', href: '/logs', icon: History });
  }

  const filteredNav = searchQuery.length > 0 
    ? navigation.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
      {/* 1. MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[110] bg-[#041d18] text-white shadow-2xl 
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 lg:relative lg:flex lg:flex-col
        overflow-x-hidden
        ${sidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-[90px]' : 'lg:w-[280px]'}`}
      >
        <div className="flex flex-col h-full w-full overflow-x-hidden">
          
          {/* Sidebar Header */}
          <div className={`h-20 flex-shrink-0 flex items-center border-b border-white/5 transition-all duration-500 overflow-hidden ${isCollapsed ? 'justify-center' : 'px-8 justify-between'}`}>
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0">
                <Sprout size={22} className="text-white" />
              </div>
              {(!isCollapsed || sidebarOpen) && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500 whitespace-nowrap">
                  <span className="text-lg font-bold leading-none tracking-tight">AgriData</span>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1">Systems</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 text-emerald-100/40 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-emerald-100">
               <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar overflow-x-hidden">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden
                    ${(isCollapsed && !sidebarOpen) ? 'justify-center h-12 w-12 mx-auto' : 'gap-4 px-4 h-12'}
                    ${isActive 
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-900/40' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  {(!isCollapsed || sidebarOpen) && (
                    <span className="font-semibold text-sm tracking-wide whitespace-nowrap animate-in fade-in duration-300">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Profile & Sidebar Logout */}
          <div className="p-4 mt-auto overflow-hidden">
            <div className={`flex items-center rounded-2xl bg-white/[0.03] border border-white/5 transition-all duration-500 overflow-hidden ${(isCollapsed && !sidebarOpen) ? 'justify-center p-2' : 'p-3 gap-3'}`}>
              <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-bold text-white shrink-0 shadow-lg">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              {(!isCollapsed || sidebarOpen) && (
                <div className="flex-1 min-w-0 overflow-hidden animate-in fade-in duration-300 whitespace-nowrap">
                  <p className="text-sm font-bold truncate text-slate-100">{user?.full_name}</p>
                  <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest mt-0.5 truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
            {/* Sidebar Logout Trigger */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`mt-3 w-full flex items-center rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-[10px] uppercase tracking-widest overflow-hidden
              ${isCollapsed ? 'justify-center h-12' : 'gap-4 px-4 h-12'}`}
            >
              <LogOut size={18} className="shrink-0" />
              {(!isCollapsed || sidebarOpen) && <span className="whitespace-nowrap ml-1">Log Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* RESPONSIVE HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 sm:px-6 md:px-10 flex items-center justify-between sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Menu size={24} />
            </button>
            
            <nav className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span className="hover:text-emerald-600 transition-colors cursor-pointer">Portal</span>
              {pathSegments.map((segment, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={12} className="opacity-40" />
                  <span className={`truncate max-w-[80px] md:max-w-none ${idx === pathSegments.length - 1 ? 'text-slate-900' : ''}`}>
                    {segment.replace(/-/g, ' ')}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-5">
            {/* Search */}
            <div className="relative group">
              <div className="hidden md:flex relative">
                <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-emerald-500' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick jump..." 
                  className="pl-11 pr-6 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium w-48 lg:w-80 focus:bg-white focus:border-emerald-500/20 outline-none transition-all shadow-sm" 
                />
              </div>
              <button className="md:hidden p-2.5 text-slate-400 hover:text-emerald-600"><Search size={20} /></button>

              {/* Search Results */}
              {searchQuery && (
                <div className="absolute top-full right-0 md:left-0 mt-2 w-64 md:w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                   {filteredNav.length > 0 ? filteredNav.map(item => (
                    <Link key={item.name} to={item.href} onClick={() => setSearchQuery('')} className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors">
                      <item.icon size={16} />
                      <span className="text-sm font-bold">{item.name}</span>
                    </Link>
                  )) : (
                    <div className="px-4 py-6 text-center text-slate-400 text-sm">No results found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl relative transition-all ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                >
                  <Bell size={20} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <button onClick={() => setNotifications(n => n.map(x => ({...x, unread: false})))} className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b last:border-0 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-emerald-50/20' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate">{n.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Trigger */}
              <button 
                onClick={() => setSettingsOpen(true)}
                className="p-2.5 text-slate-400 hover:text-emerald-600 transition-all"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] no-scrollbar overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <Outlet />
          </div>
          <div className="h-20 lg:h-10" />
        </main>

        {/* SETTINGS DRAWER */}
        {settingsOpen && (
          <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] animate-in fade-in duration-300" onClick={() => setSettingsOpen(false)} />
            <div className="fixed top-0 right-0 h-full w-full max-w-[320px] sm:max-w-sm bg-white shadow-2xl z-[160] animate-in slide-in-from-right duration-500 flex flex-col">
              <div className="p-6 bg-emerald-900 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-bold">Preferences</h3>
                  <p className="text-emerald-400 text-xs mt-1">Configure your workspace</p>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><X size={20} /></button>
              </div>
              
              <div className="p-6 sm:p-8 flex-1 overflow-y-auto no-scrollbar space-y-8">
                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Display Mode</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[{id: 'light', icon: Sun}, {id: 'dark', icon: Moon}, {id: 'system', icon: Monitor}].map(t => (
                      <button key={t.id} className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-slate-100 hover:border-emerald-500 transition-all">
                        <t.icon size={18} />
                        <span className="text-[10px] font-bold uppercase">{t.id}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Sidebar Layout</h4>
                  <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                    <span className="text-sm font-bold text-slate-700">Compact Sidebar</span>
                    <div className={`w-10 h-5 rounded-full relative transition-all ${isCollapsed ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isCollapsed ? 'left-5.5' : 'left-0.5'}`} />
                    </div>
                  </button>
                </section>
              </div>

              {/* Drawer Logout Trigger */}
              <div className="p-6 sm:p-8 bg-slate-50 border-t">
                <button 
                  onClick={() => setShowLogoutConfirm(true)} 
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95"
                >
                  <LogOut size={18} />
                  <span>Log Out of AgriData</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
               <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">End Session?</h2>
            <p className="text-slate-500 font-medium mb-8">You will need to re-authenticate to access the data portal.</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
              >
                Terminate Session
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 bg-white text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden !important; }
        .cubic-bezier { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      `}} />
    </div>
  );
}