import React, { useState, useEffect, useRef } from 'react';
import { dashboardAPI, activityLogsAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Label 
} from 'recharts';
import { 
  Users, MapPin, Wheat, FileText, Sprout, Baby, 
  ArrowUpRight, ArrowDownRight, Activity, Calendar, MoreVertical, 
  Download, RefreshCw, Clock, ShieldCheck, Terminal, ChevronRight
} from 'lucide-react';

// --- Configuration ---
const CHART_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

// --- Skeleton Component (Institutional Dark Theme) ---
const DashboardSkeleton = () => (
  <div className="space-y-8 p-8 bg-slate-50 dark:bg-[#020c0a] min-h-screen animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-gray-200 dark:bg-white/5 rounded-lg"></div>
        <div className="h-4 w-48 bg-gray-200 dark:bg-white/5 rounded-lg"></div>
      </div>
      <div className="h-10 w-32 bg-gray-200 dark:bg-white/5 rounded-full"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-white dark:bg-[#0b241f] rounded-2xl border border-gray-100 dark:border-white/5"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="col-span-1 h-[450px] bg-white dark:bg-[#0b241f] rounded-3xl border border-gray-100 dark:border-white/5"></div>
      <div className="col-span-2 h-[450px] bg-white dark:bg-[#0b241f] rounded-3xl border border-gray-100 dark:border-white/5"></div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-[#041d18]/95 backdrop-blur-md p-4 border border-white dark:border-white/10 shadow-2xl rounded-xl ring-1 ring-black/5">
        <p className="font-bold text-gray-800 dark:text-slate-100 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <p className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
            {payload[0].value.toLocaleString()} <span className="text-gray-400 dark:text-slate-500 font-normal ml-1 text-xs">Records</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState('online');

  // --- Theme Detection ---
  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // --- Data Orchestration ---
const loadDashboardData = async () => {
  try {
    // Fetch stats first (usually open to everyone)
    const statsRes = await dashboardAPI.getStats();
    setStats(statsRes.data);

    try {
      // Try to fetch logs separately
      const logsRes = await activityLogsAPI.getAll({ per_page: 5 });
      setRecentLogs(logsRes.data.logs);
    } catch (logError) {
      // If 403 Forbidden, just set empty logs and don't fail the whole dashboard
      console.warn("User lacks permission for Activity Logs");
      setRecentLogs([]); 
    }

    setSystemStatus('online');
  } catch (error) {
    console.error('Command Center Sync Error:', error);
    setSystemStatus('error');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadDashboardData();
    // Protocol: Auto-refresh data every 60 seconds
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    if (!stats) return;
    setIsExporting(true);
    const csvRows = [
      ["Institution", "AgriData Systems"],
      ["Report", "Dashboard Analysis Summary"],
      ["Timestamp", new Date().toLocaleString()],
      [""],
      ["METRIC", "VALUE", "PERCENTAGE"],
      ["Total Farmers", stats.total_farmers, "100%"],
      ["Active Barangays", stats.total_barangays, "-"],
      ["Registered Commodities", stats.total_products, "-"],
      ["Youth Engagement", stats.children_farming, `${((stats.children_farming / (stats.total_farmers || 1)) * 100).toFixed(1)}%`],
      [""]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(row => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `agridata_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { label: 'Total Farmers', value: stats?.total_farmers || 0, trend: '+3.2%', up: true, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Barangays', value: stats?.total_barangays || 0, trend: 'Stable', up: true, icon: MapPin, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    { label: 'Products', value: stats?.total_products || 0, trend: '+12%', up: true, icon: Wheat, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Research Projects', value: stats?.total_projects || 0, trend: '-2', up: false, icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Experiences', value: stats?.total_experiences || 0, trend: '+5', up: true, icon: Sprout, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Youth in Farming', value: stats?.children_farming || 0, trend: '+0.8%', up: true, icon: Baby, color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] p-4 md:p-8 font-sans transition-colors duration-300">
      
      {/* 1. TOP COMMAND BAR */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex items-start gap-5">
          <div className="p-3.5 bg-emerald-600 rounded-2xl text-white shadow-2xl shadow-emerald-600/30 shrink-0">
            <Activity size={28} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Command Center</h1>
               <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${systemStatus === 'online' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                 <span className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                 System {systemStatus}
               </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight">Real-time agricultural intelligence and demographic oversight.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#0b241f] p-2 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <button onClick={loadDashboardData} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 dark:text-slate-500 hover:text-emerald-600">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="w-px h-8 bg-slate-100 dark:bg-white/5 mx-1" />
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{isExporting ? 'Processing' : 'Generate Ledger'}</span>
          </button>
        </div>
      </header>

      {/* 2. CORE METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden bg-white dark:bg-[#0b241f] rounded-3xl p-7 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {stat.value.toLocaleString()}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${stat.up ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                    {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {stat.trend}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">vs Last Session</span>
                </div>
              </div>
              <div className={`p-5 rounded-2xl ${stat.bg} ${stat.color} shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon size={28} />
              </div>
            </div>
            <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${stat.bg} opacity-10 dark:opacity-5 group-hover:scale-150 transition-transform duration-1000`} />
          </div>
        ))}
      </div>

      {/* 3. PRIMARY ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Education Pie Chart */}
        <div className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 p-8 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">Academic Profile</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Farmer education mapping</p>
            </div>
            <div className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-slate-300">
              <MoreVertical size={20} />
            </div>
          </div>
          
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.education_stats || []}
                  innerRadius={90}
                  outerRadius={125}
                  paddingAngle={10}
                  dataKey="count"
                  nameKey="level"
                  stroke="none"
                >
                  {(stats?.education_stats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                  <Label 
                    value={stats?.total_farmers || 0} 
                    position="center" 
                    fill={isDarkMode ? "#ffffff" : "#0f172a"} 
                    style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.05em' }}
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  iconType="circle" 
                  formatter={(value) => <span className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barangay Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b241f] rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 p-8 h-[500px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">Territorial Density</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Farmer distribution by geography</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 tracking-widest">
              <Terminal size={14} className="mr-1"/> LIVE STREAMING
            </div>
          </div>
          
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.product_stats || []} margin={{ top: 0, right: 10, left: -25, bottom: 20 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "#f1f5f9"} />
                <XAxis 
                  dataKey="barangay" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                  dy={20} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <Tooltip cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', radius: 12 }} content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[10, 10, 10, 10]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. LOWER INTELLIGENCE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Activity Mini-Feed */}
        <div className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 rounded-xl text-white"><Terminal size={18} /></div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Audit Snapshot</h3>
             </div>
             <button onClick={() => navigate('/logs')} className="text-[10px] font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest flex items-center gap-1 group">
               Full Trail <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
          
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center gap-4 min-w-0">
                   <div className="h-10 w-10 rounded-xl bg-white dark:bg-[#041d18] border dark:border-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                      <Clock size={16} />
                   </div>
                   <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{log.action}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.user_name} • {new Date(log.created_at).toLocaleTimeString()}</p>
                   </div>
                </div>
                <div className="px-3 py-1 bg-white dark:bg-[#041d18] rounded-lg text-[9px] font-black text-slate-400 dark:text-slate-500 border dark:border-white/5">
                   #{log.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Product Reference */}
        <div className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl"><Wheat size={18} /></div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Commodities</h3>
             </div>
             <button onClick={() => navigate('/products')} className="text-[10px] font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest flex items-center gap-1 group">
               Registry <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {['Rice', 'Corn', 'Coconut', 'Coffee'].map((crop, i) => (
               <div key={i} className="p-6 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100/50 dark:border-emerald-500/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Prevalent</span>
                     <Sprout size={16} className="text-emerald-400" />
                  </div>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-200">{crop}</p>
                  <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${80 - (i*15)}%` }} />
                  </div>
               </div>
             ))}
          </div>
        </div>
        
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}