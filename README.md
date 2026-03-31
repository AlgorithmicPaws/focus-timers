# Focus Timers ⏱️

A personal productivity web app that implements three focus-timer techniques: **Pomodoro**, **Flowtime**, and **Bolsa de Tiempo (Time Budget)** — the last one being a key differentiator that no other app currently offers.

> **Current phase: Phase 1** — Infrastructure · Auth · Pomodoro  
> **Goal:** A live URL where you can register, log in, run a Pomodoro timer, and view your session history.

---

## ✨ Features

| Technique | Description | Best for |
|-----------|-------------|----------|
| 🍅 **Pomodoro** | 25-min focus sprints with 5-min breaks and a long break every 4 pomodoros | Students · structured tasks |
| 🌊 **Flowtime** | Work without a preset limit; rest proportionally to how long you worked | Developers · creative work |
| 🎒 **Time Budget** | Set a total work block and a separate break budget — finish when either runs out | Long sessions · deep work |

### Core UX highlights
- **Full-page colour transitions** (800 ms) that change the background per timer phase, giving immediate visual feedback
- **Glassmorphism card** floating over the coloured background
- **100 % client-side timer** — zero API calls while the clock is ticking; data is only saved on session completion
- Dark mode support via CSS custom properties — toggle persisted in `localStorage`
- Navigation guard that prevents accidental page-leave during an active session

---

## 🗂️ Project Structure

```
focus-timers/                  # Monorepo root
├── frontend/                  # React 18 + Vite + TypeScript
│   └── src/
│       ├── app/               # App shell (App.tsx, router.tsx)
│       ├── features/          # Feature-Sliced Design modules
│       │   ├── auth/          # Login · Register · Zustand store · auth service
│       │   ├── timer/         # Generic countdown hook + TimerDisplay
│       │   ├── pomodoro/      # Pomodoro state machine + session orchestration
│       │   ├── flowtime/      # Flowtime timer (Phase 2)
│       │   ├── bolsa/         # Time-Budget timer (Phase 2)
│       │   └── sessions/      # Session list · cards · sessions service
│       ├── pages/             # Route-level components
│       ├── shared/            # Reusable UI, hooks, lib, constants, types
│       └── assets/            # SVGs, images, sounds
├── backend/                   # FastAPI + Python 3.12
│   └── app/
│       ├── core/              # config · database · security · dependencies · exceptions
│       ├── models/            # SQLAlchemy ORM models
│       ├── schemas/           # Pydantic request/response schemas
│       ├── repositories/      # DB access layer (pure data — no business logic)
│       ├── services/          # Business logic layer
│       └── routers/           # FastAPI route handlers
├── .github/workflows/ci.yml   # CI pipeline (lint + test + build)
└── vercel.json                # Vercel deploy config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 · Vite · TypeScript (strict) |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **State** | Zustand (auth) · TanStack Query v5 (server state) |
| **Forms** | React Hook Form + Zod |
| **Routing** | React Router DOM v6 |
| **HTTP** | Axios (with JWT interceptor + 401 redirect) |
| **Font** | Quicksand Variable (`@fontsource-variable/quicksand`) |
| **Backend** | FastAPI · Python 3.12 |
| **ORM / Migrations** | SQLAlchemy 2.0 · Alembic |
| **Auth** | JWT (`python-jose`) · bcrypt (`passlib`) |
| **Rate limiting** | slowapi |
| **Database** | PostgreSQL 15 (Supabase) |
| **Deploy** | Frontend → Vercel · Backend → Railway |
| **CI** | GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- **Node 20+** and **npm**
- **Python 3.12** and **pip**
- A running **PostgreSQL 15** instance (local or Supabase)

### 1 — Clone

```bash
git clone https://github.com/AlgorithmicPaws/focus-timers.git
cd focus-timers
```

### 2 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Configure environment
cp .env.example .env
# Edit .env → fill in DATABASE_URL and JWT_SECRET_KEY (see below)

# Run migrations
alembic upgrade head

# Start dev server (port 8080)
uvicorn app.main:app --reload --port 8080
```

#### Backend environment variables (`.env`)

```env
DATABASE_URL=postgresql+psycopg2://postgres:[password]@[host]:5432/postgres
JWT_SECRET_KEY=<64-char secret — run: python -c "import secrets; print(secrets.token_hex(32))">
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080          # 7 days
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
ANTHROPIC_API_KEY=                # Leave empty until Phase 4
```

### 3 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# VITE_API_URL is already set to http://localhost:8080 for local dev

# Start dev server (port 3000)
npm run dev
```

Vite automatically proxies `/api` requests to `http://localhost:8080`.

Open **http://localhost:3000** in your browser.

---

## 🌐 Pages & Routes

| Path | Page | Auth required |
|------|------|:---:|
| `/` | Dashboard — technique picker + weekly stats | ❌ |
| `/timer/pomodoro` | Pomodoro timer | ❌ |
| `/timer/flowtime` | Flowtime timer | ❌ |
| `/timer/bolsa` | Time Budget timer | ❌ |
| `/sessions` | Session history | ✅ |
| `/login` | Login | ❌ |
| `/register` | Register | ❌ |

> Timers are accessible without an account. Login is only required to **save** a session.

---

## 🔌 API Endpoints

Base path: `/api/v1`

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/auth/register` | — | Register new user, returns JWT |
| `POST` | `/auth/login` | — | Login, returns JWT *(rate limited: 10 req/min)* |
| `POST` | `/auth/refresh` | JWT | Refresh access token |
| `GET` | `/users/me` | JWT | Get current user profile |
| `PUT` | `/users/me` | JWT | Update name or password |
| `DELETE` | `/users/me` | JWT | Delete account |
| `POST` | `/sessions/` | JWT | Save a completed session |
| `GET` | `/sessions/` | JWT | List sessions (`?technique=&limit=&offset=`) |
| `DELETE` | `/sessions/{id}` | JWT | Delete a session |
| `GET` | `/health` | — | Health check (also tests DB connection) |

Interactive docs (`/docs` · `/redoc`) are available in development but **disabled in production**.

---

## 🗄️ Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | integer PK | |
| `name` | varchar | |
| `email` | varchar unique | |
| `hashed_password` | varchar | bcrypt |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

### `focus_sessions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | integer PK | |
| `user_id` | FK → users | |
| `technique` | enum | `pomodoro` · `flowtime` · `bolsa` |
| `task_name` | varchar(255) | optional |
| `task_tags` | JSON | optional, for future tagging |
| `project` | varchar(100) | optional |
| `started_at` / `ended_at` | timestamptz | |
| `total_work_seconds` | integer | |
| `total_break_seconds` | integer | |
| `completed` | boolean | |
| `interruptions` | JSON | future analytics |
| `technique_config` | JSON | config snapshot at session start |
| `day_of_week` | integer | 0 = Monday, for analytics |
| `hour_of_day` | integer | for analytics |
| `mood_rating` | integer | future mood tracking |

### `pomodoro_details`
| Column | Type | Default |
|--------|------|---------|
| `session_id` | FK → focus_sessions (unique) | |
| `focus_interval_sec` | integer | 1500 (25 min) |
| `short_break_sec` | integer | 300 (5 min) |
| `long_break_sec` | integer | 900 (15 min) |
| `pomodoros_target` | integer | 4 |
| `pomodoros_completed` | integer | 0 |
| `was_voided` | boolean | false |
| `strict_mode` | boolean | false |

> All analytics fields are created in the Phase 1 migration, even if not displayed in the UI yet — to avoid retroactive schema changes.

---

## 🎨 Design System

### Colour tokens (Tailwind)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-focus` | `#ff7b61` | Pomodoro · Focus phase background |
| `brand-break` | `#fbbf24` | Pomodoro · Short break background |
| `brand-longbreak` | `#7ab854` | Pomodoro · Long break background |
| `brand-ft-work` | `#4f6ef7` | Flowtime · Working |
| `brand-ft-rest` | `#a5b4fc` | Flowtime · Resting |
| `brand-bl-work` | `#7daa6c` | Time Budget · Working |
| `brand-bl-pause` | `#a8d5be` | Time Budget · Paused |
| `brand-bl-alert` | `#ef4444` | Time Budget · Budget < 20% |
| `brand-tomato` | `#f5421f` | Primary accent, CTAs, active nav |

Surface and text tokens (`--bg-page`, `--bg-card`, `--text-primary`, etc.) are defined as CSS custom properties in `src/index.css` and automatically swap between light and dark mode. **Never hardcode surface colours.**

### Timer card — glassmorphism
```tsx
"rounded-2xl px-12 py-8 bg-[var(--glass-bg)] backdrop-blur-md
 border border-[var(--glass-border)] shadow-[var(--shadow-glass)]"
```

### Timer digits — responsive
```tsx
"text-[5rem] sm:text-[8rem] lg:text-[12rem] font-bold leading-none tabular-nums"
```

---

## ⚙️ CI / CD

### GitHub Actions (`.github/workflows/ci.yml`)

Two parallel jobs run on every PR to `main`/`develop` and on every push to `develop`:

| Job | Steps |
|-----|-------|
| **Backend** | Ruff lint → Alembic migrations → pytest (against real PostgreSQL 15) |
| **Frontend** | TypeScript check → Vite production build |

Previous runs on the same branch are automatically cancelled.

### Deployment

| Service | Trigger | Platform |
|---------|---------|----------|
| Backend API | Push to `main` | [Railway](https://railway.app) |
| Frontend | Push to `main` | [Vercel](https://vercel.com) |

#### Frontend env vars (Vercel)
```env
VITE_API_URL=https://your-api.up.railway.app
VITE_APP_ENV=production
```

#### Backend env vars (Railway)
Same as the local `.env`, but with production values for `DATABASE_URL`, `JWT_SECRET_KEY`, and `FRONTEND_URL`.

---

## 🔒 Security

- `JWT_SECRET_KEY` is 64 characters and stored only in Railway — never committed to the repo
- `user_id` is always extracted from the JWT, never from request parameters
- CORS is restricted to the configured `FRONTEND_URL` (not `"*"`)
- Rate limiting on `POST /auth/login`: **10 requests / minute / IP**
- All `/sessions` endpoints require a valid JWT
- Swagger/ReDoc disabled in `ENVIRONMENT=production`

---

## 🧪 Running Tests

```bash
# Backend — requires a reachable PostgreSQL instance
cd backend
pytest tests/ -v

# Frontend — type checking + unit tests
cd frontend
npm run typecheck
npm test
```

---

## 🗺️ Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Infrastructure · Auth · Pomodoro timer · Session history | 🚧 In progress |
| **Phase 2** | Flowtime timer · Time Budget timer · Settings/presets | 📋 Planned |
| **Phase 3** | Analytics dashboard · Tags · Projects | 📋 Planned |
| **Phase 4** | AI-powered insights (Anthropic) | 📋 Planned |

---

## 📁 Key Files Reference

### Backend

| File | Purpose |
|------|---------|
| `app/core/config.py` | Pydantic Settings — crashes on startup if env vars are missing |
| `app/core/security.py` | JWT creation/verification + bcrypt hashing |
| `app/core/dependencies.py` | `get_current_user` — extracts user from JWT for protected routes |
| `app/main.py` | FastAPI app factory: CORS, rate limiting, router registration |
| `migrations/versions/` | Alembic migration history |

### Frontend

| File | Purpose |
|------|---------|
| `src/shared/lib/api-client.ts` | Axios instance with JWT interceptor and 401 → `/login` redirect |
| `src/features/auth/store/auth.store.ts` | Zustand store persisted to `localStorage` |
| `src/features/timer/hooks/useTimer.ts` | Pure countdown hook — no API calls, no side effects |
| `src/features/timer/hooks/usePomodoroTimer.ts` | Phase state machine: `idle → focus → short_break → long_break → …` |
| `src/features/pomodoro/hooks/usePomodoroSession.ts` | Orchestrates the timer and saves the session to the API on completion |

---

## 📝 License

Personal project — all rights reserved.
