import React, { useState, useEffect } from 'react';
import { IshikawaProblem, IshikawaCause, IshikawaCategory, IshikawaSolution, Difficulty } from '../types';
import { ISHIKAWA_PROBLEMS, ISHIKAWA_CATEGORIES } from '../constants';
import { generateSolutions } from '../services/geminiService';
import { ArrowLeft, Plus, Trash2, BrainCircuit, Loader2, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';

interface IshikawaGameProps {
  onComplete: (xp: number, score: number, gameName: string) => void;
  onExit: () => void;
  isRealWorldStart?: boolean;
}

const IshikawaGame: React.FC<IshikawaGameProps> = ({ onComplete, onExit, isRealWorldStart = false }) => {
  const [selectedProblem, setSelectedProblem] = useState<IshikawaProblem | null>(null);
  const [causes, setCauses] = useState<IshikawaCause[]>([]);
  const [currentCategory, setCurrentCategory] = useState<IshikawaCategory>(IshikawaCategory.MAN);
  const [causeText, setCauseText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [solutions, setSolutions] = useState<IshikawaSolution[]>([]);
  const [phase, setPhase] = useState<'problem' | 'custom_input' | 'analysis' | 'solutions'>('problem');

  // Custom Problem State
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  useEffect(() => {
    if (isRealWorldStart) {
      setPhase('custom_input');
    }
  }, [isRealWorldStart]);

  // Logic
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
      category: currentCategory,
      text: causeText.trim()
    };
    setCauses([...causes, newCause]);
    setCauseText('');
  };

  const removeCause = (id: string) => {
    setCauses(causes.filter(c => c.id !== id));
  };

  const handleGenerate = async () => {
    if (causes.length < 3) {
      alert("Please add at least 3 root causes before generating solutions.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const generatedSolutions = await generateSolutions(selectedProblem!.title, selectedProblem!.description, causes);
      setSolutions(generatedSolutions);
      setPhase('solutions');
    } catch (error) {
      alert("Failed to generate solutions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const finishGame = () => {
    const xp = selectedProblem?.isRealWorld ? 500 : (300 + (causes.length * 10)); // Higher reward for real world
    const score = 100;
    
    // Here we would POST to /api/ishikawa in a real scenario
    console.log("Saving result for:", selectedProblem?.title, solutions);
    
    onComplete(xp, score, `Ishikawa: ${selectedProblem?.title}`);
  };

  // --- VIEW: CUSTOM PROBLEM INPUT (Real World) ---
  if (phase === 'custom_input') {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <button onClick={onExit} className="flex items-center text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="mb-6 flex items-center space-x-3">
            <div className="bg-emerald-100 p-3 rounded-full">
              <PenTool className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Define Your Problem</h2>
              <p className="text-slate-500 text-sm">Describe the real workplace issue you want to solve.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Problem Title</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Printer jams every Tuesday morning"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Context / Details</label>
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
                placeholder="Describe what is happening, where, and when..."
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
              />
            </div>

            <button 
              onClick={startCustomProblem}
              disabled={!customTitle}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              Start Root Cause Analysis <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: SIMULATION SELECTION ---
  if (phase === 'problem') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="flex items-center text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
          </button>
          
          <button 
            onClick={() => setPhase('custom_input')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-emerald-700 text-sm"
          >
            + Create Custom Problem
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-800">Select Training Scenario</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ISHIKAWA_PROBLEMS.map(problem => (
            <div 
              key={problem.id}
              onClick={() => { setSelectedProblem(problem); setPhase('analysis'); }}
              className="bg-white p-6 rounded-xl border border-slate-200 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-purple-700">{problem.title}</h3>
              <p className="text-slate-500 text-sm mb-4">{problem.description}</p>
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-semibold uppercase">
                {problem.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: SOLUTIONS REPORT ---
  if (phase === 'solutions') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex items-start space-x-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-emerald-800">Countermeasures Generated</h2>
            <p className="text-emerald-700 text-sm mt-1">
              {selectedProblem?.isRealWorld 
                ? "Here are AI suggestions for your actual workplace problem. Review them with your team."
                : "Simulation complete. Here are the recommended solutions."}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {solutions.map((sol, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                  sol.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {sol.priority} Priority
                </span>
                <span className="text-slate-300 font-bold text-4xl opacity-20">0{idx+1}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">{sol.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{sol.description}</p>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Implementation Steps</p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {sol.steps.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={finishGame} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center">
            {selectedProblem?.isRealWorld ? 'Save to Dashboard' : 'Complete Simulation'} <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: ANALYSIS (FISHBONE DIAGRAM) ---
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
         <div className="text-right">
           <p className="text-xs text-slate-400 uppercase font-bold">Causes Identified</p>
           <p className="text-2xl font-bold text-slate-800">{causes.length}</p>
         </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden flex-col md:flex-row">
        {/* Cause Builder Panel */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4">Add Root Cause</h3>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category (6M)</label>
              <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
                {ISHIKAWA_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCurrentCategory(cat)}
                    className={`text-[10px] md:text-xs py-2 px-1 rounded border transition-all truncate ${
                      currentCategory === cat 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
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
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24 md:h-32"
              />
            </div>

            <button
              onClick={addCause}
              disabled={!causeText.trim()}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Add to Diagram
            </button>
          </div>
        </div>

        {/* Diagram Visualization Panel */}
        <div className="w-full md:w-2/3 bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-y-auto relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || causes.length < 3}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
              {isGenerating ? 'Analyzing...' : 'Generate Solutions'}
            </button>
          </div>

          <h3 className="font-bold text-slate-400 uppercase tracking-wider text-sm mb-6">Ishikawa Diagram</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ISHIKAWA_CATEGORIES.map(category => {
              const categoryCauses = causes.filter(c => c.category === category);
              return (
                <div key={category} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm min-h-[100px]">
                  <h4 className="text-xs font-bold text-purple-600 uppercase mb-3 pb-2 border-b border-slate-100">{category}</h4>
                  <ul className="space-y-2">
                    {categoryCauses.length === 0 ? (
                      <li className="text-xs text-slate-300 italic">No causes added</li>
                    ) : (
                      categoryCauses.map(cause => (
                        <li key={cause.id} className="text-sm text-slate-700 flex justify-between items-start group">
                          <span>• {cause.text}</span>
                          <button onClick={() => removeCause(cause.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IshikawaGame;