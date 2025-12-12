import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { AdminRole } from '../types';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole: AdminRole;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { hasPermission } = useAdmin();

  if (!hasPermission(requiredRole)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 max-w-md">
          You do not have the required permissions ({requiredRole}+) to view this page.
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
