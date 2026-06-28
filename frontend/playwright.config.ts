import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración E2E de Focus Timers (Fase 3).
 *
 * `webServer` levanta el stack completo igual que en CI:
 *   1. Backend FastAPI (uvicorn) en :8080, contra un Postgres 15 real
 *      (mismas credenciales que el job de CI). Antes de arrancar aplica
 *      las migraciones de Alembic.
 *   2. Frontend Vite en :3000, que proxea `/api` → :8080.
 *
 * Los tests de timers usan `page.clock` (Playwright ≥1.45) para falsear el
 * reloj del navegador y nunca `waitForTimeout`, evitando flakiness.
 */

const FRONTEND_PORT = 3000;
const BACKEND_PORT = 8080;

// Credenciales del Postgres efímero (idénticas al servicio `postgres` del CI).
// En local se levanta con `docker compose -f docker-compose.e2e.yml up -d`.
const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql+psycopg2://focus:focus@localhost:5432/focus_test";

const backendEnv = {
  DATABASE_URL,
  JWT_SECRET_KEY:
    "e2e-secret-key-64-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  JWT_ALGORITHM: "HS256",
  JWT_EXPIRE_MINUTES: "10080",
  FRONTEND_URL: `http://localhost:${FRONTEND_PORT}`,
  ENVIRONMENT: "test",
};

export default defineConfig({
  testDir: "./e2e",
  // Falla si alguien deja un `test.only` olvidado en CI.
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",

  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    // Traza solo en el primer reintento → artefacto de depuración en CI sin coste en verde.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  // Dos servidores: backend (con migraciones) y frontend. Playwright espera a que
  // ambas URLs respondan antes de lanzar los tests.
  webServer: [
    {
      command: "alembic upgrade head && uvicorn app.main:app --port 8080",
      cwd: "../backend",
      url: `http://localhost:${BACKEND_PORT}/health`,
      env: backendEnv,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "npm run dev",
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
