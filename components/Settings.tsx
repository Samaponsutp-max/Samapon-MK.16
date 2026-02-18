
import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Globe, 
  Shield, 
  Zap, 
  Bell, 
  Database,
  Smartphone,
  CheckCircle,
  Key,
  Server,
  Code,
  Download,
  Upload,
  RefreshCcw,
  History,
  Lock,
  Type
} from 'lucide-react';
import { SystemSettings, UserRole, SystemSnapshot } from '../types';

interface SettingsProps {
  globalSettings: SystemSettings;
  setGlobalSettings: (settings: SystemSettings) => void;
  userRole: UserRole;
}

const Settings: React.FC<SettingsProps> = ({ globalSettings, setGlobalSettings, userRole }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = userRole === UserRole.ADMIN;

  // Local state for form editing before saving
  const [localSettings, setLocalSettings] = useState<SystemSettings>(globalSettings);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setLocalSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setLocalSettings(prev => ({ ...prev, fontSize: size }));
  };

  const handleSave = () => {
    if (!isAdmin) return;
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      setGlobalSettings(localSettings);
      setIsSaving(false);
      setShowToast(true);
      // Log to pseudo audit log
      console.log(`[Audit] Settings updated by Admin at ${new Date().toISOString()}`);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm('ยืนยันการคืนค่าเริ่มต้นในส่วนการแสดงผล?')) {
      setLocalSettings(prev => ({
        ...prev,
        darkMode: false,
        compactView: false,
        fontSize: 'medium'
      }));
    }
  };

  const exportSettings = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localSettings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `infraguard_settings_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (json.orgNameTh && json.apiUrl) {
          setLocalSettings(json);
          alert('นำเข้าข้อมูลการตั้งค่าสำเร็จ กรุณากดปุ่มบันทึกเพื่อใช้การเปลี่ยนแปลง');
        } else {
          alert('รูปแบบไฟล์ไม่ถูกต้อง');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
      }
    };
    reader.readAsText(file);
  };

  const createSnapshot = () => {
    const snapshotsStr = localStorage.getItem('infra_snapshots') || '[]';
    const snapshots: SystemSnapshot[] = JSON.parse(snapshotsStr);
    const newSnapshot: SystemSnapshot = {
      id: `SNAP-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      createdBy: 'Admin',
      settings: localSettings
    };
    const updated = [newSnapshot, ...snapshots].slice(0, 5); // Keep last 5
    localStorage.setItem('infra_snapshots', JSON.stringify(updated));
    alert('สร้างจุดสำรองข้อมูล (Snapshot) สำเร็จ');
  };

  const tabs = [
    { id: 'general', label: 'ทั่วไป', icon: Globe },
    { id: 'security', label: 'ความปลอดภัย', icon: Shield },
    { id: 'ui', label: 'อินเทอร์เฟซ', icon: Smartphone },
    { id: 'ai', label: 'AI & Intelligence', icon: Zap },
    { id: 'api', label: 'API & Gateway', icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-[#002d62] tracking-tight flex items-center gap-3">
             <div className="bg-[#002d62] p-2 rounded-xl text-white shadow-lg"><SettingsIcon size={24} /></div>
             การตั้งค่าระบบ ERP
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic">ศูนย์ควบคุมโครงสร้างพื้นฐานดิจิทัล อบต.เหนือเมือง</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={exportSettings}
             className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
           >
             <Download size={16} /> Export
           </button>
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
           >
             <Upload size={16} /> Import
             <input type="file" ref={fileInputRef} onChange={importSettings} className="hidden" accept=".json" />
           </button>
           <button 
            onClick={handleSave}
            disabled={isSaving || !isAdmin}
            className="bg-[#002d62] text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#002d62] text-white shadow-xl' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
          
          <div className="pt-6 mt-6 border-t border-slate-200">
             <p className="px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Advanced Maintenance</p>
             <button onClick={handleReset} className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all">
                <RefreshCcw size={16} /> คืนค่าเริ่มต้น UI
             </button>
             <button onClick={createSnapshot} className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all">
                <History size={16} /> Create Snapshot
             </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 overflow-hidden relative">
          {!isAdmin && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-10 text-center">
              <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-slate-100 max-w-sm">
                 <Lock size={48} className="mx-auto text-rose-500 mb-4" />
                 <h4 className="text-lg font-black text-slate-900 mb-2">เข้าถึงได้เฉพาะผู้ดูแลระบบ</h4>
                 <p className="text-sm text-slate-500">บทบาทปัจจุบันของคุณคือ <b>{userRole}</b> ไม่สามารถบันทึกการตั้งค่าระบบหลักได้</p>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อหน่วยงาน (ภาษาไทย)</label>
                  <input 
                    name="orgNameTh"
                    type="text" 
                    value={localSettings.orgNameTh} 
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อหน่วยงาน (English)</label>
                  <input 
                    name="orgNameEn"
                    type="text" 
                    value={localSettings.orgNameEn} 
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ปีงบประมาณหลัก</label>
                  <select 
                    name="fiscalYear"
                    value={localSettings.fiscalYear}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                  >
                    <option>2567</option>
                    <option>2568</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">เขตพื้นที่ (GIS Area ID)</label>
                  <input 
                    name="areaId"
                    type="text" 
                    value={localSettings.areaId} 
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100">
                 <div className="flex items-center gap-3 mb-4">
                    <Server size={18} className="text-blue-600" />
                    <h5 className="text-sm font-black text-[#002d62]">Infrastructure API Endpoint</h5>
                 </div>
                 <input 
                    name="apiUrl"
                    type="text" 
                    value={localSettings.apiUrl} 
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-white border border-blue-200 rounded-2xl text-xs font-mono text-blue-700 outline-none" 
                  />
                  <p className="text-[10px] text-blue-400 mt-2 italic font-bold uppercase tracking-tighter">REST API / GeoJSON Integration Mode</p>
              </div>
            </div>
          )}

          {activeTab === 'ui' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                   <Smartphone size={16} className="text-blue-500" /> ระบบการแสดงผลและโหมดการทำงาน
                </h4>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Font Size Selector */}
                  <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white p-2 rounded-xl text-slate-700 shadow-sm border border-slate-100"><Type size={18} /></div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">System Font Size</p>
                        <p className="text-xs text-slate-400">ปรับขนาดตัวอักษรให้เหมาะสมกับสายตาและการแสดงผล</p>
                      </div>
                    </div>
                    <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit">
                      {[
                        { id: 'small', label: 'เล็ก' },
                        { id: 'medium', label: 'กลาง' },
                        { id: 'large', label: 'ใหญ่' }
                      ].map((size) => (
                        <button
                          key={size.id}
                          onClick={() => handleFontSizeChange(size.id as any)}
                          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
                            localSettings.fontSize === size.id 
                            ? 'bg-[#002d62] text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-6 rounded-[32px] border transition-all ${localSettings.darkMode ? 'bg-[#002d62] text-white border-transparent shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">Dark Mode Interface</p>
                      <p className={`text-xs mt-1 ${localSettings.darkMode ? 'text-blue-200' : 'text-slate-400'}`}>ปรับเปลี่ยนระบบสีให้เหมาะสมกับการทำงานในสภาวะแสงน้อย</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="darkMode"
                        checked={localSettings.darkMode} 
                        onChange={handleInputChange}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between p-6 rounded-[32px] border transition-all ${localSettings.compactView ? 'bg-[#0ea5e9] text-white border-transparent shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">Compact Spreadsheet View</p>
                      <p className={`text-xs mt-1 ${localSettings.compactView ? 'text-blue-100' : 'text-slate-400'}`}>ลด Padding และช่องว่างเพื่อให้แสดงผลข้อมูลได้มากขึ้นในหน้าจอเดียว</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="compactView"
                        checked={localSettings.compactView} 
                        onChange={handleInputChange}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white after:peer-checked:bg-[#0ea5e9]"></div>
                    </label>
                  </div>
                </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-amber-50 border border-amber-100 p-8 rounded-[40px] flex items-start gap-6">
                  <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-xl ring-4 ring-amber-100"><Lock size={24} /></div>
                  <div>
                    <p className="text-lg font-black text-amber-900 uppercase tracking-tight">Security & Governance</p>
                    <p className="text-sm text-amber-700 mt-2 leading-relaxed">การตั้งค่าระบบในแท็บนี้ส่งผลต่อสิทธิ์การเข้าถึงฐานข้อมูลพัสดุและงบประมาณอย่างเข้มงวด การเปลี่ยนแปลงทุกครั้งจะถูกบันทึกลงใน Audit Logs ของระบบ InfraGuard</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 border border-slate-100 rounded-[32px] bg-slate-50/50">
                    <div>
                      <h5 className="text-sm font-black text-slate-900">Two-Factor Authentication (2FA)</h5>
                      <p className="text-xs text-slate-400 mt-1 italic">บังคับใช้การยืนยันตัวตนสองชั้นสำหรับเจ้าหน้าที่ทุกคนที่เข้าถึงโมดูลการเงิน</p>
                    </div>
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all">Setup 2FA</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 border border-slate-100 rounded-[32px] bg-slate-50/50">
                    <div>
                      <h5 className="text-sm font-black text-slate-900">Session Secure Token</h5>
                      <p className="text-xs text-slate-400 mt-1 italic">อายุการใช้งาน Token สำหรับการเรียกใช้งาน GeoJSON API</p>
                    </div>
                    <select className="bg-white border px-4 py-2 rounded-xl text-xs font-bold outline-none">
                       <option>30 วัน (มาตรฐาน)</option>
                       <option>7 วัน (ความมั่นคงสูง)</option>
                       <option>ไม่มีวันหมดอายุ (Dev Mode)</option>
                    </select>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'api' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="navy-gradient p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-3">API Connectivity</h3>
                        <p className="text-blue-100 text-sm mb-8 leading-relaxed max-w-lg">ระบบรองรับการเชื่อมต่อข้อมูลโครงสร้างพื้นฐานผ่านมาตรฐาน Open Data และ GeoJSON เพื่อการแสดงผลบนแผนที่สารสนเทศภูมิศาสตร์</p>
                        <div className="flex flex-wrap gap-4">
                            <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase border border-white/20 backdrop-blur-md flex items-center gap-2"><Code size={12}/> REST API v2</span>
                            <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase border border-white/20 backdrop-blur-md flex items-center gap-2"><Zap size={12}/> GeoJSON Ready</span>
                            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-xl text-[10px] font-black uppercase border border-emerald-500/20 backdrop-blur-md flex items-center gap-2"><CheckCircle size={12}/> Token Valid</span>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                       <Server size={180} />
                    </div>
                </div>

                <div className="p-8 border border-slate-100 rounded-[32px] bg-slate-50/50">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h5 className="text-sm font-black text-slate-900">API Gateway Auth Tokens</h5>
                            <p className="text-xs text-slate-400 italic">จัดการรหัสผ่านสำหรับการเข้าถึงจากภายนอก</p>
                        </div>
                        <button className="bg-[#002d62] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase">Generate Key</button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Key size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Main Infrastructure Token</p>
                                    <p className="text-[10px] font-mono text-slate-400">infra_nuea_xxxxxxxxxxxxxxx</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-lg">Active</span>
                        </div>
                    </div>
                </div>
             </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-emerald-600 text-white px-10 py-5 rounded-[32px] shadow-[0_20px_50px_rgba(5,150,105,0.4)] flex items-center gap-4 border-b-4 border-emerald-800 backdrop-blur-xl">
              <div className="bg-white/20 p-2 rounded-full"><CheckCircle size={28} /></div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Configuration Updated</p>
                <p className="text-xs opacity-80 font-bold">บันทึกข้อมูลและอัปเดตระบบอินเทอร์เฟซเรียบร้อยแล้ว</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
