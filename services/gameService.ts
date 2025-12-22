import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { Player, User, ActionTask, LeaderboardEntry, Notification, SubmissionResponse, ActivityLog, ApiResponse } from '../types';
import { LEVEL_THRESHOLDS } from '../constants';

// --- MOCK DATA FOR OFFLINE MODE ---
const MOCK_PLAYER: Player = {
  id: 'mock-1', 
  email: 'operator@magna.com',
  name: 'CI Operator (Offline)',
  username: 'CI Operator (Offline)',
  role: 'operator',
  tenantId: 'magna',
  level: 3,
  xp: 3250,
  totalXp: 3250,
  currentXp: 3250,
  nextLevelXp: 4500,
  gamesCompleted: 12,
  totalScore: 8450,
  createdAt: new Date().toISOString(),
  achievements: [],
  recentActivity: []
};

// --- Mappers ---

const mapUserToPlayer = (user: any): Player => {
  const { level, nextLevelXp } = calculateLevel(user.xp || user.totalXp || 0);
  return {
    ...user,
    id: user.id || '0',
    username: user.name || user.username,
    level: user.level || level,
    currentXp: user.xp || user.totalXp || 0,
    nextLevelXp,
    totalXp: user.xp || user.totalXp || 0,
    gamesCompleted: user.submissions?.length || user.gamesCompleted || 0,
    totalScore: user.totalScore || 0,
    achievements: user.achievements || [],
    recentActivity: (user.submissions || []).map((sub: any) => ({
      id: sub.id.toString(),
      game: sub.questId,
      score: sub.score || 0,
      xp: sub.xpGain || sub.xpAwarded || 0,
      date: sub.createdAt
    }))
  };
};

const calculateLevel = (totalXp: number) => {
  let level = 1;
  let nextLevelXp = LEVEL_THRESHOLDS[1];
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      nextLevelXp = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i] * 1.5;
    } else {
      break;
    }
  }
  return { level, nextLevelXp };
};

export const gameService = {
  // --- User & Profile ---
  fetchPlayerProfile: async (): Promise<Player> => {
    try {
      const res = await apiClient.get<ApiResponse<any>>(ENDPOINTS.AUTH.ME);
      if (!res.success || !res.data) throw new Error(res.error);
      return mapUserToPlayer(res.data);
    } catch (e) {
      console.warn("Backend unavailable, using mock profile");
      return MOCK_PLAYER; 
    }
  },

  getMockPlayer: (): Player => {
    return MOCK_PLAYER;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(ENDPOINTS.GAMIFICATION.LEADERBOARD_TRENDING);
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    } catch (e) {
      console.warn("Leaderboard fetch failed, using mock data");
      return [
        { rank: 1, id: 'u1', userId: 'u1', username: 'KaizenKing', userName: 'KaizenKing', level: 5, xp: 9500, totalXp: 9500, totalScore: 12000 },
        { rank: 2, id: 'u2', userId: 'u2', username: '5S_Ninja', userName: '5S_Ninja', level: 4, xp: 6200, totalXp: 6200, totalScore: 8000 },
      ];
    }
  },

  // --- Submissions ---

  saveAuditResult: async (sceneId: string, score: number, xpEarned: number, auditData: any, userId: string): Promise<SubmissionResponse> => {
    const payload = {
      questId: 'audit-sim',
      userId,
      content: JSON.stringify({ sceneId, auditData, score }),
      status: 'evaluated'
    };
    try {
      const res = await apiClient.post<ApiResponse<SubmissionResponse>>(ENDPOINTS.SUBMISSIONS.CREATE, payload);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    } catch (e) {
      console.warn("Offline submission", e);
      return { id: 0, xpGain: xpEarned, score, status: 'offline_saved' } as any;
    }
  },

  saveLPAResult: async (auditId: string, score: number, xpEarned: number, answers: any, userId: string): Promise<SubmissionResponse> => {
    const payload = {
      questId: 'lpa-sim',
      userId,
      content: JSON.stringify({ auditId, answers, score }),
      status: 'evaluated'
    };
    try {
      const res = await apiClient.post<ApiResponse<SubmissionResponse>>(ENDPOINTS.SUBMISSIONS.CREATE, payload);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    } catch (e) {
      console.warn("Offline submission", e);
      return { id: 0, xpGain: xpEarned, score, status: 'offline_saved' } as any;
    }
  },

  saveIshikawaResult: async (problemId: string, score: number, xpEarned: number, causes: any[], solutions: any[], userId: string): Promise<SubmissionResponse> => {
    const payload = {
      questId: 'ishikawa-sim',
      userId,
      content: JSON.stringify({ problemId, causes, solutions }),
      status: 'evaluated'
    };
    try {
      const res = await apiClient.post<ApiResponse<SubmissionResponse>>(ENDPOINTS.SUBMISSIONS.CREATE, payload);
      if (!res.success || !res.data) throw new Error(res.error);
      return res.data;
    } catch (e) {
      console.warn("Offline submission", e);
      return { id: 0, xpGain: xpEarned, score, status: 'offline_saved' } as any;
    }
  },

  // --- Task Management ---
  
  getTasks: async (): Promise<ActionTask[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([]), 300);
    });
  },

  createTask: async (task: Omit<ActionTask, 'id' | 'createdAt'>): Promise<ActionTask> => {
    const newTask: ActionTask = {
        ...task,
        id: `t${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    return newTask;
  },

  updateTask: async (taskId: string, updates: Partial<ActionTask>): Promise<ActionTask> => {
    return { id: taskId, ...updates } as ActionTask;
  },

  // --- Notifications ---

  getNotifications: async (): Promise<Notification[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Notification[]>>(ENDPOINTS.NOTIFICATIONS.BASE);
      return res.data || [];
    } catch (e) {
      return [];
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    try {
      await apiClient.put(ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', id), {});
    } catch (e) {}
  },

  markAllNotificationsRead: async (): Promise<void> => {
    try {
      await apiClient.put(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {});
    } catch (e) {}
  }
};