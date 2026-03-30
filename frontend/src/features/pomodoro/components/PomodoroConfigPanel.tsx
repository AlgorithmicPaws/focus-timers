import type { PomodoroConfig } from "@/features/timer/hooks/usePomodoroTimer";
import { PresetCarousel } from "@/shared/components/PresetCarousel";

const FOCUS_PRESETS = [15, 20, 25, 30, 45, 60]; // minutes
const SHORT_BREAK_PRESETS = [5, 10, 15];
const LONG_BREAK_PRESETS = [15, 20, 30];
const POMODOROS_PRESETS = [2, 3, 4, 5, 6, 8];

interface PomodoroConfigPanelProps {
  config: PomodoroConfig;
  onChange: (config: PomodoroConfig) => void;
}

export function PomodoroConfigPanel({ config, onChange }: PomodoroConfigPanelProps) {
  const set = (patch: Partial<PomodoroConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-around flex-wrap gap-4">
        <PresetCarousel
          label="Focus"
          options={FOCUS_PRESETS}
          value={config.focusSec / 60}
          onChange={(m) => set({ focusSec: m * 60 })}
          format={(m) => `${m}m`}
          accent="tomato"
        />
        <PresetCarousel
          label="Short break"
          options={SHORT_BREAK_PRESETS}
          value={config.shortBreakSec / 60}
          onChange={(m) => set({ shortBreakSec: m * 60 })}
          format={(m) => `${m}m`}
          accent="tomato"
        />
        <PresetCarousel
          label="Long break"
          options={LONG_BREAK_PRESETS}
          value={config.longBreakSec / 60}
          onChange={(m) => set({ longBreakSec: m * 60 })}
          format={(m) => `${m}m`}
          accent="tomato"
        />
      </div>

      {/* Pomodoros target — dots represent each pomodoro slot */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-(--text-muted) uppercase tracking-wide">Pomodoros</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => set({ pomodorosTarget: Math.max(POMODOROS_PRESETS[0], config.pomodorosTarget - 1) })}
            disabled={config.pomodorosTarget <= POMODOROS_PRESETS[0]}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-(--glass-border) text-(--text-secondary) hover:border-brand-tomato hover:text-brand-tomato disabled:opacity-25 transition-colors"
          >
            ‹
          </button>
          <div className="w-14 text-center font-bold text-lg text-(--text-primary) tabular-nums">
            {config.pomodorosTarget}
          </div>
          <button
            onClick={() => set({ pomodorosTarget: Math.min(POMODOROS_PRESETS[POMODOROS_PRESETS.length - 1], config.pomodorosTarget + 1) })}
            disabled={config.pomodorosTarget >= POMODOROS_PRESETS[POMODOROS_PRESETS.length - 1]}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-(--glass-border) text-(--text-secondary) hover:border-brand-tomato hover:text-brand-tomato disabled:opacity-25 transition-colors"
          >
            ›
          </button>
        </div>

        {/* One dot per pomodoro slot */}
        <div className="flex gap-2">
          {Array.from({ length: config.pomodorosTarget }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full border-2 border-brand-tomato" />
          ))}
        </div>
      </div>
    </div>
  );
}