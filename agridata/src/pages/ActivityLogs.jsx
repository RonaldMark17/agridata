import React, { useState, useEffect } from 'react';
import { activityLogsAPI } from '../services/api';
import { 
  History, PlusCircle, Edit3, Trash2, Key, 
  FileText, User, Hash, Clock, Filter, 
  ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

// --- Skeleton Component for Activity Logs ---
const LogSkeleton = () => (
  <div className="space-y-1 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="relative pl-8 pb-8">
        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100" />
        <div className="absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white bg-gray-200 z-10" />
        <div className="bg-white border border-gray-100 rounded-2xl p-5 ml-4 space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-100 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-gray-50 rounded-lg"></div>
            <div className="h-8 bg-gray-50 rounded-lg"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogsAPI.getAll({ page: currentPage, per_page: 50 });
      setLogs(response.data.logs);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = !filterAction || log.action.includes(filterAction);
    const matchesEntity = !filterEntity || log.entity_type === filterEntity;
    return matchesAction && matchesEntity;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type).filter(Boolean))];

  const getLogConfig = (action) => {
    if (action.includes('CREATED')) return { icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (action.includes('UPDATED')) return { icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    if (action.includes('DELETED')) return { icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
    if (action.includes('LOGIN')) return { icon: Key, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <History className="text-emerald-600" size={28} />
            Audit Trail
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">System-wide user activity history.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Events', val: logs.length, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Entries', val: logs.filter(l => l.action.includes('CREATED')).length, icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Updates', val: logs.filter(l => l.action.includes('UPDATED')).length, icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Security', val: logs.filter(l => l.action.includes('LOGIN')).length, icon: Key, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:block">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className={`p-2 md:p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-lg md:text-2xl font-black text-gray-900">{stat.val}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
          </select>
        </div>
        <div className="flex-1 relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
          >
            <option value="">All Entities</option>
            {uniqueEntities.map(entity => <option key={entity} value={entity}>{entity}</option>)}
          </select>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="relative">
        {loading ? (
          <LogSkeleton />
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 px-4">
            <p className="text-gray-500 font-medium">No activity records match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => {
              const config = getLogConfig(log.action);
              const Icon = config.icon;
              return (
                <div key={log.id} className="relative pl-6 md:pl-8 pb-8 group">
                  {index !== filteredLogs.length - 1 && (
                    <div className="absolute left-[15px] md:left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 group-hover:bg-emerald-100 transition-colors" />
                  )}
                  
                  <div className={`absolute left-0 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${config.bg} ${config.color} transition-transform group-hover:scale-110`}>
                    <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                  </div>
                  
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all ml-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}>
                          {log.action}
                        </span>
                        {log.entity_type && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {log.entity_type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full w-fit">
                        <Clock size={12} />
                        {formatDate(log.created_at)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0 uppercase">
                          {log.user_name ? log.user_name.charAt(0) : '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operator</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{log.user_name || 'System'}</p>
                        </div>
                      </div>
                      
                      {log.entity_id && (
                        <div className="flex items-center gap-3 sm:border-l sm:pl-6 border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <Hash size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref ID</p>
                            <p className="text-sm font-mono font-medium text-gray-600 truncate">#{log.entity_id}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {log.details && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 leading-relaxed italic">
                          "{log.details}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1">Page <span className="font-bold text-gray-900">{currentPage}</span> of {totalPages}</p>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none p-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none p-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}