import { clsx } from "clsx";

interface PomodoroCounterProps {
  completed: number;
  target: number;
}

/** Row of dots indicating completed vs remaining pomodoros in the current cycle. */
export function PomodoroCounter({ completed, target }: PomodoroCounterProps) {
  return (
    <div
      className="flex gap-2"
      aria-label={`${completed} of ${target} pomodoros completed`}
    >
      {Array.from({ length: target }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "w-3 h-3 rounded-full transition-colors",
            i < completed ? "bg-brand-tomato" : "bg-(--border-default)",
          )}
        />
      ))}
    </div>
  );
}