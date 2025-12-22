
import React, { useState } from 'react';
import { ViewState, Player, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Map, 
  Award, 
  ClipboardList, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Settings,
  HelpCircle,
  Menu,
  X,
  Zap,
  GitBranch,
  Eye,
  Activity,
  Trophy,
  ChevronRight,
  Search
} from 'lucide-react';
import StatsBar from './StatsBar';
import NotificationCenter from './NotificationCenter';
import UserProfileMenu from './UserProfileMenu';
import ThemeToggle from './ui/ThemeToggle';
import HelpCenter from './interactive/HelpCenter';
import GuideTour from './interactive/GuideTour';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/themeColors';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState, data?: any) => void;
  player: Player;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, player }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const isManager = user?.role === UserRole.TEAM_LEADER || user?.role === UserRole.CI_SPECIALIST || user?.role === UserRole.ADMIN;

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => {
    const isActive = activeView === view;
    // Highlight simulations section if active
    const isSimView = [ViewState.GAME_AUDIT, ViewState.GAME_LPA, ViewState.GAME_ISHIKAWA].includes(view);
    
    return (
      <button
        onClick={() => {
          onNavigate(view);
          setIsMobileMenuOpen(false);
        }}
        className={cn(
          "flex items-center w-full px-4 py-2.5 rounded-xl transition-all duration-200 group relative mb-1",
          isActive
            ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
        )}
      >
        <div className={cn(
          "p-1.5 rounded-lg mr-3 transition-colors",
          isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-red-500"
        )}>
          <Icon className="w-4 h-4 shrink-0" />
        </div>
        <span className="text-sm font-bold truncate">{label}</span>
        {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
      </button>
    );
  };

  const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="px-4 mt-6 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{children}</p>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans transition-colors duration-200 overflow-hidden">
      <GuideTour />
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} activeView={activeView} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 h-screen sticky top-0 z-40">
        <div className="p-6 flex flex-col h-full overflow-y-auto scrollbar-hide">
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black transform -skew-x-12 shadow-lg shadow-red-600/20">L</div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">LEAN RPG</h1>
          </div>
          
          <div className="mb-6">
            <StatsBar player={player} />
          </div>

          <nav className="flex-1">
            <SectionHeader>Monitoring</SectionHeader>
            <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label={t('menu.dashboard')} />
            <NavItem view={ViewState.FACTORY_MAP} icon={Map} label={t('menu.factoryMap')} />
            
            <SectionHeader>Live Simulations</SectionHeader>
            <NavItem view={ViewState.GAME_AUDIT} icon={Eye} label="5S Simulation" />
            <NavItem view={ViewState.GAME_LPA} icon={ShieldCheck} label="LPA Guardian" />
            <NavItem view={ViewState.GAME_ISHIKAWA} icon={GitBranch} label="Ishikawa RCA" />

            <SectionHeader>Lean Toolkit</SectionHeader>
            <NavItem view={ViewState.TASKS} icon={ClipboardList} label={t('menu.tasks')} />
            <NavItem view={ViewState.SKILLS} icon={Award} label={t('menu.skills')} />
            <NavItem view={ViewState.LEADERBOARD} icon={Trophy} label={t('menu.leaderboard')} />

            {isManager && (
              <>
                <SectionHeader>Management</SectionHeader>
                <NavItem view={ViewState.COMPLIANCE_DASHBOARD} icon={Activity} label="Compliance Hub" />
                <NavItem view={ViewState.TEAM_MANAGEMENT} icon={Users} label="Team View" />
                <NavItem view={ViewState.METHODOLOGY_CONFIG} icon={Settings} label="Methodology" />
              </>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <button 
              onClick={() => setIsHelpOpen(true)} 
              className="flex items-center w-full px-4 py-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-bold group"
            >
              <HelpCircle className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500" /> Help Center
            </button>
            <div className="flex items-center justify-between px-2">
              <ThemeToggle variant="icon" />
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setLanguage('cs')} className={cn("px-2 py-1 text-[10px] font-black rounded", language === 'cs' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400')}>CZ</button>
                <button onClick={() => setLanguage('en')} className={cn("px-2 py-1 text-[10px] font-black rounded", language === 'en' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400')}>EN</button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="hidden md:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 items-center justify-between px-8 shrink-0 z-30 transition-colors">
          <div className="flex items-center space-x-4">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search database..." 
                  className="bg-slate-100 dark:bg-slate-800 border-0 rounded-full py-2 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
             </div>
          </div>
          <div className="flex items-center space-x-6">
            <NotificationCenter onNavigate={onNavigate} />
            <div className="h-6 w-px bg-slate-200 dark:border-slate-700 mx-2" />
            <UserProfileMenu user={player} onNavigate={onNavigate} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-8 md:p-8 bg-slate-50 dark:bg-slate-950 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
