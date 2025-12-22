import React from 'react';
import { Badge } from '../types';
import { Award, Lock, Info } from 'lucide-react';
import BadgeSkeleton from './skeletons/BadgeSkeleton';
import ApiError from './ui/ApiError';

interface BadgeDisplayProps {
  badges: Badge[];
  ownedBadgeCodes?: string[];
  loading?: boolean;
  error?: string | null;
  refetch?: () => void;
}

// Fixed accessibility: standard gray/green/blue/purple/amber variants with high contrast text
const rarityStyles: Record<Badge['rarity'], { border: string; bg: string; text: string; dot: string }> = {
  common: { 
    border: 'border-slate-200 dark:border-slate-800', 
    bg: 'bg-slate-50 dark:bg-slate-900', 
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400'
  },
  uncommon: { 
    border: 'border-emerald-200 dark:border-emerald-900/30', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/10', 
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500'
  },
  rare: { 
    border: 'border-blue-200 dark:border-blue-900/30', 
    bg: 'bg-blue-50 dark:bg-blue-900/10', 
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500'
  },
  epic: { 
    border: 'border-purple-200 dark:border-purple-900/30', 
    bg: 'bg-purple-50 dark:bg-purple-900/10', 
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500'
  },
  legendary: { 
    border: 'border-amber-400 dark:border-amber-900/50', 
    bg: 'bg-amber-50 dark:bg-amber-900/10', 
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500'
  },
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, ownedBadgeCodes = [], loading, error, refetch }) => {
  if (loading) {
    return <BadgeSkeleton count={8} />;
  }

  if (error) {
    return <ApiError error={error} onRetry={refetch} compact />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => {
        const isOwned = ownedBadgeCodes.includes(badge.code);
        const style = rarityStyles[badge.rarity];

        return (
          <div
            key={badge.id}
            className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center ${
              isOwned ? `${style.border} ${style.bg} scale-100 shadow-sm` : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 grayscale opacity-60'
            } hover:translate-y-[-4px] hover:shadow-md`}
          >
            <div className={`mb-3 p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700`}>
              {isOwned ? (
                <Award className={`w-8 h-8 ${style.text}`} />
              ) : (
                <Lock className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              )}
            </div>
            
            <h4 className="font-black text-xs mb-1 text-slate-900 dark:text-slate-100 uppercase tracking-tight">{badge.name}</h4>
            
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isOwned ? style.dot : 'bg-slate-300'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isOwned ? style.text : 'text-slate-400'}`}>
                {badge.rarity}
              </span>
            </div>

            {/* Content preview/hint */}
            <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2 px-2">
              {isOwned ? badge.description : 'Collect this badge to unlock bonus effects.'}
            </p>

            {/* Detailed Overlay on Hover */}
            <div className="absolute inset-0 z-10 bg-slate-900/95 dark:bg-slate-950/98 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-white">
              <Info className="w-4 h-4 mb-2 text-blue-400" />
              <p className="text-[10px] font-medium leading-relaxed text-center px-1">
                {badge.description}
              </p>
              <div className="mt-3 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black text-amber-400 border border-white/10 uppercase tracking-widest">
                +{badge.xpBonus} XP Permanent
              </div>
            </div>

            {!isOwned && (
              <div className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-slate-400 dark:text-slate-600 opacity-50" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BadgeDisplay;