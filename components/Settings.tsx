
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Globe, 
  Shield, 
  Zap, 
  Bell, 
  Database,
  Eye,
  Lock,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'ทั่วไป', icon: Globe },
    { id: 'security', label: 'ความปลอดภัย', icon: Shield },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell },
    { id: 'ai', label: 'AI & Intelligence', icon: Zap },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-[#002d62] tracking-tight flex items-center gap-3">
             <div className="bg-[#002d62] p-2 rounded-xl text-white"><SettingsIcon size={24} /></div>
             การตั้งค่าระบบ
          </h2>
          <p className="text-slate-500 font-medium mt-1">กำหนดค่าเริ่มต้นและการทำงานหลักของซอฟต์แวร์</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#002d62] text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          บันทึกการตั้งค่า
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-[#002d62] shadow-sm border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-sm p-10">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อหน่วยงาน (ภาษาไทย)</label>
                  <input type="text" defaultValue="องค์การบริหารส่วนตำบลเหนือเมือง" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อหน่วยงาน (English)</label>
                  <input type="text" defaultValue="Nuea Mueang Subdistrict Administrative Organization" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ปีงบประมาณหลัก</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                    <option>2567</option>
                    <option>2568</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">เขตพื้นที่ (GIS Area ID)</label>
                  <input type="text" defaultValue="TH-450101" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                   <Smartphone size={16} className="text-blue-500" /> การแสดงผลหน้าจอ
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Dark Mode (โหมดมืดอัตโนมัติ)</p>
                      <p className="text-xs text-slate-400">ปรับเปลี่ยนสีตามการตั้งค่าของระบบปฏิบัติการ</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Compact View (แสดงข้อมูลแบบกระชับ)</p>
                      <p className="text-xs text-slate-400">ลดระยะห่างระหว่างรายการในตารางเพื่อแสดงผลข้อมูลมากขึ้น</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-amber-50 border border-amber-100 p-6 rounded-[24px] flex items-start gap-4 mb-6">
                  <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg"><Lock size={20} /></div>
                  <div>
                    <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Executive Security Protocol</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">ข้อมูลบางส่วนถูกจำกัดสิทธิ์เฉพาะผู้บริหารระดับสูงและแอดมินเท่านั้น การเปลี่ยนแปลงใดๆ จะถูกบันทึกลงใน Audit Logs โดยอัตโนมัติ</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 border border-slate-100 rounded-3xl bg-slate-50/50">
                    <div>
                      <h5 className="text-sm font-black text-slate-900">Two-Factor Authentication (2FA)</h5>
                      <p className="text-xs text-slate-400 mt-1 italic">บังคับใช้การยืนยันตัวตนสองชั้นสำหรับเจ้าหน้าที่ทุกคน</p>
                    </div>
                    <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black">Configure</button>
                  </div>
                  <div className="flex items-center justify-between p-6 border border-slate-100 rounded-3xl bg-slate-50/50">
                    <div>
                      <h5 className="text-sm font-black text-slate-900">Session Timeout</h5>
                      <p className="text-xs text-slate-400 mt-1 italic">ระยะเวลาในการออกจากระบบอัตโนมัติเมื่อไม่มีการเคลื่อนไหว</p>
                    </div>
                    <select className="bg-white border px-4 py-2 rounded-xl text-xs font-bold outline-none">
                       <option>30 นาที</option>
                       <option>1 ชั่วโมง</option>
                       <option>4 ชั่วโมง</option>
                    </select>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'ai' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 text-center py-10">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                   <Zap size={40} className="text-blue-600 animate-pulse" />
                   <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-20"></div>
                </div>
                <h3 className="text-xl font-black text-[#002d62]">AI Integration Control</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">เปิดใช้งานความสามารถในการวิเคราะห์ข้อมูลเชิงลึกด้วย Google Gemini Intelligence</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Core Engine</span>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <p className="text-sm font-bold text-slate-800">Gemini 2.5 Flash Lite</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase">Low Latency / High Speed</p>
                   </div>
                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Analysis Mode</span>
                         <Eye size={16} className="text-indigo-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">Visual Diagnostics</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase">Image-to-Tech Analysis</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border-b-4 border-emerald-800">
              <CheckCircle size={24} />
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Configuration Saved</p>
                <p className="text-xs opacity-80">บันทึกการตั้งค่าลงในฐานข้อมูลหลักเรียบร้อยแล้ว</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
