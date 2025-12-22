import React, { useState, useEffect } from 'react';
import { IshikawaProblem, IshikawaCause, IshikawaCategory, IshikawaSolution, Difficulty } from '../types';
import { ISHIKAWA_PROBLEMS, ISHIKAWA_CATEGORIES } from '../constants';
import { generateSolutions } from '../services/geminiService';
import { gameService } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Trash2, BrainCircuit, Loader2, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';

interface IshikawaGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
}

const IshikawaGame: React.FC<IshikawaGameProps> = ({ onComplete, onExit, isRealWorldStart = false }) => {
  const { user } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<IshikawaProblem | null>(null);
  const [causes, setCauses] = useState<IshikawaCause[]>([]);
  const [currentCategory, setCurrentCategory] = useState<IshikawaCategory>(IshikawaCategory.MAN);
  const [causeText, setCauseText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [solutions, setSolutions] = useState<IshikawaSolution[]>([]);
  const [phase, setPhase] = useState<'problem' | 'custom_input' | 'analysis' | 'solutions'>('problem');
  const [isSaving, setIsSaving] = useState(false);

  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  useEffect(() => {
    if (isRealWorldStart) {
      setPhase('custom_input');
    }
  }, [isRealWorldStart]);

  const startCustomProblem = () => {
    if (!customTitle) return;
    const newProblem: IshikawaProblem = {
      id: 'custom-' + Date.now(),
      title: customTitle,
      description: customDesc || 'User generated real-world problem',
      difficulty: Difficulty.HARD,
      category: 'Real World',
      isRealWorld: true
    };
    setSelectedProblem(newProblem);
    setPhase('analysis');
  };

  const addCause = () => {
    if (!causeText.trim()) return;
    const newCause: IshikawaCause = {
      id: Math.random().toString(36).substr(2, 9),
      category: currentCategory as any,
      cause: causeText.trim(),
      isRootCause: false
    };
    setCauses([...causes, newCause]);
    setCauseText('');
  };

  const removeCause = (id?: string) => {
    setCauses(causes.filter(c => c.id !== id));
  };

  const handleGenerate = async () => {
    if (causes.length < 3) {
      alert("Please add at least 3 root causes before generating solutions.");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Map back to gemini service expectations (text field)
      const mappedCauses = causes.map(c => ({ ...c, text: c.cause }));
      const generatedSolutions = await generateSolutions(selectedProblem!.title, selectedProblem!.description, mappedCauses as any);
      setSolutions(generatedSolutions);
      setPhase('solutions');
    } catch (error) {
      alert("Failed to generate solutions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const finishGame = async () => {
    if (!user || !selectedProblem) return;
    setIsSaving(true);
    
    const xp = selectedProblem?.isRealWorld ? 500 : (300 + (causes.length * 10));
    const score = 100;

    try {
      await gameService.saveIshikawaResult(
        selectedProblem.id,
        score,
        xp,
        causes,
        solutions,
        user.id.toString()
      );
      onComplete(xp, score, `Ishikawa: ${selectedProblem.title}`);
    } catch (e) {
      alert("Failed to save analysis.");
      setIsSaving(false);
    }
  };

  if (phase === 'problem') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
          </button>
          <button 
            onClick={() => setPhase('custom_input')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 flex items-center transition-all"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Analyze Custom Problem
          </button>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Select Root Cause Challenge</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ISHIKAWA_PROBLEMS.map(prob => (
            <div 
              key={prob.id}
              onClick={() => { setSelectedProblem(prob); setPhase('analysis'); }}
              className="bg-white p-6 rounded-xl border border-slate-200 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800">{prob.title}</h3>
                <span className="text-xs px-2 py-1 rounded font-semibold uppercase bg-purple-100 text-purple-700">
                  {prob.category}
                </span>
              </div>
              <p className="text-slate-500 text-sm">{prob.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'custom_input') {
     return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Describe Workplace Problem</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Problem Title</label>
                    <input 
                        value={customTitle}
                        onChange={e => setCustomTitle(e.target.value)}
                        placeholder="e.g. Scratches on Door Panels"
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Context / Impact</label>
                    <textarea 
                        value={customDesc}
                        onChange={e => setCustomDesc(e.target.value)}
                        placeholder="Describe what is happening and the impact..."
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                    />
                </div>
                <div className="flex gap-3 pt-4">
                    <button onClick={() => setPhase('problem')} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button 
                        onClick={startCustomProblem}
                        disabled={!customTitle}
                        className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 shadow-lg shadow-purple-500/20"
                    >
                        Start Analysis
                    </button>
                </div>
            </div>
        </div>
     );
  }

  if (phase === 'solutions') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex items-start space-x-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-emerald-800">Countermeasures Generated</h2>
            <p className="text-emerald-700 text-sm mt-1">
              {selectedProblem?.isRealWorld 
                ? "Here are AI suggestions for your actual workplace problem."
                : "Simulation complete. Here are the recommended solutions."}
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {solutions.map((sol, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${sol.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {sol.priority} Priority
              </span>
              <h3 className="font-bold text-lg text-slate-800 my-2">{sol.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{sol.description}</p>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg">
                {sol.steps.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={finishGame} disabled={isSaving} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold flex items-center disabled:opacity-50 transition-all">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Finish Analysis <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
         <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            {selectedProblem?.isRealWorld && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded mr-2 uppercase font-bold">Real World</span>}
            <span className="text-purple-600 mr-2">Problem:</span> {selectedProblem?.title}
          </h2>
          <p className="text-sm text-slate-500 truncate max-w-xl">{selectedProblem?.description}</p>
         </div>
      </div>
      <div className="flex-1 flex gap-6 overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Add Root Cause</h3>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category (6M)</label>
              <div className="grid grid-cols-2 gap-2">
                {ISHIKAWA_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCurrentCategory(cat as any)}
                    className={`text-xs py-2 px-1 rounded border transition-all truncate ${currentCategory === cat ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observation</label>
              <textarea
                value={causeText}
                onChange={(e) => setCauseText(e.target.value)}
                placeholder="Describe the potential cause..."
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
              />
            </div>
            <button
              onClick={addCause}
              disabled={!causeText.trim()}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Add to Diagram
            </button>
          </div>
        </div>
        <div className="w-full md:w-2/3 bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-y-auto relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || causes.length < 3}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
              Generate Solutions
            </button>
          </div>
          <h3 className="font-bold text-slate-400 uppercase tracking-wider text-sm mb-6">Ishikawa Diagram</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ISHIKAWA_CATEGORIES.map(category => (
              <div key={category} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm min-h-[100px]">
                <h4 className="text-xs font-bold text-purple-600 uppercase mb-3 pb-2 border-b border-slate-100">{category}</h4>
                <ul className="space-y-2">
                  {causes.filter(c => c.category === category).length === 0 ? (
                    <li className="text-xs text-slate-300 italic">No causes added</li>
                  ) : (
                    causes.filter(c => c.category === category).map(cause => (
                      <li key={cause.id} className="text-sm text-slate-700 flex justify-between items-start group">
                        <span>• {cause.cause}</span>
                        <button onClick={() => removeCause(cause.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IshikawaGame;
