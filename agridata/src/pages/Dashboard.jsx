import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Users, MapPin, Wheat, FileText, Sprout, Baby, 
  ArrowUpRight, Activity, Calendar, MoreVertical 
} from 'lucide-react';

const CHART_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

// --- Skeleton Component ---
const DashboardSkeleton = () => (
  <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>
      <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm h-32 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-4 w-32 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-100 h-[400px]">
        <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="flex justify-center items-center h-full pb-12">
           <div className="h-48 w-48 rounded-full border-[16px] border-gray-100"></div>
        </div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 h-[400px]">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="flex items-end gap-4 h-full pb-12 px-4">
          {[40, 70, 45, 90, 65, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-emerald-600 font-medium text-sm">
          {payload[0].value.toLocaleString()} items
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      // Small delay to prevent "flicker" on fast connections
      setTimeout(() => setLoading(false), 500);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { label: 'Total Farmers', value: stats?.total_farmers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Barangays', value: stats?.total_barangays || 0, icon: MapPin, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Products', value: stats?.total_products || 0, icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Research Projects', value: stats?.total_projects || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Experiences', value: stats?.total_experiences || 0, icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Youth in Farming', value: stats?.children_farming || 0, icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen font-sans animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back. Here's what's happening across the region today.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-medium px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm">
             Last updated: {new Date().toLocaleDateString()}
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} transition-colors`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={12} /> +2.5%
              </span>
              <span className="text-gray-400 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Education Levels</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.education_stats || []}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="level"
                >
                  {(stats?.education_stats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Farmer Distribution by Barangay</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.product_stats || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="barangay" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}