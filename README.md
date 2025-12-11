<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎮 Lean_RPG Frontend

Gamified Lean Learning Platform for Automotive Manufacturing

## 📚 Documentation

**COMPREHENSIVE SPECIFICATIONS NOW AVAILABLE IN `/docs` FOLDER:**

- 📋 **[docs/00-SPECIFICATION_INDEX.md](docs/00-SPECIFICATION_INDEX.md)** - START HERE! Index & navigation for all roles
- 💻 **[docs/01-FRONTEND_DEVELOPMENT.md](docs/01-FRONTEND_DEVELOPMENT.md)** - Complete React development guide
- 🔌 **[docs/02-LEAN_RPG_API_SPECIFICATION.md](docs/02-LEAN_RPG_API_SPECIFICATION.md)** - Full API reference with examples
- 📊 **[docs/03-LEAN_RPG_OPENAPI.json](docs/03-LEAN_RPG_OPENAPI.json)** - Swagger/OpenAPI spec (import to Postman)
- 🤖 **[docs/04-AI_INTEGRATION_GUIDE.md](docs/04-AI_INTEGRATION_GUIDE.md)** - For AI assistants & new developers

**Total**: 4000+ lines of complete specification!

### Quick Start by Role

- **Frontend Dev**: Read `docs/01-FRONTEND_DEVELOPMENT.md`
- **Backend Dev**: Read `docs/02-LEAN_RPG_API_SPECIFICATION.md`
- **AI Assistant**: Read `docs/04-AI_INTEGRATION_GUIDE.md`
- **QA Tester**: Import `docs/03-LEAN_RPG_OPENAPI.json` to Postman
- **Project Manager**: Start with `docs/00-SPECIFICATION_INDEX.md`

---

## ⚡ Quick Setup

**Prerequisites:** Node.js 18+

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env` or `.env.local`:
```env
VITE_API_URL=http://localhost:4000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_ENV=development
```

### 3. Run locally
```bash
npm run dev
# Opens: http://localhost:5173
```

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## 🏗️ Project Structure

```
Lean_RPG_App/
├── docs/                    # 📚 COMPLETE SPECIFICATION DOCS
│   ├── 00-SPECIFICATION_INDEX.md
│   ├── 01-FRONTEND_DEVELOPMENT.md
│   ├── 02-LEAN_RPG_API_SPECIFICATION.md
│   ├── 03-LEAN_RPG_OPENAPI.json
│   └── 04-AI_INTEGRATION_GUIDE.md
│
├── src/
│   ├── components/           # React components
│   ├── contexts/             # React Context
│   ├── services/             # Business logic
│   ├── utils/                # Utilities
│   ├── App.tsx               # Main component
│   ├── types.ts              # TypeScript types
│   └── constants.ts          # Configuration
│
├── index.html                # HTML template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
└── README.md                 # This file
```

---

## 🎮 Features

- **3x Mini-Games**:
  - 5S Audit Game - Identify workplace issues
  - Ishikawa Fishbone - Root cause analysis
  - Factory Map - Real-world red tagging

- **Gamification**:
  - XP & Levels
  - Achievements & Badges
  - Leaderboards (Global + Skill-based)

- **AI Integration**:
  - Lean Sensei Chatbot (Gemini)
  - Vision analysis for 5S issues
  - Solution generation from Ishikawa

- **Real-World**:
  - Red tag creation from factory floor
  - Photo evidence & analysis
  - Status tracking

---

## 🔗 API Integration

Frontend connects to Backend API (see documentation for details):

**Base URL**: `http://localhost:4000` (dev)

**Key Endpoints**:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/quests` - List quests
- `POST /api/submissions` - Submit game completion
- `GET /api/submissions/:id` - Poll for AI analysis
- `GET /api/gamification/leaderboard/global` - Get rankings
- `POST /api/red-tags` - Create red tag
- `POST /api/ai/chat` - Chat with Lean Sensei

**Full API docs**: See `docs/02-LEAN_RPG_API_SPECIFICATION.md`

---

## 🧩 Component Architecture

```
App.tsx (main)
├── Dashboard          - Player profile & stats
├── GameHub            - Quest selection
├── AuditGame          - 5S audit mini-game
├── IshikawaGame       - Fishbone diagram
├── FactoryMap         - Workplace navigation
├── LeanChatbot        - AI Sensei
└── AchievementToast   - Notifications
```

---

## 🤖 AI/Copilot Usage

To use with GitHub Copilot or Claude:

1. Copy `docs/04-AI_INTEGRATION_GUIDE.md` into your AI prompt
2. Reference specific tasks and implementation patterns
3. AI will generate code following the spec

**Example**:
```
Implementuj Frontend Task 1 z AI_INTEGRATION_GUIDE.md:
apiService.ts s metodami pro všechny endpoints.
```

---

## 📦 Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Google Generative AI** - Gemini integration
- **Lucide Icons** - Icon library

---

## ✅ Development Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set (`.env`)
- [ ] Dev server running (`npm run dev`)
- [ ] API connection working
- [ ] Components loading
- [ ] No console errors
- [ ] Types compile correctly

---

## 📖 Learning Resources

Inside `/docs`:
- Architecture overview
- Component details
- API endpoints with curl examples
- Implementation patterns
- Troubleshooting guide
- AI integration examples

---

## 🚀 Next Steps

1. **Read**: Start with `docs/00-SPECIFICATION_INDEX.md`
2. **Choose Role**: Pick your development path
3. **Read Relevant Doc**: Based on your role
4. **Setup**: Follow environment setup above
5. **Implement**: Follow tasks in chosen doc
6. **Reference**: Use `docs/03-LEAN_RPG_OPENAPI.json` for API

---

## 🔗 Links

- **Backend**: https://github.com/Keksiczek/Lean_RPG
- **Specification Docs**: `/docs` folder
- **API OpenAPI**: `docs/03-LEAN_RPG_OPENAPI.json`

---

## 📝 License

MIT

---

**Status**: 🟢 MVP Development with Complete Specifications  
**Last Updated**: December 11, 2025
