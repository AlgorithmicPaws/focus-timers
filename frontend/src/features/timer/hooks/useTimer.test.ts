import { renderHook, act } from "@testing-library/react";
import { useTimer } from "./useTimer";

/**
 * Unidad de `useTimer` — complementa al E2E del bug #6.
 * Con timers falsos + `setSystemTime` se reproduce el salto de reloj de una
 * pestaña en background y se verifica que el restante se ancla al tiempo real.
 */
describe("useTimer", () => {
  const BASE = new Date("2026-06-23T10:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cuenta hacia atrás un segundo de tiempo real", () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 1500 }));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.secondsLeft).toBe(1499);
    expect(result.current.isRunning).toBe(true);
  });

  it("no deriva cuando la pestaña estuvo 60 s en background (bug #6)", () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 1500 }));

    act(() => result.current.start());

    // Pestaña congelada: el reloj salta 60 s y, al volver, llega un único tick.
    act(() => {
      vi.setSystemTime(BASE + 60_000);
      vi.advanceTimersByTime(250);
    });

    // 1500 - 60 = 1440 (24:00). La versión por tick habría restado solo ~1 s.
    expect(result.current.secondsLeft).toBe(1440);
  });

  it("llega a 0, marca finished y dispara onFinish una sola vez", () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useTimer({ initialSeconds: 2, onFinish }));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.status).toBe("finished");
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("al pausar y reanudar re-ancla desde el restante pausado", () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 1500 }));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10_000)); // 10 s reales → 1490
    expect(result.current.secondsLeft).toBe(1490);

    act(() => result.current.pause());
    // Tiempo en pausa: no debe descontar.
    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current.secondsLeft).toBe(1490);

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5_000)); // 5 s más → 1485
    expect(result.current.secondsLeft).toBe(1485);
  });
});
