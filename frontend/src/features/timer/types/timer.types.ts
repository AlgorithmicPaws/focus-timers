export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type PomodoroPhase = "idle" | "focus" | "short_break" | "long_break";

export interface PomodoroConfig {
  focusSec: number;
  shortBreakSec: number;
  longBreakSec: number;
  pomodorosTarget: number;
}