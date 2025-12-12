# 🔌 Integration Examples

Praktické příklady, jak napojit komponenty na backend API.

---

## Example 1: Login Component

**File:** `components/LoginForm.tsx`

```typescript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter email and password');
      return;
    }

    try {
      const result = await login(email, password);
      console.log('✅ Login successful:', result);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="login-form">
      <h1>Login to Lean RPG</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            required
          />
        </div>

        {(error || localError) && (
          <div className="error-message">
            {localError || error?.message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="signup-link">
        Don't have an account? <a href="/register">Sign up here</a>
      </p>
    </div>
  );
};

export default LoginForm;
```

**Usage:**
```typescript
function App() {
  return <LoginForm onLoginSuccess={() => console.log('Logged in!')} />;
}
```

---

## Example 2: User Dashboard

**File:** `components/Dashboard.tsx`

```typescript
import React from 'react';
import { useFetch } from '../hooks/useApi';
import { ENDPOINTS } from '../config';
import { User } from '../services/api';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';

const Dashboard: React.FC = () => {
  const { data: user, loading, error, refetch } = useFetch<User>(
    ENDPOINTS.USERS.ME,
    [ENDPOINTS.USERS.ME]
  );

  if (loading) return <Loader>Loading your profile...</Loader>;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!user) return <div>No user data available</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          {user.avatar && <img src={user.avatar} alt={user.username} className="avatar" />}
          <div>
            <h1>{user.username}</h1>
            <p className="email">{user.email}</p>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{user.level}</div>
          <div className="stat-label">Level</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.totalXp.toLocaleString()}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.role}</div>
          <div className="stat-label">Role</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.tenantId}</div>
          <div className="stat-label">Factory</div>
        </div>
      </div>

      <button onClick={refetch} className="btn-secondary">
        🔄 Refresh Profile
      </button>
    </div>
  );
};

export default Dashboard;
```

---

## Example 3: Quest List

**File:** `components/QuestList.tsx`

```typescript
import React, { useState } from 'react';
import { useFetch, useMutation } from '../hooks/useApi';
import { ENDPOINTS } from '../config';

interface Quest {
  id: string;
  title: string;
  description: string;
  leanConcept: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
}

const QuestList: React.FC = () => {
  const { data: quests, loading, error, refetch } = useFetch<Quest[]>(
    ENDPOINTS.GAME.QUEST_BASE || '/api/quests'
  );
  const { execute: startQuest, loading: startingQuest } = useMutation('/api/quests', 'POST');
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);

  const handleStartQuest = async (questId: string) => {
    try {
      const result = await startQuest({ questId, startedAt: new Date() });
      console.log('✅ Quest started:', result);
      setSelectedQuest(questId);
    } catch (err) {
      console.error('❌ Failed to start quest:', err);
    }
  };

  if (loading) return <div>Loading quests...</div>;
  if (error) return <div>Error loading quests: {error.message}</div>;
  if (!quests || quests.length === 0) return <div>No quests available</div>;

  return (
    <div className="quest-list">
      <h2>Available Quests</h2>
      
      <div className="quests-grid">
        {quests.map((quest) => (
          <div key={quest.id} className="quest-card">
            <div className="quest-header">
              <h3>{quest.title}</h3>
              <span className={`difficulty ${quest.difficulty}`}>
                {quest.difficulty.toUpperCase()}
              </span>
            </div>

            <p className="quest-description">{quest.description}</p>

            <div className="quest-meta">
              <span className="concept">📚 {quest.leanConcept}</span>
              <span className="xp-reward">⭐ {quest.xpReward} XP</span>
            </div>

            <button
              onClick={() => handleStartQuest(quest.id)}
              disabled={startingQuest || selectedQuest === quest.id}
              className="btn-primary"
            >
              {startingQuest && selectedQuest === quest.id
                ? 'Starting...'
                : selectedQuest === quest.id
                ? '✅ Started'
                : 'Start Quest'}
            </button>
          </div>
        ))}
      </div>

      <button onClick={refetch} className="btn-secondary">
        🔄 Refresh Quests
      </button>
    </div>
  );
};

export default QuestList;
```

---

## Example 4: 5S Audit Component

**File:** `components/AuditGame.tsx`

```typescript
import React, { useState } from 'react';
import { useFetch, useMutation } from '../hooks/useApi';
import { ENDPOINTS } from '../config';

interface AuditChecklistItem {
  id: string;
  category: '5S' | 'Safety' | 'Quality';
  description: string;
  completed: boolean;
  score: number;
}

const AuditGame: React.FC = () => {
  const { data: checklist, loading } = useFetch<AuditChecklistItem[]>(
    ENDPOINTS.AUDITS.CHECKLIST_TEMPLATES || '/api/audits/checklist-templates'
  );
  const { execute: submitAudit, loading: submitting } = useMutation(
    ENDPOINTS.AUDITS.BASE || '/api/audits',
    'POST'
  );
  const [items, setItems] = useState<AuditChecklistItem[]>([]);

  React.useEffect(() => {
    if (checklist) {
      setItems(checklist.map(item => ({ ...item, completed: false, score: 0 })));
    }
  }, [checklist]);

  const handleItemToggle = (id: string, completed: boolean, score: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed, score } : item
      )
    );
  };

  const handleSubmit = async () => {
    const totalScore = items.reduce((sum, item) => sum + (item.completed ? item.score : 0), 0);
    const completedCount = items.filter(i => i.completed).length;

    try {
      const result = await submitAudit({
        areaId: 'area-1',
        checklist: items,
        completedAt: new Date().toISOString(),
        totalScore,
        completedCount,
        percentComplete: (completedCount / items.length) * 100,
      });
      console.log('✅ Audit submitted:', result);
      alert('🎉 Audit submitted successfully!');
    } catch (err) {
      console.error('❌ Submission failed:', err);
      alert('Failed to submit audit');
    }
  };

  if (loading) return <div>Loading checklist...</div>;
  if (!items || items.length === 0) return <div>No checklist items</div>;

  const totalScore = items.reduce((sum, item) => sum + (item.completed ? item.score : 0), 0);
  const maxScore = items.reduce((sum, item) => sum + item.score, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  return (
    <div className="audit-game">
      <h2>5S Audit Checklist</h2>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${percentage}%` }}></div>
        <span className="progress-text">{percentage}%</span>
      </div>

      <div className="checklist">
        {items.map((item) => (
          <div key={item.id} className="checklist-item">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={(e) => handleItemToggle(item.id, e.target.checked, item.score)}
            />
            <div className="item-content">
              <span className="category">{item.category}</span>
              <p className="description">{item.description}</p>
              <span className="score">+{item.score} points</span>
            </div>
          </div>
        ))}
      </div>

      <div className="audit-summary">
        <div className="summary-stat">
          <span className="label">Total Score:</span>
          <span className="value">{totalScore} / {maxScore}</span>
        </div>
        <div className="summary-stat">
          <span className="label">Completed:</span>
          <span className="value">{items.filter(i => i.completed).length} / {items.length}</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || items.filter(i => i.completed).length === 0}
        className="btn-primary btn-large"
      >
        {submitting ? '📤 Submitting...' : '✅ Submit Audit'}
      </button>
    </div>
  );
};

export default AuditGame;
```

---

## Example 5: Error Boundary with Fallback

**File:** `components/ErrorBoundary.tsx`

```typescript
import React from 'react';
import { ApiError } from '../services/api';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isApiError = error instanceof ApiError;

      return (
        <div className="error-boundary">
          <h2>❌ Something went wrong</h2>
          <p className="error-message">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {isApiError && (
            <div className="error-details">
              <p>API Error Code: {(error as ApiError).code || 'N/A'}</p>
              <p>Status: {(error as ApiError).statusCode}</p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## Example 6: Custom Hook - useLeaderboard

**File:** `hooks/useLeaderboard.ts`

```typescript
import { useFetch, useApi } from './useApi';
import { ENDPOINTS } from '../config';

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalXp: number;
  level: number;
  badges: number;
}

export function useLeaderboard() {
  const { data, loading, error, refetch } = useFetch<LeaderboardEntry[]>(
    ENDPOINTS.GAMIFICATION.LEADERBOARD || '/api/gamification/leaderboard',
    [ENDPOINTS.GAMIFICATION.LEADERBOARD]
  );

  return {
    entries: data || [],
    loading,
    error,
    refetch,
    topPlayer: data?.[0] || null,
    playerCount: data?.length || 0,
  };
}
```

**Usage:**
```typescript
function LeaderboardPage() {
  const { entries, loading } = useLeaderboard();
  
  return (
    <div>
      {entries.map(entry => (
        <div key={entry.rank}>
          <span>#{entry.rank}</span>
          <span>{entry.username}</span>
          <span>{entry.totalXp} XP</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Example 7: Protected Route

**File:** `components/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import apiClient from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = apiClient.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

**Usage:**
```typescript
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

## TypeScript Types Reference

Klíčové typy z `services/api.ts`:

```typescript
// API Response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  statusCode?: number;
}

// Authentication
interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// User data
interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  totalXp: number;
  level: number;
  avatar?: string;
  tenantId: string;
}

// API Error
class ApiError extends Error {
  statusCode: number;
  code?: string;
}
```

---

## Next Steps

1. ✅ Copy examples above into your components
2. ✅ Update component names and styling as needed
3. ✅ Test with backend running locally
4. ✅ Check DevTools Network tab for API calls
5. ✅ Handle errors appropriately in your UI

**Questions?** Check `INTEGRATION_GUIDE.md` for more details.
