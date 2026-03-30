export type FlowtimePhase = "idle" | "focus" | "break";

export interface FlowtimeConfig {
  breakModel: "proportional" | "stepped";
  breakRatio: number;
}

export const DEFAULT_FLOWTIME_CONFIG: FlowtimeConfig = {
  breakModel: "proportional",
  breakRatio: 5,
};

export const FLOWTIME_PRESETS: Record<string, FlowtimeConfig> = {
  "Standard (÷5)": { breakModel: "proportional", breakRatio: 5 },
  "Intense (÷7)": { breakModel: "proportional", breakRatio: 7 },
  "Relaxed (÷3)": { breakModel: "proportional", breakRatio: 3 },
  "Stepped": { breakModel: "stepped", breakRatio: 5 },
};
