
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, TenantFeatures } from '../types';
import { ENDPOINTS, getTenantId } from '../config';
import { apiClient } from '../services/apiClient';

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  refetchTenant: () => void;
  isFeatureEnabled: (feature: keyof TenantFeatures) => boolean;
  getTenantColor: (type: 'primary' | 'secondary') => string;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = async () => {
    setIsLoading(true);
    try {
      const id = getTenantId();
      // Using a standard response wrapper if available, or direct data
      const res = await apiClient.get<any>(ENDPOINTS.TENANT.DETAIL(id));
      const tenantData = res.success ? res.data : res;
      setTenant(tenantData);
      
      // Apply CSS variables for branding
      if (tenantData) {
        document.documentElement.style.setProperty('--tenant-primary', tenantData.primaryColor || '#DC2626');
        document.documentElement.style.setProperty('--tenant-secondary', tenantData.secondaryColor || '#1F2937');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, []);

  const isFeatureEnabled = (feature: keyof TenantFeatures) => {
    if (!tenant) return true; // Default to true for dev
    return !!tenant.features[feature];
  };

  const getTenantColor = (type: 'primary' | 'secondary') => {
    if (!tenant) return type === 'primary' ? '#DC2626' : '#1F2937';
    return type === 'primary' ? tenant.primaryColor : tenant.secondaryColor;
  };

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      isLoading, 
      error, 
      refetchTenant: fetchTenant,
      isFeatureEnabled,
      getTenantColor
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
