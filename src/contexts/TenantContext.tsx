
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, TenantFeatures } from '../types';
import { ENDPOINTS, getTenantId } from '../config';
import { apiClient } from '../services/apiClient';
import { getDefaultTenant } from '../data/demoTenants';

interface TenantContextValue {
  tenant: Tenant | null;
  tenantId: string;
  isLoading: boolean;
  error: string | null;
  refetchTenant: () => void;
  switchTenant: (newTenantId: string) => void;
  isFeatureEnabled: (feature: keyof TenantFeatures) => boolean;
  getTenantColor: (type: 'primary' | 'secondary') => string;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string>(getTenantId());
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyBranding = (tenantData: Tenant) => {
    document.documentElement.style.setProperty('--tenant-primary', tenantData.primaryColor || '#DC2626');
    document.documentElement.style.setProperty('--tenant-secondary', tenantData.secondaryColor || '#1F2937');
  };

  const fetchTenant = async () => {
    setIsLoading(true);
    try {
      const id = getTenantId();
      setTenantId(id);
      const res = await apiClient.get<any>(ENDPOINTS.TENANT.DETAIL(id));
      const tenantData = res.success ? res.data : res;
      setTenant(tenantData);
      applyBranding(tenantData);
    } catch (err: any) {
      // Fallback to demo tenant data
      const fallbackTenant = getDefaultTenant(getTenantId());
      setTenant(fallbackTenant);
      applyBranding(fallbackTenant);
      setError(null); // Don't show error, we have fallback
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = (newTenantId: string) => {
    localStorage.setItem('lean_rpg_tenant', newTenantId);
    setTenantId(newTenantId);
    const fallbackTenant = getDefaultTenant(newTenantId);
    setTenant(fallbackTenant);
    applyBranding(fallbackTenant);
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
      tenantId,
      isLoading,
      error,
      refetchTenant: fetchTenant,
      switchTenant,
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
