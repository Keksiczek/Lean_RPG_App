import React from 'react';
import { Player, LeaderboardEntry } from '../types';
import { AVAILABLE_ACHIEVEMENTS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, TrendingUp, Clock, Lock, Users, ChevronRight, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFetch } from '../hooks/useApi';
import { useTheme } from '../contexts/ThemeContext';
import { ENDPOINTS } from '../config';
import DashboardSkeleton from './skeletons/DashboardSkeleton';
import Skeleton from './ui/Skeleton';
import ApiError from './ui/ApiError';
import ErrorBoundary from './ErrorBoundary';
import XPCounter from './animations/XPCounter';
import PulseIcon from './animations/PulseIcon';

interface DashboardProps {
  player: Player | null;
  loading?: boolean;
}

const StatCard = ({ title, value, previousValue, icon: Icon, color, isXP = false }: any) => (
  <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex items-center md:block space-x-4 md:space-x-0 border-l-4" style={{borderLeftColor: color.includes('red') ? '#DC2626' : color.includes('gray') ? '#4B5563' : '#1F2937'}}>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20 md:mb-4 shrink-0`}>
      <PulseIcon icon={<Icon className={`w-5 h-5 md:w-6 md:h-6 ${color.replace('bg-', 'text-')}`} />} color={color} active={isXP} />
    </div>
    <div>
      <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-slate-400">{title}</h3>
      {isXP ? (
        <XPCounter value={value} previousValue={previousValue} className="text-xl md:text-2xl font-bold text-gray-800 dark:text-slate-100" />
      ) : (
        <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-slate-100">{value}</p>
      )}
    </div>
  </div>
);

const AchievementCard: React.FC<{ achievement: any; locked: boolean }> = ({ achievement, locked }) => {
  const IconComponent = (Icons as any)[achievement.icon] || Trophy;
  return (
    <div className={`min-w-[140px] md:min-w-[160px] p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
      locked 
        ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-60 grayscale' 
        : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 shadow-sm ring-1 ring-amber-100 dark:ring-amber-900/20 hover:scale-105'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
        locked ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
      }`}>
        {locked ? <Lock className="w-5 h-5" /> : <IconComponent className="w-6 h-6 animate-bounce" />}
      </div>
      <h4 className="font-bold text-sm text-gray-800 dark:text-slate-100 mb-1 line-clamp-1">{achievement.title}</h4>
      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{achievement.description}</p>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ player, loading }) => {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { data: leaderboardData, loading: loadingLeaderboard, error: leaderboardError, refetch: refetchLeaderboard } = useFetch<LeaderboardEntry[]>(ENDPOINTS.GAMIFICATION.LEADERBOARD_TRENDING);

  if (loading || !player) {
    return <DashboardSkeleton />;
  }

  const chartData = player.recentActivity.length > 0 
    ? player.recentActivity.map((a, i) => ({ name: `${t('dashboard.game')} ${i+1}`, score: a.score }))
    : [{name: 'Start', score: 0}, {name: 'Now', score: 0}];

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-slate-400">{t('dashboard.welcome')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title={t('dashboard.totalXp')} value={player.totalXp} isXP={true} icon={Trophy} color="bg-amber-500" />
        <StatCard title={t('dashboard.level')} value={player.level} icon={Clock} color="bg-gray-700" />
        <StatCard title={t('dashboard.completed')} value={player.gamesCompleted} icon={Target} color="bg-red-600" />
        <StatCard title={t('dashboard.avgScore')} value={player.gamesCompleted > 0 ? Math.round(player.totalScore / player.gamesCompleted) : 0} icon={TrendingUp} color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ErrorBoundary fallback={<div className="p-10 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 text-center text-red-500 font-bold">Chart could not be rendered.</div>}>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6">{t('dashboard.performance')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#fff', 
                        borderRadius: '8px', 
                        border: `1px solid ${isDark ? '#1e293b' : '#e5e7eb'}`,
                        color: isDark ? '#f8fafc' : '#1e293b'
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#DC2626" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ErrorBoundary>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">{t('dashboard.trophyCase')}</h3>
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded-full">
                {player.achievements.length} / {AVAILABLE_ACHIEVEMENTS.length}
              </span>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {AVAILABLE_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = player.achievements.some(a => a.id === ach.id);
                return <AchievementCard key={ach.id} achievement={ach} locked={!isUnlocked} />;
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {loadingLeaderboard ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="text" width={100} />
                    </div>
                    <Skeleton variant="text" width={40} />
                  </div>
                ))
              ) : leaderboardError ? (
                <ApiError error={leaderboardError} onRetry={refetchLeaderboard} compact />
              ) : (
                leaderboardData?.slice(0, 5).map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:translate-x-1">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 text-xs font-black ${entry.rank === 1 ? 'text-yellow-600' : 'text-gray-400 dark:text-slate-500'}`}>#{entry.rank}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{entry.userName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tight">Level {entry.level}</p>
                      </div>
                    </div>
                    <p className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">{entry.xp.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4">{t('dashboard.recentActivity')}</h3>
            <div className="space-y-4">
              {player.recentActivity.length === 0 ? (
                <p className="text-gray-400 dark:text-slate-500 text-sm italic">{t('dashboard.noActivity')}</p>
              ) : (
                player.recentActivity.slice().reverse().slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0 animate-fade-in-up">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-slate-200 text-sm truncate max-w-[120px]">{activity.game}</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-500 text-sm">+{activity.xp} XP</p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-500">{activity.score} pts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;