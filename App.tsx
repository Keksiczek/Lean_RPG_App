import React, { useState } from 'react';
import { ViewState, Player, Achievement } from './types';
import { calculateLevel, checkForNewAchievements } from './utils/gameUtils';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GameHub from './components/GameHub';
import AuditGame from './components/AuditGame';
import IshikawaGame from './components/IshikawaGame';
import FactoryMap from './components/FactoryMap';
import AchievementToast from './components/AchievementToast';
import LeanChatbot from './components/LeanChatbot';
import { LanguageProvider } from './contexts/LanguageContext';

// Initial Mock State
const INITIAL_PLAYER: Player = {
  level: 1,
  currentXp: 0,
  totalXp: 0,
  nextLevelXp: 1000,
  gamesCompleted: 0,
  totalScore: 0,
  recentActivity: [],
  achievements: []
};

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [isRealWorldMode, setIsRealWorldMode] = useState(false);

  const handleGameSelection = (view: ViewState, isRealWorld: boolean = false) => {
    setIsRealWorldMode(isRealWorld);
    setActiveView(view);
  };

  // Handle Game Completion
  const handleGameComplete = (xpEarned: number, score: number, gameName: string) => {
    setPlayer(prev => {
      const newTotalXp = prev.totalXp + xpEarned;
      const { level, nextLevelXp } = calculateLevel(newTotalXp);
      
      const newActivity = {
        id: Math.random().toString(36).substr(2, 9),
        game: gameName,
        score,
        xp: xpEarned,
        date: new Date().toISOString()
      };

      // Create a temporary updated player object for checking achievements
      const updatedPlayerState: Player = {
        ...prev,
        level,
        nextLevelXp,
        totalXp: newTotalXp,
        currentXp: newTotalXp - (prev.totalXp - prev.currentXp >= 0 ? 0 : 0),
        gamesCompleted: prev.gamesCompleted + 1,
        totalScore: prev.totalScore + score,
        recentActivity: [...prev.recentActivity, newActivity]
      };

      // Check for new achievements
      const earnedAchievements = checkForNewAchievements(updatedPlayerState, score, gameName);
      
      if (earnedAchievements.length > 0) {
        setNewAchievement(earnedAchievements[0]); // Show the first one (simple queue logic for MVP)
        updatedPlayerState.achievements = [...prev.achievements, ...earnedAchievements];
      }

      return updatedPlayerState;
    });
    
    // Return to Dashboard after completion
    setActiveView(ViewState.DASHBOARD);
    setIsRealWorldMode(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewState.DASHBOARD:
        return <Dashboard player={player} />;
      case ViewState.FACTORY_MAP:
        return <FactoryMap onNavigate={handleGameSelection} />;
      case ViewState.GAME_HUB:
        return <GameHub onSelectGame={handleGameSelection} level={player.level} />;
      case ViewState.GAME_AUDIT:
        return <AuditGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={isRealWorldMode} />;
      case ViewState.GAME_ISHIKAWA:
        return <IshikawaGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={isRealWorldMode} />;
      default:
        return <Dashboard player={player} />;
    }
  };

  return (
    <Layout activeView={activeView} setView={setActiveView} player={player}>
      {renderContent()}
      <LeanChatbot />
      <AchievementToast 
        achievement={newAchievement} 
        onClose={() => setNewAchievement(null)} 
      />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;