import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { Trophy, X } from 'lucide-react';
import * as Icons from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  // Dynamic Icon
  const IconComponent = (Icons as any)[achievement.icon] || Trophy;

  return (
    <div 
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 transform transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center border border-slate-700 relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] animate-[shine_2s_infinite]"></div>

        <div className="bg-amber-500/20 p-3 rounded-full mr-4 border border-amber-500/50">
          <IconComponent className="w-8 h-8 text-amber-400" />
        </div>
        
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Achievement Unlocked!</p>
          <h4 className="font-bold text-lg leading-tight">{achievement.title}</h4>
          <p className="text-sm text-slate-400 mt-1">{achievement.description}</p>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-slate-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;