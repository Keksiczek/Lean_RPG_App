
import React, { useState } from 'react';
import { ViewState, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Award, 
  Settings, 
  BarChart3, 
  ShieldAlert, 
  ChevronRight, 
  Menu, 
  X,
  Building,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../utils/themeColors';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { tenant } = useTenant();

  const menuItems = [
    { id: ViewState.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.ADMIN_USERS, label: 'User Management', icon: Users },
    { id: ViewState.ADMIN_QUESTS, label: 'Quests', icon: ClipboardList },
    { id: ViewState.ADMIN_BADGES, label: 'Badges & Achievements', icon: Award },
    { id: ViewState.ADMIN_SETTINGS, label: 'Tenant Settings', icon: Settings },
    { id: ViewState.ADMIN_REPORTS, label: 'Reports', icon: BarChart3 },
  ];

  const breadcrumbs = [
    { label: 'Admin', active: false },
    { label: menuItems.find(m => m.id === activeView)?.label || 'Overview', active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-50",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-black italic">L</div>
                <span className="font-bold text-slate-900 dark:text-white truncate">{tenant?.name || 'Lean Admin'}</span>
              </div>
            )}
            {!isSidebarOpen && <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-black mx-auto">L</div>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
               {isSidebarOpen ? <ChevronLeft className="w-5 h-5 text-slate-400" /> : <Menu className="w-5 h-5 text-slate-400" />}
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center w-full p-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isSidebarOpen ? "mr-3" : "mx-auto")} />
                  {isSidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
                  {isActive && isSidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-slate-800">
             <button 
               onClick={logout}
               className="flex items-center w-full p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all"
             >
                <LogOut className={cn("w-5 h-5", isSidebarOpen ? "mr-3" : "mx-auto")} />
                {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
             {breadcrumbs.map((crumb, i) => (
               <React.Fragment key={i}>
                 <span className={cn("text-sm font-medium", crumb.active ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                    {crumb.label}
                 </span>
                 {i < breadcrumbs.length - 1 && <span className="text-slate-300 dark:text-slate-700">/</span>}
               </React.Fragment>
             ))}
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-1">{user?.role}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-gray-200 dark:border-slate-700">
                {user?.name?.charAt(0)}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           <div className="max-w-6xl mx-auto h-full">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
