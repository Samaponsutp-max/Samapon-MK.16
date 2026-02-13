
import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Construction, 
  Wrench, 
  FileText, 
  Settings,
  ShieldCheck,
  Users,
  Map,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม (Dashboard)', icon: LayoutDashboard, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร', 'เจ้าหน้าที่การเงิน'] },
    { id: 'web-map', label: 'แผนที่ฐานข้อมูล (Map)', icon: Globe, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร'] },
    { id: 'plan-database', label: 'แผนพัฒนาท้องถิ่น', icon: Map, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร'] },
    { id: 'projects', label: 'โครงการงบประมาณ', icon: ClipboardList, roles: ['Admin', 'กองช่าง', 'เจ้าหน้าที่การเงิน'] },
    { id: 'form', label: 'เพิ่มข้อมูลโครงการ', icon: FileText, roles: ['Admin', 'กองช่าง'] },
    { id: 'tracking', label: 'ติดตามการก่อสร้าง', icon: Construction, roles: ['Admin', 'กองช่าง'] },
    { id: 'maintenance', label: 'งานซ่อมบำรุง', icon: Wrench, roles: ['Admin', 'กองช่าง', 'ผู้บริหาร'] },
    { id: 'users', label: 'จัดการผู้ใช้งาน', icon: Users, roles: ['Admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40 overflow-y-auto">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none tracking-tight">InfraGuard</h1>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1 block">Municipal OS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 mb-2 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium text-[14px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">Logged in as</p>
          <p className="text-sm font-bold text-white mb-0.5">Admin User</p>
          <p className="text-[10px] text-blue-400 font-semibold">{userRole}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
