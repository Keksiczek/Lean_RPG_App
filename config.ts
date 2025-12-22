
// Helper to safe access env vars
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return '';
};

export const API_BASE_URL = getEnv('VITE_API_URL') || 'http://localhost:4000';

export const getTenantId = (): string => {
  const path = window.location.pathname;
  if (path.startsWith('/app/')) {
    const segments = path.split('/');
    if (segments[2]) return segments[2];
  }
  return 'magna'; 
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/users/me',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  TENANT: {
    DETAIL: (id: string) => `/api/tenants/${id}`,
  },
  QUESTS: {
    LIST: '/api/quests',
    DETAIL: (id: string) => `/api/quests/${id}`,
    ACCEPT: (id: string) => `/api/quests/${id}/accept`,
  },
  SUBMISSIONS: {
    CREATE: '/api/submissions',
    DETAIL: (id: string) => `/api/submissions/${id}`,
  },
  GAMIFICATION: {
    BADGES: '/api/gamification/badges',
    UNLOCK_BADGE: '/api/gamification/badges/unlock',
    ACHIEVEMENTS: '/api/gamification/achievements',
    LEADERBOARD_SKILL: (skill: string) => `/api/gamification/leaderboard/by-skill/${skill}`,
    LEADERBOARD_TRENDING: '/api/gamification/leaderboard/trending',
  },
  MINIGAMES: {
    AUDIT: '/api/audits',
    ISHIKAWA: '/api/ishikawa',
    GEMBA: '/api/gemba',
  },
  AUDITS: {
    CHECKLIST_TEMPLATES: '/api/audits/checklist-templates',
    BASE: '/api/audits',
    APPROVE: '/approve',
  },
  WORKPLACES: {
    BASE: '/api/workplaces',
    COMPLIANCE: '/compliance',
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    MARK_ALL_READ: '/api/notifications/read-all',
  },
  ADMIN: {
    USERS: '/api/admin/users',
    USER_DETAIL: (id: string) => `/api/admin/users/${id}`,
    USER_ROLE: (id: string) => `/api/admin/users/${id}/role`,
    QUESTS: '/api/admin/quests',
    QUEST_DETAIL: (id: string) => `/api/admin/quests/${id}`,
    BADGES: '/api/admin/badges',
    ACHIEVEMENTS: '/api/admin/achievements',
    TENANT: '/api/admin/tenant',
    STATS: '/api/admin/stats',
  },
  HEALTH: '/health',
};
