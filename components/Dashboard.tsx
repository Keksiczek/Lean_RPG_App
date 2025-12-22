
import React from 'react';
import { Player, LeaderboardEntry, ViewState, UserRole } from '../types';
import { AVAILABLE_ACHIEVEMENTS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, TrendingUp, Clock, Lock, Users, ChevronRight, Zap, ArrowUpRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFetch } from '../hooks/useApi';
import { useTheme } from '../contexts/ThemeContext';
import { ENDPOINTS } from '../config';
import DashboardSkeleton from './skeletons/DashboardSkeleton';
import { cn } from '../utils/themeColors';

interface DashboardProps {
  player: Player | null;
  loading?: boolean;
  onNavigate: (view: ViewState) => void;
}

const StatCard = ({ title, value, icon: Icon, color, trend, onClick }: any) => {
  return (
    <button 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 group hover:border-red-500/50 hover:shadow-xl hover:-translate-y-1 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-red-500/20"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={cn("p-2.5 rounded-xl bg-opacity-10 dark:bg-opacity-20", color)}>
          <Icon className={cn("w-5 h-5", color.replace('bg-', 'text-'))} />
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
      </div>
    </button>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ player, loading, onNavigate }) => {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { data: leaderboardData } = useFetch<LeaderboardEntry[]>(ENDPOINTS.GAMIFICATION.LEADERBOARD_TRENDING);

  if (loading || !player) return <DashboardSkeleton />;

  const chartData = player.recentActivity.length > 0 
    ? player.recentActivity.map((a, i) => ({ name: `G${i+1}`, score: a.score }))
    : [{name: '0', score: 0}, {name: '1', score: 10}];

  const isManager = player.role === UserRole.TEAM_LEADER || player.role === UserRole.CI_SPECIALIST || player.role === UserRole.ADMIN;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{t('dashboard.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('dashboard.welcome')}</p>
      </header>

      {/* Interaktivní Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('dashboard.totalXp')} 
          value={player.totalXp.toLocaleString()} 
          icon={Zap} 
          color="bg-amber-500" 
          trend="+12%"
          onClick={() => onNavigate(ViewState.LEADERBOARD)}
        />
        <StatCard 
          title={t('dashboard.level')} 
          value={player.level} 
          icon={Trophy} 
          color="bg-red-600"
          onClick={() => onNavigate(ViewState.SKILLS)}
        />
        <StatCard 
          title={t('dashboard.completed')} 
          value={player.gamesCompleted} 
          icon={Target} 
          color="bg-blue-600" 
          trend="New"
          onClick={() => onNavigate(ViewState.GAME_HUB)}
        />
        <StatCard 
          title={t('dashboard.avgScore')} 
          value={`${player.gamesCompleted > 0 ? Math.round(player.totalScore / player.gamesCompleted) : 0}%`} 
          icon={TrendingUp} 
          color="bg-emerald-600"
          onClick={() => isManager ? onNavigate(ViewState.COMPLIANCE_DASHBOARD) : onNavigate(ViewState.GAME_HUB)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-red-600" /> {t('dashboard.performance')}
              </h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#ef4444" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} dot={{ r: 4, fill: '#ef4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Clickable overlay to game hub */}
            <button 
              onClick={() => onNavigate(ViewState.GAME_HUB)}
              className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/5 transition-colors flex items-center justify-center group"
            >
              <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">Open Training Hub</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('dashboard.trophyCase')}</h3>
              <button onClick={() => onNavigate(ViewState.PROFILE)} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">View Full Profile</button>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {AVAILABLE_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = player.achievements.some(a => a.id === ach.id);
                const Icon = (Icons as any)[ach.icon] || Trophy;
                return (
                  <button 
                    key={ach.id} 
                    onClick={() => !isUnlocked && onNavigate(ViewState.GAME_HUB)}
                    className={cn(
                    "min-w-[140px] p-5 rounded-3xl border-2 flex flex-col items-center text-center transition-all",
                    isUnlocked 
                      ? "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 shadow-md" 
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                  )}>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", isUnlocked ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase mb-1 line-clamp-1">{ach.title}</h4>
                    {!isUnlocked && <span className="text-[8px] font-bold text-red-500 uppercase">Go Unlock</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" /> Factory Leaderboard
            </h3>
            <div className="space-y-4">
              {leaderboardData?.slice(0, 3).map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-slate-500 w-4">#{entry.rank}</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs border border-slate-700 group-hover:border-red-500 transition-colors">
                      {entry.userName.charAt(0)}
                    </div>
                    <span className="text-sm font-bold truncate max-w-[100px]">{entry.userName}</span>
                  </div>
                  <span className="font-mono text-xs text-amber-500 font-bold">{entry.xp.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate(ViewState.LEADERBOARD)}
              className="w-full mt-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Full Standings
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t('dashboard.recentActivity')}</h3>
            <div className="space-y-4">
              {player.recentActivity.slice(0, 3).map((act) => (
                <div key={act.id} className="flex justify-between items-center border-b dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white truncate max-w-[120px]">{act.game}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(act.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">+{act.xp} XP</p>
                    <p className="text-[10px] text-slate-400 font-bold">{act.score}%</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate(ViewState.GAME_HUB)}
              className="w-full mt-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
            >
              Start New Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
