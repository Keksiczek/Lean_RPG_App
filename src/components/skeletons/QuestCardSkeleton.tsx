import React from 'react';
import Skeleton from '../ui/Skeleton';

const QuestCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <Skeleton variant="rounded" width={56} height={56} className="rounded-2xl" />
        <Skeleton variant="rounded" width={60} height={24} className="rounded-full" />
      </div>
      <Skeleton variant="text" width="70%" height={24} className="mb-3" />
      <div className="flex-1">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
      </div>
      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="20%" />
      </div>
    </div>
  );
};

export default QuestCardSkeleton;