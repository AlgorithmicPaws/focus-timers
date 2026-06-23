import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerStatus } from "@/features/timer/types/timer.types";

export type { TimerStatus };

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
  // Timestamp absoluto (ms epoch) en el que el timer llega a 0 mientras corre.
  // Anclar a un instante real — en vez de contar ticks — evita la deriva cuando
  // el navegador throttlea los timers de una pestaña en segundo plano (bug #6).
  const endAtRef = useRef<number | null>(null);
  // Espejo del restante para leerlo al (re)arrancar sin recrear el efecto del ticker.
  const secondsLeftRef = useRef(secondsLeft);

  // Mantener la referencia al callback actualizada sin reiniciar el interval
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

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
    endAtRef.current = null;
    setStatus("idle");
    setSecondsLeft(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  // Efecto principal del ticker — anclado a un timestamp absoluto.
  useEffect(() => {
    if (status !== "running") {
      clearInterval_();
      return;
    }

    // Al (re)arrancar, fijar el instante de fin a partir del restante actual.
    // En una reanudación tras pausa, esto vuelve a anclar desde el valor pausado.
    const endAt = Date.now() + secondsLeftRef.current * 1000;
    endAtRef.current = endAt;

    // Recalcular el restante desde el reloj real, nunca por acumulación de ticks.
    const sync = () => {
      const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval_();
        endAtRef.current = null;
        setStatus("finished");
        onFinishRef.current?.();
      }
    };

    // 250 ms: display fluido y corrección rápida; setSecondsLeft con el mismo
    // valor no re-renderiza (React hace bailout), así que el coste es marginal.
    intervalRef.current = setInterval(sync, 250);

    // Resincronizar de inmediato al volver a la pestaña: en background el navegador
    // congela/throttlea el interval, así que un solo disparo al volver basta para
    // recuperar el tiempo real transcurrido.
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval_();
      document.removeEventListener("visibilitychange", onVisible);
    };
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
