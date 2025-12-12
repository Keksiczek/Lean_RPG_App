# 🔗 Frontend ↔ Backend Integration Guide

**Lean_RPG_App** (Frontend) ↔ **Lean_RPG** (Backend)

---

## Quick Start (5 mins)

### 1. Backend Setup

```bash
# Terminal 1: Backend
cd Lean_RPG/backend
npm install
cp .env.example .env
# Edit .env with your values:
# DATABASE_URL=postgresql://user:password@localhost:5432/lean_rpg
# JWT_SECRET=your-secret-key-change-in-production
# CORS_ORIGIN=http://localhost:5173

npm run db:setup
npm run dev
# Backend running on http://localhost:4000 ✅
```

### 2. Frontend Setup

```bash
# Terminal 2: Frontend
cd Lean_RPG_App
npm install
cp .env.local.example .env.local
# .env.local already has correct values:
# VITE_API_URL=http://localhost:4000
# VITE_TENANT_ID=magna

npm run dev
# Frontend running on http://localhost:5173 ✅
```

### 3. Test Connection

Frontend by měla nyní komunikovat s backendem. Ověř v devtools Network tab.

---

## Architecture

```
┌─────────────────────────────────┐
│   React App (Port 5173)         │
│   Lean_RPG_App                  │
├─────────────────────────────────┤
│ Components                      │
│   ├── Dashboard                 │
│   ├── GameHub                   │
│   ├── AuditGame                 │
│   └── ...                       │
├─────────────────────────────────┤
│ Hooks (useApi.ts)              │
│   ├── useFetch()                │
│   ├── useMutation()             │
│   └── useAuth()                 │
├─────────────────────────────────┤
│ API Service (services/api.ts)  │
│   ├── GET, POST, PUT, DELETE    │
│   ├── Token Management          │
│   └── Error Handling            │
└─────────────────┬───────────────┘
                  │ HTTP
                  ↓
┌─────────────────────────────────┐
│   Express API (Port 4000)       │
│   Lean_RPG/backend              │
├─────────────────────────────────┤
│ Routes (15 files)               │
│   ├── /auth                     │
│   ├── /api/users                │
│   ├── /api/quests               │
│   ├── /api/5s                   │
│   └── ...                       │
├─────────────────────────────────┤
│ Services (15 files)             │
│   ├── GeminiService             │
│   ├── SkillTreeService          │
│   └── ...                       │
└─────────────────┬───────────────┘
                  │ SQL
                  ↓
       ┌──────────────────┐
       │  PostgreSQL      │
       │  (Port 5432)     │
       └──────────────────┘
```

---

## How to Use in Components

### Example 1: Fetch User Data

```typescript
import { useFetch } from '../hooks/useApi';
import { ENDPOINTS } from '../config';
import { User } from '../services/api';

function Dashboard() {
  const { data: user, loading, error, refetch } = useFetch<User>(
    ENDPOINTS.USERS.ME
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user data</div>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Level: {user.level}</p>
      <p>XP: {user.totalXp}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Example 2: Submit Audit Results

```typescript
import { useMutation } from '../hooks/useApi';
import { ENDPOINTS } from '../config';

function AuditGameComplete() {
  const { execute, loading, error } = useMutation(
    ENDPOINTS.AUDITS.BASE,
    'POST'
  );

  const handleSubmit = async (results: any) => {
    try {
      const response = await execute({
        areaId: 'area-1',
        checklist: results,
        timestamp: new Date().toISOString(),
      });
      console.log('Audit submitted:', response);
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <button 
      onClick={() => handleSubmit({ sort: 85, order: 90 })}
      disabled={loading}
    >
      {loading ? 'Submitting...' : 'Submit Results'}
    </button>
  );
}
```

### Example 3: Login Flow

```typescript
import { useAuth } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error already in useAuth state
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

---

## API Service Reference

### ApiClient Methods

```typescript
// GET
const response = await apiClient.get<T>('/api/users/me');

// POST
const response = await apiClient.post<T>('/api/submissions', {
  questId: '123',
  solution: 'my solution'
});

// PUT
const response = await apiClient.put<T>('/api/users/me', {
  username: 'new-name'
});

// DELETE
const response = await apiClient.delete<T>('/api/audits/123');

// Check authentication
if (apiClient.isAuthenticated()) {
  // User is logged in
}

// Logout
apiClient.logout();
```

### Response Format

ALL backend responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;      // true/false
  data?: T;              // Response data (if success)
  error?: string;        // Error message (if !success)
  code?: string;         // Error code (if !success)
  statusCode?: number;   // HTTP status code
  timestamp?: string;    // ISO timestamp
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "level": 5,
    "totalXp": 2500
  },
  "timestamp": "2025-12-12T11:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "AUTH_ERROR",
  "statusCode": 401,
  "timestamp": "2025-12-12T11:00:00Z"
}
```

---

## Backend API Endpoints

### Authentication
```
POST   /auth/login                 # Login (returns accessToken)
POST   /auth/register              # Register new user
POST   /auth/refresh               # Refresh token
POST   /auth/logout                # Logout
```

### Users
```
GET    /api/users/me               # Get current user profile
GET    /api/users/:id              # Get user by ID
PUT    /api/users/me               # Update profile
```

### Quests
```
GET    /api/quests                 # List all quests
GET    /api/quests/:id             # Get quest details
POST   /api/quests/:id/start       # Start quest
GET    /api/quests/:id/status      # Get quest progress
```

### 5S Audits
```
GET    /api/5s/settings            # Get 5S audit config
POST   /api/audits                 # Submit audit
GET    /api/audits                 # List audits
GET    /api/audits/:id             # Get audit details
PUT    /api/audits/:id             # Update audit
```

### Problem Solving
```
GET    /api/problem-solving/challenges
POST   /api/problem-solving/analyze
PUT    /api/problem-solving/:id
```

### Gamification
```
GET    /api/gamification/leaderboard
GET    /api/gamification/badges
GET    /api/gamification/achievements
```

**Full API Reference:** See `Lean_RPG/docs/API_SPECIFICATION.md`

---

## Error Handling

### Common Error Codes

```typescript
// 400 Bad Request
{
  "success": false,
  "error": "Validation error: email is required",
  "code": "VALIDATION_ERROR",
  "statusCode": 400
}

// 401 Unauthorized
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_ERROR",
  "statusCode": 401
}
// → ApiClient automatically tries to refresh token
// → If fails, logs out user and emits 'auth:logout' event

// 403 Forbidden
{
  "success": false,
  "error": "You don't have permission to access this resource",
  "code": "PERMISSION_ERROR",
  "statusCode": 403
}

// 404 Not Found
{
  "success": false,
  "error": "Quest not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}

// 500 Server Error
{
  "success": false,
  "error": "Internal server error",
  "code": "SERVER_ERROR",
  "statusCode": 500
}
```

### Error Handling in Components

```typescript
function MyComponent() {
  const { data, error } = useFetch('/api/data');

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <p>Code: {error.code}</p>
        <p>Status: {error.statusCode}</p>
      </div>
    );
  }

  return <div>{/* render data */}</div>;
}
```

---

## Environment Variables

### Frontend (.env.local)

```bash
# Required
VITE_API_URL=http://localhost:4000        # Backend API URL
VITE_TENANT_ID=magna                      # Default tenant

# Optional
VITE_GEMINI_API_KEY=your-key             # For AI features
VITE_APP_NAME=Lean_RPG
VITE_LOG_LEVEL=debug                      # debug, info, warn, error
```

### Backend (.env)

See `Lean_RPG/backend/.env.example`

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173

# Optional
GEMINI_API_KEY=your-key
NODE_ENV=development
PORT=4000
```

---

## Troubleshooting

### Frontend can't connect to backend

**Error:** `Failed to fetch http://localhost:4000`

**Solutions:**
```bash
# 1. Check backend is running
curl http://localhost:4000/api/health

# 2. Check VITE_API_URL in .env.local
echo $VITE_API_URL

# 3. Check CORS_ORIGIN in backend .env
echo $CORS_ORIGIN
# Should be http://localhost:5173

# 4. Restart both frontend and backend
```

### "Unauthorized" errors on every request

**Solutions:**
```bash
# 1. Check token in localStorage
# Open DevTools → Application → LocalStorage
# Look for 'accessToken' key

# 2. Try login again
# Frontend should automatically handle token refresh

# 3. Check JWT_SECRET matches in backend and frontend
```

### CORS errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
```bash
# 1. Check backend CORS_ORIGIN matches frontend URL
VITE_API_URL=http://localhost:5173  ← this should match CORS_ORIGIN

# 2. Ensure backend middleware is configured
# See: Lean_RPG/backend/src/app.ts

# 3. Restart backend after changing .env
```

### Database connection errors

**Error:** `Error: connect ECONNREFUSED at Database.connect`

**Solutions:**
```bash
# 1. Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# 2. Check DATABASE_URL in backend .env
echo $DATABASE_URL
# Format: postgresql://user:password@localhost:5432/lean_rpg

# 3. Run migrations
cd Lean_RPG/backend
npm run prisma:migrate:dev
```

---

## Development Workflow

### Making Changes

1. **Add new API endpoint** (Backend)
   ```bash
   # backend/src/routes/your-feature.ts
   # backend/src/services/yourFeatureService.ts
   ```

2. **Update config** (Frontend)
   ```typescript
   // config.ts
   export const ENDPOINTS = {
     YOUR_FEATURE: {
       BASE: '/api/your-feature',
     }
   };
   ```

3. **Create API call** (Frontend)
   ```typescript
   // In your component:
   const { data, loading } = useFetch(ENDPOINTS.YOUR_FEATURE.BASE);
   ```

### Testing

```bash
# Backend tests
cd Lean_RPG/backend
npm run test

# Frontend with Vite
cd Lean_RPG_App
npm run dev    # Start dev server
```

---

## Deployment

### Docker (Recommended)

```bash
# Backend Dockerfile already exists
cd Lean_RPG
docker-compose up -d

# Frontend can be built and served
cd Lean_RPG_App
npm run build
# Deploy dist/ folder to Vercel, Netlify, or static host
```

### Environment for Production

```bash
# Frontend .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_TENANT_ID=magna

# Backend .env.prod
DATABASE_URL=postgresql://prod-instance
JWT_SECRET=generate-new-secret
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

---

## Next Steps

1. ✅ Run both backend and frontend locally
2. ✅ Test login flow
3. ✅ Verify API calls in Network tab
4. 📝 Update components to use hooks
5. 🎮 Build first game feature end-to-end
6. 🧪 Add unit tests
7. 🚀 Deploy to staging

---

## Resources

- **Backend Docs:** `Lean_RPG/README.md` + `Lean_RPG/docs/`
- **API Reference:** `Lean_RPG/docs/API_SPECIFICATION.md`
- **Database Schema:** `Lean_RPG/prisma/schema.prisma`
- **Frontend Config:** `Lean_RPG_App/config.ts`
- **API Service:** `Lean_RPG_App/services/api.ts`
- **Hooks:** `Lean_RPG_App/hooks/useApi.ts`

---

**Questions?** Check the troubleshooting section or review the architecture diagram above.
