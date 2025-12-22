import React from 'react';
import Skeleton from '../ui/Skeleton';

interface LeaderboardSkeletonProps {
  rows?: number;
}

const LeaderboardSkeleton: React.FC<LeaderboardSkeletonProps> = ({ rows = 10 }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex text-xs font-black text-slate-400 uppercase tracking-widest">
        <div className="w-16 text-center">Rank</div>
        <div className="flex-1">Specialist</div>
        <div className="w-24 text-center">Level</div>
        <div className="w-24 text-right pr-4">Total XP</div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center p-4">
            <div className="w-16 flex justify-center">
              <Skeleton variant="circular" width={24} height={24} />
            </div>
            <div className="flex-1 flex items-center">
              <Skeleton variant="circular" width={40} height={40} className="mr-3" />
              <div>
                <Skeleton variant="text" width={100} className="mb-1" />
                <Skeleton variant="text" width={60} height={10} />
              </div>
            </div>
            <div className="w-24 flex justify-center">
              <Skeleton variant="rounded" width={40} height={20} />
            </div>
            <div className="w-24 flex justify-end pr-4">
              <Skeleton variant="text" width={50} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardSkeleton;