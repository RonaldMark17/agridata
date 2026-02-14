import React, { useState, useEffect, useRef } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Label 
} from 'recharts';
import { 
  Users, MapPin, Wheat, FileText, Sprout, Baby, 
  ArrowUpRight, Activity, Calendar, MoreVertical, Download, RefreshCw
} from 'lucide-react';

// --- Configuration & Styles ---
const CHART_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

// --- Skeleton Component (Loading State) ---
const DashboardSkeleton = () => (
  <div className="space-y-8 p-8 bg-slate-50 min-h-screen animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
        <div className="h-4 w-48 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm"></div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 h-[400px] bg-white rounded-2xl border border-gray-100"></div>
      <div className="col-span-2 h-[400px] bg-white rounded-2xl border border-gray-100"></div>
    </div>
  </div>
);

// --- Enhanced Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 border border-white shadow-2xl rounded-xl ring-1 ring-black/5">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <p className="text-emerald-700 font-bold text-sm">
            {payload[0].value.toLocaleString()} <span className="text-gray-400 font-normal ml-1">Entries</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  // --- Export Functionality (CSV) ---
  const handleExport = () => {
    if (!stats) return;
    setIsExporting(true);

    // Prepare headers and data rows
    const csvRows = [
      ["Report Type", "Agricultural Systems Dashboard Summary"],
      ["Export Date", new Date().toLocaleString()],
      [""], // Empty row
      ["METRIC", "VALUE"],
      ["Total Farmers", stats.total_farmers],
      ["Total Barangays", stats.total_barangays],
      ["Total Products", stats.total_products],
      ["Research Projects", stats.total_projects],
      ["Total Experiences", stats.total_experiences],
      ["Youth in Farming", stats.children_farming],
      [""],
      ["EDUCATION LEVEL", "COUNT"],
      ...(stats.education_stats?.map(item => [item.level, item.count]) || []),
      [""],
      ["BARANGAY", "FARMER COUNT"],
      ...(stats.product_stats?.map(item => [item.barangay, item.count]) || [])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agri_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 500);
  };

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { label: 'Total Farmers', value: stats?.total_farmers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Barangays', value: stats?.total_barangays || 0, icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Products', value: stats?.total_products || 0, icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Research Projects', value: stats?.total_projects || 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Experiences', value: stats?.total_experiences || 0, icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Youth in Farming', value: stats?.children_farming || 0, icon: Baby, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans selection:bg-emerald-100">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-80 bg-gradient-to-b from-emerald-50/60 to-transparent -z-10" />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-600 rounded-md text-white">
              <Activity size={18} />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Management System</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium">Real-time mapping of agricultural distribution and demographics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStats}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download size={18} />
            <span>{isExporting ? 'Generating...' : 'Export Report'}</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {stat.value.toLocaleString()}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    <ArrowUpRight size={10} /> +2.4%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Growth</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
            </div>
            {/* Background Accent Circle */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} opacity-10 group-hover:scale-150 transition-transform duration-700`} />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Education Pie Chart */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-lg">Education Levels</h3>
            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-400">
              <MoreVertical size={20} />
            </div>
          </div>
          <div className="h-[320px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.education_stats || []}
                  innerRadius={85}
                  outerRadius={115}
                  paddingAngle={8}
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
                    fill="#1e293b" 
                    style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.05em' }}
                  />
                  <Label 
                    value="Total Tracked" 
                    position="center" 
                    dy={25}
                    fill="#94a3b8" 
                    style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-slate-500 font-bold text-xs uppercase tracking-tight">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barangay Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Distribution by Barangay</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Geographical reach of farmers</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE ANALYTICS
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.product_stats || []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="barangay" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 8 }} 
                  content={<CustomTooltip />} 
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 8, 8]} 
                  barSize={35} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


    </div>
  );
}