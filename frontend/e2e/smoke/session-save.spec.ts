import { test, expect } from "@playwright/test";
import { registerNewUser } from "../helpers";

/**
 * Smoke del guardado autenticado (Fase 3, paso 4).
 *
 * Con sesión iniciada, terminar un Pomodoro debe persistir la sesión vía
 * `POST /api/v1/sessions/` (201) y aparecer luego en el historial.
 */
test.describe("Smoke — guardado de sesión autenticado", () => {
  test("un usuario autenticado guarda un Pomodoro y lo ve en /sessions", async ({ page }) => {
    await page.clock.install();
    await registerNewUser(page);

    await page.goto("/timer/pomodoro");
    await page.getByRole("button", { name: "Start" }).click();
    await page.clock.fastForward(60_000);

    await page.getByRole("button", { name: "Save & exit" }).click();
    await expect(page.getByText("Complete your pomodoros?")).toBeVisible();

    // El guardado dispara el POST: esperamos el 201 como prueba directa.
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/v1/sessions") && r.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Save anyway" }).click(),
    ]);
    expect(response.status()).toBe(201);

    // Sin AuthPrompt: la sesión se guardó de verdad.
    await expect(page.getByText("Session complete!")).toBeHidden();

    // El historial ya no está vacío.
    await page.goto("/sessions");
    await expect(page.getByText(/Pomodoro/).first()).toBeVisible();
  });
});
