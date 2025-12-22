import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonCardProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm ${className}`}>
      <Skeleton variant="rectangular" height={140} className="rounded-xl mb-4" />
      <Skeleton variant="text" width="60%" className="mb-3" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="80%" />
      <div className="mt-6 flex justify-end">
        <Skeleton variant="rounded" width={100} height={36} />
      </div>
    </div>
  );
};

export default SkeletonCard;