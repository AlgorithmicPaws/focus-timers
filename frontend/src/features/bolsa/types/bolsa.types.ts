export type BolsaPhase = "idle" | "working" | "break" | "completed";

export interface BolsaConfig {
  blockDurationSec: number;
  budgetSec: number;
}

export interface BreakRecord {
  start: string;
  end: string;
  duration_sec: number;
}

export const BOLSA_PRESETS: Record<string, BolsaConfig> = {
  "Budget 60": { blockDurationSec: 60 * 60, budgetSec: 10 * 60 },
  "Budget 90": { blockDurationSec: 90 * 60, budgetSec: 15 * 60 },
  "Budget 120": { blockDurationSec: 120 * 60, budgetSec: 20 * 60 },
};

export const DEFAULT_BOLSA_CONFIG: BolsaConfig = BOLSA_PRESETS["Budget 90"];
