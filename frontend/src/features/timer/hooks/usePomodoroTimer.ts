import { useCallback, useState } from "react";
import { useTimer } from "./useTimer";
import type { PomodoroPhase, PomodoroConfig } from "@/features/timer/types/timer.types";

export type { PomodoroPhase, PomodoroConfig };

export const DEFAULT_CONFIG: PomodoroConfig = {
  focusSec: 25 * 60,
  shortBreakSec: 5 * 60,
  longBreakSec: 15 * 60,
  pomodorosTarget: 4,
};

/** Colores de fondo por fase — se usan con Tailwind */
export const PHASE_COLORS: Record<PomodoroPhase, string> = {
  idle: "bg-brand-focus",
  focus: "bg-brand-focus",
  short_break: "bg-brand-break",
  long_break: "bg-brand-longbreak",
};

interface UsePomodoroTimerReturn {
  phase: PomodoroPhase;
  pomodorosCompleted: number;
  config: PomodoroConfig;
  secondsLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  skipPhase: () => void;
  reset: () => void;
  setConfig: (config: PomodoroConfig) => void;
}

/**
 * Máquina de estados Pomodoro:
 * idle → focus → short_break → focus → ... → long_break (cada pomodorosTarget) → ...
 */
export function usePomodoroTimer(
  onFocusComplete?: (phaseSec: number) => void,
): UsePomodoroTimerReturn {
  const [phase, setPhase] = useState<PomodoroPhase>("idle");
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG);

  const getPhaseDuration = useCallback(
    (p: PomodoroPhase): number => {
      switch (p) {
        case "focus":
        case "idle":
          return config.focusSec;
        case "short_break":
          return config.shortBreakSec;
        case "long_break":
          return config.longBreakSec;
      }
    },
    [config],
  );

  const handleFinish = useCallback(() => {
    if (phase === "focus") {
      onFocusComplete?.(config.focusSec);
      const next = pomodorosCompleted + 1;
      setPomodorosCompleted(next);
      setPhase(next % config.pomodorosTarget === 0 ? "long_break" : "short_break");
    } else {
      setPhase("focus");
    }
  }, [phase, pomodorosCompleted, config, onFocusComplete]);

  const { secondsLeft, status, start, pause, reset } = useTimer({
    initialSeconds: getPhaseDuration(phase),
    onFinish: handleFinish,
  });

  const skipPhase = useCallback(() => {
    reset();
    if (phase === "focus") {
      const next = pomodorosCompleted + 1;
      setPomodorosCompleted(next);
      setPhase(next % config.pomodorosTarget === 0 ? "long_break" : "short_break");
    } else {
      setPhase("focus");
    }
  }, [phase, pomodorosCompleted, config, reset]);

  const handleReset = useCallback(() => {
    reset();
    setPhase("idle");
    setPomodorosCompleted(0);
  }, [reset]);

  const handleStart = useCallback(() => {
    if (phase === "idle") setPhase("focus");
    start();
  }, [phase, start]);

  return {
    phase,
    pomodorosCompleted,
    config,
    secondsLeft,
    isRunning: status === "running",
    start: handleStart,
    pause,
    skipPhase,
    reset: handleReset,
    setConfig,
  };
}
