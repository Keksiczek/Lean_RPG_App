
import React, { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useApi';
import { ENDPOINTS } from '../../config';
import { Badge, Achievement } from '../../types';
import { 
  Award, 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Zap,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '../../utils/themeColors';
import ApiError from '../../components/ui/ApiError';
import Skeleton from '../../components/ui/Skeleton';

const BadgeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements'>('badges');
  
  const { data: badges, loading: lBadges, error: eBadges, refetch: rBadges } = useFetch<Badge[]>(ENDPOINTS.ADMIN.BADGES);
  const { data: achievements, loading: lAchievs, error: eAchievs, refetch: rAchievs } = useFetch<Achievement[]>(ENDPOINTS.ADMIN.ACHIEVEMENTS);

  if (eBadges || eAchievs) return <ApiError error={eBadges || eAchievs} onRetry={() => { rBadges(); rAchievs(); }} />;

  const rarityColors = {
    common: 'text-gray-400 border-gray-200',
    uncommon: 'text-emerald-500 border-emerald-200',
    rare: 'text-blue-500 border-blue-200',
    epic: 'text-purple-500 border-purple-200',
    legendary: 'text-amber-500 border-amber-300',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Reward Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure gamification assets and unlock rules.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800 flex shadow-sm">
           <button 
             onClick={() => setActiveTab('badges')}
             className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2", activeTab === 'badges' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-gray-50")}
           >
             <Award className="w-4 h-4" /> Badges
           </button>
           <button 
             onClick={() => setActiveTab('achievements')}
             className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2", activeTab === 'achievements' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-gray-50")}
           >
             <Trophy className="w-4 h-4" /> Achievements
           </button>
        </div>
      </div>

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-red-500/30 transition-all min-h-[250px]">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                 <Plus className="w-8 h-8 text-red-600" />
              </div>
              <p className="font-black uppercase tracking-tighter text-slate-400 group-hover:text-red-600 transition-colors">Create New Badge</p>
           </div>
           
           {(lBadges ? Array.from({ length: 3 }) : (badges || [])).map((badge, idx) => (
              !badge ? <Skeleton key={idx} variant="rectangular" height={250} className="rounded-[2rem]" /> : (
              <div key={badge.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 p-6 flex flex-col shadow-sm group hover:shadow-xl transition-all">
                 <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 shadow-inner", rarityColors[badge.rarity])}>
                       <Award className="w-8 h-8" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:text-blue-500"><Edit className="w-3 h-3" /></button>
                       <button className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                 </div>
                 <h3 className="font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">{badge.name}</h3>
                 <p className="text-xs text-slate-500 mb-4 line-clamp-2">{badge.description}</p>
                 <div className="mt-auto pt-4 border-t dark:border-slate-800 flex justify-between items-center">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", rarityColors[badge.rarity])}>
                       {badge.rarity}
                    </span>
                    <span className="text-xs font-black text-amber-500 flex items-center"><Zap className="w-3 h-3 mr-1 fill-current" /> +{badge.xpBonus}</span>
                 </div>
              </div>
           )))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
           <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">Active Achievement Library</h3>
              <button className="bg-slate-900 dark:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add Achievement
              </button>
           </div>
           <div className="divide-y divide-gray-50 dark:divide-slate-800">
              {(lAchievs ? Array.from({ length: 5 }) : (achievements || [])).map((ach, idx) => (
                !ach ? <div key={idx} className="p-4"><Skeleton variant="text" /></div> : (
                <div key={ach.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                   <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-900/30">
                      <Trophy className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                      <p className="font-black uppercase tracking-tight text-slate-900 dark:text-white">{ach.title}</p>
                      <p className="text-xs text-slate-500">{ach.description}</p>
                   </div>
                   <div className="text-center w-24">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Target</p>
                      <p className="font-black text-slate-900 dark:text-white">{ach.targetValue}</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              )))}
           </div>
        </div>
      )}
    </div>
  );
};

export default BadgeManagement;
