import { type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "cta" | "glass" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  cta: "bg-(--btn-cta-bg) hover:bg-(--btn-cta-hover) text-(--btn-cta-text) font-semibold shadow-md",
  glass:
    "bg-(--glass-panel-bg) backdrop-blur-glass border border-(--glass-panel-border) text-black hover:bg-white/40",
  secondary:
    "border border-(--border-default) text-(--text-secondary) hover:border-brand-tomato hover:text-brand-tomato bg-transparent",
  danger:
    "border border-red-400 text-red-500 hover:bg-red-50 bg-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-input",
  md: "px-5 py-2.5 text-base rounded-input",
  lg: "px-8 py-3 text-base rounded-input",
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
        "inline-flex items-center justify-center gap-2 transition-all duration-250 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-tomato",
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