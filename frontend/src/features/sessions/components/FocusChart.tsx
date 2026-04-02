import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { FocusSession, SessionInterval } from '../types/session.types';

interface ChartDataPoint {
  day: string;
  pomodoro: number;
  flowtime: number;
  bolsa: number;
}

function buildChartData(sessions: FocusSession[], interval: SessionInterval): ChartDataPoint[] {
  const map = new Map<string, ChartDataPoint>();

  const dayCount = interval === 'week' ? 7 : interval === 'month' ? 30 : interval === '3months' ? 90 : 365;
  const now = new Date();

  // Inicializar días con ceros
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (!map.has(key)) {
      map.set(key, { day: key, pomodoro: 0, flowtime: 0, bolsa: 0 });
    }
  }

  // Acumular minutos por técnica y día
  for (const s of sessions) {
    const d = new Date(s.started_at);
    const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    const point = map.get(key);
    if (point) {
      const minutes = Math.round(s.total_work_seconds / 60);
      if (s.technique === 'pomodoro') point.pomodoro += minutes;
      else if (s.technique === 'flowtime') point.flowtime += minutes;
      else if (s.technique === 'bolsa') point.bolsa += minutes;
    }
  }

  // Para intervals largos, mostrar solo semanas para no saturar el eje X
  const data = Array.from(map.values());
  if (dayCount > 30) {
    return data.filter((_, i) => i % 7 === 0);
  }
  return data;
}

interface Props {
  sessions: FocusSession[];
  interval: SessionInterval;
}

const COLORS = {
  pomodoro: '#ff7b61', // brand-focus (naranja)
  flowtime: '#4f6ef7', // brand-ft-work (azul)
  bolsa: '#7daa6c',    // brand-bl-work (verde)
};

export function FocusChart({ sessions, interval }: Props) {
  const data = buildChartData(sessions, interval);
  const hasData = data.some((d) => d.pomodoro > 0 || d.flowtime > 0 || d.bolsa > 0);

  if (!hasData) {
    return (
      <div
        className="rounded-2xl p-6 flex items-center justify-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', minHeight: 160 }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No data for the selected period
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 sm:p-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Focus minutes per day
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-primary)',
            }}
            formatter={(value, name) => [`${value} min`, name as string]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
          />
          <Bar dataKey="pomodoro" stackId="a" fill={COLORS.pomodoro} radius={[0, 0, 0, 0]} name="Pomodoro" />
          <Bar dataKey="flowtime" stackId="a" fill={COLORS.flowtime} radius={[0, 0, 0, 0]} name="Flowtime" />
          <Bar dataKey="bolsa" stackId="a" fill={COLORS.bolsa} radius={[4, 4, 0, 0]} name="Bolsa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
