import React from 'react';
import { ViewState } from '../types';
import { ClipboardCheck, GitBranch, ArrowRight, ScanLine, Briefcase, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GameHubProps {
  onSelectGame: (view: ViewState, isRealWorld?: boolean) => void;
  level: number;
}

const GameHub: React.FC<GameHubProps> = ({ onSelectGame, level }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hub.title')}</h1>
        <p className="text-gray-500">{t('hub.subtitle')}</p>
      </div>

      {/* SECTION 1: REAL WORLD APPLICATION */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
        {/* Red accent glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16 animate-pulse"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-red-500" /> 
              {t('hub.realWorld')}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{t('hub.realWorldDesc')}</p>
          </div>
          <span className="bg-red-900/40 border border-red-500/30 text-red-200 text-xs px-3 py-1 rounded-full font-bold">
            {t('hub.backendConnected')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Real World 5S Scanner */}
          <button 
            onClick={() => onSelectGame(ViewState.GAME_AUDIT, true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-all group flex flex-col h-full hover:border-red-500/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <ScanLine className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-bold text-lg mb-1">{t('hub.createRedTag')}</h3>
            <p className="text-sm text-gray-400">{t('hub.createRedTagDesc')}</p>
          </button>

          {/* Real World Problem Solver */}
          <button 
            onClick={() => onSelectGame(ViewState.GAME_ISHIKAWA, true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-all group flex flex-col h-full hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-bold text-lg mb-1">{t('hub.solveProblem')}</h3>
            <p className="text-sm text-gray-400">{t('hub.solveProblemDesc')}</p>
          </button>
        </div>
      </div>

      {/* SECTION 2: TRAINING SIMULATIONS */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 ml-1">{t('hub.simulation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 5S Audit Game Card */}
          <div 
            onClick={() => onSelectGame(ViewState.GAME_AUDIT, false)}
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-red-400 transition-all duration-300"
          >
            <div className="h-28 bg-red-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 opacity-90" />
              <ClipboardCheck className="absolute bottom-4 right-4 text-white/20 w-24 h-24 transform rotate-12 group-hover:scale-110 transition-transform" />
              <div className="absolute bottom-4 left-6 text-white">
                <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border border-white/20">Level 1</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('hub.virtualAudit')}</h3>
              <p className="text-gray-500 text-sm mb-4">
                {t('hub.virtualAuditDesc')}
              </p>
              <div className="flex items-center text-red-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                {t('hub.start')} <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>

          {/* Ishikawa Game Card */}
          <div 
            onClick={() => onSelectGame(ViewState.GAME_ISHIKAWA, false)}
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-400 transition-all duration-300"
          >
            <div className="h-28 bg-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-90" />
              <GitBranch className="absolute bottom-4 right-4 text-white/20 w-24 h-24 transform -rotate-12 group-hover:scale-110 transition-transform" />
              <div className="absolute bottom-4 left-6 text-white">
                <span className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border border-white/20">Level 2</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('hub.ishikawaSim')}</h3>
              <p className="text-gray-500 text-sm mb-4">
                {t('hub.ishikawaSimDesc')}
              </p>
              <div className="flex items-center text-gray-700 font-medium text-sm group-hover:translate-x-1 transition-transform">
                {t('hub.start')} <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;