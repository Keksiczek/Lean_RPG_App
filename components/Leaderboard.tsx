import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, Player } from '../types';
import { gameService } from '../services/gameService';
import { useLanguage } from '../contexts/LanguageContext';
import { Trophy, Medal, Crown, User, Star } from 'lucide-react';

interface LeaderboardProps {
  currentUser: Player;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const data = await gameService.getLeaderboard();
        // Dynamically update 'You' in mock data to reflect current user stats
        const updatedData = data.map(entry => {
            if (entry.id === currentUser.id || (entry.id as any) === 'u1') { // Match mock ID or real ID
                return {
                    ...entry,
                    id: currentUser.id,
                    username: `${currentUser.username} (You)`,
                    level: currentUser.level,
                    totalXp: currentUser.totalXp,
                    totalScore: currentUser.totalScore
                }
            }
            return entry;
        }).sort((a, b) => b.totalScore - a.totalScore)
          .map((entry, index) => ({ ...entry, rank: index + 1 })); // Recalculate rank

        setRankings(updatedData);
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [currentUser]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" fill="currentColor" />;
      case 2: return <Medal className="w-6 h-6 text-slate-400" fill="currentColor" />;
      case 3: return <Medal className="w-6 h-6 text-amber-700" fill="currentColor" />;
      default: return <span className="text-slate-500 font-bold w-6 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
      switch (rank) {
          case 1: return 'bg-yellow-50 border-yellow-200';
          case 2: return 'bg-slate-50 border-slate-200';
          case 3: return 'bg-orange-50 border-orange-200';
          default: return 'bg-white border-slate-100';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('leaderboard.title')}</h1>
           <p className="text-slate-500">{t('leaderboard.subtitle')}</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center">
            <User className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-sm text-slate-600 mr-1">{t('leaderboard.rank')}:</span>
            <span className="font-bold text-slate-800">#{rankings.find(r => r.id === currentUser.id)?.rank || '-'}</span>
        </div>
      </div>

      {/* Top 3 Podium (Visual) */}
      {!loading && rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8 items-end max-w-2xl mx-auto h-48">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center mb-[-20px] z-10 relative">
                    <span className="text-xl font-bold text-slate-600">2</span>
                </div>
                <div className="w-full bg-slate-100 h-24 rounded-t-xl border-t border-x border-slate-200 flex flex-col items-center justify-center pt-6 shadow-sm">
                    <p className="font-bold text-slate-700 text-sm truncate w-full text-center px-2">{rankings[1].username}</p>
                    <p className="text-xs text-slate-500">{rankings[1].totalScore} pts</p>
                </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center z-20">
                <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" fill="currentColor" />
                <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-white shadow-xl flex items-center justify-center mb-[-25px] z-10 relative">
                     <span className="text-2xl font-bold text-yellow-600">1</span>
                </div>
                <div className="w-full bg-gradient-to-b from-yellow-50 to-white h-32 rounded-t-xl border-t border-x border-yellow-200 flex flex-col items-center justify-center pt-8 shadow-md">
                     <p className="font-bold text-slate-800 text-base truncate w-full text-center px-2">{rankings[0].username}</p>
                     <p className="text-xs text-yellow-600 font-bold">{rankings[0].totalScore} pts</p>
                </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-white shadow-lg flex items-center justify-center mb-[-20px] z-10 relative">
                     <span className="text-xl font-bold text-orange-700">3</span>
                </div>
                <div className="w-full bg-orange-50 h-20 rounded-t-xl border-t border-x border-orange-200 flex flex-col items-center justify-center pt-6 shadow-sm">
                     <p className="font-bold text-slate-700 text-sm truncate w-full text-center px-2">{rankings[2].username}</p>
                     <p className="text-xs text-slate-500">{rankings[2].totalScore} pts</p>
                </div>
            </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-16 text-center">{t('leaderboard.rank')}</div>
            <div className="flex-1">{t('leaderboard.player')}</div>
            <div className="w-24 text-center">{t('leaderboard.level')}</div>
            <div className="w-24 text-right pr-4">{t('leaderboard.score')}</div>
        </div>
        
        {loading ? (
             <div className="p-8 text-center text-slate-400">Loading rankings...</div>
        ) : (
            <div className="divide-y divide-slate-100">
                {rankings.map((entry) => (
                    <div 
                        key={entry.id} 
                        className={`flex items-center p-4 hover:bg-slate-50 transition-colors ${entry.id === currentUser.id ? 'bg-blue-50/50' : ''}`}
                    >
                        <div className="w-16 flex justify-center">
                            {getRankIcon(entry.rank)}
                        </div>
                        <div className="flex-1 flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-xs ${getRankBg(entry.rank)}`}>
                                {entry.username.charAt(0)}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${entry.id === currentUser.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                    {entry.username}
                                </p>
                                <p className="text-xs text-slate-400">{t('leaderboard.xp')}: {entry.totalXp}</p>
                            </div>
                        </div>
                        <div className="w-24 text-center text-sm font-medium text-slate-600">
                            Lvl {entry.level}
                        </div>
                        <div className="w-24 text-right pr-4 font-bold text-slate-800 font-mono">
                            {entry.totalScore.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;