import { apiClient } from "@/shared/lib/api-client";
import type {
  CreateSessionPayload,
  FocusSession,
  SessionListResponse,
  Technique,
} from "@/features/sessions/types/session.types";

export const sessionsService = {
  create: async (data: CreateSessionPayload): Promise<FocusSession> => {
    const res = await apiClient.post<FocusSession>("/sessions/", data);
    return res.data;
  },

  list: async (params?: {
    technique?: Technique;
    limit?: number;
    offset?: number;
  }): Promise<SessionListResponse> => {
    const res = await apiClient.get<SessionListResponse>("/sessions/", { params });
    return res.data;
  },

  delete: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },
};
