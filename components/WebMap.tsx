
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Layers, 
  Maximize2, 
  Navigation, 
  X, 
  Settings, 
  Locate,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  ChevronLeft,
  Menu,
  History,
  Sparkles,
  Globe,
  Map as MapIcon
} from 'lucide-react';
import { queryMapsGroundingAI } from '../services/geminiService';

interface WebMapProps {
  projects: Project[];
}

const STORAGE_KEY = 'infraguard_map_state';

const WebMap: React.FC<WebMapProps> = ({ projects }) => {
  // --- Persistent State Initialization ---
  const [layers, setLayers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.layers || { boundary: true, projects: true, satellite: true };
      } catch (e) { return { boundary: true, projects: true, satellite: true }; }
    }
    return { boundary: true, projects: true, satellite: true };
  });

  const [mapView, setMapView] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.view || { lat: 16.0706822, lng: 103.6590449, zoom: 956.0496324950694 };
      } catch (e) { return { lat: 16.0706822, lng: 103.6590449, zoom: 956.0496324950694 }; }
    }
    return { lat: 16.0706822, lng: 103.6590449, zoom: 956.0496324950694 };
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<{ text: string, sources: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // --- Persistence Side Effect ---
  useEffect(() => {
    const stateToSave = {
      layers,
      view: mapView
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [layers, mapView]);

  // Sync sidebar with screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Map Utilities ---
  const getMapUrl = (isSatellite: boolean) => {
    const mapTypeParam = isSatellite ? '!5e1' : '!5e0';
    // Dynamic URL reconstruction using stored view state
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${mapView.zoom}!2d${mapView.lng}!3d${mapView.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1${mapTypeParam}!3m2!1sth!2sth!4v1770964663675!5m2!1sth!2sth`;
  };

  const handleZoom = (factor: number) => {
    setMapView(prev => ({
      ...prev,
      // Smaller '1d' value in Google Embed URL = higher zoom (closer)
      zoom: prev.zoom * factor
    }));
  };

  const resetToHome = () => {
    setMapView({ lat: 16.0706822, lng: 103.6590449, zoom: 956.0496324950694 });
  };

  // Simplified Projection for markers relative to current view center
  const projectToPixel = (lat: number, lng: number) => {
    const latDiff = lat - mapView.lat;
    const lngDiff = lng - mapView.lng;
    
    // Scale marker positions inversely to the zoom parameter
    const baseScale = 250000;
    const currentScale = baseScale * (956.0496324950694 / mapView.zoom);
    
    return {
      top: 50 - (latDiff * currentScale),
      left: 50 + (lngDiff * currentScale * 0.95)
    };
  };

  const handleMapSearch = async () => {
    setIsSearching(true);
    const result = await queryMapsGroundingAI(
      `วิเคราะห์พื้นที่โดยรอบพิกัด ${mapView.lat}, ${mapView.lng} สำหรับงานโครงสร้างพื้นฐาน`,
      { lat: mapView.lat, lng: mapView.lng }
    );
    setAiAnalysis(result);
    setIsSearching(false);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-emerald-500';
      case ProjectStatus.IN_PROGRESS: return 'bg-sky-500';
      case ProjectStatus.DELAYED: return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 relative overflow-hidden font-['Sarabun']">
      {/* Top Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <MapIcon className="text-indigo-600" size={24} />
            ฐานข้อมูลภูมิสารสนเทศ (GIS Web Map)
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">บันทึกสถานะมุมมองปัจจุบันอัตโนมัติ (State Persisted)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleMapSearch}
            disabled={isSearching}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isSearching ? <Settings className="animate-spin" size={16} /> : <Sparkles size={16} />}
            AI วิเคราะห์ภาพรวมพื้นที่
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 relative flex">
        
        {/* Toggle Sidebar Button (Mobile) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 p-3 bg-white/90 backdrop-blur text-slate-900 rounded-2xl shadow-xl border border-slate-200 hover:bg-white transition-all"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Minimalist Responsive Sidebar */}
        <aside 
          className={`
            fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-slate-900/95 backdrop-blur-2xl p-6 flex flex-col gap-6 
            transition-all duration-500 ease-in-out
            ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:w-0 lg:p-0 lg:border-none overflow-hidden'}
          `}
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" /> Map Layers
            </h4>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-slate-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <section>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Base Map</p>
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setLayers((prev: any) => ({ ...prev, satellite: true }))}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${layers.satellite ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                  Satellite
                </button>
                <button 
                  onClick={() => setLayers((prev: any) => ({ ...prev, satellite: false }))}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${!layers.satellite ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                  Roadmap
                </button>
              </div>
            </section>

            <section>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Active Layers</p>
              <div className="space-y-2">
                {[
                  { id: 'boundary', label: 'ขอบเขตปกครอง' },
                  { id: 'projects', label: 'พิกัดโครงการจริง' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white">
                      {item.label}
                    </span>
                    <input 
                      type="checkbox" 
                      checked={(layers as any)[item.id]} 
                      onChange={() => setLayers((prev: any) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-auto bg-white/5 rounded-2xl p-4 border border-white/5">
             <div className="flex items-center gap-2 mb-2">
               <Locate size={14} className="text-indigo-400" />
               <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Saved Coordinates</span>
             </div>
             <p className="text-[11px] text-white font-mono bg-black/40 p-2 rounded-lg mb-4 text-center">
               {mapView.lat.toFixed(5)}, {mapView.lng.toFixed(5)}
             </p>
             <div className="flex flex-col gap-2">
              <button 
                onClick={() => window.open(`https://www.google.com/maps?q=${mapView.lat},${mapView.lng}&t=${layers.satellite ? 'k' : 'm'}`, '_blank')}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} /> Full View
              </button>
              <button 
                onClick={resetToHome}
                className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
              >
                Reset to Origin
              </button>
             </div>
          </div>
        </aside>

        {/* Map Viewport Area */}
        <div 
          ref={mapContainerRef}
          className="flex-1 relative bg-slate-200"
          onClick={() => {
            if (selectedProject) setSelectedProject(null);
          }}
        >
          {/* Main Map Layer (Iframe) */}
          <div className="absolute inset-0 pointer-events-auto">
            <iframe 
              src={getMapUrl(layers.satellite)} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className={`w-full h-full transition-opacity duration-1000 ${layers.satellite ? 'opacity-100 grayscale-[10%]' : 'opacity-100'}`}
            ></iframe>
          </div>

          {/* District Boundary Overlay */}
          {layers.boundary && (
            <div className="absolute inset-0 pointer-events-none border-[12px] border-indigo-500/10 rounded-[32px] z-10 m-4">
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/40 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
                  <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">GIS BOUNDARY SECTOR R04-ROIET</span>
               </div>
            </div>
          )}

          {/* Coordinate-Based Project Markers */}
          {layers.projects && projects.map((p, idx) => {
             // Mock offset logic for demo if markers are too close to center
             const mockLat = p.id === '1' ? mapView.lat + 0.0005 : mapView.lat - 0.0008;
             const mockLng = p.id === '1' ? mapView.lng + 0.0010 : mapView.lng - 0.0005;
             const pos = projectToPixel(mockLat, mockLng);
             
             // Only render if reasonably within view
             if (pos.top < -10 || pos.top > 110 || pos.left < -10 || pos.left > 110) return null;

             return (
              <div 
                key={p.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject(p);
                }}
              >
                <div className="flex flex-col items-center">
                   <div className="bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-bold text-white shadow-2xl mb-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all border border-white/10 whitespace-nowrap">
                      {p.name}
                   </div>
                   <div className={`w-6 h-6 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transition-all group-hover:scale-125 ${getStatusColor(p.status)}`}>
                      <Navigation size={12} className="text-white rotate-45" />
                   </div>
                   <div className="w-1 h-3 bg-white/50 rounded-full mt-1 opacity-40"></div>
                </div>
              </div>
            );
          })}

          {/* Floating Map Interaction Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-30">
            <button 
              onClick={() => handleZoom(0.5)}
              className="w-10 h-10 bg-white/90 backdrop-blur text-slate-900 rounded-2xl shadow-xl flex items-center justify-center hover:bg-white transition-all border border-slate-200"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button 
              onClick={() => handleZoom(2.0)}
              className="w-10 h-10 bg-white/90 backdrop-blur text-slate-900 rounded-2xl shadow-xl flex items-center justify-center hover:bg-white transition-all border border-slate-200"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <div className="h-2"></div>
            <button 
              onClick={resetToHome}
              className="w-10 h-10 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all border border-indigo-400"
              title="Recenter"
            >
              <Locate size={20} />
            </button>
          </div>

          {/* Detail Card Overlay */}
          {selectedProject && (
            <div 
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6 animate-in slide-in-from-bottom-10 duration-500"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-200">
                <div className="relative h-32 bg-slate-100">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                   <img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                   <button 
                     onClick={() => setSelectedProject(null)}
                     className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-black/50 transition-all border border-white/20"
                   >
                     <X size={16} />
                   </button>
                   <div className="absolute bottom-4 left-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20 ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                   </div>
                </div>
                <div className="p-6">
                   <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">{selectedProject.projectCode}</p>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ปี {selectedProject.fiscalYear}</p>
                   </div>
                   <h3 className="font-bold text-slate-900 text-lg mb-4 leading-tight">{selectedProject.name}</h3>
                   
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center mb-6">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">งบประมาณจัดจ้าง</p>
                        <p className="text-base font-black text-slate-900 leading-none">฿{(selectedProject.budgetActual || selectedProject.budgetEstimated).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">ความคืบหน้า</p>
                        <p className="text-base font-black text-indigo-600 leading-none">{selectedProject.progressPercent}%</p>
                      </div>
                   </div>

                   <button className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100">
                     <History size={18} /> ดูประวัติและรูปถ่ายหน้างาน
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Floating Panel */}
          {aiAnalysis && (
            <div 
              className="absolute top-6 left-6 right-6 lg:right-auto lg:w-96 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl animate-in fade-in duration-500 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Spatial Insight</span>
                </div>
                <button onClick={() => setAiAnalysis(null)} className="p-1 text-slate-500 hover:text-white rounded-full"><X size={16} /></button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium mb-4">{aiAnalysis.text}</p>
              <div className="flex flex-wrap gap-2">
                 {aiAnalysis.sources.slice(0, 2).map((s, idx) => s.maps && (
                    <a key={idx} href={s.maps.uri} target="_blank" className="text-[9px] bg-white/5 border border-white/5 px-3 py-1 rounded-full text-indigo-300 flex items-center gap-1 hover:bg-white/10 transition-all">
                       <ExternalLink size={10} /> {s.maps.title || "Open Detail"}
                    </a>
                 ))}
              </div>
            </div>
          )}

          {/* Footer Attribution */}
          <div className="absolute bottom-4 right-4 bg-slate-900/40 backdrop-blur-md px-3 py-1 rounded-full text-[8px] text-white/50 font-bold tracking-widest border border-white/10 z-10 pointer-events-none">
             GIS ENGINE v2.5.2 | State-Preserved View
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebMap;
