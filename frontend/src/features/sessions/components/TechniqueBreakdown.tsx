import type { StatsResponse } from '../types/session.types';

const TECHNIQUE_CONFIG = {
  pomodoro: { label: 'Pomodoro', color: '#ff7b61' },    // brand-focus (naranja)
  flowtime: { label: 'Flowtime', color: '#4f6ef7' },    // brand-ft-work (azul)
  bolsa: { label: 'Time Budget', color: '#7daa6c' }, // brand-bl-work (verde)
} as const;

interface Props {
  stats: StatsResponse | undefined;
}

export function TechniqueBreakdown({ stats }: Props) {
  if (!stats || stats.total_sessions === 0) return null;

  const totalMinutes = stats.total_focus_minutes;

  return (
    <div
      className="rounded-2xl p-4 sm:p-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Breakdown by technique
      </h3>

      <div className="flex flex-col gap-3">
        {Object.entries(stats.by_technique).map(([key, data]) => {
          const config = TECHNIQUE_CONFIG[key as keyof typeof TECHNIQUE_CONFIG];
          if (!config) return null;
          const pct = totalMinutes > 0 ? Math.round((data.total_work_minutes / totalMinutes) * 100) : 0;

          return (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {config.label}
                </span>
                <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{data.total_sessions} sessions</span>
                  <span>{Math.round(data.total_work_minutes)} min</span>
                  <span className="font-semibold" style={{ color: config.color }}>{pct}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--border-soft)' }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: config.color }}
                />
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Completed: {Math.round(data.completion_rate)}%</span>
                <span>Avg: {Math.round(data.avg_work_minutes)} min/session</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
