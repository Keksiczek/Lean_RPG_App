import React from 'react';
import { Player, Achievement } from '../types';
import { AVAILABLE_ACHIEVEMENTS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, TrendingUp, Clock, Lock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  player: Player;
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center md:block space-x-4 md:space-x-0 border-l-4" style={{borderLeftColor: color.includes('red') ? '#DC2626' : color.includes('gray') ? '#4B5563' : '#1F2937'}}>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 md:mb-4 shrink-0`}>
      <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <h3 className="text-xs md:text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AchievementCard: React.FC<{ achievement: any; locked: boolean }> = ({ achievement, locked }) => {
  const IconComponent = (Icons as any)[achievement.icon] || Trophy;
  return (
    <div className={`min-w-[140px] md:min-w-[160px] p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
      locked 
        ? 'bg-gray-50 border-gray-200 opacity-60 grayscale' 
        : 'bg-white border-amber-200 shadow-sm ring-1 ring-amber-100'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
        locked ? 'bg-gray-200 text-gray-400' : 'bg-amber-100 text-amber-500'
      }`}>
        {locked ? <Lock className="w-5 h-5" /> : <IconComponent className="w-6 h-6" />}
      </div>
      <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">{achievement.title}</h4>
      <p className="text-xs text-gray-500 line-clamp-2">{achievement.description}</p>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ player }) => {
  const { t } = useLanguage();

  // Mock data for chart if activity log is empty
  const chartData = player.recentActivity.length > 0 
    ? player.recentActivity.map((a, i) => ({ name: `${t('dashboard.game')} ${i+1}`, score: a.score }))
    : [{name: 'Start', score: 0}, {name: 'Now', score: 0}];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-500">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid - optimized for mobile 2 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title={t('dashboard.totalXp')} value={player.totalXp.toLocaleString()} icon={Trophy} color="bg-amber-500" />
        <StatCard title={t('dashboard.level')} value={player.level} icon={Clock} color="bg-gray-700" />
        <StatCard title={t('dashboard.completed')} value={player.gamesCompleted} icon={Target} color="bg-red-600" />
        <StatCard title={t('dashboard.avgScore')} value={player.gamesCompleted > 0 ? Math.round(player.totalScore / player.gamesCompleted) : 0} icon={TrendingUp} color="bg-emerald-600" />
      </div>

      {/* Rewards Section - Horizontal Scroll for Mobile */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">{t('dashboard.trophyCase')}</h3>
          <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t('dashboard.performance')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Area type="monotone" dataKey="score" stroke="#DC2626" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('dashboard.recentActivity')}</h3>
          <div className="space-y-4">
            {player.recentActivity.length === 0 ? (
              <p className="text-gray-400 text-sm italic">{t('dashboard.noActivity')}</p>
            ) : (
              player.recentActivity.slice().reverse().slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{activity.game}</p>
                    <p className="text-xs text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 text-sm">+{activity.xp} XP</p>
                    <p className="text-xs text-gray-500">{t('dashboard.score')}: {activity.score}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;