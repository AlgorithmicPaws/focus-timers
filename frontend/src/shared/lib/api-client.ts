import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ROUTES } from "@/shared/constants/routes";

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Inyectar token en cada petición
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar 401: limpiar sesión y redirigir a login
// Excluir endpoints de auth para que los formularios de login/register manejen el error
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(error);
  },
);
