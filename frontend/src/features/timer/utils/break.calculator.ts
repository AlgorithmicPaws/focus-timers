export type BreakModel = "proportional" | "stepped";

/**
 * Calcula los segundos de descanso recomendados según el modelo elegido.
 * Modelo proporcional: descanso = trabajo / ratio (mínimo 1 minuto).
 * Modelo escalonado (Read-Bivens): umbrales fijos basados en tiempo de trabajo.
 */
export function calculateBreakSeconds(
  workSeconds: number,
  model: BreakModel,
  ratio: number = 5,
): number {
  if (model === "proportional") {
    return Math.max(60, Math.floor(workSeconds / ratio));
  }
  // Modelo escalonado Read-Bivens
  if (workSeconds < 25 * 60) return 5 * 60;
  if (workSeconds < 50 * 60) return 8 * 60;
  if (workSeconds < 90 * 60) return 10 * 60;
  return 15 * 60;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
