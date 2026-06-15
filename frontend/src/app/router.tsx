import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { Spinner } from "@/shared/components/feedback/Spinner";

// Ruta crítica (timers) → en el chunk inicial para que arranquen sin spinner.
import PomodoroPage from "@/pages/PomodoroPage";
import FlowtimePage from "@/pages/FlowtimePage";
import BolsaPage from "@/pages/BolsaPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import SettingsPage from "@/pages/SettingsPage";

// Dashboard y Sessions se cargan en chunks aparte: son las únicas que arrastran
// recharts (vía FocusChart) y deja el chunk inicial por debajo del presupuesto.
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const SessionsPage = lazy(() => import("@/pages/SessionsPage"));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-page)">
      <Spinner size="lg" />
    </div>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  // Rutas públicas
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.REGISTER, element: <RegisterPage /> },

  // Timers y settings: accesibles sin cuenta
  { path: ROUTES.SETTINGS, element: <SettingsPage /> },
  { path: ROUTES.DASHBOARD, element: withSuspense(<DashboardPage />) },
  { path: ROUTES.POMODORO, element: <PomodoroPage /> },
  { path: ROUTES.FLOWTIME, element: <FlowtimePage /> },
  { path: ROUTES.BOLSA, element: <BolsaPage /> },

  // Historial: requiere autenticación
  {
    path: ROUTES.SESSIONS,
    element: (
      <ProtectedRoute>{withSuspense(<SessionsPage />)}</ProtectedRoute>
    ),
  },

  // 404 — redirect to dashboard
  { path: "*", element: <Navigate to={ROUTES.DASHBOARD} replace /> },
]);
