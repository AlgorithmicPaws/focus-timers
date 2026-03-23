# Focus Timers — Progreso del Proyecto

**Última sesión:** 2026-03-22

---

## ¿Qué es Focus Timers?

App web de productividad con tres técnicas de timer: **Pomodoro**, **Flowtime** y **Bolsa de Tiempo** (diferenciador único). Fase actual: **Fase 1** — infraestructura, auth y Pomodoro.

**Objetivo de Fase 1:** URL pública donde un usuario pueda registrarse, hacer login, correr un timer Pomodoro y ver su historial de sesiones.

---

## Lo que se implementó hoy

### 1. CLAUDE.md — Contexto completo del proyecto
Archivo en la raíz con toda la información necesaria para que Claude Code trabaje en el proyecto sin perder contexto:
- Stack técnico, estructura de carpetas, convenciones de naming
- Design system (tokens de color, glassmorphism, dark mode)
- API endpoints de Fase 1, modelos de BD, rutas del frontend
- Smoke test de Fase 1, checklist de seguridad

### 2. Subagentes de Claude Code (`.claude/agents/`)
Tres agentes especializados para el proyecto:
- **`backend.md`** (verde) — FastAPI, SQLAlchemy, Alembic, JWT, pytest
- **`frontend.md`** (azul) — React 18, TypeScript strict, Zustand, Tailwind, Vitest
- **`devops.md`** (naranja) — Railway, Vercel, GitHub Actions, Supabase, costos

### 3. Backend — FastAPI completo

**Arquitectura:** Router → Service → Repository → Model (sin saltar capas)

| Archivo | Propósito |
|---------|-----------|
| `app/core/config.py` | Pydantic Settings — falla al inicio si faltan env vars |
| `app/core/database.py` | SQLAlchemy engine + `get_db` dependency |
| `app/core/security.py` | JWT (python-jose) + bcrypt (passlib) |
| `app/core/dependencies.py` | `get_current_user` — extrae user del JWT |
| `app/core/exceptions.py` | HTTPExceptions tipadas (NotFound, Conflict, etc.) |
| `app/models/user.py` | Modelo `User` con SQLAlchemy 2.0 `Mapped[]` |
| `app/models/focus_session.py` | `FocusSession` + `PomodoroDetails` + enum `Technique` |
| `app/schemas/auth_schemas.py` | DTOs: RegisterRequest, LoginRequest, TokenResponse |
| `app/schemas/user_schemas.py` | UserResponse, UpdateUserRequest |
| `app/schemas/session_schemas.py` | CreateSessionRequest, SessionResponse, SessionListResponse |
| `app/repositories/user_repository.py` | CRUD de usuarios (solo acceso a datos) |
| `app/repositories/session_repository.py` | CRUD de sesiones con `selectinload` para detalles |
| `app/services/auth_service.py` | Register, login, refresh — lógica de negocio |
| `app/services/user_service.py` | Get/update/delete perfil |
| `app/services/session_service.py` | Crear, listar, eliminar sesiones |
| `app/routers/auth.py` | POST /register, /login (rate limit 10/min), /refresh |
| `app/routers/users.py` | GET/PUT/DELETE /users/me |
| `app/routers/sessions.py` | POST/GET /sessions/, DELETE /sessions/{id} |
| `app/routers/health.py` | GET /health — verifica conexión a BD |
| `app/main.py` | FastAPI app, CORS, rate limiting, registro de routers |
| `migrations/env.py` | Alembic configurado, importa todos los modelos |
| `tests/conftest.py` | Fixtures con SQLite en memoria para tests aislados |

**Endpoints disponibles:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login        ← rate limit 10/min
POST   /api/v1/auth/refresh
GET    /api/v1/users/me
PUT    /api/v1/users/me
DELETE /api/v1/users/me
POST   /api/v1/sessions/
GET    /api/v1/sessions/         ← soporta ?technique=&limit=&offset=
DELETE /api/v1/sessions/{id}
GET    /health
```

### 4. Frontend — React 18 + TypeScript

**Arquitectura:** Feature-Sliced Design (`features/` · `pages/` · `shared/` · `app/`)

| Archivo | Propósito |
|---------|-----------|
| `src/index.css` | CSS variables (tokens claro/oscuro), import Quicksand |
| `src/main.tsx` | Entry point |
| `src/app/App.tsx` | QueryClientProvider + RouterProvider |
| `src/app/router.tsx` | 5 rutas: `/`, `/timer/pomodoro`, `/sessions`, `/login`, `/register` |
| `src/shared/lib/api-client.ts` | Axios con interceptor JWT y redirect a /login en 401 |
| `src/shared/lib/query-client.ts` | TanStack Query client (stale 5min) |
| `src/shared/constants/routes.ts` | Constantes de rutas |
| `src/shared/components/ProtectedRoute.tsx` | Redirige a /login si no hay token |
| `src/shared/components/ui/Button.tsx` | 4 variantes: cta, glass, secondary, danger |
| `src/shared/components/layout/Header.tsx` | Nav fija con links y botón logout |
| `src/features/auth/types/auth.types.ts` | Interfaces User, TokenResponse, LoginRequest, etc. |
| `src/features/auth/store/auth.store.ts` | Zustand store persistido en localStorage |
| `src/features/auth/services/auth.service.ts` | register, login, getMe |
| `src/features/auth/components/LoginForm.tsx` | Form con react-hook-form + Zod |
| `src/features/auth/components/RegisterForm.tsx` | Form con validación (email, password con número) |
| `src/features/timer/hooks/useTimer.ts` | Countdown genérico — 100% cliente, sin side effects |
| `src/features/timer/hooks/usePomodoroTimer.ts` | Máquina de estados: idle→focus→break→long_break |
| `src/features/timer/components/TimerDisplay.tsx` | MM:SS responsive (5rem → 8rem → 12rem) |
| `src/features/pomodoro/hooks/usePomodoroSession.ts` | Orquesta timer + guarda sesión al completar |
| `src/features/sessions/types/session.types.ts` | Interfaces FocusSession, CreateSessionPayload, etc. |
| `src/features/sessions/services/sessions.service.ts` | create, list, delete sesiones |
| `src/features/sessions/components/SessionCard.tsx` | Tarjeta de sesión con técnica, duración, fecha |
| `src/pages/LoginPage.tsx` | Página de login |
| `src/pages/RegisterPage.tsx` | Página de registro |
| `src/pages/DashboardPage.tsx` | Dashboard con acceso a Pomodoro y link a sesiones |
| `src/pages/PomodoroPage.tsx` | Página completa: fondo de color por fase + glassmorphism card |
| `src/pages/SessionsPage.tsx` | Historial con TanStack Query + delete |

**Diseño del timer (PomodoroPage):**
- Fondo cambia de color por fase con transición 800ms
- `bg-brand-focus` (#ff7b61) → focus
- `bg-brand-break` (#fbbf24) → short break
- `bg-brand-longbreak` (#7ab854) → long break
- Card glassmorphism flotante sobre el fondo

### 5. Infraestructura y CI/CD

| Archivo | Propósito |
|---------|-----------|
| `.github/workflows/ci.yml` | Pipeline CI con dos jobs paralelos |
| `vercel.json` | Configuración deploy frontend |
| `.gitignore` | Python + Node + env files |
| `backend/Procfile` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| `backend/.env.example` | Template de variables de entorno |
| `frontend/.env.local.example` | Template variables Vite |

**CI Pipeline (`.github/workflows/ci.yml`):**
- **Job Backend:** ruff lint → alembic migrations → pytest (contra PostgreSQL 15 real)
- **Job Frontend:** TypeScript check → Vite build production
- Corre en PRs a `main` y `develop`, y en push a `develop`
- Cancela runs anteriores del mismo branch (concurrency)

**Protección de ramas (GitHub):**
```
main    → require PR + 1 approval + CI verde + no force push
develop → require CI verde + no force push
```

---

## Estado del repositorio

```
github.com/AlgorithmicPaws/focus-timers

main                         ← protegida, auto-deploy Railway + Vercel
develop                      ← protegida, integración
feature/fase-1-auth-pomodoro ← rama activa ← estás aquí
```

**Commits:**
```
1adb1c1  ci: add GitHub Actions workflow for backend and frontend
89b0de6  feat: Phase 1 scaffold - backend FastAPI + frontend React
```

---

## Qué falta para completar Fase 1

### Pendiente obligatorio antes del primer deploy

- [ ] **Migración Alembic inicial** — correr `alembic revision --autogenerate -m "initial schema"` con la BD de Supabase conectada
- [ ] **Configurar Railway** — subir variables: `DATABASE_URL`, `JWT_SECRET_KEY`, `FRONTEND_URL`, `ENVIRONMENT=production`
- [ ] **Configurar Vercel** — subir variable: `VITE_API_URL` con la URL de Railway
- [ ] **Instalar dependencias frontend** — `npm install` (no hay `package-lock.json` aún)
- [ ] **Tests de integración** — al menos happy path de auth y sessions

### Smoke test de Fase 1 (criterio de éxito)
1. Abrir URL de Vercel → redirige a `/login`
2. Registrarse → redirige a Dashboard, nombre visible en header
3. Ir a `/timer/pomodoro` → muestra 25:00, botón Iniciar
4. Timer llega a 0 → fase cambia a short break (fondo ámbar)
5. Terminar sesión → aparece en `/sessions`
6. Logout → redirige a `/login`, token eliminado
7. Login de nuevo → historial sigue visible

---

## Stack de referencia rápida

```
Backend:   FastAPI + Python 3.12 + SQLAlchemy 2.0 + Alembic + psycopg2
           python-jose + passlib + slowapi + Pydantic v2
           Deploy: Railway Hobby ($5/mes)

Frontend:  React 18 + Vite + TypeScript strict
           Zustand + TanStack Query + React Hook Form + Zod + Axios
           Tailwind CSS v4 (@tailwindcss/vite)
           Deploy: Vercel (free tier)

Database:  PostgreSQL 15 — Supabase (free tier ~500MB)

CI/CD:     GitHub Actions → Railway + Vercel auto-deploy desde main
```

---

## Comandos útiles

```bash
# Backend local
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env   # rellenar DATABASE_URL y JWT_SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8080

# Frontend local
cd frontend
npm install
npm run dev            # → http://localhost:3000

# Generar nueva migración
cd backend && alembic revision --autogenerate -m "descripcion"

# Tests backend
cd backend && pytest tests/ -v

# Rama para nueva tarea
git checkout develop
git checkout -b feature/fase-1-nombre-tarea
```
