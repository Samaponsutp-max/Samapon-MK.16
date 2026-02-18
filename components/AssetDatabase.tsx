
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
  Edit2
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
      const updatedAsset = {
        ...activeAsset,
        maintenanceHistory: [...(activeAsset.maintenanceHistory || []), `${new Date().toLocaleDateString('th-TH')}: ${newRecordText}`]
      };
      onUpdateAsset(updatedAsset);
      setActiveAsset(updatedAsset);
      setNewRecordText('');
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
    // Cast numeric fields
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
    let barWidth = "";
    let icon = null;

    switch (condition) {
      case AssetCondition.GOOD:
        colorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
        barWidth = "w-full bg-emerald-500";
        icon = <CheckCircle size={10} />;
        break;
      case AssetCondition.FAIR:
        colorClass = "text-amber-600 bg-amber-50 border-amber-100";
        barWidth = "w-2/3 bg-amber-500";
        icon = <AlertTriangle size={10} />;
        break;
      case AssetCondition.POOR:
        colorClass = "text-rose-600 bg-rose-50 border-rose-100";
        barWidth = "w-1/3 bg-rose-500";
        icon = <ShieldAlert size={10} />;
        break;
    }

    return (
      <div 
        className="flex flex-col items-center gap-1.5 w-24 mx-auto cursor-pointer group/cell"
        onClick={() => startEditing(asset, 'condition')}
      >
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all group-hover/cell:scale-105 ${colorClass}`}>
          {icon}
          {condition}
        </div>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barWidth}`} />
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
        className="flex items-center justify-end gap-2 group/editable cursor-pointer"
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาพัสดุ/รหัสสินทรัพย์..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002d62]/20 transition-all"
            />
          </div>
          
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex p-1 bg-slate-100 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === cat 
                      ? 'bg-white text-[#002d62] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
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
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4 border-r w-48">รหัสสินทรัพย์</th>
                <th className="px-6 py-4 border-r">ประเภทโครงสร้าง</th>
                <th className="px-6 py-4 border-r text-center w-32">สภาพปัจจุบัน</th>
                <th className="px-6 py-4 border-r w-32 text-right">ปีที่สร้าง</th>
                <th className="px-6 py-4 border-r w-32 text-right">อายุใช้งาน (ปี)</th>
                <th className="px-6 py-4 border-r text-right w-44">งบสะสม (บาท)</th>
                <th className="px-6 py-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[14px]">
              {filteredAssets.map((asset) => (
                <React.Fragment key={asset.id}>
                  <tr className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 border-r font-mono font-bold text-[#002d62]">{asset.id}</td>
                    <td className="px-6 py-4 border-r">
                      <div className="flex items-center gap-3">
                        {CATEGORY_ICONS[asset.category] || <div className="bg-slate-100 p-2 rounded-lg"><Database size={16} /></div>}
                        <span className="font-bold text-slate-700">{asset.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r text-center">
                      {getConditionUI(asset.condition, asset)}
                    </td>
                    <td className="px-6 py-4 border-r text-right">
                      {renderEditableText(asset, 'constructionYear')}
                    </td>
                    <td className="px-6 py-4 border-r text-right">
                      {renderEditableText(asset, 'expectedLifeYears')}
                    </td>
                    <td className="px-6 py-4 border-r text-right">
                      {renderEditableText(asset, 'maintenanceBudget', (v) => v.toLocaleString())}
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                        className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === asset.id && (
                        <div className="absolute right-full top-0 mr-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 text-left animate-in slide-in-from-right-2 duration-200">
                          <button onClick={() => handleAIAnalysis(asset)} className="w-full px-4 py-3 hover:bg-blue-50 text-[#002d62] text-xs font-black flex items-center gap-3">
                             <Sparkles size={16} className="text-blue-600" /> วิเคราะห์สภาพ AI
                          </button>
                          <button onClick={() => handleOpenHistory(asset)} className="w-full px-4 py-3 hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center gap-3">
                             <History size={16} className="text-slate-400" /> ประวัติการซ่อม
                          </button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button className="w-full px-4 py-3 hover:bg-rose-50 text-rose-600 text-xs font-black flex items-center gap-3">
                             <Trash2 size={16} /> ลบรายการ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {aiAnalysis?.id === asset.id && (
                    <tr className="bg-blue-50/50">
                      <td colSpan={7} className="px-8 py-4 border-b border-blue-100">
                        <div className="flex items-start gap-4">
                          <div className="bg-white p-2 rounded-xl shadow-sm"><Sparkles size={18} className="text-blue-600 animate-pulse" /></div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">AI Health Diagnostics (Lite Model)</p>
                            <p className="text-sm font-medium text-blue-900 leading-relaxed italic">"{aiAnalysis.text}"</p>
                            <button onClick={() => setAiAnalysis(null)} className="text-[10px] font-bold text-blue-400 mt-2 hover:text-blue-600">ปิดการวิเคราะห์</button>
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
          <div className="p-20 text-center bg-slate-50/50">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold">ไม่พบข้อมูลในหมวดหมู่นี้</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && activeAsset && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-[#002d62] p-2 rounded-xl text-white"><History size={20} /></div>
                <div>
                  <h3 className="font-black text-[#002d62] leading-none">Maintenance Log</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Asset ID: {activeAsset.id}</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {(activeAsset.maintenanceHistory || []).map((h, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                  <Clock size={18} className="text-slate-300 shrink-0 mt-0.5 group-hover:text-blue-400" />
                  <span className="text-sm font-medium text-slate-700 leading-relaxed">{h}</span>
                </div>
              ))}
              {(activeAsset.maintenanceHistory || []).length === 0 && (
                <div className="text-center py-16">
                  <History size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 font-bold">ยังไม่เคยมีประวัติการซ่อมบำรุง</p>
                </div>
              )}
            </div>
            <div className="p-8 border-t bg-white">
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เพิ่มบันทึกการซ่อมบำรุงใหม่</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newRecordText}
                    onChange={(e) => setNewRecordText(e.target.value)}
                    placeholder="รายละเอียดการซ่อม..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002d62]/10 transition-all font-medium"
                  />
                  <button 
                    onClick={handleAddHistory}
                    disabled={!newRecordText.trim()}
                    className="bg-[#002d62] text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <Save size={18} /> บันทึก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDatabase;
