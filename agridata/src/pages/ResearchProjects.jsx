import React, { useState, useEffect } from 'react';
import { projectsAPI, organizationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, X, Search, Calendar, Landmark, User, 
  DollarSign, ClipboardList, Beaker, Briefcase,
  ChevronLeft, ChevronRight, Info, FileText
} from 'lucide-react';

// --- Skeleton Component for Projects ---
const ProjectSkeleton = () => (
  <div className="grid grid-cols-1 gap-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-5 w-48 md:w-64 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
            </div>
          </div>
          <div className="h-6 w-24 bg-gray-100 rounded-full self-start"></div>
        </div>
        <div className="h-3 w-full bg-gray-50 rounded mb-2"></div>
        <div className="h-3 w-4/5 bg-gray-50 rounded mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-50">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-10 bg-gray-50 rounded-lg"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function ResearchProjects() {
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    project_code: '', title: '', description: '', organization_id: '',
    start_date: '', end_date: '', status: 'Planning', research_type: 'Mixed Methods',
    objectives: '', methodology: '', budget: '', funding_source: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchOrganizations();
  }, [currentPage]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectsAPI.getAll({ page: currentPage });
      setProjects(response.data.projects);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizationsAPI.getAll();
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(formData);
      setShowModal(false);
      fetchProjects();
      setFormData({
        project_code: '', title: '', description: '', organization_id: '',
        start_date: '', end_date: '', status: 'Planning', research_type: 'Mixed Methods',
        objectives: '', methodology: '', budget: '', funding_source: ''
      });
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const canCreate = hasPermission(['admin', 'researcher']);

  // Helper for Status Styles
  const getStatusStyle = (status) => {
    const styles = {
      'Planning': 'bg-blue-50 text-blue-700 border-blue-100',
      'Active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Completed': 'bg-gray-50 text-gray-700 border-gray-100',
      'On Hold': 'bg-amber-50 text-amber-700 border-amber-100',
      'Cancelled': 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return styles[status] || styles['Planning'];
  };

  // Fixed Icon Selector Logic
  const getIcon = (type) => {
    const iconProps = { className: "w-5 h-5" };
    switch(type) {
      case 'Qualitative': return <ClipboardList {...iconProps} className="text-indigo-500" />;
      case 'Quantitative': return <Beaker {...iconProps} className="text-emerald-500" />;
      case 'Mixed Methods': return <Briefcase {...iconProps} className="text-amber-500" />;
      default: return <FileText {...iconProps} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Research Initiatives</h1>
          <p className="text-gray-500 mt-1 italic font-medium text-sm md:text-base">Scientific monitoring of agricultural progression.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> New Project
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {loading ? (
          <ProjectSkeleton />
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 md:p-20 text-center">
            <Search className="mx-auto text-gray-300 w-12 h-12 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No projects found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Try adding your first initiative to populate the dashboard.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Project Title Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all shrink-0">
                      {getIcon(project.research_type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight truncate">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                          {project.project_code || 'CODELESS'}
                        </span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs text-gray-500 font-medium">{project.research_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`self-start inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(project.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                    {project.status}
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-4xl line-clamp-3 md:line-clamp-2 italic">
                  {project.description || 'No project description available.'}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0"><User size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Investigator</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{project.principal_investigator_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0"><Landmark size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Organization</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">{project.organization_name || 'System'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><Calendar size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Timeframe</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {project.start_date ? new Date(project.start_date).getFullYear() : '--'} - {project.end_date ? new Date(project.end_date).getFullYear() : '--'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0"><DollarSign size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Budget</p>
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {project.budget ? `₱${Number(project.budget).toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Container */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1 font-medium">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none p-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none p-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Responsive Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-white rounded-t-[32px] sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform transition-all">
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Initiate Project</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 scrollbar-hide">
              {/* Primary Group */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Project Identity
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Project Code</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium" value={formData.project_code} onChange={(e) => setFormData({ ...formData, project_code: e.target.value })} placeholder="AGRI-2026-X" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Affiliated Organization</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium appearance-none" value={formData.organization_id} onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}>
                      <option value="">Select Org...</option>
                      {organizations.map((org) => (<option key={org.id} value={org.id}>{org.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">Scientific Title</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter the full project title..." />
                </div>
              </div>

              {/* Attributes Group */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Research Specs
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Methodology</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm" value={formData.research_type} onChange={(e) => setFormData({ ...formData, research_type: e.target.value })}>
                      <option value="Qualitative">Qualitative</option>
                      <option value="Quantitative">Quantitative</option>
                      <option value="Mixed Methods">Mixed Methods</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Start Date</label>
                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">End Date</label>
                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Text Areas */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">Research Objectives</label>
                  <textarea className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm min-h-[120px]" value={formData.objectives} onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} placeholder="What are the key goals?" />
                </div>
              </div>
            </form>

            {/* Footer Buttons */}
            <div className="px-6 md:px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-gray-500">Discard</button>
              <button onClick={handleSubmit} className="w-full sm:w-auto px-10 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-100 uppercase tracking-widest active:scale-95 transition-all">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}