import { Link } from "react-router-dom";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { StatsGrid } from "@/features/sessions/components/StatsGrid";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useSessions } from "@/features/sessions/hooks/useSessions";
import { ROUTES } from "@/shared/constants/routes";
import pomodoroSvg from "@/assets/images/pomodoro.svg";
import flowtimeSvg from "@/assets/images/flowtime.svg";
import timebagSvg from "@/assets/images/timebag.svg";

const TECHNIQUES = [
  {
    img: pomodoroSvg,
    alt: "Pomodoro",
    title: "Pomodoro",
    desc: "25 min focus sprints with 5 min breaks. Great for tasks with a clear scope and those who need structure.",
    ideal: "Students · focused work",
    route: ROUTES.POMODORO,
  },
  {
    img: flowtimeSvg,
    alt: "Flowtime",
    title: "Flowtime",
    desc: "Work without a time limit and rest proportionally. Designed to protect your flow state.",
    ideal: "Developers · creative work",
    route: ROUTES.FLOWTIME,
  },
  {
    img: timebagSvg,
    alt: "Time Budget",
    title: "Time Budget",
    desc: "Set a work block and a break budget. One of a kind — no other app implements this technique.",
    ideal: "Long sessions · deep work blocks",
    route: ROUTES.BOLSA,
  },
];

function DailyGoalProgress() {
  const { settings } = useSettings();
  const { data } = useSessions({ interval: 'week', limit: 200 });

  const goalMin = settings?.daily_goal_min ?? 120;

  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = data?.sessions.filter(
    (s) => s.started_at.slice(0, 10) === today
  ) ?? [];
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.total_work_seconds / 60, 0);
  const pct = Math.min(100, (todayMinutes / goalMin) * 100);
  const reached = todayMinutes >= goalMin;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Today's goal
        </span>
        <span className="text-sm font-semibold" style={{ color: reached ? 'var(--color-brand-bl-work)' : 'var(--text-primary)' }}>
          {reached ? '🎯 Goal reached!' : `${Math.round(todayMinutes)} / ${goalMin} min`}
        </span>
      </div>
      <div className="h-2.5 rounded-full" style={{ background: 'var(--border-soft)' }}>
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: reached ? 'var(--color-brand-bl-work)' : 'var(--color-brand-tomato)',
          }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <Header />
      <main className="pt-32 px-8 max-w-5xl mx-auto pb-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-(--text-primary) text-center mb-4">
          Online timers to focus on your work
        </h1>
        <p className="text-lg text-(--text-tertiary) text-center mb-14">
          Choose a technique and start tracking your productivity
        </p>

        <div className="grid sm:grid-cols-3 gap-8">
          {TECHNIQUES.map((t) => (
            <div
              key={t.title}
              className="bg-(--bg-card) rounded-2xl shadow-card p-8 flex flex-col items-center gap-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-250"
            >
              <div className="w-20 h-20 flex items-center justify-center">
                <img src={t.img} alt={t.alt} className="w-full h-full object-contain" />
              </div>
              <div className="text-center flex-1">
                <h2 className="text-xl font-semibold text-(--text-primary)">{t.title}</h2>
                <p className="text-sm text-(--text-tertiary) mt-2 leading-relaxed">{t.desc}</p>
                <p className="text-xs text-(--text-muted) mt-3 font-medium">{t.ideal}</p>
              </div>
              <Link to={t.route} className="w-full">
                <Button variant="cta" size="lg" className="w-full">
                  Use →
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {isAuthenticated && (
          <div className="mt-14 flex flex-col gap-6">
            <DailyGoalProgress />
            <div>
              <p className="text-xs text-(--text-muted) uppercase tracking-widest font-medium mb-4 text-center">This week</p>
              <StatsGrid interval="week" />
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to={ROUTES.SESSIONS} className="text-base text-(--text-link) hover:underline">
            View session history →
          </Link>
        </div>
      </main>
    </div>
  );
}
