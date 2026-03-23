import type { FocusSession } from "@/features/sessions/types/session.types";

const TECHNIQUE_LABELS: Record<string, string> = {
  pomodoro: "Pomodoro",
  flowtime: "Flowtime",
  bolsa: "Bolsa de Tiempo",
};

interface SessionCardProps {
  session: FocusSession;
  onDelete?: (id: number) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const date = new Date(session.started_at).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] hover:bg-[var(--bg-card-hover)] transition-colors">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-brand-tomato uppercase tracking-wide">
            {TECHNIQUE_LABELS[session.technique] ?? session.technique}
          </span>
          {session.completed && (
            <span className="text-xs text-green-500">✓ Completada</span>
          )}
        </div>
        {session.task_name && (
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {session.task_name}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{date}</span>
          <span>·</span>
          <span>{formatDuration(session.total_work_seconds)} de trabajo</span>
          {session.pomodoro_details && (
            <>
              <span>·</span>
              <span>{session.pomodoro_details.pomodoros_completed} pomodoros</span>
            </>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(session.id)}
          aria-label="Eliminar sesión"
          className="text-[var(--text-muted)] hover:text-red-400 transition-colors shrink-0 text-lg"
        >
          ×
        </button>
      )}
    </div>
  );
}
