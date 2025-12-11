import React from 'react';
import { Player, Skill } from '../types';
import { AVAILABLE_SKILLS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import * as Icons from 'lucide-react';
import { Lock, CheckCircle2, Star } from 'lucide-react';

interface SkillsPageProps {
  player: Player;
}

const SkillsPage: React.FC<SkillsPageProps> = ({ player }) => {
  const { t } = useLanguage();

  // Helper to count specific game types from history
  const getGameCount = (type: string) => {
    return player.recentActivity.filter(log => log.game.toLowerCase().includes(type.toLowerCase())).length;
  };

  const auditCount = getGameCount('Audit') + getGameCount('5S');
  const ishikawaCount = getGameCount('Ishikawa') + getGameCount('Root Cause');

  const checkRequirement = (skill: Skill) => {
    if (skill.requirements.level && player.level < skill.requirements.level) return false;
    if (skill.requirements.auditCount && auditCount < skill.requirements.auditCount) return false;
    if (skill.requirements.ishikawaCount && ishikawaCount < skill.requirements.ishikawaCount) return false;
    if (skill.requirements.totalScore && player.totalScore < skill.requirements.totalScore) return false;
    return true;
  };

  const getProgress = (current: number, required?: number) => {
    if (!required) return 100;
    return Math.min(100, (current / required) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('skills.title')}</h1>
        <p className="text-gray-500">{t('skills.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {AVAILABLE_SKILLS.map((skill) => {
          const isUnlocked = checkRequirement(skill);
          const IconComponent = (Icons as any)[skill.icon] || Icons.Zap;

          return (
            <div 
              key={skill.id}
              className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                isUnlocked 
                  ? 'bg-white border-red-600 shadow-lg' 
                  : 'bg-gray-50 border-gray-200 opacity-90'
              }`}
            >
              {/* Status Badge */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase rounded-bl-xl ${
                isUnlocked 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {isUnlocked ? t('skills.unlocked') : t('skills.locked')}
              </div>

              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isUnlocked ? <IconComponent className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {skill.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-snug">
                      {skill.description}
                    </p>
                  </div>
                </div>

                {/* Benefits Section */}
                {isUnlocked && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4 flex items-center">
                    <Star className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                    <p className="text-xs font-bold text-emerald-800">
                      <span className="uppercase mr-1">{t('skills.benefit')}:</span> 
                      <span className="font-normal text-emerald-700">{skill.benefit}</span>
                    </p>
                  </div>
                )}

                {/* Requirements / Progress Bars */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('skills.requirements')}</p>
                  
                  {skill.requirements.level && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Reach Level {skill.requirements.level}</span>
                        <span className={player.level >= skill.requirements.level ? 'text-green-600 font-bold' : ''}>
                          {player.level}/{skill.requirements.level}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${player.level >= skill.requirements.level ? 'bg-green-500' : 'bg-gray-400'}`}
                          style={{ width: `${getProgress(player.level, skill.requirements.level)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {skill.requirements.auditCount && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Complete {skill.requirements.auditCount} Audits</span>
                        <span className={auditCount >= skill.requirements.auditCount ? 'text-green-600 font-bold' : ''}>
                          {auditCount}/{skill.requirements.auditCount}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${auditCount >= skill.requirements.auditCount ? 'bg-green-500' : 'bg-gray-400'}`}
                          style={{ width: `${getProgress(auditCount, skill.requirements.auditCount)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {skill.requirements.ishikawaCount && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Complete {skill.requirements.ishikawaCount} Ishikawa Diagrams</span>
                        <span className={ishikawaCount >= skill.requirements.ishikawaCount ? 'text-green-600 font-bold' : ''}>
                          {ishikawaCount}/{skill.requirements.ishikawaCount}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${ishikawaCount >= skill.requirements.ishikawaCount ? 'bg-green-500' : 'bg-gray-400'}`}
                          style={{ width: `${getProgress(ishikawaCount, skill.requirements.ishikawaCount)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {skill.requirements.totalScore && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Earn {skill.requirements.totalScore} Total Score</span>
                        <span className={player.totalScore >= skill.requirements.totalScore ? 'text-green-600 font-bold' : ''}>
                          {player.totalScore >= 1000 ? (player.totalScore/1000).toFixed(1)+'k' : player.totalScore}/{skill.requirements.totalScore}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${player.totalScore >= skill.requirements.totalScore ? 'bg-green-500' : 'bg-gray-400'}`}
                          style={{ width: `${getProgress(player.totalScore, skill.requirements.totalScore)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Unlock Animation Overlay if just unlocked? (Optional future feature) */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsPage;