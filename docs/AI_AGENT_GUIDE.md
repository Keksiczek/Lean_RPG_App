# AI Agent Guide for Lean RPG

This repository is structured to be "AI-friendly", meaning it has clear entry points, typed interfaces, and modular logic suitable for automated tasks.

## 🏗 Project Structure

- **`/src`**: The core React application.
    - **`components/`**: Reusable UI blocks (Atomic design).
    - **`pages/`**: High-level views (Dashboard, FactoryMap).
    - **`services/`**: API layers. `geminiService.ts` handles AI interactions.
    - **`utils/gameUtils.ts`**: Pure functions for XP, leveling, and achievements.
    - **`constants.ts`**: The "Database" for demo mode. Contains strict types for `AUDIT_SCENES`, `ISHIKAWA_PROBLEMS`, etc.

## 🧪 Testing & Validation

Currently, testing is manual or via `npm run build` (Type Check).
- **Core Logic to Test:** `src/utils/gameUtils.ts` (Level calculation).
- **Visual Validation:** Ensure `tailwind.config.js` is respected in new components.

## 🧩 Key Data Models (Entry Points)

When adding new content, look at `src/types.ts`:
- **`Achievement`**: Add new badges here.
- **`Quest`**: Structure for new missions.
- **`Workplace`**: Definition for new map zones.

## 🤖 Common AI Tasks

### 1. Adding a New Quest
1.  Open `src/constants.ts`.
2.  Add an entry to `AUDIT_SCENES` or create a new constant `NEW_QUESTS`.
3.  Ensure it aligns with the `Quest` interface in `types.ts`.

### 2. Tuning Gamification
1.  Open `src/utils/gameUtils.ts`.
2.  Modify `checkForNewAchievements` logic to introduce complex triggers (e.g., "Speed Run" - < 30s completion).

### 3. Deployment
- The app is a standard Vite SPA.
- Build: `npm run build` -> `/dist`.
- Docker: `docker-compose up` (if backend present) or serve static files via Nginx.

## ⚠️ "Glue" vs "Core"
- **CORE:** `gameUtils.ts`, `types.ts`, `AuthContext.tsx`. **Do not break these.**
- **GLUE:** `App.tsx` (routing), `Layout.tsx`. These can be modified to change user flow.
