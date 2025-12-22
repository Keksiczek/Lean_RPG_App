
import React, { useState } from 'react';
import { ViewState, Achievement, UserRole } from './types';
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
import TeamManagement from './pages/TeamManagement';
import MethodologyConfig from './pages/MethodologyConfig';
import ComplianceDashboard from './pages/ComplianceDashboard';
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnimationProvider } from './contexts/AnimationContext';
import { ToastProvider } from './contexts/ToastContext';
import { AdminProvider } from './contexts/AdminContext';
import { GuideProvider } from './contexts/GuideContext';
import ToastContainer from './components/ToastContainer';
import AnimationLayer from './components/AnimationLayer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ui/ErrorFallback';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [navigationData, setNavigationData] = useState<any>(null);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>;
  }

  if (!isAuthenticated || !user) return <LoginForm />;

  const handleNavigation = (view: ViewState, data?: any) => {
    setNavigationData(data || null);
    setActiveView(view);
  };

  const handleGameComplete = async (xpEarned: number, score: number, gameName: string) => {
    try {
      await refreshUser();
      const earned = checkForNewAchievements(user, score, gameName);
      if (earned.length > 0) setNewAchievement(earned[0]);
    } catch (e) { console.error(e); }
    setActiveView(ViewState.DASHBOARD);
  };

  const isManager = [UserRole.TEAM_LEADER, UserRole.CI_SPECIALIST, UserRole.ADMIN].includes(user.role as UserRole);

  const renderView = () => {
    switch (activeView) {
      case ViewState.DASHBOARD: return <Dashboard player={user} onNavigate={handleNavigation} />;
      case ViewState.TASKS: return <TaskManager initialTaskId={navigationData?.taskId} />;
      case ViewState.FACTORY_MAP: return <FactoryMap onNavigate={handleNavigation} />;
      case ViewState.GAME_HUB: return <GameHub onSelectGame={handleNavigation} level={user.level} />;
      case ViewState.LEADERBOARD: return <Leaderboard />;
      case ViewState.SKILLS: return <SkillsPage player={user} />;
      case ViewState.PROFILE: return <ProfilePage />;
      case ViewState.SETTINGS_ACCOUNT: return <AccountSettingsPage />;
      case ViewState.GAME_AUDIT: return <AuditGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={navigationData?.isRealWorld} checklist={navigationData?.checklist} initialContext={navigationData?.context} />;
      case ViewState.GAME_LPA: return <LPAGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={navigationData?.isRealWorld} />;
      case ViewState.GAME_ISHIKAWA: return <IshikawaGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={navigationData?.isRealWorld} />;
      
      // Protected Manager Views
      case ViewState.TEAM_MANAGEMENT: 
        return isManager ? <TeamManagement /> : <Dashboard player={user} onNavigate={handleNavigation} />;
      case ViewState.METHODOLOGY_CONFIG: 
        return isManager ? <MethodologyConfig /> : <Dashboard player={user} onNavigate={handleNavigation} />;
      case ViewState.COMPLIANCE_DASHBOARD: 
        return isManager ? <ComplianceDashboard /> : <Dashboard player={user} onNavigate={handleNavigation} />;
      
      default: return <Dashboard player={user} onNavigate={handleNavigation} />;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={handleNavigation} player={user}>
      {renderView()}
      <LeanChatbot activeView={activeView} />
      <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      <AnimationLayer />
    </Layout>
  );
};

const App: React.FC = () => (
  <ErrorBoundary fallback={<ErrorFallback error={null} />}>
    <ThemeProvider>
      <AnimationProvider>
        <ToastProvider>
          <LanguageProvider>
            <AuthProvider>
              <AdminProvider>
                <GuideProvider>
                  <AppContent />
                  <ToastContainer />
                </GuideProvider>
              </AdminProvider>
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </AnimationProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
