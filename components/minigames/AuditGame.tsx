
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useMutation } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
import { AuditResult } from '../../types';
import { CheckCircle2, ChevronRight, ChevronLeft, ClipboardList, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface AuditGameProps {
  areaId: string;
  areaName: string;
  onComplete: (result: AuditResult) => void;
}

interface StepItem {
  id: string;
  label: string;
  description: string;
}

const FIVE_S_STEPS = [
  { 
    name: 'Sort (Seiri)', 
    items: [
      { id: 's1', label: 'Unnecessary items are removed from the area', description: 'Check for broken tools, old documents, or expired materials.' },
      { id: 's2', label: 'Tools are marked for identification', description: 'Is it clear what belongs here and what doesn\'t?' },
      { id: 's3', label: 'Materials sorted by usage frequency', description: 'Daily items are closest, monthly items are further away.' }
    ]
  },
  { 
    name: 'Set in Order (Seiton)', 
    items: [
      { id: 'si1', label: 'Shadow boards or designated spots for tools', description: 'Everything has a place and is in its place.' },
      { id: 'si2', label: 'Workstations are clearly labeled', description: 'Zones are marked with floor tape or signs.' },
      { id: 'si3', label: 'Aisles and exits are unobstructed', description: 'Safety lines are visible and clear.' }
    ]
  },
  { 
    name: 'Shine (Seiso)', 
    items: [
      { id: 'sh1', label: 'Floors are free of debris and oil', description: 'Daily cleaning routines are being followed.' },
      { id: 'sh2', label: 'Equipment is wiped down and maintained', description: 'No accumulated dust or grime on machines.' },
      { id: 'sh3', label: 'Waste bins are emptied regularly', description: 'No overflowing trash containers.' }
    ]
  },
  { 
    name: 'Standardize (Seiketsu)', 
    items: [
      { id: 'st1', label: 'Cleaning schedules are posted and updated', description: 'Visual management for maintenance tasks.' },
      { id: 'st2', label: 'Standard work instructions are visible', description: 'Operators can easily find the standard operating procedure.' },
      { id: 'st3', label: 'Color coding system is being followed', description: 'Consistent use of colors for tools or zones.' }
    ]
  },
  { 
    name: 'Sustain (Shitsuke)', 
    items: [
      { id: 'su1', label: 'Regular 5S audits are conducted', description: 'Evidence of previous checks exists.' },
      { id: 'su2', label: 'Team discusses 5S during huddles', description: 'Culture of continuous improvement.' },
      { id: 'su3', label: 'Red tags are processed within 24 hours', description: 'Issues are not left unresolved.' }
    ]
  }
];

const AuditGame: React.FC<AuditGameProps> = ({ areaId, areaName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { passed: boolean; note: string }>>({});
  const { success, error: toastError, xpGained } = useToast();
  const { execute: submitAudit, loading } = useMutation<any, any>(ENDPOINTS.MINIGAMES.AUDIT);

  const handleToggle = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { 
        passed: !prev[id]?.passed, 
        note: prev[id]?.note || '' 
      }
    }));
  };

  const handleNoteChange = (id: string, note: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { 
        passed: prev[id]?.passed || false, 
        note 
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < FIVE_S_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    const totalItems = FIVE_S_STEPS.reduce((acc, step) => acc + step.items.length, 0);
    /* FIX: Added type cast to 'any' for Object.values result to allow property access in strict TS environments */
    const passedItems = Object.values(answers).filter((a: any) => a.passed).length;
    const score = Math.round((passedItems / totalItems) * 100);
    const xp = passedItems * 10;
    /* FIX: Added type cast to 'any' for Object.values result to allow property access in strict TS environments */
    const findings = Object.values(answers).filter((a: any) => !a.passed && a.note).length;

    const payload = {
      areaId,
      score,
      /* FIX: Cast 'val' to 'any' to allow spreading into a new object */
      answers: Object.entries(answers).map(([id, val]) => ({ itemId: id, ...(val as any) })),
      timestamp: new Date().toISOString()
    };

    const result = await submitAudit(payload);
    
    if (result) {
      success('Audit Completed', `You scored ${score}% in ${areaName}`);
      xpGained(xp, '5S Audit Mastery');
      onComplete({ score, total: 100, xp, findings });
    } else {
      toastError('Failed to submit audit');
    }
  };

  const step = FIVE_S_STEPS[currentStep];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header & Progress */}
      <div className="bg-slate-900 p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">5S Audit: {areaName}</h2>
            <p className="text-slate-400 text-sm">Follow the methodology to ensure workspace excellence.</p>
          </div>
          <div className="bg-red-600 px-3 py-1 rounded text-xs font-black">STEP {currentStep + 1}/5</div>
        </div>

        <div className="flex gap-2">
          {FIVE_S_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                idx <= currentStep ? 'bg-red-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Checklist Content */}
      <div className="p-8 space-y-8 min-h-[400px]">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{step.name}</h3>
          <p className="text-slate-500 text-sm">Evaluate the current status against standard work requirements.</p>
        </div>

        <div className="space-y-6">
          {step.items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => handleToggle(item.id)}
                  className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    answers[item.id]?.passed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white border-slate-300 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <Info className="w-3 h-3 mr-1" /> {item.description}
                  </p>
                  
                  {/* Notes Field */}
                  <div className="mt-3">
                    <textarea 
                      placeholder="Add observation note..."
                      value={answers[item.id]?.note || ''}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none h-16 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center text-slate-500 font-bold hover:text-slate-900 disabled:opacity-30 transition-colors px-4 py-2"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Previous
        </button>

        {currentStep < FIVE_S_STEPS.length - 1 ? (
          <button 
            onClick={handleNext}
            className="bg-slate-900 text-white px-8 py-2 rounded-xl font-bold flex items-center hover:bg-slate-800 transition-all shadow-lg"
          >
            Next Step <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        ) : (
          <button 
            onClick={handleFinish}
            disabled={loading}
            className="bg-red-600 text-white px-10 py-2 rounded-xl font-black uppercase tracking-widest flex items-center hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ClipboardList className="w-5 h-5 mr-2" />}
            Complete Audit
          </button>
        )}
      </div>
    </div>
  );
};

export default AuditGame;
