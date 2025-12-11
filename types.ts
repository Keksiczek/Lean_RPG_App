export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  GAME_HUB = 'GAME_HUB',
  GAME_AUDIT = 'GAME_AUDIT',
  GAME_LPA = 'GAME_LPA',
  GAME_ISHIKAWA = 'GAME_ISHIKAWA',
  FACTORY_MAP = 'FACTORY_MAP',
  SKILLS = 'SKILLS',
  TASKS = 'TASKS',
  LEADERBOARD = 'LEADERBOARD',
}

export type Language = 'cs' | 'en';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlockedAt?: string; // ISO date
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  benefit: string;
  icon: string;
  requirements: {
    level?: number;
    auditCount?: number;
    ishikawaCount?: number;
    totalScore?: number;
  };
}

export interface Player {
  id: string;
  username: string;
  level: number;
  currentXp: number;
  totalXp: number;
  nextLevelXp: number;
  gamesCompleted: number;
  totalScore: number;
  recentActivity: ActivityLog[];
  achievements: Achievement[];
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  totalXp: number;
  totalScore: number;
  rank: number;
  avatar?: string;
}

export interface ActivityLog {
  id: string;
  game: string;
  score: number;
  xp: number;
  date: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'task';
  read: boolean;
  timestamp: string;
  relatedTaskId?: string;
}

// Action / Task Management Types
export interface ActionTask {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  source: '5S Red Tag' | 'LPA Finding' | 'Ishikawa' | 'General';
  assignee?: string;
  dueDate?: string; // ISO Date
  createdAt: string;
  imageUrl?: string;
  location?: string;
  workplaceId?: string; // Tighter integration with Factory Map
}

// Map / Workplace Types
export interface Workplace {
  id: string;
  name: string;
  type: 'production' | 'logistics' | 'quality' | 'office';
  coordinates: { x: number; y: number }; // Percentage 0-100
  status: 'optimal' | 'warning' | 'critical';
  redTags: number;
  activeTrainingModules: number;
  checklist: string[]; // 5S / LPA Checklist items
}

// 5S Audit Types
export interface AuditItem {
  id: string;
  name: string;
  status: 'clean' | 'dirty' | 'misplaced' | 'broken';
  correctAction: 'keep' | 'remove' | 'clean' | 'organize';
  // For AR positioning (0-100%)
  arPosition?: { top: number; left: number };
}

export interface AuditScene {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  items: AuditItem[];
  xpReward: number;
  isRealWorld?: boolean; // New flag
}

// LPA Types
export interface LPAQuestion {
  id: string;
  question: string;
  category: 'Safety' | 'Quality' | 'Process' | 'Material';
  correctAnswer: 'Yes' | 'No'; // 'Yes' typically means compliant
}

export interface LPAAudit {
  id: string;
  title: string;
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  questions: LPAQuestion[];
  xpReward: number;
}

// AI Lens Result / Red Tag
export interface LensChecklistResult {
  item: string;
  compliant: boolean;
  observation: string;
}

export interface LensScanResult {
  overallCompliance: number; // 0-100
  checklistResults: LensChecklistResult[];
  detectedHazards: {
      name: string;
      action: string;
      severity: 'Low' | 'Medium' | 'High';
  }[];
  // Backward compatibility for single item Red Tags
  itemDetected?: string; 
  observation?: string;
  suggested5SAction?: string;
  practicalAction?: string; 
}

// LPA Scan Result
export interface LPAScanResult {
  compliance: 'High' | 'Medium' | 'Low';
  observations: string[];
  safetyRisk: boolean;
  identifiedIssues: string[];
}

// Real World Red Tag (Data to send to Backend)
export interface RedTagData {
  id: string;
  timestamp: string;
  imageUrl?: string; // Base64 or URL
  location: string;
  itemDetected: string;
  actionNeeded: string;
  status: 'Open' | 'Closed';
}

// Ishikawa Types
export enum IshikawaCategory {
  MAN = 'Man',
  MACHINE = 'Machine',
  MATERIAL = 'Material',
  METHOD = 'Method',
  MEASUREMENT = 'Measurement',
  ENVIRONMENT = 'Environment',
}

export interface IshikawaProblem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  isRealWorld?: boolean; // New flag
}

export interface IshikawaCause {
  id: string;
  category: IshikawaCategory;
  text: string;
}

export interface IshikawaSolution {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  steps: string[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}