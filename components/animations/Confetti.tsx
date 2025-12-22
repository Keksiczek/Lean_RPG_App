import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  particleCount = 50,
  colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
}) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + '%',
        size: Math.random() * 8 + 4 + 'px',
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2 + 's',
        duration: Math.random() * 2 + 1 + 's',
        rotation: Math.random() * 360 + 'deg',
        shape: Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm'
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, duration + 2000);
      
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute top-0 animate-confetti-fall ${p.shape}`}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;