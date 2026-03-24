import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authService } from "@/features/auth/services/auth.service";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/routes";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full px-3 py-2.5 text-sm rounded-input border border-(--input-border) bg-(--input-bg) text-(--text-primary) placeholder:text-(--input-placeholder) focus:outline-none focus:ring-2 focus:ring-brand-tomato/50 transition-shadow duration-200";

const labelClass = "block text-sm font-semibold text-(--text-secondary) mb-1";

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
      setError("root", { message: "Incorrect email or password" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          aria-label="Email"
          className={inputClass}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Password</label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          aria-label="Password"
          className={inputClass}
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      {errors.root && (
        <p className="text-sm text-red-500 text-center">{errors.root.message}</p>
      )}

      <Button type="submit" variant="cta" size="lg" disabled={isSubmitting} className="w-full mt-2">
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>

      <p className="text-center text-sm text-(--text-secondary)">
        Don't have an account?{" "}
        <Link to={ROUTES.REGISTER} className="text-brand-tomato hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}