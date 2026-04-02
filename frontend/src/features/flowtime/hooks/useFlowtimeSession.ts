import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFlowtimeTimer } from "@/features/timer/hooks/useFlowtimeTimer";
import { sessionsService } from "@/features/sessions/services/sessions.service";
import { useAuthGuardedSave } from "@/shared/hooks/useAuthGuardedSave";
import { useSound } from "@/shared/hooks/useSound";
import { getDayOfWeek, getCurrentHour } from "@/features/timer/utils/time.utils";
import type { FlowtimeConfig } from "@/features/flowtime/types/flowtime.types";

/**
 * Orquesta el timer Flowtime con el guardado de sesión al completar.
 * Si el usuario no está autenticado, muestra el prompt de login.
 */
export function useFlowtimeSession(config: FlowtimeConfig, taskName?: string) {
  const queryClient = useQueryClient();
  const { guardedSave, needsAuth, clearNeedsAuth } = useAuthGuardedSave();
  const { play } = useSound();

  const { mutate: saveSession, isError: saveError } = useMutation({
    mutationFn: sessionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const timer = useFlowtimeTimer({
    config,
    onSessionEnd: (data) => {
      play('alarm-end');
      guardedSave(() =>
        saveSession({
          technique: "flowtime",
          task_name: taskName || null,
          started_at: data.started_at.toISOString(),
          ended_at: data.ended_at.toISOString(),
          total_work_seconds: data.total_work_seconds,
          total_break_seconds: data.total_break_seconds,
          completed: data.completed,
          day_of_week: getDayOfWeek(),
          hour_of_day: getCurrentHour(),
          technique_config: {
            break_model: config.breakModel,
            break_ratio: config.breakRatio,
          },
          flowtime_details: {
            break_model: config.breakModel,
            break_ratio: config.breakRatio,
            break_recommended_sec: data.recommended_break_sec,
            break_actual_sec: data.total_break_seconds,
          },
        }),
      );
    },
  });

  const takeBreakWithSound = useCallback(() => {
    play('alarm-break');
    timer.takeBreak();
  }, [play, timer]);

  const resumeFocusWithSound = useCallback(() => {
    play('alarm-break');
    timer.resumeFocus();
  }, [play, timer]);

  return { ...timer, takeBreak: takeBreakWithSound, resumeFocus: resumeFocusWithSound, saveError, needsAuth, clearNeedsAuth };
}
