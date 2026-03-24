import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-page) px-4">
      <div className="w-full max-w-100">
        <h1 className="text-4xl font-bold text-brand-tomato text-center mb-2">
          Focus Timers
        </h1>
        <p className="text-center text-(--text-tertiary) mb-8 text-sm">
          Create your free account
        </p>
        <div className="bg-(--bg-card) rounded-2xl px-8 py-10 shadow-modal">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
