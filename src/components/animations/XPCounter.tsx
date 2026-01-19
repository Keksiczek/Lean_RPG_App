import React, { useState, useEffect, useRef } from 'react';

interface XPCounterProps {
  value: number;
  previousValue?: number;
  duration?: number;
  showDelta?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const XPCounter: React.FC<XPCounterProps> = ({
  value,
  previousValue = 0,
  duration = 1500,
  showDelta = true,
  size = 'md',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(previousValue);
  const [delta, setDelta] = useState<number | null>(null);
  const [showDeltaAnim, setShowDeltaAnim] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (value !== displayValue) {
      const diff = value - displayValue;
      if (showDelta && diff !== 0) {
        setDelta(diff);
        setShowDeltaAnim(true);
        setTimeout(() => setShowDeltaAnim(false), 2000);
      }

      const animate = (time: number) => {
        if (startTimeRef.current === null) startTimeRef.current = time;
        const progress = Math.min((time - startTimeRef.current) / duration, 1);
        
        // Ease out quadratic
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const nextValue = Math.floor(previousValue + (value - previousValue) * easeProgress);
        
        setDisplayValue(nextValue);

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          startTimeRef.current = null;
        }
      };

      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [value]);

  const sizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-2xl font-black',
    lg: 'text-5xl font-black'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <span className={`${sizeClasses[size]} tabular-nums transition-all`}>
        {displayValue.toLocaleString()}
      </span>
      {showDeltaAnim && delta !== null && (
        <span className={`absolute -top-6 left-1/2 -translate-x-1/2 font-black animate-float-up pointer-events-none whitespace-nowrap ${delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {delta > 0 ? `+${delta}` : delta} XP
        </span>
      )}
    </div>
  );
};

export default XPCounter;