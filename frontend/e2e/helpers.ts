import type { Page } from "@playwright/test";

/** "24:31" → 1471 segundos. */
export function toSeconds(mmss: string): number {
  const [m, s] = mmss.trim().split(":").map(Number);
  return m * 60 + s;
}

/** 1471 → "24:31". */
export function toMMSS(total: number): string {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Registra un usuario nuevo vía la UI y deja la sesión iniciada (redirige al
 * dashboard). El email es único por ejecución para no chocar con el unique
 * constraint del backend entre reintentos/proyectos (chromium + webkit).
 */
export async function registerNewUser(
  page: Page,
): Promise<{ name: string; email: string; password: string }> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  // `@example.com`, no `.test`: el validador de email del backend rechaza los TLD
  // de uso especial reservado (.test, .example, .invalid, .localhost).
  const creds = {
    name: "E2E Tester",
    email: `e2e-${unique}@example.com`,
    password: "focus-pass-1",
  };

  await page.goto("/register");
  await page.getByLabel("Name").fill(creds.name);
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: "Create account" }).click();

  // Tras registrarse el formulario navega al dashboard (pathname "/").
  await page.waitForURL((url) => url.pathname === "/");
  return creds;
}
