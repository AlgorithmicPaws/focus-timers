interface Props {
  value: number;
  onChange: (minutes: number) => void;
}

export function DailyGoalSetter({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Daily goal
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-brand-tomato)' }}>
          {value} min
        </span>
      </div>
      <input
        type="range"
        min={15}
        max={480}
        step={15}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-tomato"
      />
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>15 min</span>
        <span>8 h</span>
      </div>
    </div>
  );
}
