import React, { useState, useEffect } from 'react';
import { activityLogsAPI } from '../services/api';
import { 
  History, PlusCircle, Edit3, Trash2, Key, 
  FileText, User, Hash, Clock, Filter, 
  ChevronLeft, ChevronRight, Activity, Terminal, ShieldAlert, Loader2,
  Search, Download, RotateCcw, Maximize2, X, Globe, UserCircle, CalendarRange
} from 'lucide-react';

// --- Skeleton Component (Dark Mode Compatible) ---
const LogSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="relative pl-12 pb-10">
        <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-slate-100 dark:bg-white/5" />
        <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 z-10" />
        <div className="bg-white dark:bg-[#0b241f] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
          <div className="flex justify-between">
            <div className="h-5 w-40 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
            <div className="h-5 w-24 bg-slate-50 dark:bg-white/5 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 bg-slate-50 dark:bg-white/5 rounded-xl"></div>
            <div className="h-12 bg-slate-50 dark:bg-white/5 rounded-xl"></div>
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
  const [isExporting, setIsExporting] = useState(false);
  
  // Selection/Detail State
  const [selectedLog, setSelectedLog] = useState(null);

  // Filter States
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, week

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

  // --- Core Filtering Logic ---
  const filteredLogs = logs.filter(log => {
    const actionMatch = !filterAction || log.action.includes(filterAction);
    const entityMatch = !filterEntity || log.entity_type === filterEntity;
    const searchMatch = !searchTerm || 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date Logic
    if (dateFilter === 'all') return actionMatch && entityMatch && searchMatch;
    
    const logDate = new Date(log.created_at);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dateFilter === 'today') {
      return actionMatch && entityMatch && searchMatch && logDate >= today;
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return actionMatch && entityMatch && searchMatch && logDate >= weekAgo;
    }
    
    return actionMatch && entityMatch && searchMatch;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type).filter(Boolean))];

  const handleExport = () => {
    setIsExporting(true);
    const headers = ["Timestamp", "Operator", "Action", "Entity", "ID", "IP Address", "Details"];
    const rows = filteredLogs.map(l => [
      l.created_at,
      l.user_name || "System",
      l.action,
      l.entity_type || "N/A",
      l.entity_id || "N/A",
      l.ip_address || "Internal",
      `"${l.details?.replace(/"/g, '""') || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  const resetFilters = () => {
    setFilterAction('');
    setFilterEntity('');
    setSearchTerm('');
    setDateFilter('all');
  };

  const getLogConfig = (action) => {
    if (action.includes('CREATED')) return { icon: PlusCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20', glow: 'shadow-emerald-200 dark:shadow-none' };
    if (action.includes('UPDATED')) return { icon: Edit3, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20', glow: 'shadow-blue-200 dark:shadow-none' };
    if (action.includes('DELETED')) return { icon: Trash2, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20', glow: 'shadow-rose-200 dark:shadow-none' };
    if (action.includes('LOGIN')) return { icon: Key, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20', glow: 'shadow-amber-200 dark:shadow-none' };
    return { icon: FileText, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5', border: 'border-slate-100 dark:border-white/10', glow: 'shadow-slate-100 dark:shadow-none' };
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020c0a] font-sans selection:bg-emerald-100 pb-20 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 py-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                <History size={20} />
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">System Monitoring</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Audit Trail</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Comprehensive chronological ledger of system-wide operations.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
            >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>{isExporting ? 'Generating' : 'Generate Ledger'}</span>
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 tracking-widest uppercase transition-colors">
              <Activity size={14} className="animate-pulse" /> Live Data Stream
            </div>
          </div>
        </header>

        {/* Summary Metric Modules - Now Interactive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {[
            { label: 'Total Events', key: '', val: logs.length, icon: Terminal, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-white/5' },
            { label: 'Data Entries', key: 'CREATED', val: logs.filter(l => l.action.includes('CREATED')).length, icon: PlusCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Modifications', key: 'UPDATED', val: logs.filter(l => l.action.includes('UPDATED')).length, icon: Edit3, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Security Logs', key: 'LOGIN', val: logs.filter(l => l.action.includes('LOGIN')).length, icon: ShieldAlert, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          ].map((stat, i) => (
            <button 
              key={i} 
              onClick={() => setFilterAction(stat.key)}
              className={`group text-left p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-36
                ${filterAction === stat.key && stat.key !== '' ? 'bg-slate-900 border-slate-900 dark:bg-emerald-600 dark:border-emerald-600 ring-4 ring-emerald-500/10' : 'bg-white dark:bg-[#0b241f] border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl'}`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className={`p-3 rounded-2xl ${filterAction === stat.key && stat.key !== '' ? 'bg-white/10 text-white' : `${stat.bg} ${stat.color}`} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <span className={`text-3xl font-black tracking-tighter ${filterAction === stat.key && stat.key !== '' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{stat.val}</span>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${filterAction === stat.key && stat.key !== '' ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>{stat.label}</p>
              <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${stat.bg} opacity-10 dark:opacity-5 group-hover:scale-150 transition-transform duration-700`} />
            </button>
          ))}
        </div>

        {/* Unified Control Deck (Advanced Filters) */}
        <div className="px-4">
          <div className="bg-white dark:bg-[#0b241f] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm p-4 space-y-4">
            <div className="flex flex-col xl:flex-row items-center gap-4">
              
              {/* Search Engine */}
              <div className="relative flex-[1.5] w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input 
                  type="text"
                  placeholder="Search by operator or detail..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full xl:flex-1">
                <div className="relative flex-1">
                  <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <select
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 appearance-none focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none cursor-pointer"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                  >
                    <option value="" className="dark:bg-[#0b241f]">Operation: All</option>
                    {uniqueActions.map(action => <option key={action} value={action} className="dark:bg-[#0b241f]">{action}</option>)}
                  </select>
                </div>
                
                <div className="relative flex-1">
                  <CalendarRange className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <select
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 appearance-none focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none cursor-pointer"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all" className="dark:bg-[#0b241f]">Time: All History</option>
                    <option value="today" className="dark:bg-[#0b241f]">Today Only</option>
                    <option value="week" className="dark:bg-[#0b241f]">Last 7 Days</option>
                  </select>
                </div>

                <button 
                  onClick={resetFilters}
                  className="p-4 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-2xl transition-all"
                  title="Reset Search"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chronological Timeline Feed */}
        <div className="relative px-4 pb-12">
          {loading ? (
            <LogSkeleton />
          ) : filteredLogs.length === 0 ? (
            <div className="py-32 bg-white dark:bg-[#0b241f] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/10 text-center transition-colors">
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-full inline-flex text-slate-200 dark:text-slate-700 mb-8">
                <History size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Events Recorded</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium mt-3">The data stream for your current filters is empty.</p>
              <button onClick={resetFilters} className="mt-6 text-emerald-600 font-bold text-sm hover:underline">Clear all active filters</button>
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
                      <div className="absolute left-[23px] md:left-[31px] top-12 bottom-0 w-0.5 bg-slate-100 dark:bg-white/5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors duration-500" />
                    )}
                    
                    {/* Event Connector Icon */}
                    <div className={`absolute left-0 md:left-2 top-0 w-12 h-12 rounded-[1.25rem] border-4 border-white dark:border-[#020c0a] shadow-xl flex items-center justify-center z-10 ${config.bg} ${config.color} transition-all duration-500 group-hover:scale-110 group-hover:${config.glow}`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    
                    {/* Log Card Entry */}
                    <div 
                      onClick={() => setSelectedLog(log)}
                      className="bg-white dark:bg-[#0b241f] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-500 ml-4 relative overflow-hidden cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-inner ${config.bg} ${config.color} ${config.border}`}>
                            {log.action}
                          </span>
                          {log.entity_type && (
                            <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-slate-900 dark:bg-emerald-600 text-white shadow-lg">
                              {log.entity_type}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-full w-fit group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <Clock size={14} />
                          {formatDate(log.created_at)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-[1rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-600 font-black text-lg group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-[#041d18] transition-all shadow-inner">
                            {log.user_name ? log.user_name.charAt(0) : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Authenticated Operator</p>
                            <p className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">{log.user_name || 'Automated System'}</p>
                          </div>
                        </div>
                        
                        {log.entity_id && (
                          <div className="flex items-center gap-5 sm:border-l sm:pl-10 border-slate-50 dark:border-white/5">
                            <div className="w-12 h-12 rounded-[1rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-600 shrink-0 shadow-inner group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all">
                              <Hash size={20} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Entity Reference</p>
                              <p className="text-lg font-mono font-black text-slate-700 dark:text-slate-300 truncate tracking-tight">#{log.entity_id}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {log.details && (
                        <div className="mt-10 p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-[1.5rem] border border-slate-100 dark:border-white/5 relative z-10 transition-colors">
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-l-4 border-emerald-500/20 pl-6 line-clamp-2">
                            "{log.details}"
                          </p>
                          <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors">
                              <Maximize2 size={16}/>
                          </div>
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
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-[#0b241f] px-10 py-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm mx-4 transition-colors">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Archive Stream <span className="text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex gap-4 mt-6 sm:mt-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-4 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-4 bg-white dark:bg-[#041d18] border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* LOG DETAIL MODAL (New Feature) */}
        {selectedLog && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedLog(null)} />
                <div className="relative bg-white dark:bg-[#0b241f] w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-white/10">
                    
                    <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${getLogConfig(selectedLog.action).bg} ${getLogConfig(selectedLog.action).color}`}>
                                <Terminal size={24}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Event Dossier</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction ID: #{selectedLog.id}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedLog(null)} className="p-3 bg-white dark:bg-white/10 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
                    </div>

                    <div className="p-10 space-y-8 overflow-y-auto no-scrollbar max-h-[60vh]">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Transaction Narrative</p>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">"{selectedLog.details || "No narrative provided."}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                             <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl space-y-2">
                                <UserCircle size={18} className="text-slate-400"/>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</p>
                                <p className="font-bold text-slate-800 dark:text-white">{selectedLog.user_name || "System"}</p>
                             </div>
                             <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl space-y-2">
                                <Globe size={18} className="text-slate-400"/>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source IP</p>
                                <p className="font-mono text-sm font-bold text-slate-800 dark:text-white">{selectedLog.ip_address || "127.0.0.1"}</p>
                             </div>
                             <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl space-y-2">
                                <Activity size={18} className="text-slate-400"/>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</p>
                                <p className="font-bold text-slate-800 dark:text-white">{selectedLog.action}</p>
                             </div>
                             <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl space-y-2">
                                <MapPin size={18} className="text-slate-400"/>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Entity</p>
                                <p className="font-bold text-slate-800 dark:text-white">{selectedLog.entity_type} / #{selectedLog.entity_id}</p>
                             </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
                            <Clock size={16} className="text-slate-300"/>
                            <p className="text-xs font-bold text-slate-400">Timestamp: {new Date(selectedLog.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}