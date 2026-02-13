
import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Search, 
  Filter, 
  Eye, 
  Sparkles, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  Calendar, 
  MapPin, 
  Briefcase, 
  TrendingUp,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getProjectSummaryAI } from '../services/geminiService';

interface ProjectListProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

type SortConfig = {
  key: keyof Project | 'effectiveBudget';
  direction: 'asc' | 'desc';
} | null;

const ITEMS_PER_PAGE = 12;

const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsight, setAiInsight] = useState<{id: string, text: string} | null>(null);
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'projectCode', direction: 'asc' });
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof Project | 'effectiveBudget') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setIsSortOpen(false);
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'effectiveBudget') {
          aValue = a.budgetActual || a.budgetEstimated;
          bValue = b.budgetActual || b.budgetEstimated;
        } else {
          aValue = a[sortConfig.key as keyof Project];
          bValue = b[sortConfig.key as keyof Project];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [projects, searchTerm, sortConfig]);

  // Reset pagination when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredAndSortedProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProjects, currentPage]);

  const getStatusStyles = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ProjectStatus.DELAYED: return 'bg-rose-100 text-rose-700 border-rose-200';
      case ProjectStatus.PLANNING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ProjectStatus.NOT_STARTED: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAiAnalysis = async (project: Project) => {
    setLoadingAiId(project.id);
    const summary = await getProjectSummaryAI(project);
    setAiInsight({ id: project.id, text: summary });
    setLoadingAiId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Sort Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาโครงการโดยชื่อหรือรหัส..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 hover:bg-slate-50 transition-colors text-sm shadow-sm"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-slate-400" />
                <span>เรียงตาม: {sortConfig?.key === 'effectiveBudget' ? 'งบประมาณ' : 'รหัสโครงการ'}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                <button onClick={() => handleSort('projectCode')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">รหัสโครงการ</button>
                <button onClick={() => handleSort('effectiveBudget')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">งบประมาณ</button>
                <button onClick={() => handleSort('progressPercent')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">ความคืบหน้า</button>
                <button onClick={() => handleSort('fiscalYear')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">ปีงบประมาณ</button>
              </div>
            )}
          </div>

          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProjects.map((project) => (
          <div key={project.id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col">
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                  {project.projectCode}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyles(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Briefcase size={14} />
                  <span>{project.category}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <MapPin size={14} />
                  <span>{project.area}</span>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="px-6 py-4 bg-slate-50/50 border-y border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <TrendingUp size={14} className="text-blue-500" />
                  <span>ความคืบหน้า</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{project.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${project.progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Financial & Metadata */}
            <div className="p-6 pt-4 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">งบประมาณ</p>
                  <p className="text-sm font-bold text-slate-900">
                    ฿{(project.budgetActual || project.budgetEstimated).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ปีงบประมาณ</p>
                  <p className="text-sm font-bold text-slate-900">{project.fiscalYear}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleAiAnalysis(project)}
                    className={`p-2 rounded-xl transition-all ${loadingAiId === project.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                    disabled={loadingAiId === project.id}
                  >
                    <Sparkles size={20} className={loadingAiId === project.id ? 'animate-pulse' : ''} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Eye size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onEdit?.(project)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Pencil size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?')) {
                        onDelete?.(project.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Insight Overlay/Drawer inside card area */}
            {aiInsight?.id === project.id && (
              <div className="p-5 bg-indigo-50 border-t border-indigo-100 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900 uppercase">AI Strategy Insight</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed italic">"{aiInsight.text}"</p>
                <button 
                  onClick={() => setAiInsight(null)}
                  className="text-[10px] text-indigo-400 font-bold hover:text-indigo-600 mt-3 flex items-center gap-1"
                >
                  <XIcon size={12} /> ปิดความเห็น AI
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 font-medium">
            แสดง {Math.min(filteredAndSortedProjects.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} ถึง {Math.min(filteredAndSortedProjects.length, currentPage * ITEMS_PER_PAGE)} จากทั้งหมด {filteredAndSortedProjects.length} โครงการ
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Logic to show limited page numbers if there are too many
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  (page === 2 && currentPage > 3) || 
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={page} className="px-1 text-slate-400">...</span>;
                }
                return null;
              })}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {filteredAndSortedProjects.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">ไม่พบโครงการที่คุณต้องการ</h3>
          <p className="text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
        </div>
      )}
    </div>
  );
};

// Simple X icon replacement since it wasn't imported from lucide-react in current scope
const XIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default ProjectList;
