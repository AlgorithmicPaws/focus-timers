import { test, expect, type Route } from "@playwright/test";

/**
 * Bug #7 — un 401 recarga la página y destruye el timer en curso (`api-client.ts`).
 *
 * La implementación actual, ante cualquier 401 que no sea de un endpoint de auth,
 * hace `window.location.href = ROUTES.LOGIN`: una recarga DURA que desmonta toda la
 * SPA y, con ella, el estado del timer que estaba corriendo.
 *
 * Escenario realista: un usuario con la sesión expirada (token persistido pero ya
 * inválido) abre un timer público. `PresetSelector` dispara `GET /settings/` y
 * `GET /settings/presets` con ese token → el backend respondería 401. Aquí
 * interceptamos esas peticiones y las dejamos "colgadas" hasta tener el timer
 * corriendo, para liberarlas con un 401 en el momento controlado.
 *
 * Test ROJO: con la implementación por `window.location.href`, al llegar el 401
 * la página se recarga → perdemos el marcador `__noHardReload`, la URL salta a
 * `/login` y el display del timer desaparece. Pasa a VERDE cuando el interceptor
 * deja de recargar: `logout()` + toast, sin tocar la ruta pública ni el timer.
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

test.describe("Bug #7 — el 401 no debe recargar la página ni resetear el timer", () => {
  test("un 401 con timer activo deja la SPA intacta y el contador corriendo", async ({ page }) => {
    // Sesión "expirada": token + user persistidos en el formato de zustand-persist,
    // de modo que `isAuthenticated` es true y `PresetSelector` se monta y pide datos.
    await page.addInitScript(() => {
      localStorage.setItem(
        "focus-timers-auth",
        JSON.stringify({
          state: {
            token: "expired.invalid.token",
            user: { id: 1, name: "Tester", email: "tester@focus.test" },
          },
          version: 0,
        }),
      );
    });

    // Mantenemos colgadas las peticiones autenticadas hasta liberar el 401 a mano,
    // así garantizamos que el 401 llega con el timer YA en marcha. Los endpoints de
    // auth se dejan pasar (los formularios manejan su propio error).
    let release401: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release401 = resolve;
    });
    await page.route("**/api/v1/**", async (route: Route) => {
      if (route.request().url().includes("/auth/")) {
        return route.continue();
      }
      await gate;
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token expirado" }),
      });
    });

    await page.clock.install();
    await page.goto("/timer/pomodoro");

    // Marcador en `window`: una recarga dura reinicia la SPA y lo borra.
    await page.evaluate(() => {
      (window as unknown as { __noHardReload: boolean }).__noHardReload = true;
    });

    const display = page.getByTestId("timer-display");
    const initial = toSeconds((await display.textContent()) ?? "");
    expect(initial).toBeGreaterThan(60);

    await page.getByRole("button", { name: "Start" }).click();
    await page.clock.fastForward(5_000);
    await expect(display).toHaveText(toMMSS(initial - 5));

    // Ahora liberamos el 401 con el timer corriendo.
    release401?.();
    await page.waitForResponse(
      (r) => r.url().includes("/api/v1/settings") && r.status() === 401,
    );

    // VERDE: seguimos en el timer, el marcador sobrevive y el contador no se reseteó.
    // ROJO: `window.location.href` recarga → URL pasa a /login y el marcador se pierde.
    await expect(page).toHaveURL(/\/timer\/pomodoro/);
    expect(
      await page.evaluate(
        () => (window as unknown as { __noHardReload?: boolean }).__noHardReload,
      ),
    ).toBe(true);
    await expect(display).toHaveText(toMMSS(initial - 5));
  });
});
