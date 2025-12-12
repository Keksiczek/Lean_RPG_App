import React, { useState, useEffect } from 'react';
import { ViewState, Player, Achievement } from './types';
import { checkForNewAchievements } from './utils/gameUtils';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GameHub from './components/GameHub';
import AuditGame from './components/AuditGame';
import LPAGame from './components/LPAGame';
import IshikawaGame from './components/IshikawaGame';
import FactoryMap from './components/FactoryMap';
import TaskManager from './components/TaskManager';
import SkillsPage from './components/SkillsPage';
import Leaderboard from './components/Leaderboard';
import AchievementToast from './components/AchievementToast';
import LeanChatbot from './components/LeanChatbot';
import LoginForm from './components/LoginForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuditSessionComponent from './components/AuditSession';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { Loader2 } from 'lucide-react';

// New Pages Imports
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import FactorySettingsPage from './pages/admin/FactorySettingsPage';
import NotificationsPage from './pages/NotificationsPage';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  
  // Game & Navigation State
  const [isRealWorldMode, setIsRealWorldMode] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<string[]>([]);
  const [gameContext, setGameContext] = useState<string>('');
  
  const [navigationData, setNavigationData] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  const handleNavigation = (view: ViewState, data?: any) => {
    if (view !== ViewState.GAME_AUDIT && view !== ViewState.GAME_LPA) {
        setIsRealWorldMode(false);
    }
    
    if (data?.isRealWorld) setIsRealWorldMode(true);
    if (data?.checklist) setActiveChecklist(data.checklist);
    if (data?.context) setGameContext(data.context);

    if (view === ViewState.TASKS && data?.taskId) {
        setNavigationData({ taskId: data.taskId });
    } else {
        setNavigationData(null);
    }
    
    // Pass generic data forward if needed
    if (data) setNavigationData(data);

    setActiveView(view);
  };

  const handleGameComplete = async (xpEarned: number, score: number, gameName: string) => {
    try {
      await refreshUser();
      const earnedAchievements = checkForNewAchievements(user, score, gameName);
      if (earnedAchievements.length > 0) {
        setNewAchievement(earnedAchievements[0]);
      }
    } catch (error) {
      console.error("Failed to sync game result", error);
    }
    
    setActiveView(ViewState.DASHBOARD);
    setIsRealWorldMode(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewState.DASHBOARD:
        return <Dashboard player={user} />;
      case ViewState.TASKS:
        return <TaskManager initialTaskId={navigationData?.taskId} />;
      case ViewState.FACTORY_MAP:
        return <FactoryMap onNavigate={(view, isRealWorld, data) => handleNavigation(view, { isRealWorld, ...data })} />;
      case ViewState.GAME_HUB:
        return <GameHub onSelectGame={(view, isRealWorld) => handleNavigation(view, { isRealWorld })} level={user.level} />;
      case ViewState.LEADERBOARD:
        return <Leaderboard currentUser={user} />;
      case ViewState.SKILLS:
        return <SkillsPage player={user} />;
      case ViewState.ADMIN_DASHBOARD:
        return <AdminDashboard />;
      case ViewState.AUDIT_SESSION:
        return <AuditSessionComponent 
                  onExit={() => setActiveView(ViewState.ADMIN_DASHBOARD)} 
                  onComplete={() => handleGameComplete(100, 100, "Official Audit")}
                  templateId={navigationData?.templateId}
               />;
      // New Profile / Settings Routes
      case ViewState.PROFILE:
        return <ProfilePage />;
      case ViewState.SETTINGS_ACCOUNT:
        return <AccountSettingsPage />;
      case ViewState.SETTINGS_FACTORY:
        return <FactorySettingsPage />;
      case ViewState.NOTIFICATIONS:
        return <NotificationsPage />;

      // Legacy / Training Views
      case ViewState.GAME_AUDIT:
        return <AuditGame 
                  onComplete={handleGameComplete} 
                  onExit={() => setActiveView(ViewState.GAME_HUB)} 
                  isRealWorldStart={isRealWorldMode} 
                  checklist={activeChecklist} 
                  initialContext={gameContext}
               />;
      case ViewState.GAME_LPA:
        return <LPAGame 
                  onComplete={handleGameComplete} 
                  onExit={() => setActiveView(ViewState.GAME_HUB)} 
                  isRealWorldStart={isRealWorldMode} 
               />;
      case ViewState.GAME_ISHIKAWA:
        return <IshikawaGame 
                  onComplete={handleGameComplete} 
                  onExit={() => setActiveView(ViewState.GAME_HUB)} 
                  isRealWorldStart={isRealWorldMode} 
               />;
      default:
        return <Dashboard player={user} />;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={handleNavigation} player={user}>
      {renderContent()}
      <LeanChatbot 
          activeView={activeView} 
          contextData={{
             checklist: activeChecklist,
             gameContext: gameContext
          }}
      />
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
      <AuthProvider>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;