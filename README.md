# Guess the Number — Full Stack App

A small full-stack CRUD app: register/log in/log out (via Firebase Authentication),
play Guess the Number (1-43), and see your personal best guess count next time you log in.

## Stack

- Backend: .NET Core 8 Web API, Clean Architecture (`Api` / `Application` / `Infrastructure` / `Domain`)
- Frontend: React (Vite) + TypeScript
- Database: PostgreSQL, via EF Core
- Auth: Firebase Authentication (email/password). The backend never sees passwords -
  it verifies the Firebase-issued ID token on each request and keeps its own `User`
  row (linked by Firebase UID) for the profile and best-score data.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for Postgres, and optionally to run the whole stack)
- A [Firebase](https://console.firebase.google.com/) project with Email/Password sign-in enabled

## Firebase setup

1. Create a Firebase project (or reuse one) and enable **Email/Password** sign-in
   under Authentication → Sign-in method.
2. Register a **Web app** in the project to get a Firebase web config
   (API key, auth domain, project ID, app ID).
3. You'll need the **project ID** for the backend and the full web config for the frontend.

No service account JSON is needed — the backend verifies Firebase ID tokens directly
against Google's public keys using just the project ID.

## Running locally (without Docker for the app itself)

1. Start Postgres: `docker compose up -d postgres`
2. Configure the backend: in `backend/Api/appsettings.Development.json`, set
   `Firebase:ProjectId` to your Firebase project ID (the `ConnectionStrings:Postgres`
   value already matches the `docker-compose.yml` Postgres credentials).
3. Run the API: `cd backend/Api && dotnet run` (applies pending EF Core migrations
   automatically on startup). Swagger UI is at `http://localhost:5051/swagger`.
4. Configure the frontend: `cp frontend/.env.example frontend/.env` and fill in your
   Firebase web config (`VITE_FIREBASE_*`). Leave `VITE_API_BASE_URL` unset to default
   to `http://localhost:5051`.
5. Run the frontend: `cd frontend && npm install && npm run dev`, then open
   `http://localhost:5173`.

## Running everything with Docker Compose

1. `cp .env.example .env` at the repo root and fill in `FIREBASE_PROJECT_ID` and the
   `VITE_FIREBASE_*` values (this `.env` is separate from `frontend/.env` — it's what
   Compose uses to configure the containers, including baking the Vite env vars into
   the frontend build).
2. `docker compose up --build`
3. Frontend: `http://localhost:5173`. Backend Swagger UI: `http://localhost:5051/swagger`.

## Project structure

```
backend/
  Api/             minimal API endpoints, auth/DI/Swagger wiring
  Application/     game rules (IGameService), repository interfaces
  Infrastructure/  EF Core (AppDbContext, migrations), repository implementations
  Domain/          User, GameRound entities
frontend/
  src/context/     Firebase auth state (AuthProvider/useAuth)
  src/pages/       Login, Register, Dashboard (the game)
  src/routes/      ProtectedRoute
```

## How the game works

- `POST /api/game/start` creates a round with a random secret (1-43) and returns only
  its id — the secret and guess count are never sent to the client.
- `POST /api/game/guess` compares a guess to the stored secret and returns
  `Higher` / `Lower` / `Correct` plus the running guess count.
- On a correct guess, if this round's guess count beats the user's stored
  `BestGuessCount` (or it's their first win), it's updated in Postgres.
- `GET /api/users/me` returns the caller's profile, including `BestGuessCount` -
  the dashboard shows this on login so returning players see their personal best.
