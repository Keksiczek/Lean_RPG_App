import React from 'react';
import { useAnimation } from '../contexts/AnimationContext';
import LevelUpEffect from './animations/LevelUpEffect';
import BadgeUnlock from './animations/BadgeUnlock';
import Confetti from './animations/Confetti';

const AnimationLayer: React.FC = () => {
  const { currentReward, completeReward, showConfetti } = useAnimation();

  return (
    <>
      <Confetti active={showConfetti} />
      
      {currentReward?.type === 'levelup' && (
        <LevelUpEffect 
          newLevel={currentReward.payload} 
          onComplete={completeReward} 
        />
      )}
      
      {currentReward?.type === 'badge' && (
        <BadgeUnlock 
          badge={currentReward.payload} 
          onComplete={completeReward} 
        />
      )}
    </>
  );
};

export default AnimationLayer;