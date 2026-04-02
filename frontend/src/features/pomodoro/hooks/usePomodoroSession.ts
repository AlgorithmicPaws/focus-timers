import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePomodoroTimer } from "@/features/timer/hooks/usePomodoroTimer";
import { sessionsService } from "@/features/sessions/services/sessions.service";
import { useAuthGuardedSave } from "@/shared/hooks/useAuthGuardedSave";
import { useSound } from "@/shared/hooks/useSound";
import type { PomodoroConfig } from "@/features/timer/hooks/usePomodoroTimer";

export function usePomodoroSession(taskName = "") {
  const queryClient = useQueryClient();
  const sessionStartRef = useRef<Date | null>(null);
  const totalWorkSecRef = useRef(0);
  const { guardedSave, needsAuth, clearNeedsAuth } = useAuthGuardedSave();
  const { play } = useSound();

  const { mutate: saveSession, isError: saveError } = useMutation({
    mutationFn: sessionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  // Accumulate work seconds + play alarm when a focus phase ends
  const handleFocusComplete = useCallback((phaseSec: number) => {
    totalWorkSecRef.current += phaseSec;
    play('alarm-end');
  }, [play]);

  const handleBreakComplete = useCallback(() => {
    play('alarm-break');
  }, [play]);

  const timer = usePomodoroTimer(handleFocusComplete, handleBreakComplete);

  const start = useCallback(() => {
    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date();
    }
    timer.start();
  }, [timer]);

  const reset = useCallback(() => {
    sessionStartRef.current = null;
    totalWorkSecRef.current = 0;
    timer.reset();
  }, [timer]);

  const setConfig = useCallback(
    (config: PomodoroConfig) => {
      timer.setConfig(config);
      sessionStartRef.current = null;
      totalWorkSecRef.current = 0;
    },
    [timer],
  );

  // Manual save: pass extraWorkSec for seconds elapsed in the current in-progress focus phase
  const saveManual = useCallback(
    (completed: boolean, extraWorkSec = 0) => {
      const startedAt = sessionStartRef.current ?? new Date();
      const endedAt = new Date();
      const totalWork = totalWorkSecRef.current + extraWorkSec;
      const { config, pomodorosCompleted } = timer;

      guardedSave(() =>
        saveSession({
          technique: "pomodoro",
          task_name: taskName || null,
          started_at: startedAt.toISOString(),
          ended_at: endedAt.toISOString(),
          total_work_seconds: totalWork,
          total_break_seconds: 0,
          completed,
          day_of_week: startedAt.getDay() === 0 ? 6 : startedAt.getDay() - 1,
          hour_of_day: startedAt.getHours(),
          pomodoro_details: {
            focus_interval_sec: config.focusSec,
            short_break_sec: config.shortBreakSec,
            long_break_sec: config.longBreakSec,
            pomodoros_target: config.pomodorosTarget,
            pomodoros_completed: pomodorosCompleted,
            pomodoro_number: pomodorosCompleted + 1,
            was_voided: !completed,
            strict_mode: false,
          },
        }),
      );

      sessionStartRef.current = null;
      totalWorkSecRef.current = 0;
    },
    [saveSession, guardedSave, taskName, timer],
  );

  return {
    ...timer,
    start,
    reset,
    setConfig,
    saveManual,
    saveError,
    needsAuth,
    clearNeedsAuth,
  };
}
