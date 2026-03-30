import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import DashboardPage from "@/pages/DashboardPage";
import PomodoroPage from "@/pages/PomodoroPage";
import FlowtimePage from "@/pages/FlowtimePage";
import BolsaPage from "@/pages/BolsaPage";
import SessionsPage from "@/pages/SessionsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

export const router = createBrowserRouter([
  // Rutas públicas
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.REGISTER, element: <RegisterPage /> },

  // Timers: accesibles sin cuenta — se pide login solo al guardar
  { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
  { path: ROUTES.POMODORO, element: <PomodoroPage /> },
  { path: ROUTES.FLOWTIME, element: <FlowtimePage /> },
  { path: ROUTES.BOLSA, element: <BolsaPage /> },

  // Historial: requiere autenticación
  {
    path: ROUTES.SESSIONS,
    element: (
      <ProtectedRoute>
        <SessionsPage />
      </ProtectedRoute>
    ),
  },
]);
