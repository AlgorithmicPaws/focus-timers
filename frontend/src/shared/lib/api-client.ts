import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { toast } from "@/shared/components/Toast";

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

// Manejar 401: cerrar sesión SIN recarga dura (bug #7).
// Excluir endpoints de auth para que los formularios de login/register manejen el error.
//
// En vez de `window.location.href` (recarga dura que desmonta la SPA y destruye un
// timer en curso) solo limpiamos el estado de auth y avisamos con un toast. La
// navegación es reactiva: `ProtectedRoute` está suscrito a `isAuthenticated`, así
// que al hacer logout() redirige a /login SOLO en rutas protegidas (p. ej. /sessions);
// en las rutas públicas (los timers) la SPA permanece intacta y el contador sigue.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const { isAuthenticated, logout } = useAuthStore.getState();
      // Solo reaccionar si había una sesión: evita toasts en navegación anónima.
      if (isAuthenticated) {
        logout();
        toast("Tu sesión ha expirado. Inicia sesión de nuevo.", "error");
      }
    }
    return Promise.reject(error);
  },
);
