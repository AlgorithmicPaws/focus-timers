interface FlowNudgeProps {
  elapsedSec: number;
  onDismiss: () => void;
  onTakeBreak: () => void;
}

export function FlowNudge({ elapsedSec, onDismiss, onTakeBreak }: FlowNudgeProps) {
  const hours = Math.floor(elapsedSec / 3600);
  const mins = Math.floor((elapsedSec % 3600) / 60);
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
      <div className="rounded-2xl bg-(--bg-card) border border-(--glass-border) shadow-glass px-5 py-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">Still in flow?</p>
            <p className="text-xs text-(--text-muted) mt-0.5">
              You've been working for {timeLabel}. Your brain might need a break.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-(--text-muted) hover:text-(--text-primary) text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onTakeBreak}
            className="flex-1 text-xs font-semibold py-2 rounded-xl bg-brand-ft-rest text-brand-ft-work hover:opacity-90 transition-opacity"
          >
            Take a break
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 text-xs font-semibold py-2 rounded-xl border border-(--glass-border) text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
            Keep going
          </button>
        </div>
      </div>
    </div>
  );
}
