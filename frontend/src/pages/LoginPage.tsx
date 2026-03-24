import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-page) px-4">
      <div className="w-full max-w-100">
        <h1 className="text-4xl font-bold text-brand-tomato text-center mb-2">
          Focus Timers
        </h1>
        <p className="text-center text-(--text-tertiary) mb-8 text-sm">
          Log in to continue
        </p>
        <div className="bg-(--bg-card) rounded-2xl px-8 py-10 shadow-modal">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
