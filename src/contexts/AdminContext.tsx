
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, UserRole } from '../types';
import { useAuth } from './AuthContext';

interface AdminContextType {
  role: UserRole;
  hasPermission: (requiredRole: UserRole) => boolean;
  isAdmin: boolean;
  isAuditManager: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ROLE_HIERARCHY: UserRole[] = [
  UserRole.OPERATOR,
  UserRole.TEAM_LEADER,
  UserRole.CI_SPECIALIST,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(UserRole.OPERATOR);

  useEffect(() => {
    if (user) {
      setRole(user.role);
    } else {
      setRole(UserRole.OPERATOR);
    }
  }, [user]);

  const hasPermission = (requiredRole: UserRole): boolean => {
    const userLevel = ROLE_HIERARCHY.indexOf(role);
    const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
    return userLevel >= requiredLevel;
  };

  const isAdmin = hasPermission(UserRole.ADMIN);
  const isAuditManager = hasPermission(UserRole.TEAM_LEADER);

  return (
    <AdminContext.Provider value={{ role, hasPermission, isAdmin, isAuditManager }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
