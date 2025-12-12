# 🎮 Lean RPG - Frontend Application

**AI Studio-powered React application** for Lean RPG - a gamified learning platform for Lean methodologies in automotive manufacturing.

![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Vite](https://img.shields.io/badge/Vite-5+-green)

## 📋 Quick Links

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - How to connect with backend API
- **[Code Examples](./INTEGRATION_EXAMPLES.md)** - Practical component examples
- **[Backend Repository](https://github.com/Keksiczek/Lean_RPG)** - Express API server
- **[AI Studio Editor](https://ai.studio/apps/drive/1MRSRWKqQbVSPAbpxbT5PbI0tevccnIdx)** - Visual editor for this app

---

## 🎯 Overview

Lean RPG is a **gamification platform** for teaching Lean principles to manufacturing professionals. This repository contains the **frontend React application** that serves the interactive user interface.

### What is Lean RPG?

A training tool where users:
- 👤 Create characters (CI specialists)
- 🏭 Explore virtual factories (Gemba walk)
- 🎮 Play mini-games:
  - 5S audits
  - Problem-solving (Ishikawa diagrams)
  - Root cause analysis
  - LPA (Lean Process Analysis)
- 📊 Earn XP and badges
- 🎓 Unlock skills (Standard Work, Kaizen, Communication)
- 🏆 Compete on leaderboards

### Tech Stack

```
React 18 + TypeScript → Vite
  ↓
Custom API Client (services/api.ts)
  ↓
Express API (Port 4000) ← Backend
  ↓
PostgreSQL + Prisma
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm** or **yarn**
- **Backend running** on `http://localhost:4000` ([Setup Backend](https://github.com/Keksiczek/Lean_RPG/blob/main/backend/README.md))

### Installation

```bash
# 1. Clone this repository
git clone https://github.com/Keksiczek/Lean_RPG_App.git
cd Lean_RPG_App

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.local.example .env.local
# .env.local should contain:
# VITE_API_URL=http://localhost:4000
# VITE_TENANT_ID=magna

# 4. Start development server
npm run dev
# Open http://localhost:5173 in browser
```

### Verify Backend Connection

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. You should see requests to `http://localhost:4000/auth/login`
5. If successful, you'll get back a JWT token

**See [Integration Guide](./INTEGRATION_GUIDE.md) for troubleshooting.**

---

## 📂 Project Structure

```
Lean_RPG_App/
├── components/              # React UI components
│   ├── Dashboard.tsx
│   ├── GameHub.tsx
│   ├── AuditGame.tsx
│   ├── LoginForm.tsx
│   └── ...                  # 20+ components
│
├── pages/                   # Page-level components
│   ├── ProfilePage.tsx
│   ├── AdminDashboard.tsx
│   └── ...
│
├── hooks/                   # Custom React hooks
│   ├── useApi.ts            # 🆕 API integration hooks
│   │   ├── useFetch()       # GET requests
│   │   ├── useMutation()    # POST/PUT/DELETE
│   │   └── useAuth()        # Authentication
│   └── ...
│
├── services/
│   ├── api.ts               # 🆕 API Service Client
│   │   ├── ApiClient class
│   │   ├── Token management
│   │   └── Error handling
│   └── ...
│
├── contexts/                # React Context providers
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── ...
│
├── utils/                   # Utility functions
├── types.ts                 # TypeScript definitions
├── constants.ts             # Game constants
├── config.ts                # API configuration
│
├── App.tsx                  # Main app component
├── index.tsx                # React entry point
├── index.html               # HTML template
│
├── INTEGRATION_GUIDE.md      # 🆕 Frontend ↔ Backend guide
├── INTEGRATION_EXAMPLES.md   # 🆕 Code examples
├── .env.local.example       # 🆕 Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                # This file
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (if configured)
npm run type-check
```

### Adding New Features

**Step 1: Define API endpoint in backend**
```typescript
// backend/src/routes/your-feature.ts
router.get('/api/your-feature', getYourFeature);
```

**Step 2: Add to config**
```typescript
// config.ts
export const ENDPOINTS = {
  YOUR_FEATURE: {
    BASE: '/api/your-feature',
  },
};
```

**Step 3: Create component with hooks**
```typescript
// components/YourComponent.tsx
const { data, loading } = useFetch(ENDPOINTS.YOUR_FEATURE.BASE);
```

**See [Integration Examples](./INTEGRATION_EXAMPLES.md) for more patterns.**

---

## 🔗 Frontend ↔ Backend Integration

### API Service Client

**File:** `services/api.ts`

Provides centralized HTTP client with:
- ✅ Automatic JWT token management
- ✅ Token refresh on 401 errors
- ✅ Request/response typing
- ✅ Error handling
- ✅ Logout on auth failure

### Custom React Hooks

**File:** `hooks/useApi.ts`

```typescript
// Fetch data
const { data, loading, error, refetch } = useFetch<T>(endpoint);

// POST/PUT/DELETE
const { execute, loading, error } = useMutation(endpoint, 'POST');
const result = await execute(data);

// Authentication
const { login, logout, isAuthenticated } = useAuth();
await login(email, password);
```

**See [Integration Guide](./INTEGRATION_GUIDE.md) for detailed documentation.**

---

## 📡 API Communication

### Request Example

```typescript
// Simple GET
const { data: user } = useFetch('/api/users/me');

// POST with data
const { execute } = useMutation('/api/audits', 'POST');
await execute({
  areaId: 'area-1',
  checklist: results,
});
```

### Response Format

All backend responses follow this structure:

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2025-12-12T11:00:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Validation error: email is required",
  "code": "VALIDATION_ERROR",
  "statusCode": 400
}
```

**Full API reference:** [Backend API Docs](https://github.com/Keksiczek/Lean_RPG/blob/main/docs/API_SPECIFICATION.md)

---

## 🎮 Game Features

### Implemented ✅

- 👤 User authentication & profiles
- 📊 Dashboard with stats
- 🎮 Game hub for mini-games
- 🏭 Factory map / Gemba walk
- 📋 Quest system
- 🏆 Leaderboard
- 🎓 Skill tree
- 💬 Lean chatbot (AI-powered)
- 🔐 Role-based access control
- 🌍 Multi-language support

### In Progress 🔄

- 📊 5S Audit mini-game
- 🔍 Problem-solving (Ishikawa)
- 📈 Advanced analytics
- 🎨 UI/UX refinements

### Planned 📅

- 🤖 AI feedback system (Gemini integration)
- 👥 Multiplayer challenges
- 📊 Admin dashboard improvements
- 📱 Mobile optimizations

---

## ⚙️ Configuration

### Environment Variables

**Create `.env.local` from `.env.local.example`:**

```bash
# Required
VITE_API_URL=http://localhost:4000          # Backend API URL
VITE_TENANT_ID=magna                        # Default tenant (factory)

# Optional
VITE_GEMINI_API_KEY=your-api-key           # For AI features
VITE_APP_NAME=Lean_RPG
VITE_LOG_LEVEL=debug                        # debug | info | warn | error
```

### Backend Requirements

The backend must be running with CORS configured:

```bash
# Backend .env
CORS_ORIGIN=http://localhost:5173          # Your frontend URL
```

[Setup Backend](https://github.com/Keksiczek/Lean_RPG/blob/main/backend/README.md)

---

## 🧪 Testing

### Manual Testing

1. **Login Test**
   ```bash
   # Start both frontend and backend
   # Try login with test credentials
   # Check DevTools Network tab
   ```

2. **API Calls**
   ```bash
   # Check localStorage for tokens
   # Monitor API responses in Network tab
   # Verify error handling
   ```

3. **Authentication Flow**
   ```bash
   # Test token refresh (wait 7+ minutes)
   # Test logout
   # Test protected routes
   ```

### Running Tests (Future)

```bash
# Unit tests (when configured)
npm run test

# E2E tests (Cypress, Playwright)
npm run test:e2e
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build optimized bundle
npm run build

# Output in dist/ folder
# Ready to deploy to:
# - Vercel
# - Netlify
# - AWS S3
# - GitHub Pages
# - etc.
```

### Environment for Production

```bash
# .env.production (Vercel/Netlify will use this)
VITE_API_URL=https://api.yourdomain.com
VITE_TENANT_ID=magna
```

### Docker (Optional)

```bash
# Build Docker image
docker build -t lean-rpg-frontend .

# Run container
docker run -p 3000:80 lean-rpg-frontend
```

---

## 🐛 Troubleshooting

### "Cannot reach backend"

```bash
# 1. Check backend is running
curl http://localhost:4000/api/health

# 2. Check VITE_API_URL in .env.local
echo $VITE_API_URL

# 3. Check backend CORS_ORIGIN
# Should match your frontend URL (http://localhost:5173)
```

### "Login fails with 401"

```bash
# 1. Check credentials
# 2. Verify JWT_SECRET matches in backend
# 3. Check token in localStorage (DevTools)
```

### "CORS error"

```bash
# 1. Verify CORS_ORIGIN in backend .env
echo $CORS_ORIGIN
# Should be http://localhost:5173

# 2. Restart backend after changing .env

# 3. Check browser console for detailed error
```

**More help:** [Integration Guide - Troubleshooting](./INTEGRATION_GUIDE.md#troubleshooting)

---

## 📚 Documentation

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Complete frontend ↔ backend setup
- **[Code Examples](./INTEGRATION_EXAMPLES.md)** - Practical component patterns
- **[Backend README](https://github.com/Keksiczek/Lean_RPG/blob/main/backend/README.md)** - API server docs
- **[API Reference](https://github.com/Keksiczek/Lean_RPG/blob/main/docs/API_SPECIFICATION.md)** - Endpoint documentation

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes following React/TypeScript best practices
3. Test with backend running locally
4. Commit with clear messages
5. Create pull request

**Development tip:** Use [Integration Guide](./INTEGRATION_GUIDE.md) when adding new features.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Keksiczek/Lean_RPG_App/issues)
- **Backend Issues:** [Backend Issues](https://github.com/Keksiczek/Lean_RPG/issues)
- **Documentation:** See [Integration Guide](./INTEGRATION_GUIDE.md)

---

## 🔗 Related Repositories

- **[Lean_RPG](https://github.com/Keksiczek/Lean_RPG)** - Backend API & documentation
- **[AI Studio](https://ai.studio/apps/drive/1MRSRWKqQbVSPAbpxbT5PbI0tevccnIdx)** - Visual editor for this app

---

**Status:** 🚀 In active development  
**Last Updated:** 12. prosince 2025  
**Version:** 0.1.0
