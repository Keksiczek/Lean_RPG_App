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

const rarityColors: Record<Badge['rarity'], string> = {
  common: 'text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900',
  uncommon: 'text-emerald-500 border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10',
  rare: 'text-blue-500 border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10',
  epic: 'text-purple-500 border-purple-200 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/10',
  legendary: 'text-amber-500 border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
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
        const rarityStyle = rarityColors[badge.rarity];

        return (
          <div
            key={badge.id}
            className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center ${
              isOwned ? `${rarityStyle} scale-100` : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 grayscale opacity-60'
            } hover:translate-y-[-4px] hover:shadow-lg`}
          >
            <div className={`mb-3 p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700`}>
              {isOwned ? (
                <Award className="w-8 h-8" />
              ) : (
                <Lock className="w-8 h-8 text-gray-400 dark:text-slate-600" />
              )}
            </div>
            
            <h4 className="font-bold text-sm mb-1 text-gray-800 dark:text-slate-100">{badge.name}</h4>
            <span className="text-[10px] font-black uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full border border-current opacity-70">
              {badge.rarity}
            </span>

            {/* Tooltip on Hover */}
            <div className="absolute inset-0 z-10 bg-black/80 dark:bg-slate-950/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <div className="text-white text-xs">
                <p className="font-bold mb-1 flex items-center justify-center">
                   <Info className="w-3 h-3 mr-1" /> Description
                </p>
                <p className="leading-relaxed opacity-90">{badge.description}</p>
                <p className="mt-2 text-amber-400 font-bold">+{badge.xpBonus} XP Bonus</p>
              </div>
            </div>

            {!isOwned && (
              <div className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-gray-400 dark:text-slate-600" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BadgeDisplay;