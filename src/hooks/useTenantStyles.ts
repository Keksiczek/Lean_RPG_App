
import { useTenant } from '../contexts/TenantContext';

export const useTenantStyles = () => {
  const { tenant } = useTenant();

  return {
    primary: 'var(--tenant-primary)',
    secondary: 'var(--tenant-secondary)',
    primaryBg: 'bg-[var(--tenant-primary)]',
    primaryText: 'text-[var(--tenant-primary)]',
    primaryBorder: 'border-[var(--tenant-primary)]',
    logo: tenant?.logo || null,
  };
};
