import { useState, useEffect, useRef, useCallback } from "react";
import { calculateBreakSeconds } from "@/features/timer/utils/break.calculator";

const FLOW_NUDGE_THRESHOLD_SEC = 90 * 60;
import type { FlowtimePhase, FlowtimeConfig } from "@/features/flowtime/types/flowtime.types";

interface FlowtimeSessionData {
  started_at: Date;
  ended_at: Date;
  total_work_seconds: number;
  total_break_seconds: number;
  completed: boolean;
  recommended_break_sec: number;
}

interface UseFlowtimeTimerOptions {
  config: FlowtimeConfig;
  onSessionEnd: (data: FlowtimeSessionData) => void;
}

/**
 * Timer ascendente para Flowtime.
 * Foco: cuenta hacia arriba (el usuario decide cuándo parar).
 * Descanso: cuenta regresiva del tiempo recomendado.
 */
export function useFlowtimeTimer({ config, onSessionEnd }: UseFlowtimeTimerOptions) {
  const [phase, setPhase] = useState<FlowtimePhase>("idle");
  const [elapsedFocusSeconds, setElapsedFocusSeconds] = useState(0);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(0);
  const [recommendedBreakSec, setRecommendedBreakSec] = useState(0);
  const [showNudge, setShowNudge] = useState(false);

  const sessionStartRef = useRef<Date | null>(null);
  const breakStartRef = useRef<Date | null>(null);
  const totalBreakSecondsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Contador ascendente de foco
  useEffect(() => {
    if (phase !== "focus") return;
    intervalRef.current = setInterval(() => {
      setElapsedFocusSeconds((prev) => {
        const next = prev + 1;
        // Mostrar nudge tras 90 min de foco continuo
        if (next === FLOW_NUDGE_THRESHOLD_SEC) setShowNudge(true);
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // Countdown de descanso
  useEffect(() => {
    if (phase !== "break") return;
    intervalRef.current = setInterval(() => {
      setBreakSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("idle");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const startFocus = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    sessionStartRef.current = new Date();
    totalBreakSecondsRef.current = 0;
    setElapsedFocusSeconds(0);
    setShowNudge(false);
    setPhase("focus");
  }, []);

  const takeBreak = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const recommended = calculateBreakSeconds(
      elapsedFocusSeconds,
      config.breakModel,
      config.breakRatio,
    );
    setRecommendedBreakSec(recommended);
    setBreakSecondsRemaining(recommended);
    breakStartRef.current = new Date();
    setShowNudge(false);
    setPhase("break");
  }, [elapsedFocusSeconds, config]);

  const resumeFocus = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (breakStartRef.current) {
      const breakDuration = Math.round(
        (new Date().getTime() - breakStartRef.current.getTime()) / 1000,
      );
      totalBreakSecondsRef.current += breakDuration;
      breakStartRef.current = null;
    }
    setShowNudge(false);
    setPhase("focus");
  }, []);

  const endSession = useCallback(
    (completed: boolean = true) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Sumar descanso actual si está en break
      let finalBreakSec = totalBreakSecondsRef.current;
      if (phase === "break" && breakStartRef.current) {
        finalBreakSec += Math.round(
          (new Date().getTime() - breakStartRef.current.getTime()) / 1000,
        );
      }
      onSessionEnd({
        started_at: sessionStartRef.current ?? new Date(),
        ended_at: new Date(),
        total_work_seconds: elapsedFocusSeconds,
        total_break_seconds: finalBreakSec,
        completed,
        recommended_break_sec: recommendedBreakSec,
      });
      setPhase("idle");
      setElapsedFocusSeconds(0);
      setBreakSecondsRemaining(0);
      setShowNudge(false);
      sessionStartRef.current = null;
      totalBreakSecondsRef.current = 0;
    },
    [phase, elapsedFocusSeconds, recommendedBreakSec, onSessionEnd],
  );

  return {
    phase,
    elapsedFocusSeconds,
    breakSecondsRemaining,
    recommendedBreakSec,
    showNudge,
    startFocus,
    takeBreak,
    resumeFocus,
    endSession,
    dismissNudge: () => setShowNudge(false),
  };
}
