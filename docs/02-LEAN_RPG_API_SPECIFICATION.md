# 🔌 Lean_RPG API Specification

**Version**: 1.0.0  
**Base URL**: `http://localhost:4000` (dev) | `https://api.lean-rpg.com` (prod)  
**Format**: REST JSON  
**Auth**: JWT Bearer Token  

---

## Overview

### API Features

- **Authentication**: JWT tokens (login/register)
- **Game Loop**: Quest → Play → Submit → Evaluate → XP/Badges
- **Async AI**: Submission analysis queued, client polls for results
- **Leaderboards**: Global + skill-specific rankings
- **Real-World**: Red tags from factory floor
- **Gamification**: Achievements, badges, levels, streaks

---

## 🔍 Authentication

### POST /api/auth/register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "username": "LeanMaster",
    "password": "SecurePassword123!"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiI...",
    "user": {
      "id": "usr_123abc",
      "email": "player@example.com",
      "username": "LeanMaster"
    }
  }
}
```

---

### POST /api/auth/login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiI...",
    "user": {
      "id": "usr_123abc",
      "email": "player@example.com",
      "username": "LeanMaster"
    }
  }
}
```

---

## 👤 Players

### GET /api/players/:userId

```bash
curl -X GET http://localhost:4000/api/players/usr_123abc \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "usr_123abc",
    "username": "LeanMaster",
    "level": 5,
    "currentXp": 350,
    "totalXp": 3500,
    "nextLevelXp": 1000,
    "gamesCompleted": 12,
    "totalScore": 4200,
    "achievements": []
  }
}
```

---

## 📚 Quests

### GET /api/quests

```bash
curl -X GET "http://localhost:4000/api/quests?category=5S&difficulty=medium" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters**:
- `category` - "5S", "Muda", "Kaizen", "ProblemSolving"
- `difficulty` - "easy", "medium", "hard"

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "id": "quest_5s_101",
        "title": "Organize the Injection Molding Workshop",
        "category": "5S",
        "difficulty": "easy",
        "xpReward": 250
      }
    ],
    "total": 45,
    "page": 1
  }
}
```

---

### POST /api/quests/:questId/accept

```bash
curl -X POST http://localhost:4000/api/quests/quest_5s_101/accept \
  -H "Authorization: Bearer <token>"
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uq_789xyz",
    "userId": "usr_123abc",
    "questId": "quest_5s_101",
    "status": "in_progress",
    "acceptedAt": "2025-12-11T14:40:00Z"
  }
}
```

---

## 🕐 Submissions

### POST /api/submissions

```bash
curl -X POST http://localhost:4000/api/submissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "questId": "quest_5s_101",
    "content": "{\"answers\": ...}"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "sub_456def",
    "userId": "usr_123abc",
    "questId": "quest_5s_101",
    "status": "pending_analysis",
    "message": "Submission received. AI analysis queued."
  }
}
```

---

### GET /api/submissions/:submissionId (Polling)

```bash
# Poll every 2 seconds until status changes
curl -X GET http://localhost:4000/api/submissions/sub_456def \
  -H "Authorization: Bearer <token>"
```

**Response** - Pending:
```json
{
  "success": true,
  "data": {
    "id": "sub_456def",
    "status": "pending_analysis"
  }
}
```

**Response** - Evaluated:
```json
{
  "success": true,
  "data": {
    "id": "sub_456def",
    "status": "evaluated",
    "score": 85,
    "xpAwarded": 210,
    "feedback": "Great work! You correctly identified 4 out of 5 issues."
  }
}
```

---

## 🌟 Gamification

### GET /api/gamification/achievements

```bash
curl -X GET http://localhost:4000/api/gamification/achievements \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "ach_5s_master",
        "title": "5S Master",
        "description": "Complete 10 5S audits",
        "unlocked": true,
        "unlockedAt": "2025-12-10T10:00:00Z"
      }
    ],
    "unlockedCount": 5,
    "totalCount": 23
  }
}
```

---

### GET /api/gamification/leaderboard/global

```bash
curl -X GET "http://localhost:4000/api/gamification/leaderboard/global?page=1&perPage=10" \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_555aaa",
        "username": "LeanNinja",
        "totalXp": 8500,
        "level": 12
      }
    ],
    "currentUserRank": 2,
    "total": 450
  }
}
```

---

## 💀 Red Tags

### POST /api/red-tags

```bash
curl -X POST http://localhost:4000/api/red-tags \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Assembly Line A",
    "itemDetected": "Old electrical cables",
    "observation": "Cables scattered on floor",
    "actionNeeded": "Remove or organize cables",
    "suggestedAction": "Sort",
    "severity": "High"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "rt_001",
    "location": "Assembly Line A",
    "severity": "High",
    "status": "Open",
    "xpAwarded": 100
  }
}
```

---

## 🤖 AI Endpoints

### POST /api/ai/chat

```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Muda?"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "response": "Muda (waste) is one of the key concepts in Lean...",
    "suggestions": ["Learn 5S", "Try Audit Game"]
  }
}
```

---

## ✅ Error Handling

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token"
  }
}
```

### Common Errors

| Code | Status | Meaning |
|------|--------|----------|
| `INVALID_REQUEST` | 400 | Bad request |
| `UNAUTHORIZED` | 401 | No/invalid token |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate/conflict |
| `SERVER_ERROR` | 500 | Backend error |

---

## 🚨 Rate Limiting

| Category | Limit | Window |
|----------|-------|--------|
| Auth | 5 | Per minute |
| API Calls | 100 | Per minute |
| AI Calls | 20 | Per minute |
| Submissions | 5 | Per minute |

---

## 🛰 Testing with Postman

1. Import OPENAPI.json
2. Set `{{baseUrl}}` = http://localhost:4000
3. Set `{{token}}` from login response
4. Use in requests: `Authorization: Bearer {{token}}`

---

Next: Podrobnější info v `docs/03-LEAN_RPG_OPENAPI.json` a `docs/04-AI_INTEGRATION_GUIDE.md`
