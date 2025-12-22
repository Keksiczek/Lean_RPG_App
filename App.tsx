
import React, { useState, useEffect } from 'react';
import { ViewState, Player, Achievement } from './types';
import { checkForNewAchievements } from './utils/gameUtils';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
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
import AuditSessionComponent from './components/AuditSession';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { AdminProvider } from './contexts/AdminContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnimationProvider } from './contexts/AnimationContext';
import ToastContainer from './components/ToastContainer';
import AnimationLayer from './components/AnimationLayer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ui/ErrorFallback';
import { Loader2 } from 'lucide-react';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import QuestManagement from './pages/admin/QuestManagement';
import TenantSettings from './pages/admin/TenantSettings';
import BadgeManagement from './pages/admin/BadgeManagement';

// Other Pages
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import FactorySettingsPage from './pages/admin/FactorySettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ComplianceDashboard from './pages/ComplianceDashboard';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshUser, isAdmin } = useAuth();
  const { isLoading: isTenantLoading } = useTenant();
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  
  const [isRealWorldMode, setIsRealWorldMode] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<string[]>([]);
  const [gameContext, setGameContext] = useState<string>('');
  const [navigationData, setNavigationData] = useState<any>(null);

  if (isLoading || isTenantLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  const handleNavigation = (view: ViewState, data?: any) => {
    if (!view.toString().startsWith('GAME_')) {
        setIsRealWorldMode(false);
    }
    
    if (data?.isRealWorld) setIsRealWorldMode(true);
    if (data?.checklist) setActiveChecklist(data.checklist);
    if (data?.context) setGameContext(data.context);
    setNavigationData(data || null);
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

  const renderView = () => {
    switch (activeView) {
      // Main App Views
      case ViewState.DASHBOARD: return <Dashboard player={user} />;
      case ViewState.TASKS: return <TaskManager initialTaskId={navigationData?.taskId} />;
      case ViewState.FACTORY_MAP: return <FactoryMap onNavigate={(view, isRealWorld, data) => handleNavigation(view, { isRealWorld, ...data })} />;
      case ViewState.GAME_HUB: return <GameHub onSelectGame={(view, isRealWorld) => handleNavigation(view, { isRealWorld })} level={user.level} />;
      case ViewState.LEADERBOARD: return <Leaderboard initialSkill={navigationData?.skill} />;
      case ViewState.SKILLS: return <SkillsPage player={user} />;
      case ViewState.PROFILE: return <ProfilePage />;
      case ViewState.SETTINGS_ACCOUNT: return <AccountSettingsPage />;
      case ViewState.NOTIFICATIONS: return <NotificationsPage />;
      case ViewState.COMPLIANCE_DASHBOARD: return <ComplianceDashboard />;
      case ViewState.AUDIT_SESSION: return <AuditSessionComponent onExit={() => setActiveView(ViewState.DASHBOARD)} onComplete={() => handleGameComplete(100, 100, "Audit")} templateId={navigationData?.templateId} />;
      case ViewState.GAME_AUDIT: return <AuditGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={isRealWorldMode} checklist={activeChecklist} initialContext={gameContext} />;
      case ViewState.GAME_LPA: return <LPAGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={isRealWorldMode} />;
      case ViewState.GAME_ISHIKAWA: return <IshikawaGame onComplete={handleGameComplete} onExit={() => setActiveView(ViewState.GAME_HUB)} isRealWorldStart={isRealWorldMode} />;
      
      // Admin Views (Only accessible through AdminLayout or RoleGate)
      case ViewState.ADMIN_DASHBOARD: return <AdminDashboard />;
      case ViewState.ADMIN_USERS: return <UserManagement />;
      case ViewState.ADMIN_QUESTS: return <QuestManagement />;
      case ViewState.ADMIN_BADGES: return <BadgeManagement />;
      case ViewState.ADMIN_SETTINGS: return <TenantSettings />;
      case ViewState.ADMIN_REPORTS: return <ComplianceDashboard />;
      
      default: return <Dashboard player={user} />;
    }
  };

  const isAdminView = activeView.toString().startsWith('ADMIN_');

  if (isAdminView) {
    return (
      <AdminLayout activeView={activeView} onNavigate={handleNavigation}>
        {renderView()}
      </AdminLayout>
    );
  }

  return (
    <Layout activeView={activeView} onNavigate={handleNavigation} player={user}>
      {renderView()}
      <LeanChatbot activeView={activeView} contextData={{ checklist: activeChecklist, gameContext: gameContext }} />
      <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      <AnimationLayer />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ThemeProvider>
        <TenantProvider>
          <AnimationProvider>
            <ToastProvider>
              <LanguageProvider>
                <AuthProvider>
                  <AdminProvider>
                    <AppContent />
                    <ToastContainer />
                  </AdminProvider>
                </AuthProvider>
              </LanguageProvider>
            </ToastProvider>
          </AnimationProvider>
        </TenantProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
