import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Prevents accidental navigation/refresh mid-session.
 * - Blocks browser refresh/tab-close with the native beforeunload dialog.
 * - Blocks in-app React Router navigation and returns the blocker so the
 *   page can render a confirmation modal.
 */
export function useNavigationGuard(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isActive]);

  const blocker = useBlocker(isActive);
  return { blocker };
}
