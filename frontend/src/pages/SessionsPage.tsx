import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/shared/components/layout/Header";
import { SessionCard } from "@/features/sessions/components/SessionCard";
import { sessionsService } from "@/features/sessions/services/sessions.service";

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
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="pt-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          Historial de sesiones
        </h1>

        {isLoading && (
          <p className="text-[var(--text-muted)] text-sm">Cargando...</p>
        )}

        {!isLoading && data?.sessions.length === 0 && (
          <p className="text-[var(--text-muted)] text-sm">
            Aún no tienes sesiones. ¡Empieza tu primer Pomodoro!
          </p>
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
