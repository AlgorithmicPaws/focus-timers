# Suite E2E — Playwright (Fase 3)

Tests end-to-end que recorren la app como un usuario real, en Chromium y WebKit.
La metodología de la fase es **rojo→verde**: cada bug conocido se reproduce
primero con un test que falla y luego se arregla.

## Requisitos previos

1. **Postgres 15 efímero** (mismas credenciales que el CI):

   ```bash
   docker compose -f ../../docker-compose.e2e.yml up -d
   ```

2. **Dependencias del backend** instaladas y disponibles en el `PATH`
   (activa el venv antes de lanzar los tests, o instala los `requirements`):

   ```bash
   cd ../../backend && source .venv/bin/activate
   ```

   Playwright arranca `alembic upgrade head && uvicorn app.main:app --port 8080`
   automáticamente; necesita que `alembic` y `uvicorn` estén accesibles.

3. **Navegadores de Playwright** (la primera vez):

   ```bash
   npx playwright install --with-deps chromium webkit
   ```

## Ejecutar

```bash
npm run test:e2e            # toda la suite (chromium + webkit)
npm run test:e2e -- --project=chromium   # solo un navegador
npm run test:e2e:ui        # modo UI interactivo
npm run test:e2e:report    # abre el último informe HTML
```

Playwright levanta backend (:8080) y frontend (:3000) por su cuenta vía
`webServer`; en local reutiliza servidores ya en marcha si los hay.

## Estructura

```
e2e/
├── smoke/        # flujos felices de las 3 técnicas + auth
├── bugs/         # tests rojo→verde de bugs conocidos (#6 deriva, #7 401)
└── README.md
```

## Convenciones

- **Nunca `waitForTimeout`** con timers → usar `page.clock` (Playwright ≥1.45)
  para falsear el reloj y evitar flakiness.
- `baseURL` es `http://localhost:3000`; usar rutas relativas (`page.goto("/")`).
