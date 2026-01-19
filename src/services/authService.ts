import { apiClient } from './apiClient';
import { ENDPOINTS, getTenantId } from '../config';
import { Player, ApiResponse } from '../types';

export interface AuthResponse {
  token: string;
  user: Player;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.LOGIN, { 
      email, 
      password,
      tenantId: getTenantId() 
    });
    if (!res.success || !res.data) throw new Error(res.error || "Login failed");
    return res.data;
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.REGISTER, { 
      name: username,
      email, 
      password,
      tenantId: getTenantId()
    });
    if (!res.success || !res.data) throw new Error(res.error || "Registration failed");
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {});
    } catch (e) {
      console.warn("Logout on server failed");
    } finally {
      localStorage.removeItem('auth_token');
    }
  }
};