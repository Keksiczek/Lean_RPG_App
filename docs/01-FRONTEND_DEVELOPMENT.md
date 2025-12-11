# 🎮 Lean_RPG Frontend - Development Guide

## Overview

**Lean_RPG** je gamifikovaná edukační platforma pro Lean principy v automotive prostředí.

Frontend je postavený na:
- **React 18** + **TypeScript**
- **Vite** jako build tool
- **Tailwind CSS** pro styling
- **React Context** pro state management
- **Google Generative AI SDK** pro Gemini integraci

---

## 🏗 Architektura

### Složka struktura

```
Lean_RPG_App/
├── components/           # React komponenty
│   ├── Dashboard.tsx     # Přehled hráče
│   ├── GameHub.tsx       # Výběr her/questů
│   ├── AuditGame.tsx     # Mini-hra: 5S audit
│   ├── IshikawaGame.tsx  # Mini-hra: Fishbone
│   ├── FactoryMap.tsx    # Mapa továrny
│   ├── LeanChatbot.tsx   # Chatbot s Gemini
│   └── AchievementToast.tsx
│
├── contexts/             # React Context
│   └── LanguageProvider.tsx
│
├── services/             # Business logic
│   ├── geminiService.ts  # AI
│   └── apiService.ts     # Backend API (TODO)
│
├── utils/                # Utilities
├── docs/                 # Dokumentace
├── App.tsx               # Main component
├── types.ts              # TypeScript types
└── constants.ts          # Konfigurace
```

---

## 🚀 Setup & Běh

### Instalace

```bash
git clone https://github.com/Keksiczek/Lean_RPG_App
cd Lean_RPG_App
npm install
```

### Env Variables

Vytvořit `.env` nebo `.env.local`:

```env
VITE_API_URL=http://localhost:4000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_ENV=development
```

### Běh dev serveru

```bash
npm run dev
# Otevřít: http://localhost:5173
```

### Build pro produkci

```bash
npm run build
npm run preview
```

---

## 📊 State Management

### Nyní: React hooks + Context

```typescript
const [player, setPlayer] = useState<PlayerState | null>(null);
const [games, setGames] = useState<Game[]>([]);
const [language, setLanguage] = useContext(LanguageContext);
```

### TODO: Migrovat na React Query + Zustand

```typescript
const { data: player } = useQuery(['player', userId], () => api.getPlayer(userId));
const { addXp } = useGameStore();
```

---

## 🔗 API Integration

### Services (TODO - implementovat)

```typescript
// services/apiService.ts
export const apiService = {
  // Auth
  login: async (email, password) => { /* POST /api/auth/login */ },
  register: async (email, username, password) => { /* POST /api/auth/register */ },

  // Player
  getPlayer: async (userId) => { /* GET /api/players/{userId} */ },
  updatePlayer: async (userId, data) => { /* PATCH /api/players/{userId} */ },

  // Quests
  getQuests: async (filters) => { /* GET /api/quests */ },
  getQuest: async (questId) => { /* GET /api/quests/{questId} */ },
  acceptQuest: async (questId) => { /* POST /api/quests/{questId}/accept */ },

  // Submissions
  submitSolution: async (questId, content, image) => { /* POST /api/submissions */ },
  getSubmission: async (submissionId) => { /* GET /api/submissions/{submissionId} */ },

  // Leaderboard
  getLeaderboard: async (page) => { /* GET /api/gamification/leaderboard/global */ },

  // Red Tags
  createRedTag: async (data) => { /* POST /api/red-tags */ },
  getRedTags: async (filters) => { /* GET /api/red-tags */ },

  // AI
  generateSolutions: async (problem, causes) => { /* POST /api/ai/generate-solutions */ },
  analyzeImage: async (base64) => { /* POST /api/ai/analyze-5s-image */ },
  chatWithSensei: async (message) => { /* POST /api/ai/chat */ }
};
```

---

## 🎮 Mini-hry (Game Loops)

### 1. Audit Game (5S)

**Core Loop**:
1. Zobrazit scénu s předměty
2. Hráč klika na problém
3. Vybere správnou 5S akci
4. Backend vyhodnocuje
5. Hráč dostane score + XP

### 2. Ishikawa Game (Fishbone)

**Core Loop**:
1. Hráč vyplní 6 kategorií příčin
2. Systém vygeneruje řešení (AI)
3. Hráč vybere nejlepší řešení
4. Backend vyhodnocuje
5. XP award

### 3. Factory Map

**Core Loop**:
1. Hráč naviguje továrnu
2. Fotografuje problém
3. AI analyzuje (vision)
4. Vytvořit red tag
5. XP award

---

## 🤖 Gemini Integration

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

// Chat
export const chatWithSensei = async (message: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(`You are a Lean expert. ${message}`);
  return result.response.text();
};

// Vision
export const analyzeImage = async (base64Image: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  const result = await model.generateContent([
    "Analyze for 5S issues...",
    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
  ]);
  return JSON.parse(result.response.text());
};
```

---

## 📋 Komponenty

### Dashboard.tsx
- Player profile (level, XP, achievements)
- Recent activities
- Quick stats
- Navigation buttons

### GameHub.tsx
- Seznam questů
- Filter (difficulty, category)
- Status badges
- Play button

### AuditGame.tsx
- Scene render
- Click detection
- Action selection
- Feedback

### IshikawaGame.tsx
- 6 input fields
- Generate solutions button
- Solution display
- Submit

### FactoryMap.tsx
- Map layout
- Location zoom
- Camera input
- Image analysis
- Red tag preview

### LeanChatbot.tsx
- Chat interface
- Message history
- Typing indicator
- Gemini responses

---

## 🛠️ Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@google/generative-ai": "^0.3.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.1.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## ✅ Development Checklist

- [ ] `npm install` успешный
- [ ] `.env` variables set
- [ ] `npm run dev` works
- [ ] Components loading
- [ ] Gemini key valid
- [ ] Types compile
- [ ] No console errors

---

Next: Смотри `docs/02-LEAN_RPG_API_SPECIFICATION.md` для API деталей
