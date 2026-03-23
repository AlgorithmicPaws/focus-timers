import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authService } from "@/features/auth/services/auth.service";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const { access_token } = await authService.login(data);
      setToken(access_token);
      const user = await authService.getMe();
      setUser(user);
      navigate(ROUTES.DASHBOARD);
    } catch {
      setError("root", { message: "Correo o contraseña incorrectos" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Correo</label>
        <input
          {...register("email")}
          type="email"
          placeholder="tu@correo.com"
          aria-label="Correo electrónico"
          className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-tomato"
        />
        {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Contraseña</label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          aria-label="Contraseña"
          className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-tomato"
        />
        {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
      </div>

      {errors.root && (
        <p className="text-sm text-red-400 text-center">{errors.root.message}</p>
      )}

      <Button type="submit" variant="cta" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Entrando..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        ¿No tienes cuenta?{" "}
        <Link to={ROUTES.REGISTER} className="text-brand-tomato hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
