import { test, expect } from "@playwright/test";

/**
 * Bug #6 — deriva del timer en pestaña en background (`useTimer.ts`).
 *
 * La implementación actual cuenta con `setInterval(1000)` decrementando estado.
 * Cuando el navegador congela la pestaña (segundo plano / portátil cerrado) los
 * timers se throttlean y, al volver, solo se entrega un disparo: el contador se
 * atrasa respecto al tiempo real.
 *
 * Test ROJO: con `page.clock` falseamos el reloj y `fastForward` reproduce
 * exactamente ese escenario (salto en el tiempo, timers disparados una sola vez).
 * Falla con la implementación por tick; pasa a verde cuando `useTimer` se ancla
 * a `Date.now()`.
 */

function toSeconds(mmss: string): number {
  const [m, s] = mmss.trim().split(":").map(Number);
  return m * 60 + s;
}

function toMMSS(total: number): string {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

test.describe("Bug #6 — deriva del timer en background", () => {
  test("un Pomodoro en segundo plano refleja el tiempo real transcurrido", async ({ page }) => {
    // Instalar el reloj falso ANTES de cargar la app: el fix lee `Date.now()`.
    await page.clock.install();
    await page.goto("/timer/pomodoro");

    const display = page.getByTestId("timer-display");
    const initial = toSeconds((await display.textContent()) ?? "");
    // Foco por defecto (25:00): margen de sobra para que 60 s no lleguen a 0.
    expect(initial).toBeGreaterThan(120);

    await page.getByRole("button", { name: "Start" }).click();

    // 60 s con la pestaña congelada y un único disparo al volver ("cerrar la tapa").
    await page.clock.fastForward(60_000);

    // El restante debe bajar 60 s reales. La versión por tick solo resta 1 s → rojo.
    await expect(display).toHaveText(toMMSS(initial - 60));
  });
});
