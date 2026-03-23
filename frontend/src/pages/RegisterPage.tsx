import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-brand-tomato text-center mb-2">Focus Timers</h1>
        <p className="text-center text-[var(--text-secondary)] mb-8 text-sm">
          Crea tu cuenta gratis
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
