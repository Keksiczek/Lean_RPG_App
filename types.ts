
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
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_QUESTS = 'ADMIN_QUESTS',
  ADMIN_BADGES = 'ADMIN_BADGES',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS',
  ADMIN_REPORTS = 'ADMIN_REPORTS',
  COMPLIANCE_DASHBOARD = 'COMPLIANCE_DASHBOARD',
  AUDIT_SESSION = 'AUDIT_SESSION',
  PROFILE = 'PROFILE',
  SETTINGS_ACCOUNT = 'SETTINGS_ACCOUNT',
  SETTINGS_FACTORY = 'SETTINGS_FACTORY',
  NOTIFICATIONS = 'NOTIFICATIONS',
}

export type Language = 'cs' | 'en' | 'de';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/* FIX: Added AdminRole enum and expanded UserRole to cover all string literals and enum values used in the app */
export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin' | 'operator' | 'trainer' | 'auditor' | 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'AUDIT_MANAGER' | 'TRAINER' | 'OPERATOR';

export enum AdminRole {
  SUPER_ADMIN = 'superadmin',
  TENANT_ADMIN = 'admin',
  AUDIT_MANAGER = 'moderator',
  TRAINER = 'trainer',
  OPERATOR = 'user',
}

export interface TenantFeatures {
  auditsEnabled: boolean;
  ishikawaEnabled: boolean;
  gembaEnabled: boolean;
  leaderboardEnabled: boolean;
  badgesEnabled: boolean;
  achievementsEnabled: boolean;
  chatbotEnabled: boolean;
}

export interface TenantSettings {
  maxUsersPerTenant: number;
  defaultLanguage: Language;
  xpMultiplier: number;
  welcomeMessage?: string;
  supportEmail?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  features: TenantFeatures;
  settings: TenantSettings;
  createdAt: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  xp: number;
  level: number;
  tenantId: string;
  role: UserRole;
  createdAt: string;
}

export type UserWithRole = User & {
  tenant?: Tenant;
};

// Backward compatibility alias
export type Player = UserWithRole & {
  username?: string;
  totalXp?: number;
  currentXp?: number;
  nextLevelXp?: number;
  gamesCompleted?: number;
  totalScore?: number;
  achievements?: Achievement[];
  recentActivity?: ActivityLog[];
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  skillCode: string;
  difficulty: Difficulty;
  isActive?: boolean;
}

export interface Submission {
  id: string;
  questId: string;
  userId: string;
  content: string;
  status: 'pending_analysis' | 'evaluated';
  feedback?: string;
  xpAwarded?: number;
  createdAt: string;
  evaluatedAt?: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
  icon?: string;
}

export interface Achievement {
  id: string;
  code?: string;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  completed?: boolean;
  icon?: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  userId: string;
  username: string;
  userName: string;
  xp: number;
  totalXp: number;
  level: number;
  totalScore: number;
}

export interface ActivityLog {
  id: string;
  game: string;
  score: number;
  xp: number;
  date: string;
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

export interface ActionTask {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  source: '5S Red Tag' | 'LPA Finding' | 'Ishikawa' | 'General';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  imageUrl?: string;
  location?: string;
  workplaceId?: string; 
}

export interface Workplace {
  id: string;
  name: string;
  type: 'production' | 'logistics' | 'quality' | 'office';
  coordinates: { x: number; y: number }; 
  status: 'optimal' | 'warning' | 'critical';
  redTags: number;
  activeTrainingModules: number;
  checklist: string[]; 
  complianceScore?: number;
  lastAuditDate?: string;
}

export interface AuditCheckItem {
  category: '5S_Sort' | '5S_SetInOrder' | '5S_Shine' | '5S_Standardize' | '5S_Sustain';
  item: string;
  passed: boolean;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  expected_answer: "Yes" | "No" | "N/A" | "Text";
  scoring_weight: number;
  guidance: string;
  photo_required: boolean;
  category: string;
  order?: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: "5S" | "LPA" | "Safety" | "Custom";
  items: ChecklistItem[];
  version: number;
  isPublic: boolean;
  isPublished: boolean;
  createdBy: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
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
  status: "in_progress" | "submitted" | "approved" | "rejected" | "cancelled";
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
  completedAt?: string;
  checklistName?: string;
  workplaceName?: string;
  auditorName?: string;
}

export enum IshikawaCategory {
  MAN = 'Man',
  MACHINE = 'Machine',
  METHOD = 'Method',
  MATERIAL = 'Material',
  MEASUREMENT = 'Measurement',
  ENVIRONMENT = 'Environment',
}

export interface IshikawaCause {
  category: IshikawaCategory;
  cause: string;
  isRootCause: boolean;
  id?: string;
}

export interface IshikawaProblem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  isRealWorld?: boolean; 
}

export interface IshikawaSolution {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  steps: string[];
}

export interface LensScanResult {
  overallCompliance: number; 
  checklistResults: {
    item: string;
    compliant: boolean;
    observation: string;
  }[];
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

export interface LPAScanResult {
  compliance: 'High' | 'Medium' | 'Low';
  observations: string[];
  safetyRisk: boolean;
  identifiedIssues: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'task';
  read: boolean;
  timestamp: string;
  relatedTaskId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AuditItem {
  id: string;
  name: string;
  status: string;
  correctAction: string;
}

export interface AuditScene {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  items: AuditItem[];
}

export interface LPAQuestion {
  id: string;
  question: string;
  category: string;
  correctAnswer: string;
}

export interface LPAAudit {
  id: string;
  title: string;
  description: string;
  frequency: string;
  xpReward: number;
  questions: LPAQuestion[];
}

export interface RedTagData {
  id: string;
  timestamp: string;
  itemDetected: string;
  actionNeeded: string;
  location: string;
  status: 'Open' | 'Closed';
}

export interface SubmissionResponse {
  id: number;
  xpGain: number;
  score: number;
  status: string;
}

export interface AuditResult {
  score: number;
  total: number;
  xp: number;
  findings: number;
}

export interface IshikawaResult {
  causes: IshikawaCause[];
  xp: number;
}

export interface GembaObservation {
  id: string;
  station: number;
  text: string;
  type: 'Safety' | 'Quality' | 'Productivity' | 'Waste' | 'Improvement';
}

export interface GembaResult {
  observations: GembaObservation[];
  xp: number;
}
