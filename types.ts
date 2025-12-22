

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
  COMPLIANCE_DASHBOARD = 'COMPLIANCE_DASHBOARD',
  TEAM_MANAGEMENT = 'TEAM_MANAGEMENT',
  METHODOLOGY_CONFIG = 'METHODOLOGY_CONFIG',
  PROFILE = 'PROFILE',
  SETTINGS_ACCOUNT = 'SETTINGS_ACCOUNT',
  SETTINGS_FACTORY = 'SETTINGS_FACTORY',
  NOTIFICATIONS = 'NOTIFICATIONS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_QUESTS = 'ADMIN_QUESTS',
  ADMIN_BADGES = 'ADMIN_BADGES',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS',
  ADMIN_REPORTS = 'ADMIN_REPORTS',
  AUDIT_SESSION = 'AUDIT_SESSION',
}

export type Language = 'cs' | 'en' | 'de';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export type TaskCategory = '5S' | 'Safety' | 'Maintenance' | 'Quality' | 'Process';

export enum UserRole {
  OPERATOR = 'operator',
  TEAM_LEADER = 'team_leader',
  CI_SPECIALIST = 'ci_specialist',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'superadmin',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  AUDIT_MANAGER = 'AUDIT_MANAGER',
  TRAINER = 'TRAINER',
  OPERATOR = 'OPERATOR',
}

export interface User {
  id: string;
  email: string;
  name: string;
  xp: number;
  level: number;
  tenantId: string;
  role: UserRole | string;
  createdAt: string;
  teamId?: string;
}

export type Player = User & {
  username: string;
  totalXp: number;
  currentXp: number;
  nextLevelXp: number;
  gamesCompleted: number;
  totalScore: number;
  achievements: Achievement[];
  recentActivity: ActivityLog[];
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  completed?: boolean;
  targetValue?: number;
  currentValue?: number;
  code?: string;
}

export interface ActivityLog {
  id: string;
  game: string;
  score: number;
  xp: number;
  date: string;
}

export interface ActionTask {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: TaskCategory;
  source: string;
  location?: string;
  dueDate?: string;
  imageUrl?: string;
  workplaceId?: string;
  createdAt: string;
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
}

export interface LensChecklistResult {
  item: string;
  compliant: boolean;
  observation: string;
}

export interface LensScanResult {
  overallCompliance: number;
  observation: string;
  detectedHazards: {
    name: string;
    action: string;
    severity: 'Low' | 'Medium' | 'High';
    suggestion: string;
    location: { top: number; left: number };
  }[];
  checklistResults?: LensChecklistResult[];
  itemDetected?: string;
  suggested5SAction?: string;
  practicalAction?: string;
}

export interface LPAScanResult {
  verified: boolean;
  confidence: number;
  compliance: 'High' | 'Medium' | 'Low';
  observations: string[];
  safetyRisk?: boolean;
  identifiedIssues?: string[];
}

export enum IshikawaCategory {
  MAN = 'Man',
  MACHINE = 'Machine',
  MATERIAL = 'Material',
  METHOD = 'Method',
  MEASUREMENT = 'Measurement',
  ENVIRONMENT = 'Environment',
}

export interface IshikawaCause {
  id: string;
  category: IshikawaCategory;
  cause: string;
  isRootCause: boolean;
}

export interface IshikawaSolution {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  steps: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  skillCode: string;
  difficulty: Difficulty;
  xpReward: number;
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
  evaluatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  code: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  xp: number;
  level: number;
  rank: number;
  totalXp: number;
  totalScore: number;
  id?: string;
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

export interface SubmissionResponse {
  id: string;
  xpGain: number;
  score: number;
  status: string;
  feedback?: string;
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
  items: AuditItem[];
  xpReward: number;
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
  questions: LPAQuestion[];
  xpReward: number;
}

export interface IshikawaProblem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  isRealWorld?: boolean;
}

export interface ChecklistItem {
  id: string;
  question: string;
  expected_answer: string;
  scoring_weight: number;
  guidance: string;
  photo_required: boolean;
  category: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  version: number;
  isPublic: boolean;
  isPublished: boolean;
  createdBy: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  items: ChecklistItem[];
  usageCount?: number;
}

export interface AuditResponse {
  itemId: string;
  answer: string;
  timestamp: string;
  photoIds?: string[];
  notes?: string;
}

export interface AuditFinding {
  itemId: string;
  severity: string;
  description: string;
  photo?: string;
  approved: boolean;
}

export interface AuditSession {
  id: string;
  checklistId: string;
  workplaceId: string;
  auditorId: string;
  status: string;
  responses: AuditResponse[];
  photoEvidence: string[];
  findings: AuditFinding[];
  overallCompliance: number;
  riskLevel: string;
  score: number;
  xpEarned: number;
  startTime: string;
  endTime?: string;
  createdAt: string;
  checklistName?: string;
  workplaceName?: string;
  auditorName?: string;
}

export interface TenantFeatures {
  gamification: boolean;
  aiVision: boolean;
  lpa: boolean;
  ishikawa: boolean;
  factoryMap: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  features: TenantFeatures;
  settings: {
    welcomeMessage: string;
    supportEmail: string;
    xpMultiplier: number;
  };
}

export interface RedTagData {
  id: string;
  timestamp: string;
  itemDetected: string;
  actionNeeded: string;
  location: string;
  status: string;
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

export type UserWithRole = Player;
