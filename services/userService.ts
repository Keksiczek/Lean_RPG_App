
import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { Player, UserRole, ApiResponse } from '../types';

let MOCK_USERS: Player[] = [
  {
    id: 'u1',
    email: 'operator@magna.com',
    name: 'John Operator',
    username: 'John Operator',
    role: UserRole.OPERATOR,
    tenantId: 'magna',
    level: 3,
    xp: 3200,
    totalXp: 3200,
    currentXp: 3200,
    nextLevelXp: 4500,
    gamesCompleted: 15,
    totalScore: 4500,
    createdAt: '2023-01-15T00:00:00Z',
    achievements: [],
    recentActivity: []
  },
  {
    id: 'u2',
    email: 'sarah@magna.com',
    name: 'Sarah TeamLead',
    username: 'Sarah TeamLead',
    role: UserRole.TEAM_LEADER,
    tenantId: 'magna',
    level: 5,
    xp: 7500,
    totalXp: 7500,
    currentXp: 500,
    nextLevelXp: 10000,
    gamesCompleted: 30,
    totalScore: 9000,
    createdAt: '2023-02-10T00:00:00Z',
    achievements: [],
    recentActivity: []
  }
];

export const userService = {
  getAll: async (): Promise<Player[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Player[]>>('/api/users');
      return res.data || MOCK_USERS;
    } catch (e) {
      return MOCK_USERS;
    }
  },

  create: async (data: Partial<Player>): Promise<Player> => {
    try {
      const res = await apiClient.post<ApiResponse<Player>>('/api/users', data);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    } catch (e) {
      const newUser: Player = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        email: data.email || 'user@example.com',
        name: data.name || 'New User',
        username: data.username || data.name || 'New User',
        role: data.role || UserRole.OPERATOR,
        tenantId: 'magna',
        level: 1,
        xp: 0,
        totalXp: 0,
        currentXp: 0,
        nextLevelXp: 1000,
        gamesCompleted: 0,
        totalScore: 0,
        createdAt: new Date().toISOString(),
        achievements: [],
        recentActivity: [],
        ...data
      } as Player;
      MOCK_USERS.push(newUser);
      return newUser;
    }
  },

  update: async (id: string, data: Partial<Player>): Promise<Player> => {
    try {
      const res = await apiClient.put<ApiResponse<Player>>(`/api/users/${id}`, data);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    } catch (e) {
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (index !== -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...data };
        return MOCK_USERS[index];
      }
      throw new Error("User not found");
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/users/${id}`);
    } catch (e) {
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
    }
  },

  updateRole: async (userId: string, role: UserRole): Promise<Player> => {
    return userService.update(userId, { role });
  }
};
