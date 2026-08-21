# Guess the Number — Full Stack App

## Stack

- Backend: .NET Core 8 Web API
- Frontend: React (Vite)
- Databases: PostgreSQL (user data), MongoDB (game round history)
- Auth: Firebase Authentication

## Setup

1. `docker-compose up -d` — starts Postgres + Mongo
2. `cd backend/Api && dotnet run` — starts the API
3. `cd frontend && npm run dev` — starts the React app
4. Configure Firebase project and add credentials (see below)

## Firebase setup

- Create a Firebase project, enable Email/Password auth
- Add `frontend/.env` with your Firebase web config
- Add backend service account JSON path via `appsettings.Development.json`
