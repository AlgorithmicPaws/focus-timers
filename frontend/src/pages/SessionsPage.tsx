import { useState } from "react";
import { Header } from "@/shared/components/layout/Header";
import { SessionCard } from "@/features/sessions/components/SessionCard";
import { StatsGrid } from "@/features/sessions/components/StatsGrid";
import { IntervalFilter } from "@/features/sessions/components/IntervalFilter";
import { useSessions, useDeleteSession } from "@/features/sessions/hooks/useSessions";
import { Spinner } from "@/shared/components/feedback/Spinner";
import tomatoSvg from "@/assets/images/tomato.svg";
import type { SessionInterval, Technique } from "@/features/sessions/types/session.types";

const TECHNIQUE_OPTIONS: { label: string; value: Technique | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pomodoro", value: "pomodoro" },
  { label: "Flowtime", value: "flowtime" },
  { label: "Time Budget", value: "bolsa" },
];

export default function SessionsPage() {
  const [technique, setTechnique] = useState<Technique | undefined>();
  const [interval, setInterval] = useState<SessionInterval | undefined>();

  const { data, isLoading } = useSessions({ technique, interval, limit: 50 });
  const { mutate: deleteSession } = useDeleteSession();

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <Header />
      <main className="pt-28 px-6 max-w-3xl mx-auto pb-16">
        <h1 className="text-2xl font-bold text-(--text-primary) mb-6">Session history</h1>

        <div className="mb-6">
          <StatsGrid interval={interval} />
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <IntervalFilter value={interval} onChange={setInterval} />
          <div className="flex flex-wrap gap-2">
            {TECHNIQUE_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setTechnique(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  technique === opt.value
                    ? "bg-(--text-primary) text-(--bg-page) border-(--text-primary)"
                    : "border-(--glass-border) text-(--text-muted) hover:border-(--text-primary) hover:text-(--text-primary)"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && data?.sessions.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 opacity-40 mx-auto">
              <img src={tomatoSvg} alt="" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-(--text-secondary)">No sessions yet</h3>
            <p className="text-(--text-muted) max-w-xs text-sm">
              Start your first timer and begin tracking your productivity!
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {data?.sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={(id) => deleteSession(id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
