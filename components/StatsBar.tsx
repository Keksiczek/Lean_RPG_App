import React, { useEffect, useState } from 'react';
import { Player } from '../types';
import { Trophy, Zap } from 'lucide-react';

interface StatsBarProps {
  player: Player;
}

const StatsBar: React.FC<StatsBarProps> = ({ player }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const progressPercentage = Math.min(100, (player.currentXp / player.nextLevelXp) * 100);

  // Trigger animation when total XP changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [player.totalXp, player.level]);

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 transition-all duration-300 hover:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-300 flex items-center">
           Level {player.level}
        </span>
        <div className={`transition-transform duration-500 ${isAnimating ? 'scale-125 rotate-12' : ''}`}>
           {player.level >= 5 ? (
             <Trophy className="w-4 h-4 text-amber-500" />
           ) : (
             <Zap className="w-4 h-4 text-red-500" />
           )}
        </div>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden relative">
        <div 
          className="bg-red-600 h-2 rounded-full transition-all duration-1000 ease-out relative z-10"
          style={{ width: `${progressPercentage}%` }}
        >
            {/* Shimmer effect on bar when animating */}
            {isAnimating && (
                <div className="absolute top-0 left-0 h-full w-full bg-white/30 animate-[shine_1s_infinite]"></div>
            )}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span className={`font-mono transition-colors duration-300 ${isAnimating ? 'text-white font-bold' : ''}`}>
          {player.currentXp} / {player.nextLevelXp} XP
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600">
            Next Lvl
        </span>
      </div>
    </div>
  );
};

export default StatsBar;