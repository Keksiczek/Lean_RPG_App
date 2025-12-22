
import React from 'react';
import { TenantFeatures } from '../../types';
import { useTenant } from '../../contexts/TenantContext';

interface FeatureGateProps {
  feature: keyof TenantFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback = null }) => {
  const { isFeatureEnabled } = useTenant();

  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FeatureGate;
