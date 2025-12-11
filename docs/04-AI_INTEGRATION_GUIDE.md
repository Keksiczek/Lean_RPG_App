# 🤖 Lean_RPG - AI/Copilot Integration Guide

**For**: AI Coding Assistants (GitHub Copilot, Claude, Gemini)  
**Purpose**: Enable AI to implement Lean_RPG features  
**Frontend**: https://github.com/Keksiczek/Lean_RPG_App  
**Backend**: https://github.com/Keksiczek/Lean_RPG  

---

## 🚀 Quick Start for AI

### 1️⃣ Read These First

1. This file - Overview & architecture
2. `docs/01-FRONTEND_DEVELOPMENT.md` - Component guide
3. `docs/02-LEAN_RPG_API_SPECIFICATION.md` - API endpoints
4. `docs/03-LEAN_RPG_OPENAPI.json` - Swagger spec

### 2️⃣ Use This Guide for Tasks

```bash
# Example prompt:
"Podle AI_INTEGRATION_GUIDE.md implementuj 
Frontend Task #1: apiService.ts s metodami pro všechny endpoints.
Vouž TypeScript a React hooks pattern ze guide."
```

---

## 🏗 Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│ Lean_RPG_App (Vite, TypeScript)                        │
├─────────────────────────────────────────────────────────┤
│ Components:                                             │
│ ├─ Dashboard (player profile, progress)                │
│ ├─ GameHub (quest selection)                           │
│ ├─ AuditGame (5S mini-game)                            │
│ ├─ IshikawaGame (fishbone diagram)                     │
│ ├─ FactoryMap (workplace navigation)                   │
│ ├─ LeanChatbot (Gemini integration)                    │
│ └─ AchievementToast (notifications)                    │
│                                                         │
│ Services:                                               │
│ ├─ geminiService (AI: chat, vision, solutions)         │
│ └─ apiService (TODO: implement with backend)           │
│                                                         │
│ State:                                                  │
│ ├─ React hooks (useState)                              │
│ ├─ Context (LanguageProvider)                          │
│ └─ Local game logic (XP, levels, achievements)         │
└────────────────┬────────────────────────────────────────┘
                 │ API Calls (HTTP)
                 │ http://localhost:4000
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                    │
│ Lean_RPG (Node.js, TypeScript, Prisma)                │
├─────────────────────────────────────────────────────────┤
│ Routes:                                                 │
│ ├─ /api/auth/*                                          │
│ ├─ /api/players/*                                       │
│ ├─ /api/quests/*                                        │
│ ├─ /api/submissions/*                                   │
│ ├─ /api/gamification/*                                  │
│ ├─ /api/red-tags/*                                      │
│ └─ /api/ai/*                                            │
│                                                         │
│ Database (Prisma):                                      │
│ ├─ User, Player                                         │
│ ├─ Quest, UserQuest, Submission                         │
│ ├─ Achievement, Badge                                   │
│ ├─ RedTag                                               │
│ └─ LeaderboardEntry                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Data Flow Example: Submit 5S Audit

```
1. Frontend: User completes audit game
   └─ callApi('POST /api/submissions', { questId, content })

2. Backend: Receives submission
   └─ Validates & stores in database (status: pending_analysis)

3. Background Job: Queues AI analysis
   └─ enqueueJob('analyze_submission', submissionId)

4. AI Service: Analyzes solution
   └─ Calls Gemini API with submission content
   └─ Generates score, XP, feedback

5. Backend: Updates submission
   └─ Updates status to 'evaluated'
   └─ Awards XP to player
   └─ Checks for badge unlocks
   └─ Updates leaderboards

6. Frontend: Polls for results
   └─ getSubmission(submissionId)
   └─ Receives: score, xpAwarded, feedback

7. Frontend: Updates game state
   └─ Updates player.totalXp
   └─ Updates achievements
   └─ Shows feedback toast
```

---

## 💻 Frontend Development Tasks

### Task 1: Implement API Service Layer

**File**: `frontend/services/apiService.ts`

```typescript
// API Service template
export class ApiService {
  constructor(private baseUrl: string, private token: string) {}
  
  // Authentication
  async login(email: string, password: string): Promise<AuthResponse>
  async register(email: string, username: string, password: string): Promise<AuthResponse>
  
  // Player
  async getPlayer(userId: string): Promise<Player>
  async updatePlayer(userId: string, updates: Partial<Player>): Promise<Player>
  
  // Quests
  async getQuests(filters?: QuestFilters): Promise<Quest[]>
  async getQuest(questId: string): Promise<Quest>
  async acceptQuest(questId: string): Promise<UserQuest>
  
  // Submissions
  async submitSolution(questId: string, content: string, image?: string): Promise<Submission>
  async getSubmission(submissionId: string): Promise<Submission>
  
  // Leaderboard
  async getLeaderboard(page?: number): Promise<LeaderboardResponse>
  
  // Red Tags
  async createRedTag(data: RedTagInput): Promise<RedTag>
  async getRedTags(filters?: RedTagFilters): Promise<RedTag[]>
  
  // AI
  async generateSolutions(problem: Problem, causes: Cause[]): Promise<Solution[]>
  async analyzeImage(base64Image: string): Promise<LensScanResult>
  async chatWithSensei(message: string): Promise<ChatResponse>
}
```

**Steps**:
1. Create `services/apiService.ts`
2. Add HTTP client setup (fetch or axios)
3. Implement each method above
4. Add error handling & token management
5. Test with mock data

---

### Task 2: Update Components to Use API

**Examples**:

```typescript
// In AuditGame.tsx
const submitAudit = async () => {
  const submission = await api.submitSolution(questId, JSON.stringify(answers));
  
  // Poll for AI analysis
  const result = await pollUntilEvaluated(submission.id);
  
  // Update state
  setPlayer(prev => ({
    ...prev,
    totalXp: prev.totalXp + result.xpAwarded
  }));
  
  // Show feedback
  showToast(result.feedback);
};

// In Dashboard.tsx
useEffect(() => {
  api.getPlayer(userId).then(setPlayer);
}, [userId, token]);

// In GameHub.tsx
useEffect(() => {
  api.getQuests({ category: selectedCategory }).then(setQuests);
}, [selectedCategory]);
```

---

### Task 3: Implement Polling for AI Results

```typescript
// Polling pattern
const pollSubmissionUntilEvaluated = async (submissionId: string) => {
  const MAX_POLLS = 30; // 1 minute at 2s interval
  
  for (let i = 0; i < MAX_POLLS; i++) {
    const sub = await api.getSubmission(submissionId);
    
    if (sub.status === 'evaluated') {
      return sub; // AI done!
    }
    
    if (sub.status === 'rejected') {
      throw new Error('Submission rejected');
    }
    
    // Wait before retry
    await new Promise(r => setTimeout(r, 2000));
  }
  
  throw new Error('Timeout waiting for AI analysis');
};
```

---

## 🔧 Backend Development Tasks

### Task 1: Implement Submission Processing

```typescript
// backend/src/services/GameService.ts
async submitSolution(userId: string, questId: string, content: string) {
  // 1. Validate quest exists
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) throw new Error('Quest not found');
  
  // 2. Create submission (status: pending_analysis)
  const submission = await prisma.submission.create({
    data: {
      userId,
      questId,
      content,
      status: 'pending_analysis'
    }
  });
  
  // 3. Queue AI analysis job
  await queue.add('analyze_submission', { submissionId: submission.id });
  
  // 4. Return submission
  return submission;
}
```

---

### Task 2: Implement AI Analysis Worker

```typescript
// backend/src/workers/submissionAnalyzer.ts
async analyzeSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  
  // Call Gemini API
  const feedback = await aiService.evaluateSubmission(
    submission.content,
    submission.questId
  );
  
  // Calculate score & XP
  const { score, xp } = calculateRewards(feedback);
  
  // Update database
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: 'evaluated',
      score,
      xpAwarded: xp,
      feedback: feedback.text,
      evaluatedAt: new Date()
    }
  });
  
  // Award XP to player
  await gameService.awardXp(submission.userId, xp);
  
  // Check for badges
  await gamificationService.checkBadgeUnlocks(submission.userId);
  
  // Update leaderboard
  await leaderboardService.updatePlayerRanking(submission.userId);
}
```

---

### Task 3: Implement Leaderboard Queries

```typescript
// backend/src/services/LeaderboardService.ts
async getGlobalLeaderboard(page: number = 1) {
  const players = await prisma.player.findMany({
    orderBy: { totalXp: 'desc' },
    skip: (page - 1) * 10,
    take: 10,
    include: {
      user: { select: { id: true } }
    }
  });
  
  return players.map((p, i) => ({
    rank: (page - 1) * 10 + i + 1,
    userId: p.userId,
    username: p.username,
    totalXp: p.totalXp,
    level: p.level
  }));
}
```

---

### Task 4: Implement Real-World Red Tag API

```typescript
// backend/src/routes/redTags.ts
router.post('/red-tags', auth, async (req, res) => {
  const { location, itemDetected, actionNeeded, suggestedAction, severity, imageUrl } = req.body;
  
  const redTag = await prisma.redTag.create({
    data: {
      timestamp: new Date(),
      location,
      itemDetected,
      observation: req.body.observation || '',
      actionNeeded,
      suggested5SAction: suggestedAction,
      severity,
      imageUrl,
      status: 'Open',
      createdBy: req.userId
    }
  });
  
  // Award XP for finding real issue
  await gameService.awardXp(req.userId, 100);
  
  return res.status(201).json(redTag);
});
```

---

## 🔑 Implementation Patterns

### Frontend → Backend Communication

```typescript
// Pattern 1: Simple fetch
const submitGame = async (questId: string, content: string) => {
  const response = await fetch(`${API_URL}/api/submissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ questId, content })
  });
  
  if (!response.ok) throw new Error('Failed to submit');
  return response.json();
};
```

### Async AI Analysis Pattern

```
1. Frontend: POST /api/submissions → returns { id, status: 'pending_analysis' }
2. Backend: Enqueues job, returns immediately
3. Worker: Analyzes submission (5-30 seconds)
4. Frontend: Polls GET /api/submissions/id every 2 seconds
5. When status changes to 'evaluated', show score & feedback
```

### Leaderboard Update Pattern

```typescript
// After each submission evaluated:
1. Calculate XP
2. Award to player (update totalXp)
3. Check level-up
4. Update leaderboard rank
5. Check badge/achievement unlocks
6. Notify player
```

---

## 🚨 Common Gotchas

### 1. JWT Token Handling
```typescript
// ✅ Correct
headers: { 'Authorization': `Bearer ${token}` }

// ❌ Wrong
headers: { 'Authorization': token }
```

### 2. Polling Timeout
```typescript
// Don't poll forever - set max attempts
const MAX_POLLS = 30; // 1 minute at 2s interval
for (let i = 0; i < MAX_POLLS; i++) {
  // poll...
}
```

### 3. Error Handling
```typescript
// Always catch and handle 401 Unauthorized
if (response.status === 401) {
  // Token expired, redirect to login
  redirectToLogin();
}
```

### 4. CORS Configuration
```typescript
// Backend must allow frontend origin
app.use(cors({
  origin: ['http://localhost:3000', 'https://app.lean-rpg.com'],
  credentials: true
}));
```

### 5. Environment Variables
```typescript
// Frontend: VITE_API_URL
// Backend: DATABASE_URL, REDIS_URL, GEMINI_API_KEY
// Check .env files are configured!
```

---

## ✅ Validation Checklist for AI

When implementing features, ensure:

- [ ] API endpoint exists in `/api/*`
- [ ] Request/response match OpenAPI spec
- [ ] JWT token required for authenticated endpoints
- [ ] Error handling with proper HTTP status codes
- [ ] Database transactions for multi-step operations
- [ ] AI analysis queued asynchronously (not blocking)
- [ ] Frontend can poll for async results
- [ ] Leaderboards update after XP awards
- [ ] Badges/achievements check after completions
- [ ] Rate limiting respected
- [ ] CORS headers set for frontend access
- [ ] Environment variables configured
- [ ] Types match across frontend/backend
- [ ] Error messages are user-friendly
- [ ] Code compiles without errors

---

## 📚 Example Prompts for AI

```
# Frontend API Service
"Implementuj apiService.ts podle AI_INTEGRATION_GUIDE.md Task 1.
Vouž TypeScript, React hooks, a pattern pro error handling."

# Backend Submission Processing
"Implementuj GameService.submitSolution() podle guideu.
Vouž Prisma ORM a queuj AI job asynchronně."

# Complete Feature
"Implementuj kompletní feature: Submit 5S audit, poll AI results, 
update player XP and leaderboard. Podle AI_INTEGRATION_GUIDE data flow."
```

---

## 🎯 Success Criteria

✅ Feature works as specified  
✅ Frontend calls API correctly  
✅ Backend returns correct responses  
✅ Error handling works  
✅ Types match across layers  
✅ No console errors  
✅ Tests pass  
✅ Code reviewed  
✅ Checklist complete  

---

**Status**: Ready for implementation  
**Last Updated**: December 11, 2025  
**For**: GitHub Copilot, Claude, Gemini
