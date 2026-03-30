import { useState } from "react";
import { usePomodoroSession } from "@/features/pomodoro/hooks/usePomodoroSession";
import { WaterTank } from "@/shared/components/WaterTank";
import { PomodoroCounter } from "@/features/pomodoro/components/PomodoroCounter";
import { PomodoroConfigPanel } from "@/features/pomodoro/components/PomodoroConfigPanel";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import {
  PHASE_LABELS,
  PHASE_WATER_COLORS,
  getPhaseTotalSec,
  getWaterLevel,
} from "@/features/pomodoro/types/pomodoro.types";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import { Button } from "@/shared/components/ui/Button";
import { Header } from "@/shared/components/layout/Header";
import { AuthPrompt } from "@/shared/components/AuthPrompt";
import { NavigationBlockerModal } from "@/shared/components/NavigationBlockerModal";

export default function PomodoroPage() {
  const [taskName, setTaskName] = useState("");

  const {
    phase,
    secondsLeft,
    isRunning,
    pomodorosCompleted,
    config,
    start,
    pause,
    skipPhase,
    reset,
    setConfig,
    saveManual,
    saveError,
    needsAuth,
    clearNeedsAuth,
  } = usePomodoroSession(taskName);

  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  const sessionStarted = phase !== "idle";
  const { blocker } = useNavigationGuard(sessionStarted);

  const totalSec = getPhaseTotalSec(phase, config);
  const waterLevel = getWaterLevel(phase, secondsLeft, totalSec);
  const waterColor = PHASE_WATER_COLORS[phase];

  const allDone = pomodorosCompleted >= config.pomodorosTarget;
  const currentFocusElapsed = phase === "focus" ? config.focusSec - secondsLeft : 0;

  function handleSaveComplete() {
    saveManual(true);
    reset();
  }

  function handleSaveIncompleteRequest() {
    if (allDone) {
      handleSaveComplete();
    } else {
      setShowIncompleteModal(true);
    }
  }

  function handleSaveIncompleteConfirm() {
    setShowIncompleteModal(false);
    saveManual(false, currentFocusElapsed);
    reset();
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--bg-page)">
      <Header />
      <WaterTank level={waterLevel} color={waterColor} />

      {needsAuth && <AuthPrompt onClose={clearNeedsAuth} />}

      {/* Incomplete session modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-[min(94vw,400px)] rounded-2xl bg-(--bg-card) border border-(--border-soft) shadow-modal p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-(--text-primary)">Complete your pomodoros?</h2>
            <p className="text-sm text-(--text-secondary)">
              You've completed <strong>{pomodorosCompleted}</strong> of{" "}
              <strong>{config.pomodorosTarget}</strong> pomodoros. Finishing all of them builds
              better focus habits — but you can save now if you need to.
            </p>
            <div className="flex gap-3 justify-end flex-wrap">
              <Button variant="secondary" size="md" onClick={() => setShowIncompleteModal(false)}>
                Keep going
              </Button>
              <Button variant="secondary" size="md" onClick={handleSaveIncompleteConfirm}>
                Save anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      <NavigationBlockerModal blocker={blocker} />

      {/* Glassmorphism card */}
      <div className="relative z-10 w-[min(94vw,580px)] rounded-2xl px-12 sm:px-20 py-12 sm:py-16 bg-(--glass-bg) backdrop-blur-md border border-(--glass-border) shadow-(--shadow-glass) flex flex-col items-center gap-8">

        <p className="text-(--text-secondary) text-sm font-medium uppercase tracking-widest">
          {PHASE_LABELS[phase]}
        </p>

        <TimerDisplay secondsLeft={secondsLeft} />

        <PomodoroCounter completed={pomodorosCompleted} target={config.pomodorosTarget} />

        {/* Config + task input — only when idle */}
        {phase === "idle" && (
          <>
            <input
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
className="w-full text-center text-sm font-medium bg-transparent border-b-2 border-brand-tomato/40 outline-none py-2 text-(--text-primary) placeholder:text-(--text-muted) placeholder:font-normal focus:border-brand-tomato transition-colors duration-200"
            />
            <PomodoroConfigPanel config={config} onChange={setConfig} />
          </>
        )}

        {saveError && (
          <p className="text-sm text-(--text-error) text-center">
            Session could not be saved. Check your connection.
          </p>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          {isRunning ? (
            <Button variant="secondary" size="lg" onClick={pause} aria-label="Pause">
              Pause
            </Button>
          ) : (
            <Button variant="cta" size="lg" onClick={start} aria-label="Start">
              {phase === "idle" ? "Start" : "Continue"}
            </Button>
          )}
          {sessionStarted && (
            <>
              <Button variant="secondary" size="md" onClick={skipPhase} aria-label="Skip phase">
                Skip
              </Button>
              <Button variant="secondary" size="md" onClick={reset} aria-label="Reset">
                ↺
              </Button>
            </>
          )}
        </div>

        {/* Save buttons — visible once session started */}
        {sessionStarted && (
          <div className="flex gap-3 flex-wrap justify-center border-t border-(--glass-border) pt-6 w-full">
            {allDone ? (
              <Button variant="cta" size="md" onClick={handleSaveComplete}>
                Save session ✓
              </Button>
            ) : (
              <Button variant="secondary" size="md" onClick={handleSaveIncompleteRequest}>
                Save & exit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
