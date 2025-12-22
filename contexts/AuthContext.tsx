
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, Player } from '../types';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Player | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  login: (token: string, user: Player) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const playerData = await gameService.fetchPlayerProfile();
        setUser(playerData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Session expired or invalid", error);
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = (token: string, userData: Player) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;
    try {
        const updatedUser = await gameService.fetchPlayerProfile();
        setUser(updatedUser);
    } catch (e) {
        console.error("Failed to refresh user data", e);
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role as UserRole);
  };

  // Simple permission mapping for now
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const role = user.role as UserRole;
    if (role === 'superadmin') return true;
    if (role === 'admin') {
      return !permission.startsWith('tenant:delete');
    }
    if (role === 'moderator') {
      return ['quests:read', 'quests:write', 'users:read', 'reports:view'].includes(permission);
    }
    return ['quests:read', 'reports:view'].includes(permission);
  };

  const isAdmin = hasRole(['admin', 'superadmin']);
  const isSuperAdmin = hasRole('superadmin');
  const isModerator = hasRole(['moderator', 'admin', 'superadmin']);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      isAdmin, 
      isSuperAdmin,
      isModerator,
      login, 
      logout, 
      refreshUser,
      hasRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
