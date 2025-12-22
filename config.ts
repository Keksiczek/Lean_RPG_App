

// Helper to safe access env vars for Vite
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  return '';
};

// Standard backend port for Lean RPG Complete is 4000
export const API_BASE_URL = getEnv('VITE_API_URL') || 'http://localhost:4000';

export const getTenantId = (): string => {
  const path = window.location.pathname;
  if (path.startsWith('/app/')) {
    const segments = path.split('/');
    if (segments[2]) return segments[2];
  }
  return 'magna'; // Default tenant
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
  },
  SUBMISSIONS: {
    CREATE: '/api/submissions',
    DETAIL: (id: string) => `/api/submissions/${id}`,
  },
  GAMIFICATION: {
    BADGES: '/api/gamification/badges',
    ACHIEVEMENTS: '/api/gamification/achievements',
    LEADERBOARD_TRENDING: '/api/gamification/leaderboard/trending',
    LEADERBOARD_SKILL: (skill: string) => `/api/gamification/leaderboard/skill/${skill}`,
  },
  MINIGAMES: {
    AUDIT: '/api/audits',
    ISHIKAWA: '/api/ishikawa',
    GEMBA: '/api/gemba',
  },
  AUDITS: {
    BASE: '/api/audits',
    CHECKLIST_TEMPLATES: '/api/audits/checklist-templates',
    APPROVE: '/approve',
  },
  WORKPLACES: {
    BASE: '/api/workplaces',
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    MARK_ALL_READ: '/api/notifications/mark-all-read',
  },
  ADMIN: {
    STATS: '/api/admin/stats',
    USERS: '/api/admin/users',
    USER_ROLE: (id: string) => `/api/admin/users/${id}/role`,
    QUESTS: '/api/admin/quests',
    QUEST_DETAIL: (id: string) => `/api/admin/quests/${id}`,
    TENANT: '/api/admin/tenant',
    BADGES: '/api/admin/badges',
    ACHIEVEMENTS: '/api/admin/achievements',
  }
};
