import { type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "cta" | "glass" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  cta: "bg-[var(--btn-cta-bg)] hover:bg-brand-tomato text-white font-semibold shadow-md",
  glass:
    "bg-[var(--glass-panel-bg)] backdrop-blur-[12px] border border-[var(--glass-panel-border)] text-white hover:bg-white/25",
  secondary:
    "border border-[var(--text-secondary)] text-[var(--text-primary)] hover:border-brand-tomato hover:text-brand-tomato bg-transparent",
  danger:
    "border border-red-400 text-red-400 hover:bg-red-400 hover:text-white bg-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-8 py-3.5 text-lg rounded-2xl",
};

export function Button({
  variant = "cta",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-tomato",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
