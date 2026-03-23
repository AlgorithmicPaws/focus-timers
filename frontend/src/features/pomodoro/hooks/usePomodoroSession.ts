import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePomodoroTimer } from "@/features/timer/hooks/usePomodoroTimer";
import { sessionsService } from "@/features/sessions/services/sessions.service";
import type { PomodoroConfig } from "@/features/timer/hooks/usePomodoroTimer";

/**
 * Orquesta el timer Pomodoro con el guardado de sesión al completar.
 * El timer corre 100% en cliente; solo llama a la API al finalizar.
 */
export function usePomodoroSession() {
  const queryClient = useQueryClient();
  const sessionStartRef = useRef<Date | null>(null);

  const { mutate: saveSession } = useMutation({
    mutationFn: sessionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const handleFocusComplete = useCallback(
    (focusSec: number) => {
      const startedAt = sessionStartRef.current ?? new Date();
      const endedAt = new Date();

      saveSession({
        technique: "pomodoro",
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        total_work_seconds: focusSec,
        total_break_seconds: 0,
        completed: true,
        day_of_week: startedAt.getDay() === 0 ? 6 : startedAt.getDay() - 1,
        hour_of_day: startedAt.getHours(),
      });
    },
    [saveSession],
  );

  const timer = usePomodoroTimer(handleFocusComplete);

  const start = useCallback(() => {
    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date();
    }
    timer.start();
  }, [timer]);

  const reset = useCallback(() => {
    sessionStartRef.current = null;
    timer.reset();
  }, [timer]);

  const setConfig = useCallback(
    (config: PomodoroConfig) => {
      timer.setConfig(config);
      sessionStartRef.current = null;
    },
    [timer],
  );

  return {
    ...timer,
    start,
    reset,
    setConfig,
  };
}
