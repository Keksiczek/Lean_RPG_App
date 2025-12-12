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

// --- API Response Wrapper ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  code?: string;
  error?: {
    message: string;
    code: string;
  };
}

// --- Backend Models ---

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
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

// Aligned with Backend Prisma User
export interface Player {
  id: number; // Changed from string to number
  email: string;
  username: string; // mapped from 'name' if needed, or keeping username
  role: string;
  tenantId: string;
  level: number;
  totalXp: number; // Backend source of truth
  currentXp?: number; // Calculated on frontend
  nextLevelXp?: number; // Calculated on frontend
  gamesCompleted: number; // derived or stored in stats
  totalScore: number;
  createdAt: string;
  
  // Relations
  achievements: Achievement[];
  recentActivity: ActivityLog[]; // Mapped from Submissions/UserQuests
}

export interface LeaderboardEntry {
  id: number;
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

// --- Game/Submission Types ---

export interface SubmissionPayload {
  questId: string;
  userId: number;
  content: string; // JSON stringified result
  userQuestId?: string;
  workstationId?: string;
  aiFeedback?: string;
  aiScore5s?: string;
  aiRiskLevel?: string;
  status?: 'pending_analysis' | 'evaluated';
}

export interface SubmissionResponse {
  id: number;
  xpGain: number;
  score: number;
  aiFeedback?: string;
  status: string;
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
  workplaceId?: string; 
}

// Map / Workplace Types
export interface Workplace {
  id: string;
  name: string;
  type: 'production' | 'logistics' | 'quality' | 'office';
  coordinates: { x: number; y: number }; 
  status: 'optimal' | 'warning' | 'critical';
  redTags: number;
  activeTrainingModules: number;
  checklist: string[]; 
}

// 5S Audit Types
export interface AuditItem {
  id: string;
  name: string;
  status: 'clean' | 'dirty' | 'misplaced' | 'broken';
  correctAction: 'keep' | 'remove' | 'clean' | 'organize';
  arPosition?: { top: number; left: number };
}

export interface AuditScene {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  items: AuditItem[];
  xpReward: number;
  isRealWorld?: boolean;
}

// LPA Types
export interface LPAQuestion {
  id: string;
  question: string;
  category: 'Safety' | 'Quality' | 'Process' | 'Material';
  correctAnswer: 'Yes' | 'No'; 
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
  overallCompliance: number; 
  checklistResults: LensChecklistResult[];
  detectedHazards: {
      name: string;
      action: string;
      severity: 'Low' | 'Medium' | 'High';
  }[];
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

// Real World Red Tag
export interface RedTagData {
  id: string;
  timestamp: string;
  imageUrl?: string; 
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
  isRealWorld?: boolean; 
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}