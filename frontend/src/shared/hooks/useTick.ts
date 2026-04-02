import { useEffect, useRef } from 'react';
import { useSound } from './useSound';

/**
 * Reproduce un tick cada segundo mientras el timer está corriendo,
 * si el usuario tiene tick_enabled en sus ajustes.
 */
export function useTick(isRunning: boolean) {
  const { play } = useSound();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const enabled = localStorage.getItem('tick_enabled') === 'true';
    if (!isRunning || !enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      play('tick');
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, play]);
}
