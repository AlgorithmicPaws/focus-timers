# focus-timers

## Project Overview

Focus Timers is a productivity web app implementing three focus timer techniques: **Pomodoro**, **Flowtime**, and **Bolsa de Tiempo** (Time Budget). Bolsa de Tiempo is a key differentiator — no other app implements it.

**Current phase: Phase 1** — Infrastructure + Auth + Pomodoro
**Goal:** Public URL where a user can register, log in, run a Pomodoro timer, and view session history.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| State | Zustand (auth) + TanStack Query (server state) |
| Routing | React Router DOM |
| Backend | FastAPI + Python 3.12 |
| ORM | SQLAlchemy 2.0 + Alembic |
| Database | PostgreSQL 15 (Supabase) |
| Deploy | Frontend → Vercel · Backend → Railway |
| Font | Quicksand (via `@fontsource-variable/quicksand`) |

---

## Project Structure

```
focus-timers/              # Monorepo root
├── frontend/              # React + Vite app
│   └── src/
│       ├── app/           # App shell: App.tsx, router.tsx, providers.tsx
│       ├── features/      # Feature-Sliced Design modules
│       │   ├── auth/      # Login, Register, auth store, auth service
│       │   ├── timer/     # Base timer logic (useTimer, TimerDisplay, etc.)
│       │   ├── pomodoro/  # Pomodoro config, counter, usePomodoroSession
│       │   └── sessions/  # Session list, cards, sessions service
│       ├── pages/         # Route-level components (DashboardPage, PomodoroPage, etc.)
│       ├── shared/        # Shared UI, hooks, lib, constants, types
│       └── assets/        # images/, sounds/
├── backend/               # FastAPI app
│   └── app/
│       ├── core/          # config, database, security, dependencies, exceptions
│       ├── models/        # SQLAlchemy ORM models
│       ├── schemas/       # Pydantic schemas
│       ├── repositories/  # DB access layer
│       ├── services/      # Business logic layer
│       └── routers/       # FastAPI route handlers
├── vercel.json
└── .gitignore
```

---

## Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev        # Runs on http://localhost:3000
```

Vite proxies `/api` → `http://localhost:8080`.

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in DATABASE_URL and JWT_SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

### Required environment variables

**Backend (`.env` / Railway):**
```
DATABASE_URL=postgresql+psycopg2://...
JWT_SECRET_KEY=<64 chars from secrets.token_hex(32)>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
ANTHROPIC_API_KEY=   # Leave empty until Phase 4
```

**Frontend (`.env.local` / Vercel):**
```
VITE_API_URL=https://your-api.up.railway.app
VITE_APP_ENV=production
```

---

## Key Conventions

### Architecture principles (non-negotiable)
1. **Timer is 100% client-side** — no API calls during a running session; save only on completion.
2. **Capture rich data from day one** — all model fields (interruptions, hour_of_day, technique_config, etc.) are created in the first migration even if not shown in UI yet. No retroactive migrations.
3. **Strict layer separation** — Router → Service → Repository → Model. No layer skips.
4. **Feature-Sliced Design in frontend** — each feature is self-contained; no cross-feature imports except via `shared/`.
5. **Fail-fast on config** — missing env vars crash on startup, not at runtime.
6. **Security is non-optional** — `user_id` always comes from the JWT, never from request params. Rate limiting on auth from Phase 1.

### Naming conventions
| Element | Convention |
|---------|-----------|
| React components | PascalCase |
| Hooks | camelCase with `use` prefix |
| Frontend services | camelCase + `.service` suffix |
| Types/Interfaces | PascalCase + `.types` suffix |
| Python files | snake_case |
| Python classes | PascalCase |
| DB tables | snake_case plural |

### Git branches
| Branch | Purpose |
|--------|---------|
| `main` | Production (Railway + Vercel auto-deploy) |
| `develop` | Integration (Vercel preview) |
| `feature/fase-N-description` | Active work per phase |

---

## Design System

### Colors (Tailwind custom tokens)
All phase-aware colors are defined in `tailwind.config.js` under `theme.extend.colors.brand`:

| Token | Value | Usage |
|-------|-------|-------|
| `brand-focus` | `#ff7b61` | Pomodoro · Focus background |
| `brand-break` | `#fbbf24` | Pomodoro · Short Break background |
| `brand-longbreak` | `#7ab854` | Pomodoro · Long Break background |
| `brand-ft-work` | `#4f6ef7` | Flowtime · Working |
| `brand-ft-rest` | `#a5b4fc` | Flowtime · Resting |
| `brand-bl-work` | `#7daa6c` | Bolsa · Working |
| `brand-bl-pause` | `#a8d5be` | Bolsa · Paused |
| `brand-bl-alert` | `#ef4444` | Bolsa · Budget < 20% |
| `brand-tomato` | `#f5421f` | Primary accent, CTAs, active nav |

Surface tokens (light/dark via CSS variables `var(--bg-page)`, `var(--bg-card)`, etc.) are defined in `src/index.css`. **Never hardcode surface colors** — always use CSS variables so dark mode works automatically.

### Timer visual design — core principle
The full-page background changes color per phase with an 800ms transition. This is the app's visual signature:
```tsx
<div className={cn(
  "min-h-screen transition-colors duration-[800ms]",
  phaseColors[phase]  // e.g. 'bg-brand-focus'
)} />
```
The timer display is a **glassmorphism card** floating over this background:
```tsx
"rounded-2xl px-12 py-8 bg-[var(--glass-bg)] backdrop-blur-glass
 border border-[var(--glass-border)] shadow-glass"
```

### Timer digit sizing (responsive)
```tsx
"text-[5rem] sm:text-[8rem] lg:text-[12rem] font-bold leading-none tabular-nums"
```

### Button variants
- **CTA:** `bg-[var(--btn-cta-bg)] hover:bg-brand-tomato` — semitransparent tomato → solid on hover
- **Glass:** `bg-[var(--glass-panel-bg)] backdrop-blur-glass border border-[var(--glass-panel-border)]` — for controls on the timer page
- **Secondary:** transparent with border, hover turns tomato-colored
- **Danger:** transparent with red border

### Dark mode
Activated by adding `class="dark"` to `<html>`. Toggle via `document.documentElement.classList.toggle('dark', isDark)` + `localStorage.setItem('theme', ...)`.

---

## Backend API — Phase 1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user, returns token |
| POST | `/api/v1/auth/login` | No | Login, returns token (rate limited: 10/min) |
| POST | `/api/v1/auth/refresh` | JWT | Refresh token |
| GET | `/api/v1/users/me` | JWT | Get current user profile |
| PUT | `/api/v1/users/me` | JWT | Update name or password |
| DELETE | `/api/v1/users/me` | JWT | Delete account |
| POST | `/api/v1/sessions/` | JWT | Save completed session |
| GET | `/api/v1/sessions/` | JWT | List sessions (supports `?technique=&limit=&offset=`) |
| DELETE | `/api/v1/sessions/{id}` | JWT | Delete a session |
| GET | `/health` | No | Health check |

`/docs` (Swagger) is disabled in `ENVIRONMENT=production`.

---

## Database Models (Phase 1)

### `users`
`id, name, email (unique), hashed_password, is_active, created_at, updated_at`

### `focus_sessions`
`id, user_id (FK→users), technique (enum: pomodoro/flowtime/bolsa), task_name, task_tags (JSON), project, started_at, ended_at, total_work_seconds, total_break_seconds, completed, interruptions (JSON), technique_config (JSON), day_of_week (0=Mon), hour_of_day, mood_rating, created_at`

### `pomodoro_details`
`id, session_id (FK→focus_sessions, unique), focus_interval_sec, short_break_sec, long_break_sec, pomodoros_target, pomodoros_completed, pomodoro_number, was_voided, strict_mode`

> All fields are created in the Phase 1 migration even if not used until later phases.

---

## Frontend Key Files

### State management
- **Auth:** `features/auth/store/auth.store.ts` — Zustand store, persists token to `localStorage`
- **Server state:** TanStack Query with `shared/lib/query-client.ts`

### API client
`shared/lib/api-client.ts` — thin `fetch` wrapper that:
- Injects `Authorization: Bearer <token>` header automatically
- Redirects to `/login` on 401
- Throws on non-2xx with error message from `detail` field

### Timer hooks
- `features/timer/hooks/useTimer.ts` — generic countdown with start/pause/reset
- `features/timer/hooks/usePomodoroTimer.ts` — phase state machine (idle → focus → short_break → long_break → …)
- `features/pomodoro/hooks/usePomodoroSession.ts` — orchestrates timer + saves to API on session end

### Routing
Protected routes via `ProtectedRoute` component. Unauthenticated users are redirected to `/login`.

| Path | Page | Protected |
|------|------|-----------|
| `/` | DashboardPage | Yes |
| `/timer/pomodoro` | PomodoroPage | Yes |
| `/sessions` | SessionsPage | Yes |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |

---

## Phase 1 Success Criteria (Smoke Test)

1. Open Vercel URL → redirects to `/login`
2. Register with valid email/password → redirects to Dashboard, username visible in header
3. Navigate to `/timer/pomodoro` → timer shows 25:00, Start button visible
4. Set to 1 minute, click Start → countdown runs, phase background is `brand-focus` orange
5. Timer reaches 00:00 → phase changes to short break (`brand-break` amber)
6. End session → session saved
7. Go to `/sessions` → session appears with technique "Pomodoro", duration, timestamp
8. Logout → redirected to `/login`, token removed from localStorage
9. Log in again → Dashboard accessible, session history still visible

---

## Security Checklist (Phase 1)

- [ ] `JWT_SECRET_KEY` is 64 chars, set only in Railway (never in code)
- [ ] `DATABASE_URL` set only in Railway
- [ ] `.env` is in `.gitignore` and not committed
- [ ] Rate limiting active on `/api/v1/auth/login` (10 req/min via `slowapi`)
- [ ] CORS configured to Vercel URL only (not `"*"`)
- [ ] All `/sessions` endpoints use `Depends(get_current_user)`
- [ ] `/docs` disabled in `ENVIRONMENT=production`

---

## Important Notes

- **Phases 2–4 are out of scope for now.** Do not implement Flowtime, Bolsa de Tiempo, settings, presets, AI features, or analytics until Phase 2+ specs are provided.
- **Do not add `connect_args={"sslmode": "require"}` for local development** — only needed in production. Use an env check or leave it configurable.
- Comments in code: English for variable/function/type names; Spanish for complex business logic explanations. Python docstrings in Spanish.
- The `@fontsource-variable/quicksand` package should be imported in `main.tsx` or `index.css`, not loaded from Google Fonts CDN in production.
