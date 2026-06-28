import { test, expect } from "@playwright/test";

/**
 * Smoke del flujo "guardar sin cuenta" (Fase 3, paso 4).
 *
 * Los timers son públicos: cualquiera puede correr una sesión, pero guardarla
 * exige login. Al intentar guardar sin sesión iniciada debe aparecer `AuthPrompt`
 * en vez de llamar a la API.
 */
test.describe("Smoke — AuthPrompt (guardar sin cuenta)", () => {
  test("terminar una sesión sin autenticar ofrece iniciar sesión", async ({ page }) => {
    await page.clock.install();
    await page.goto("/timer/pomodoro");

    await page.getByRole("button", { name: "Start" }).click();
    await page.clock.fastForward(60_000); // algo de foco acumulado

    // Save & exit (la sesión no está completa) → modal de confirmación.
    await page.getByRole("button", { name: "Save & exit" }).click();
    await expect(page.getByText("Complete your pomodoros?")).toBeVisible();
    await page.getByRole("button", { name: "Save anyway" }).click();

    // Sin cuenta: en vez de guardar, aparece el prompt de login. Lo identificamos
    // por su copy única ("Log in to save your progress") para no chocar con los
    // enlaces "Sign up"/"Login" del header.
    await expect(page.getByText("Session complete!")).toBeVisible();
    await expect(
      page.getByText("Log in to save your progress and view your history."),
    ).toBeVisible();
  });
});
