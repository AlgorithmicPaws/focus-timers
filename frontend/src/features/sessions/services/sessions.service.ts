import { apiClient } from "@/shared/lib/api-client";
import type {
  CreateSessionPayload,
  FocusSession,
  SessionFilter,
  SessionListResponse,
  StatsResponse,
} from "@/features/sessions/types/session.types";

export const sessionsService = {
  create: async (data: CreateSessionPayload): Promise<FocusSession> => {
    const res = await apiClient.post<FocusSession>("/sessions/", data);
    return res.data;
  },

  list: async (filters?: SessionFilter & { limit?: number; offset?: number }): Promise<SessionListResponse> => {
    const params: Record<string, string | number> = {};
    if (filters?.technique) params.technique = filters.technique;
    if (filters?.interval) params.interval = filters.interval;
    if (filters?.project) params.project = filters.project;
    if (filters?.limit !== undefined) params.limit = filters.limit;
    if (filters?.offset !== undefined) params.offset = filters.offset;
    const res = await apiClient.get<SessionListResponse>("/sessions/", { params });
    return res.data;
  },

  getStats: async (interval?: string): Promise<StatsResponse> => {
    const params = interval ? { interval } : {};
    const res = await apiClient.get<StatsResponse>("/sessions/stats", { params });
    return res.data;
  },

  delete: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },
};
