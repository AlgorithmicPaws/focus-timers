import { test, expect } from "@playwright/test";

/**
 * Smoke de infraestructura (Fase 3, paso 1).
 *
 * No prueba ninguna funcionalidad concreta: solo verifica que el `webServer`
 * de Playwright (backend + Vite) arranca y que la SPA monta en la home pública.
 * Los smoke tests de las tres técnicas llegan en el paso 4.
 */
test("la home pública carga y la SPA monta", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Focus Timers/);
  await expect(page.getByRole("link", { name: "Focus Timers home" })).toBeVisible();
});
