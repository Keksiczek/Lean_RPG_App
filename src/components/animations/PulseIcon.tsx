import React from 'react';

interface PulseIconProps {
  icon: React.ReactNode;
  active?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PulseIcon: React.FC<PulseIconProps> = ({
  icon,
  active = true,
  color = 'bg-red-500',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      {active && (
        <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${color}`} />
      )}
      <div className="relative z-10">
        {icon}
      </div>
    </div>
  );
};

export default PulseIcon;