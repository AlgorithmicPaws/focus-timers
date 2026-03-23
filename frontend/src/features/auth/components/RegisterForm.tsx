import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authService } from "@/features/auth/services/auth.service";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/\d/, "Debe contener al menos un número"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
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
      const { access_token } = await authService.register(data);
      setToken(access_token);
      const user = await authService.getMe();
      setUser(user);
      navigate(ROUTES.DASHBOARD);
    } catch {
      setError("root", { message: "No se pudo crear la cuenta. El correo podría estar en uso." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Nombre</label>
        <input
          {...register("name")}
          type="text"
          placeholder="Tu nombre"
          aria-label="Nombre"
          className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-tomato"
        />
        {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
      </div>

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
          placeholder="Mín. 8 caracteres con un número"
          aria-label="Contraseña"
          className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-tomato"
        />
        {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
      </div>

      {errors.root && (
        <p className="text-sm text-red-400 text-center">{errors.root.message}</p>
      )}

      <Button type="submit" variant="cta" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        ¿Ya tienes cuenta?{" "}
        <Link to={ROUTES.LOGIN} className="text-brand-tomato hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
