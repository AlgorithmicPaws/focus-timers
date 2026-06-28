# Plan de Implementación — Focus Timers (versión final)

**Fecha:** 2026-06-12 · **Revisión de secuenciación:** 2026-06-21 (ver [Orden de ejecución revisado](#orden-revisado))
**Repo:** `/home/sergio/zembu/proyectos/focus-timers` (monorepo: `frontend/` React 18 + Vite 5 + TS strict, `backend/` FastAPI 0.115 + SQLAlchemy 2.0, PostgreSQL 15 en Supabase, deploy Vercel + Railway)

## Índice de fases

1. [Fase 1 — Auditoría y saneamiento (deuda técnica)](#fase-1)
2. [Fase 2 — Rendimiento con métricas objetivo](#fase-2)
3. [Fase 3 — Suite E2E con Playwright (bugs rojo→verde)](#fase-3)
4. [Fase 4 — Internacionalización (react-i18next)](#fase-4)
5. [Fase 5 — Backlog UX priorizado (P0/P1/P2)](#fase-5)
6. [Fase 6 — Música de ambiente (pistas propias Suno en S3/CloudFront)](#fase-6)
7. [Fase 7 — Sugerencia de timers con IA (dos capas, determinista-first)](#fase-7)
8. [Fase 8 — Migración a AWS Free Tier](#fase-8)

**Condiciones de parada globales** (bloqueos externos que NO deben frenar el resto del plan):

- **(a) Fase 7:** `OPENROUTER_API_KEY` — solo necesaria para la Capa 2 (realce IA); toda la Capa 1 se implementa sin ella.
- **(b) Fase 8:** cuenta AWS activa. La **decisión explícita de migrar ya está tomada** (2026-06-21, para publicar el demo); solo queda como prerequisito operativo disponer de la cuenta AWS.

> Nota: la **Fase 6 (música) ya NO tiene condición de parada**. Se descartó Spotify/OAuth en favor de pistas propias (lo-fi/jazz/soul) generadas con **Suno** y servidas desde **S3 + CloudFront**. Coste: ~$10 one-time (1 mes de Suno Pro para generar la librería con licencia comercial) + ≈$0/mes (S3 Free Tier + 1 TB/mes always-free de CloudFront).

---

<a name="orden-revisado"></a>
## Orden de ejecución (revisado 2026-06-21)

> **Cambio respecto a la secuenciación original.** El objetivo inmediato es **publicar un demo en AWS**. Para conseguirlo se adelanta la **Fase 3 (E2E)** como red de seguridad de la migración y la **Fase 5 (UX)** como pulido del demo, **antes** de la **Fase 8 (AWS)**. La **Fase 4 (i18n)**, la **Fase 6 (música)** y la **Fase 7 (IA)** pasan a *después* del demo. El plazo deja de ser "una semana": puede dilatarse, pero se respeta este orden.

**Estado de partida:** Fase 1 ✅ y Fase 2 ✅ ya entregadas (mergeadas en `main`).

| Orden | Fase (ID estable) | Rol en el plan revisado | Estado |
|-------|-------------------|--------------------------|--------|
| 1 | Fase 1 — Saneamiento | Base | ✅ Hecha |
| 2 | Fase 2 — Rendimiento | Base | ✅ Hecha |
| 3 | **Fase 3 — E2E Playwright** | Red de seguridad de la migración | ⏭️ Siguiente |
| 4 | **Fase 5 — Backlog UX** | Pulido del demo | Pendiente |
| 5 | **Fase 8 — Migración AWS** | Publicar el demo | Pendiente |
| 6 | Fase 4 — i18n | Post-demo (barre también los textos nuevos de la Fase 5) | Pendiente |
| 7 | Fase 6 — Música | Post-demo (reutiliza el S3/CloudFront de la cuenta migrada) | Pendiente |
| 8 | Fase 7 — IA (Capa 1) | Post-demo | Pendiente |

> Los números de fase (Fase 1…8) se mantienen como **identificadores estables** (el código y el historial git ya los referencian); lo que cambia es el **orden de ejecución**, no la numeración.

**Implicaciones de dependencias por el reordenamiento:**

- **Fase 5 antes que Fase 4 (dependencia invertida):** los textos nuevos de la Fase 5 se escriben con la convención actual (mezcla es/en como hoy); la Fase 4 los internacionaliza después en su barrido. Su criterio de aceptación de "cero strings hardcodeados" se evaluará incluyendo lo añadido en la Fase 5.
- **Fase 8 después de Fase 5:** la migración ya cuenta con la suite E2E (Fase 3) como red de seguridad y migra una UI pulida (Fase 5).
- **Fase 6 después de Fase 8:** el bucket S3 + CloudFront de la música se crean dentro de la misma cuenta/región de la migración, sin infraestructura duplicada.

---

## Estado actual

**Lo que el código YA tiene** (verificado en el repo, no en los docs):

- 3 técnicas completas: Pomodoro, Flowtime y Bolsa de Tiempo (`frontend/src/features/{pomodoro,flowtime,bolsa}/`), con hooks de sesión (`usePomodoroSession.ts`, `useFlowtimeSession.ts`, `useBolsaSession.ts`) sobre timers genéricos en `features/timer/hooks/`.
- 8 páginas en `frontend/src/pages/`: Dashboard, Pomodoro, Flowtime, Bolsa, Sessions, Settings, Login, Register.
- Dashboard con recharts 3 (`features/sessions/components/FocusChart.tsx`, `StatsGrid.tsx`, `TechniqueBreakdown.tsx`), settings + presets (`features/settings/`), sonidos (`shared/hooks/useSound.ts`), dark mode (`ThemeToggle.tsx`), guards de navegación (`useNavigationGuard.ts`, `useAuthGuardedSave.ts`).
- Backend con patrón Router→Service→Repository→Model, 5 routers (`auth`, `users`, `sessions`, `settings`, `health`), 4 migraciones Alembic (`backend/migrations/versions/`: schema inicial, settings+presets, detalles flowtime/bolsa, índices compuestos), JWT HS256, slowapi, stats agregadas vía SQL (`SessionRepository.get_raw_stats_by_user`).
- Modelo `focus_sessions` rico desde el día uno: `task_name`, `task_tags` (JSON), `project`, `technique`, duraciones, `completed`, `interruptions` (JSON), `day_of_week`, `hour_of_day`, `mood_rating`, `technique_config` (JSON) + tablas detalle 1:1 (`pomodoro_details`, `flowtime_details`, `bolsa_details`). **Esto es el insumo directo de la Fase 7.**
- CI en `.github/workflows/ci.yml`: backend (ruff + alembic + pytest contra Postgres 15 real), frontend (typecheck + build). **No hay E2E.**

**Deuda técnica detectada** (detalle y resolución en Fase 1):

| # | Problema | Evidencia |
|---|----------|-----------|
| 1 | Docs obsoletos: `CLAUDE.md`/`PROGRESS.md` describen "Fase 1: solo Pomodoro" y rutas de timers protegidas; el código real ya tiene las 3 técnicas y `router.tsx` expone los timers públicos (solo `/sessions` usa `ProtectedRoute`) | `CLAUDE.md` vs `frontend/src/app/router.tsx:18-23` |
| 2 | `anthropic==0.34.0` en deps sin uso; entra en conflicto con la decisión OpenRouter de Fase 7 | `backend/requirements.txt:14` |
| 3 | `@types/node` duplicado (`^25.5.0` línea 36 y `^22.0.0` línea 45) | `frontend/package.json` |
| 4 | Ciclo de import de 1 fichero en `session_repository.py` | `graphify-out/GRAPH_REPORT.md` § Import Cycles |
| 5 | `psycopg2==2.9.10` (fuente, requiere toolchain) en vez de `psycopg2-binary` | `backend/requirements.txt:5` |
| 6 | `useTimer.ts` usa `setInterval(1000)` decrementando estado, sin anclar a `Date.now()` → deriva en pestañas de fondo (throttling del navegador) | `frontend/src/features/timer/hooks/useTimer.ts:66-76` |
| 7 | `api-client.ts` ante 401 hace `window.location.href = ROUTES.LOGIN` (recarga dura) → destruye un timer en curso | `frontend/src/shared/lib/api-client.ts:31` |
| 8 | Idiomas mezclados: `Header.tsx` en inglés, formularios en español | insumo de Fase 4 |

---

<a name="fase-1"></a>
## Fase 1 — Auditoría y saneamiento

**Objetivo:** dejar el repo en estado honesto y limpio: docs que reflejan la realidad, dependencias correctas, sin ciclos de import. Es la base de todas las fases posteriores.

**Dependencias:** ninguna. Es la primera fase.

**Pasos:**

1. **Actualizar `CLAUDE.md`** (raíz): eliminar "Phase 1 — solo Pomodoro", documentar las 3 técnicas, las 8 páginas, settings/presets/dashboard. Corregir la tabla de rutas: timers y dashboard son **públicos por diseño** (probar sin cuenta, guardar requiere login vía `useAuthGuardedSave.ts` + `AuthPrompt.tsx`); solo `/sessions` está protegida. Eliminar la nota "Phases 2–4 are out of scope" y la referencia a `ANTHROPIC_API_KEY`.
2. **Actualizar `PROGRESS.md`** con el estado real y enlazar a este `docs/PLAN.md`.
3. **Quitar `anthropic` de `backend/requirements.txt`** tras verificar con `grep -r "anthropic" backend/app/` que no hay imports. La integración IA de Fase 7 usará OpenRouter.
4. **Deduplicar `@types/node` en `frontend/package.json`**: dejar solo `^22.0.0` (alineado con Node 20 del CI; `^25.x` no corresponde a ningún LTS razonable). Regenerar `package-lock.json` con `npm install`.
5. **Romper el ciclo de import en `backend/app/repositories/session_repository.py`**: identificar el import circular (autorreferencia vía `app.schemas.session_schemas` / modelos) y resolver moviendo el import al `TYPE_CHECKING` block o reordenando módulos. Verificar con `python -c "import app.repositories.session_repository"` limpio.
6. **Cambiar `psycopg2==2.9.10` → `psycopg2-binary==2.9.10`** en `backend/requirements.txt`. Verificar que CI y Railway siguen verdes (mismo driver, `DATABASE_URL` no cambia).
7. **Documentar (no arreglar aún) los bugs #6 y #7** como issues/fixtures: la deriva de `useTimer.ts` y la recarga dura del 401 se arreglan en Fase 3 con test E2E rojo→verde que los reproduce primero.

**Archivos afectados:** `CLAUDE.md`, `PROGRESS.md`, `backend/requirements.txt`, `frontend/package.json`, `frontend/package-lock.json`, `backend/app/repositories/session_repository.py`.

**Criterios de aceptación:**
- [ ] `CLAUDE.md` describe el estado real (3 técnicas, rutas públicas/protegidas correctas).
- [ ] `grep -r anthropic backend/` solo devuelve 0 resultados en código.
- [ ] `npm ci && npm run typecheck && npm run build` verde sin warning de dependencia duplicada.
- [ ] `graphify`/inspección manual no reporta ciclos de import en `backend/app/`.
- [ ] CI completo verde con `psycopg2-binary`.

**Riesgos:** bajo. Cambio de driver psycopg2 → verificar en Railway que el build sigue funcionando (es exactamente el mismo paquete compilado).

---

<a name="fase-2"></a>
## Fase 2 — Rendimiento con métricas objetivo

**Objetivo:** cumplir métricas medibles de rendimiento en frontend y backend antes de añadir features nuevas.

**Dependencias:** Fase 1 (deps saneadas).

**Métricas objetivo (criterios duros):**

| Métrica | Objetivo |
|---------|----------|
| Lighthouse Performance (móvil, dashboard y `/timer/pomodoro`) | ≥ 90 |
| JS del chunk inicial | ≤ 150 KB gzip, **con recharts fuera** |
| LCP | ≤ 2.5 s |
| TTFB (API en Railway) | ≤ 300 ms |
| `GET /api/v1/sessions/` | ≤ 150 ms p95 |

**Pasos:**

1. **Medir baseline** (Lighthouse CI local + `vite build` con `rollup-plugin-visualizer`) y registrar números en el PR. Sin baseline no hay fase.
2. **Code-splitting por ruta** en `frontend/src/app/router.tsx`: `React.lazy` + `Suspense` (con `Spinner.tsx` existente) para `DashboardPage` y `SessionsPage`, que son las únicas que arrastran recharts vía `FocusChart.tsx`/`StatsGrid.tsx`. Los timers (ruta crítica) permanecen en el chunk inicial.
3. **Aislar recharts**: confirmar con el visualizer que recharts (~100KB+ gzip) queda en chunk lazy; si hace falta, `manualChunks` en `vite.config.ts`.
4. **Fuente**: verificar que `@fontsource-variable/quicksand` carga solo los pesos usados y con `font-display: swap`.
5. **Backend `/sessions` p95 ≤ 150 ms**: ya existen índices compuestos (`b3e7f2a91c04_add_composite_indexes.py`) y `selectinload` en `SessionRepository._base_query`. Optimizar el `query.count()` de `list_by_user` (línea 97) que repite los `selectinload`: hacer count sobre query sin options. Medir con `EXPLAIN ANALYZE` sobre datos sembrados (≥10k sesiones).
6. **Caching HTTP**: headers `Cache-Control` para assets estáticos (Vercel ya lo hace; verificar `vercel.json`).
7. **Lighthouse CI como job opcional** en `.github/workflows/ci.yml` (no bloqueante al inicio, informativo).

**Archivos afectados:** `frontend/src/app/router.tsx`, `frontend/vite.config.ts`, `backend/app/repositories/session_repository.py`, `.github/workflows/ci.yml`, `vercel.json`.

**Criterios de aceptación:** las 5 métricas de la tabla, medidas y documentadas (antes/después) en el PR.

**Riesgos:** `React.lazy` en páginas con guards (`useNavigationGuard`) puede alterar el orden de montaje → cubrir con los tests E2E de Fase 3. Lighthouse en CI es ruidoso → usar medianas de 3 runs.

---

<a name="fase-3"></a>
## Fase 3 — Suite E2E con Playwright (bugs rojo→verde)

**Objetivo:** introducir Playwright (hoy inexistente) y usar la metodología rojo→verde: cada bug conocido se reproduce primero con un test que falla, luego se arregla.

**Dependencias:** Fase 1 (bugs documentados). Independiente de Fase 2.

**Pasos:**

1. **Infraestructura**: `frontend/e2e/` con `playwright.config.ts` (proyectos chromium + webkit), `webServer` que levanta Vite + backend con Postgres efímero (docker-compose de test o SQLite no — usar Postgres real como en CI). Script `npm run test:e2e`.
2. **Bug #6 — deriva del timer** (`useTimer.ts`):
   - Test rojo: con `page.clock` de Playwright, arrancar un Pomodoro, simular pestaña en background/avance de reloj de 60 s y verificar que `secondsLeft` refleja el tiempo real transcurrido. Falla con la implementación actual (decremento por tick).
   - Fix: anclar a timestamp — guardar `endAtRef = Date.now() + secondsLeft*1000` al arrancar y en cada tick calcular `secondsLeft = Math.max(0, Math.round((endAt - Date.now())/1000))`. Mantener la API pública del hook intacta (`start/pause/reset/isRunning`) para no tocar `usePomodoroTimer.ts`, `useFlowtimeTimer.ts`, `useBolsaTimer.ts`. Añadir listener de `visibilitychange` para resincronizar al volver a la pestaña.
   - Unit tests en Vitest con `vi.useFakeTimers` + `vi.setSystemTime` complementando el E2E.
3. **Bug #7 — 401 con recarga dura** (`api-client.ts:31`):
   - Test rojo: timer corriendo + token inválido + petición que devuelve 401 → la página NO debe recargarse (el timer sigue contando).
   - Fix: sustituir `window.location.href` por navegación suave — emitir evento (o setear estado en `auth.store.ts`) que un componente dentro del Router consume para hacer `navigate(ROUTES.LOGIN)` solo si la ruta actual es protegida; en rutas públicas (timers) basta con `logout()` + toast (`Toast.tsx`) sin navegar.
4. **Smoke tests de los 3 timers**: pomodoro completo (focus→break con cambio de color de fondo), flowtime (work→break proporcional), bolsa (presupuesto descuenta, alerta <20%), guardado de sesión autenticado y flujo `AuthPrompt` sin autenticar, login/registro/logout, navegación con `NavigationBlockerModal`.
5. **CI**: nuevo job `e2e` en `.github/workflows/ci.yml` con servicio Postgres (reutilizar patrón del job backend), `npx playwright install --with-deps chromium`, artefactos de trace en fallo.

**Archivos afectados:** `frontend/e2e/**` (nuevo), `frontend/playwright.config.ts` (nuevo), `frontend/src/features/timer/hooks/useTimer.ts`, `frontend/src/shared/lib/api-client.ts`, `frontend/src/features/auth/store/auth.store.ts`, `frontend/package.json`, `.github/workflows/ci.yml`.

**Criterios de aceptación:**
- [x] Ambos tests de bug existen en un commit en rojo y pasan a verde con el fix (verificable en historial). *(Bug #6: commits `66d0d36`→`fc8cc02`. Bug #7: test + fix de `api-client.ts`; rojo→verde verificado localmente revirtiendo el fix.)*
- [x] Un Pomodoro de 25 min en pestaña de fondo termina a la hora correcta (±1 s). *(`e2e/bugs/timer-drift.spec.ts` + `useTimer.test.ts`.)*
- [x] Un 401 durante timer activo no recarga la página ni resetea el timer. *(`e2e/bugs/auth-401-hard-reload.spec.ts`.)*
- [x] Suite E2E verde en CI en <10 min. *(Job `e2e` en `ci.yml`; 11 tests pasan en ~6 s en chromium local. Pendiente: primera ejecución real en CI con webkit.)*

**Riesgos:** flakiness de E2E con timers → usar `page.clock` (Playwright ≥1.45), nunca `waitForTimeout`. El fix de `useTimer` toca el corazón de las 3 técnicas → la API del hook no cambia y los 3 smoke tests lo cubren.

---

<a name="fase-4"></a>
## Fase 4 — Internacionalización (react-i18next)

**Objetivo:** eliminar la mezcla de idiomas (Header en inglés, formularios en español) con es/en completos y selector persistente.

**Dependencias:** Fase 3 recomendada (los E2E protegen contra regresiones al tocar todos los textos). **En el plan revisado se ejecuta después del demo**, por lo que su alcance incluye también los textos nuevos introducidos en la Fase 5 (que se adelantó y se escribió con la convención actual).

**Pasos:**

1. Instalar `react-i18next` + `i18next` + `i18next-browser-languagedetector`. Inicializar en `frontend/src/app/providers.tsx`.
2. Estructura de recursos: `frontend/src/shared/i18n/{es,en}/{common,timer,auth,sessions,settings}.json` — namespaces alineados con las features FSD.
3. Extracción de strings, por orden: `shared/components/layout/Header.tsx` (hoy en inglés), formularios de auth (`LoginForm.tsx`, `RegisterForm.tsx` — hoy en español, incluidos mensajes Zod vía `z.string().min(8, t('auth.passwordMin'))` o mapa de errores), paneles de config (`PomodoroConfigPanel.tsx`, `FlowtimeConfig.tsx`, `BolsaConfigPanel.tsx`), sessions (`SessionCard.tsx` con `TECHNIQUE_LABELS`, `StatsGrid.tsx`, `IntervalFilter.tsx`), settings, toasts y modales (`NavigationBlockerModal.tsx`, `AuthPrompt.tsx`).
4. Selector de idioma en `SettingsPage.tsx` (junto a `ThemeToggle`), persistido en `localStorage` (`i18nextLng` vía languageDetector). Idioma por defecto: detección de navegador con fallback `es`.
5. Fechas y duraciones: `Intl.DateTimeFormat`/`Intl.NumberFormat` con el locale activo en `SessionCard.tsx` y `features/timer/utils/time.utils.ts`.
6. Errores del backend: el backend devuelve `detail` legible; mapear códigos conocidos a claves i18n en el frontend (no internacionalizar el backend en esta fase).
7. Test E2E: cambiar idioma → Header y un formulario cambian, persiste tras recarga.

**Archivos afectados:** `frontend/src/shared/i18n/**` (nuevo), `providers.tsx`, `Header.tsx`, todos los componentes con strings, `SettingsPage.tsx`.

**Criterios de aceptación:**
- [ ] Cero strings hardcodeados visibles en es y en (auditoría manual de las 8 páginas).
- [ ] Selector persiste en localStorage y sobrevive recarga.
- [ ] Mensajes de validación Zod traducidos.
- [ ] E2E de cambio de idioma verde.

**Riesgos:** fase ancha pero mecánica; hacer por namespaces/PRs pequeños. Riesgo de regresión visual por longitudes de texto distintas → revisar botones glass del timer.

---

<a name="fase-5"></a>
## Fase 5 — Backlog UX priorizado

**Objetivo:** pulir la experiencia con un backlog explícito P0/P1/P2; cada ítem es independiente y mergeable.

**Dependencias:** Fase 3 (red de seguridad E2E al tocar los hooks de sesión y el timer). **Se adelanta antes de la Fase 4** (dependencia invertida respecto al plan original): los textos nuevos se escriben con la convención actual y la Fase 4 los internacionaliza después en su barrido. Es la fase de pulido previa a publicar el demo en AWS (Fase 8).

**P0 (esencial):**
1. **Título de pestaña dinámico**: `document.title = "24:31 — Focus"` durante sesión activa (hook en `features/timer/`), restaurar al salir. Crítico para "bring your own tab" de Fase 6.
2. **Notificación del navegador al terminar fase** (Notification API con permiso pedido en contexto, fallback al sonido existente de `useSound.ts`).
3. **Estados vacíos**: Dashboard y `/sessions` sin datos deben guiar (CTA a empezar un timer), no mostrar gráficas vacías de recharts.
4. **Accesibilidad básica de los timers**: `aria-live="polite"` en `TimerDisplay.tsx` (anuncios por minuto, no por segundo), foco visible en botones glass, contraste verificado sobre los fondos `brand-*`.

**P1 (importante):**
5. **Atajos de teclado**: espacio = start/pause, R = reset, con hint visual; deshabilitados cuando el foco está en un input.
6. **Recuperación de sesión tras cierre accidental**: persistir estado mínimo del timer en `localStorage` (técnica, `endAt`, fase) y ofrecer "Continuar sesión" al volver — apoyado en el `endAt` anclado a `Date.now()` de Fase 3.
7. **Mood rating post-sesión**: el campo `mood_rating` ya existe en el modelo; añadir prompt opcional de 1–5 al guardar sesión en `usePomodoroSession.ts` y equivalentes.
8. **Filtro por proyecto en `/sessions`**: el backend ya soporta `?project=` (`SessionRepository.list_by_user`); exponerlo en `IntervalFilter.tsx`/`SessionsPage.tsx`.

**P2 (deseable):**
9. Vista de racha/heatmap semanal en Dashboard (datos ya existen: `day_of_week`, `hour_of_day`).
10. Exportar sesiones a CSV desde `/sessions` (frontend-only con los datos paginados, o endpoint dedicado).
11. Animaciones de transición de fase refinadas (la firma visual de 800 ms ya existe; pulir reduced-motion con `prefers-reduced-motion`).

**Archivos afectados:** `features/timer/`, `shared/hooks/`, `pages/DashboardPage.tsx`, `pages/SessionsPage.tsx`, hooks de sesión de las 3 técnicas, `features/sessions/components/`.

**Criterios de aceptación:** todos los P0 entregados con tests (unit o E2E); P1 al menos 6 y 7 (aprovechan el modelo de datos existente y alimentan la Fase 7); P2 según tiempo.

**Riesgos:** scope creep — cada ítem es un PR independiente; si un P2 crece, se corta.

---

<a name="fase-6"></a>
## Fase 6 — Música de ambiente (pistas propias Suno en S3/CloudFront)

**Objetivo:** acompañamiento musical para sesiones de foco con una librería propia de pistas lo-fi/jazz/soul generadas con IA (Suno), servidas desde S3 + CloudFront. Cubre al 100% de los usuarios, **sin credenciales, sin OAuth, sin APIs de terceros, sin condición de parada**.

**Dependencias:** Fase 5 P0-1 (título de pestaña) y Fase 8 (migración AWS). **En el plan revisado se ejecuta después del demo**: el bucket S3 + CloudFront del audio se crean dentro de la misma cuenta/región ya migrada en la Fase 8, evitando infraestructura duplicada. (Si por algún motivo se necesitara antes, técnicamente un bucket S3 + CloudFront independientes bastan, pero el orden revisado lo posterga tras la migración.)

**Decisión de arquitectura (cerrada tras pressure-test del consejo + ajuste del dueño):**

- **Librería propia generada con Suno.** 15–30 pistas de lo-fi/jazz/soul en loop, generadas con **Suno** bajo plan de pago (licencia comercial). Se descarta servir música personal del usuario.
- **Hosting: S3 + CloudFront.** Las pistas viven en un bucket S3 (`focus-timers-audio/`) y se sirven vía CloudFront con `Cache-Control` largo. El navegador cachea la pista y la repite en loop desde memoria → egress mínimo.
- **DESCARTADO — Spotify Web Playback SDK:** requería OAuth + cuenta Premium del usuario + registro de app; era la única condición de parada de esta fase y se elimina.
- **DESCARTADO — YouTube IFrame API:** obliga a player visible + anuncios (contradice una app de foco) y su ToS probablemente prohíbe uso audio-only/background.
- **DESCARTADO — Apple MusicKit:** requiere cuenta de developer de $99/año.

**Costos (ver detalle en este plan):**

| Concepto | Costo |
|---|---|
| Suno (generar la librería) | **~$10 one-time** (1 mes Pro con licencia comercial, luego cancelar) |
| S3 storage (~0.2 GB) | **$0** (Free Tier 5 GB; ~$0.01/mes después) |
| Egress vía CloudFront | **$0** (1 TB/mes always-free, no expira a 12 meses) |
| **Total recurrente** | **≈ $0/mes** |

> ⚠️ Al generar con Suno, usar plan de pago (otorga **uso comercial**) y revisar sus ToS. El copyright de música 100% generada por IA es ambiguo, pero la licencia comercial de Suno habilita servirla en la app.

**Pasos:**

1. **Generar la librería con Suno**: 15–30 pistas lo-fi/jazz/soul pensadas para loop (intros/outros suaves para crossfade), exportar y optimizar a OGG/AAC (~1–2 MB por pista en loop de 3–5 min).
2. **Hosting**: subir a bucket S3 `focus-timers-audio/` (`aws s3 sync`), servir vía CloudFront con `Cache-Control: public, max-age=31536000, immutable`. Un manifest JSON (`tracks.json`) lista las pistas y metadatos (título, género, URL).
3. **Reproductor propio**: `features/music/` nueva (FSD): `useAmbientPlayer.ts` (HTMLAudioElement en loop, volumen, crossfade simple entre pistas), `AmbientPlayer.tsx` (selector de pista por género + volumen, estilo glass). Cargar el audio bajo demanda (no en chunk inicial — coherente con Fase 2); las pistas se streamean desde CloudFront, no se empaquetan en el bundle.
4. **Integración en páginas de timer**: control compacto en `PomodoroPage.tsx`, `FlowtimePage.tsx`, `BolsaPage.tsx`; persistir pista/género/volumen en localStorage; bajar volumen automáticamente al sonar la alarma de `useSound.ts`.

**Archivos afectados:** `frontend/src/features/music/**` (nuevo), páginas de timers, `shared/hooks/useSound.ts` (coordinación de volumen), bucket S3 `focus-timers-audio` + CloudFront (infra), `tracks.json` (manifest).

**Criterios de aceptación:**
- [ ] Usuario puede elegir y reproducir una pista lo-fi/jazz/soul en loop durante una sesión, sin cuenta de nada.
- [ ] El audio se sirve desde CloudFront (no del bundle JS) y no rompe los presupuestos de Fase 2.
- [ ] Pista, género y volumen persisten entre sesiones.
- [ ] `Cache-Control` largo verificado (la pista se descarga una vez y loopea desde caché).

**Riesgos (sin condición de parada):**
- Licencia/ToS de Suno: usar plan de pago para uso comercial; documentar la procedencia de las pistas.
- Autoplay policies de navegadores: la reproducción siempre se inicia por gesto del usuario.
- Si el bucket de audio se crea antes de la Fase 8, mantenerlo coherente con la cuenta/región que se use luego en la migración.

---

<a name="fase-7"></a>
## Fase 7 — Sugerencia de timers con IA (dos capas, determinista-first)

**Objetivo:** sugerir configuración de timer ({technique, work_minutes, break_minutes} + rationale) a partir del historial real del usuario. **Principio rector: determinista por defecto, IA como mejora encendible. El sistema funciona al 100% sin IA; la IA nunca decide los minutos, solo redacta el rationale.**

**Dependencias:** Fase 1 (anthropic eliminado, ciclo de imports resuelto). Se beneficia de Fase 5 (mood_rating, más datos). Independiente de Fases 2–4 y 6.

### Capa 1 (SIEMPRE activa) — Motor heurístico

1. **`backend/app/repositories/feature_repository.py`** (nuevo): queries SQL agregadas, estilo idéntico a `SessionRepository.get_raw_stats_by_user` (GROUP BY en BD, **nunca** cargar filas crudas):
   - Buckets de duración × tasa de finalización: `width_bucket(total_work_seconds, ...)` + `GROUP BY` → en qué rango de minutos el usuario completa más.
   - Hora óptima: tasa de finalización por `hour_of_day`.
   - Interrupciones medias por sesión (longitud del JSON `interruptions`).
   - Duración media y técnica preferida por `project`.
2. **`backend/app/services/ai/heuristic_service.py`** (nuevo, paquete `services/ai/`): ~40 líneas de reglas if/else que mapean features → `{technique, work_minutes, break_minutes}` + rationale por **plantilla** (ej.: *"Completas el 82% de tus tareas de '{project}' en bloques de {work} min"*). Redondeo a múltiplos de 5 min.
3. **Cold start (<5 sesiones):** default 25/5 pomodoro con plantilla de bienvenida.
4. Esta capa sola ya es una feature completa, enviable y medible: <50 ms, $0, testeable con datos sembrados, sin lock-in. Encaja con el background de datos del autor (feature engineering SQL/Python — luce más en portfolio que una llamada a API).

### Capa 2 (OPCIONAL, detrás de flag) — Realce IA

5. **Config** (`backend/app/core/config.py`): `AI_RATIONALE_ENABLED: bool = False` + `OPENROUTER_API_KEY: str | None` — fail-fast en startup **solo si el flag es true** y falta la clave (coherente con el principio existente de fail-fast).
6. **`backend/app/services/ai/rationale_service.py`** (nuevo): recibe el `Suggestion` **ya calculado** por la Capa 1 + features agregadas y **anónimas**, y pide al LLM SOLO reescribir el rationale en lenguaje cálido. El JSON con los números está cerrado antes de la llamada; el LLM no lo toca.
7. **Proveedor: OpenRouter** (una API, multi-lab, cero lock-in). Modelo inicial: `google/gemini-flash` u `openai/gpt-4o-mini` (~$0.15/1M input), intercambiable cambiando una línea. **NO self-hostear** (Ollama/vLLM no caben en una instancia de 1 GB). Llamada HTTP directa con httpx (ya en deps de test; añadir a runtime) — sin SDK propietario.
8. **Defensas:** caché por hash de features (mismo input agregado → misma respuesta, gasto tiende a $0); timeout 2 s; fallback a la plantilla de Capa 1 si: flag off, API falla, timeout, o usuario sin historial. **Nunca** enviar `task_name` crudo ni historial completo — solo agregados.

### Endpoint y frontend

9. **`POST /api/v1/ai/suggest-timer`** (`backend/app/routers/ai.py`, nuevo): JWT (`Depends(get_current_user)`) + rate-limit slowapi. El router llama SIEMPRE a Capa 1; Capa 2 solo si flag. Respuesta: `{technique, work_minutes, break_minutes, rationale, source: "heuristic" | "ai"}`. Schemas en `backend/app/schemas/ai_schemas.py`.
10. **Frontend:** botón "Sugerir" en `PomodoroConfigPanel.tsx`, `FlowtimeConfig.tsx`, `BolsaConfigPanel.tsx` (solo si autenticado); hook `useSuggestTimer.ts` (mutation TanStack Query) en `frontend/src/features/timer/` o feature `ai/` propia; al aceptar, precarga la config del timer; mostrar rationale en card glass.

### Evaluación (punto ciego cazado por el council)

11. **Migración Alembic nueva — tabla `ai_suggestions`:** `id, user_id (FK), features_snapshot (JSON), suggestion (JSON), source, accepted (BOOLEAN NULL), created_at`. Registrar cada sugerencia servida; endpoint `PATCH /api/v1/ai/suggestions/{id}` (o campo en la creación de sesión) para marcar si el usuario acepta/edita/ignora → métrica de adopción honesta sin depender de IA.
12. **Backtest offline** (script `backend/scripts/backtest_suggestions.py`): ¿la duración sugerida por la heurística predice las sesiones que después se completan? Corre contra el histórico, sin tokens.

**Archivos afectados:** `backend/app/repositories/feature_repository.py`, `backend/app/services/ai/{__init__,heuristic_service,rationale_service}.py`, `backend/app/routers/ai.py`, `backend/app/schemas/ai_schemas.py`, `backend/app/core/config.py`, `backend/app/main.py` (registrar router), migración nueva en `backend/migrations/versions/`, `backend/requirements.txt` (+httpx), `backend/scripts/backtest_suggestions.py`, frontend: paneles de config + `useSuggestTimer.ts`.

**Criterios de aceptación:**
- [ ] Endpoint devuelve sugerencia válida con `AI_RATIONALE_ENABLED=false` (solo heurística) — sin clave de API en el entorno.
- [ ] Con flag true y API de OpenRouter caída/timeout → fallback transparente a plantilla, `source: "heuristic"`.
- [ ] Test que verifica que la IA **nunca** altera `work_minutes`/`break_minutes`/`technique` (compara Suggestion pre y post Capa 2).
- [ ] Features SQL verificadas con datos sembrados (fixture de ≥30 sesiones con patrones conocidos).
- [ ] `ai_suggestions.accepted` actualizable desde el frontend.
- [ ] Backtest implementado y ejecutable offline.
- [ ] Tests de Capa 2 con LLM mockeado (sin tokens en CI).

**Riesgos / CONDICIÓN DE PARADA (a):**
- **⛔ `OPENROUTER_API_KEY` solo es necesaria para la Capa 2. Toda la Capa 1 + endpoint + evaluación + tests (con LLM mockeado) se implementan y entregan SIN la clave.** La Capa 2 queda lista para encender con flag + clave cuando el usuario decida.
- Heurística mala con pocos datos → cold start explícito y umbral de 5 sesiones.
- Coste IA → caché por hash + modelo barato + rate-limit; presupuesto esperado ≈ $0.

---

<a name="fase-8"></a>
## Fase 8 — Migración a AWS Free Tier

**Objetivo:** migrar de Vercel/Railway/Supabase a AWS Free Tier como ejercicio de portfolio de infraestructura, manteniendo paridad funcional y sin downtime de datos.

**Dependencias:** Fases 1–3 (CI verde + E2E como red de seguridad de la migración) y **Fase 5** (UI pulida para el demo). **En el plan revisado es el hito para publicar el demo**; tras él vienen las Fases 4 (i18n), 6 (música) y 7 (IA).

**Arquitectura objetivo (Free Tier):**

| Componente | Servicio AWS | Notas |
|------------|--------------|-------|
| Frontend | S3 (estático) + CloudFront | invalidación en deploy; HTTPS con ACM |
| Backend | EC2 t3.micro | uvicorn detrás de nginx o Caddy; systemd |
| BD | RDS PostgreSQL db.t3.micro | migrar con `pg_dump`/`pg_restore` desde Supabase |
| Secretos | SSM Parameter Store (SecureString) | `DATABASE_URL`, `JWT_SECRET_KEY`, `OPENROUTER_API_KEY` |
| CI/CD | GitHub Actions + IAM OIDC | sin claves de larga duración en GitHub; roles asumibles |

**Análisis honesto — qué del background de datos del autor aplica y qué es sobre-ingeniería:**

- **Aplica:** diseño de esquemas e índices (ya hecho en las migraciones), SQL de agregación (Fase 7), `pg_dump`/`pg_restore`, dimensionar RDS, IAM/OIDC, observabilidad básica con CloudWatch.
- **Sobre-ingeniería para esta app (NO incluir):** Redshift, Glue, Athena, Spark/EMR. Una app con miles de filas no necesita un data warehouse; presumir de saber **no** usarlos es la señal senior. Las analíticas se sirven con GROUP BY en Postgres, como ya hace `get_raw_stats_by_user`.

**Pasos:**

1. IaC mínima (Terraform u OpenTofu en `infra/`): VPC simple, EC2, RDS, S3, CloudFront, parámetros SSM, roles IAM con OIDC para GitHub Actions.
2. Pipeline de deploy: jobs nuevos en `.github/workflows/` — build frontend → sync S3 + invalidación CloudFront; deploy backend vía SSM Run Command o pull en EC2.
3. Migración de datos: `pg_dump` desde Supabase → `pg_restore` en RDS, ventana de solo-lectura corta, verificación con counts por tabla.
4. Ajustes app: CORS a la URL de CloudFront, `VITE_API_URL` nuevo, healthcheck `/health` ya existente para el monitor.
5. Ejecutar la suite E2E de Fase 3 contra el entorno AWS antes del cambio de DNS.
6. Presupuesto y alarmas: AWS Budget de $5 con alerta, CloudWatch alarm de CPU/disco en EC2 y RDS.
7. Decom: apagar Railway; mantener Vercel/Supabase en frío 2 semanas como rollback.

**Archivos afectados:** `infra/**` (nuevo), `.github/workflows/**`, `backend/app/core/config.py` (CORS/entorno), `vercel.json` (eliminación final), docs.

**Criterios de aceptación:**
- [ ] App completa servida desde CloudFront + EC2 + RDS con la suite E2E verde.
- [ ] Cero secretos en GitHub (todo OIDC + SSM).
- [ ] Coste mensual proyectado dentro de Free Tier, con alarma de presupuesto activa.
- [ ] Datos migrados con verificación de integridad (counts + spot checks).
- [ ] Documento de arquitectura que justifica explícitamente lo que NO se usó (Redshift/Glue/Athena/Spark) y por qué.

**Riesgos / CONDICIÓN DE PARADA (b):**
- **✅ Decisión de migrar tomada (2026-06-21):** esta fase es ahora un objetivo activo (publicar el demo). El único prerequisito operativo pendiente es disponer de la **cuenta AWS activa**; con ella, la fase arranca tras completar las Fases 3 y 5.
- t3.micro de 1 GB es justo → swap configurado, y refuerza la decisión de Fase 7 de no self-hostear LLMs.
- Free Tier expira a los 12 meses → documentar coste post-free-tier (~$25–30/mes) para decisión informada.

---

## Resumen ejecutivo de secuenciación (revisado 2026-06-21)

```
Fase 1 (Saneamiento) ✅ ──► Fase 2 (Rendimiento) ✅
        │
        ▼
Fase 3 (Playwright E2E) ──► Fase 5 (Backlog UX) ──► Fase 8 (AWS · PUBLICAR DEMO)
   [red de seguridad]         [pulido del demo]              │
                                                             ▼
                                  ┌──────────────────┬───────┴───────────┐
                                  ▼                  ▼                    ▼
                            Fase 4 (i18n)      Fase 6 (Música)     Fase 7 (IA 2 capas)
                         [barre también los  [reutiliza S3/        [Capa 1 sin bloqueos;
                          textos de Fase 5]   CloudFront de AWS]    ⛔ Capa 2: OPENROUTER_API_KEY]
```

- **Camino crítico revisado:** 3 → 5 → 8. Objetivo: **publicar el demo en AWS**. Las Fases 1 y 2 ya están entregadas.
- **Post-demo (paralelizables tras la Fase 8):** 4 (i18n), 6 (música) y 7 (IA Capa 1). La Fase 4 absorbe los textos nuevos que la Fase 5 dejó sin internacionalizar.
- **Cada fase sigue siendo mergeable de forma independiente**; dentro de cada fase, cada paso es un PR pequeño.
- **Condiciones de parada:** OpenRouter (solo Capa 2 de la Fase 7) sigue sin bloquear nada. La decisión AWS de la Fase 8 **ya está tomada**; resta solo el prerequisito operativo de la cuenta activa. La Fase 6 no tiene condición de parada (se descartó Spotify).
