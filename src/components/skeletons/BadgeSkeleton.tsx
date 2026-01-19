import React from 'react';
import Skeleton from '../ui/Skeleton';

interface BadgeSkeletonProps {
  count?: number;
}

const BadgeSkeleton: React.FC<BadgeSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center">
          <Skeleton variant="circular" width={64} height={64} className="mb-4" />
          <Skeleton variant="text" width="50%" className="mb-2" />
          <Skeleton variant="text" width="30%" />
        </div>
      ))}
    </div>
  );
};

export default BadgeSkeleton;