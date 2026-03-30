import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

interface AuthPromptProps {
  onClose: () => void;
}

export function AuthPrompt({ onClose }: AuthPromptProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
      <div className="rounded-2xl bg-(--bg-card) border border-(--glass-border) shadow-glass px-5 py-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">Session complete!</p>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Log in to save your progress and view your history.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2">
          <Link
            to={ROUTES.LOGIN}
            className="flex-1 text-center text-xs font-semibold py-2 rounded-xl bg-brand-tomato text-white hover:opacity-90 transition-opacity"
          >
            Log in
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-brand-tomato text-brand-tomato hover:bg-brand-tomato/10 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
