import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Badge } from '../types';

type AnimationType = 'levelup' | 'badge' | 'xp' | 'confetti';

interface QueuedAnimation {
  id: string;
  type: AnimationType;
  payload: any;
}

interface AnimationContextValue {
  triggerLevelUp: (level: number) => void;
  triggerBadgeUnlock: (badge: Badge) => void;
  triggerXPGain: (amount: number) => void;
  triggerConfetti: () => void;
  currentReward: QueuedAnimation | null;
  completeReward: () => void;
  showConfetti: boolean;
}

const AnimationContext = createContext<AnimationContextValue | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueuedAnimation[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerLevelUp = useCallback((level: number) => {
    setQueue(prev => [...prev, { id: `lvl-${level}-${Date.now()}`, type: 'levelup', payload: level }]);
  }, []);

  const triggerBadgeUnlock = useCallback((badge: Badge) => {
    setQueue(prev => [...prev, { id: `badge-${badge.id}-${Date.now()}`, type: 'badge', payload: badge }]);
  }, []);

  const triggerXPGain = useCallback((amount: number) => {
    // XP gain can be immediate or handled elsewhere, but we track it for UI sync
  }, []);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  const completeReward = useCallback(() => {
    setQueue(prev => prev.slice(1));
  }, []);

  const currentReward = queue.length > 0 ? queue[0] : null;

  return (
    <AnimationContext.Provider value={{ 
      triggerLevelUp, 
      triggerBadgeUnlock, 
      triggerXPGain, 
      triggerConfetti,
      currentReward,
      completeReward,
      showConfetti
    }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};