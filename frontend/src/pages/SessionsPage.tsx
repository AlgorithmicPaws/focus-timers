import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/shared/components/layout/Header";
import { SessionCard } from "@/features/sessions/components/SessionCard";
import { sessionsService } from "@/features/sessions/services/sessions.service";
import tomatoSvg from "@/assets/images/tomato.svg";

export default function SessionsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionsService.list({ limit: 50 }),
  });

  const { mutate: deleteSession } = useMutation({
    mutationFn: sessionsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <Header />
      <main className="pt-28 px-6 max-w-3xl mx-auto pb-16">
        <h1 className="text-2xl font-bold text-(--text-primary) mb-6">
          Session history
        </h1>

        {isLoading && (
          <p className="text-(--text-tertiary) text-sm">Loading...</p>
        )}

        {!isLoading && data?.sessions.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 opacity-40 mx-auto">
              <img src={tomatoSvg} alt="" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-(--text-secondary)">No sessions yet</h3>
            <p className="text-(--text-tertiary) max-w-xs text-sm">
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