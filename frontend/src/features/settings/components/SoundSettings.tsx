interface Props {
  soundEnabled: boolean;
  tickEnabled: boolean;
  onChange: (patch: { sound_enabled?: boolean; tick_enabled?: boolean }) => void;
}

export function SoundSettings({ soundEnabled, tickEnabled, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Notification sounds
        </span>
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(e) => onChange({ sound_enabled: e.target.checked })}
          className="w-4 h-4 accent-brand-tomato"
        />
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Timer tick sound
        </span>
        <input
          type="checkbox"
          checked={tickEnabled}
          onChange={(e) => onChange({ tick_enabled: e.target.checked })}
          className="w-4 h-4 accent-brand-tomato"
        />
      </label>
    </div>
  );
}
