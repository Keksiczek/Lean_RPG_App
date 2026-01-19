import React from 'react';
import { Achievement } from '../types';
import { CheckCircle2, CircleDashed, Trophy } from 'lucide-react';
import AchievementSkeleton from './skeletons/AchievementSkeleton';
import ProgressBarAnimated from './animations/ProgressBarAnimated';

interface AchievementTrackerProps {
  achievements: Achievement[];
  loading?: boolean;
}

const AchievementTracker: React.FC<AchievementTrackerProps> = ({ achievements, loading }) => {
  if (loading) {
    return <AchievementSkeleton count={4} />;
  }

  const completed = achievements.filter(a => a.completed);
  const inProgress = achievements.filter(a => !a.completed);

  const renderAchievement = (ach: Achievement) => {
    const progress = ach.targetValue && ach.currentValue 
      ? Math.min(100, Math.round((ach.currentValue / ach.targetValue) * 100))
      : ach.completed ? 100 : 0;

    return (
      <div 
        key={ach.id} 
        className={`p-4 rounded-xl border transition-all duration-500 ${
          ach.completed 
            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-100/20' 
            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-colors duration-500 ${ach.completed ? 'bg-emerald-500 text-white animate-bounce' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
              {ach.completed ? <CheckCircle2 className="w-5 h-5" /> : <CircleDashed className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{ach.title}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-tight">{ach.description}</p>
            </div>
          </div>
          {ach.completed && (
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded uppercase animate-pulse">
              Unlocked
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-slate-500 mb-1 px-1">
            <span>{progress}% Complete</span>
            <span>{ach.currentValue ?? 0} / {ach.targetValue ?? 1}</span>
          </div>
          <ProgressBarAnimated 
            value={progress} 
            color={ach.completed ? 'bg-emerald-500' : 'bg-blue-500'}
            height="sm"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {inProgress.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
            <CircleDashed className="w-4 h-4 mr-2" /> In Progress ({inProgress.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgress.map(renderAchievement)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4 flex items-center">
            <Trophy className="w-4 h-4 mr-2" /> Completed ({completed.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-90">
            {completed.map(renderAchievement)}
          </div>
        </section>
      )}

      {achievements.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-slate-600 italic">
          No achievements recorded yet.
        </div>
      )}
    </div>
  );
};

export default AchievementTracker;