
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Map as MapIcon, 
  Layers, 
  Maximize2, 
  Search, 
  Navigation, 
  Info, 
  X, 
  Settings, 
  Locate,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  ExternalLink
} from 'lucide-react';
import { queryMapsGroundingAI } from '../services/geminiService';

interface WebMapProps {
  projects: Project[];
}

const WebMap: React.FC<WebMapProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layers, setLayers] = useState({
    boundary: true,
    projects: true,
    roads: true,
    satellite: true
  });
  const [aiAnalysis, setAiAnalysis] = useState<{ text: string, sources: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleMapSearch = async () => {
    setIsSearching(true);
    const result = await queryMapsGroundingAI("ตรวจสอบความหนาแน่นของโครงสร้างพื้นฐานและโครงการที่อยู่ใกล้เคียงในพื้นที่จังหวัดกรุงเทพฯ");
    setAiAnalysis(result);
    setIsSearching(false);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-green-500';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-600';
      case ProjectStatus.DELAYED: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">แผนที่ฐานข้อมูลเชิงพื้นที่ (GIS Web Map)</h2>
          <p className="text-slate-500 text-sm">การแสดงผลภาพถ่ายดาวเทียมความละเอียดสูงและตำแหน่งโครงการจริง</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleMapSearch}
            disabled={isSearching}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isSearching ? <Settings className="animate-spin" size={16} /> : <Search size={16} />}
            วิเคราะห์พื้นที่รอบโครงการ (AI Maps)
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col md:flex-row">
        
        {/* Layer Controls - Sidebar */}
        <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 z-20">
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={14} /> แผนที่ฐาน (Basemaps)
            </h4>
            <div className="space-y-3">
              <button 
                onClick={() => setLayers(prev => ({ ...prev, satellite: true }))}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${layers.satellite ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                ภาพถ่ายดาวเทียม (High Res)
              </button>
              <button 
                onClick={() => setLayers(prev => ({ ...prev, satellite: false }))}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${!layers.satellite ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                แผนที่ถนน (Vector)
              </button>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={14} /> ชั้นข้อมูล (Layers)
            </h4>
            <div className="space-y-3">
              {Object.entries(layers).filter(([k]) => k !== 'satellite').map(([key, value]) => (
                <label key={key} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs text-slate-400 group-hover:text-white transition-colors capitalize">
                    {key === 'boundary' ? 'ขอบเขตตำบล' : key === 'projects' ? 'จุดโครงการ' : 'โครงข่ายถนน'}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={value} 
                    onChange={() => setLayers(prev => ({ ...prev, [key]: !value }))}
                    className="accent-blue-600 w-4 h-4 rounded border-slate-700 bg-slate-800"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="mt-auto">
             <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
               <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">พิกัดปัจจุบัน</p>
               <p className="text-xs text-white font-mono">13.7563° N, 100.5018° E</p>
               <button className="mt-3 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                 <Locate size={12} /> ปักหมุดที่ตั้งฉัน
               </button>
             </div>
          </section>
        </div>

        {/* Map Viewport */}
        <div className="flex-1 relative overflow-hidden bg-slate-950">
          {/* Simulated Satellite Tile Grid */}
          <div 
            className={`absolute inset-0 transition-opacity duration-1000 ${layers.satellite ? 'opacity-40' : 'opacity-10'}`}
            style={{ 
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
              transform: `scale(${zoomLevel})`
            }}
          ></div>

          {/* District Boundary Overlay */}
          {layers.boundary && (
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] border-4 border-indigo-500/40 bg-indigo-500/5 rounded-[40px] pointer-events-none"
              style={{ transform: `translate(-50%, -50%) scale(${zoomLevel})` }}
            >
              <div className="absolute top-4 right-8 text-indigo-400 text-[10px] font-bold uppercase tracking-widest opacity-60">เขตพื้นที่รับผิดชอบ (Sub-District Boundary)</div>
            </div>
          )}

          {/* Road Network Overlays */}
          {layers.roads && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" style={{ transform: `scale(${zoomLevel})` }}>
              <path d="M 0 300 Q 400 350 800 300" stroke="#f1f5f9" strokeWidth="12" fill="none" strokeDasharray="5,5" />
              <path d="M 400 0 V 800" stroke="#f1f5f9" strokeWidth="8" fill="none" />
              <path d="M 0 500 H 1200" stroke="#64748b" strokeWidth="4" fill="none" />
            </svg>
          )}

          {/* Project Points */}
          {layers.projects && projects.map((p, idx) => (
            <div 
              key={p.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{ 
                top: `${30 + idx * 15}%`, 
                left: `${40 + idx * 10}%`,
                transform: `translate(-50%, -50%) scale(${zoomLevel})` 
              }}
              onClick={() => setSelectedProject(p)}
            >
              <div className="flex flex-col items-center">
                 <div className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-slate-900 shadow-xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-200">
                    {p.name}
                 </div>
                 <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all group-hover:scale-125 ${getStatusColor(p.status)}`}>
                    <Navigation size={12} className="text-white rotate-45" />
                 </div>
              </div>
            </div>
          ))}

          {/* Map Controls Overlay */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))} className="w-10 h-10 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"><ZoomIn size={20} /></button>
            <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))} className="w-10 h-10 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"><ZoomOut size={20} /></button>
            <div className="h-4"></div>
            <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all"><Maximize2 size={20} /></button>
          </div>

          {/* AI Info Grounding Panel */}
          {aiAnalysis && (
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-indigo-900/90 backdrop-blur-xl border border-indigo-400/30 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 z-30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-indigo-200">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Geospatial Analysis</span>
                </div>
                <button onClick={() => setAiAnalysis(null)} className="text-indigo-300 hover:text-white"><X size={18} /></button>
              </div>
              <p className="text-sm text-white leading-relaxed mb-4">{aiAnalysis.text}</p>
              {aiAnalysis.sources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase">อ้างอิงจาก Google Maps:</p>
                  {aiAnalysis.sources.map((source: any, idx: number) => (
                    source.maps && (
                      <a 
                        key={idx} 
                        href={source.maps.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] text-indigo-100 hover:text-white transition-colors bg-white/10 p-2 rounded-lg"
                      >
                        <ExternalLink size={12} />
                        {source.maps.title || "ดูตำแหน่งบน Google Maps"}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Project Details Modal/Popup */}
          {selectedProject && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="relative h-32 bg-slate-100">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                   <button 
                     onClick={() => setSelectedProject(null)}
                     className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-white/40 transition-all"
                   >
                     <X size={16} />
                   </button>
                   <div className="absolute bottom-3 left-4">
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${getStatusColor(selectedProject.status)}`}>
                       {selectedProject.status}
                     </span>
                   </div>
                </div>
                <div className="p-5">
                   <p className="text-[10px] font-bold text-indigo-600 mb-1">{selectedProject.projectCode}</p>
                   <h3 className="font-bold text-slate-900 mb-4">{selectedProject.name}</h3>
                   
                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tight">ปีงบประมาณ</p>
                        <p className="text-sm font-bold text-slate-800">{selectedProject.fiscalYear}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tight">งบประมาณ</p>
                        <p className="text-sm font-bold text-slate-800">฿{(selectedProject.budgetActual || selectedProject.budgetEstimated).toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2">
                      <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                        <Maximize2 size={16} /> ดูรายละเอียดโครงการ
                      </button>
                      <button className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                        แสดงข้อมูลก่อสร้างย้อนหลัง
                      </button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Attribution */}
          <div className="absolute bottom-4 right-4 bg-slate-900/40 backdrop-blur-sm px-2 py-1 rounded text-[8px] text-white/60 font-medium">
             InfraGuard GIS Engine | Basemap © Google | Thailand GISTDA Layer
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebMap;
