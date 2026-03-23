import { Link } from "react-router-dom";
import { Header } from "@/shared/components/layout/Header";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Hola, {user?.name ?? ""}! 👋
        </h1>
        <p className="text-[var(--text-secondary)] mb-12">
          ¿Listo para una sesión de enfoque?
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Pomodoro</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                25 min de enfoque · 5 min de descanso
              </p>
            </div>
            <Link to={ROUTES.POMODORO}>
              <Button variant="cta" className="w-full">Empezar</Button>
            </Link>
          </div>

          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] p-6 flex flex-col gap-4 opacity-60">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Flowtime</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Disponible en Fase 2
              </p>
            </div>
            <Button variant="secondary" disabled className="w-full">Próximamente</Button>
          </div>
        </div>

        <div className="mt-8">
          <Link to={ROUTES.SESSIONS} className="text-sm text-brand-tomato hover:underline">
            Ver historial de sesiones →
          </Link>
        </div>
      </main>
    </div>
  );
}
