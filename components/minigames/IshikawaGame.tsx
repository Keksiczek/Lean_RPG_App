
import React, { useState } from 'react';
import { IshikawaCategory, IshikawaCause, IshikawaResult } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useMutation } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
/* FIX: Added Info to imports */
import { Plus, X, GitBranch, AlertTriangle, CheckCircle, BrainCircuit, Loader2, Info } from 'lucide-react';

interface IshikawaGameProps {
  problemId: string;
  problemTitle: string;
  onComplete: (result: IshikawaResult) => void;
}

const CATEGORIES = [
  { id: IshikawaCategory.MAN, label: 'Man', sub: 'People & Skills' },
  { id: IshikawaCategory.MACHINE, label: 'Machine', sub: 'Tools & Tech' },
  { id: IshikawaCategory.METHOD, label: 'Method', sub: 'Processes' },
  { id: IshikawaCategory.MATERIAL, label: 'Material', sub: 'Raw Inputs' },
  { id: IshikawaCategory.MEASUREMENT, label: 'Measurement', sub: 'Data & Accuracy' },
  { id: IshikawaCategory.ENVIRONMENT, label: 'Environment', sub: 'Conditions' }
];

const IshikawaGame: React.FC<IshikawaGameProps> = ({ problemId, problemTitle, onComplete }) => {
  const [causes, setCauses] = useState<IshikawaCause[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IshikawaCategory | null>(null);
  const [newCauseText, setNewCauseText] = useState('');
  const [isRootCause, setIsRootCause] = useState(false);
  const { success, error: toastError, xpGained } = useToast();
  const { execute: submitIshikawa, loading } = useMutation<any, any>(ENDPOINTS.MINIGAMES.ISHIKAWA);

  const addCause = () => {
    if (!newCauseText.trim() || !selectedCategory) return;
    
    const id = Math.random().toString(36).substring(2, 9);
    setCauses(prev => [...prev, { id, category: selectedCategory, cause: newCauseText, isRootCause }]);
    setNewCauseText('');
    setIsRootCause(false);
    setSelectedCategory(null);
  };

  const removeCause = (id: string) => {
    setCauses(prev => prev.filter(c => c.id !== id));
  };

  const handleAnalyze = async () => {
    if (causes.length < 3) {
      toastError('Insufficient Data', 'Please identify at least 3 potential causes.');
      return;
    }
    if (!causes.some(c => c.isRootCause)) {
      toastError('Missing Root Cause', 'At least one item must be identified as a primary Root Cause.');
      return;
    }

    const result = await submitIshikawa({ problemId, causes });
    if (result) {
      const xp = 150 + (causes.length * 20);
      success('Analysis Complete', 'Your root cause analysis has been logged.');
      xpGained(xp, 'Root Cause Specialist');
      onComplete({ causes, xp });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-red-600 uppercase tracking-widest mb-1">Fishbone Analysis</h2>
          <h1 className="text-2xl font-bold text-slate-900">{problemTitle}</h1>
        </div>
        <div className="flex gap-4">
           <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Causes Found</p>
              <p className="text-lg font-black text-slate-900">{causes.length}</p>
           </div>
           <button 
             onClick={handleAnalyze}
             disabled={loading}
             className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
             Submit Analysis
           </button>
        </div>
      </div>

      {/* Fishbone Diagram (Visual representation) */}
      <div className="bg-slate-50 rounded-3xl p-10 relative border-4 border-dashed border-slate-200 overflow-hidden min-h-[500px]">
        {/* Central Spine */}
        <div className="absolute left-0 right-48 h-2 bg-slate-300 top-1/2 -translate-y-1/2"></div>
        
        {/* Problem Head */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-32 bg-white border-4 border-slate-300 rounded-r-3xl flex items-center justify-center p-4 text-center shadow-xl">
           <p className="text-xs font-black text-slate-700 leading-tight uppercase">{problemTitle}</p>
           <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[16px] border-r-slate-300"></div>
        </div>

        {/* Categories Grid (3 top, 3 bottom) */}
        <div className="grid grid-cols-3 h-full">
           {/* Top Row (Man, Machine, Method) */}
           {CATEGORIES.slice(0, 3).map((cat) => (
             <div key={cat.id} className="relative group min-h-[220px]">
                <button 
                  onClick={() => setSelectedCategory(cat.id)}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-200 p-3 rounded-xl shadow-md hover:border-red-500 hover:scale-110 transition-all z-10"
                >
                  <p className="text-xs font-black uppercase text-slate-800">{cat.label}</p>
                </button>
                <div className="absolute bottom-0 left-1/2 w-1 h-24 bg-slate-200 -rotate-45 origin-bottom"></div>
                
                {/* Causes list for this category */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full px-4 space-y-2">
                   {causes.filter(c => c.category === cat.id).map(c => (
                     <div key={c.id} className={`p-2 rounded-lg text-[10px] shadow-sm flex items-center justify-between ${c.isRootCause ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-white border border-slate-100 text-slate-600'}`}>
                        <span className="truncate flex-1">{c.cause}</span>
                        <button onClick={() => removeCause(c.id!)} className="ml-1 opacity-50 hover:opacity-100"><X className="w-3 h-3" /></button>
                     </div>
                   ))}
                </div>
             </div>
           ))}

           {/* Bottom Row (Material, Measurement, Environment) */}
           {CATEGORIES.slice(3).map((cat) => (
             <div key={cat.id} className="relative group pt-12 min-h-[220px]">
                <button 
                  onClick={() => setSelectedCategory(cat.id)}
                  className="absolute top-0 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-200 p-3 rounded-xl shadow-md hover:border-red-500 hover:scale-110 transition-all z-10"
                >
                  <p className="text-xs font-black uppercase text-slate-800">{cat.label}</p>
                </button>
                <div className="absolute top-0 left-1/2 w-1 h-24 bg-slate-200 rotate-45 origin-top"></div>

                {/* Causes list for this category */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full px-4 space-y-2">
                   {causes.filter(c => c.category === cat.id).map(c => (
                     <div key={c.id} className={`p-2 rounded-lg text-[10px] shadow-sm flex items-center justify-between ${c.isRootCause ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-white border border-slate-100 text-slate-600'}`}>
                        <span className="truncate flex-1">{c.cause}</span>
                        <button onClick={() => removeCause(c.id!)} className="ml-1 opacity-50 hover:opacity-100"><X className="w-3 h-3" /></button>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Legend / Instructions */}
      <div className="flex flex-col md:flex-row gap-6">
         <div className="flex-1 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-500 shrink-0" />
            <div className="text-sm">
               <h4 className="font-bold text-blue-900 mb-1">How to Play</h4>
               <p className="text-blue-800 opacity-80">Click on any category button (e.g. Man, Machine) to add potential causes. Identify which ones you believe are the "Root Cause" to unlock the solution generation phase.</p>
            </div>
         </div>
         <div className="flex-1 bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div className="text-sm">
               <h4 className="font-bold text-red-900 mb-1">Completion Criteria</h4>
               <p className="text-red-800 opacity-80">Minimum 3 causes across the diagram. At least 1 must be marked as Root Cause.</p>
            </div>
         </div>
      </div>

      {/* Add Cause Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
             <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                <div className="flex items-center">
                   <GitBranch className="w-5 h-5 mr-2 text-red-500" />
                   <h3 className="font-bold uppercase tracking-tight">Add Cause: {selectedCategory}</h3>
                </div>
                <button onClick={() => setSelectedCategory(null)}><X className="w-5 h-5" /></button>
             </div>
             
             <div className="p-6 space-y-4">
                <div>
                   <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Potential Cause Description</label>
                   <textarea 
                     autoFocus
                     value={newCauseText}
                     onChange={(e) => setNewCauseText(e.target.value)}
                     placeholder="e.g. Inadequate training for new staff..."
                     className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm transition-all"
                   />
                </div>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                   <input 
                     type="checkbox" 
                     checked={isRootCause}
                     onChange={(e) => setIsRootCause(e.target.checked)}
                     className="w-5 h-5 accent-red-600"
                   />
                   <div>
                      <p className="text-sm font-bold text-slate-800">Root Cause Identified</p>
                      <p className="text-xs text-slate-500">Is this the primary driver of the problem?</p>
                   </div>
                </label>
             </div>

             <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                   onClick={addCause}
                   disabled={!newCauseText.trim()}
                   className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                   <Plus className="w-4 h-4 mr-1" /> Add Cause
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IshikawaGame;
