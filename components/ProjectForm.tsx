
import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory, ProjectStatus } from '../types';
import { Save, ChevronLeft, ChevronRight, FileText, Settings, Wallet, Calendar, Activity, Paperclip } from 'lucide-react';

interface ProjectFormProps {
  onSave: (project: Project) => void;
  onCancel: () => void;
  initialData?: Project | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Project>>({
    fiscalYear: '2567',
    category: ProjectCategory.ROAD,
    status: ProjectStatus.PLANNING,
    progressPercent: 0,
    budgetEstimated: 0,
    budgetActual: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name.includes('budget') || name.includes('Percent') ? Number(value) : value 
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const steps = [
    { id: 1, title: 'ข้อมูลพื้นฐาน', icon: FileText },
    { id: 2, title: 'รายละเอียดทางเทคนิค', icon: Settings },
    { id: 3, title: 'งบประมาณและการเงิน', icon: Wallet },
    { id: 4, title: 'ระยะเวลาดำเนินงาน', icon: Calendar },
    { id: 5, title: 'สถานะและความก้าวหน้า', icon: Activity },
    { id: 6, title: 'เอกสารแนบ', icon: Paperclip },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      nextStep();
    } else {
      onSave({
        ...formData,
        id: formData.id || Math.random().toString(36).substr(2, 9),
        lat: formData.lat || 13.0,
        lng: formData.lng || 100.0,
      } as Project);
    }
  };

  const isEditing = !!initialData;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800">
          {isEditing ? `แก้ไขข้อมูลโครงการ: ${initialData.projectCode}` : 'แบบฟอร์มบันทึกข้อมูลโครงการ'}
        </h2>
        <p className="text-slate-500 text-sm">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อการติดตามผลที่มีประสิทธิภาพ</p>
      </div>

      {/* Progress Stepper */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1 group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              step === s.id ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
              step > s.id ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              <s.icon size={18} />
            </div>
            <span className={`text-[10px] font-medium hidden md:block ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสโครงการ (Project Code)</label>
                <input required name="projectCode" value={formData.projectCode || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น 67-RD-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ปีงบประมาณ</label>
                <input required name="fiscalYear" value={formData.fiscalYear || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อโครงการ</label>
              <input required name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทโครงสร้าง</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {Object.values(ProjectCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">พื้นที่ดำเนินงาน</label>
                <input name="area" value={formData.area || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="หมู่ที่ / ชื่อชุมชน" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Technical */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ลักษณะงานโดยสังเขป</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">พิกัด GIS (Lat, Long)</label>
              <div className="flex gap-2">
                <input name="lat" type="number" step="any" placeholder="Latitude" value={formData.lat || ''} onChange={handleChange} className="flex-1 px-4 py-2 border rounded-lg" />
                <input name="lng" type="number" step="any" placeholder="Longitude" value={formData.lng || ''} onChange={handleChange} className="flex-1 px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Financial */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณที่ตั้งไว้ (บาท)</label>
                <input type="number" name="budgetEstimated" value={formData.budgetEstimated || 0} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณตามสัญญา (บาท)</label>
                <input type="number" name="budgetActual" value={formData.budgetActual || 0} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">แหล่งงบประมาณ</label>
              <select name="budgetSource" value={formData.budgetSource || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="งบปกติ">งบปกติ</option>
                <option value="เงินอุดหนุน">เงินอุดหนุน</option>
                <option value="เงินสะสม">เงินสะสม</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Timeline */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่มสัญญา</label>
                <input type="date" name="contractDateStart" value={formData.contractDateStart || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่สิ้นสุดสัญญา</label>
                <input type="date" name="contractDateEnd" value={formData.contractDateEnd || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้รับจ้าง</label>
              <input name="contractor" value={formData.contractor || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        )}

        {/* Step 5: Status */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">สถานะโครงการ</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ความคืบหน้า (%) : {formData.progressPercent}%</label>
              <input type="range" name="progressPercent" min="0" max="100" value={formData.progressPercent || 0} onChange={handleChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ปัญหาอุปสรรค</label>
              <textarea name="problems" value={formData.problems || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg h-24" />
            </div>
          </div>
        )}

        {/* Step 6: Attachments */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
              <Paperclip className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-slate-600 font-medium">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-slate-400 text-xs mt-1">(รองรับ PDF, BOQ, สัญญาจ้าง, รูปถ่ายหน้างาน)</p>
              <input type="file" multiple className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="mt-4 inline-block bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50">เลือกไฟล์</label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <FileText size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">แบบแปลนก่อสร้าง_67-RD-001.pdf</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="mt-12 flex justify-between border-t border-slate-100 pt-6">
          <button type="button" onClick={step === 1 ? onCancel : prevStep} className="flex items-center gap-2 px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <ChevronLeft size={20} />
            <span>{step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}</span>
          </button>
          <button type="submit" className={`flex items-center gap-2 px-8 py-2 rounded-lg transition-all ${
            step === 6 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white shadow-md font-medium`}>
            {step === 6 ? (
              <><Save size={20} /><span>{isEditing ? 'บันทึกการแก้ไข' : 'บันทึกโครงการ'}</span></>
            ) : (
              <><span>ถัดไป</span><ChevronRight size={20} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
