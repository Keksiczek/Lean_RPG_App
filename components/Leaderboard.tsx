import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { useFetch } from '../hooks/useApi';
import { ENDPOINTS } from '../config';
import { Trophy, Medal, Crown, TrendingUp, Filter, Loader2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LeaderboardSkeleton from './skeletons/LeaderboardSkeleton';
import ApiError from './ui/ApiError';

interface LeaderboardProps {
  initialSkill?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ initialSkill }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>(initialSkill || 'trending');
  
  const endpoint = filter === 'trending' 
    ? ENDPOINTS.GAMIFICATION.LEADERBOARD_TRENDING 
    : ENDPOINTS.GAMIFICATION.LEADERBOARD_SKILL(filter);

  const { data: rankings, loading, error, refetch } = useFetch<LeaderboardEntry[]>(endpoint);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500 drop-shadow-md" fill="currentColor" />;
      case 2: return <Medal className="w-6 h-6 text-slate-400 drop-shadow-md" fill="currentColor" />;
      case 3: return <Medal className="w-6 h-6 text-amber-700 drop-shadow-md" fill="currentColor" />;
      default: return <span className="text-gray-400 dark:text-slate-500 font-bold w-6 text-center">{rank}</span>;
    }
  };

  const getTopThreeStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 shadow-yellow-100 dark:shadow-none';
      case 2: return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-slate-100 dark:shadow-none';
      case 3: return 'border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 shadow-orange-100 dark:shadow-none';
      default: return 'border-transparent bg-white dark:bg-slate-900';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
             <Trophy className="w-6 h-6 mr-2 text-amber-500" />
             Hall of Fame
           </h1>
           <p className="text-slate-500 dark:text-slate-400">Global rankings and top performers.</p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-red-500 outline-none w-full text-slate-700 dark:text-slate-300"
            >
              <option value="trending">🔥 Trending Now</option>
              <option value="5s">🧹 5S Specialist</option>
              <option value="lpa">📋 LPA Guardian</option>
              <option value="kaizen">🚀 Kaizen Master</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LeaderboardSkeleton rows={10} />
      ) : error ? (
        <ApiError error={error} onRetry={refetch} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <div className="w-16 text-center">Rank</div>
              <div className="flex-1">Specialist</div>
              <div className="w-24 text-center">Level</div>
              <div className="w-24 text-right pr-4">Total XP</div>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {rankings?.map((entry) => {
                  const isMe = entry.userId === user?.id;
                  const isTopThree = entry.rank <= 3;
                  
                  return (
                    <div 
                        key={entry.userId} 
                        className={`flex items-center p-4 transition-colors ${
                          isMe ? 'bg-red-50 dark:bg-red-900/10 ring-1 ring-inset ring-red-100 dark:ring-red-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        } ${isTopThree ? getTopThreeStyle(entry.rank) : ''}`}
                    >
                        <div className="w-16 flex justify-center">
                            {getRankIcon(entry.rank)}
                        </div>
                        <div className="flex-1 flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 font-bold shadow-inner ${
                                entry.rank === 1 ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400' : 
                                isMe ? 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                                {entry.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${isMe ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                    {entry.userName} {isMe && <span className="text-[10px] font-black ml-1 text-red-400 uppercase tracking-tighter">(YOU)</span>}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight">Active Specialist</p>
                            </div>
                        </div>
                        <div className="w-24 text-center">
                           <span className="text-xs font-black bg-gray-900 dark:bg-slate-700 text-white px-2 py-0.5 rounded">Lvl {entry.level}</span>
                        </div>
                        <div className="w-24 text-right pr-4">
                            <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{entry.xp.toLocaleString()}</p>
                        </div>
                    </div>
                  );
              })}
          </div>
          
          {rankings?.length === 0 && (
            <div className="p-12 text-center text-slate-400 dark:text-slate-600 italic">
               No rankings found for this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;