import { Link } from "react-router-dom";
import { Header } from "@/shared/components/layout/Header";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";
import pomodoroSvg from "@/assets/images/pomodoro.svg";
import flowtimeSvg from "@/assets/images/flowtime.svg";
import timebagSvg from "@/assets/images/timebag.svg";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-(--bg-page)">
      <Header />
      <main className="pt-32 px-8 max-w-5xl mx-auto pb-20">
        <h1 className="text-5xl font-bold text-(--text-primary) text-center mb-4">
          Online timers to focus on your work
        </h1>
        <p className="text-lg text-(--text-tertiary) text-center mb-14">
          Choose a technique and start tracking your productivity
        </p>

        <div className="grid sm:grid-cols-3 gap-8">
          {/* Pomodoro — active */}
          <div className="bg-(--bg-card) rounded-2xl shadow-card p-8 flex flex-col items-center gap-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-250">
            <div className="w-24 h-24 flex items-center justify-center">
              <img src={pomodoroSvg} alt="Pomodoro" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-(--text-primary)">Pomodoro</h2>
              <p className="text-base text-(--text-tertiary) mt-2">
                25 min focus · 5 min rest
              </p>
            </div>
            <Link to={ROUTES.POMODORO} className="w-full">
              <Button variant="cta" size="lg" className="w-full" style={{ backgroundColor: "#f5421f", color: "white" }}>Use →</Button>
            </Link>
          </div>

          {/* Flowtime — coming soon */}
          <div className="bg-(--bg-card) rounded-2xl shadow-card p-8 flex flex-col items-center gap-6 opacity-50">
            <div className="w-24 h-24 flex items-center justify-center">
              <img src={flowtimeSvg} alt="Flowtime" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-(--text-primary)">Flowtime</h2>
              <p className="text-base text-(--text-tertiary) mt-2">
                Work without limit · rest proportionally
              </p>
            </div>
            <Button variant="secondary" size="lg" disabled className="w-full">Coming soon</Button>
          </div>

          {/* Time Budget — coming soon */}
          <div className="bg-(--bg-card) rounded-2xl shadow-card p-8 flex flex-col items-center gap-6 opacity-50">
            <div className="w-24 h-24 flex items-center justify-center">
              <img src={timebagSvg} alt="Time Budget" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-(--text-primary)">Time Budget</h2>
              <p className="text-base text-(--text-tertiary) mt-2">
                Time budget · unique in its kind
              </p>
            </div>
            <Button variant="secondary" size="lg" disabled className="w-full">Coming soon</Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to={ROUTES.SESSIONS} className="text-base text-(--text-link) hover:underline">
            View session history →
          </Link>
        </div>
      </main>
    </div>
  );
}
