import React, { useState, useEffect } from 'react';
import { activityLogsAPI } from '../services/api';
import { 
  History, PlusCircle, Edit3, Trash2, Key, 
  FileText, User, Hash, Clock, Filter, 
  ChevronLeft, ChevronRight, Activity, Terminal, ShieldAlert
} from 'lucide-react';

// --- Skeleton Component ---
const LogSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="relative pl-12 pb-10">
        <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-slate-100" />
        <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-slate-100 z-10" />
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
          <div className="flex justify-between">
            <div className="h-5 w-40 bg-slate-100 rounded-lg"></div>
            <div className="h-5 w-24 bg-slate-50 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 bg-slate-50 rounded-xl"></div>
            <div className="h-12 bg-slate-50 rounded-xl"></div>
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
      setTimeout(() => setLoading(false), 800);
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
    if (action.includes('CREATED')) return { icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', glow: 'shadow-emerald-200' };
    if (action.includes('UPDATED')) return { icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', glow: 'shadow-blue-200' };
    if (action.includes('DELETED')) return { icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', glow: 'shadow-rose-200' };
    if (action.includes('LOGIN')) return { icon: Key, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', glow: 'shadow-amber-200' };
    return { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', glow: 'shadow-slate-100' };
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
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-emerald-100 pb-20">
      <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200">
                <History size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">System Monitoring</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Audit Trail</h1>
            <p className="text-slate-500 font-medium mt-2">Comprehensive chronological ledger of system-wide operations.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 tracking-widest uppercase">
            <Activity size={14} className="animate-pulse" /> Live Data Stream
          </div>
        </header>

        {/* Summary Metric Modules */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {[
            { label: 'Total Events', val: logs.length, icon: Terminal, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Data Entries', val: logs.filter(l => l.action.includes('CREATED')).length, icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Modifications', val: logs.filter(l => l.action.includes('UPDATED')).length, icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Security Logs', val: logs.filter(l => l.action.includes('LOGIN')).length, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <div key={i} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</span>
              </div>
              <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
              <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${stat.bg} opacity-10 group-hover:scale-150 transition-transform duration-700`} />
            </div>
          ))}
        </div>

        {/* Unified Control Deck (Filters) */}
        <div className="px-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-3 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="">All Operation Types</option>
                {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
              </select>
            </div>
            <div className="relative flex-1 w-full">
              <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
              >
                <option value="">All Data Entities</option>
                {uniqueEntities.map(entity => <option key={entity} value={entity}>{entity}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Chronological Timeline Feed */}
        <div className="relative px-4 pb-12">
          {loading ? (
            <LogSkeleton />
          ) : filteredLogs.length === 0 ? (
            <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
              <div className="p-8 bg-slate-50 rounded-full inline-flex text-slate-200 mb-8">
                <History size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Events Recorded</h3>
              <p className="text-slate-400 font-medium mt-3">The data stream for your current filters is empty.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredLogs.map((log, index) => {
                const config = getLogConfig(log.action);
                const Icon = config.icon;
                return (
                  <div key={log.id} className="relative pl-12 md:pl-16 pb-12 group">
                    {/* Vertical Progression Line */}
                    {index !== filteredLogs.length - 1 && (
                      <div className="absolute left-[23px] md:left-[31px] top-12 bottom-0 w-0.5 bg-slate-100 group-hover:bg-emerald-100 transition-colors duration-500" />
                    )}
                    
                    {/* Event Connector Icon */}
                    <div className={`absolute left-0 md:left-2 top-0 w-12 h-12 rounded-[1.25rem] border-4 border-white shadow-xl flex items-center justify-center z-10 ${config.bg} ${config.color} transition-all duration-500 group-hover:scale-110 group-hover:${config.glow}`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    
                    {/* Log Card Entry */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ml-4 relative overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-inner ${config.bg} ${config.color} ${config.border}`}>
                            {log.action}
                          </span>
                          {log.entity_type && (
                            <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-slate-900 text-white shadow-lg">
                              {log.entity_type}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full w-fit group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <Clock size={14} />
                          {formatDate(log.created_at)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-[1rem] bg-slate-50 flex items-center justify-center text-slate-400 font-black text-lg group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                            {log.user_name ? log.user_name.charAt(0) : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Operator</p>
                            <p className="text-lg font-black text-slate-900 truncate">{log.user_name || 'Automated System'}</p>
                          </div>
                        </div>
                        
                        {log.entity_id && (
                          <div className="flex items-center gap-5 sm:border-l sm:pl-10 border-slate-50">
                            <div className="w-12 h-12 rounded-[1rem] bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                              <Hash size={20} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Reference</p>
                              <p className="text-lg font-mono font-black text-slate-700 truncate tracking-tight">#{log.entity_id}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {log.details && (
                        <div className="mt-10 p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 relative z-10">
                          <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-l-4 border-emerald-500/20 pl-6">
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

        {/* Global Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-10 py-6 rounded-[2.5rem] border border-slate-100 shadow-sm mx-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Archive Stream <span className="text-slate-900">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex gap-4 mt-6 sm:mt-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}