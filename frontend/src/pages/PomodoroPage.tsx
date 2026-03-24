import { clsx } from "clsx";
import { Link } from "react-router-dom";
import { usePomodoroSession } from "@/features/pomodoro/hooks/usePomodoroSession";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import type { PomodoroPhase } from "@/features/timer/hooks/usePomodoroTimer";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  idle: "Ready to start",
  focus: "Focus",
  short_break: "Short break",
  long_break: "Long break",
};

/** Solid phase colors for water tank animation */
const PHASE_WATER_COLORS: Record<PomodoroPhase, string> = {
  idle:        "#ff7b61",
  focus:       "#ff7b61",
  short_break: "#fbbf24",
  long_break:  "#7ab854",
};

function getPhaseTotalSec(
  phase: PomodoroPhase,
  config: { focusSec: number; shortBreakSec: number; longBreakSec: number },
): number {
  if (phase === "focus" || phase === "idle") return config.focusSec;
  if (phase === "short_break") return config.shortBreakSec;
  return config.longBreakSec;
}

function getWaterLevel(phase: PomodoroPhase, secondsLeft: number, totalSec: number): number {
  if (phase === "idle") return 1;
  if (phase === "focus") return secondsLeft / totalSec;       // drains as time runs out
  return 1 - secondsLeft / totalSec;                          // fills as break progresses
}

export default function PomodoroPage() {
  const { phase, secondsLeft, isRunning, pomodorosCompleted, config, start, pause, skipPhase, reset } =
    usePomodoroSession();

  const totalSec = getPhaseTotalSec(phase, config);
  const waterLevel = getWaterLevel(phase, secondsLeft, totalSec);
  const waterColor = PHASE_WATER_COLORS[phase];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--bg-page)">

      {/* ── Water tank layer ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: `${waterLevel * 100}%`,
          transition: "height 950ms linear, background-color 800ms ease",
          backgroundColor: waterColor,
        }}
      >
        {/* Scrolling wave at the water surface — SVG is 200% wide, animates at -50% */}
        <svg
          className="absolute left-0 w-[200%] h-10"
          style={{
            top: "-36px",
            fill: waterColor,
            animation: "waveScroll 4s linear infinite",
          }}
          viewBox="0 0 2880 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Two full wave cycles so the loop is seamless */}
          <path d="M0,20 C240,4 480,36 720,20 C960,4 1200,36 1440,20 C1680,4 1920,36 2160,20 C2400,4 2640,36 2880,20 L2880,40 L0,40 Z" />
        </svg>
      </div>

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

        {/* Phase label */}
        <p className="text-(--text-secondary) text-sm font-medium uppercase tracking-widest">
          {PHASE_LABELS[phase]}
        </p>

        {/* Timer */}
        <TimerDisplay secondsLeft={secondsLeft} />

        {/* Pomodoro dots */}
        <div
          className="flex gap-2"
          aria-label={`${pomodorosCompleted} of ${config.pomodorosTarget} pomodoros`}
        >
          {Array.from({ length: config.pomodorosTarget }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "w-3 h-3 rounded-full transition-colors",
                i < pomodorosCompleted ? "bg-brand-tomato" : "bg-(--border-default)",
              )}
            />
          ))}
        </div>

        {/* Controls */}
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
