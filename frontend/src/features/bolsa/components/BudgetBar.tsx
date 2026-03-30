import { formatSeconds } from "@/features/timer/utils/time.utils";

interface BudgetBarProps {
  budgetSec: number;
  remainingSec: number;
  exhausted: boolean;
}

export function BudgetBar({ budgetSec, remainingSec, exhausted }: BudgetBarProps) {
  const usedPct = budgetSec > 0 ? ((budgetSec - remainingSec) / budgetSec) * 100 : 0;

  const barColor =
    exhausted || usedPct > 75
      ? "bg-brand-bl-alert"
      : usedPct > 50
        ? "bg-yellow-400"
        : "bg-brand-bl-work";

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-(--text-muted)">
        <span>Break budget</span>
        <span className={exhausted ? "text-brand-bl-alert font-semibold" : ""}>
          {exhausted ? "Exhausted!" : formatSeconds(remainingSec)} remaining
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-(--glass-border) overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${Math.min(usedPct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-(--text-muted)">
        <span>0</span>
        <span>{formatSeconds(budgetSec)}</span>
      </div>
    </div>
  );
}
