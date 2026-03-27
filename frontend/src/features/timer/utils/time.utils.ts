/** Formats a total number of seconds into MM:SS string. */
export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Returns 0-based day of week where 0 = Monday, 6 = Sunday. */
export function getDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

/** Returns current hour of day (0–23). */
export function getCurrentHour(): number {
  return new Date().getHours();
}