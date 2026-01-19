import React, { useState } from 'react';
import { ViewState, Quest, Submission } from '../types';
import { ChevronLeft, Loader2, Award, Sparkles, RefreshCw, Trophy, Target, Zap, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFetch } from '../hooks/useApi';
import { ENDPOINTS } from '../config';
import SubmissionStatus from './SubmissionStatus';
import { useAuth } from '../contexts/AuthContext';
import GameSelector from './minigames/GameSelector';
import AuditGame from './minigames/AuditGame';
import IshikawaGame from './minigames/IshikawaGame';
import GembaGame from './minigames/GembaGame';
import QuestCardSkeleton from './skeletons/QuestCardSkeleton';

interface GameHubProps {
  onSelectGame: (view: ViewState, isRealWorld?: boolean) => void;
  level: number;
}

const GameHub: React.FC<GameHubProps> = ({ onSelectGame, level }) => {
  const { t } = useLanguage();
  const { refreshUser, user } = useAuth();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeMinigame, setActiveMinigame] = useState<'audit' | 'ishikawa' | 'gemba' | null>(null);
  const [gameResult, setGameResult] = useState<any>(null);
  
  const { data: quests, loading: loadingQuests } = useFetch<Quest[]>(ENDPOINTS.QUESTS.LIST);

  const handleQuestComplete = async (submission: Submission) => {
    await refreshUser();
  };

  const handleMinigameComplete = async (result: any) => {
    setGameResult(result);
    await refreshUser();
  };

  const resetSelection = () => {
    setSelectedQuest(null);
    setActiveMinigame(null);
    setGameResult(null);
  };

  // --- RENDERING LOGIC ---

  // 1. Result Summary View
  if (gameResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        <div className="bg-slate-900 p-12 text-center text-white relative">
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
           </div>

           <div className="relative z-10">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                 <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Challenge Mastered!</h2>
              <p className="text-slate-400 font-medium">Your activity has been evaluated by the CI committee.</p>
           </div>
        </div>

        <div className="p-10">
           <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">XP Reward</p>
                 <div className="flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 text-amber-500 fill-current" />
                    <span className="text-3xl font-black text-slate-900">+{gameResult.xp}</span>
                 </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                 <div className="flex items-center justify-center gap-2">
                    <Award className="w-6 h-6 text-red-600" />
                    <span className="text-xl font-black text-slate-900 uppercase">Success</span>
                 </div>
              </div>
           </div>

           {gameResult.score !== undefined && (
             <div className="mb-10">
                <div className="flex justify-between items-center mb-2 px-1">
                   <span className="text-sm font-bold text-slate-600">Accuracy Score</span>
                   <span className="text-sm font-black text-red-600">{gameResult.score}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <div 
                     className="h-full bg-red-600 transition-all duration-1000 ease-out"
                     style={{ width: `${gameResult.score}%` }}
                   ></div>
                </div>
             </div>
           )}

           <div className="flex gap-4">
              <button 
                onClick={() => setGameResult(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" /> Play Again
              </button>
              <button 
                onClick={resetSelection}
                className="flex-1 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-slate-800 transition-all"
              >
                Back to Hub
              </button>
           </div>
        </div>
      </div>
    );
  }

  // 2. Active Minigame View
  if (activeMinigame === 'audit') {
    return (
      <div className="animate-fade-in">
        <button onClick={resetSelection} className="flex items-center text-slate-500 mb-6 hover:text-slate-900 font-bold transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> Return to Menu
        </button>
        <AuditGame areaId="wp-1" areaName="Assembly Area A" onComplete={handleMinigameComplete} />
      </div>
    );
  }

  if (activeMinigame === 'ishikawa') {
    return (
      <div className="animate-fade-in">
        <button onClick={resetSelection} className="flex items-center text-slate-500 mb-6 hover:text-slate-900 font-bold transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> Return to Menu
        </button>
        <IshikawaGame problemId="prob-1" problemTitle="High Defect Rate in Painting" onComplete={handleMinigameComplete} />
      </div>
    );
  }

  if (activeMinigame === 'gemba') {
    return (
      <div className="animate-fade-in">
        <button onClick={resetSelection} className="flex items-center text-slate-500 mb-6 hover:text-slate-900 font-bold transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> Return to Menu
        </button>
        <GembaGame areaId="area-gemba" onComplete={handleMinigameComplete} />
      </div>
    );
  }

  // 3. Quest Detail View (AI Evaluation)
  if (selectedQuest) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in pb-20">
        <button 
          onClick={() => setSelectedQuest(null)}
          className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors font-bold"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Quests
        </button>

        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Award className="w-32 h-32 text-slate-900" />
           </div>
           <div className="flex justify-between items-start mb-6">
              <div>
                 <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-50 text-red-600 mb-4 inline-block border border-red-100`}>
                   Quest: {selectedQuest.skillCode}
                 </span>
                 <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{selectedQuest.title}</h1>
              </div>
              <div className="text-right">
                 <p className="text-red-600 font-black text-3xl">+{selectedQuest.xpReward} XP</p>
                 <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border mt-2 inline-block ${
                    selectedQuest.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedQuest.difficulty === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-red-50 text-red-700 border-red-200'
                 }`}>
                    {selectedQuest.difficulty} Difficulty
                 </span>
              </div>
           </div>
           <p className="text-slate-600 leading-relaxed text-lg mb-8">{selectedQuest.description}</p>
           
           <div className="bg-slate-900 border-l-8 border-red-600 p-6 rounded-r-3xl">
              <p className="text-sm text-slate-300 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                <span><strong>Sensei's Requirement:</strong> Submit your detailed Lean methodology steps below. Lean Sensei (Gemini AI) will evaluate your approach based on real-world industrial standards.</span>
              </p>
           </div>
        </div>

        <SubmissionStatus 
          questId={selectedQuest.id} 
          onComplete={handleQuestComplete} 
        />
      </div>
    );
  }

  // 4. Default Hub Home View
  return (
    <div className="space-y-16 animate-fade-in pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">{t('hub.title')}</h1>
        <p className="text-slate-500 text-lg leading-relaxed">{t('hub.subtitle')}</p>
      </div>

      {/* Simulation Minigames Selection */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center">
             <Target className="w-8 h-8 mr-3 text-red-600" />
             Training Simulations
           </h3>
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Mode</p>
        </div>
        <GameSelector onSelect={setActiveMinigame} unlockedLevel={level} />
      </section>

      {/* AI Specialized Quests Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center">
             <Zap className="w-8 h-8 mr-3 text-amber-500" />
             AI Specialized Quests
           </h3>
           <span className="bg-amber-100 text-amber-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-amber-200">
             Evaluated by Gemini
           </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {loadingQuests ? (
              Array.from({ length: 4 }).map((_, i) => <QuestCardSkeleton key={i} />)
           ) : quests?.map(quest => (
              <button 
                key={quest.id}
                onClick={() => setSelectedQuest(quest)}
                className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 hover:border-red-500 text-left transition-all group hover:shadow-2xl hover:-translate-y-1 flex flex-col"
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-slate-900 rounded-2xl group-hover:bg-red-600 text-white transition-colors shadow-lg">
                       <Award className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">+{quest.xpReward} XP</span>
                    </div>
                 </div>
                 <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{quest.title}</h4>
                 <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">{quest.description}</p>
                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization: {quest.skillCode}</span>
                    <div className="flex items-center text-xs font-black text-red-600 uppercase tracking-widest group-hover:gap-2 transition-all">
                       Accept Quest <ChevronRight className="w-4 h-4" />
                    </div>
                 </div>
              </button>
           ))}
           {!loadingQuests && quests?.length === 0 && (
              <div className="col-span-full p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                 <p className="text-slate-400 font-bold text-lg">No specialized quests available at your level. Complete simulations to level up!</p>
              </div>
           )}
        </div>
      </section>

      {/* Real World Action CTA */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 -mr-32 -mt-32 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Ready for Real World Action?</h2>
            <p className="text-slate-400 text-lg max-w-xl">
              Apply your Lean skills to actual manufacturing problems. Use Gemini Vision to scan workstations and generate real corrective actions.
            </p>
          </div>
          <button 
            onClick={() => onSelectGame(ViewState.GAME_AUDIT, true)}
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all hover:scale-105 active:scale-95"
          >
            Real World 5S Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameHub;