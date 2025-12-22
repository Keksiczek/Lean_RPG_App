# Merge do Lean-rpg-complete

## Příprava
1. Otestovat lokálně s backendem na localhost:4000
2. Ověřit všechny API endpointy
3. Zkontrolovat TypeScript kompilaci: `npm run build`

## Kroky pro PR
1. Klonovat Lean-rpg-complete repo
2. Vytvořit branch: `git checkout -b feature/vite-frontend`
3. Vytvořit složku `frontend-vite/`
4. Zkopírovat obsah tohoto repo do `frontend-vite/`
5. Upravit `docker-compose.yml` (přidat frontend service)
6. Commit a push
7. Vytvořit Pull Request

## Struktura po merge
Lean-rpg-complete/
├── backend/          <- Express + Prisma
├── frontend-vite/    <- Tento projekt (Vite + React)
├── frontend/         <- Původní Next.js (legacy)
└── docker-compose.yml

## Testování
- `npm run dev` (frontend na :5173, backend na :4000)
- Login flow (Email: operator@magna.com / manager@magna.com)
- Quest submission s Gemini polling
- Gamifikace (badges, achievements, leaderboard)