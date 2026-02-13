
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
  Camera,
  ChevronRight,
  Globe
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
    "กำลังประมวลผลพิกัดภูมิศาสตร์ (Geocoding)...",
    "ดึงข้อมูลภาพถ่ายดาวเทียมความละเอียดสูงจากคลังข้อมูล...",
    "วิเคราะห์รายละเอียดอาคารและสภาพแวดล้อม...",
    "กำลังสร้างภาพจำลองพื้นที่ก่อสร้าง (Rendering 4K)...",
    "ปรับแต่งสีธรรมชาติและความคมชัดขั้นสุดท้าย...",
    "ระบบประมวลผลเสร็จสมบูรณ์ พร้อมแสดงผล"
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStep(prev => (prev + 1) % generationMessages.length);
      }, 3500);
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
      alert("เกิดข้อผิดพลาดในการสร้างภาพ กรุณาตรวจสอบ API Key หรือลองอีกครั้งภายหลัง");
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">แดชบอร์ดสรุปภาพรวม</h2>
          <p className="text-slate-500 font-medium">ข้อมูลสรุปงบประมาณและสถานะโครงการโครงสร้างพื้นฐานปี 2567</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 text-sm font-bold text-slate-600">
          <Globe size={18} className="text-blue-500" />
          สถานะข้อมูลล่าสุด: วันนี้ {new Date().toLocaleTimeString('th-TH')}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'งบประมาณรวม', val: `฿${(kpis.totalBudget / 1000000).toFixed(2)}M`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', sub: '+12% จากปีที่แล้ว' },
          { label: 'โครงการแล้วเสร็จ', val: `${kpis.completed} โครงการ`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `คิดเป็น ${kpis.completionRate}%` },
          { label: 'กำลังดำเนินการ', val: `${kpis.inProgress} โครงการ`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'ตามแผนงาน 92%' },
          { label: 'โครงการล่าช้า', val: `${kpis.delayed} โครงการ`, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', sub: 'ต้องเร่งตรวจสอบ' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} ${card.color} p-3 rounded-2xl`}>
                <card.icon size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{card.val}</h3>
            <p className="text-xs font-bold text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-blue-500" /> สัดส่วนสถานะโครงการ
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart size={18} className="text-blue-500" /> งบประมาณแยกประเภท (ล้านบาท)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBudgetData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="budget" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Map Preview Area */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <MapIcon size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">ระบบแผนที่เชิงพื้นที่ (GIS Viewer)</h4>
              <p className="text-xs text-slate-400 font-medium">สำรวจพื้นที่โครงการแบบ Dynamic Real-time</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMapModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            <Maximize2 size={16} />
            สำรวจแผนที่เต็มจอ
          </button>
        </div>
        
        <div className="aspect-[21/9] bg-slate-950 rounded-[32px] flex items-center justify-center relative overflow-hidden group border border-slate-200 shadow-inner">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="relative text-center p-10 bg-white/10 backdrop-blur-2xl rounded-[40px] border border-white/20 shadow-2xl max-w-md mx-4 transform group-hover:scale-[1.02] transition-transform duration-700">
            <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-indigo-500/30 rotate-12">
               <Globe size={32} />
            </div>
            <h5 className="text-white font-black text-xl mb-2 tracking-tight">GIS Dynamic Mapping</h5>
            <p className="text-indigo-200/70 text-sm mb-6 leading-relaxed">เชื่อมต่อข้อมูลพิกัดโครงการและชั้นข้อมูลภูมิสารสนเทศผ่านดาวเทียมความแม่นยำสูง</p>
            
            <div className="flex justify-center gap-4 mb-8">
              {[
                { c: 'bg-emerald-500', t: 'ปกติ' },
                { c: 'bg-amber-500', t: 'กำลังก่อสร้าง' },
                { c: 'bg-rose-500', t: 'แจ้งเหตุขัดข้อง' }
              ].map((dot, i) => (
                <div key={i} className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${dot.c} shadow-sm shadow-black/50`}></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{dot.t}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsMapModalOpen(true)}
              className="w-full bg-white text-slate-900 text-sm font-black py-4 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              <Search size={18} />
              เปิดระบบสำรวจพื้นที่ AI
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen GIS Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-500">
          {/* Header */}
          <div className="bg-slate-900 border-b border-white/5 p-5 flex items-center justify-between text-white shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/20">
                <MapIcon size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">InfraGuard GIS PRO</h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ระบบประมวลผลภูมิสารสนเทศ • อัปเดตเรียลไทม์
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleGenerateSatellite}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-3 rounded-2xl text-xs font-black shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                AI SATELLITE ENGINE (4K)
              </button>
              <div className="h-8 w-px bg-white/10 mx-2"></div>
              <button 
                onClick={() => {
                  setIsMapModalOpen(false);
                  setGeneratedMap(null);
                }}
                className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white border border-white/5"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex overflow-hidden">
            {/* Sidebar Controls */}
            <aside className="w-80 bg-slate-900/50 backdrop-blur-3xl border-r border-white/5 p-8 overflow-y-auto hidden lg:flex flex-col gap-8">
              <section>
                <h4 className="text-white text-xs font-black mb-6 flex items-center gap-3 tracking-widest uppercase opacity-60">
                  <Layers size={16} className="text-indigo-500" /> ข้อมูลเชิงพื้นที่ (Layers)
                </h4>
                
                <div className="space-y-4">
                  {[
                    { name: 'ขอบเขตปกครองตำบล', active: true },
                    { name: 'หมุดตำแหน่งโครงการ', active: true },
                    { name: 'โครงข่ายการจราจร', active: false },
                    { name: 'จุดสำรวจทรัพยากรน้ำ', active: true },
                  ].map((layer, idx) => (
                    <label key={idx} className="flex items-center justify-between group cursor-pointer bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{layer.name}</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={layer.active} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-white text-xs font-black mb-6 tracking-widest uppercase opacity-60">ไฮไลท์โครงการสำคัญ</h4>
                <div className="space-y-3">
                  {projects.map(p => (
                    <div key={p.id} className="p-4 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-indigo-500 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-black text-indigo-400 uppercase">{p.projectCode}</p>
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === ProjectStatus.COMPLETED ? 'bg-emerald-500' : 'bg-amber-500'} shadow-sm shadow-black`}></div>
                      </div>
                      <p className="text-xs text-white font-bold leading-tight line-clamp-2 mb-3">{p.name}</p>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase">
                        <Navigation size={10} /> {p.area}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>

            {/* Map Main Canvas */}
            <main className="flex-1 bg-black relative flex items-center justify-center p-4">
               {/* Progress Overlay During Generation */}
               {isGenerating && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-md w-full">
                       <div className="relative mb-10">
                          <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full"></div>
                          <div className="relative bg-slate-900 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border border-white/10">
                             <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                          </div>
                          <Sparkles className="w-10 h-10 text-indigo-300 absolute -top-4 -right-4 animate-bounce" />
                       </div>
                       
                       <h3 className="text-white font-black text-2xl mb-4 tracking-tight">AI กำลังสร้างภาพแผนที่อัจฉริยะ</h3>
                       
                       <div className="bg-white/5 p-4 rounded-3xl border border-white/10 mb-8 min-h-[80px] flex items-center justify-center">
                          <p className="text-indigo-100/80 text-sm font-medium animate-pulse">
                            {generationMessages[generationStep]}
                          </p>
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-4 border border-white/5 p-0.5">
                          <div 
                            className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                            style={{ width: `${((generationStep + 1) / generationMessages.length) * 100}%` }}
                          ></div>
                       </div>
                       <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span>กำลังประมวลผล</span>
                          <span>{Math.round(((generationStep + 1) / generationMessages.length) * 100)}%</span>
                       </div>
                    </div>
                 </div>
               )}

               {/* Generated Satellite Result */}
               {generatedMap ? (
                 <div className="absolute inset-0 z-40 animate-in fade-in zoom-in duration-1000 overflow-hidden rounded-3xl md:rounded-none">
                   <img src={generatedMap} alt="AI Generated Satellite View" className="w-full h-full object-cover" />
                   
                   {/* Results UI Overlays */}
                   <div className="absolute top-8 left-8 flex flex-col gap-3">
                     <div className="bg-slate-900/60 backdrop-blur-xl text-white px-5 py-2.5 rounded-full text-xs font-black border border-white/20 flex items-center gap-3 shadow-2xl">
                       <Camera size={16} className="text-indigo-400" />
                       AI-GENERATED SITE ANALYSIS (4K UHD)
                     </div>
                     <div className="bg-black/40 backdrop-blur-md text-white/70 px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/5">
                       SOURCE: GEMINI IMAGEN ENGINE v2.5
                     </div>
                   </div>

                   <div className="absolute bottom-8 left-8 flex items-center gap-3">
                     <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = generatedMap;
                          link.download = `infra-satellite-${Date.now()}.png`;
                          link.click();
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-900 px-6 py-4 rounded-[24px] text-sm font-black transition-all flex items-center gap-3 shadow-2xl active:scale-95"
                     >
                       <Download size={20} />
                       ดาวน์โหลดแผนที่ความละเอียดสูง
                     </button>
                     <button 
                        onClick={() => setGeneratedMap(null)}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-4 rounded-[24px] border border-white/10 transition-all shadow-2xl"
                        title="ปิดมุมมองนี้"
                     >
                       <X size={20} />
                     </button>
                   </div>
                 </div>
               ) : null}

               {/* Default Simulated Map Surface */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
               <div className="absolute inset-0 pointer-events-none" style={{ 
                 background: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
               }}></div>

               {/* Interactive Markers Over Basic Surface */}
               {projects.map((p, i) => (
                 <div 
                   key={p.id} 
                   className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-700 cursor-pointer group"
                   style={{ 
                     top: `${25 + (i * 18)}%`, 
                     left: `${35 + (i * 15)}%` 
                   }}
                 >
                   <div className="flex flex-col items-center">
                     <div className="mb-2 bg-white text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-2xl whitespace-nowrap -translate-y-2 group-hover:translate-y-0 border border-slate-200">
                       {p.name}
                     </div>
                     <div className={`w-8 h-8 rounded-[12px] border-2 border-white flex items-center justify-center shadow-xl transition-all group-hover:scale-125 group-hover:rotate-12 ${
                       p.status === ProjectStatus.COMPLETED ? 'bg-emerald-500' : 'bg-indigo-600'
                     }`}>
                       <Navigation size={14} className="text-white rotate-45" />
                     </div>
                   </div>
                 </div>
               ))}

               {/* Floating Map Controls */}
               <div className="absolute bottom-10 right-10 flex flex-col gap-3">
                 <button className="w-14 h-14 bg-slate-900 text-white rounded-[24px] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center border border-white/5 font-black text-xl">+</button>
                 <button className="w-14 h-14 bg-slate-900 text-white rounded-[24px] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center border border-white/5 font-black text-xl">-</button>
                 <div className="h-4"></div>
                 <button className="w-14 h-14 bg-indigo-600 text-white rounded-[24px] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-indigo-500/30">
                   <Navigation size={24} />
                 </button>
               </div>

               {/* Status Bar */}
               <div className="absolute bottom-6 left-10 bg-slate-900/60 backdrop-blur-xl px-6 py-3 rounded-[20px] border border-white/10 text-[10px] text-slate-400 flex gap-6 font-black uppercase tracking-widest shadow-2xl">
                 <span className="flex items-center gap-2">LAT: <span className="text-white">13.7563° N</span></span>
                 <span className="flex items-center gap-2">LON: <span className="text-white">100.5018° E</span></span>
                 <span className="text-indigo-400">มาตราส่วน 1:1,000</span>
               </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
