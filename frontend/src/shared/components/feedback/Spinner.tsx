interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full border-brand-tomato/30 border-t-brand-tomato animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}