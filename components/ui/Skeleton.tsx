import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  className?: string;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  variant = 'rectangular', 
  className = '', 
  animate = true 
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-slate-800';
  const animationClass = animate ? 'animate-pulse' : '';
  
  let variantClasses = '';
  switch (variant) {
    case 'text':
      variantClasses = 'h-4 w-full rounded-sm mb-2 last:mb-0';
      break;
    case 'circular':
      variantClasses = 'rounded-full';
      break;
    case 'rounded':
      variantClasses = 'rounded-lg';
      break;
    case 'rectangular':
    default:
      variantClasses = 'rounded-none';
  }

  const style: React.CSSProperties = {
    width,
    height,
  };

  return (
    <div 
      className={`${baseClasses} ${animationClass} ${variantClasses} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;