import { useState, useEffect, useRef, useCallback } from "react";
import type { BolsaConfig, BolsaPhase, BreakRecord } from "@/features/bolsa/types/bolsa.types";

interface BolsaSessionData {
  started_at: Date;
  ended_at: Date;
  total_work_seconds: number;
  total_break_seconds: number;
  completed: boolean;
  breaks_taken: BreakRecord[];
  budget_used_sec: number;
  budget_exhausted: boolean;
}

interface UseBolsaTimerOptions {
  config: BolsaConfig;
  onSessionEnd: (data: BolsaSessionData) => void;
}

/**
 * Timer de Bolsa de Tiempo con dos contadores simultáneos:
 * 1. Bloque total: cuenta regresiva del tiempo total de la sesión.
 * 2. Presupuesto: se descuenta solo mientras el usuario está en pausa.
 */
export function useBolsaTimer({ config, onSessionEnd }: UseBolsaTimerOptions) {
  const [phase, setPhase] = useState<BolsaPhase>("idle");
  const [blockSecondsRemaining, setBlockSecondsRemaining] = useState(config.blockDurationSec);
  const [budgetSecondsRemaining, setBudgetSecondsRemaining] = useState(config.budgetSec);
  const [budgetExhausted, setBudgetExhausted] = useState(false);

  const sessionStartRef = useRef<Date | null>(null);
  const breakStartRef = useRef<Date | null>(null);
  const breaksRef = useRef<BreakRecord[]>([]);
  const blockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const budgetIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown del bloque (solo en working — se pausa durante break)
  useEffect(() => {
    if (phase !== "working") return;
    blockIntervalRef.current = setInterval(() => {
      setBlockSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(blockIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (blockIntervalRef.current) clearInterval(blockIntervalRef.current);
    };
  }, [phase]);

  // Detectar bloque agotado
  useEffect(() => {
    if (blockSecondsRemaining === 0 && (phase === "working" || phase === "break")) {
      finishBlock(true);
    }
  }, [blockSecondsRemaining]);

  // Countdown del presupuesto (solo en break)
  useEffect(() => {
    if (phase !== "break") return;
    budgetIntervalRef.current = setInterval(() => {
      setBudgetSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(budgetIntervalRef.current!);
          setBudgetExhausted(true);
          recordBreakEnd();
          setPhase("working");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (budgetIntervalRef.current) clearInterval(budgetIntervalRef.current);
    };
  }, [phase]);

  const recordBreakEnd = useCallback(() => {
    if (!breakStartRef.current) return;
    const end = new Date();
    const duration = Math.round((end.getTime() - breakStartRef.current.getTime()) / 1000);
    breaksRef.current = [
      ...breaksRef.current,
      { start: breakStartRef.current.toISOString(), end: end.toISOString(), duration_sec: duration },
    ];
    breakStartRef.current = null;
  }, []);

  const startBlock = useCallback(() => {
    sessionStartRef.current = new Date();
    breaksRef.current = [];
    setBlockSecondsRemaining(config.blockDurationSec);
    setBudgetSecondsRemaining(config.budgetSec);
    setBudgetExhausted(false);
    setPhase("working");
  }, [config]);

  const takePause = useCallback(() => {
    if (budgetSecondsRemaining <= 0) return;
    if (budgetIntervalRef.current) clearInterval(budgetIntervalRef.current);
    breakStartRef.current = new Date();
    setPhase("break");
  }, [budgetSecondsRemaining]);

  const resumeWork = useCallback(() => {
    if (budgetIntervalRef.current) clearInterval(budgetIntervalRef.current);
    recordBreakEnd();
    setPhase("working");
  }, [recordBreakEnd]);

  const finishBlock = useCallback(
    (completed: boolean) => {
      if (blockIntervalRef.current) clearInterval(blockIntervalRef.current);
      if (budgetIntervalRef.current) clearInterval(budgetIntervalRef.current);
      if (phase === "break") recordBreakEnd();

      const totalBreakSec = breaksRef.current.reduce((sum, b) => sum + b.duration_sec, 0);
      const elapsed = config.blockDurationSec - blockSecondsRemaining;
      const budgetUsed = config.budgetSec - budgetSecondsRemaining;

      onSessionEnd({
        started_at: sessionStartRef.current ?? new Date(),
        ended_at: new Date(),
        total_work_seconds: Math.max(0, elapsed - totalBreakSec),
        total_break_seconds: totalBreakSec,
        completed,
        breaks_taken: breaksRef.current,
        budget_used_sec: budgetUsed,
        budget_exhausted: budgetExhausted,
      });

      setPhase("idle");
      setBlockSecondsRemaining(config.blockDurationSec);
      setBudgetSecondsRemaining(config.budgetSec);
    },
    [phase, config, blockSecondsRemaining, budgetSecondsRemaining, budgetExhausted, onSessionEnd, recordBreakEnd],
  );

  const budgetUsedPercent =
    config.budgetSec > 0
      ? ((config.budgetSec - budgetSecondsRemaining) / config.budgetSec) * 100
      : 0;

  return {
    phase,
    blockSecondsRemaining,
    budgetSecondsRemaining,
    budgetUsedPercent,
    budgetExhausted,
    startBlock,
    takePause,
    resumeWork,
    endEarly: () => finishBlock(false),
  };
}
