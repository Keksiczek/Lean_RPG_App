import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { Player, AdminRole } from '../types';

// Mock Users - Mutable for demo session
let MOCK_USERS: Player[] = [
  {
    id: 1,
    email: 'operator@magna.com',
    username: 'John Operator',
    role: AdminRole.OPERATOR,
    tenantId: 'magna',
    level: 3,
    totalXp: 3200,
    gamesCompleted: 15,
    totalScore: 4500,
    createdAt: '2023-01-15T00:00:00Z',
    achievements: [],
    recentActivity: [],
    currentXp: 200,
    nextLevelXp: 1000
  },
  {
    id: 2,
    email: 'manager@magna.com',
    username: 'Sarah Manager',
    role: AdminRole.AUDIT_MANAGER,
    tenantId: 'magna',
    level: 5,
    totalXp: 8500,
    gamesCompleted: 42,
    totalScore: 12000,
    createdAt: '2022-11-20T00:00:00Z',
    achievements: [],
    recentActivity: [],
    currentXp: 500,
    nextLevelXp: 2000
  },
  {
    id: 3,
    email: 'admin@magna.com',
    username: 'Mike Admin',
    role: AdminRole.TENANT_ADMIN,
    tenantId: 'magna',
    level: 2,
    totalXp: 1500,
    gamesCompleted: 5,
    totalScore: 2000,
    createdAt: '2023-03-10T00:00:00Z',
    achievements: [],
    recentActivity: [],
    currentXp: 500,
    nextLevelXp: 1000
  }
];

export const userService = {
  getAll: async (): Promise<Player[]> => {
    try {
      return await apiClient.get<Player[]>(ENDPOINTS.USERS.BASE);
    } catch (e) {
      console.warn("Using mock users");
      return MOCK_USERS;
    }
  },

  create: async (data: Partial<Player>): Promise<Player> => {
    try {
      return await apiClient.post<Player>(ENDPOINTS.USERS.BASE, data);
    } catch (e) {
      console.warn("Mock create user");
      const newUser: Player = {
        id: Math.floor(Math.random() * 10000) + 100,
        email: data.email || 'user@example.com',
        username: data.username || 'New User',
        role: data.role || AdminRole.OPERATOR,
        tenantId: 'magna',
        level: 1,
        totalXp: 0,
        gamesCompleted: 0,
        totalScore: 0,
        createdAt: new Date().toISOString(),
        achievements: [],
        recentActivity: [],
        currentXp: 0,
        nextLevelXp: 1000,
        ...data
      } as Player;
      MOCK_USERS.push(newUser);
      return newUser;
    }
  },

  update: async (id: number, data: Partial<Player>): Promise<Player> => {
    try {
      return await apiClient.put<Player>(`${ENDPOINTS.USERS.BASE}/${id}`, data);
    } catch (e) {
      console.warn("Mock update user");
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (index !== -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...data };
        return MOCK_USERS[index];
      }
      throw new Error("User not found");
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${ENDPOINTS.USERS.BASE}/${id}`);
    } catch (e) {
      console.warn("Mock delete user");
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
    }
  },

  updateRole: async (userId: number, role: string): Promise<Player> => {
    return userService.update(userId, { role });
  }
};