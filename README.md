# 🎮 Lean_RPG Frontend

**Modern React + Vite application** pro Lean RPG - gamifikovanou výukovou platformu zaměřenou na Lean metodiky v automotive průmyslu.

## 📊 Status

✅ **DEVELOPMENT-READY**

- React 18 + TypeScript
- Vite for fast development
- Responsive design (mobile-first)
- Game UI components
- Real-time progress tracking
- Gemini AI integration

## 🏗️ Technologický Stack

```
Vite + React 18 + TypeScript
    ↓
Tailwind CSS (Responsive UI)
    ↓
React Query (State management)
    ↓
Express.js Backend API (http://localhost:4000)
    ↓
PostgreSQL + Redis + Gemini AI
```

**Stack Details:**
- **Frontend**: React 18.2, TypeScript 5.4
- **Build Tool**: Vite 5.0 (lightning fast)
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Axios + React Query
- **State**: Zustand or React Context
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom components + Headless UI
- **Authentication**: JWT tokens in localStorage

## 🎯 Co Frontend Implementuje

### Core Features
- ✅ **Authentication** - Login/Register s JWT
- ✅ **Quest System** - Gamifikované úkoly
- ✅ **Skill Tree** - Visual skill progression
- ✅ **5S Audits** - Interactive audit interface
- ✅ **Problem Solving** - Ishikawa diagram builder
- ✅ **Gemba Walk** - Virtual factory exploration
- ✅ **XP & Leveling** - Real-time progress
- ✅ **Badges & Achievements** - Reward display
- ✅ **Leaderboard** - Global rankings
- ✅ **User Profile** - Personal stats & settings

### Advanced Features
- 🎨 **Dark Mode** - System preference detection
- 📱 **Responsive Design** - Mobile, tablet, desktop
- ⚡ **Real-time Updates** - WebSocket support (future)
- 📊 **Analytics Dashboard** - Progress visualization
- 🔔 **Notifications** - Toast notifications
- 🌍 **Multi-language** - i18n ready (Czech + English)
- ♿ **Accessibility** - WCAG 2.1 AA compliant

## 📦 Instalace

### Prerequisites
- Node.js 18+
- npm nebo yarn
- Backend běžící na `http://localhost:4000`
- Gemini API key

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Keksiczek/Lean_RPG_App.git
cd Lean_RPG_App

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edituj .env.local - nastav VITE_API_URL a GEMINI_API_KEY

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:5173
```

### Environment Variables

**`.env.local` template:**

```bash
# API Backend
VITE_API_URL=http://localhost:4000/api
VITE_API_TIMEOUT=30000

# Gemini AI
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_GEMINI_MODEL=gemini-1.5-flash

# App Config
VITE_APP_NAME=Lean RPG
VITE_APP_VERSION=0.1.0
VITE_ENVIRONMENT=development

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_BETA_FEATURES=true
```

## 🚀 NPM Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload (Vite)
npm run dev:api          # Start with API mock (if available)

# Production
npm run build            # Compile & optimize for production
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Testing
npm run test             # Run Vitest
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report

# Deployment
npm run build:staging    # Build for staging
npm run build:prod       # Build for production
```

## 📁 Struktura Projektu

```
src/
├── components/           # Reusable React components
│   ├── auth/            # Login, Register, Profile
│   ├── quests/          # Quest cards, details
│   ├── skills/          # Skill tree visualization
│   ├── audits/          # 5S audit interface
│   ├── progress/        # XP, level, badges
│   ├── layout/          # Header, Footer, Sidebar
│   ├── common/          # Button, Input, Modal, etc.
│   └── ui/              # Reusable UI primitives
│
├── pages/               # Page components (routes)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── QuestPage.tsx
│   ├── SkillTreePage.tsx
│   ├── AuditPage.tsx
│   ├── ProblemSolvingPage.tsx
│   ├── ProfilePage.tsx
│   └── NotFoundPage.tsx
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state
│   ├── useQuests.ts     # Quest management
│   ├── useProgress.ts   # XP & level tracking
│   ├── useApi.ts        # API calls wrapper
│   └── useLocalStorage.ts # Persistent state
│
├── services/            # API & business logic
│   ├── auth.service.ts  # Login, register, logout
│   ├── quest.service.ts # Quest API calls
│   ├── audit.service.ts # 5S audit API
│   ├── skill.service.ts # Skill tree API
│   ├── progress.service.ts # XP & progression
│   └── api.client.ts    # Axios instance + interceptors
│
├── store/               # State management (Zustand/Context)
│   ├── authStore.ts     # User auth state
│   ├── gameStore.ts     # Quest, XP, level state
│   └── uiStore.ts       # Theme, notifications
│
├── types/               # TypeScript interfaces
│   ├── auth.ts          # User, Token types
│   ├── quest.ts         # Quest, Submission types
│   ├── skill.ts         # Skill tree types
│   ├── audit.ts         # 5S audit types
│   └── api.ts           # API response types
│
├── utils/               # Utility functions
│   ├── format.ts        # Number, date formatting
│   ├── validation.ts    # Form validation rules
│   ├── localStorage.ts  # Storage helpers
│   ├── api.ts           # API utilities
│   └── constants.ts     # App constants
│
├── styles/              # Global styles
│   ├── globals.css      # Global CSS
│   ├── variables.css    # CSS variables (colors, spacing)
│   └── animations.css   # Reusable animations
│
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Root styles

public/
├── images/              # Game assets, icons
├── fonts/               # Custom fonts
└── favicon.svg          # App icon

docs/
├── DEVELOPMENT.md       # Development guide
├── ARCHITECTURE.md      # App architecture
├── COMPONENTS.md        # Component library
└── API_INTEGRATION.md   # API guide

.env.example             # Environment template
tsconfig.json            # TypeScript config
vite.config.ts          # Vite config
tailwind.config.js       # Tailwind config
package.json             # Dependencies
```

## 🎨 UI Components

### Layout Components
- **Header** - Navigation bar with user menu
- **Sidebar** - Quest list, skills quick access
- **Footer** - Links, version info
- **Modal** - Dialog for confirmations
- **Toast** - Notifications system

### Game Components
- **QuestCard** - Quest preview with status
- **SkillNode** - Skill tree node visualization
- **AuditForm** - 5S audit checklist
- **ProgressBar** - XP & level visualization
- **Badge** - Achievement display
- **Leaderboard** - Rankings table

### Form Components
- **Input** - Text, email, password
- **Select** - Dropdown selector
- **Checkbox** - Multiple selections
- **Textarea** - Long text input
- **Submit** - Action button

## 🔗 API Integration

### API Client Setup

```typescript
// services/api.client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service Example

```typescript
// services/quest.service.ts
export const questService = {
  getQuests: () => apiClient.get('/quests'),
  getQuest: (id: string) => apiClient.get(`/quests/${id}`),
  startQuest: (id: string) => apiClient.post(`/quests/${id}/start`),
  submitSolution: (questId: string, content: string) =>
    apiClient.post('/submissions', { questId, content }),
};
```

## 🌐 Proxy Configuration (Development)

Does NOT use proxy - direct API calls with CORS

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // Backend must have CORS enabled
    // CORS_ORIGIN=http://localhost:5173
  },
});
```

## 🔐 Authentication Flow

```
1. User enters email/password
   ↓
2. POST /auth/login
   ↓
3. Backend returns JWT token
   ↓
4. Save token to localStorage
   ↓
5. Add token to all API requests
   ↓
6. Check token expiration on app load
   ↓
7. Redirect to login if expired
```

### Token Management

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const login = (email: string, password: string) => {
    // 1. POST /auth/login
    // 2. Save token to localStorage
    // 3. Set auth state
    // 4. Redirect to dashboard
  };

  const logout = () => {
    // 1. Clear token from localStorage
    // 2. Clear auth state
    // 3. Redirect to login
  };

  const isTokenExpired = () => {
    // Check JWT expiration
  };
}
```

## 🎯 Game Flow

### User Journey

```
LandingPage
    ↓
    ├→ Login (existing user)
    └→ Register (new user)
         ↓
    DashboardPage
         ↓
    SelectQuest
         ↓
    QuestDetailsPage
         ↓
    SubmitSolution
         ↓
    WaitForEvaluation
         ↓
    ViewFeedback & Rewards
         ↓
    UnlockSkills (if earned)
         ↓
    Back to Dashboard
```

## 📊 State Management

### Zustand Store Example

```typescript
// store/gameStore.ts
import { create } from 'zustand';

interface GameState {
  level: number;
  totalXp: number;
  quests: Quest[];
  skills: Skill[];
  addXp: (amount: number) => void;
  unlockSkill: (skillId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  level: 1,
  totalXp: 0,
  quests: [],
  skills: [],
  addXp: (amount) => set((state) => ({
    totalXp: state.totalXp + amount,
    level: Math.floor((state.totalXp + amount) / 1000) + 1,
  })),
  unlockSkill: (skillId) => set((state) => ({
    skills: [...state.skills, skillId],
  })),
}));
```

## 🎨 Styling with Tailwind

### Global Variables

```css
/* styles/variables.css */
:root {
  --color-primary: #2180a0;      /* Teal */
  --color-secondary: #a8783c;    /* Brown */
  --color-success: #22c55e;      /* Green */
  --color-warning: #f59e0b;      /* Amber */
  --color-error: #ef4444;        /* Red */
  --color-bg-light: #f5f5f5;     /* Light gray */
  --color-bg-dark: #1f2937;      /* Dark gray */
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-light: #1f2937;
    --color-bg-dark: #111827;
  }
}
```

### Component Styles

```tsx
// components/common/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  children,
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'border border-primary text-primary hover:bg-primary-light',
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

## 🔍 Performance

### Optimization Techniques

1. **Code Splitting** - Lazy load pages
   ```typescript
   const QuestPage = lazy(() => import('./pages/QuestPage'));
   ```

2. **Image Optimization** - Use WebP with fallback
   ```tsx
   <picture>
     <source srcSet="image.webp" type="image/webp" />
     <img src="image.png" alt="" />
   </picture>
   ```

3. **Bundle Analysis**
   ```bash
   npm run build -- --analyze
   ```

4. **Lighthouse Scores**
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 90

## 📱 Responsive Design

### Breakpoints

```
Mobile:  < 640px  (sm)
Tablet:  640px+   (md)
Desktop: 1024px+  (lg)
Wide:    1280px+  (xl)
```

### Mobile-First Approach

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## 🧪 Testing

### Unit Tests

```typescript
// hooks/__tests__/useAuth.test.ts
test('login should set token', async () => {
  const { result } = renderHook(() => useAuth());
  await result.current.login('test@example.com', 'password');
  expect(localStorage.getItem('token')).toBeTruthy();
});
```

### Component Tests

```typescript
// components/common/__tests__/Button.test.tsx
test('button should be clickable', () => {
  const { getByRole } = render(<Button>Click me</Button>);
  const button = getByRole('button');
  expect(button).toBeInTheDocument();
});
```

## 🚀 Deployment

### Build for Production

```bash
# 1. Build optimized bundle
npm run build

# 2. Preview locally
npm run preview

# 3. Deploy to hosting service
# Netlify, Vercel, GitHub Pages, etc.
```

### Build Output

```
dist/
├── index.html          # Entry point
├── assets/
│   ├── index-abc123.js # Main bundle (minified, hashed)
│   ├── index-def456.css # Main CSS (minified, hashed)
│   └── vendor-ghi789.js # Dependencies
└── favicon.svg
```

### Deployment Checklist

- [ ] Set production API URL in `.env.prod`
- [ ] Set Gemini API key (from backend)
- [ ] Enable HTTPS
- [ ] Setup error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Setup analytics (if desired)
- [ ] Test on staging environment
- [ ] Run Lighthouse audit
- [ ] Monitor performance in production

## 🔧 Development Tips

### Hot Module Replacement (HMR)

Vite automatically refreshes on file changes - no need to reload!

### React DevTools

Install React DevTools browser extension to inspect components.

### Network Debugging

```typescript
// Add to api.client.ts for request/response logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### Environment Debugging

```typescript
// Accessible in components and services
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.MODE); // 'development' or 'production'
```

## 📚 Documentation

- **[API_INTEGRATION.md](docs/API_INTEGRATION.md)** - Backend API guide
- **[COMPONENTS.md](docs/COMPONENTS.md)** - Component library
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development workflow
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - App architecture

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test: `npm run test && npm run build`
4. Format: `npm run format`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

## 🐛 Troubleshooting

### Port 5173 Already in Use

```bash
# Use different port
npm run dev -- --port 3000
```

### API Connection Error

```bash
# Verify backend is running
curl http://localhost:4000/api/health

# Check VITE_API_URL in .env.local
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors

```bash
# Run type check
npm run type-check

# Generate types from API
npm run api:codegen
```

## 📝 License

MIT

## 📞 Support

**Issues?**
- Check GitHub Issues: https://github.com/Keksiczek/Lean_RPG_App/issues
- Review docs in `docs/` folder
- Check console for error messages

**Questions?**
- Read API guide: https://github.com/Keksiczek/Lean_RPG/blob/main/docs/API_SPECIFICATION.md
- Check backend README: https://github.com/Keksiczek/Lean_RPG/blob/main/backend/README.md

---

**Status:** ✅ Development-ready  
**Updated:** 12. prosince 2025  
**Version:** 0.1.0
