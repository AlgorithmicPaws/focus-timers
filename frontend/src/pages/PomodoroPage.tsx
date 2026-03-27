import { Link } from "react-router-dom";
import { usePomodoroSession } from "@/features/pomodoro/hooks/usePomodoroSession";
import { WaterTank } from "@/features/pomodoro/components/WaterTank";
import { PomodoroCounter } from "@/features/pomodoro/components/PomodoroCounter";
import {
  PHASE_LABELS,
  PHASE_WATER_COLORS,
  getPhaseTotalSec,
  getWaterLevel,
} from "@/features/pomodoro/types/pomodoro.types";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

export default function PomodoroPage() {
  const { phase, secondsLeft, isRunning, pomodorosCompleted, config, start, pause, skipPhase, reset, saveError } =
    usePomodoroSession();

  const totalSec = getPhaseTotalSec(phase, config);
  const waterLevel = getWaterLevel(phase, secondsLeft, totalSec);
  const waterColor = PHASE_WATER_COLORS[phase];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--bg-page)">

      <WaterTank level={waterLevel} color={waterColor} />

      {/* ── Back link ── */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to={ROUTES.DASHBOARD}
          className="text-sm text-(--text-secondary) hover:text-brand-tomato transition-colors"
          aria-label="Back to dashboard"
        >
          ← Dashboard
        </Link>
      </div>

      {/* ── Glassmorphism card ── */}
      <div className="relative z-10 w-[min(94vw,580px)] rounded-2xl px-12 sm:px-20 py-12 sm:py-16 bg-(--glass-bg) backdrop-blur-md border border-(--glass-border) shadow-(--shadow-glass) flex flex-col items-center gap-8">

        <p className="text-(--text-secondary) text-sm font-medium uppercase tracking-widest">
          {PHASE_LABELS[phase]}
        </p>

        <TimerDisplay secondsLeft={secondsLeft} />

        <PomodoroCounter completed={pomodorosCompleted} target={config.pomodorosTarget} />

        {saveError && (
          <p className="text-sm text-red-500 text-center">
            Session could not be saved. Check your connection.
          </p>
        )}

        <div className="flex gap-3">
          {isRunning ? (
            <Button variant="secondary" size="lg" onClick={pause} aria-label="Pause">
              Pause
            </Button>
          ) : (
            <Button variant="cta" size="lg" onClick={start} aria-label="Start">
              {phase === "idle" ? "Start" : "Continue"}
            </Button>
          )}
          <Button variant="secondary" size="md" onClick={skipPhase} aria-label="Skip phase">
            Skip
          </Button>
          <Button variant="secondary" size="md" onClick={reset} aria-label="Reset">
            ↺
          </Button>
        </div>
      </div>
    </div>
  );
}