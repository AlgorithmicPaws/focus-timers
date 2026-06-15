# Arquitectura objetivo — Focus Timers

> Documento de repaso integral del sistema **tras** ejecutar el plan de 8 fases (`docs/PLAN.md`). Verificado contra el código real del repo y el grafo de conocimiento (`graphify-out/GRAPH_REPORT.md`). Describe la evolución concreta de este monorepo, no una arquitectura abstracta.
>
> **Fecha:** 2026-06-12 · **Decisiones abiertas:** todas resueltas (ver §7).

---

## 1. Vista de alto nivel

### Diagrama del sistema objetivo

```
                          ┌──────────────────────────────────────────────┐
                          │                   NAVEGADOR                     │
                          │  React 18.3 + Vite 5 (TS strict) · FSD          │
                          │                                                 │
                          │  Estado timer (100% cliente, anclado a Date.now)│
                          │  + persistencia en localStorage (continuar)     │
                          │  Zustand (auth)  ·  TanStack Query (server)     │
                          │  features/{pomodoro,flowtime,bolsa,timer,       │
                          │   sessions,settings,auth,music,ai}              │
                          └───────┬──────────────────────────┬──────────────┘
                                  │ HTTPS (Axios)            │ HTMLAudioElement (loop)
                                  │ Bearer JWT               │ pistas lo-fi/jazz/soul (Suno)
                                  ▼                          ▼
   ┌──────────────────────────────────────────┐   ┌──────────────────────────┐
   │  CloudFront + S3 (estático)               │   │  CloudFront + S3 (audio)  │
   │  sirve el bundle del frontend             │   │  focus-timers-audio/      │
   └──────────────────────────────────────────┘   │  tracks.json + pistas     │
                                  │                 │  Cache-Control inmutable  │
                                  ▼                 └──────────────────────────┘
   ┌────────────────────────────────────────────────────────────────────────┐
   │  EC2 t3.micro · nginx/Caddy → uvicorn · FastAPI (Python 3.12)            │
   │                                                                          │
   │   Router ──► Service ──► Repository ──► Model (SQLAlchemy 2.0)           │
   │   ┌──────────┐  ┌──────────────┐  ┌────────────────────┐                 │
   │   │ auth     │  │ AuthService  │  │ UserRepository     │                 │
   │   │ users    │  │ UserService  │  │ SessionRepository  │                 │
   │   │ sessions │  │ SessionSvc   │  │ PresetRepository   │                 │
   │   │ settings │  │ SettingsSvc  │  │ SettingsRepository │                 │
   │   │ health   │  │              │  │ FeatureRepository  │ ◄── NUEVO F7     │
   │   │ ai  ◄────┼──┼─ services/ai/┤  └────────────────────┘                 │
   │   └──────────┘  │  heuristic   │           │                             │
   │   slowapi       │  rationale ──┼───────────┼──► OpenRouter (httpx)       │
   │   JWT HS256     └──────────────┘           │    [condición de parada a]  │
   │                 caché in-process (hash)     │                            │
   └────────────────────────────────────────────┼────────────────────────────┘
                                  │ SQLAlchemy   │ SSM Parameter Store (secretos)
                                  ▼              ▼ DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY
   ┌────────────────────────────────────────────────────────────────────────┐
   │  RDS PostgreSQL 15 (db.t3.micro)                                         │
   │  users · focus_sessions (+pomodoro/flowtime/bolsa_details 1:1)          │
   │  user_settings · presets · ai_suggestions ◄── NUEVO F7                  │
   └────────────────────────────────────────────────────────────────────────┘
```

### Flujo de una request típica

**(A) Guardar sesión** (`POST /api/v1/sessions/`):
El timer corre 100% en cliente sin tocar la red (`useTimer.ts` + `usePomodoroSession.ts`). Al completar, `sessions.service.ts` → Axios (`api-client.ts` inyecta `Bearer <token>`) → router `sessions.py` (`Depends(get_current_user)` extrae `user_id` del JWT, nunca del payload) → `SessionService.create_session` → `SessionRepository.create` hace `flush()` para obtener `session.id` y luego inserta el detalle 1:1 correspondiente (`PomodoroDetails`/`FlowtimeDetails`/`BolsaDetails`) → `commit`. Devuelve `SessionResponse` (god node del grafo, 18 edges).

**(B) Sugerir timer** (`POST /api/v1/ai/suggest-timer`, Fase 7):
router `ai.py` (JWT + rate-limit) → **siempre** llama Capa 1: `FeatureRepository` ejecuta agregaciones SQL (`GROUP BY`, `width_bucket`) sin cargar filas crudas → `heuristic_service.py` mapea features a `{technique, work_minutes, break_minutes}` + rationale por plantilla. Si `AI_RATIONALE_ENABLED=true`, Capa 2 (`rationale_service.py`) envía **solo agregados anónimos** a OpenRouter para reescribir el rationale; los números ya están cerrados. Fallback a la plantilla si el flag está off, timeout (2 s) o error. Se persiste en `ai_suggestions` para medir adopción.

---

## 2. Arquitectura frontend

### FSD y las nuevas features

La estructura Feature-Sliced Design existente (`features/{auth,timer,pomodoro,flowtime,bolsa,sessions,settings}`) se extiende con dos slices nuevos, **sin romper la regla de no-imports cruzados entre features** (solo vía `shared/`):

- **`features/music/`** (Fase 6): `useAmbientPlayer.ts` (HTMLAudioElement en loop, volumen, crossfade) + `AmbientPlayer.tsx`. Reproduce pistas propias lo-fi/jazz/soul generadas con Suno y servidas desde S3+CloudFront (no se empaquetan en el bundle). Coordina volumen con `shared/hooks/useSound.ts`. **Sin OAuth ni APIs de terceros.**
- **`features/ai/`** (Fase 7, decisión resuelta): `useSuggestTimer.ts` (mutation de TanStack Query) + `SuggestionCard.tsx`. La composición con los 3 paneles de config ocurre **a nivel de página** (`PomodoroPage`, etc.), no por import cruzado entre features → respeta FSD.
- **i18n** (Fase 4): infraestructura transversal en `shared/i18n/{es,en}/*.json` (namespaces por feature), inicializada en `app/providers.tsx`.

### Gestión de estado: qué vive dónde

| Tipo de estado | Herramienta | Ubicación |
|---|---|---|
| Sesión de usuario (token) | **Zustand** persistido a localStorage | `features/auth/store/auth.store.ts` |
| Datos del servidor (sesiones, stats, settings, presets, sugerencia IA) | **TanStack Query** | hooks `useSessions.ts`, `useSettings.ts`, `useSuggestTimer.ts` |
| **Estado del timer** (segundos, fase, status) | **Estado local React puro** (`useState`/`useRef`), **nunca** servidor durante la sesión | `features/timer/hooks/useTimer.ts` + máquinas de fase por técnica |
| **Recuperación del timer** (técnica, endAt, fase) | **localStorage** (decisión resuelta) | persistido por `features/timer/` para "Continuar sesión" |
| Preferencias (idioma, tema, pista/volumen de música) | localStorage | `i18nextLng`, `theme`, etc. |

Regla de oro confirmada en código y CLAUDE.md: **el timer no hace llamadas de red mientras corre**; solo se persiste al completar. Esto desacopla la UX del timer de la latencia/disponibilidad del backend.

### Routing y code-splitting

`app/router.tsx` expone los timers, dashboard y settings como **públicos** (solo `/sessions` usa `ProtectedRoute`) — el grafo y el código lo confirman, contradiciendo el `CLAUDE.md` obsoleto (deuda #1, se corrige en Fase 1). La Fase 2 introduce `React.lazy` + `Suspense` para `DashboardPage` y `SessionsPage` (las únicas que arrastran recharts ~100KB), manteniendo los timers en el chunk inicial (ruta crítica, presupuesto ≤150KB gzip). La música se streamea desde CloudFront bajo demanda, no en el chunk inicial.

### Estado del timer y su persistencia

Hoy el timer vive solo en memoria y se pierde al recargar. El plan lo robustece:
- **Fase 3**: anclar a `Date.now()` (`endAtRef`) para eliminar la deriva del `setInterval(1000)` actual (`useTimer.ts:66-76`, deuda #6) y resincronizar en `visibilitychange`.
- **Fase 5 P1-6**: persistir estado mínimo (`técnica, endAt, fase`) en **localStorage** (decisión resuelta) para ofrecer "Continuar sesión" tras cierre accidental, sin red y respetando el principio de timer cliente-puro.

---

## 3. Arquitectura backend

### El patrón de capas (verificado)

`Router → Service → Repository → Model`, separación estricta sin saltos de capa. El `user_id` siempre proviene del JWT (`Depends(get_current_user)`), nunca del request — verificado en `session_service.py`. God nodes del grafo confirman las abstracciones centrales: `SessionService` (26 edges), `SessionRepository` (23), `UserRepository` (21), `PresetRepository` (18).

### Dónde encajan las piezas nuevas de Fase 7 (IA en el monolito — decisión resuelta)

- **`services/ai/`** (paquete nuevo): `heuristic_service.py` (Capa 1, reglas deterministas) y `rationale_service.py` (Capa 2, realce IA opcional). Vive **dentro del monolito FastAPI** (no microservicio separado): la Capa 1 es <50ms y la Capa 2 tiene timeout 2s + fallback. El router `ai.py` lo orquesta igual que `sessions.py` orquesta `SessionService`.
- **`feature_repository.py`** (Repository nuevo): agregaciones SQL `GROUP BY`/`width_bucket`, mismo estilo que `SessionRepository.get_raw_stats_by_user`. Respeta la regla: acceso a datos en Repository, reglas de negocio en Service.
- **Caché Capa 2 (decisión resuelta):** in-process (`cachetools`/`lru_cache`) por hash de features. Una sola instancia EC2, gasto OpenRouter ≈$0. Nada de Redis (sobre-ingeniería a esta escala).

### Separación estricta mantenida

El punto de tensión es la **frontera Service→integración externa**. `rationale_service.py` habla con OpenRouter vía `httpx`. La llamada HTTP queda encapsulada dentro del Service de IA (no en el Repository, que es solo BD), y el endpoint nunca depende de que la IA responda (siempre tiene el resultado determinista de Capa 1).

### Config, secretos y flags

`core/config.py` usa Pydantic `BaseSettings` con **fail-fast** (god node `BaseSettings`): faltan vars → crash en arranque. Añade `AI_RATIONALE_ENABLED: bool = False` y `OPENROUTER_API_KEY: str | None`, con fail-fast **solo si el flag es true**. La var `ANTHROPIC_API_KEY` actual se elimina en Fase 1 (deuda #2). En AWS los secretos migran a SSM Parameter Store (SecureString).

### El ciclo de import a romper

El grafo reporta un ciclo de 1 fichero en `session_repository.py`. La causa real es el acoplamiento entre `repositories/session_repository.py` y `schemas/session_schemas.py` (importa `CreateSessionRequest` — un schema en la capa de Repository). Fase 1 lo resuelve moviendo ese import a un bloque `TYPE_CHECKING` (el modelo `focus_session.py` ya usa este patrón correctamente).

---

## 4. Modelo de datos

### Esquema actual + adición de Fase 7

```
┌─────────────┐         ┌──────────────────────────────────┐
│   users     │ 1     N │        focus_sessions            │
│─────────────│────────<│──────────────────────────────────│
│ id (PK)     │         │ id (PK)                          │
│ name        │         │ user_id (FK→users) [idx]         │
│ email (uniq)│         │ technique (enum)                 │
│ hashed_pw   │         │ task_name, task_tags(JSON),proj  │
│ is_active   │         │ started_at, ended_at             │
│ created_at  │         │ total_work_seconds, break_secs   │
│ updated_at  │         │ completed                        │
└──────┬──────┘         │ interruptions(JSON)              │
       │                │ technique_config(JSON)           │
       │ 1              │ day_of_week, hour_of_day          │
       │                │ mood_rating                      │
       │                │ created_at                       │
       │                └───┬──────────┬──────────┬─────────┘
       │             1:1│       1:1│       1:1│
       │          ┌────────┐  ┌─────────┐ ┌──────────┐
       │          │pomodoro│  │flowtime │ │ bolsa    │
       │          │_details│  │_details │ │ _details │
       │          └────────┘  └─────────┘ └──────────┘
       │  1  N
       ├────<┌──────────────┐
       │     │ user_settings│ (1:1 lógico)
       │     └──────────────┘
       │  1  N
       ├────<┌──────────────┐
       │     │   presets    │
       │     └──────────────┘
       │  1  N    ┌──────────────────────────┐  ◄── NUEVO Fase 7
       └─────────<│     ai_suggestions       │
                  │──────────────────────────│
                  │ id (PK)                  │
                  │ user_id (FK→users)       │
                  │ features_snapshot (JSON) │  ← solo agregados anónimos
                  │ suggestion (JSON)        │
                  │ source ('heuristic'|'ai')│
                  │ accepted (BOOL NULL)     │  ← métrica de adopción
                  │ created_at               │
                  └──────────────────────────┘
```

### Índices

- PK + index en `focus_sessions.id` y `pomodoro_details.id`.
- Index en `focus_sessions.user_id`.
- Index compuesto `ix_focus_sessions_user_started (user_id, started_at)` — cubre la query más frecuente: filtrar por usuario + ordenar/filtrar por fecha (`SessionRepository.list_by_user`). Verificado en migración `b3e7f2a91c04`.
- `pomodoro_details.session_id` es `unique` (refuerza el 1:1).

### "Capturar datos ricos desde el día uno"

Principio no negociable confirmado en `focus_session.py`: campos como `interruptions`, `technique_config`, `day_of_week`, `hour_of_day`, `mood_rating` se crearon en la migración inicial **aunque la UI aún no los usa**. Esto evita migraciones retroactivas y es el **insumo directo de Fase 7**: `FeatureRepository` consume exactamente estos campos. El plan cierra el loop usando datos que ya existen.

---

## 5. Integraciones externas y límites de confianza

| Integración | Frontera de confianza | Principio |
|---|---|---|
| **OpenRouter (IA)** | Capa 2, detrás de flag. Solo recibe **agregados anónimos** (`features_snapshot`), nunca `task_name` crudo ni historial fila a fila. Los números de la sugerencia se calculan **antes** de la llamada; el LLM solo redacta prosa. | "El LLM nunca decide los minutos". Test obligatorio: comparar `Suggestion` pre y post Capa 2 — deben ser idénticos en `technique/work_minutes/break_minutes`. |
| **Música (Suno + S3/CloudFront)** | Pistas propias generadas con Suno (plan de pago, licencia comercial), servidas como estáticos desde S3+CloudFront. **No es una integración en runtime**: no hay API de terceros que llamar, ni OAuth, ni ToS de reproducción. | Sin dependencia de servicios externos en runtime → cero riesgo de deprecación/rate-limit/cambio de ToS. |

**Condiciones de parada** (bloqueos externos que NO frenan el camino crítico):
- **(a) OpenRouter:** `OPENROUTER_API_KEY` — solo para Capa 2. Capa 1 + endpoint + tests (LLM mockeado) se entregan sin ella.
- **(b) AWS:** cuenta activa + decisión de abandonar Vercel/Railway.

> La Fase 6 (música) **dejó de tener condición de parada** al descartar Spotify/OAuth. El diseño hace que cada integración sea **degradable a cero**: sin OpenRouter hay heurística; la música son estáticos propios; sin AWS sigue Vercel/Railway.

---

## 6. Infraestructura y despliegue

| Componente | Actual (Fases 1-7) | Objetivo AWS (Fase 8) | Decisión |
|---|---|---|---|
| Frontend | Vercel | S3 + CloudFront + ACM | Migrar (portfolio de infra) |
| **Audio** | — | S3 + CloudFront (`focus-timers-audio`) | Bucket independiente, creable temprano |
| Backend | Railway | **EC2 t3.micro** (uvicorn+nginx+systemd) | **Resuelto: EC2** (proceso persistente, pool BD estable; swap para el 1GB) |
| BD | Supabase (Postgres 15) | **RDS db.t3.micro** | **Resuelto: RDS** (cuenta AWS unificada, IAM/VPC, portfolio). Migración `pg_dump`/`pg_restore` |
| Secretos | Env vars Railway/Vercel | SSM Parameter Store (SecureString) | OIDC elimina claves de larga duración en GitHub |
| CI/CD | GitHub Actions | + jobs deploy S3/EC2 vía IAM OIDC | Sin claves estáticas; roles asumibles |

**Costo de la música:** ~$10 one-time (Suno Pro, 1 mes con licencia comercial) + ≈$0/mes (S3 Free Tier 5GB + CloudFront 1TB/mes always-free, con `Cache-Control` inmutable y loop desde caché del navegador).

**Decisión arquitectónica honesta del plan**: las analíticas se sirven con `GROUP BY` en Postgres (como ya hace `get_raw_stats_by_user`). Se descarta explícitamente Redshift/Glue/Athena/Spark como sobre-ingeniería para una app de miles de filas. Free Tier expira a 12 meses (~$25-30/mes después).

---

## 7. Decisiones arquitectónicas (RESUELTAS)

| # | Decisión | Elección | Justificación |
|---|----------|----------|---------------|
| 1 | ¿Monolito FastAPI o microservicio de IA? | **Monolito** | Capa 1 <50ms, Capa 2 con timeout+fallback; separar es sobre-ingeniería para t3.micro 1GB |
| 2 | ¿Persistencia del estado del timer? | **localStorage** (`técnica, endAt, fase`) | Sobrevive recarga sin red, respeta "timer 100% cliente", reusa el `endAt` anclado de Fase 3 |
| 3 | ¿RDS dedicado o seguir en Supabase? | **RDS db.t3.micro** | Cuenta AWS unificada, IAM/VPC, demuestra RDS en portfolio (objetivo declarado de Fase 8) |
| 4 | ¿EC2 o Lambda+Mangum para FastAPI? | **EC2 t3.micro** | Tráfico bajo y constante; proceso persistente ideal para pool de conexiones a RDS; sin cold-starts |
| 5 | ¿Dónde vive la feature `ai` en el front? | **`features/ai/` propia** | Cohesión + composición a nivel de página (sin import cruzado entre features → respeta FSD) |
| 6 | ¿Caché backend para Capa 2 de IA? | **In-process** (`cachetools`/`lru_cache`) | Una sola instancia, gasto ≈$0; Redis sería sobre-ingeniería |
| 7 | ¿i18n por feature o archivo único? | **Namespaces por feature** | Coherente con FSD; carga selectiva; PRs pequeños por namespace |
| 8 | ¿Música personal del usuario o pistas propias? | **Pistas propias Suno en S3/CloudFront** | Cero OAuth/ToS/mantenimiento; ≈$0/mes; elimina la condición de parada de Spotify |

---

## Archivos relevantes (rutas absolutas)

- Plan y grafo: `docs/PLAN.md`, `graphify-out/GRAPH_REPORT.md`
- Backend núcleo: `backend/app/main.py`, `backend/app/core/config.py`
- Capas verificadas: `backend/app/services/session_service.py`, `backend/app/repositories/session_repository.py` (ciclo de import en el import de `CreateSessionRequest`; `count()` repetido a optimizar)
- Modelo de datos: `backend/app/models/focus_session.py`
- Índice compuesto: `backend/migrations/versions/b3e7f2a91c04_add_composite_indexes.py`
- Frontend crítico: `frontend/src/app/router.tsx` (rutas públicas), `frontend/src/features/timer/hooks/useTimer.ts` (deriva, líneas 66-76), `frontend/src/shared/lib/api-client.ts` (recarga dura 401)

> Nota: el `CLAUDE.md` en la raíz está obsoleto (describe "Fase 1: solo Pomodoro" y rutas de timer protegidas) — esta arquitectura refleja el código real, no ese doc, que se corrige en Fase 1.
