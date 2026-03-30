import type { SessionInterval } from "@/features/sessions/types/session.types";

const OPTIONS: { label: string; value: SessionInterval | undefined }[] = [
  { label: "All time", value: undefined },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "3 months", value: "3months" },
  { label: "Year", value: "year" },
];

interface IntervalFilterProps {
  value: SessionInterval | undefined;
  onChange: (value: SessionInterval | undefined) => void;
}

export function IntervalFilter({ value, onChange }: IntervalFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          aria-label={`Filter by ${opt.label}`}
          aria-pressed={value === opt.value}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            value === opt.value
              ? "bg-brand-tomato text-white border-brand-tomato"
              : "border-(--glass-border) text-(--text-muted) hover:border-brand-tomato hover:text-brand-tomato"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
