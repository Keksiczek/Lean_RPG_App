import React, { useEffect, useState } from 'react';

interface ProgressBarAnimatedProps {
  value: number; // 0-100
  previousValue?: number;
  color?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
  duration?: number;
  onComplete?: () => void;
}

const ProgressBarAnimated: React.FC<ProgressBarAnimatedProps> = ({
  value,
  previousValue = 0,
  color = 'bg-red-600',
  height = 'md',
  showLabel = false,
  animate = true,
  duration = 1000,
  onComplete
}) => {
  const [displayValue, setDisplayValue] = useState(animate ? previousValue : value);
  const [isFull, setIsFull] = useState(value >= 100);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [value, animate]);

  useEffect(() => {
    if (displayValue >= 100 && !isFull) {
      setIsFull(true);
      onComplete?.();
    } else if (displayValue < 100) {
      setIsFull(false);
    }
  }, [displayValue, onComplete, isFull]);

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
          <span className="text-[10px] font-black text-slate-900 dark:text-white">{Math.round(displayValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 ${heightClasses[height]} rounded-full overflow-hidden relative`}>
        <div
          className={`h-full rounded-full transition-all ease-out shadow-sm relative ${color} ${isFull ? 'animate-pulse' : ''}`}
          style={{ 
            width: `${displayValue}%`,
            transitionDuration: `${duration}ms`
          }}
        >
          {/* Gloss effect */}
          <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] translate-x-[-10%]" />
          
          {/* Active head glow */}
          {displayValue > 0 && displayValue < 100 && (
            <div className={`absolute right-0 top-0 bottom-0 w-2 blur-sm ${color.replace('bg-', 'bg-opacity-50 ')}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBarAnimated;