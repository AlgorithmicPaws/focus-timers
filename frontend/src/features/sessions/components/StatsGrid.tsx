import { useSessionStats } from "@/features/sessions/hooks/useSessions";
import type { SessionInterval } from "@/features/sessions/types/session.types";

const TECHNIQUE_LABELS: Record<string, string> = {
  pomodoro: "Pomodoro",
  flowtime: "Flowtime",
  bolsa: "Time Budget",
};

interface StatsGridProps {
  interval?: SessionInterval;
}

export function StatsGrid({ interval }: StatsGridProps) {
  const { data, isLoading } = useSessionStats(interval);

  if (isLoading) return <div className="h-24 animate-pulse rounded-xl bg-(--glass-border)" />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Sessions" value={String(data.total_sessions)} />
        <StatCard label="Focus minutes" value={String(Math.round(data.total_focus_minutes))} />
        <StatCard
          label="Focus hours"
          value={(data.total_focus_minutes / 60).toFixed(1)}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {Object.keys(data.by_technique).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.entries(data.by_technique) as [string, (typeof data.by_technique)[string]][]).map(
            ([tech, stats]) => (
              <div
                key={tech}
                className="rounded-xl border border-(--glass-border) bg-(--glass-bg) p-3 flex flex-col gap-1"
              >
                <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">
                  {TECHNIQUE_LABELS[tech] ?? tech}
                </p>
                <p className="text-xl font-bold">{stats.total_sessions}</p>
                <p className="text-xs text-(--text-muted)">
                  {Math.round(stats.total_work_minutes)} min ·{" "}
                  {Math.round(stats.completion_rate * 100)}% completed
                </p>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-(--glass-border) bg-(--glass-bg) p-3 flex flex-col gap-0.5 ${className}`}>
      <p className="text-xs text-(--text-muted)">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
