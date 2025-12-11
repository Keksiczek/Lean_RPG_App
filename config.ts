// Default to localhost for development, can be overridden by environment variables
export const API_BASE_URL = 'http://localhost:5000/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  PLAYER: {
    PROFILE: '/player',
    LEADERBOARD: '/player/leaderboard',
  },
  GAME: {
    AUDIT: '/audit',
    ISHIKAWA: '/ishikawa',
  }
};