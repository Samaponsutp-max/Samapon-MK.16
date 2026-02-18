
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Asset, ProjectCategory, AssetCondition } from '../types';
import { 
  Database, 
  Search, 
  Sparkles, 
  History, 
  TrendingUp,
  Info,
  Table as TableIcon,
  Plus,
  FileSpreadsheet,
  Upload,
  MoreVertical,
  X,
  Save,
  Clock,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Grid,
  Trash2,
  ShieldAlert,
  Edit2,
  Calendar,
  PlusCircle,
  Activity
} from 'lucide-react';
import { analyzeAssetHealthAI } from '../services/geminiService';

interface AssetDatabaseProps {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  [ProjectCategory.ROAD]: <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><TrendingUp size={16} /></div>,
  [ProjectCategory.DRAINAGE]: <div className="bg-sky-100 p-2 rounded-lg text-sky-700"><Info size={16} /></div>,
  [ProjectCategory.BUILDING]: <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700"><TableIcon size={16} /></div>,
};

const AssetDatabase: React.FC<AssetDatabaseProps> = ({ assets, onUpdateAsset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiAnalysis, setAiAnalysis] = useState<{ id: string, text: string } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<string | null>(null);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [newRecordText, setNewRecordText] = useState('');
  const [newRecordDate, setNewRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Inline Editing State
  const [editingCell, setEditingCell] = useState<{ id: string, field: keyof Asset } | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchTerm, selectedCategory]);

  const handleAIAnalysis = (asset: Asset) => {
    setIsLoadingAi(asset.id);
    analyzeAssetHealthAI(asset).then(result => {
      setAiAnalysis({ id: asset.id, text: result });
      setIsLoadingAi(null);
    });
    setActiveMenuId(null);
  };

  const handleOpenHistory = (asset: Asset) => {
    setActiveAsset(asset);
    setIsHistoryModalOpen(true);
    setActiveMenuId(null);
  };

  const handleAddHistory = () => {
    if (activeAsset && newRecordText.trim()) {
      const dateParts = newRecordDate.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${parseInt(dateParts[0]) + 543}`;
      
      const updatedAsset = {
        ...activeAsset,
        maintenanceHistory: [`${formattedDate}: ${newRecordText}`, ...(activeAsset.maintenanceHistory || [])]
      };
      onUpdateAsset(updatedAsset);
      setActiveAsset(updatedAsset);
      setNewRecordText('');
      setNewRecordDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDeleteHistory = (index: number) => {
    if (activeAsset && window.confirm('ยืนยันการลบประวัติการซ่อมบำรุงนี้?')) {
      const updatedHistory = [...activeAsset.maintenanceHistory];
      updatedHistory.splice(index, 1);
      
      const updatedAsset = {
        ...activeAsset,
        maintenanceHistory: updatedHistory
      };
      onUpdateAsset(updatedAsset);
      setActiveAsset(updatedAsset);
    }
  };

  const startEditing = (asset: Asset, field: keyof Asset) => {
    setEditingCell({ id: asset.id, field });
    setTempValue(asset[field]);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setTempValue(null);
  };

  const saveInlineEdit = (asset: Asset) => {
    if (!editingCell) return;
    
    let valueToSave = tempValue;
    if (['maintenanceBudget', 'expectedLifeYears'].includes(editingCell.field)) {
      valueToSave = Number(tempValue);
    }

    const updatedAsset = {
      ...asset,
      [editingCell.field]: valueToSave
    };
    onUpdateAsset(updatedAsset);
    cancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent, asset: Asset) => {
    if (e.key === 'Enter') saveInlineEdit(asset);
    if (e.key === 'Escape') cancelEditing();
  };

  const getConditionUI = (condition: AssetCondition, asset: Asset) => {
    const isEditing = editingCell?.id === asset.id && editingCell.field === 'condition';

    if (isEditing) {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => saveInlineEdit(asset)}
          className="bg-white border border-blue-400 rounded-lg text-[11px] font-bold p-1 outline-none shadow-sm focus:ring-2 focus:ring-blue-200"
        >
          {Object.values(AssetCondition).map((cond) => (
            <option key={cond} value={cond}>{cond}</option>
          ))}
        </select>
      );
    }

    let colorClass = "";
    let barColor = "";
    let barWidth = "";
    let icon = null;

    switch (condition) {
      case AssetCondition.GOOD:
        colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
        barColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
        barWidth = "w-full";
        icon = <CheckCircle size={10} />;
        break;
      case AssetCondition.FAIR:
        colorClass = "text-amber-600 bg-amber-50 border-amber-200";
        barColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
        barWidth = "w-[60%]";
        icon = <AlertTriangle size={10} />;
        break;
      case AssetCondition.POOR:
        colorClass = "text-rose-600 bg-rose-50 border-rose-200";
        barColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]";
        barWidth = "w-[30%]";
        icon = <ShieldAlert size={10} />;
        break;
    }

    return (
      <div 
        className="flex flex-col items-center gap-2 w-28 mx-auto cursor-pointer group/cell p-2 rounded-xl hover:bg-slate-100/50 transition-all"
        onClick={() => startEditing(asset, 'condition')}
      >
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all group-hover/cell:scale-110 ${colorClass}`}>
          {icon}
          {condition}
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-100 shadow-inner">
          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor} ${barWidth}`} />
        </div>
      </div>
    );
  };

  const renderEditableText = (asset: Asset, field: keyof Asset, formatFn?: (val: any) => string) => {
    const isEditing = editingCell?.id === asset.id && editingCell.field === field;
    const value = asset[field];

    if (isEditing) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={typeof value === 'number' ? 'number' : 'text'}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => saveInlineEdit(asset)}
          onKeyDown={(e) => handleKeyDown(e, asset)}
          className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm font-bold text-[#002d62] outline-none shadow-sm"
        />
      );
    }

    return (
      <div 
        className="flex items-center justify-end gap-2 group/editable cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors"
        onClick={() => startEditing(asset, field)}
      >
        <span className="font-bold text-slate-700">
          {formatFn ? formatFn(value) : value}
        </span>
        <Edit2 size={12} className="text-slate-300 opacity-0 group-hover/editable:opacity-100 transition-opacity" />
      </div>
    );
  };

  const categories = ['all', ProjectCategory.ROAD, ProjectCategory.DRAINAGE, ProjectCategory.BUILDING, ProjectCategory.ELECTRICITY, ProjectCategory.WATER];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#002d62] tracking-tight flex items-center gap-3">
            <div className="bg-[#002d62] p-2.5 rounded-lg text-white">
              <FileSpreadsheet size={22} />
            </div>
            คลังข้อมูลสินทรัพย์ (Technical Spreadsheet)
          </h2>
          <p className="text-slate-500 font-medium">จัดการทะเบียนพัสดุและวิเคราะห์สภาพสินทรัพย์เชิงลึก (คลิกที่ช่องเพื่อแก้ไขข้อมูล)</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all">
            <Upload size={16} /> นำเข้าข้อมูล
          </button>
          <button className="flex items-center gap-2 bg-[#002d62] text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-black transition-all shadow-lg">
            <Plus size={16} /> เพิ่มรายการพัสดุ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาพัสดุ/รหัสสินทรัพย์..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm outline-none focus:ring-4 focus:ring-[#002d62]/5 transition-all"
            />
          </div>
          
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex p-1.5 bg-slate-200/50 rounded-2xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === cat 
                      ? 'bg-[#002d62] text-white shadow-xl' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  {cat === 'all' ? <Grid size={14} /> : null}
                  {cat === 'all' ? 'ทุกประเภท' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5 border-r w-48">รหัสสินทรัพย์</th>
                <th className="px-8 py-5 border-r">ประเภทโครงสร้าง</th>
                <th className="px-8 py-5 border-r text-center w-40">สภาพปัจจุบัน (Health)</th>
                <th className="px-8 py-5 border-r w-32 text-right">ปีที่สร้าง</th>
                <th className="px-8 py-5 border-r w-32 text-right">อายุใช้งาน (ปี)</th>
                <th className="px-8 py-5 border-r text-right w-44">งบสะสม (บาท)</th>
                <th className="px-8 py-5 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[14px]">
              {filteredAssets.map((asset) => (
                <React.Fragment key={asset.id}>
                  <tr className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6 border-r font-mono font-bold text-[#002d62]">{asset.id}</td>
                    <td className="px-8 py-6 border-r">
                      <div className="flex items-center gap-3">
                        {CATEGORY_ICONS[asset.category] || <div className="bg-slate-100 p-2 rounded-lg"><Database size={16} /></div>}
                        <span className="font-bold text-slate-700">{asset.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-r text-center">
                      {getConditionUI(asset.condition, asset)}
                    </td>
                    <td className="px-8 py-6 border-r text-right">
                      {renderEditableText(asset, 'constructionYear')}
                    </td>
                    <td className="px-8 py-6 border-r text-right">
                      {renderEditableText(asset, 'expectedLifeYears')}
                    </td>
                    <td className="px-8 py-6 border-r text-right">
                      {renderEditableText(asset, 'maintenanceBudget', (v) => v.toLocaleString())}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleOpenHistory(asset)}
                          className="p-3 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                          title="ดูประวัติการซ่อมบำรุง"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                          className="p-3 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>

                      {activeMenuId === asset.id && (
                        <div className="absolute right-full top-0 mr-4 w-60 bg-white border border-slate-200 rounded-[24px] shadow-2xl z-50 py-3 text-left animate-in slide-in-from-right-4 duration-300 ring-4 ring-[#002d62]/5">
                          <button onClick={() => handleAIAnalysis(asset)} className="w-full px-5 py-3.5 hover:bg-blue-50 text-[#002d62] text-xs font-black flex items-center gap-3">
                             <div className="bg-blue-100 p-1.5 rounded-lg"><Sparkles size={16} className="text-blue-600" /></div>
                             วิเคราะห์สภาพ AI
                          </button>
                          <div className="h-px bg-slate-100 my-2 mx-4"></div>
                          <button className="w-full px-5 py-3.5 hover:bg-rose-50 text-rose-600 text-xs font-black flex items-center gap-3">
                             <div className="bg-rose-100 p-1.5 rounded-lg"><Trash2 size={16} /></div>
                             ลบรายการพัสดุ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {aiAnalysis?.id === asset.id && (
                    <tr className="bg-blue-50/50">
                      <td colSpan={7} className="px-12 py-6 border-b border-blue-100 animate-in slide-in-from-top-2 duration-500">
                        <div className="flex items-start gap-5">
                          <div className="bg-white p-3 rounded-2xl shadow-lg border border-blue-100"><Sparkles size={22} className="text-blue-600 animate-pulse" /></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">AI Structural Intelligence Diagnostics</p>
                              <div className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded-md uppercase">Lite v4</div>
                            </div>
                            <p className="text-sm font-bold text-[#002d62] leading-relaxed italic border-l-4 border-blue-600 pl-4 py-1">"{aiAnalysis.text}"</p>
                            <button onClick={() => setAiAnalysis(null)} className="text-[10px] font-black text-blue-400 mt-4 hover:text-blue-600 flex items-center gap-1"><X size={12} /> ปิดหน้าต่างการวิเคราะห์</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAssets.length === 0 && (
          <div className="p-32 text-center bg-slate-50/50">
            <div className="bg-white border border-slate-100 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Database size={32} className="text-slate-200" />
            </div>
            <p className="text-xl font-black text-slate-400 tracking-tight">ไม่พบข้อมูลในหมวดหมู่นี้</p>
            <p className="text-sm text-slate-300 mt-2 font-medium">ลองเปลี่ยนหมวดหมู่หรือคำค้นหาใหม่</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && activeAsset && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b flex justify-between items-center bg-[#002d62] text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-4 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl"><History size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black leading-none">Maintenance History</h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase mt-2 tracking-[0.3em]">Asset Registry: {activeAsset.id}</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all text-white border border-white/10 shadow-lg"><X size={28} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50 relative">
              {/* Timeline Indicator Line */}
              {(activeAsset.maintenanceHistory || []).length > 0 && (
                <div className="absolute left-[67px] top-12 bottom-12 w-1 bg-slate-200 rounded-full"></div>
              )}

              <div className="space-y-10 relative">
                {(activeAsset.maintenanceHistory || []).map((h, i) => {
                  const [date, ...rest] = h.split(':');
                  const description = rest.join(':').trim();
                  return (
                    <div key={i} className="flex gap-10 group animate-in slide-in-from-left-6 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex flex-col items-center shrink-0">
                         <div className="bg-white w-12 h-12 rounded-2xl border-[6px] border-slate-100 shadow-xl flex items-center justify-center text-blue-600 z-10 group-hover:border-[#002d62]/10 group-hover:scale-110 transition-all">
                            <Clock size={18} />
                         </div>
                      </div>
                      <div className="flex-1 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all relative">
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100 shadow-sm">{date}</span>
                           <button 
                             onClick={() => handleDeleteHistory(i)}
                             className="text-slate-200 hover:text-rose-500 p-2 rounded-xl transition-all hover:bg-rose-50"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                        <p className="text-base font-bold text-slate-700 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  );
                })}
                
                {(activeAsset.maintenanceHistory || []).length === 0 && (
                  <div className="text-center py-24 bg-white rounded-[48px] border-4 border-dashed border-slate-200 shadow-inner">
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                       <History size={48} className="text-slate-200" />
                    </div>
                    <p className="text-lg font-black text-slate-400 uppercase tracking-widest">ยังไม่มีประวัติการซ่อมบำรุง</p>
                    <p className="text-sm text-slate-300 mt-2 font-medium">เริ่มต้นเพิ่มรายการใหม่โดยใช้ฟอร์มด้านล่าง</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-12 border-t bg-white">
              <div className="bg-slate-100/50 p-10 rounded-[40px] border border-slate-200 shadow-inner">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                   <PlusCircle size={18} className="text-[#002d62]" /> บันทึกข้อมูลการซ่อมบำรุงใหม่
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="date" 
                        value={newRecordDate}
                        onChange={(e) => setNewRecordDate(e.target.value)}
                        className="w-full pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-[24px] text-sm font-bold outline-none focus:ring-4 focus:ring-[#002d62]/5 transition-all shadow-sm"
                      />
                   </div>
                   <div className="relative">
                      <Edit2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={newRecordText}
                        onChange={(e) => setNewRecordText(e.target.value)}
                        placeholder="รายละเอียด เช่น เปลี่ยนหลอดไฟ LED, ลอกตะกอนท่อ..."
                        className="w-full pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-[24px] text-sm font-bold outline-none focus:ring-4 focus:ring-[#002d62]/5 transition-all shadow-sm"
                      />
                   </div>
                </div>
                <button 
                  onClick={handleAddHistory}
                  disabled={!newRecordText.trim()}
                  className="w-full bg-[#002d62] text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                >
                  <Save size={22} /> ยืนยันการบันทึกประวัติพัสดุ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDatabase;
