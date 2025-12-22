import React from 'react';
import Skeleton from '../ui/Skeleton';

interface AchievementSkeletonProps {
  count?: number;
}

const AchievementSkeleton: React.FC<AchievementSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-8">
      <section>
        <Skeleton variant="text" width={150} height={16} className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-start gap-3 mb-4">
                <Skeleton variant="rounded" width={36} height={36} />
                <div className="flex-1">
                  <Skeleton variant="text" width="60%" className="mb-1" />
                  <Skeleton variant="text" width="80%" height={10} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton variant="text" width={40} height={10} />
                  <Skeleton variant="text" width={30} height={10} />
                </div>
                <Skeleton variant="rounded" height={6} className="w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AchievementSkeleton;