import React, { useEffect, useState } from 'react';
import { Player, Badge, Achievement } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, Award, Trophy, Star, Loader2 } from 'lucide-react';
import { gameService } from '../services/gameService';
import { useFetch } from '../hooks/useApi';
import { ENDPOINTS } from '../config';
import BadgeDisplay from '../components/BadgeDisplay';
import AchievementTracker from '../components/AchievementTracker';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [fullProfile, setFullProfile] = useState<Player | null>(user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch gamification data
  const { data: allBadges, loading: loadingBadges } = useFetch<Badge[]>(ENDPOINTS.GAMIFICATION.BADGES);
  const { data: allAchievements, loading: loadingAchievements } = useFetch<Achievement[]>(ENDPOINTS.GAMIFICATION.ACHIEVEMENTS);

  useEffect(() => {
    const refreshProfile = async () => {
      setIsRefreshing(true);
      try {
        const data = await gameService.fetchPlayerProfile();
        setFullProfile(data);
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    if (user) {
        refreshProfile();
    }
  }, [user]);

  if (!fullProfile) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {fullProfile.username.substring(0, 2).toUpperCase()}
                </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{fullProfile.username}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    {fullProfile.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        {fullProfile.role}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Joined: {new Date(fullProfile.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Level</p>
                    <p className="text-2xl font-black text-gray-900">{fullProfile.level}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Total XP</p>
                    <p className="text-2xl font-black text-gray-900">{fullProfile.totalXp.toLocaleString()}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Progress */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Achievements Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                    Achievements
                </h2>
             </div>
             {loadingAchievements ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
             ) : (
                <AchievementTracker achievements={allAchievements || []} />
             )}
          </section>

          {/* Badges Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center">
                    <Star className="w-5 h-5 mr-2 text-purple-500" />
                    My Badges
                </h2>
             </div>
             {loadingBadges ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
             ) : (
                <BadgeDisplay 
                  badges={allBadges || []} 
                  ownedBadgeCodes={fullProfile.achievements.map(a => a.code || '')} 
                />
             )}
          </section>
        </div>

        {/* Right Column: Detailed Stats */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Factory Performance</h2>
              <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-600 font-medium">Games Completed</span>
                      <span className="font-bold text-gray-900">{fullProfile.gamesCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-600 font-medium">Lifetime Score</span>
                      <span className="font-bold text-gray-900">{fullProfile.totalScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-600 font-medium">Avg. Accuracy</span>
                      <span className="font-bold text-emerald-600">
                        {fullProfile.gamesCompleted > 0 ? Math.round(fullProfile.totalScore / fullProfile.gamesCompleted) : 0}%
                      </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 font-medium">Tenant ID</span>
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{fullProfile.tenantId}</span>
                  </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
               <h3 className="font-black uppercase tracking-widest text-[10px] text-red-500 mb-2">Sensei Tip</h3>
               <p className="text-sm leading-relaxed text-slate-300">
                 "Continuous improvement is not about being perfect, it is about being better than you were yesterday."
               </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;