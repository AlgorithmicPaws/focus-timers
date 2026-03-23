import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[var(--bg-card)]/80 backdrop-blur-sm border-b border-[var(--glass-border)]">
      <Link
        to={ROUTES.DASHBOARD}
        className="text-xl font-bold text-brand-tomato tracking-tight"
      >
        Focus Timers
      </Link>

      <nav className="flex items-center gap-4">
        <Link
          to={ROUTES.POMODORO}
          className="text-sm text-[var(--text-secondary)] hover:text-brand-tomato transition-colors"
        >
          Pomodoro
        </Link>
        <Link
          to={ROUTES.SESSIONS}
          className="text-sm text-[var(--text-secondary)] hover:text-brand-tomato transition-colors"
        >
          Sesiones
        </Link>
        {user && (
          <span className="text-sm text-[var(--text-secondary)]">
            {user.name}
          </span>
        )}
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Salir
        </Button>
      </nav>
    </header>
  );
}
