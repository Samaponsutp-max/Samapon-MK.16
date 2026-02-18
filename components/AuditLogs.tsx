
import React, { useState, useEffect, useCallback } from 'react';
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
  Info,
  Activity,
  Pause,
  Play,
  Zap,
  Cpu
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

const INITIAL_LOGS: AuditEntry[] = [
  { id: 'LOG-1024', timestamp: new Date().toLocaleString('th-TH'), user: 'สมชาย รักงาน', role: 'Admin', action: 'UPDATE_ASSET', resource: 'AST-2560-RD-01', details: 'ปรับเปลี่ยนสภาพสินทรัพย์จาก FAIR เป็น POOR', status: 'SUCCESS' },
  { id: 'LOG-1023', timestamp: new Date(Date.now() - 50000).toLocaleString('th-TH'), user: 'วิรัตน์ กองช่าง', role: 'Engineer', action: 'ADD_MAINTENANCE', resource: 'AST-2555-BLD-04', details: 'เพิ่มบันทึกการซ่อมบำรุงประจำเดือน', status: 'SUCCESS' },
  { id: 'LOG-1022', timestamp: new Date(Date.now() - 120000).toLocaleString('th-TH'), user: 'System AI', role: 'Core', action: 'GROUNDING_SEARCH', resource: 'WebMap_GIS', details: 'เรียกใช้งาน Maps Grounding Tool สำหรับวิเคราะห์พื้นที่', status: 'SUCCESS' },
  { id: 'LOG-1021', timestamp: new Date(Date.now() - 300000).toLocaleString('th-TH'), user: 'Unknown IP', role: 'External', action: 'LOGIN_FAILED', resource: 'System_Access', details: 'พยายามเข้าสู่ระบบด้วยรหัสผ่านที่ผิด (IP: 192.168.1.45)', status: 'WARNING' },
];

const USERS = ['สมชาย รักงาน', 'วิรัตน์ กองช่าง', 'แอดมิน กองช่าง', 'System AI', 'บอท ตรวจสอบ'];
const ACTIONS = ['LOGIN_SUCCESS', 'UPDATE_PROJECT', 'EXPORT_DATA', 'AI_SUMMARY', 'DB_BACKUP', 'GIS_SYNC', 'EDIT_PLAN'];
const RESOURCES = ['PROJECT-67-001', 'ASSET-DB', 'GIS_LAYER_SATELLITE', 'FINANCE_REPORT', 'PLAN_2568'];
const STATUSES: ('SUCCESS' | 'WARNING' | 'CRITICAL')[] = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'WARNING', 'SUCCESS'];

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [logCounter, setLogCounter] = useState(1025);

  // Simulate incoming real-time logs
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newLog: AuditEntry = {
        id: `LOG-${logCounter}`,
        timestamp: new Date().toLocaleString('th-TH'),
        user: USERS[Math.floor(Math.random() * USERS.length)],
        role: 'Authorized',
        action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
        resource: RESOURCES[Math.floor(Math.random() * RESOURCES.length)],
        details: 'กิจกรรมระบบอัตโนมัติ ตรวจพบการเข้าถึงข้อมูลพิกัดเชิงพื้นที่แบบเรียลไทม์',
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
      setLogCounter(c => c + 1);
    }, 7000); // New log every 7 seconds

    return () => clearInterval(interval);
  }, [isLive, logCounter]);

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-[#002d62] p-3 rounded-2xl text-white shadow-xl"><History size={24} /></div>
             <h2 className="text-3xl font-black text-[#002d62] tracking-tight">System Audit Logs</h2>
          </div>
          <p className="text-slate-500 font-medium">Monitoring kernel events and user activities across the infrastructure cloud.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${isLive ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isLive ? 'Live Stream Active' : 'Feed Paused'}
              </span>
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`p-1.5 rounded-lg transition-all ${isLive ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                {isLive ? <Pause size={14} /> : <Play size={14} />}
              </button>
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
             <Download size={18} /> Export CSV
           </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#002d62] p-8 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1 opacity-70">Stream Volume</p>
            <h3 className="text-4xl font-black tracking-tighter">{logs.length} <span className="text-sm font-bold opacity-40">Records</span></h3>
            <Activity className="absolute bottom-[-10px] right-[-10px] text-blue-400/10" size={100} />
         </div>
         <div className="bg-amber-500 p-8 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
            <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest mb-1 opacity-70">Total Alerts</p>
            <h3 className="text-4xl font-black tracking-tighter">
              {logs.filter(l => l.status !== 'SUCCESS').length}
            </h3>
            <ShieldAlert className="absolute bottom-[-10px] right-[-10px] text-white/20" size={100} />
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 relative overflow-hidden group shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engine Health</p>
            <div className="flex items-center gap-3">
              <h3 className="text-4xl font-black text-[#002d62]">99.8<span className="text-lg opacity-40">%</span></h3>
              <div className="flex flex-col">
                 <Zap size={14} className="text-emerald-500 mb-1" />
                 <span className="text-[8px] font-black text-emerald-500 uppercase">Synchronized</span>
              </div>
            </div>
         </div>
      </div>

      {/* Main Log Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center gap-4 justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search actor, action, or resource..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
              />
           </div>
           <div className="flex gap-2">
              <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
                 <Calendar size={16} /> Date Range
              </button>
              <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
                 <Filter size={16} /> Security Level
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <tr>
                   <th className="px-8 py-5">System Timestamp</th>
                   <th className="px-8 py-5">Actor Interface</th>
                   <th className="px-8 py-5">Event Action</th>
                   <th className="px-8 py-5">Target Endpoint</th>
                   <th className="px-8 py-5 text-center">Outcome</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50 text-[13px]">
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50/50 transition-all cursor-pointer group animate-in slide-in-from-top-4 duration-500">
                      <td className="px-8 py-6">
                         <p className="font-bold text-slate-700">{log.timestamp.split(' ')[1]}</p>
                         <p className="text-[10px] text-slate-400 font-black tracking-tighter mt-1">{log.id}</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#002d62] shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                               {log.user === 'System AI' ? <Cpu size={18} /> : <User size={18} />}
                            </div>
                            <div>
                               <p className="font-black text-slate-800 leading-none mb-1.5">{log.user}</p>
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{log.role}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                           <Terminal size={14} className="text-slate-300" />
                           <span className="font-black text-[#002d62] text-xs tracking-tight">{log.action}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black text-slate-500 border border-slate-200 group-hover:border-blue-200 transition-colors">
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
                    <tr className="bg-slate-50/20 border-b border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                       <td colSpan={5} className="px-8 py-4">
                          <div className="flex items-center gap-3 text-slate-400">
                             <Info size={14} className="shrink-0 text-blue-400" />
                             <p className="text-xs font-bold italic">Kernel Payload: {log.details}</p>
                          </div>
                       </td>
                    </tr>
                  </React.Fragment>
                ))}
             </tbody>
          </table>
        </div>

        <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Payload: {filteredLogs.length} Entries</p>
           <div className="flex items-center gap-4">
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-blue-600 transition-all shadow-sm"><ChevronLeft size={20} /></button>
              <div className="flex items-center gap-2">
                 <button className="w-10 h-10 bg-[#002d62] text-white rounded-xl text-xs font-black shadow-lg">1</button>
                 <button className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm">2</button>
              </div>
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-blue-600 transition-all shadow-sm"><ChevronRight size={20} /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
