
import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Construction, 
  Wrench, 
  FileText, 
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  Map,
  Globe,
  Database,
  Info,
  ChevronRight,
  History,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร', 'เจ้าหน้าที่การเงิน'] },
    { id: 'projects', label: 'โครงการ', icon: ClipboardList, roles: ['Admin', 'กองช่าง', 'เจ้าหน้าที่การเงิน'] },
    { id: 'plan-database', label: 'งบประมาณ', icon: Database, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร'] },
    { id: 'web-map', label: 'แผนที่', icon: Map, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร'] },
    { id: 'asset-database', label: 'รายงาน', icon: FileText, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร'] },
    { id: 'audit-logs', label: 'บันทึกประวัติ', icon: History, roles: ['Admin'] },
    { id: 'users', label: 'จัดการผู้ใช้', icon: Users, roles: ['Admin'] },
    { id: 'settings', label: 'การตั้งค่าระบบ', icon: SettingsIcon, roles: ['Admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-[#002d62] text-white flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 flex flex-col items-center gap-4 bg-[#001f3f] border-b border-white/5">
        <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl relative overflow-hidden group">
          <img 
            src="https://raw.githubusercontent.com/ai-studio-cloud/assets/main/local-gov-logo.png" 
            onError={(e) => {
               (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Garuda_Embden.svg/800px-Garuda_Embden.svg.png'
            }}
            alt="Local Gov Logo" 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="text-center">
          <h1 className="text-sm font-extrabold leading-tight tracking-wide">Modern Civic Tech</h1>
          <p className="text-[10px] text-blue-300 font-medium tracking-tighter opacity-80 uppercase">Infrastructure Blueprint</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 opacity-50">Main Menu</p>
        {filteredItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-blue-300/50'} group-hover:text-white transition-colors`} />
                <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </button>
          );
        })}

        {userRole === 'Admin' && (
          <>
            <div className="h-px bg-white/10 my-4 mx-4"></div>
            <p className="px-4 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 opacity-50">Administrator</p>
            {filteredItems.slice(5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={`${isActive ? 'text-white' : 'text-blue-300/50'} group-hover:text-white transition-colors`} />
                    <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </button>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
           <div className="flex items-center gap-2 mb-2">
             <Shield size={12} className="text-blue-400" />
             <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">System Admin</p>
           </div>
           <p className="text-[12px] font-bold truncate">อบต.เหนือเมือง</p>
           <p className="text-[10px] text-white/40 mt-1">Version 2.0.1 Stable</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
