
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, ProjectCategory } from '../types';
import { 
  Search, 
  Eye, 
  Sparkles, 
  Pencil, 
  MapPin, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  QrCode,
  Clock,
  Users,
  AlertCircle,
  Construction,
  Filter,
  Calendar,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { getProjectSummaryAI } from '../services/geminiService';

interface ProjectListProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

const ITEMS_PER_PAGE = 8;

const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Advanced Filtering State
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<{ id: string, text: string } | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(p.status);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      
      // Date Range Filter (against contract end date)
      let matchesDate = true;
      if (dateStart || dateEnd) {
        const pDate = new Date(p.contractDateEnd);
        if (dateStart && pDate < new Date(dateStart)) matchesDate = false;
        if (dateEnd && pDate > new Date(dateEnd)) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [projects, searchTerm, selectedStatuses, selectedCategories, dateStart, dateEnd]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const handleAiAnalysis = async (project: Project) => {
    setLoadingAiId(project.id);
    const summary = await getProjectSummaryAI(project);
    setAiInsight({ id: project.id, text: summary });
    setLoadingAiId(null);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setDateStart('');
    setDateEnd('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-emerald-500';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-500';
      case ProjectStatus.DELAYED: return 'bg-rose-500';
      case ProjectStatus.PLANNING: return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#002d62] tracking-tighter uppercase">Construction Registry</h2>
          <p className="text-slate-500 font-medium">ทะเบียนโครงการและตรวจติดตามงานก่อสร้างรายพื้นที่</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
            <FileSpreadsheet size={18} /> Excel Export
          </button>
        </div>
      </div>

      {/* Advanced Filtering System */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center border-b border-slate-50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อโครงการ หรือรหัส..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none focus:ring-2 focus:ring-[#002d62]/10 font-bold text-sm text-slate-800 transition-all"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`flex items-center gap-2 px-6 py-4 rounded-[20px] text-xs font-black transition-all border ${
                isFilterExpanded || selectedStatuses.length > 0 || selectedCategories.length > 0 
                ? 'bg-[#002d62] text-white border-[#002d62]' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
              ตัวกรองขั้นสูง
              {(selectedStatuses.length > 0 || selectedCategories.length > 0) && (
                <span className="bg-white text-[#002d62] w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  {selectedStatuses.length + selectedCategories.length}
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`} />
            </button>
            {(selectedStatuses.length > 0 || selectedCategories.length > 0 || dateStart || dateEnd || searchTerm) && (
              <button 
                onClick={resetFilters}
                className="p-4 bg-slate-100 text-slate-500 rounded-[20px] hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent"
                title="ล้างตัวกรองทั้งหมด"
              >
                <RotateCcw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Filter Panel */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFilterExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-8 bg-slate-50/50 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Multi-select Status */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Check size={14} className="text-[#002d62]" /> สถานะโครงการ
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.values(ProjectStatus).map(s => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border ${
                      selectedStatuses.includes(s)
                        ? 'bg-[#002d62] text-white border-[#002d62] shadow-lg'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-select Category */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Construction size={14} className="text-[#002d62]" /> ประเภทงาน
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.values(ProjectCategory).map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={`px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border ${
                      selectedCategories.includes(c)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Picker */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-[#002d62]" /> วันที่สิ้นสุดสัญญา (Range)
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="text-slate-300 font-black">—</div>
                <div className="relative flex-1">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 mt-3 font-medium italic">กรองตามกำหนดแล้วเสร็จตามสัญญา</p>
            </div>
          </div>
          <div className="px-8 py-4 bg-slate-100/50 flex justify-end">
             <button 
               onClick={() => setIsFilterExpanded(false)}
               className="text-[11px] font-black text-slate-500 uppercase hover:text-[#002d62] transition-colors"
             >
               ซ่อนแผงควบคุม
             </button>
          </div>
        </div>
      </div>

      {/* Active Chips Area */}
      {(selectedStatuses.length > 0 || selectedCategories.length > 0) && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {selectedStatuses.map(s => (
            <div key={s} className="flex items-center gap-2 bg-[#002d62]/5 border border-[#002d62]/10 px-4 py-1.5 rounded-full">
              <span className="text-[10px] font-black text-[#002d62] uppercase tracking-widest">{s}</span>
              <button onClick={() => toggleStatus(s)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={14} /></button>
            </div>
          ))}
          {selectedCategories.map(c => (
            <div key={c} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{c}</span>
              <button onClick={() => toggleCategory(c)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Showing:</span>
        <span className="bg-[#002d62] text-white px-3 py-1 rounded-lg text-xs font-black">{filteredProjects.length} Projects</span>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {paginatedProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
            {/* Top Preview Section */}
            <div className="h-56 flex bg-slate-100 relative">
               <div className="w-1/2 h-full border-r border-white/20 relative group/photo overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale transition-all group-hover/photo:grayscale-0 group-hover/photo:scale-110" />
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded-lg">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Before</span>
                  </div>
               </div>
               <div className="w-1/2 h-full relative group/photo overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-all group-hover/photo:scale-110" />
                  <div className="absolute top-4 right-4 bg-[#002d62] px-3 py-1 rounded-lg">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">In-Progress</span>
                  </div>
               </div>
               <div className="absolute inset-0 pointer-events-none border-[12px] border-white rounded-[48px] z-10 m-1"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <button className="bg-white text-[#002d62] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform border-4 border-slate-100">
                    <QrCode size={24} />
                  </button>
               </div>
            </div>

            {/* Content Area */}
            <div className="p-10 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{project.projectCode}</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                   <span className="text-[10px] font-bold text-slate-400">FY {project.fiscalYear}</span>
                 </div>
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl ${getStatusColor(project.status)}`}>
                   {project.status}
                 </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-8 tracking-tight group-hover:text-blue-700 transition-colors">{project.name}</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                       <MapPin size={16} className="text-slate-300" />
                       <span className="truncate">{project.area}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                       <Users size={16} className="text-slate-300" />
                       <span className="truncate">{project.contractor}</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                       <Clock size={16} className="text-slate-300" />
                       <span>Ends: {project.contractDateEnd}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                       <Construction size={16} className="text-slate-300" />
                       <span>Progress: {project.progressPercent}%</span>
                    </div>
                 </div>
              </div>

              <div className="mt-auto">
                 <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 mb-8">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Construction Progress</span>
                       <span className="text-sm font-black text-blue-600">{project.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                       <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                        style={{ width: `${project.progressPercent}%` }}
                       />
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent Budget (Actual)</p>
                          <p className="text-xl font-black text-[#002d62]">฿{(project.budgetActual || 0).toLocaleString()}</p>
                       </div>
                       {project.problems !== '-' && (
                         <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 animate-pulse">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Issues Reported</span>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleAiAnalysis(project)}
                      className="flex-1 bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Sparkles size={16} className={loadingAiId === project.id ? 'animate-pulse' : ''} />
                      AI Tracking
                    </button>
                    <button 
                      onClick={() => onEdit?.(project)}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"
                    >
                      <Pencil size={16} />
                      Update Status
                    </button>
                    <button className="p-4 border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all">
                      <Eye size={20} />
                    </button>
                 </div>
              </div>

              {/* AI Insight Box */}
              {aiInsight?.id === project.id && (
                <div className="mt-6 p-6 bg-[#001f3f] text-white rounded-[32px] animate-in slide-in-from-bottom-5 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-amber-400" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Construction Intelligence</span>
                  </div>
                  <p className="text-sm italic leading-relaxed text-blue-50">"{aiInsight.text}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="p-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-slate-200" />
           </div>
           <h3 className="text-xl font-black text-slate-900">ไม่พบข้อมูลที่ค้นหา</h3>
           <p className="text-slate-400 font-medium mt-2">ลองเปลี่ยนตัวกรองหรือคำค้นหาใหม่</p>
           <button 
             onClick={resetFilters}
             className="mt-6 px-8 py-3 bg-[#002d62] text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all"
           >
             ล้างตัวกรองทั้งหมด
           </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
           <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-[#002d62] hover:border-[#002d62]/20 transition-all shadow-sm"
           >
            <ChevronLeft />
           </button>
           <div className="flex gap-2">
             {[...Array(totalPages)].map((_, i) => (
               <button
                 key={i}
                 onClick={() => setCurrentPage(i + 1)}
                 className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                   currentPage === i + 1 
                   ? 'bg-[#002d62] text-white shadow-xl' 
                   : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                 }`}
               >
                 {i + 1}
               </button>
             ))}
           </div>
           <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-[#002d62] hover:border-[#002d62]/20 transition-all shadow-sm"
           >
            <ChevronRight />
           </button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
