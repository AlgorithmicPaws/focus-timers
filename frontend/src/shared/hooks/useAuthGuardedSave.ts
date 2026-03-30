import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * Hook que protege un guardado con auth opcional.
 * Si el usuario no está autenticado, muestra un mensaje en lugar de llamar a la API.
 * Retorna `needsAuth` para que la UI pueda mostrar un prompt de login.
 */
export function useAuthGuardedSave() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [needsAuth, setNeedsAuth] = useState(false);

  function guardedSave<T>(saveFn: () => T): T | undefined {
    if (!isAuthenticated) {
      setNeedsAuth(true);
      return undefined;
    }
    setNeedsAuth(false);
    return saveFn();
  }

  function clearNeedsAuth() {
    setNeedsAuth(false);
  }

  return { guardedSave, needsAuth, clearNeedsAuth, isAuthenticated };
}
