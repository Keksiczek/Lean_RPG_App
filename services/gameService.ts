import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { Player, AuditScene, IshikawaProblem, ActionTask, LeaderboardEntry, Notification, ActivityLog } from '../types';
import { calculateLevel } from '../utils/gameUtils';
import { LEVEL_THRESHOLDS } from '../constants';

// Mock Tasks Store (Temporary until backend is fully live)
let MOCK_TASKS: ActionTask[] = [
    {
        id: 't1',
        title: 'Repair Conveyor Belt Guard',
        description: 'Safety guard loose on Line 3. Found during LPA.',
        status: 'open',
        priority: 'high',
        source: 'LPA Finding',
        assignee: 'Maintenance Lead',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        location: 'Assembly Line 3'
    },
    {
        id: 't2',
        title: 'Sort Tool Cabinet B',
        description: 'Mixed tools found. Needs shadow board update.',
        status: 'in_progress',
        priority: 'medium',
        source: '5S Red Tag',
        assignee: 'Team Leader A',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        location: 'Zone B'
    }
];

// Mock Notifications Store
let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Audit Complete',
    message: 'Your 5S Audit for "Factory Floor" has been submitted.',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'n2',
    title: 'New Task Assigned',
    message: 'Repair Conveyor Belt Guard has been assigned to your department.',
    type: 'task',
    read: false,
    relatedTaskId: 't1',
    timestamp: new Date().toISOString()
  }
];

// Mock Player State (Simulating Backend Persistence)
let MOCK_PLAYER: Player = {
  id: 'u1',
  username: 'CI Specialist',
  level: 1,
  currentXp: 0,
  totalXp: 0,
  nextLevelXp: 1000,
  gamesCompleted: 0,
  totalScore: 0,
  recentActivity: [],
  achievements: []
};

// Helper to update mock player state
const updateMockPlayer = (xpEarned: number, score: number, gameName: string) => {
    MOCK_PLAYER.totalXp += xpEarned;
    MOCK_PLAYER.totalScore += score;
    MOCK_PLAYER.gamesCompleted += 1;

    // Recalculate Level
    const { level, nextLevelXp } = calculateLevel(MOCK_PLAYER.totalXp);
    MOCK_PLAYER.level = level;
    MOCK_PLAYER.nextLevelXp = nextLevelXp;

    // Recalculate Current XP (Progress in current level)
    const currentLevelBaseXp = LEVEL_THRESHOLDS[level - 1] || 0;
    MOCK_PLAYER.currentXp = MOCK_PLAYER.totalXp - currentLevelBaseXp;

    // Add Activity
    const newActivity: ActivityLog = {
        id: Date.now().toString(),
        game: gameName,
        score: score,
        xp: xpEarned,
        date: new Date().toISOString()
    };
    MOCK_PLAYER.recentActivity = [newActivity, ...MOCK_PLAYER.recentActivity];
};

export const gameService = {
  fetchPlayerProfile: async (): Promise<Player> => {
    try {
        return await apiClient.get<Player>(ENDPOINTS.PLAYER.PROFILE);
    } catch (e) {
        console.warn("Backend unavailable, returning local mock profile");
        // Simulate network delay
        return new Promise(resolve => setTimeout(() => resolve({...MOCK_PLAYER}), 200));
    }
  },

  saveAuditResult: async (sceneId: string, score: number, xpEarned: number, checklist: any) => {
    updateMockPlayer(xpEarned, score, '5S Audit');
    try {
        return await apiClient.post(ENDPOINTS.GAME.AUDIT, {
            sceneId,
            score,
            xpEarned,
            checklist,
            completedAt: new Date().toISOString()
        });
    } catch (e) {
        console.warn("Backend save failed, saved locally");
        return { success: true, local: true };
    }
  },

  saveLPAResult: async (auditId: string, score: number, xpEarned: number, answers: any) => {
    updateMockPlayer(xpEarned, score, 'LPA Audit');
    try {
        return await apiClient.post(ENDPOINTS.GAME.AUDIT + '/lpa', {
            auditId,
            score,
            xpEarned,
            answers,
            completedAt: new Date().toISOString()
        });
    } catch (e) { return { success: true, local: true }; }
  },

  saveIshikawaResult: async (problemId: string, score: number, xpEarned: number, causes: any[], solutions: any[]) => {
    updateMockPlayer(xpEarned, score, 'Ishikawa Analysis');
    try {
        return await apiClient.post(ENDPOINTS.GAME.ISHIKAWA, {
            problemId,
            score,
            xpEarned,
            causes,
            solutions,
            completedAt: new Date().toISOString()
        });
    } catch (e) { return { success: true, local: true }; }
  },

  // --- Task Management Methods ---
  
  getTasks: async (): Promise<ActionTask[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_TASKS]), 300);
    });
  },

  createTask: async (task: Omit<ActionTask, 'id' | 'createdAt'>): Promise<ActionTask> => {
    return new Promise((resolve) => {
        const newTask: ActionTask = {
            ...task,
            id: `t${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        MOCK_TASKS = [newTask, ...MOCK_TASKS];

        // Trigger Notification
        const newNotification: Notification = {
          id: `n${Date.now()}`,
          title: 'New Corrective Action',
          message: `Task created: ${newTask.title}`,
          type: 'warning',
          read: false,
          timestamp: new Date().toISOString(),
          relatedTaskId: newTask.id
        };
        MOCK_NOTIFICATIONS = [newNotification, ...MOCK_NOTIFICATIONS];

        resolve(newTask);
    });
  },

  updateTask: async (taskId: string, updates: Partial<ActionTask>): Promise<ActionTask> => {
    return new Promise((resolve, reject) => {
        const index = MOCK_TASKS.findIndex(t => t.id === taskId);
        if (index === -1) {
            reject('Task not found');
            return;
        }
        MOCK_TASKS[index] = { ...MOCK_TASKS[index], ...updates };
        resolve(MOCK_TASKS[index]);
    });
  },

  // --- Notification Methods ---

  getNotifications: async (): Promise<Notification[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_NOTIFICATIONS]), 200);
    });
  },

  markNotificationRead: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      resolve();
    });
  },

  markAllNotificationsRead: async (): Promise<void> => {
    return new Promise((resolve) => {
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n => ({ ...n, read: true }));
      resolve();
    });
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    return new Promise((resolve) => {
        // Mock data
        const mockData: LeaderboardEntry[] = [
            { id: 'p1', username: 'Jan Novák', level: 5, totalXp: 8500, totalScore: 6200, rank: 1 },
            { id: 'p2', username: 'Marie Dvořáková', level: 4, totalXp: 5400, totalScore: 4100, rank: 2 },
            { id: 'p3', username: 'Petr Svoboda', level: 3, totalXp: 3200, totalScore: 2800, rank: 3 },
            { id: 'p4', username: 'Anna Černá', level: 2, totalXp: 1500, totalScore: 1200, rank: 4 },
            { id: 'p5', username: 'Tomáš Kučera', level: 1, totalXp: 800, totalScore: 600, rank: 5 },
            // MOCK_PLAYER stats included here for dynamic leaderboard ranking
            { 
              id: MOCK_PLAYER.id, 
              username: `${MOCK_PLAYER.username} (You)`, 
              level: MOCK_PLAYER.level, 
              totalXp: MOCK_PLAYER.totalXp, 
              totalScore: MOCK_PLAYER.totalScore, 
              rank: 0 
            }, 
        ];
        
        // Sort by Score
        mockData.sort((a, b) => b.totalScore - a.totalScore);
        
        // Assign Ranks
        const rankedData = mockData.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        setTimeout(() => resolve(rankedData), 500);
    });
  },
};