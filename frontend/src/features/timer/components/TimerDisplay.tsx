import { formatSeconds } from "@/features/timer/utils/time.utils";

interface TimerDisplayProps {
  secondsLeft: number;
}

/** Displays time in MM:SS format with fluid, consistent sizing */
export function TimerDisplay({ secondsLeft }: TimerDisplayProps) {
  const formatted = formatSeconds(secondsLeft);
  const [minutes, seconds] = formatted.split(":");

  return (
    <div
      className="w-full text-center font-bold leading-none tabular-nums drop-shadow-sm"
      style={{ color: "#2a2a2a", fontSize: "clamp(4.5rem, 22vw, 9rem)" }}
      aria-live="off"
      aria-label={`${minutes} minutes ${seconds} seconds`}
    >
      {formatted}
    </div>
  );
}