
import React, { useState } from 'react';
import { X, Sparkles, Wand2, Image as ImageIcon, Save, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { editImageAI } from '../services/geminiService';

interface AIImageEditorProps {
  initialImage: string;
  onSave: (newImage: string) => void;
  onClose: () => void;
}

const AIImageEditor: React.FC<AIImageEditorProps> = ({ initialImage, onSave, onClose }) => {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([initialImage]);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    try {
      const edited = await editImageAI(currentImage, prompt);
      if (edited) {
        setCurrentImage(edited);
        setHistory(prev => [...prev, edited]);
        setPrompt('');
      } else {
        alert("ไม่สามารถประมวลผลการแก้ไขได้ โปรดลองอีกครั้ง");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
    } finally {
      setIsProcessing(false);
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentImage(newHistory[newHistory.length - 1]);
    }
  };

  const suggestions = [
    "เพิ่มฟิลเตอร์แบบย้อนยุค (Retro)",
    "ลบวัตถุที่ไม่ต้องการในภาพออก",
    "ปรับภาพให้สว่างขึ้นและดูเป็นธรรมชาติ",
    "เพิ่มเครื่องจักรและคนงานก่อสร้างในฉาก",
    "จำลองภาพให้เหมือนตอนกลางคืนพร้อมแสงไฟ"
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 z-10 bg-slate-100 hover:bg-slate-200 text-slate-500 p-3 rounded-full transition-all">
          <X size={24} />
        </button>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Preview Section */}
          <div className="flex-1 bg-slate-100 p-12 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full h-full relative group">
              <img 
                src={currentImage} 
                alt="Preview" 
                className="w-full h-full object-contain rounded-3xl shadow-lg transition-all"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center animate-in fade-in">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                  <p className="text-blue-900 font-black uppercase tracking-widest text-sm">AI Processing Image...</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="lg:w-96 border-l border-slate-100 p-10 flex flex-col bg-slate-50 overflow-y-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg text-white">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Image Studio</h3>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prompt Editor</p>
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm mb-6">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="พิมพ์คำสั่งเพื่อแก้ไขรูปภาพ เช่น 'เพิ่มต้นไม้ริมถนน' หรือ 'ลบรถยนต์ในภาพออก'..."
                className="w-full h-32 text-sm font-medium border-none outline-none resize-none bg-transparent placeholder:text-slate-300"
              />
              <button 
                onClick={handleEdit}
                disabled={isProcessing || !prompt.trim()}
                className="w-full mt-4 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                Generate Changes
              </button>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Suggestions</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setPrompt(s)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-10 border-t border-slate-200 flex flex-col gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={undo}
                  disabled={history.length <= 1 || isProcessing}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-20"
                >
                  <RotateCcw size={16} /> Undo
                </button>
                <button 
                  onClick={() => onSave(currentImage)}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageEditor;
