
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useMutation } from '../../hooks/useApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { ENDPOINTS } from '../../config';
import { AuditResult } from '../../types';
import { CheckCircle2, ChevronRight, ChevronLeft, ClipboardList, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface AuditGameProps {
  areaId: string;
  areaName: string;
  onComplete: (result: AuditResult) => void;
}

const AuditGame: React.FC<AuditGameProps> = ({ areaId, areaName, onComplete }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { passed: boolean; note: string }>>({});
  const { success, error: toastError, xpGained } = useToast();
  const { execute: submitAudit, loading } = useMutation<any, any>(ENDPOINTS.MINIGAMES.AUDIT);

  // Dynamicky načtené kroky z překladů
  const steps = [
    { key: 'sort', ...t('games.audit.steps.sort') as any, items: [
      { id: 's1', label: t('language') === 'cs' ? 'Zbytečné předměty odstraněny' : 'Unnecessary items removed' },
      { id: 's2', label: t('language') === 'cs' ? 'Nářadí je identifikováno' : 'Tools are marked' }
    ]},
    { key: 'set', ...t('games.audit.steps.set') as any, items: [
      { id: 'si1', label: t('language') === 'cs' ? 'Stínové tabule použity' : 'Shadow boards in use' },
      { id: 'si2', label: t('language') === 'cs' ? 'Značení podlah viditelné' : 'Floor markings visible' }
    ]},
    { key: 'shine', ...t('games.audit.steps.shine') as any, items: [
      { id: 'sh1', label: t('language') === 'cs' ? 'Podlahy bez oleje a nečistot' : 'Floors oil/debris free' }
    ]},
    { key: 'standard', ...t('games.audit.steps.standard') as any, items: [
      { id: 'st1', label: t('language') === 'cs' ? 'Standardy práce vyvěšeny' : 'Standard work posted' }
    ]},
    { key: 'sustain', ...t('games.audit.steps.sustain') as any, items: [
      { id: 'su1', label: t('language') === 'cs' ? 'Pravidelné audity probíhají' : 'Regular audits conducted' }
    ]}
  ];

  const handleToggle = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { passed: !prev[id]?.passed, note: prev[id]?.note || '' }
    }));
  };

  const handleNoteChange = (id: string, note: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { passed: prev[id]?.passed || false, note }
    }));
  };

  const handleFinish = async () => {
    const totalItems = steps.reduce((acc, s) => acc + s.items.length, 0);
    const passedItems = Object.values(answers).filter((a: any) => a.passed).length;
    const score = Math.round((passedItems / totalItems) * 100);
    const xp = passedItems * 10;
    
    const payload = { areaId, score, answers, timestamp: new Date().toISOString() };
    const result = await submitAudit(payload);
    
    if (result) {
      success(t('common.success'), `${t('common.score')}: ${score}%`);
      xpGained(xp, '5S Audit Mastery');
      onComplete({ score, total: 100, xp, findings: 0 });
    }
  };

  const step = steps[currentStep];

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-fade-in border dark:border-slate-800">
      <div className="bg-slate-900 p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{t('games.audit.title')}: {areaName}</h2>
            <p className="text-slate-400 text-sm">{t('games.audit.subtitle')}</p>
          </div>
          <div className="bg-red-600 px-3 py-1 rounded text-xs font-black">{t('common.step').toUpperCase()} {currentStep + 1}/5</div>
        </div>
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div key={idx} className={`h-2 flex-1 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-red-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>

      <div className="p-8 space-y-8 min-h-[400px]">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.name}</h3>
          <p className="text-slate-500 text-sm">{step.desc}</p>
        </div>

        <div className="space-y-4">
          {step.items.map((item: any) => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => handleToggle(item.id)}
                  className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${answers[item.id]?.passed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                  <textarea 
                    placeholder="..."
                    value={answers[item.id]?.note || ''}
                    onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    className="mt-2 w-full p-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none h-12 resize-none dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between">
        <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0} className="flex items-center text-slate-500 font-bold disabled:opacity-30">
          <ChevronLeft className="w-5 h-5 mr-1" /> {t('common.previous')}
        </button>
        {currentStep < 4 ? (
          <button onClick={() => setCurrentStep(s => s + 1)} className="bg-slate-900 dark:bg-red-600 text-white px-8 py-2 rounded-xl font-bold flex items-center">
            {t('common.next')} <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        ) : (
          <button onClick={handleFinish} disabled={loading} className="bg-red-600 text-white px-10 py-2 rounded-xl font-black uppercase flex items-center shadow-lg disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ClipboardList className="w-5 h-5 mr-2" />}
            {t('common.finish')}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuditGame;
