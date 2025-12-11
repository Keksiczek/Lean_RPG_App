import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { Player } from '../types';

export interface AuthResponse {
  token: string;
  user: Player;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Integration Mode:
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, { email, password });
    
    // --- MOCK FALLBACK FOR DEMO IF BACKEND IS OFFLINE ---
    /*
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: 'mock-jwt-token-123',
                user: {
                    level: 3,
                    currentXp: 1200,
                    totalXp: 5700,
                    nextLevelXp: 7000,
                    gamesCompleted: 12,
                    totalScore: 4500,
                    recentActivity: [],
                    achievements: []
                }
            });
        }, 1000);
    });
    */
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, { username, email, password });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  }
};