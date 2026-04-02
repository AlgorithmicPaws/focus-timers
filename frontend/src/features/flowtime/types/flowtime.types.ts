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
  "Relaxed (÷3)":  { breakModel: "proportional", breakRatio: 3 },
  "Standard (÷5)": { breakModel: "proportional", breakRatio: 5 },
  "Intense (÷7)":  { breakModel: "proportional", breakRatio: 7 },
  "Stepped":       { breakModel: "stepped", breakRatio: 5 },
};
