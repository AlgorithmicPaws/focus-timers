# Revisión Fase 2 — Marzo 2026

### Criterio de éxito: PASÓ ✓

---

## Qué se entregó

### Backend

| Componente | Estado | Notas |
|---|---|---|
| `flowtime_details` model + migración | ✓ | `break_model`, `break_ratio`, `break_recommended_sec`, `break_actual_sec` |
| `bolsa_details` model + migración | ✓ | `budget_total/work/break_sec`, `budget_used_sec`, `breaks_taken` (JSON), `budget_exhausted` |
| `SessionCreateRequest` con flowtime/bolsa details | ✓ | Campos opcionales con `?` |
| `GET /api/v1/sessions/stats` | ✓ | Por técnica: total, completadas, completion_rate, work_minutes, avg_minutes |
| Filtro `interval` en `GET /sessions/` | ✓ | `week / month / 3months / year` |
| Rate limit en `/register` | ✓ | 5/min (login ya tenía 10/min) |
| Validator `ended_at >= started_at` | ✓ | Pydantic `field_validator` |
| `focus_interval_sec` con `le=14400` | ✓ | Límite de 4 horas |
| `Optional[X]` → `X \| None` en modelos | ✓ | `flowtime_details.py`, `bolsa_details.py` |
| `datetime.utcnow()` → `datetime.now(timezone.utc)` | ✓ | Python 3.12+ compatible |
| Cálculo de stats movido del repo al service | ✓ | Repo solo devuelve datos crudos |

### Frontend

| Componente | Estado | Notas |
|---|---|---|
| `FlowtimePage` completo | ✓ | Timer ascendente, break earned, config panel, nav guard |
| `BolsaPage` completo | ✓ | Bloque + presupuesto, indicadores SVG, nav guard |
| `PomodoroPage` mejorado | ✓ | Task input, save manual, config panel, nav guard |
| `SessionsPage` con filtros | ✓ | Interval filter + StatsGrid + session list |
| `DashboardPage` con las 3 técnicas | ✓ | StatsGrid solo si autenticado |
| `Header` compartido | ✓ | Grid 3 columnas, logo, nav, Buy Me a Coffee |
| `WaterTank` movido a `shared/` | ✓ | Ya no existe en `features/pomodoro/` |
| `NavigationBlockerModal` compartido | ✓ | Usado en los 3 timers |
| `PresetCarousel` compartido | ✓ | Usado en Pomodoro y Bolsa config panels |
| `BagIcon` / `BlockIcon` en `shared/icons/` | ✓ | |
| `useNavigationGuard` en `shared/hooks/` | ✓ | `beforeunload` + `useBlocker` |
| `useAuthGuardedSave` en `shared/hooks/` | ✓ | Save gateado por auth, muestra `AuthPrompt` |
| `ErrorBoundary` en `App.tsx` | ✓ | `react-error-boundary` |
| `FLOW_NUDGE_THRESHOLD_SEC` como constante | ✓ | Antes era `90 * 60` hardcodeado |
| `aria-label` + `aria-pressed` en `IntervalFilter` | ✓ | |
| `TimerDisplay` color via `var(--text-primary)` | ✓ | Antes era `#2a2a2a` hardcodeado |
| `BreakSuggestion.tsx` eliminado (dead code) | ✓ | |

---

## Divergencias del spec original

| ID | Tipo | Descripción | Impacto Fase 3 |
|---|---|---|---|
| D1 | Diseño | `BreakSuggestion` component nunca se usó — el break countdown se integró directamente en `FlowtimePage` como número central | Ninguno |
| D2 | Diseño | `BudgetBar` eliminada — reemplazada por dos indicadores inline (BagIcon + tiempo, BlockIcon + tiempo) con WaterTank para el nivel visual | Ninguno |
| D3 | Comportamiento | Bloque de Bolsa pausa durante el break (no corre en paralelo como decía el spec) — decisión intencional del usuario | Documentar en Fase 3 si afecta stats |
| D4 | Cleanup | Se realizó un refactor completo de código durante Fase 2: deduplicación, type fixes, backend best practices | Código más limpio para construir Fase 3 |
| D5 | Build | `pnpm-lock.yaml` fue generado y subido — Vercel detectó pnpm y usó npm para el install, causando errores de tipos en build. Resuelto arreglando los tipos TS | Verificar si Vercel usa pnpm o npm en Fase 3 |

---

## Estado del sistema al cierre de Fase 2

### URLs en producción
- **Frontend (Vercel):** configurado con `vercel.json` para SPA fallback
- **Backend (Railway):** con `nixpacks.toml` para `libpq`

### Rutas activas
```
/                     → DashboardPage (público)
/timer/pomodoro       → PomodoroPage (público, save requiere auth)
/timer/flowtime       → FlowtimePage (público, save requiere auth)
/timer/bolsa          → BolsaPage (público, save requiere auth)
/sessions             → SessionsPage (requiere auth)
/login                → LoginPage
/register             → RegisterPage
```

### Arquitectura frontend
- Feature-Sliced Design: `features/`, `shared/`, `pages/`, `app/`
- Estado global: TanStack Query (server state) + useState local (timer state)
- Autenticación: JWT en localStorage, `ProtectedRoute` para `/sessions`

---

## Notas importantes para Fase 3

### 1. Sistema de tema (dark/light)
El spec de Fase 3 propone usar `tailwind darkMode: 'class'` con clases `dark:`. **Atención:** el sistema actual usa **CSS custom properties** (`--bg-page`, `--text-primary`, etc.) en lugar de clases `dark:`. Para implementar el toggle de tema, lo más consistente es cambiar las variables CSS en el `<html>` (no añadir clase `dark`), o definir ambos sets de variables y sí usar la clase `dark`.

### 2. `pnpm-lock.yaml` en el repo
Se generó al instalar `react-error-boundary`. Vercel lo detecta y puede intentar usar pnpm. Si causa problemas en Fase 3, se puede añadir `"packageManager": "npm"` en `package.json` o eliminar el lock file.

### 3. `StatsGrid` en Dashboard solo carga si autenticado
Actualmente el Dashboard no hace fetch de stats si el usuario no está logueado (para evitar 401). En Fase 3, la meta diaria y el progreso del día también requieren auth — mantener este patrón.

### 4. `CreateSessionPayload` — campos opcionales
`task_tags`, `project`, `technique_config` son opcionales en el tipo frontend. El backend los acepta como `null`. En Fase 3, cuando se agreguen presets y proyectos, estos campos cobran relevancia.

### 5. Preset carousel ya existe como componente compartido
`shared/components/PresetCarousel.tsx` está listo. Los config panels de los timers (Pomodoro, Bolsa, Flowtime) ya lo usan. En Fase 3, el sistema de presets guardados puede apoyarse en esta UI existente.

### 6. `useAuthGuardedSave` — flujo de save sin cuenta
El patrón de "timer público, save requiere auth" está bien encapsulado en este hook. En Fase 3 (presets) este hook podría extenderse para el guardado de presets también.

### 7. Backend: `get_raw_stats_by_user` retorna segundos
El repo devuelve `total_work_seconds` y `avg_work_seconds`. El service los convierte a minutos. En Fase 3 (analytics con gráficos), puede ser necesario tener también datos agrupados por día/semana directamente desde el backend, o agrupar en el frontend desde la lista de sesiones.
