import React, { useState, useEffect } from 'react';
import { Badge } from '../../types';
import { Award, Sparkles, Star, ChevronRight } from 'lucide-react';
import Confetti from './Confetti';

interface BadgeUnlockProps {
  badge: Badge;
  onComplete?: () => void;
}

const rarityGlows = {
  common: 'shadow-[0_0_30px_rgba(156,163,175,0.3)] border-slate-300',
  uncommon: 'shadow-[0_0_30px_rgba(16,185,129,0.4)] border-emerald-400',
  rare: 'shadow-[0_0_30px_rgba(59,130,246,0.4)] border-blue-400',
  epic: 'shadow-[0_0_40px_rgba(139,92,246,0.5)] border-purple-400',
  legendary: 'shadow-[0_0_60px_rgba(245,158,11,0.6)] border-amber-400 animate-pulse-glow',
};

const rarityText = {
  common: 'text-slate-400',
  uncommon: 'text-emerald-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-amber-500',
};

const BadgeUnlock: React.FC<BadgeUnlockProps> = ({ badge, onComplete }) => {
  const [active, setActive] = useState(true);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" />
      
      {badge.rarity === 'legendary' && <Confetti active={true} particleCount={80} />}
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className={`w-24 h-24 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-4 ${rarityGlows[badge.rarity]} transition-all duration-1000`}>
            <Award className={`w-12 h-12 ${rarityText[badge.rarity]}`} />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-1">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${rarityText[badge.rarity]}`}>
              {badge.rarity} Badge Unlocked
            </p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {badge.name}
            </h2>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {badge.description}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-amber-500 font-bold text-xs uppercase">
               <Star className="w-3 h-3 fill-current" />
               Bonus: +{badge.xpBonus} XP Permanent
            </div>
          </div>

          <button
            onClick={() => {
              setActive(false);
              onComplete?.();
            }}
            className="w-full py-4 bg-slate-900 dark:bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            Awesome! <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Decorative elements */}
        <Sparkles className="absolute top-4 left-4 w-6 h-6 text-amber-400/30" />
        <Sparkles className="absolute bottom-10 right-4 w-5 h-5 text-amber-400/30" />
      </div>
    </div>
  );
};

export default BadgeUnlock;