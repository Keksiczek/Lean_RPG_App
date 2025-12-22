# Lean RPG Frontend (Vite)

A high-performance React application for Lean manufacturing training, featuring real-time AI evaluation using Google Gemini.

## Backend Connection
This application is designed to work with the [Lean-rpg-complete](https://github.com/Keksiczek/Lean-rpg-complete) backend.

- **Default API URL:** `http://localhost:4000`
- **Port:** 4000 (Express)
- **Environment Variable:** `VITE_API_URL`

## Running the App
1. Ensure the backend is running.
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Key Features
- **AR 5S Scanner:** Uses Gemini Vision to analyze real workplace images.
- **AI Quest Evaluation:** Asynchronous submission flow with polling for AI feedback.
- **Digital Twin:** Interactive factory map with location-based training.
- **Gamification:** Real-time level progress, badges, and global Hall of Fame.

## Development
This project is part of the Lean RPG monorepo. When contributing, ensure your changes follow the Tailwind CSS utility-first approach and maintain TypeScript type safety as defined in `types.ts`.