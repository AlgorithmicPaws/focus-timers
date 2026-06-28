# Focus Timers — Progreso del Proyecto

**Última actualización:** 2026-06-12

> El roadmap completo (Fases 1–8) vive en **[`docs/PLAN.md`](docs/PLAN.md)**. Este archivo resume el **estado real** del repositorio. La arquitectura detallada está en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## ¿Qué es Focus Timers?

App web de productividad con tres técnicas de timer: **Pomodoro**, **Flowtime** y **Bolsa de Tiempo** (diferenciador único — ninguna otra app la implementa). Deploy en Vercel (frontend) + Railway (backend) + Supabase (PostgreSQL 15).

---

## Estado actual (verificado en el código)

### Implementado y desplegado

**Frontend (React 18 + Vite + TS strict, Feature-Sliced Design):**
- **3 técnicas completas** con sus hooks de sesión sobre timers genéricos:
  - `features/pomodoro/` → `usePomodoroSession.ts`
  - `features/flowtime/` → `useFlowtimeSession.ts`
  - `features/bolsa/` → `useBolsaSession.ts`
  - base en `features/timer/hooks/` (`useTimer`, `usePomodoroTimer`, `useFlowtimeTimer`, `useBolsaTimer`)
- **8 páginas**: Dashboard, Pomodoro, Flowtime, Bolsa, Sessions, Settings, Login, Register.
- **Dashboard con analítica** (recharts 3): `FocusChart.tsx`, `StatsGrid.tsx`, `TechniqueBreakdown.tsx`.
- **Settings + presets** (`features/settings/`), **sonidos** (`shared/hooks/useSound.ts`), **dark mode** (`ThemeToggle.tsx`).
- **Guards de navegación y guardado**: `useNavigationGuard.ts`, `useAuthGuardedSave.ts`, `AuthPrompt.tsx`, `NavigationBlockerModal.tsx`.
- **Rutas públicas por diseño**: timers, dashboard y settings son accesibles sin cuenta; solo `/sessions` está tras `ProtectedRoute`. Guardar una sesión es lo que pide login.

**Backend (FastAPI + SQLAlchemy 2.0, Router→Service→Repository→Model):**
- 5 routers: `auth`, `users`, `sessions`, `settings`, `health`.
- JWT HS256 + `slowapi` (rate limit en login).
- Stats agregadas vía SQL en BD (`SessionRepository.get_raw_stats_by_user`), nunca cargando filas crudas.
- **4 migraciones Alembic** (`backend/migrations/versions/`): `1bc760c13d7b` schema inicial · `76a1b31a6395` settings+presets · `a2f9c1d4e8b3` detalles flowtime/bolsa · `b3e7f2a91c04` índices compuestos.
- Modelo `focus_sessions` rico desde el día uno (`task_name`, `task_tags`, `project`, duraciones, `interruptions`, `day_of_week`, `hour_of_day`, `mood_rating`, `technique_config`) + tablas detalle 1:1 (`pomodoro_details`, `flowtime_details`, `bolsa_details`) + `user_settings` y `presets`.

**CI (`.github/workflows/ci.yml`):**
- Job backend: ruff + alembic + pytest contra Postgres 15 real.
- Job frontend: typecheck + build.
- **No hay E2E todavía** (se añade en Plan Fase 3).

---

## Fase 1 del plan — Auditoría y saneamiento (en curso)

Ver [`docs/PLAN.md` § Fase 1](docs/PLAN.md). Trabajo de saneamiento de deuda técnica:

- [x] **Docs honestos** — `CLAUDE.md` y `PROGRESS.md` actualizados al estado real (3 técnicas, 8 páginas, rutas públicas/protegidas correctas, sin "Fase 1 = solo Pomodoro").
- [x] **`anthropic` eliminado** de `backend/requirements.txt` (sin uso en código; la IA de Fase 7 usará OpenRouter).
- [x] **`psycopg2` → `psycopg2-binary`** en `backend/requirements.txt`.
- [x] **`@types/node` deduplicado** en `frontend/package.json` (queda solo `^22.0.0`).
- [x] **Ciclo de import roto** en `backend/app/repositories/session_repository.py` (`CreateSessionRequest` movido a `TYPE_CHECKING` + `from __future__ import annotations`).
- [x] **Bugs #6 y #7 documentados** (no arreglados) como insumo de la suite E2E rojo→verde de la Fase 3:
  - **#6** `useTimer.ts` decrementa estado con `setInterval(1000)` sin anclar a `Date.now()` → deriva en pestañas de fondo.
  - **#7** `api-client.ts` hace `window.location.href` (recarga dura) ante 401 → destruye un timer en curso.

### Verificaciones pendientes de correr en tu entorno (Node no disponible en el shell de Claude)
- [ ] `cd frontend && npm install` — regenerar `package-lock.json` (todavía resuelve `@types/node` a 25.5.0).
- [ ] `cd frontend && npm run typecheck && npm run build` — confirmar verde sin warning de dependencia duplicada.
- [ ] `cd backend && source .venv/bin/activate && python -c "import app.repositories.session_repository"` — confirmar import sin ciclo (el fix es estático; falta correrlo con deps instaladas).

---

## Próximas fases (resumen — detalle en `docs/PLAN.md`)

| Fase | Objetivo | Bloqueo |
|------|----------|---------|
| 2 | Rendimiento con métricas objetivo (Lighthouse ≥90, chunk ≤150KB, p95 ≤150ms) | — |
| 3 | Suite E2E Playwright (bugs #6/#7 rojo→verde) | — |
| 4 | Internacionalización (react-i18next, es/en) | — |
| 5 | Backlog UX P0/P1/P2 | — |
| 6 | Música de ambiente (pistas propias Suno en S3/CloudFront, ≈$0/mes) | — |
| 7 | Sugerencia de timers con IA (Capa 1 heurística siempre; Capa 2 IA opcional) | Capa 2: `OPENROUTER_API_KEY` |
| 8 | Migración a AWS Free Tier | Cuenta AWS + decisión explícita |

**Camino crítico:** 1 → 3 → 4 → 5. Fases 2, 6 y 7 (Capa 1) son paralelizables tras la Fase 1.

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

# Tests backend
cd backend && pytest tests/ -v

# Nueva migración
cd backend && alembic revision --autogenerate -m "descripcion"
```
