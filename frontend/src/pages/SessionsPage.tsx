import { useState } from "react";
import { Header } from "@/shared/components/layout/Header";
import { SessionCard } from "@/features/sessions/components/SessionCard";
import { StatsGrid } from "@/features/sessions/components/StatsGrid";
import { IntervalFilter } from "@/features/sessions/components/IntervalFilter";
import { FocusChart } from "@/features/sessions/components/FocusChart";
import { TechniqueBreakdown } from "@/features/sessions/components/TechniqueBreakdown";
import { useSessions, useDeleteSession, useSessionStats } from "@/features/sessions/hooks/useSessions";
import { Spinner } from "@/shared/components/feedback/Spinner";
import tomatoSvg from "@/assets/images/tomato.svg";
import type { SessionInterval, Technique } from "@/features/sessions/types/session.types";

const TECHNIQUE_OPTIONS: { label: string; value: Technique | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pomodoro", value: "pomodoro" },
  { label: "Flowtime", value: "flowtime" },
  { label: "Time Budget", value: "bolsa" },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
      viewBox="0 0 16 16" fill="none"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DropdownSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) transition-colors mb-3 w-full text-left"
      >
        <Chevron open={open} />
        {label}
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "1200px" : "0px", opacity: open ? 1 : 0 }}
      >
        {children}
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const [technique, setTechnique] = useState<Technique | undefined>();
  const [interval, setInterval] = useState<SessionInterval | undefined>("week");
  const [chartsOpen, setChartsOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  const { data, isLoading } = useSessions({ technique, interval, limit: 200 });
  const { mutate: deleteSession } = useDeleteSession();
  const { data: stats } = useSessionStats(interval);

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <Header />
      <main className="pt-28 px-6 max-w-3xl mx-auto pb-16 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-(--text-primary)">Session history</h1>

        {/* 1. Stats — always visible */}
        <StatsGrid interval={interval} />

        {/* 2. Filters — fixed position, never move */}
        <div className="flex flex-col gap-3">
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

        {/* 3. Charts dropdown */}
        <DropdownSection label="Charts" open={chartsOpen} onToggle={() => setChartsOpen((o) => !o)}>
          <div className="flex flex-col gap-4 pb-2">
            {interval ? (
              <>
                <FocusChart sessions={data?.sessions ?? []} interval={interval} />
                <TechniqueBreakdown stats={stats} />
              </>
            ) : (
              <p className="text-sm text-(--text-muted)">Select a time period to see charts.</p>
            )}
          </div>
        </DropdownSection>

        {/* 4. Session history dropdown */}
        <DropdownSection label="History" open={historyOpen} onToggle={() => setHistoryOpen((o) => !o)}>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : data?.sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 opacity-40 mx-auto">
                <img src={tomatoSvg} alt="" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-semibold text-(--text-secondary)">No sessions yet</h3>
              <p className="text-(--text-muted) max-w-xs text-sm">
                Start your first timer and begin tracking your productivity!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-2">
              {data?.sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={(id) => deleteSession(id)}
                />
              ))}
            </div>
          )}
        </DropdownSection>
      </main>
    </div>
  );
}
