
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Project, ProjectStatus, ProjectCategory } from '../types';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Map as MapIcon,
  Maximize2,
  X,
  Layers,
  Search,
  Navigation,
  Sparkles,
  Download,
  Loader2,
  Camera
} from 'lucide-react';
import { generateSatelliteImage } from '../services/geminiService';

interface DashboardProps {
  projects: Project[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMap, setGeneratedMap] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const generationMessages = [
    "กำลังประมวลผลพิกัดภูมิศาสตร์...",
    "ดึงข้อมูลภาพถ่ายดาวเทียมความละเอียดสูง...",
    "กำลังสังเคราะห์รายละเอียดถนนและอาคาร...",
    "ปรับแต่งสีธรรมชาติและความคมชัดระดับ 4K...",
    "กำลังส่งออกภาพแผนที่ดิจิทัล..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStep(prev => (prev + 1) % generationMessages.length);
      }, 3000);
    } else {
      setGenerationStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerateSatellite = async () => {
    setIsGenerating(true);
    setGeneratedMap(null);
    try {
      const prompt = `High-resolution satellite map, top-down view of a Thai sub-district in Thailand, showing roads, buildings, houses, agricultural areas, and water bodies clearly. Natural colors, 4K resolution, realistic satellite photography style, no text, no icons.`;
      const imageUrl = await generateSatelliteImage(prompt);
      setGeneratedMap(imageUrl);
    } catch (error) {
      console.error("Failed to generate map:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const kpis = useMemo(() => {
    const totalBudget = projects.reduce((acc, p) => acc + (p.budgetActual || p.budgetEstimated), 0);
    const completed = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const inProgress = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
    const delayed = projects.filter(p => p.status === ProjectStatus.DELAYED).length;

    return {
      totalBudget,
      totalCount: projects.length,
      completed,
      inProgress,
      delayed,
      completionRate: projects.length ? Math.round((completed / projects.length) * 100) : 0
    };
  }, [projects]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const categoryBudgetData = useMemo(() => {
    const data: Record<string, number> = {};
    projects.forEach(p => {
      data[p.category] = (data[p.category] || 0) + (p.budgetActual || p.budgetEstimated);
    });
    return Object.entries(data).map(([name, budget]) => ({ name, budget: budget / 1000000 }));
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">แดชบอร์ดสรุปภาพรวม</h2>
          <p className="text-slate-500">ข้อมูลสรุปงบประมาณและสถานะโครงการโครงสร้างพื้นฐาน</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
          ปีงบประมาณ 2567
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-sm text-slate-500">งบประมาณรวมทั้งสิ้น</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ฿{(kpis.totalBudget / 1000000).toFixed(2)}M
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <CheckCircle size={20} />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{kpis.completionRate}%</span>
          </div>
          <p className="text-sm text-slate-500">โครงการแล้วเสร็จ</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.completed} โครงการ</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500">กำลังดำเนินการ</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.inProgress} โครงการ</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500">โครงการล่าช้า</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.delayed} โครงการ</h3>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="font-semibold text-slate-800 mb-4">สัดส่วนสถานะโครงการ</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="font-semibold text-slate-800 mb-4">งบประมาณแยกตามประเภท (ล้านบาท)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBudgetData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Map Preview Area */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapIcon className="text-blue-600" size={20} />
            <h4 className="font-semibold text-slate-800">แผนที่ตำแหน่งโครงการ (GIS Viewer)</h4>
          </div>
          <button 
            onClick={() => setIsMapModalOpen(true)}
            className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
          >
            <Maximize2 size={14} />
            เปิดแบบเต็มหน้าจอ
          </button>
        </div>
        <div className="aspect-[21/9] bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group border border-slate-200">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute inset-0 pointer-events-none border border-slate-300/20" style={{ background: 'linear-gradient(to right, transparent 49.5%, #e2e8f0 49.5%, #e2e8f0 50.5%, transparent 50.5%), linear-gradient(to bottom, transparent 49.5%, #e2e8f0 49.5%, #e2e8f0 50.5%, transparent 50.5%)', backgroundSize: '100px 100px' }}></div>

          <div className="relative text-center p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl max-w-md mx-auto transform group-hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-200">
               <Navigation size={24} className="rotate-45" />
            </div>
            <p className="text-slate-800 font-bold text-lg mb-1">GIS Dynamic Mapping</p>
            <p className="text-slate-500 text-xs mb-4">เชื่อมต่อข้อมูลพิกัดโครงการแบบเรียลไทม์ผ่านดาวเทียม</p>
            
            <div className="flex justify-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="text-[10px] font-bold text-slate-600">ปกติ</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div><span className="text-[10px] font-bold text-slate-600">กำลังทำ</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-slate-600">แจ้งซ่อม</span></div>
            </div>

            <button 
              onClick={() => setIsMapModalOpen(true)}
              className="mt-6 w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Search size={14} />
              สำรวจพื้นที่ก่อสร้าง
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen GIS Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <MapIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold">InfraGuard GIS Pro - ระบบแผนที่เชิงลึก</h3>
                <p className="text-[10px] text-slate-400">มาตราส่วน 1:5,000 • อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleGenerateSatellite}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
              >
                <Sparkles size={16} />
                AI Satellite View (4K)
              </button>
              <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                <Search size={16} className="text-slate-500" />
                <input type="text" placeholder="ค้นหาตามพิกัด..." className="bg-transparent border-none outline-none text-xs w-48" />
              </div>
              <button 
                onClick={() => {
                  setIsMapModalOpen(false);
                  setGeneratedMap(null);
                }}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex">
            {/* Sidebar Controls */}
            <div className="w-72 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 p-6 overflow-y-auto hidden lg:block">
              <h4 className="text-white text-sm font-bold mb-6 flex items-center gap-2">
                <Layers size={16} className="text-blue-500" />
                เลเยอร์ข้อมูล (Layers)
              </h4>
              
              <div className="space-y-4">
                {[
                  { name: 'เขตพื้นที่เทศบาล', active: true },
                  { name: 'โครงการก่อสร้างใหม่', active: true },
                  { name: 'งานซ่อมบำรุงทาง', active: false },
                  { name: 'จุดติดตั้งไฟฟ้าสาธารณะ', active: true },
                  { name: 'ท่อระบายน้ำหลัก', active: false },
                ].map((layer, idx) => (
                  <label key={idx} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{layer.name}</span>
                    <input type="checkbox" defaultChecked={layer.active} className="accent-blue-600 w-4 h-4 rounded" />
                  </label>
                ))}
              </div>

              <div className="mt-12">
                <h4 className="text-white text-sm font-bold mb-4">รายการโครงการในพื้นที่</h4>
                <div className="space-y-2">
                  {projects.map(p => (
                    <div key={p.id} className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group">
                      <p className="text-[10px] font-bold text-blue-500 mb-0.5 group-hover:text-blue-400">{p.projectCode}</p>
                      <p className="text-[11px] text-white font-medium truncate">{p.name}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === ProjectStatus.COMPLETED ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                        <span className="text-[9px] text-slate-500">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Interactive Map Surface */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
               {isGenerating ? (
                 <div className="text-center p-12 max-w-md z-50">
                    <div className="relative mb-8">
                       <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto opacity-20" />
                       <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">กำลังสร้างภาพถ่ายดาวเทียม AI</h3>
                    <p className="text-slate-400 text-sm mb-6 h-10 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {generationMessages[generationStep]}
                    </p>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className="bg-blue-500 h-full transition-all duration-1000 ease-out" 
                         style={{ width: `${((generationStep + 1) / generationMessages.length) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ) : generatedMap ? (
                 <div className="absolute inset-0 z-40 animate-in fade-in zoom-in duration-1000">
                   <img src={generatedMap} alt="AI Generated Satellite View" className="w-full h-full object-cover" />
                   <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-2">
                     <Camera size={12} />
                     AI GENERATED SITE IMAGERY (4K)
                   </div>
                   <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedMap;
                      link.download = `satellite-site-map-${Date.now()}.png`;
                      link.click();
                    }}
                    className="absolute bottom-4 left-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 transition-all flex items-center gap-2 text-xs font-bold"
                   >
                     <Download size={16} />
                     ดาวน์โหลดภาพ 4K
                   </button>
                   <button 
                    onClick={() => setGeneratedMap(null)}
                    className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-xl border border-white/10"
                   >
                     <X size={20} />
                   </button>
                 </div>
               ) : null}

               {/* Satellite Background Simulation */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
               
               {/* Map Grid */}
               <div className="absolute inset-0 pointer-events-none" style={{ 
                 background: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
               }}></div>

               {/* Simulated Map Markers */}
               {projects.map((p, i) => (
                 <div 
                   key={p.id} 
                   className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-500 cursor-pointer group"
                   style={{ 
                     top: `${20 + (i * 15)}%`, 
                     left: `${30 + (i * 20)}%` 
                   }}
                 >
                   <div className="flex flex-col items-center">
                     <div className="mb-2 bg-white text-slate-900 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                       {p.name}
                     </div>
                     <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                       p.status === ProjectStatus.COMPLETED ? 'bg-green-500' : 'bg-blue-600'
                     }`}>
                       <Navigation size={12} className="text-white rotate-45" />
                     </div>
                   </div>
                 </div>
               ))}

               {/* Map Navigation Controls UI Overlay */}
               <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                 <button className="w-10 h-10 bg-slate-800 text-white rounded-lg shadow-xl hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700">+</button>
                 <button className="w-10 h-10 bg-slate-800 text-white rounded-lg shadow-xl hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700">-</button>
                 <div className="h-4"></div>
                 <button className="w-10 h-10 bg-blue-600 text-white rounded-lg shadow-xl hover:bg-blue-700 transition-colors flex items-center justify-center">
                   <Navigation size={20} />
                 </button>
               </div>

               {/* Scale & Coordinates Footer */}
               <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-500 flex gap-4 font-mono">
                 <span>LAT: 13.7563° N</span>
                 <span>LON: 100.5018° E</span>
                 <span className="text-blue-500">SCALE: 1:5,000</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
