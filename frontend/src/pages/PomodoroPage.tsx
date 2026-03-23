import { clsx } from "clsx";
import { Link } from "react-router-dom";
import { usePomodoroSession } from "@/features/pomodoro/hooks/usePomodoroSession";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import { PHASE_COLORS } from "@/features/timer/hooks/usePomodoroTimer";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

const PHASE_LABELS = {
  idle: "Listo para empezar",
  focus: "Enfoque",
  short_break: "Descanso corto",
  long_break: "Descanso largo",
};

export default function PomodoroPage() {
  const { phase, secondsLeft, isRunning, pomodorosCompleted, config, start, pause, skipPhase, reset } =
    usePomodoroSession();

  return (
    <div
      className={clsx(
        "min-h-screen flex flex-col items-center justify-center transition-colors duration-[800ms]",
        PHASE_COLORS[phase],
      )}
    >
      {/* Nav mínima */}
      <div className="absolute top-4 left-4">
        <Link
          to={ROUTES.DASHBOARD}
          className="text-white/70 hover:text-white text-sm transition-colors"
          aria-label="Volver al dashboard"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Glassmorphism card */}
      <div className="rounded-2xl px-12 py-10 bg-[var(--glass-bg)] backdrop-blur-[12px] border border-[var(--glass-border)] shadow-[var(--shadow-glass)] flex flex-col items-center gap-6">
        {/* Fase actual */}
        <p className="text-white/80 text-sm font-medium uppercase tracking-widest">
          {PHASE_LABELS[phase]}
        </p>

        {/* Timer */}
        <TimerDisplay secondsLeft={secondsLeft} />

        {/* Contador de pomodoros */}
        <div className="flex gap-2" aria-label={`${pomodorosCompleted} de ${config.pomodorosTarget} pomodoros`}>
          {Array.from({ length: config.pomodorosTarget }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "w-3 h-3 rounded-full transition-colors",
                i < pomodorosCompleted ? "bg-white" : "bg-white/30",
              )}
            />
          ))}
        </div>

        {/* Controles */}
        <div className="flex gap-3">
          {isRunning ? (
            <Button variant="glass" size="lg" onClick={pause} aria-label="Pausar">
              Pausar
            </Button>
          ) : (
            <Button variant="cta" size="lg" onClick={start} aria-label="Iniciar">
              {phase === "idle" ? "Iniciar" : "Continuar"}
            </Button>
          )}
          <Button variant="glass" size="md" onClick={skipPhase} aria-label="Saltar fase">
            Saltar
          </Button>
          <Button variant="glass" size="md" onClick={reset} aria-label="Reiniciar">
            ↺
          </Button>
        </div>
      </div>
    </div>
  );
}
