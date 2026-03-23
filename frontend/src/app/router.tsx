import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import DashboardPage from "@/pages/DashboardPage";
import PomodoroPage from "@/pages/PomodoroPage";
import SessionsPage from "@/pages/SessionsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.POMODORO,
    element: (
      <ProtectedRoute>
        <PomodoroPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SESSIONS,
    element: (
      <ProtectedRoute>
        <SessionsPage />
      </ProtectedRoute>
    ),
  },
]);
