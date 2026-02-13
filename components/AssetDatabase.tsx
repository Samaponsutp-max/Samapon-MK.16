
import React, { useState, useMemo } from 'react';
import { Asset, ProjectCategory, AssetCondition } from '../types';
import { 
  Database, 
  Search, 
  Filter, 
  Sparkles, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Download,
  Info
} from 'lucide-react';
import { analyzeAssetHealthAI } from '../services/geminiService';

interface AssetDatabaseProps {
  assets: Asset[];
}

const AssetDatabase: React.FC<AssetDatabaseProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiAnalysis, setAiAnalysis] = useState<{ id: string, text: string } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchTerm, selectedCategory]);

  const handleAIAnalysis = async (asset: Asset) => {
    setIsLoadingAi(asset.id);
    const result = await analyzeAssetHealthAI(asset);
    setAiAnalysis({ id: asset.id, text: result });
    setIsLoadingAi(null);
  };

  const getConditionStyles = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.GOOD: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case AssetCondition.FAIR: return 'bg-amber-50 text-amber-700 border-amber-200';
      case AssetCondition.POOR: return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getConditionIcon = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.GOOD: return <CheckCircle2 size={14} />;
      case AssetCondition.FAIR: return <Info size={14} />;
      case AssetCondition.POOR: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Database className="text-blue-600" />
            คลังสินทรัพย์โครงสร้างพื้นฐาน
          </h2>
          <p className="text-slate-500 font-medium">ระบบบริหารจัดการทรัพย์สินหลังการก่อสร้างและแผนซ่อมบำรุงระยะยาว</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <TrendingUp size={18} />
            วิเคราะห์ความคุ้มค่ารวม
          </button>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">มูลค่าสินทรัพย์รวม</p>
          <h4 className="text-2xl font-black text-slate-900 leading-none">฿42,500,000</h4>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs">
            <TrendingUp size={14} /> +2.4% เพิ่มขึ้นปีนี้
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">สภาพดี (Optimal)</p>
          <h4 className="text-2xl font-black text-emerald-600 leading-none">78%</h4>
          <div className="mt-4 flex items-center gap-2 text-slate-400 font-bold text-xs">
            เป้าหมายปี 2568: 85%
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">แจ้งซ่อมด่วน (Urgent)</p>
          <h4 className="text-2xl font-black text-rose-600 leading-none">5 รายการ</h4>
          <div className="mt-4 flex items-center gap-2 text-rose-600 font-bold text-xs animate-pulse">
            <AlertCircle size={14} /> ต้องการการอนุมัติงบ
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Filters Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหารหัสสินทรัพย์ หรือประเภท..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="all">ทุกประเภท</option>
              {Object.values(ProjectCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">รหัสสินทรัพย์ / ประเภท</th>
                <th className="px-6 py-5">ปีที่สร้าง (อายุ)</th>
                <th className="px-6 py-5">การตรวจสอบล่าสุด</th>
                <th className="px-6 py-5">สภาพปัจจุบัน</th>
                <th className="px-6 py-5">งบซ่อมบำรุงสะสม</th>
                <th className="px-6 py-5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssets.map((asset) => (
                <React.Fragment key={asset.id}>
                  <tr className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 border border-blue-100">
                          <Database size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{asset.id}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{asset.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-700">{asset.constructionYear}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Life: {asset.expectedLifeYears} Years</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-xs font-bold">{asset.lastChecked}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border tracking-wider uppercase ${getConditionStyles(asset.condition)}`}>
                        {getConditionIcon(asset.condition)}
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900">฿{asset.maintenanceBudget.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAIAnalysis(asset)}
                          disabled={isLoadingAi === asset.id}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                          title="AI Analyze"
                        >
                          <Sparkles size={18} className={isLoadingAi === asset.id ? 'animate-spin' : ''} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <History size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {aiAnalysis?.id === asset.id && (
                    <tr className="bg-indigo-50/30 animate-in slide-in-from-top-2 duration-300">
                      <td colSpan={6} className="px-6 py-6 border-t border-indigo-100">
                        <div className="flex items-start gap-4 max-w-4xl">
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-100">
                            <Sparkles size={24} className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">AI Strategy Insight • ผลการวิเคราะห์สภาพสินทรัพย์</h5>
                              <button onClick={() => setAiAnalysis(null)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors uppercase">ปิดหน้าต่างนี้</button>
                            </div>
                            <p className="text-sm text-indigo-800 leading-relaxed italic mb-4 font-medium">"{aiAnalysis.text}"</p>
                            <div className="flex gap-2">
                              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                                <ArrowRight size={14} /> สร้างใบสั่งซ่อมบำรุง
                              </button>
                              <button className="bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all">
                                ดูข้อมูลเชิงเทคนิค
                              </button>
                            </div>
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
      </div>
      
      {filteredAssets.length === 0 && (
        <div className="bg-white rounded-[32px] border border-dashed border-slate-300 p-20 text-center">
          <Database size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">ไม่พบข้อมูลสินทรัพย์</h3>
          <p className="text-slate-500">ลองเปลี่ยนการตั้งค่าตัวกรอง หรือค้นหาใหม่อีกครั้ง</p>
        </div>
      )}
    </div>
  );
};

export default AssetDatabase;
