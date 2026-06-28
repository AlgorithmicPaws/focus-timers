import { test, expect } from "@playwright/test";

/**
 * Smoke del guardia de navegación (Fase 3, paso 4).
 *
 * Con un timer en marcha, intentar navegar fuera debe abrir el modal de
 * confirmación (`NavigationBlockerModal`). "Stay" cancela; "Leave anyway" procede.
 */
test.describe("Smoke — NavigationBlockerModal", () => {
  test("navegar con un timer activo pide confirmación", async ({ page }) => {
    await page.clock.install();
    await page.goto("/timer/pomodoro");

    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByText("Focus", { exact: true })).toBeVisible();

    // Intentar ir a Flowtime desde el header → el guardia bloquea.
    await page.getByRole("link", { name: "Flowtime" }).click();
    await expect(page.getByText("Leave session?")).toBeVisible();

    // "Stay" cancela: seguimos en el Pomodoro.
    await page.getByRole("button", { name: "Stay" }).click();
    await expect(page.getByText("Leave session?")).toBeHidden();
    await expect(page).toHaveURL(/\/timer\/pomodoro/);

    // Reintentar y confirmar "Leave anyway": ahora sí navega.
    await page.getByRole("link", { name: "Flowtime" }).click();
    await page.getByRole("button", { name: "Leave anyway" }).click();
    await expect(page).toHaveURL(/\/timer\/flowtime/);
  });
});
