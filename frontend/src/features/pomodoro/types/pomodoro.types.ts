import type { PomodoroPhase } from "@/features/timer/types/timer.types";

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  idle:        "Ready to start",
  focus:       "Focus",
  short_break: "Short break",
  long_break:  "Long break",
};

export const PHASE_WATER_COLORS: Record<PomodoroPhase, string> = {
  idle:        "#ff7b61",
  focus:       "#ff7b61",
  short_break: "#fbbf24",
  long_break:  "#7ab854",
};

export function getPhaseTotalSec(
  phase: PomodoroPhase,
  config: { focusSec: number; shortBreakSec: number; longBreakSec: number },
): number {
  if (phase === "focus" || phase === "idle") return config.focusSec;
  if (phase === "short_break") return config.shortBreakSec;
  return config.longBreakSec;
}

export function getWaterLevel(phase: PomodoroPhase, secondsLeft: number, totalSec: number): number {
  if (phase === "idle") return 0;
  if (phase === "focus") return secondsLeft / totalSec;
  return 1 - secondsLeft / totalSec;
}