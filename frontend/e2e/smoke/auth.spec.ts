import { test, expect } from "@playwright/test";
import { registerNewUser } from "../helpers";

/**
 * Smoke de autenticación (Fase 3, paso 4): registro → logout → login y la
 * protección de `/sessions` (única ruta tras `ProtectedRoute`). Usa el backend
 * real que levanta el `webServer` contra el Postgres efímero.
 */
test.describe("Smoke — Auth", () => {
  test("registro, logout y protección de /sessions", async ({ page }) => {
    const { name } = await registerNewUser(page);

    // Tras registrarse, el header muestra el nombre del usuario.
    await expect(page.getByText(name)).toBeVisible();

    // /sessions es accesible estando autenticado (sin redirección a /login).
    await page.goto("/sessions");
    await expect(page).toHaveURL(/\/sessions/);

    // Logout desde el menú de usuario del header.
    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login/);

    // Ya sin sesión, /sessions redirige a /login (ruta protegida).
    await page.goto("/sessions");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login con credenciales recién creadas vuelve al dashboard", async ({ page }) => {
    const { email, password } = await registerNewUser(page);

    // Cerrar sesión limpiando el storage y volver a entrar por el formulario.
    await page.evaluate(() => localStorage.removeItem("focus-timers-auth"));
    await page.goto("/login");

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/$|\/\?/);
  });
});
