import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-brand-tomato text-center mb-2">Focus Timers</h1>
        <p className="text-center text-[var(--text-secondary)] mb-8 text-sm">
          Inicia sesión para continuar
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
