import React, { useEffect, useState } from 'react';
import { Zap, Trophy, Star } from 'lucide-react';
import Confetti from './Confetti';

interface LevelUpEffectProps {
  newLevel: number;
  onComplete?: () => void;
}

const LevelUpEffect: React.FC<LevelUpEffectProps> = ({ newLevel, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete?.(), 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-fade-in" />
      
      <Confetti active={true} particleCount={100} />
      
      <div className="relative text-center animate-level-reveal">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-amber-500 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-amber-400 bg-slate-900 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)]">
            <Trophy className="w-16 h-16 md:w-24 md:h-24 text-amber-400 mb-2 animate-bounce" />
            <div className="text-white font-black text-6xl md:text-8xl tabular-nums">
              {newLevel}
            </div>
          </div>
          
          {/* Decorative Sparks */}
          <Star className="absolute top-0 right-0 w-8 h-8 text-amber-300 animate-pulse" />
          <Star className="absolute bottom-4 left-0 w-6 h-6 text-amber-300 animate-pulse delay-75" />
          <Zap className="absolute top-1/4 -left-8 w-10 h-10 text-yellow-400 animate-bounce" />
        </div>
        
        <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 drop-shadow-xl">
          Level Up!
        </h2>
        <p className="text-amber-400 text-lg md:text-xl font-bold uppercase tracking-widest animate-pulse">
          New Capabilities Unlocked
        </p>
      </div>
    </div>
  );
};

export default LevelUpEffect;