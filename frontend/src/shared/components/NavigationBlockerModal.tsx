import { Button } from "@/shared/components/ui/Button";

interface Blocker {
  state: "blocked" | "unblocked" | "proceeding";
  reset?: () => void;
  proceed?: () => void;
}

interface NavigationBlockerModalProps {
  blocker: Blocker;
}

export function NavigationBlockerModal({ blocker }: NavigationBlockerModalProps) {
  if (blocker.state !== "blocked") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-[min(94vw,400px)] rounded-2xl bg-(--bg-card) border border-(--border-soft) shadow-modal p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-(--text-primary)">Leave session?</h2>
        <p className="text-sm text-(--text-secondary)">
          Your timer is running. If you leave now, your progress will be lost.
        </p>
        <div className="flex gap-3 justify-end flex-wrap">
          <Button variant="secondary" size="md" onClick={() => blocker.reset?.()}>Stay</Button>
          <Button variant="secondary" size="md" onClick={() => blocker.proceed?.()}>Leave anyway</Button>
        </div>
      </div>
    </div>
  );
}
