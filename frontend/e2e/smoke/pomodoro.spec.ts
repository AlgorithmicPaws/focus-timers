import { test, expect } from "@playwright/test";
import { toSeconds } from "../helpers";

/**
 * Smoke del Pomodoro (Fase 3, paso 4).
 *
 * Verifica el ciclo focus → short break: al agotar el bloque de foco el timer
 * cambia de fase (la etiqueta pasa de "Focus" a "Short break"). Usa `page.clock`
 * para avanzar el reloj sin `waitForTimeout` (evita flakiness con timers).
 */
test.describe("Smoke — Pomodoro", () => {
  test("un bloque de foco transiciona a short break al llegar a 0", async ({ page }) => {
    await page.clock.install();
    await page.goto("/timer/pomodoro");

    await expect(page.getByText("Ready to start")).toBeVisible();

    const display = page.getByTestId("timer-display");
    const focusSec = toSeconds((await display.textContent()) ?? "");
    expect(focusSec).toBeGreaterThan(120); // 25:00 por defecto

    await page.getByRole("button", { name: "Start" }).click();
    // `exact` evita colisionar con la marca "Focus Timers" del header.
    await expect(page.getByText("Focus", { exact: true })).toBeVisible();

    // Agotar el bloque de foco completo de una vez.
    await page.clock.fastForward(focusSec * 1000);

    // El timer cambia de fase: ahora estamos en el descanso corto.
    await expect(page.getByText("Short break")).toBeVisible();
  });
});
