
import React from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGateProps {
  requiredRole: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGate: React.FC<RoleGateProps> = ({ requiredRole, children, fallback = null }) => {
  const { hasRole } = useAuth();

  if (!hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGate;
