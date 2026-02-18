
import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Layers, 
  Navigation, 
  X, 
  Locate,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Sparkles,
  Globe,
  Map as MapIcon,
  Filter,
  Box,
  LayoutGrid,
  Activity,
  MapPin,
  Maximize2,
  Search,
  ArrowRight
} from 'lucide-react';
import { queryMapsGroundingAI } from '../services/geminiService';

interface WebMapProps {
  projects: Project[];
}

const STORAGE_KEY = 'infraguard_map_view_state';

const WebMap: React.FC<WebMapProps> = ({ projects }) => {
  const [layers, setLayers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).layers : { boundary: true, projects: true, satellite: true };
  });

  const [view, setView] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).view : { lat: 16.0706822, lng: 103.6590449, zoom: 956 };
  });

  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [aiAnalysis, setAiAnalysis] = useState<{ text: string, sources: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ layers, view }));
  }, [layers, view]);

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'ALL') return projects;
    return projects.filter(p => p.status === statusFilter);
  }, [projects, statusFilter]);

  const handleZoom = (factor: number) => setView((v: any) => ({ ...v, zoom: v.zoom * factor }));
  const resetHome = () => setView({ lat: 16.0706822, lng: 103.6590449, zoom: 956 });

  const projectToPx = (lat: number, lng: number) => {
    const dLat = lat - view.lat;
    const dLng = lng - view.lng;
    const scale = 250000 * (956 / view.zoom);
    return { top: 50 - dLat * scale, left: 50 + dLng * scale * 0.95 };
  };

  const handleLocationSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await queryMapsGroundingAI(
        `ค้นหาสถานที่หรือโครงการโครงสร้างพื้นฐานที่เกี่ยวข้องกับ: ${searchQuery} ในพื้นที่ 16.0706822, 103.6590449`, 
        { lat: view.lat, lng: view.lng }
      );
      setAiAnalysis(res);
      setSearchQuery('');
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${view.zoom}!2d${view.lng}!3d${view.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e${layers.satellite ? '1' : '0'}!3m2!1sth!2sth!4v1770964663675!5m2!1sth!2sth`;

  const radialActions = [
    { id: 'ai', icon: Sparkles, color: 'bg-amber-500', label: 'AI Spatial Analysis', action: async () => {
      setIsSearching(true);
      const res = await queryMapsGroundingAI(`วิเคราะห์พิกัดโดยรอบ ${view.lat}, ${view.lng} สำหรับงานโครงสร้างพื้นฐาน`, { lat: view.lat, lng: view.lng });
      setAiAnalysis(res);
      setIsSearching(false);
      setIsRadialOpen(false);
    }},
    { id: 'sat', icon: layers.satellite ? Globe : Box, color: 'bg-emerald-500', label: 'Base Map Style', action: () => setLayers((l: any) => ({ ...l, satellite: !l.satellite })) },
    { id: 'home', icon: Locate, color: 'bg-blue-600', label: 'Reset View', action: resetHome },
    { id: 'filter', icon: Filter, color: 'bg-indigo-600', label: 'Status Filter', action: () => {
      const statuses = Object.values(ProjectStatus);
      const currentIdx = statuses.indexOf(statusFilter as ProjectStatus);
      const nextStatus = statuses[(currentIdx + 1) % statuses.length];
      setStatusFilter(nextStatus);
    }},
  ];

  return (
    <div className="relative w-full h-[calc(100vh-160px)] rounded-[56px] overflow-hidden shadow-2xl bg-slate-200 border border-slate-200 font-['Sarabun']">
      
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <iframe src={mapUrl} width="100%" height="100%" className="w-full h-full grayscale-[0.1]" style={{ border: 0 }}></iframe>
      </div>

      {/* Floating Search Bar */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-6">
        <form 
          onSubmit={handleLocationSearch}
          className="bg-white/90 backdrop-blur-2xl p-2 rounded-[32px] border border-white shadow-2xl flex items-center gap-2 group transition-all focus-within:ring-4 focus-within:ring-blue-100"
        >
          <div className="pl-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาสถานที่, ที่อยู่ หรือโครงการ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
          />
          <button 
            type="submit"
            className="bg-[#002d62] text-white p-3 rounded-[24px] hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <ArrowRight size={20} />
          </button>
        </form>
      </div>

      {/* Floating HUD: Info Display */}
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-2xl pointer-events-auto max-w-sm">
           <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#002d62] p-3 rounded-2xl text-white shadow-lg"><Activity size={24} /></div>
              <div>
                 <h2 className="text-xl font-black text-[#002d62]">GIS Live Feed</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Territorial Tracking Active</p>
              </div>
           </div>
           <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400">LATITUDE</span>
                <span className="text-xs font-mono font-bold">{view.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400">LONGITUDE</span>
                <span className="text-xs font-mono font-bold">{view.lng.toFixed(6)}</span>
              </div>
           </div>
           <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">View Focus</span>
                <span className="text-lg font-black text-slate-800">{statusFilter === 'ALL' ? 'Everything' : statusFilter}</span>
              </div>
              <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"><MapPin size={20} /></div>
           </div>
        </div>
      </div>

      {/* Project Markers */}
      {layers.projects && filteredProjects.map((p) => {
        const mockLat = p.id === '1' ? view.lat + 0.0005 : view.lat - 0.0008;
        const mockLng = p.id === '1' ? view.lng + 0.0010 : view.lng - 0.0005;
        const pos = projectToPx(mockLat, mockLng);
        if (pos.top < -5 || pos.top > 105 || pos.left < -5 || pos.left > 105) return null;
        return (
          <div key={p.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group" style={{ top: `${pos.top}%`, left: `${pos.left}%` }} onClick={() => setSelectedProject(p)}>
            <div className="bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg text-white text-[10px] font-bold shadow-2xl mb-2 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 whitespace-nowrap border border-white/20">{p.name}</div>
            <div className={`w-8 h-8 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transition-all group-hover:scale-125 ${p.status === ProjectStatus.COMPLETED ? 'bg-emerald-500' : 'bg-blue-600'}`}>
              <Navigation size={14} className="text-white rotate-45" />
            </div>
          </div>
        );
      })}

      {/* Bottom-Right Radial Menu */}
      <div className="absolute bottom-12 right-12 z-50 flex items-center justify-center">
        {radialActions.map((item, idx) => {
          const angle = (90 / (radialActions.length - 1)) * idx + 90;
          const radius = isRadialOpen ? 140 : 0;
          const x = -Math.cos((angle * Math.PI) / 180) * radius;
          const y = -Math.sin((angle * Math.PI) / 180) * radius;
          return (
            <button key={item.id} onClick={item.action} style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: `${idx * 50}ms` }} className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white transition-all duration-500 group ${item.color} ${isRadialOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}`}>
              <item.icon size={22} />
              <div className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg shadow-xl opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">{item.label}</div>
            </button>
          );
        })}
        <button onClick={() => setIsRadialOpen(!isRadialOpen)} className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-[0_30px_60px_-10px_rgba(0,45,98,0.5)] border-8 border-white transition-all duration-500 z-50 ${isRadialOpen ? 'bg-rose-500 rotate-45' : 'bg-[#002d62]'}`}>
           {isRadialOpen ? <X size={40} /> : <><Layers size={32} /><span className="text-[10px] font-black uppercase mt-1">Menu</span></>}
        </button>
      </div>

      {/* View Controls (Zoom) */}
      <div className="absolute top-10 right-10 z-10 flex flex-col gap-3">
        <button onClick={() => handleZoom(0.5)} className="w-14 h-14 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center text-[#002d62] hover:bg-blue-600 hover:text-white transition-all border border-white"><ZoomIn size={24} /></button>
        <button onClick={() => handleZoom(2.0)} className="w-14 h-14 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center text-[#002d62] hover:bg-blue-600 hover:text-white transition-all border border-white"><ZoomOut size={24} /></button>
      </div>

      {/* Modals: AI Analysis & Project Detail */}
      {selectedProject && (
        <div className="absolute bottom-12 left-12 z-50 w-full max-w-sm animate-in slide-in-from-left-20 duration-500">
           <div className="bg-white rounded-[40px] shadow-2xl border border-white overflow-hidden flex flex-col">
              <div className="h-44 bg-slate-900 relative">
                 <img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" />
                 <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white backdrop-blur border border-white/20"><X size={20} /></button>
                 <div className="absolute bottom-4 left-6 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">{selectedProject.status}</div>
              </div>
              <div className="p-8">
                 <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">{selectedProject.projectCode}</p>
                 <h3 className="text-xl font-black text-slate-900 mb-6 leading-tight">{selectedProject.name}</h3>
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Actual Budget</p>
                       <p className="text-sm font-black text-[#002d62]">฿{(selectedProject.budgetActual || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                       <p className="text-sm font-black text-blue-600">{selectedProject.progressPercent}%</p>
                       <p className="text-[9px] text-blue-400 font-black uppercase mb-1">Completion</p>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-[#002d62] text-white rounded-[20px] font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"><Activity size={16} /> Open Full Audit Log</button>
              </div>
           </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl px-6 animate-in zoom-in-95 duration-500">
           <div className="bg-[#001f3f]/95 backdrop-blur-3xl rounded-[48px] border border-white/10 p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-4">
                    <div className="bg-amber-500 p-3 rounded-2xl shadow-xl shadow-amber-500/30"><Sparkles className="text-white" size={24} /></div>
                    <div>
                       <h4 className="text-xl font-black text-white">AI Spatial Intelligence</h4>
                       <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Grounding Analysis Active</p>
                    </div>
                 </div>
                 <button onClick={() => setAiAnalysis(null)} className="p-3 text-slate-400 hover:text-white transition-all"><X size={28} /></button>
              </div>
              <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 mb-8">
                 <p className="text-blue-50 text-lg leading-relaxed italic font-medium">"{aiAnalysis.text}"</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 {aiAnalysis.sources.slice(0, 3).map((s, i) => s.maps && (
                   <a key={i} href={s.maps.uri} target="_blank" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white text-[10px] font-bold border border-white/10 transition-all"><ExternalLink size={12} /> {s.maps.title || 'Official Source'}</a>
                 ))}
              </div>
           </div>
        </div>
      )}

      {isSearching && (
        <div className="absolute inset-0 z-[100] bg-[#001f3f]/40 backdrop-blur-sm flex items-center justify-center">
           <div className="bg-white p-12 rounded-[56px] shadow-2xl text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                 <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                 <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                 <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" size={32} />
              </div>
              <p className="text-2xl font-black text-[#002d62]">AI กำลังค้นหาและวิเคราะห์ข้อมูล...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default WebMap;
