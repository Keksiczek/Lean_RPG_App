import React, { useState, useRef, useEffect } from 'react';
import { Player, ViewState, AdminRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { 
  User, 
  Settings, 
  Factory, 
  Bell, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';

interface UserProfileMenuProps {
  user: Player | null;
  onNavigate: (view: ViewState) => void;
}

// Configuration object for menu structure
const MENU_CONFIG = [
  {
    id: 'profile',
    label: 'My Profile',
    view: ViewState.PROFILE,
    icon: User,
    requiresAdmin: false,
  },
  {
    id: 'settings',
    label: 'Account Settings',
    view: ViewState.SETTINGS_ACCOUNT,
    icon: Settings,
    requiresAdmin: false,
  },
  {
    id: 'factory_settings',
    label: 'Factory Configuration',
    view: ViewState.SETTINGS_FACTORY,
    icon: Factory,
    requiresAdmin: true,
  },
  {
    id: 'notifications',
    label: 'My Notifications',
    view: ViewState.NOTIFICATIONS,
    icon: Bell,
    requiresAdmin: false,
  },
];

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onNavigate }) => {
  const { logout } = useAuth();
  const { isAdmin } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleNavigation = (view: ViewState) => {
    setIsOpen(false);
    onNavigate(view);
  };

  // Safe fallback if user is null (guest)
  const username = user?.username || 'Guest';
  const email = user?.email || 'guest@leanrpg.com';
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <div className="relative z-50" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {initials}
        </div>
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-sm font-bold text-gray-700 leading-none">{username}</span>
          <span className="text-[10px] text-gray-400 leading-none mt-1">{user?.role || 'Guest'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 hidden md:block transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-fade-in-up origin-top-right"
          role="menu"
        >
          {/* Mobile Info Header inside dropdown */}
          <div className="px-4 py-3 border-b border-gray-100 md:hidden">
            <p className="text-sm font-bold text-gray-900">{username}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          <div className="py-1">
            {MENU_CONFIG.map((item) => {
              if (item.requiresAdmin && !isAdmin) return null;
              
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.view)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 flex items-center transition-colors"
                  role="menuitem"
                >
                  <Icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-600" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 my-1"></div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors font-medium"
            role="menuitem"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;