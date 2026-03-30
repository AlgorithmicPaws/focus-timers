import { FLOWTIME_PRESETS } from "@/features/flowtime/types/flowtime.types";
import type { FlowtimeConfig } from "@/features/flowtime/types/flowtime.types";

// Only proportional presets in the carousel
const PROPORTIONAL_PRESETS = Object.entries(FLOWTIME_PRESETS).filter(
  ([, p]) => p.breakModel === "proportional",
);
const STEPPED_PRESET = FLOWTIME_PRESETS["Stepped"];

// Short label shown in the center box — ratio format work:break
const PRESET_SHORT: Record<string, string> = {
  "Standard (÷5)": "1 : 5",
  "Intense (÷7)": "1 : 7",
  "Relaxed (÷3)": "1 : 3",
};

interface FlowtimeConfigProps {
  config: FlowtimeConfig;
  onChange: (config: FlowtimeConfig) => void;
  disabled?: boolean;
}

export function FlowtimeConfig({ config, onChange, disabled }: FlowtimeConfigProps) {
  const isAuto = config.breakModel === "stepped";

  const idx = PROPORTIONAL_PRESETS.findIndex(
    ([, p]) => p.breakRatio === config.breakRatio,
  );
  const activeIdx = idx === -1 ? 0 : idx;

  const prev = () => {
    const next = Math.max(0, activeIdx - 1);
    onChange(PROPORTIONAL_PRESETS[next][1]);
  };
  const next = () => {
    const n = Math.min(PROPORTIONAL_PRESETS.length - 1, activeIdx + 1);
    onChange(PROPORTIONAL_PRESETS[n][1]);
  };

  const activeLabel = PROPORTIONAL_PRESETS[activeIdx][0];
  const activeShort = PRESET_SHORT[activeLabel] ?? activeLabel;

  const toggleAuto = () => {
    if (disabled) return;
    if (isAuto) {
      onChange(PROPORTIONAL_PRESETS[activeIdx][1]);
    } else {
      onChange(STEPPED_PRESET);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-(--text-muted) uppercase tracking-wide">Break model</span>

      <div className="flex items-center gap-3">
        {/* Carousel + dots — grouped so dots center under the arrows */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={disabled || isAuto || activeIdx === 0}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-(--glass-border) text-(--text-secondary) hover:border-brand-ft-work hover:text-brand-ft-work disabled:opacity-25 transition-colors"
              aria-label="Previous preset"
            >
              ‹
            </button>

            <div className={`w-16 text-center font-bold text-lg tabular-nums transition-colors ${isAuto ? "text-(--text-muted)" : "text-(--text-primary)"}`}>
              {activeShort}
            </div>

            <button
              onClick={next}
              disabled={disabled || isAuto || activeIdx === PROPORTIONAL_PRESETS.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-(--glass-border) text-(--text-secondary) hover:border-brand-ft-work hover:text-brand-ft-work disabled:opacity-25 transition-colors"
              aria-label="Next preset"
            >
              ›
            </button>
          </div>

          {/* Dots — centered under carousel */}
          <div className="flex gap-1.5">
            {PROPORTIONAL_PRESETS.map(([label], i) => (
              <button
                key={label}
                onClick={() => !disabled && !isAuto && onChange(PROPORTIONAL_PRESETS[i][1])}
                aria-label={label}
                className={`rounded-full transition-colors ${
                  !isAuto && i === activeIdx
                    ? "w-2 h-2 bg-brand-ft-work"
                    : "w-1.5 h-1.5 bg-(--border-default) hover:bg-(--text-muted)"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Auto toggle with checkbox */}
        <button
          onClick={toggleAuto}
          disabled={disabled}
          aria-pressed={isAuto}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors disabled:opacity-40 ${
            isAuto
              ? "bg-brand-ft-work border-brand-ft-work text-white"
              : "border-(--border-default) text-(--text-secondary) hover:border-brand-ft-work hover:text-brand-ft-work"
          }`}
        >
          {/* Checkbox icon */}
          <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
            isAuto ? "border-white bg-white/20" : "border-current"
          }`}>
            {isAuto && (
              <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white stroke-2 stroke-linecap-round stroke-linejoin-round">
                <polyline points="1,4 3.5,6.5 9,1" />
              </svg>
            )}
          </span>
          Auto
        </button>
      </div>

      {/* Hint below */}
      <p className="text-xs text-(--text-muted) text-center mt-0.5">
        {isAuto
          ? "Auto breaks: 5 / 8 / 10 / 15 min by focus length"
          : `1 min rest per ${config.breakRatio} min focus`}
      </p>
    </div>
  );
}
