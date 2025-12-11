export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  GAME_HUB = 'GAME_HUB',
  GAME_AUDIT = 'GAME_AUDIT',
  GAME_ISHIKAWA = 'GAME_ISHIKAWA',
  FACTORY_MAP = 'FACTORY_MAP',
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

export interface Player {
  level: number;
  currentXp: number;
  totalXp: number;
  nextLevelXp: number;
  gamesCompleted: number;
  totalScore: number;
  recentActivity: ActivityLog[];
  achievements: Achievement[];
}

export interface ActivityLog {
  id: string;
  game: string;
  score: number;
  xp: number;
  date: string;
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

// AI Lens Result / Red Tag
export interface LensScanResult {
  itemDetected: string;
  observation: string;
  suggested5SAction: 'Sort' | 'Set in Order' | 'Shine' | 'Standardize' | 'Sustain';
  practicalAction: string; 
  severity?: 'Low' | 'Medium' | 'High'; // Added for Red Tag
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