import React from 'react';
import Skeleton from '../ui/Skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={300} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
            <Skeleton variant="rounded" width={40} height={40} className="mb-4" />
            <Skeleton variant="text" width="40%" className="mb-1" />
            <Skeleton variant="text" width="70%" height={24} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <Skeleton variant="text" width={150} height={24} className="mb-6" />
            <Skeleton variant="rectangular" height={256} className="rounded-xl" />
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
             <Skeleton variant="text" width={150} height={24} className="mb-6" />
             <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[140px] p-4 rounded-xl border border-gray-100 flex flex-col items-center">
                    <Skeleton variant="circular" width={48} height={48} className="mb-3" />
                    <Skeleton variant="text" width="80%" />
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <Skeleton variant="text" width={150} height={24} className="mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width={80} />
                  </div>
                  <Skeleton variant="text" width={40} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <Skeleton variant="text" width={150} height={24} className="mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div className="space-y-1">
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={60} height={10} />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton variant="text" width={40} />
                    <Skeleton variant="text" width={30} height={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;