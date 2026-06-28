import { test, expect } from "@playwright/test";
import { toSeconds } from "../helpers";

/**
 * Smoke de Bolsa de Tiempo (Fase 3, paso 4).
 *
 * Dos contadores simultáneos: el bloque de trabajo cuenta hacia abajo mientras se
 * trabaja; el presupuesto solo se descuenta durante las pausas. Igual que Flowtime,
 * los timers acumulan por tick → se usa `runFor` (dispara cada tick).
 */
test.describe("Smoke — Bolsa de Tiempo", () => {
  test("el bloque descuenta al trabajar y el presupuesto descuenta en pausa", async ({ page }) => {
    await page.clock.install();
    await page.goto("/timer/bolsa");

    // (No usamos el texto "Time Budget": colisiona con el enlace del header.)
    await expect(page.getByRole("button", { name: "Start block" })).toBeVisible();

    const block = page.getByText(/^\d{1,2}:\d{2}$/).first();
    const blockStart = toSeconds((await block.textContent()) ?? "0:00");
    expect(blockStart).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Start block" }).click();
    await expect(page.getByText("Working")).toBeVisible();

    // 10 s de trabajo: el bloque debe haber descontado.
    await page.clock.runFor(10_000);
    const blockAfterWork = toSeconds((await block.textContent()) ?? "0:00");
    expect(blockAfterWork).toBeLessThan(blockStart);

    // Tomar una pausa: ahora el presupuesto (no el bloque) es el que descuenta.
    await page.getByRole("button", { name: "Take a break" }).click();
    await expect(page.getByText("On break")).toBeVisible();

    const budget = page.getByText(/^\d{1,2}:\d{2}$/).first();
    const budgetStart = toSeconds((await budget.textContent()) ?? "0:00");
    await page.clock.runFor(10_000);
    const budgetAfter = toSeconds((await budget.textContent()) ?? "0:00");
    expect(budgetAfter).toBeLessThan(budgetStart);
  });
});
