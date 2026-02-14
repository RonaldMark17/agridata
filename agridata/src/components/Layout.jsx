import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, Beaker, Map, 
  ShoppingBasket, UsersRound, History, LogOut, 
  Menu, X, Sprout, ChevronRight, Bell, Search,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
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

  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
      {/* 1. MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] bg-gradient-to-b from-[#062c24] to-[#041d18] text-white shadow-2xl 
        transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col overflow-x-hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'}`}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          
          {/* Header - Increased height and internal padding */}
          <div className={`h-20 flex-shrink-0 flex items-center transition-all duration-300 border-b border-white/5 ${isCollapsed ? 'justify-center' : 'px-6 justify-between'}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0">
                <Sprout size={24} className="text-white" />
              </div>
              {!isCollapsed && (
                <h1 className="text-xl font-black tracking-tight uppercase animate-in fade-in slide-in-from-left-4 duration-500 whitespace-nowrap overflow-hidden">
                  AgriData
                </h1>
              )}
            </div>

            {/* Minimize Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2.5 text-emerald-100/40 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>

            {/* Mobile Close */}
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-emerald-100">
              <X size={24} />
            </button>
          </div>

          {/* Navigation - Increased vertical gaps */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-2xl transition-all duration-300 group relative whitespace-nowrap
                    ${isCollapsed ? 'justify-center p-3.5' : 'gap-4 px-5 py-4'}
                    ${isActive 
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-900/40' 
                      : 'text-emerald-100/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="font-bold text-sm tracking-wide animate-in fade-in duration-300 overflow-hidden">
                      {item.name}
                    </span>
                  )}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-4 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[80] shadow-2xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Profile Area - Restored padding */}
          <div className="p-4 bg-black/10 border-t border-emerald-800/20 overflow-x-hidden">
            <div className={`flex items-center rounded-[24px] bg-white/5 backdrop-blur-md mb-4 border border-white/5 transition-all duration-300 ${isCollapsed ? 'justify-center p-2' : 'p-4 gap-4'}`}>
              <div className="h-11 w-11 min-w-[44px] rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-white shrink-0 shadow-lg">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-500 whitespace-nowrap overflow-hidden">
                  <p className="text-sm font-black truncate tracking-wide">{user?.full_name}</p>
                  <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mt-1 opacity-60 truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap
              ${isCollapsed ? 'justify-center p-3.5' : 'gap-4 px-5 py-4'}`}
            >
              <LogOut size={20} className="shrink-0" />
              {!isCollapsed && <span className="overflow-hidden">Log Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header - Increased height to match Sidebar (h-20) */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 md:px-10 flex items-center justify-between sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
              <Menu size={24} />
            </button>
            
            <nav className="hidden sm:flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              <span className="hover:text-emerald-600 transition-colors cursor-pointer">ARMS</span>
              {pathSegments.map((segment, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={12} className="opacity-30" />
                  <span className={`${idx === pathSegments.length - 1 ? 'text-slate-900' : ''}`}>
                    {segment.replace(/-/g, ' ')}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input type="text" placeholder="Global Search..." className="pl-12 pr-6 py-3 bg-slate-100/50 border-none rounded-2xl text-xs font-bold w-64 lg:w-80 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-all" />
            </div>
            <button className="p-3.5 text-slate-400 hover:text-emerald-600 relative group transition-all">
              <Bell size={22} />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
            </button>
          </div>
        </header>

        {/* Workspace - Increased outer padding for airy feel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
            <Outlet />
          </div>
          <div className="h-10" />
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
      `}} />
    </div>
  );
}