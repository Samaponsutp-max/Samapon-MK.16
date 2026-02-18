
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, ProjectCategory, AIProjectAnalysis } from '../types';
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
  RotateCcw,
  Wallet,
  Hash,
  Info,
  ExternalLink,
  ClipboardCheck,
  Globe,
  Plus,
  AlertTriangle,
  CheckSquare,
  Activity,
  ArrowRight,
  Printer,
  TrendingUp,
  TrendingDown,
  Percent,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import { getProjectSummaryAI, getDeepStrategicInsightAI } from '../services/geminiService';
import AIImageEditor from './AIImageEditor';

interface ProjectListProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  onUpdateProject?: (project: Project) => void;
}

const ITEMS_PER_PAGE = 8;

const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit, onDelete, onAddNew, onUpdateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Advanced Filtering State
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [loadingDeepId, setLoadingDeepId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ project: Project, analysis: AIProjectAnalysis } | null>(null);
  const [deepInsightResult, setDeepInsightResult] = useState<{ project: Project, insight: string } | null>(null);
  const [detailModalProject, setDetailModalProject] = useState<Project | null>(null);
  
  // Image Editor State
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [editingProjectRef, setEditingProjectRef] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(p.status);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      
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
    const analysis = await getProjectSummaryAI(project);
    setAiAnalysisResult({ project, analysis });
    setLoadingAiId(null);
  };

  const handleDeepStrategicInsight = async (project: Project) => {
    setLoadingDeepId(project.id);
    const insight = await getDeepStrategicInsightAI(project);
    setDeepInsightResult({ project, insight });
    setLoadingDeepId(null);
  };

  const openImageEditor = (project: Project, imageType: 'before' | 'after') => {
    // For demo, we use the placeholder if no real photo exists
    const img = project.photos?.[imageType] || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop";
    setTargetImage(img);
    setEditingProjectRef(project);
    setIsImageEditorOpen(true);
  };

  const handleSaveImage = (newImage: string) => {
    if (editingProjectRef && onUpdateProject) {
      const updatedProject = {
        ...editingProjectRef,
        photos: {
          ...editingProjectRef.photos,
          after: newImage // We'll save it as the 'after' photo for simplicity
        }
      };
      onUpdateProject(updatedProject);
    }
    setIsImageEditorOpen(false);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 relative min-h-[calc(100vh-100px)]">
      {/* Screen View - Hidden in Print */}
      <div className="flex flex-col gap-6 no-print">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black text-[#002d62] tracking-tighter uppercase">Construction Registry</h2>
            <p className="text-slate-500 font-medium">ทะเบียนโครงการและตรวจติดตามงานก่อสร้างรายพื้นที่</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-rose-700 transition-all active:scale-95 group"
            >
              <Printer size={18} /> Export PDF
            </button>
            <button 
              onClick={onAddNew}
              className="flex items-center gap-2 bg-[#002d62] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-black transition-all active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" /> เพิ่มโครงการใหม่
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
                <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {paginatedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
                <div className="h-56 flex bg-slate-100 relative">
                   <div className="w-1/2 h-full border-r border-white/20 relative group/photo overflow-hidden">
                      <img src={project.photos?.before || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop"} className="w-full h-full object-cover grayscale transition-all group-hover/photo:grayscale-0 group-hover/photo:scale-110" />
                      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded-lg flex items-center gap-2">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Before</span>
                      </div>
                      <button 
                        onClick={() => openImageEditor(project, 'before')}
                        className="absolute bottom-4 left-4 bg-white/80 backdrop-blur p-2 rounded-xl text-slate-800 opacity-0 group-hover/photo:opacity-100 transition-all hover:bg-white"
                        title="แก้ไขรูปภาพด้วย AI"
                      >
                        <Wand2 size={16} />
                      </button>
                   </div>
                   <div className="w-1/2 h-full relative group/photo overflow-hidden">
                      <img src={project.photos?.after || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop"} className="w-full h-full object-cover transition-all group-hover/photo:scale-110" />
                      <div className="absolute top-4 right-4 bg-[#002d62] px-3 py-1 rounded-lg">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">In-Progress</span>
                      </div>
                      <button 
                        onClick={() => openImageEditor(project, 'after')}
                        className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-2 rounded-xl text-slate-800 opacity-0 group-hover/photo:opacity-100 transition-all hover:bg-white"
                        title="แก้ไขรูปภาพด้วย AI"
                      >
                        <Wand2 size={16} />
                      </button>
                   </div>
                   <div className="absolute inset-0 pointer-events-none border-[12px] border-white rounded-[48px] z-10 m-1"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <button className="bg-white text-[#002d62] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform border-4 border-slate-100">
                        <QrCode size={24} />
                      </button>
                   </div>
                </div>

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
                           <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${project.progressPercent}%` }} />
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleAiAnalysis(project)}
                          disabled={loadingAiId === project.id}
                          className="flex-1 bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                          <Sparkles size={16} className={loadingAiId === project.id ? 'animate-spin' : ''} />
                          AI Tracking
                        </button>
                        <button 
                          onClick={() => handleDeepStrategicInsight(project)}
                          disabled={loadingDeepId === project.id}
                          className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-50"
                        >
                          <Brain size={16} className={loadingDeepId === project.id ? 'animate-spin' : ''} />
                          Deep Strategic
                        </button>
                        <button 
                          onClick={() => setDetailModalProject(project)}
                          className="p-4 border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all"
                        >
                          <Eye size={20} />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-slate-300 animate-in fade-in zoom-in-95 duration-500">
             <div className="bg-slate-50 p-8 rounded-full mb-6">
                <Construction size={64} className="text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 font-['Sarabun'] tracking-tight">ไม่พบโครงการที่ค้นหา</h3>
          </div>
        )}
      </div>

      {/* AI Structured Analysis Modal */}
      {aiAnalysisResult && (
        <div className="fixed inset-0 z-[70] bg-[#001f3f]/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto no-print">
          <div className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
             <div className="bg-[#002d62] p-8 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                   <div className="bg-indigo-500 p-3 rounded-2xl shadow-xl shadow-indigo-500/20"><Sparkles size={24} /></div>
                   <div>
                      <h4 className="text-xl font-black">AI Intelligence Analysis</h4>
                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-1">Infrastructure Strategic Blueprint</p>
                   </div>
                </div>
                <button onClick={() => setAiAnalysisResult(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10"><X size={24} /></button>
             </div>

             <div className="p-10 overflow-y-auto space-y-10">
                <div className="flex flex-col md:flex-row gap-10">
                   <div className="flex-1">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ClipboardCheck size={16} className="text-blue-600" /> Executive Summary
                      </h5>
                      <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                         <p className="text-lg font-bold text-[#002d62] leading-relaxed italic">"{aiAnalysisResult.analysis.summary}"</p>
                      </div>
                   </div>
                   <div className="md:w-64 flex flex-col items-center justify-center bg-blue-50/50 rounded-[40px] border border-blue-100 p-8 text-center">
                      <div className="relative w-32 h-32 mb-4">
                         <svg className="w-full h-full transform -rotate-90">
                           <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-blue-100" />
                           <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - aiAnalysisResult.analysis.healthScore/100)} className="text-blue-600" />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-[#002d62]">{aiAnalysisResult.analysis.healthScore}</span>
                            <span className="text-[9px] font-black text-blue-400 uppercase">Score</span>
                         </div>
                      </div>
                      <p className="text-xs font-black text-slate-900 uppercase">Project Health</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Risks Section */}
                   <div className="space-y-6">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle size={16} className="text-rose-600" /> Potential Risks & Bottlenecks
                      </h5>
                      <div className="space-y-4">
                         {aiAnalysisResult.analysis.risks.map((risk, idx) => (
                           <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                 <span className="text-sm font-black text-slate-800">{risk.title}</span>
                                 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getSeverityColor(risk.severity)}`}>
                                   {risk.severity}
                                 </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">{risk.description}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Actions Section */}
                   <div className="space-y-6">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckSquare size={16} className="text-emerald-600" /> Strategic Action Items
                      </h5>
                      <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl">
                         <div className="space-y-4">
                            {aiAnalysisResult.analysis.actionItems.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-4 group">
                                 <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <ArrowRight size={12} className="text-blue-300" />
                                 </div>
                                 <p className="text-sm font-bold text-white leading-relaxed">{item}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Deep Strategic Insight Modal (Thinking Mode) */}
      {deepInsightResult && (
        <div className="fixed inset-0 z-[80] bg-[#001f3f]/95 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto no-print">
          <div className="bg-slate-900 rounded-[56px] w-full max-w-5xl shadow-[0_0_100px_rgba(30,58,138,0.5)] border border-blue-500/30 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-500">
             <div className="p-12 border-b border-blue-500/20 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-6">
                   <div className="bg-blue-600 p-4 rounded-3xl shadow-[0_0_30px_rgba(37,99,235,0.4)] animate-pulse"><Brain size={32} className="text-white" /></div>
                   <div>
                      <h4 className="text-3xl font-black text-white tracking-tight">AI Deep Strategic Insight</h4>
                      <p className="text-xs text-blue-400 font-black uppercase tracking-[0.4em] mt-1">Thinking Mode: Complex Multi-Vector Analysis</p>
                   </div>
                </div>
                <button onClick={() => setDeepInsightResult(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white border border-white/10 transition-all"><X size={32} /></button>
             </div>
             
             <div className="p-12 overflow-y-auto flex-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="max-w-4xl mx-auto space-y-10">
                   <div className="bg-white/5 backdrop-blur-md p-10 rounded-[48px] border border-white/10 shadow-2xl">
                      <div className="flex items-center gap-3 mb-8">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                         <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Complex Reasoning Payload Output</p>
                      </div>
                      <div className="text-lg font-medium text-blue-50 leading-loose prose prose-invert max-w-none">
                         {deepInsightResult.insight.split('\n').map((para, i) => para.trim() ? <p key={i} className="mb-6">{para}</p> : null)}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-blue-600/10 rounded-[40px] border border-blue-500/20">
                         <h5 className="text-blue-300 text-xs font-black uppercase mb-4 tracking-widest">Macro Impact Sector</h5>
                         <p className="text-sm text-blue-100 font-bold leading-relaxed">โครงการนี้ถูกระบุว่ามีผลกระทบโดยตรงต่อเสถียรภาพทางเศรษฐกิจระดับท้องถิ่น และเป็นกลไกสำคัญในการขับเคลื่อนดัชนีชี้วัดความเจริญ (Prosperity Index)</p>
                      </div>
                      <div className="p-8 bg-emerald-600/10 rounded-[40px] border border-emerald-500/20">
                         <h5 className="text-emerald-300 text-xs font-black uppercase mb-4 tracking-widest">Sustainability Lifecycle</h5>
                         <p className="text-sm text-emerald-100 font-bold leading-relaxed">การวิเคราะห์พยากรณ์โครงสร้างระบุว่าวัสดุที่ใช้จะมีความทนทานสูงกว่ามาตรฐาน 15% ส่งผลให้งบซ่อมบำรุงในอีก 10 ปีข้างหน้าลดลงอย่างมีนัยสำคัญ</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 border-t border-blue-500/20 bg-slate-900/50 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setDeepInsightResult(null)}
                  className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl"
                >
                   Acknowledge Insight
                </button>
             </div>
          </div>
        </div>
      )}

      {/* AI Image Editor Modal */}
      {isImageEditorOpen && targetImage && (
        <AIImageEditor 
          initialImage={targetImage}
          onSave={handleSaveImage}
          onClose={() => setIsImageEditorOpen(false)}
        />
      )}
    </div>
  );
};

// Internal icon helpers
const Building = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
    <path d="M7 22V14h10v8" />
    <path d="M12 7h.01" />
    <path d="M17 7h.01" />
    <path d="M7 7h.01" />
    <path d="M12 11h.01" />
    <path d="M17 11h.01" />
    <path d="M7 11h.01" />
  </svg>
);

export default ProjectList;
