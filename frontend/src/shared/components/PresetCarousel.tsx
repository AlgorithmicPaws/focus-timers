// Accent variants map to full Tailwind class strings to avoid dynamic class purging
const ACCENT = {
  tomato: {
    hover: "hover:border-brand-tomato hover:text-brand-tomato",
    dot: "bg-brand-tomato",
  },
  blue: {
    hover: "hover:border-brand-ft-work hover:text-brand-ft-work",
    dot: "bg-brand-ft-work",
  },
  green: {
    hover: "hover:border-brand-bl-work hover:text-brand-bl-work",
    dot: "bg-brand-bl-work",
  },
} as const;

type AccentVariant = keyof typeof ACCENT;

interface PresetCarouselProps {
  label: string;
  options: number[];
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  accent?: AccentVariant;
  disabled?: boolean;
}

export function PresetCarousel({
  label,
  options,
  value,
  onChange,
  format,
  accent = "tomato",
  disabled = false,
}: PresetCarouselProps) {
  const { hover, dot } = ACCENT[accent];
  const idx = Math.max(0, options.indexOf(value));
  const prev = () => onChange(options[Math.max(0, idx - 1)]);
  const next = () => onChange(options[Math.min(options.length - 1, idx + 1)]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-(--text-muted) uppercase tracking-wide">{label}</span>

      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={disabled || idx === 0}
          className={`w-7 h-7 flex items-center justify-center rounded-full border border-(--glass-border) text-(--text-secondary) ${hover} disabled:opacity-25 transition-colors`}
          aria-label={`Decrease ${label}`}
        >
          ‹
        </button>

        <div className="w-14 text-center font-bold text-lg text-(--text-primary) tabular-nums">
          {format(value)}
        </div>

        <button
          onClick={next}
          disabled={disabled || idx === options.length - 1}
          className={`w-7 h-7 flex items-center justify-center rounded-full border border-(--glass-border) text-(--text-secondary) ${hover} disabled:opacity-25 transition-colors`}
          aria-label={`Increase ${label}`}
        >
          ›
        </button>
      </div>

      <div className="flex gap-1.5" role="tablist">
        {options.map((opt, i) => (
          <button
            key={opt}
            role="tab"
            aria-selected={i === idx}
            onClick={() => !disabled && onChange(options[i])}
            className={`rounded-full transition-colors ${
              i === idx ? `w-2 h-2 ${dot}` : "w-1.5 h-1.5 bg-(--border-default) hover:bg-(--text-muted)"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
