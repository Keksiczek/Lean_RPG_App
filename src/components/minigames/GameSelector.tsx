
import React from 'react';
import { ClipboardCheck, GitBranch, Search, Zap, Star, Lock } from 'lucide-react';

interface GameSelectorProps {
  onSelect: (game: 'audit' | 'ishikawa' | 'gemba') => void;
  unlockedLevel: number;
}

const GAMES = [
  {
    id: 'audit',
    title: '5S Audit Sim',
    description: 'Master the 5S steps: Sort, Set in Order, Shine, Standardize, and Sustain.',
    icon: ClipboardCheck,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    difficulty: 'Easy',
    xp: '150+',
    minLevel: 1
  },
  {
    id: 'ishikawa',
    title: 'Fishbone Analysis',
    description: 'Solve complex quality issues using the 6M framework and root cause logic.',
    icon: GitBranch,
    color: 'bg-red-50 text-red-600 border-red-100',
    btnColor: 'bg-red-600 hover:bg-red-700',
    difficulty: 'Medium',
    xp: '250+',
    minLevel: 1
  },
  {
    id: 'gemba',
    title: 'Gemba Walk',
    description: 'Go to the shop floor, observe processes, and identify hidden waste.',
    icon: Search,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    difficulty: 'Hard',
    xp: '400+',
    minLevel: 2
  }
] as const;

const GameSelector: React.FC<GameSelectorProps> = ({ onSelect, unlockedLevel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in">
      {GAMES.map((game) => {
        const isLocked = unlockedLevel < game.minLevel;
        const Icon = game.icon;

        return (
          <div 
            key={game.id}
            className={`group relative bg-white rounded-[2rem] border-2 border-slate-100 p-8 transition-all duration-500 flex flex-col h-full ${
              isLocked ? 'opacity-60 grayscale' : 'hover:border-red-500 hover:shadow-2xl hover:-translate-y-2'
            }`}
          >
            {/* Top Row: Icon & Badge */}
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-2xl shadow-inner ${game.color}`}>
                <Icon className="w-10 h-10" />
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    game.difficulty === 'Easy' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                    game.difficulty === 'Medium' ? 'border-red-200 text-red-700 bg-red-50' :
                    'border-blue-200 text-blue-700 bg-blue-50'
                 }`}>
                    {game.difficulty}
                 </div>
                 <div className="flex items-center text-amber-500 font-black text-sm">
                    <Star className="w-4 h-4 mr-1 fill-current" /> {game.xp} XP
                 </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">
                {game.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {game.description}
              </p>
            </div>

            {/* Action */}
            <button 
              disabled={isLocked}
              onClick={() => onSelect(game.id as any)}
              className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105 ${
                isLocked ? 'bg-slate-300' : game.btnColor
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4" /> Locked Lvl {game.minLevel}
                </>
              ) : (
                <>
                  Start Challenge <Zap className="w-4 h-4 fill-current" />
                </>
              )}
            </button>

            {/* Locked Overlay Sparkle (decorative) */}
            {!isLocked && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-bounce duration-300 group-hover:bg-red-600 transition-colors">
                 +
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameSelector;
