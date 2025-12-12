// Helper to safe access env vars
const getEnv = (key: string) => {
  // Check for Vite
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  // Check for Node/Webpack
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return '';
};

// Default to localhost for development
export const API_BASE_URL = getEnv('VITE_API_URL') || 'http://localhost:4000';

// Helper to determine tenant from URL or default to 'magna'
export const getTenantId = (): string => {
  // Logic: Check subdomain or path, fallback to 'magna' for MVP
  const path = window.location.pathname;
  if (path.startsWith('/app/')) {
    const segments = path.split('/');
    if (segments[2]) return segments[2];
  }
  return 'magna'; // Default tenant
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    ME: '/api/users/me',
  },
  SUBMISSIONS: {
    BASE: '/api/submissions',
  },
  GAME: {
    AUDIT_SETTINGS: '/api/5s/settings',
    LPA_TEMPLATES: '/api/audits',
    PROBLEMS: '/api/problem-solving/challenges',
  },
  GAMIFICATION: {
    LEADERBOARD: '/api/gamification/leaderboard',
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    MARK_ALL_READ: '/api/notifications/read-all',
  }
};