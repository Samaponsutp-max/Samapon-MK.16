
import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  User, 
  Terminal, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

const MOCK_LOGS: AuditEntry[] = [
  { id: 'LOG-001', timestamp: '22 พ.ค. 2567 14:30:12', user: 'สมชาย รักงาน', role: 'Admin', action: 'UPDATE_ASSET', resource: 'AST-2560-RD-01', details: 'ปรับเปลี่ยนสภาพสินทรัพย์จาก FAIR เป็น POOR', status: 'SUCCESS' },
  { id: 'LOG-002', timestamp: '22 พ.ค. 2567 14:15:05', user: 'วิรัตน์ กองช่าง', role: 'Engineer', action: 'ADD_MAINTENANCE', resource: 'AST-2555-BLD-04', details: 'เพิ่มบันทึกการซ่อมบำรุงประจำเดือน', status: 'SUCCESS' },
  { id: 'LOG-003', timestamp: '22 พ.ค. 2567 13:45:22', user: 'System AI', role: 'Core', action: 'GROUNDING_SEARCH', resource: 'WebMap_GIS', details: 'เรียกใช้งาน Maps Grounding Tool สำหรับวิเคราะห์พื้นที่', status: 'SUCCESS' },
  { id: 'LOG-004', timestamp: '22 พ.ค. 2567 11:20:01', user: 'Unknown IP', role: 'External', action: 'LOGIN_FAILED', resource: 'System_Access', details: 'พยายามเข้าสู่ระบบด้วยรหัสผ่านที่ผิด (IP: 192.168.1.45)', status: 'WARNING' },
  { id: 'LOG-005', timestamp: '21 พ.ค. 2567 16:55:40', user: 'สมชาย รักงาน', role: 'Admin', action: 'DELETE_USER', resource: 'U005', details: 'ลบบัญชีผู้ใช้งานชั่วคราวออกจาระบบ', status: 'CRITICAL' },
];

const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = MOCK_LOGS.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-black text-[#002d62] tracking-tight flex items-center gap-4">
             <div className="bg-[#002d62] p-3 rounded-2xl text-white shadow-xl"><History size={24} /></div>
             บันทึกประวัติการใช้งาน (System Audit Logs)
          </h2>
          <p className="text-slate-500 font-medium mt-1">ตรวจสอบกิจกรรมย้อนหลังและการเปลี่ยนแปลงข้อมูลภายในระบบ</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
             <Download size={18} /> Export Log (.csv)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#002d62] p-8 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1 opacity-70">Log Entries Today</p>
            <h3 className="text-4xl font-black">156</h3>
            <Terminal className="absolute top-4 right-4 text-blue-400/20" size={60} />
         </div>
         <div className="bg-amber-500 p-8 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
            <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest mb-1 opacity-70">Security Alerts</p>
            <h3 className="text-4xl font-black">3</h3>
            <ShieldAlert className="absolute top-4 right-4 text-white/20" size={60} />
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 relative overflow-hidden group shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync Status</p>
            <h3 className="text-4xl font-black text-[#002d62]">Success</h3>
            <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               Database Connection Active
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center gap-4 justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาตามผู้ใช้, กิจกรรม, หรือรหัสทรัพยากร..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              />
           </div>
           <div className="flex gap-2">
              <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                 <Calendar size={16} /> วันที่ดำเนินงาน
              </button>
              <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                 <Filter size={16} /> กรองสถานะ
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <tr>
                   <th className="px-8 py-5">Timestamp</th>
                   <th className="px-8 py-5">Actor / User</th>
                   <th className="px-8 py-5">Action Type</th>
                   <th className="px-8 py-5">Target Resource</th>
                   <th className="px-8 py-5 text-center">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50 text-[13px]">
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                      <td className="px-8 py-6">
                         <p className="font-bold text-slate-600">{log.timestamp}</p>
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">{log.id}</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#002d62] shadow-inner">
                               <User size={16} />
                            </div>
                            <div>
                               <p className="font-black text-slate-800 leading-none mb-1">{log.user}</p>
                               <p className="text-[10px] font-bold text-blue-500 uppercase opacity-60 tracking-widest">{log.role}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 font-black text-[#002d62] text-xs">
                         {log.action}
                      </td>
                      <td className="px-8 py-6">
                         <span className="bg-slate-100 px-3 py-1 rounded-lg text-[11px] font-mono font-black text-slate-500 border border-slate-200">
                           {log.resource}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                           log.status === 'WARNING' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                           'bg-rose-50 text-rose-600 border border-rose-100'
                         }`}>
                           {log.status}
                         </span>
                      </td>
                    </tr>
                    <tr className="bg-slate-50/20 border-b border-slate-50">
                       <td colSpan={5} className="px-8 py-4">
                          <div className="flex items-center gap-3 text-slate-400">
                             <Info size={14} className="shrink-0" />
                             <p className="text-xs font-medium italic">Details: {log.details}</p>
                          </div>
                       </td>
                    </tr>
                  </React.Fragment>
                ))}
             </tbody>
          </table>
        </div>

        <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing 5 of 1,244 entries</p>
           <div className="flex items-center gap-4">
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-blue-600 transition-all shadow-sm"><ChevronLeft size={20} /></button>
              <div className="flex items-center gap-2">
                 <button className="w-10 h-10 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg">1</button>
                 <button className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm">2</button>
                 <button className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm">3</button>
              </div>
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-blue-600 transition-all shadow-sm"><ChevronRight size={20} /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
