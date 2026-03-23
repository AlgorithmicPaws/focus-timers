import { apiClient } from "@/shared/lib/api-client";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/features/auth/types/auth.types";

export const authService = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/register", data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/login", data);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>("/users/me");
    return res.data;
  },
};
