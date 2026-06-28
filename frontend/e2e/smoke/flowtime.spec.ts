import { test, expect } from "@playwright/test";

/**
 * Smoke de Flowtime (Fase 3, paso 4).
 *
 * Flowtime cuenta el foco hacia arriba; al pedir un descanso el sistema concede
 * un break proporcional al tiempo trabajado. Los timers de Flowtime acumulan por
 * tick (`prev + 1`), así que aquí se usa `page.clock.runFor` (dispara cada tick),
 * no `fastForward` (que simula el throttling de fondo disparando una sola vez).
 */
test.describe("Smoke — Flowtime", () => {
  test("el foco cuenta hacia arriba y concede un descanso proporcional", async ({ page }) => {
    await page.clock.install();
    await page.goto("/timer/flowtime");

    // (No usamos el texto "Flowtime": colisiona con el enlace del header.)
    await expect(page.getByRole("button", { name: "Start focus" })).toBeVisible();

    await page.getByRole("button", { name: "Start focus" }).click();
    await expect(page.getByText("Focusing")).toBeVisible();

    // Tras un instante de foco el "Break earned" debe dejar de ser 00:00.
    await page.clock.runFor(5 * 60 * 1000); // 5 min de foco (runFor dispara los 300 ticks)
    await expect(page.getByText(/Break earned:/)).toBeVisible();

    // Pedir el descanso: el sistema cambia a fase break (break proporcional > 0).
    await page.getByRole("button", { name: "Take a break" }).click();
    await expect(page.getByText("On break")).toBeVisible();
    // Que exista "Back to work" confirma que el descanso fue concedido.
    await expect(page.getByRole("button", { name: "Back to work" })).toBeVisible();

    // Volver al trabajo cierra el descanso.
    await page.getByRole("button", { name: "Back to work" }).click();
    await expect(page.getByText("Focusing")).toBeVisible();
  });
});
