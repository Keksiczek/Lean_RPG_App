import React from 'react';
import { ViewState, Player } from '../types';
import { LayoutDashboard, Gamepad2, LogOut, Menu, X, Map, Award, ClipboardList, BarChart2, Shield } from 'lucide-react';
import StatsBar from './StatsBar';
import NotificationCenter from './NotificationCenter';
import UserProfileMenu from './UserProfileMenu'; // Imported the new menu
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState, data?: any) => void;
  setView?: (view: ViewState) => void;
  player: Player;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, setView, player }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isAuditManager } = useAdmin();

  // Helper to support both new onNavigate and legacy setView
  const handleNavigation = (view: ViewState, data?: any) => {
    if (onNavigate) {
        onNavigate(view, data);
    } else if (setView) {
        setView(view);
    }
    setIsSidebarOpen(false);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => handleNavigation(view)}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors border-l-4 ${
        activeView === view
          ? 'bg-red-600 text-white border-red-800 shadow-md'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white border-transparent'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - MAGNA STYLE (Black/Dark Grey) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center text-white font-bold transform skew-x-[-10deg]">L</div>
              <span className="text-xl font-bold text-white tracking-tight">LEAN RPG</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Mobile Notification Placement - Hidden on Desktop */}
            <div className="mb-4 px-4 flex justify-between items-center md:hidden">
               <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</span>
            </div>

            <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label={t('menu.dashboard')} />
            <NavItem view={ViewState.TASKS} icon={ClipboardList} label={t('menu.tasks')} />
            <NavItem view={ViewState.FACTORY_MAP} icon={Map} label={t('menu.factoryMap')} />
            <NavItem view={ViewState.GAME_HUB} icon={Gamepad2} label={t('menu.workplaceHub')} />
            <NavItem view={ViewState.LEADERBOARD} icon={BarChart2} label={t('menu.leaderboard')} />
            <NavItem view={ViewState.SKILLS} icon={Award} label={t('menu.skills')} />
            
            {isAuditManager && (
              <>
                <div className="my-2 border-t border-gray-800"></div>
                <NavItem view={ViewState.ADMIN_DASHBOARD} icon={Shield} label="Admin Console" />
              </>
            )}
          </div>
            
          <div className="px-4 mt-auto mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('menu.player')}</p>
              {/* Integrated StatsBar for Real-time Updates */}
              <StatsBar player={player} />
          </div>

          {/* Language Switcher */}
          <div className="px-4 pb-2">
               <div className="flex bg-gray-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setLanguage('cs')}
                    className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-colors ${language === 'cs' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    CZ
                  </button>
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-colors ${language === 'en' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    EN
                  </button>
               </div>
          </div>
          
          {/* Mobile Only Logout (Desktop has User Menu) */}
          <div className="p-4 border-t border-gray-800 md:hidden">
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              {t('menu.signOut')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Desktop Top Header - NEW */}
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center justify-between px-8 shadow-sm z-20">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                {/* Optional Breadcrumb or Page Title could go here */}
            </div>
            
            <div className="flex items-center space-x-6">
                <NotificationCenter onNavigate={handleNavigation} />
                <div className="h-6 w-px bg-gray-200"></div>
                {/* User Profile Menu Component */}
                <UserProfileMenu user={player} onNavigate={handleNavigation} />
            </div>
        </header>

        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex md:hidden items-center justify-between z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-800">Lean RPG</span>
          {/* Mobile Notification Placement */}
          <div className="bg-gray-900 rounded-lg shadow-sm">
             <NotificationCenter onNavigate={handleNavigation} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;