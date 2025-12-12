
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
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  COMPLIANCE_DASHBOARD = 'COMPLIANCE_DASHBOARD',
  AUDIT_SESSION = 'AUDIT_SESSION',
  // New Profile & Settings Views
  PROFILE = 'PROFILE',
  SETTINGS_ACCOUNT = 'SETTINGS_ACCOUNT',
  SETTINGS_FACTORY = 'SETTINGS_FACTORY',
  NOTIFICATIONS = 'NOTIFICATIONS',
}

export type Language = 'cs' | 'en';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  AUDIT_MANAGER = 'AUDIT_MANAGER',
  TRAINER = 'TRAINER',
  OPERATOR = 'OPERATOR',
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
  id: number;
  email: string;
  username: string;
  role: string; // Mapped to AdminRole in AdminContext
  tenantId: string;
  level: number;
  totalXp: number;
  currentXp?: number;
  nextLevelXp?: number;
  gamesCompleted: number;
  totalScore: number;
  createdAt: string;
  
  // Relations
  achievements: Achievement[];
  recentActivity: ActivityLog[];
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
  content: string;
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

// --- AUDIT SYSTEM TYPES (NEW) ---

export interface ChecklistItem {
  id: string;
  question: string;
  expected_answer: "Yes" | "No" | "N/A" | "Text";
  scoring_weight: number;
  guidance: string;
  photo_required: boolean;
  category: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: "5S" | "LPA" | "Safety" | "Custom";
  items: ChecklistItem[];
  version: number;
  isPublic: boolean;
  createdBy: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditResponse {
  itemId: string;
  answer: string | boolean;
  timestamp: string;
  photoIds: string[];
  notes: string;
}

export interface AuditFinding {
  itemId: string;
  severity: "Info" | "Minor" | "Major" | "Critical";
  description: string;
  photo?: string;
  approved: boolean;
}

export interface AuditSession {
  id: string;
  checklistId: string;
  workplaceId: string;
  auditorId: string;
  status: "in_progress" | "paused" | "completed" | "cancelled" | "approved" | "rejected";
  responses: AuditResponse[];
  photoEvidence: string[];
  findings: AuditFinding[];
  overallCompliance: number;
  riskLevel: "Green" | "Yellow" | "Red";
  score: number;
  xpEarned: number;
  startTime: string;
  endTime?: string;
  createdAt: string;
  checklistName?: string; // Helper for display
  workplaceName?: string; // Helper for display
  auditorName?: string;   // Helper for display
}

// 5S Audit Types (Legacy/Virtual)
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