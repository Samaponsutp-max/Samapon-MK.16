
import React, { useState } from 'react';
import { DevelopmentPlan, PriorityLevel, PlanStatus } from '../types';
import { Search, Filter, Sparkles, Plus, MoreHorizontal, ChevronDown } from 'lucide-react';
import { analyzePlanPriorityAI } from '../services/geminiService';

interface PlanDatabaseProps {
  plans: DevelopmentPlan[];
  onAddPlan: () => void;
}

const PlanDatabase: React.FC<PlanDatabaseProps> = ({ plans, onAddPlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<{ id: string, text: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.planId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAIAnalysis = async (plan: DevelopmentPlan) => {
    setLoadingId(plan.id);
    const analysis = await analyzePlanPriorityAI(plan);
    setAiAnalysis({ id: plan.id, text: analysis });
    setLoadingId(null);
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case PriorityLevel.HIGH: return 'bg-red-100 text-red-700 border-red-200';
      case PriorityLevel.MEDIUM: return 'bg-blue-100 text-blue-700 border-blue-200';
      case PriorityLevel.LOW: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ฐานข้อมูลแผนพัฒนาท้องถิ่น</h2>
          <p className="text-slate-500 text-sm">จัดการแผนพัฒนา 3 ปี และ 5 ปี ก่อนการจัดตั้งงบประมาณประจำปี</p>
        </div>
        <button 
          onClick={onAddPlan}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          เพิ่มโครงการเข้าแผน
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาแผนงาน หรือรหัสแผน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-colors text-sm">
              <Filter size={16} />
              ปีงบประมาณ
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">รหัสแผน / ชื่อโครงการ</th>
                <th className="px-6 py-4 font-semibold">ประเภทแผน</th>
                <th className="px-6 py-4 font-semibold">ความสำคัญ</th>
                <th className="px-6 py-4 font-semibold">งบประมาณประมาณการ</th>
                <th className="px-6 py-4 font-semibold">สถานะ</th>
                <th className="px-6 py-4 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPlans.map((plan) => (
                <React.Fragment key={plan.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-indigo-600 tracking-tighter mb-0.5">{plan.planId}</p>
                      <p className="font-semibold text-slate-900">{plan.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{plan.area} • {plan.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{plan.planType}</span>
                      <p className="text-[10px] text-slate-400">{plan.fiscalYearRange}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getPriorityBadge(plan.priority)}`}>
                        {plan.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      ฿{plan.estimatedBudget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        plan.status === PlanStatus.ACTIVE ? 'text-green-600 bg-green-50' : 
                        plan.status === PlanStatus.POSTPONED ? 'text-orange-600 bg-orange-50' : 
                        'text-slate-400 bg-slate-100'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleAIAnalysis(plan)}
                          disabled={loadingId === plan.id}
                          className={`p-2 rounded-lg transition-all ${loadingId === plan.id ? 'opacity-50 cursor-not-allowed' : 'text-indigo-500 hover:bg-indigo-50'}`}
                          title="วิเคราะห์โดย AI"
                        >
                          <Sparkles size={18} className={loadingId === plan.id ? 'animate-pulse' : ''} />
                        </button>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {aiAnalysis?.id === plan.id && (
                    <tr className="bg-indigo-50/30">
                      <td colSpan={6} className="px-6 py-4 border-t border-indigo-100/50">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <Sparkles size={16} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-indigo-900 mb-1 tracking-wide uppercase">AI Strategy Insight:</p>
                            <p className="text-sm text-indigo-800 leading-relaxed italic">"{aiAnalysis.text}"</p>
                            <button 
                              onClick={() => setAiAnalysis(null)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-600 mt-2 font-medium"
                            >
                              ปิดความเห็น AI
                            </button>
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
    </div>
  );
};

export default PlanDatabase;
