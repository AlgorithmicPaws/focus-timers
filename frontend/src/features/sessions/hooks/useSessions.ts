import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsService } from "@/features/sessions/services/sessions.service";
import type { Technique } from "@/features/sessions/types/session.types";

export function useSessions(params?: { technique?: Technique; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["sessions", params],
    queryFn: () => sessionsService.list(params),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });
}