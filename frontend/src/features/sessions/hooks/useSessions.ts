import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsService } from "@/features/sessions/services/sessions.service";
import type { SessionFilter } from "@/features/sessions/types/session.types";

export function useSessions(filters?: SessionFilter & { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => sessionsService.list(filters),
  });
}

export function useSessionStats(interval?: string) {
  return useQuery({
    queryKey: ["session-stats", interval],
    queryFn: () => sessionsService.getStats(interval),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session-stats"] });
    },
  });
}
