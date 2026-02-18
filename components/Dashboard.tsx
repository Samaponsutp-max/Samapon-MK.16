
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Project, ProjectStatus, UserRole, ProjectCategory } from '../types';
import { 
  TrendingUp, 
  CheckCircle, 
  MapPin, 
  Briefcase, 
  Building2, 
  Route, 
  Droplets, 
  Zap,
  MoreHorizontal,
  Search,
  Mail,
  Bell
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  userRole?: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const stats = useMemo(() => {
    const totalBudget = 50000000; // Mocked for design parity
    const spentBudget = 35000000; // Mocked for design parity
    return {
      totalBudget,
      spentBudget,
      totalProjects: 120, // Mocked for design parity
      completionRate: 65 // Mocked for design parity
    };
  }, [projects]);

  const statusData = [
    { name: 'ยังไม่เริ่ม', value: 15, color: '#475569' },
    { name: 'กำลังก่อสร้าง', value: 75, color: '#f97316' },
    { name: 'ล่าช้า', value: 30, color: '#1e293b' },
  ];

  const categoryData = [
    { name: 'ถนน', budget: 45, color: '#334155' },
    { name: 'อาคาร', budget: 35, color: '#f97316' },
    { name: 'ไฟฟ้า', budget: 20, color: '#10b981' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl executive-shadow mb-2 border border-slate-100">
        <h2 className="text-xl font-extrabold text-[#002d62]">Dashboard</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 border-r pr-6 border-slate-100">
             <span className="text-sm font-medium">Sarabun</span>
             <Search size={18} />
          </div>
          <div className="flex items-center gap-4">
             <Mail size={18} className="text-slate-400 cursor-pointer" />
             <div className="relative">
                <Bell size={18} className="text-slate-400 cursor-pointer" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">1</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin&background=002d62&color=fff" alt="User" />
             </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#002d62] p-8 rounded-[24px] text-white relative overflow-hidden executive-shadow group">
          <p className="text-[11px] font-bold text-blue-200/70 uppercase tracking-widest mb-1">งบประมาณรวมทั้งปี:</p>
          <h3 className="text-3xl font-black">{stats.totalBudget.toLocaleString()}</h3>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp size={60} />
          </div>
        </div>
        
        <div className="bg-[#0ea5e9] p-8 rounded-[24px] text-white relative overflow-hidden executive-shadow group">
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1">เบิกจ่ายแล้ว:</p>
          <div className="flex items-center gap-2">
             <h3 className="text-3xl font-black">{stats.spentBudget.toLocaleString()}</h3>
             <CheckCircle size={20} className="text-white fill-white/20" />
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Briefcase size={60} />
          </div>
        </div>

        <div className="bg-[#002d62] p-8 rounded-[24px] text-white relative overflow-hidden executive-shadow group">
          <p className="text-[11px] font-bold text-blue-200/70 uppercase tracking-widest mb-1">โครงการทั้งหมด:</p>
          <h3 className="text-3xl font-black">{stats.totalProjects}</h3>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Building2 size={60} />
          </div>
        </div>

        <div className="bg-[#002d62] p-8 rounded-[24px] text-white relative overflow-hidden executive-shadow flex justify-between items-center group">
          <div>
            <p className="text-[11px] font-bold text-blue-200/70 uppercase tracking-widest mb-1">% โครงการแล้วเสร็จ:</p>
            <h3 className="text-3xl font-black">{stats.completionRate}%</h3>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - stats.completionRate/100)} className="text-blue-300" />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Map Card */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-100 executive-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h4 className="text-lg font-extrabold text-[#002d62]">แผนที่โครงการ</h4>
             <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
          </div>
          <div className="flex-1 bg-slate-50 rounded-2xl relative overflow-hidden min-h-[350px]">
             {/* Simple Map Visualization */}
             <div className="absolute inset-0 grayscale opacity-40">
                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d150000!2d103.65!3d16.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sth!2sth!4v1700000000000" className="w-full h-full border-none" />
             </div>
             {/* Map Pins (Simulation) */}
             <div className="absolute top-1/4 left-1/3 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-lg pulse animate-ping"></div>
             <div className="absolute top-1/4 left-1/3 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
             
             <div className="absolute bottom-1/2 right-1/4 bg-orange-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
             <div className="absolute top-1/2 left-1/2 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
             
             <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-100 shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">คำอธิบาย</p>
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Done
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div> In Progress
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Status and Category Charts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           {/* Project Status Donut */}
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 executive-shadow">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-lg font-extrabold text-[#002d62]">สถานะโครงการ</h4>
                 <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><PieIcon size={16} /></div>
              </div>
              <div className="h-48 w-full flex items-center">
                 <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                       <Pie data={statusData} innerRadius={50} outerRadius={70} dataKey="value">
                          {statusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="flex-1 space-y-3 pl-4">
                    {statusData.map(item => (
                       <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-[12px] font-bold text-slate-500">{item.name}</span>
                          </div>
                          <span className="text-[12px] font-black text-slate-900">{item.value}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Budget by Category Bars */}
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 executive-shadow flex-1">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-lg font-extrabold text-[#002d62]">งบประมาณตามประเภท</h4>
                 <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><BarChart2 size={16} /></div>
              </div>
              <div className="space-y-5">
                 {categoryData.map(item => (
                    <div key={item.name} className="space-y-1.5">
                       <div className="flex justify-between items-center text-[12px] font-bold text-slate-500">
                          <span>{item.name}</span>
                          <span className="text-slate-900">{item.budget}%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${item.budget}%`, backgroundColor: item.color }} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Latest Updates Table */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 executive-shadow">
         <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-extrabold text-[#002d62]">10 โครงการที่มีการอัปเดตล่าสุด</h4>
            <button className="text-xs font-bold text-blue-600 hover:underline">ดูโครงการทั้งหมด</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="pb-4 font-bold">โครงการ</th>
                     <th className="pb-4 font-bold text-center">สถานะ</th>
                     <th className="pb-4 font-bold text-right">ความก้าวหน้า</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {projects.slice(0, 5).map((p, i) => (
                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#002d62] shadow-sm">
                                {p.category === ProjectCategory.ROAD ? <Route size={18} /> : 
                                 p.category === ProjectCategory.DRAINAGE ? <Droplets size={18} /> : <Building2 size={18} />}
                             </div>
                             <div>
                                <p className="text-[13px] font-bold text-slate-900">{p.name}</p>
                                <p className="text-[10px] text-slate-400">อัปเดตเมื่อ: 10 พ.ค. 2567</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${
                                p.status === ProjectStatus.COMPLETED ? 'bg-emerald-500' : 
                                p.status === ProjectStatus.IN_PROGRESS ? 'bg-orange-500' : 'bg-slate-400'
                             }`} />
                             <span className="text-[12px] font-bold text-slate-600">{p.status}</span>
                          </div>
                       </td>
                       <td className="py-4 text-right font-black text-[#002d62]">{p.progressPercent}%</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

// Internal icon helpers for reusability within Dashboard
const PieIcon = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const BarChart2 = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default Dashboard;
