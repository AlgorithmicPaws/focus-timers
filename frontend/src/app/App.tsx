import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { queryClient } from "@/shared/lib/query-client";
import { router } from "./router";
import { ToastProvider } from "@/shared/components/Toast";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "dark";
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);
  return <>{children}</>;
}

function ErrorFallback({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-page) px-4">
      <div className="text-center flex flex-col gap-4 max-w-sm">
        <p className="text-lg font-semibold text-(--text-primary)">Something went wrong</p>
        <p className="text-sm text-(--text-muted)">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-(--text-link) hover:underline"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider />
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
