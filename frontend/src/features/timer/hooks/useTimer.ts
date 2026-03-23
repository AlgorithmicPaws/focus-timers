import { useCallback, useEffect, useRef, useState } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

interface UseTimerOptions {
  /** Duración inicial en segundos */
  initialSeconds: number;
  /** Callback cuando el timer llega a 0 */
  onFinish?: () => void;
}

interface UseTimerReturn {
  secondsLeft: number;
  status: TimerStatus;
  start: () => void;
  pause: () => void;
  reset: (newSeconds?: number) => void;
  isRunning: boolean;
}

/**
 * Hook genérico de cuenta regresiva — 100% cliente, sin side effects externos.
 * Toda la lógica de sesión vive en capas superiores (usePomodoroSession, etc.).
 */
export function useTimer({ initialSeconds, onFinish }: UseTimerOptions): UseTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);

  // Mantener la referencia al callback actualizada sin reiniciar el interval
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const clearInterval_ = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
    clearInterval_();
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    clearInterval_();
    setStatus("idle");
    setSecondsLeft(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  // Efecto principal del ticker
  useEffect(() => {
    if (status !== "running") {
      clearInterval_();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval_();
          setStatus("finished");
          onFinishRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearInterval_;
  }, [status]);

  // Sincronizar con nuevos initialSeconds (cambio de fase)
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setStatus("idle");
    clearInterval_();
  }, [initialSeconds]);

  return {
    secondsLeft,
    status,
    start,
    pause,
    reset,
    isRunning: status === "running",
  };
}
