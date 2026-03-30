import type { BolsaConfig } from "@/features/bolsa/types/bolsa.types";
import { PresetCarousel } from "@/shared/components/PresetCarousel";

const BLOCK_OPTIONS = [45, 60, 90, 120]; // minutes
const BUDGET_OPTIONS = [10, 15, 20, 30]; // minutes

interface BolsaConfigPanelProps {
  config: BolsaConfig;
  onChange: (config: BolsaConfig) => void;
  disabled?: boolean;
}

export function BolsaConfigPanel({ config, onChange, disabled }: BolsaConfigPanelProps) {
  const blockMin = Math.round(config.blockDurationSec / 60);
  const budgetMin = Math.round(config.budgetSec / 60);

  const snapBlock = BLOCK_OPTIONS.includes(blockMin) ? blockMin : BLOCK_OPTIONS[1];
  const snapBudget = BUDGET_OPTIONS.includes(budgetMin) ? budgetMin : BUDGET_OPTIONS[1];

  return (
    <div className="flex justify-around flex-wrap gap-4 w-full">
      <PresetCarousel
        label="Block"
        options={BLOCK_OPTIONS}
        value={snapBlock}
        onChange={(m) => onChange({ ...config, blockDurationSec: m * 60 })}
        format={(m) => `${m}m`}
        accent="green"
        disabled={disabled}
      />
      <PresetCarousel
        label="Budget"
        options={BUDGET_OPTIONS}
        value={snapBudget}
        onChange={(m) => onChange({ ...config, budgetSec: m * 60 })}
        format={(m) => `${m}m`}
        accent="green"
        disabled={disabled}
      />
    </div>
  );
}