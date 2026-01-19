
import React from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Award, 
  TrendingUp, 
  Clock, 
  Zap, 
  ChevronRight,
  MessageSquare,
  Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { useFetch } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
import ApiError from '../../components/ui/ApiError';
import Skeleton from '../../components/ui/Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
/* FIX: Added import for cn utility */
import { cn } from '../../utils/themeColors';

const AdminDashboard: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const { data: stats, loading, error, refetch } = useFetch<any>(ENDPOINTS.ADMIN.STATS);

  if (error) return <ApiError error={error} onRetry={refetch} />;

  const chartColor = "#EF4444";
  
  const activityData = stats?.activityHistory || [
    { date: 'Mon', active: 20 }, { date: 'Tue', active: 45 }, { date: 'Wed', active: 38 },
    { date: 'Thu', active: 62 }, { date: 'Fri', active: 55 }, { date: 'Sat', active: 30 }, { date: 'Sun', active: 25 },
  ];

  const questStats = [
    { name: '5S Audit', count: 124 },
    { name: 'LPA', count: 86 },
    { name: 'Ishikawa', count: 42 },
    { name: 'Gemba', count: 68 },
  ];

  const badgeDistribution = [
    { name: 'Common', value: 400 },
    { name: 'Uncommon', value: 300 },
    { name: 'Rare', value: 200 },
    { name: 'Epic', value: 80 },
    { name: 'Legendary', value: 20 },
  ];

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        {/* FIX: Using imported cn utility */}
        <div className={cn("p-3 rounded-xl bg-opacity-10", color.replace('text-', 'bg-'))}>
          {/* FIX: Using imported cn utility */}
          <Icon className={cn("w-6 h-6", color)} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub}</span>
      </div>
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{loading ? '...' : value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitoring Lean implementation across the organization.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-slate-900 dark:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all">
              <Plus className="w-4 h-4" /> Create Quest
           </button>
           <button className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
              <MessageSquare className="w-4 h-4" /> Broadcast
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || '2,481'} sub="+12% this month" icon={Users} color="text-blue-500" />
        <StatCard title="Completed Quests" value={stats?.completedQuests || '18,242'} sub="avg. 8.2 per user" icon={ClipboardCheck} color="text-emerald-500" />
        <StatCard title="Active Today" value={stats?.activeToday || '156'} sub="6.2% of total" icon={Zap} color="text-amber-500" />
        <StatCard title="Average XP" value={stats?.avgXp || '4,250'} sub="Level 4 median" icon={Award} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-blue-500" />
                   User Engagement (30d)
                </h3>
                <div className="flex items-center gap-2">
                   <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                   <span className="text-xs font-bold text-slate-500">Unique Sessions</span>
                </div>
             </div>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="active" stroke={chartColor} fillOpacity={1} fill="url(#colorAct)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
             <h3 className="font-bold text-slate-900 dark:text-white mb-6">Popular Methodology Modules</h3>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                       {questStats.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#EF4444' : '#1F2937'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Badge Rarity Split</h3>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={badgeDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {badgeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#94a3b8', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                 {badgeDistribution.map((b, i) => (
                    <div key={b.name} className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#94a3b8', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][i]}}></div>
                          <span className="text-xs font-bold text-slate-500">{b.name}</span>
                       </div>
                       <span className="text-xs font-black text-slate-900 dark:text-white">{b.value}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                 <Clock className="w-4 h-4 text-red-500" />
                 Recent Activity
              </h3>
              <div className="space-y-4">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="flex gap-3 items-start border-l-2 border-slate-700 pl-4 py-1">
                      <div className="flex-1">
                         <p className="text-xs font-bold">New Quest Created</p>
                         <p className="text-[10px] text-slate-400">Lean Sensei • 2h ago</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-2 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all">View Full Audit Log</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
