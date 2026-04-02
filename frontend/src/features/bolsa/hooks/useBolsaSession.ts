import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBolsaTimer } from "@/features/timer/hooks/useBolsaTimer";
import { sessionsService } from "@/features/sessions/services/sessions.service";
import { useAuthGuardedSave } from "@/shared/hooks/useAuthGuardedSave";
import { useSound } from "@/shared/hooks/useSound";
import { getDayOfWeek, getCurrentHour } from "@/features/timer/utils/time.utils";
import type { BolsaConfig } from "@/features/bolsa/types/bolsa.types";

export function useBolsaSession(config: BolsaConfig, taskName?: string) {
  const queryClient = useQueryClient();
  const { guardedSave, needsAuth, clearNeedsAuth } = useAuthGuardedSave();
  const { play } = useSound();

  const { mutate: saveSession, isError: saveError } = useMutation({
    mutationFn: sessionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const timer = useBolsaTimer({
    config,
    onSessionEnd: (data) => {
      play('alarm-end');
      guardedSave(() =>
        saveSession({
          technique: "bolsa",
          task_name: taskName || null,
          started_at: data.started_at.toISOString(),
          ended_at: data.ended_at.toISOString(),
          total_work_seconds: data.total_work_seconds,
          total_break_seconds: data.total_break_seconds,
          completed: data.completed,
          day_of_week: getDayOfWeek(),
          hour_of_day: getCurrentHour(),
          technique_config: {
            block_duration_sec: config.blockDurationSec,
            budget_sec: config.budgetSec,
          },
          bolsa_details: {
            budget_total_sec: config.blockDurationSec,
            budget_work_sec: config.blockDurationSec - config.budgetSec,
            budget_break_sec: config.budgetSec,
            budget_used_sec: data.budget_used_sec,
            breaks_taken: data.breaks_taken,
            budget_exhausted: data.budget_exhausted,
          },
        }),
      );
    },
  });

  const takePauseWithSound = useCallback(() => {
    play('alarm-break');
    timer.takePause();
  }, [play, timer]);

  const resumeWorkWithSound = useCallback(() => {
    play('alarm-break');
    timer.resumeWork();
  }, [play, timer]);

  return { ...timer, takePause: takePauseWithSound, resumeWork: resumeWorkWithSound, saveError, needsAuth, clearNeedsAuth };
}
