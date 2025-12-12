# 🛠️ Lean_RPG Frontend - Development Guide

**Comprehensive guide** pro vývoj Lean_RPG frontend aplikace.

---

## Quick Navigation

- [Setup](#setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Component Development](#component-development)
- [Testing](#testing)
- [Debugging](#debugging)
- [Performance](#performance)

---

## Setup

### Initial Setup

```bash
# 1. Clone and enter directory
git clone https://github.com/Keksiczek/Lean_RPG_App.git
cd Lean_RPG_App

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Edit .env.local with your values
vim .env.local

# 5. Start development server
npm run dev
```

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **ESLint** (dbaeumer.vscode-eslint)
- **TypeScript Vue Plugin** (Vue.volar) - if using Vue in future
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **REST Client** (humao.rest-client) - for testing API calls

### VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## Project Structure

### Component Organization

```
components/
├── auth/
│   ├── LoginForm.tsx          # Login form component
│   ├── RegisterForm.tsx       # Registration form
│   └── AuthGuard.tsx          # Protected route wrapper
├── quests/
│   ├── QuestCard.tsx          # Single quest card
│   ├── QuestList.tsx          # List of quests
│   ├── QuestDetail.tsx        # Detailed quest view
│   └── SubmissionForm.tsx     # Solution submission
├── common/
│   ├── Button.tsx             # Reusable button
│   ├── Input.tsx              # Text input
│   ├── Modal.tsx              # Modal dialog
│   ├── Toast.tsx              # Toast notifications
│   └── Loading.tsx            # Loading spinner
└── layout/
    ├── Header.tsx             # Top navigation
    ├── Sidebar.tsx            # Side menu
    └── Footer.tsx             # Bottom section
```

### File Naming Conventions

```
✅ CORRECT
UserProfile.tsx          # Components: PascalCase
userService.ts           # Services: camelCase
useAuth.ts               # Hooks: camelCase with 'use' prefix
auth.types.ts            # Types: descriptive.types.ts

❌ WRONG
user-profile.tsx         # Kebab-case for components
UserService.ts           # PascalCase for services
authStore.tsx            # Store with component extension
```

---

## Development Workflow

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Start dev server
npm run dev

# 3. Create component file
touch src/components/MyComponent.tsx

# 4. Write code with TypeScript
# Use Ctrl+Space in VS Code for autocomplete

# 5. Test changes (auto-reload via HMR)

# 6. Run checks before commit
npm run format      # Format code
npm run lint        # Check for errors
npm run type-check  # Check TypeScript
npm run test        # Run tests

# 7. Commit changes
git add .
git commit -m "feat: Add MyComponent"

# 8. Push and create PR
git push origin feature/my-feature
```

### Git Commit Messages

```
Format: <type>: <subject>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation
  style:    Code style (formatting)
  refactor: Code refactoring
  perf:     Performance improvement
  test:     Adding tests
  chore:    Maintenance

Examples:
feat: Add quest submission form
fix: Fix skill tree rendering bug
docs: Add API integration guide
refactor: Extract button logic to hook
```

---

## Code Style

### TypeScript Best Practices

```typescript
// ✅ GOOD - Type everything
interface QuestProps {
  questId: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  onSubmit: (content: string) => Promise<void>;
}

export function Quest({
  questId,
  title,
  difficulty,
  onSubmit,
}: QuestProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (content: string) => {
    setIsLoading(true);
    try {
      await onSubmit(content);
    } finally {
      setIsLoading(false);
    }
  };

  return <div>{title}</div>;
}

// ❌ AVOID - No types
export function Quest(props) {
  const [state, setState] = useState();
  return <div>{props.title}</div>;
}
```

### React Hooks Patterns

```typescript
// ✅ GOOD - Custom hook for logic reuse
export function useQuest(questId: string) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuest = async () => {
      try {
        const data = await questService.getQuest(questId);
        setQuest(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuest();
  }, [questId]);

  return { quest, loading, error };
}

// Usage in component
export function QuestDetail({ questId }: QuestDetailProps) {
  const { quest, loading, error } = useQuest(questId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <div>{quest?.title}</div>;
}
```

### Component Composition

```typescript
// ✅ GOOD - Small, focused components
export function QuestCard({ quest }: QuestCardProps) {
  return (
    <Card>
      <QuestHeader title={quest.title} difficulty={quest.difficulty} />
      <QuestBody description={quest.description} />
      <QuestFooter xp={quest.xpReward} />
    </Card>
  );
}

function QuestHeader({ title, difficulty }: QuestHeaderProps) {
  return <h3>{title}</h3>;
}

// ❌ AVOID - Monolithic components
export function QuestCard({ quest }: QuestCardProps) {
  return (
    <Card>
      <h3>{quest.title}</h3>
      <p>{quest.description}</p>
      <span>{quest.difficulty}</span>
      <span>{quest.xpReward} XP</span>
    </Card>
  );
}
```

---

## API Integration

### Service Layer Pattern

```typescript
// services/quest.service.ts
import { apiClient } from './api.client';
import type { Quest, Submission } from '../types';

export const questService = {
  async getQuests(params?: GetQuestsParams): Promise<Quest[]> {
    const { data } = await apiClient.get('/quests', { params });
    return data.data;
  },

  async getQuest(questId: string): Promise<Quest> {
    const { data } = await apiClient.get(`/quests/${questId}`);
    return data.data;
  },

  async startQuest(questId: string): Promise<void> {
    await apiClient.post(`/quests/${questId}/start`);
  },

  async submitSolution(
    questId: string,
    content: string
  ): Promise<Submission> {
    const { data } = await apiClient.post('/submissions', {
      questId,
      content,
    });
    return data.data;
  },
};
```

### Error Handling

```typescript
// utils/apiErrors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export function handleApiError(error: any): never {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    throw new ApiError(status, data.code, data.error);
  } else if (error.request) {
    // Request was made but no response
    throw new ApiError(0, 'NO_RESPONSE', 'Network error');
  } else {
    // Error in setup
    throw new ApiError(0, 'UNKNOWN', error.message);
  }
}

// Usage in service
try {
  await questService.startQuest(questId);
} catch (error) {
  handleApiError(error);
}
```

---

## State Management

### Zustand Store Example

```typescript
// store/gameStore.ts
import { create } from 'zustand';

interface GameState {
  level: number;
  totalXp: number;
  quests: Map<string, Quest>;
  addXp: (amount: number) => void;
  loadQuest: (quest: Quest) => void;
}

export const useGameStore = create<GameState>((set) => ({
  level: 1,
  totalXp: 0,
  quests: new Map(),

  addXp: (amount) =>
    set((state) => {
      const newXp = state.totalXp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      return { totalXp: newXp, level: newLevel };
    }),

  loadQuest: (quest) =>
    set((state) => ({
      quests: new Map(state.quests).set(quest.id, quest),
    })),
}));

// Usage in component
export function XpCounter() {
  const { totalXp, addXp } = useGameStore();

  return (
    <div>
      <p>XP: {totalXp}</p>
      <button onClick={() => addXp(100)}>+100 XP</button>
    </div>
  );
}
```

### Context API Alternative

```typescript
// context/GameContext.tsx
interface GameContextValue {
  level: number;
  totalXp: number;
  addXp: (amount: number) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0);

  const addXp = useCallback((amount: number) => {
    setTotalXp((prev) => prev + amount);
  }, []);

  const value: GameContextValue = { level, totalXp, addXp };

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
}
```

---

## Component Development

### Creating a New Component

```typescript
// components/quests/QuestCard.tsx
import { ReactNode } from 'react';
import { Button } from '../common/Button';
import type { Quest } from '../../types';

interface QuestCardProps {
  quest: Quest;
  onStart: (questId: string) => void;
  isLoading?: boolean;
}

export function QuestCard({
  quest,
  onStart,
  isLoading = false,
}: QuestCardProps) {
  const handleClick = () => {
    onStart(quest.id);
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <h3 className="text-lg font-bold">{quest.title}</h3>
      <p className="text-gray-600 my-2">{quest.description}</p>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm font-medium text-teal-600">
          {quest.xpReward} XP
        </span>
        <Button
          onClick={handleClick}
          disabled={isLoading}
          variant="primary"
        >
          {isLoading ? 'Loading...' : 'Start'}
        </Button>
      </div>
    </div>
  );
}
```

### Component Template

```typescript
// components/[feature]/[ComponentName].tsx
import type { FC, ReactNode } from 'react';
import type { [TypeName] } from '../../types';

interface [ComponentName]Props {
  // Props here
}

export const [ComponentName]: FC<[ComponentName]Props> = ({
  // Destructure props
}) => {
  // Logic here

  return (
    <div>
      {/* JSX here */}
    </div>
  );
};
```

---

## Testing

### Unit Test Example

```typescript
// components/common/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalled();
  });

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Test Example

```typescript
// hooks/__tests__/useQuest.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useQuest } from '../useQuest';

vi.mock('../../services/quest.service', () => ({
  questService: {
    getQuest: vi.fn(),
  },
}));

describe('useQuest', () => {
  test('loads quest data', async () => {
    const mockQuest = { id: '1', title: 'Test Quest' };
    questService.getQuest.mockResolvedValue(mockQuest);

    const { result } = renderHook(() => useQuest('1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.quest).toEqual(mockQuest);
    });
  });
});
```

---

## Debugging

### Browser DevTools

1. **React DevTools**
   - Inspect component tree
   - View props and state
   - Check re-renders

2. **Network Tab**
   - Monitor API calls
   - Check headers and payloads
   - See response times

3. **Console**
   - Check for errors
   - Log state changes
   - Test API calls

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverride": {
        "webpack:///./src/*": "${webRoot}/*"
      }
    }
  ]
}
```

---

## Performance

### Code Splitting

```typescript
// routes/index.ts
import { lazy, Suspense } from 'react';

const QuestPage = lazy(() => import('./pages/QuestPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

export const routes = [
  {
    path: '/quests/:id',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <QuestPage />
      </Suspense>
    ),
  },
];
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize component if props are stable
const QuestCard = memo(({ quest, onStart }: QuestCardProps) => {
  return <div>{quest.title}</div>;
});

// Memoize computed values
function QuestList({ quests }: QuestListProps) {
  const sortedQuests = useMemo(
    () => quests.sort((a, b) => a.title.localeCompare(b.title)),
    [quests]
  );

  const handleStart = useCallback(
    (questId: string) => {
      // Handle quest start
    },
    []
  );

  return (
    <div>
      {sortedQuests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onStart={handleStart} />
      ))}
    </div>
  );
}
```

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run dev:debug   # Start with debugging

# Quality
npm run lint        # Check code quality
npm run format      # Format code
npm run type-check  # Check TypeScript

# Testing
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:ui     # Open Vitest UI

# Building
npm run build       # Build for production
npm run preview     # Preview production build

# Analysis
npm run analyze     # Analyze bundle size
```

---

**Happy developing! 🚀**
