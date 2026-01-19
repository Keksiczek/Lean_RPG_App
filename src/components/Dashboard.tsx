
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
      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 group hover:border-red-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-red-500/20"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-4 rounded-2xl bg-opacity-10 dark:bg-opacity-20 transition-transform group-hover:scale-110", color)}>
          <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</p>
      </div>
    </button>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ player, loading, onNavigate }) => {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { data: leaderboardData } = useFetch<LeaderboardEntry[]>(ENDPOINTS.GAMIFICATION.LEADERBOARD_TRENDING);

  if (loading || !player) return <DashboardSkeleton />;

  const chartData = player.recentActivity.length > 0 
    ? player.recentActivity.map((a, i) => ({ name: `G${i+1}`, score: a.score }))
    : [{name: '0', score: 0}, {name: '1', score: 10}, {name: '2', score: 40}, {name: '3', score: 20}];

  const isManager = [UserRole.TEAM_LEADER, UserRole.CI_SPECIALIST, UserRole.ADMIN].includes(player.role as UserRole);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">CI Command Center</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">{t('dashboard.welcome')}</p>
      </header>

      {/* Interactive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          trend="Trend Up"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden transition-all hover:shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center">
                <TrendingUp className="w-5 h-5 mr-3 text-red-600" /> Operational Accuracy Trend
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase">Real-time Data Feed</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#fff', 
                      border: 'none', 
                      borderRadius: '16px', 
                      color: isDark ? '#fff' : '#000',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                    }}
                    itemStyle={{ color: '#ef4444', fontWeight: '900', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#ef4444" fillOpacity={1} fill="url(#colorScore)" strokeWidth={5} dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: isDark ? '#0f172a' : '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Clickable overlay to game hub */}
            <button 
              onClick={() => onNavigate(ViewState.GAME_HUB)}
              className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/5 transition-colors flex items-center justify-center group"
            >
              <span className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0 duration-500 border border-slate-100 dark:border-slate-700">Enter Training Simulation</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Merit Badges & Achievements</h3>
              <button onClick={() => onNavigate(ViewState.PROFILE)} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline transition-all">View Hall of Fame</button>
            </div>
            <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide px-2">
              {AVAILABLE_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = player.achievements.some(a => a.id === ach.id);
                const Icon = (Icons as any)[ach.icon] || Trophy;
                return (
                  <button 
                    key={ach.id} 
                    onClick={() => !isUnlocked && onNavigate(ViewState.GAME_HUB)}
                    className={cn(
                    "min-w-[160px] p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center transition-all group",
                    isUnlocked 
                      ? "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/40 shadow-xl hover:scale-105" 
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 opacity-40 grayscale hover:opacity-80 transition-all duration-500"
                  )}>
                    <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12", isUnlocked ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 shadow-inner" : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase mb-2 tracking-tight line-clamp-2">{ach.title}</h4>
                    {!isUnlocked && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">Locked</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative border border-white/5 transition-all hover:shadow-red-900/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8 flex items-center">
              <Users className="w-4 h-4 mr-3 text-red-500" /> Plant Global Leaderboard
            </h3>
            <div className="space-y-6">
              {leaderboardData?.slice(0, 3).map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-black text-slate-500 w-5">#{entry.rank}</span>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs border border-slate-700 group-hover:border-red-500 transition-all group-hover:rotate-6">
                      {entry.userName.charAt(0)}
                    </div>
                    <div>
                        <span className="text-sm font-black truncate max-w-[120px] block leading-none">{entry.userName}</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 block">Lvl {entry.level} Specialist</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-amber-500 font-black tracking-tight">{entry.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate(ViewState.LEADERBOARD)}
              className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95"
            >
              Expand Full Hall of Fame
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">CI Service Log</h3>
            <div className="space-y-6">
              {player.recentActivity.slice(0, 3).map((act) => (
                <div key={act.id} className="flex justify-between items-start border-b dark:border-slate-800 pb-5 last:border-0 last:pb-0 group">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white truncate max-w-[140px] group-hover:text-red-600 transition-colors tracking-tight">{act.game}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(act.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600 leading-none">+{act.xp} XP</p>
                    <p className="text-[10px] text-slate-400 font-black mt-2 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block">{act.score}%</p>
                  </div>
                </div>
              ))}
              {player.recentActivity.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs font-medium italic">No recent training logs found.</div>
              )}
            </div>
            <button 
              onClick={() => onNavigate(ViewState.GAME_HUB)}
              className="w-full mt-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-red-600 transition-all border-t dark:border-slate-800 pt-8"
            >
              Initialize Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
