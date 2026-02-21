import React, { useState, useEffect } from 'react';
import { dashboardAPI, activityLogsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Label 
} from 'recharts';
import { 
  Users, MapPin, Wheat, FileText, Sprout, Baby, 
  ArrowUpRight, Activity, MoreVertical, Download, RefreshCw, 
  Clock, Terminal, ChevronRight, Plus, UserPlus, FilePlus, ArrowDownRight,
  Sun, Map as MapIcon, Database, Server, ShieldCheck, Thermometer,
  CloudSun, Cloud, CloudRain, CloudLightning, Loader2 // <-- Loader2 added here!
} from 'lucide-react';

// --- Configuration ---
const CHART_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

// --- Skeleton Component ---
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

// --- Custom Tooltip ---
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

// --- DYNAMIC WEATHER CONFIGURATION ---
const getWeatherConfig = (code) => {
  // Clear / Sunny
  if (code === 0) return { icon: Sun, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' };
  // Partly Cloudy
  if (code === 1 || code === 2) return { icon: CloudSun, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20' };
  // Overcast / Fog
  if (code === 3 || code === 45 || code === 48) return { icon: Cloud, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', border: 'border-slate-200 dark:border-white/10' };
  // Drizzle / Rain
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: CloudRain, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' };
  // Thunderstorm
  if (code >= 95 && code <= 99) return { icon: CloudLightning, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' };
  
  // Default Fallback
  return { icon: Sun, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState('online');
  
  // FUNCTIONAL STATE
  const [timeRange, setTimeRange] = useState('all'); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickActions, setShowQuickActions] = useState(false);

  // REAL-TIME WEATHER STATE
  const [weather, setWeather] = useState({ temp: null, code: 0, loading: true });

  // --- Theme Detection ---
  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // --- Live Clock ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Live Weather Fetching (San Pablo City) ---
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Open-Meteo Free API (No key required) - Coordinates set to San Pablo City
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=14.0673&longitude=121.3242&current_weather=true');
        const data = await res.json();
        
        if (data && data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
            loading: false
          });
        }
      } catch (error) {
        console.error("Failed to fetch live weather:", error);
        setWeather({ temp: null, code: 0, loading: false });
      }
    };
    
    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Data Orchestration ---
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats with time range parameter
      const statsRes = await dashboardAPI.getStats({ range: timeRange });
      setStats(statsRes.data);

      try {
        const logsRes = await activityLogsAPI.getAll({ per_page: 5 });
        setRecentLogs(logsRes.data.logs);
      } catch (logError) {
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

  // Re-fetch when timeRange changes
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const handleBarClick = (data) => {
    // Navigate to filtered view on chart click
    if (data && data.barangay) {
      navigate(`/farmers?search=${data.barangay}`);
    }
  };

  const handleExport = () => {
    if (!stats) return;
    setIsExporting(true);
    const csvRows = [
      ["Institution", "AgriData Systems"],
      ["Report", "Dashboard Analysis Summary"],
      ["Time Range", timeRange.toUpperCase()],
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
    { label: 'Total Farmers', value: stats?.total_farmers || 0, trend: timeRange === 'month' ? '+Last 30d' : 'Total', up: true, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Barangays', value: stats?.total_barangays || 0, trend: 'Active', up: true, icon: MapPin, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    { label: 'Products', value: stats?.total_products || 0, trend: 'Registered', up: true, icon: Wheat, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Research Projects', value: stats?.total_projects || 0, trend: 'Ongoing', up: true, icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Experiences', value: stats?.total_experiences || 0, trend: 'Captured', up: true, icon: Sprout, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Youth in Farming', value: stats?.children_farming || 0, trend: 'Succession', up: true, icon: Baby, color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
  ];

  // Dynamic Greeting Logic
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  
  // Weather Config Resolution
  const wConfig = getWeatherConfig(weather.code);
  const WeatherIcon = wConfig.icon;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] p-4 md:p-8 font-sans transition-colors duration-300 pb-24 relative">
      
      {/* 1. TOP COMMAND BAR */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex items-start gap-5">
          <div className="p-3.5 bg-emerald-600 rounded-2xl text-white shadow-2xl shadow-emerald-600/30 shrink-0">
            <Activity size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">{greeting}, User</p>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Command Center</h1>
               <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${systemStatus === 'online' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                 <span className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                 {systemStatus.toUpperCase()}
               </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight">
                <span>{currentTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              
              {/* DYNAMIC Weather Context Widget */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border transition-colors duration-500 ${wConfig.color} ${wConfig.bg} ${wConfig.border}`}>
                {weather.loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <WeatherIcon size={14} />
                    <span>{weather.temp !== null ? `${weather.temp}°C San Pablo` : 'Weather N/A'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#0b241f] p-2 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          {/* FUNCTIONAL TIME FILTER */}
          <div className="flex bg-slate-50 dark:bg-white/5 rounded-xl p-1">
            {['all', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === range ? 'bg-white dark:bg-[#041d18] text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-slate-100 dark:bg-white/5 mx-1" />
          
          <button onClick={loadDashboardData} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 dark:text-slate-500 hover:text-emerald-600">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden sm:inline">{isExporting ? 'Processing' : 'Generate Ledger'}</span>
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
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Click bars to filter list</p>
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
                <Bar 
                  dataKey="count" 
                  fill="url(#barGrad)" 
                  radius={[10, 10, 10, 10]} 
                  barSize={40}
                  onClick={handleBarClick} // INTERACTIVE CHART
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. LOWER INTELLIGENCE SECTION (UPDATED TO 3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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
            {recentLogs.length > 0 ? recentLogs.map((log) => (
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
            )) : (
              <div className="text-center py-10 text-slate-400 text-sm">No recent activity detected.</div>
            )}
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
               <div key={i} className="p-6 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100/50 dark:border-emerald-500/10 flex flex-col gap-3 hover:scale-105 transition-transform duration-300">
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

        {/* NEW: System Analytics & Diagnostics */}
        <div className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl"><Server size={18} /></div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">System Health</h3>
             </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Main Database</span>
              </div>
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1"><ShieldCheck size={14}/> Secured</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">API Latency</span>
              </div>
              <span className="text-xs font-black text-blue-600">24ms (Optimal)</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Thermometer size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Server Load</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/4"></div>
                </div>
                <span className="text-xs font-black text-slate-500">18%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Backup</span>
              <span className="text-xs font-black text-slate-600 dark:text-slate-300">Today, 03:00 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS FAB */}
      <div className="fixed bottom-8 right-8 z-30 flex flex-col gap-3 items-end">
        {showQuickActions && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4">
            
            {/* Map Quick Link */}
            <button onClick={() => navigate('/map')} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0b241f] rounded-2xl shadow-xl hover:bg-slate-50 dark:hover:bg-[#13332d] transition-all group">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">Live Map</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-xl group-hover:scale-110 transition-transform"><MapIcon size={18}/></div>
            </button>

            <button onClick={() => navigate('/farmers')} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0b241f] rounded-2xl shadow-xl hover:bg-slate-50 dark:hover:bg-[#13332d] transition-all group">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">Add Farmer</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><UserPlus size={18}/></div>
            </button>
            <button onClick={() => navigate('/surveys')} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0b241f] rounded-2xl shadow-xl hover:bg-slate-50 dark:hover:bg-[#13332d] transition-all group">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors">New Survey</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><FilePlus size={18}/></div>
            </button>
          </div>
        )}
        <button 
          onClick={() => setShowQuickActions(!showQuickActions)} 
          className="p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-2xl shadow-emerald-600/50 hover:bg-emerald-500 transition-all hover:scale-110 active:scale-95"
        >
          {showQuickActions ? <ArrowDownRight size={24} /> : <Plus size={24} />}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}