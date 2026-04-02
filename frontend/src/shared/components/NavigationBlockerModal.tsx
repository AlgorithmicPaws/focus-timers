import { Button } from "@/shared/components/ui/Button";

interface Blocker {
  state: "blocked" | "unblocked" | "proceeding";
  reset?: () => void;
  proceed?: () => void;
}

interface NavigationBlockerModalProps {
  blocker: Blocker;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function NavigationBlockerModal({
  blocker,
  title = "Leave session?",
  description = "Your timer is running. If you leave now, your progress will be lost.",
  confirmLabel = "Leave anyway",
  cancelLabel = "Stay",
}: NavigationBlockerModalProps) {
  if (blocker.state !== "blocked") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-[min(94vw,400px)] rounded-2xl bg-(--bg-card) border border-(--border-soft) shadow-modal p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-(--text-primary)">{title}</h2>
        <p className="text-sm text-(--text-secondary)">{description}</p>
        <div className="flex gap-3 justify-end flex-wrap">
          <Button variant="secondary" size="md" onClick={() => blocker.reset?.()}>{cancelLabel}</Button>
          <Button variant="secondary" size="md" onClick={() => blocker.proceed?.()}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
