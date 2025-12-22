
import React, { useState } from 'react';
import { IshikawaCategory, IshikawaCause, IshikawaResult } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useMutation } from '../../hooks/useApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { ENDPOINTS } from '../../config';
import { Plus, X, GitBranch, AlertTriangle, CheckCircle, BrainCircuit, Loader2, Info } from 'lucide-react';

interface IshikawaGameProps {
  problemId: string;
  problemTitle: string;
  onComplete: (result: IshikawaResult) => void;
}

const IshikawaGame: React.FC<IshikawaGameProps> = ({ problemId, problemTitle, onComplete }) => {
  const { t } = useLanguage();
  const [causes, setCauses] = useState<IshikawaCause[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IshikawaCategory | null>(null);
  const [newCauseText, setNewCauseText] = useState('');
  const [isRootCause, setIsRootCause] = useState(false);
  const { success, error: toastError, xpGained } = useToast();
  const { execute: submitIshikawa, loading } = useMutation<any, any>(ENDPOINTS.MINIGAMES.ISHIKAWA);

  const categories = [
    { id: IshikawaCategory.MAN, label: t('games.ishikawa.categories.man') },
    { id: IshikawaCategory.MACHINE, label: t('games.ishikawa.categories.machine') },
    { id: IshikawaCategory.METHOD, label: t('games.ishikawa.categories.method') },
    { id: IshikawaCategory.MATERIAL, label: t('games.ishikawa.categories.material') },
    { id: IshikawaCategory.MEASUREMENT, label: t('games.ishikawa.categories.measurement') },
    { id: IshikawaCategory.ENVIRONMENT, label: t('games.ishikawa.categories.env') }
  ];

  const addCause = () => {
    if (!newCauseText.trim() || !selectedCategory) return;
    const id = Math.random().toString(36).substring(2, 9);
    setCauses(prev => [...prev, { id, category: selectedCategory, cause: newCauseText, isRootCause }]);
    setNewCauseText('');
    setIsRootCause(false);
    setSelectedCategory(null);
  };

  const handleAnalyze = async () => {
    if (causes.length < 3) return toastError(t('common.error'), 'Min 3 příčiny.');
    const result = await submitIshikawa({ problemId, causes });
    if (result) {
      success(t('common.success'), t('common.finish'));
      xpGained(200, 'RCA Specialist');
      onComplete({ causes, xp: 200 });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-red-600 uppercase tracking-widest mb-1">{t('games.ishikawa.title')}</h2>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{problemTitle}</h1>
        </div>
        <button onClick={handleAnalyze} disabled={loading} className="bg-slate-900 dark:bg-red-600 text-white px-6 py-2 rounded-xl font-bold flex items-center disabled:opacity-50">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
          {t('games.ishikawa.generate')}
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-10 relative border-4 border-dashed border-slate-200 dark:border-slate-800 min-h-[500px]">
        <div className="absolute left-0 right-48 h-2 bg-slate-300 dark:bg-slate-800 top-1/2 -translate-y-1/2"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-32 bg-white dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-700 rounded-r-3xl flex items-center justify-center p-4 text-center">
           <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{problemTitle}</p>
        </div>

        <div className="grid grid-cols-3 h-full">
           {categories.map((cat, idx) => (
             <div key={cat.id} className={`relative min-h-[220px] ${idx >= 3 ? 'pt-12' : ''}`}>
                <button 
                  onClick={() => setSelectedCategory(cat.id)}
                  className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-md hover:border-red-500 z-10"
                  style={{ [idx < 3 ? 'bottom' : 'top']: '0' }}
                >
                  <p className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">{cat.label}</p>
                </button>
                <div className={`absolute left-1/2 w-1 h-24 bg-slate-200 dark:bg-slate-800 ${idx < 3 ? 'bottom-0 -rotate-45 origin-bottom' : 'top-0 rotate-45 origin-top'}`}></div>
                <div className={`absolute left-1/2 -translate-x-1/2 w-full px-4 space-y-2 ${idx < 3 ? 'bottom-24' : 'top-24'}`}>
                   {causes.filter(c => c.category === cat.id).map(c => (
                     <div key={c.id} className={`p-2 rounded-lg text-[10px] shadow-sm flex items-center justify-between ${c.isRootCause ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 dark:text-white'}`}>
                        <span className="truncate flex-1">{c.cause}</span>
                        <button onClick={() => setCauses(prev => prev.filter(x => x.id !== c.id))} className="ml-1 text-slate-400"><X className="w-3 h-3" /></button>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </div>

      {selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
             <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold uppercase">{t('games.ishikawa.addCause')}: {selectedCategory}</h3>
                <button onClick={() => setSelectedCategory(null)}><X className="w-5 h-5" /></button>
             </div>
             <div className="p-6 space-y-4">
                <textarea 
                  autoFocus
                  value={newCauseText}
                  onChange={(e) => setNewCauseText(e.target.value)}
                  className="w-full h-24 p-3 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none text-sm"
                />
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
                   <input type="checkbox" checked={isRootCause} onChange={(e) => setIsRootCause(e.target.checked)} className="w-5 h-5" />
                   <div><p className="text-sm font-bold dark:text-white">{t('games.ishikawa.isRoot')}</p></div>
                </label>
                <button onClick={addCause} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">{t('common.confirm')}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IshikawaGame;
