
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useMutation } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
import { GembaObservation, GembaResult } from '../../types';
import { Eye, ChevronRight, CheckCircle, Search, ClipboardList, Loader2, Factory, ShieldAlert } from 'lucide-react';

interface GembaGameProps {
  areaId: string;
  onComplete: (result: GembaResult) => void;
}

const STATIONS = [
  { 
    id: 1, 
    title: 'Loading Dock', 
    scenario: 'Forklifts are maneuvering between stacks of pallets. Some pallets seem to be leaning.',
    hint: 'Look for safety hazards or stacking standards.'
  },
  { 
    id: 2, 
    title: 'Assembly Station 4', 
    scenario: 'An operator is reaching high above their head to get a specific screw for every part.',
    hint: 'Consider ergonomics and motion waste.'
  },
  { 
    id: 3, 
    title: 'Quality Lab Entry', 
    scenario: 'You notice several calibration logs are signed off for the week ahead of time.',
    hint: 'Think about process integrity and quality standards.'
  },
  { 
    id: 4, 
    title: 'Tool Room', 
    scenario: 'The shadow board is missing three wrenches, and there are no "out" cards present.',
    hint: 'Visual management and 5S sustainability.'
  },
  { 
    id: 5, 
    title: 'Maintenance Workshop', 
    scenario: 'Oil is dripping slowly from a dormant hydraulic pump onto a cardboard sheet.',
    hint: 'Environmental risks and equipment maintenance.'
  }
];

const OBSERVATION_TYPES = ['Safety', 'Quality', 'Productivity', 'Waste', 'Improvement'] as const;

const GembaGame: React.FC<GembaGameProps> = ({ areaId, onComplete }) => {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [observations, setObservations] = useState<GembaObservation[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentType, setCurrentType] = useState<GembaObservation['type']>('Waste');
  const [phase, setPhase] = useState<'walk' | 'summary'>('walk');
  
  const { success, error: toastError, xpGained } = useToast();
  const { execute: submitGemba, loading } = useMutation<any, any>(ENDPOINTS.MINIGAMES.GEMBA);

  const handleNextStation = () => {
    if (!currentText.trim()) {
      toastError('Observation Required', 'Please record what you see before moving on.');
      return;
    }

    const newObs: GembaObservation = {
      id: `obs-${STATIONS[currentStationIndex].id}`,
      station: STATIONS[currentStationIndex].id,
      text: currentText,
      type: currentType
    };

    setObservations([...observations, newObs]);
    setCurrentText('');
    setCurrentType('Waste');

    if (currentStationIndex < STATIONS.length - 1) {
      setCurrentStationIndex(currentStationIndex + 1);
    } else {
      setPhase('summary');
    }
  };

  const handleFinish = async () => {
    const result = await submitGemba({ areaId, observations });
    if (result) {
      const xp = observations.length * 40;
      success('Gemba Walk Completed', 'Observations have been shared with the CI team.');
      xpGained(xp, 'Eagle Eye Auditor');
      onComplete({ observations, xp });
    }
  };

  const station = STATIONS[currentStationIndex];

  if (phase === 'summary') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="bg-slate-900 p-8 text-white text-center">
           <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ClipboardList className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black uppercase tracking-tight">Gemba Summary</h2>
           <p className="text-slate-400 mt-2">Review your findings before submitting to the CI manager.</p>
        </div>

        <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto">
           {observations.map((obs, i) => (
             <div key={obs.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-400">
                   {i+1}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        obs.type === 'Safety' ? 'bg-red-100 text-red-700' :
                        obs.type === 'Quality' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                         {obs.type}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{STATIONS[i].title}</span>
                   </div>
                   <p className="text-sm text-slate-600 italic">"{obs.text}"</p>
                </div>
             </div>
           ))}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
           <button 
             onClick={() => { setPhase('walk'); setCurrentStationIndex(0); setObservations([]); }}
             className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-200 rounded-2xl transition-all"
           >
             Restart Walk
           </button>
           <button 
             onClick={handleFinish}
             disabled={loading}
             className="flex-2 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center px-12"
           >
             {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <CheckCircle className="w-6 h-6 mr-2" />}
             Submit Findings
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       {/* Progress Stepper */}
       <div className="flex justify-between items-center mb-8 px-4">
          {STATIONS.map((s, idx) => (
             <div key={s.id} className="flex flex-col items-center flex-1 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                  idx < currentStationIndex ? 'bg-emerald-500 border-emerald-500 text-white' :
                  idx === currentStationIndex ? 'bg-white border-red-600 text-red-600 scale-125 shadow-lg shadow-red-100' :
                  'bg-white border-slate-200 text-slate-300'
                }`}>
                   {idx < currentStationIndex ? <CheckCircle className="w-6 h-6" /> : <span>{s.id}</span>}
                </div>
                <span className={`text-[10px] font-black uppercase mt-3 tracking-widest ${idx === currentStationIndex ? 'text-red-600' : 'text-slate-400'}`}>
                   {s.title}
                </span>
                {idx < STATIONS.length - 1 && (
                  <div className={`absolute left-[50%] right-[-50%] top-5 h-0.5 z-0 transition-all duration-500 ${idx < currentStationIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
             </div>
          ))}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Visual / Scenario Area */}
          <div className="md:col-span-3 space-y-6">
             <div className="bg-slate-900 aspect-video rounded-3xl relative overflow-hidden shadow-2xl border-4 border-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                   <Factory className="w-48 h-48 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                   <div className="bg-red-600 inline-block px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-white mb-2">Live View: Station {station.id}</div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">{station.title}</h3>
                   <p className="text-slate-300 text-sm mt-2 leading-relaxed">"{station.scenario}"</p>
                </div>
                {/* HUD Elements */}
                <div className="absolute top-6 right-6 flex gap-2">
                   <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20"><Search className="w-5 h-5 text-white" /></div>
                   <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20"><ShieldAlert className="w-5 h-5 text-white" /></div>
                </div>
             </div>

             <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-2xl flex items-start gap-3">
                <Eye className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                   <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Sensei Observation Hint</p>
                   <p className="text-sm text-amber-700">{station.hint}</p>
                </div>
             </div>
          </div>

          {/* Input Area */}
          <div className="md:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-full flex flex-col">
                <div className="flex-1 space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">What do you observe?</label>
                      <textarea 
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        placeholder="Type your notes here..."
                        className="w-full h-48 p-4 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all"
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Classification</label>
                      <div className="grid grid-cols-2 gap-2">
                         {OBSERVATION_TYPES.map(type => (
                           <button 
                             key={type}
                             onClick={() => setCurrentType(type)}
                             className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${
                               currentType === type 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105' 
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                             }`}
                           >
                             {type}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleNextStation}
                  className="w-full mt-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 group"
                >
                  {currentStationIndex < STATIONS.length - 1 ? 'Next Station' : 'Review Walk'}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default GembaGame;
