import { useState } from "react";
import { useFlowtimeSession } from "@/features/flowtime/hooks/useFlowtimeSession";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { FlowtimeConfig } from "@/features/flowtime/components/FlowtimeConfig";
import { PresetSelector } from "@/features/settings/components/PresetSelector";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { FlowNudge } from "@/features/flowtime/components/FlowNudge";
import { WaterTank } from "@/shared/components/WaterTank";
import { AuthPrompt } from "@/shared/components/AuthPrompt";
import { Button } from "@/shared/components/ui/Button";
import { Header } from "@/shared/components/layout/Header";
import { NavigationBlockerModal } from "@/shared/components/NavigationBlockerModal";
import { useTick } from "@/shared/hooks/useTick";
import { formatSeconds } from "@/features/timer/utils/time.utils";
import { calculateBreakSeconds } from "@/features/timer/utils/break.calculator";
import { DEFAULT_FLOWTIME_CONFIG } from "@/features/flowtime/types/flowtime.types";
import type { FlowtimeConfig as FlowtimeConfigType } from "@/features/flowtime/types/flowtime.types";

const FLOWTIME_MAX_SEC = 120 * 60;

export default function FlowtimePage() {
  const [config, setConfig] = useState<FlowtimeConfigType>(DEFAULT_FLOWTIME_CONFIG);
  const [taskName, setTaskName] = useState("");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    phase,
    elapsedFocusSeconds,
    breakSecondsRemaining,
    recommendedBreakSec,
    showNudge,
    startFocus,
    takeBreak,
    resumeFocus,
    endSession,
    dismissNudge,
    saveError,
    needsAuth,
    clearNeedsAuth,
  } = useFlowtimeSession(config, taskName);

  const isActive = phase !== "idle";
  useTick(isActive);
  const { blocker } = useNavigationGuard(isActive);

  // Focus: fills from 0 → 1 as work accumulates (max 120 min)
  // Break: starts full (recommended break = 100%) and drains to 0
  const flowtimeWaterLevel =
    phase === "idle"
      ? 0
      : phase === "focus"
        ? Math.min(elapsedFocusSeconds / FLOWTIME_MAX_SEC, 1)
        : recommendedBreakSec > 0
          ? breakSecondsRemaining / recommendedBreakSec
          : 0;

  const flowtimeWaterColor = phase === "break" ? "#a5b4fc" : "#4f6ef7";

  // Break time earned so far — updates live as focus accumulates
  const breakEarned = calculateBreakSeconds(elapsedFocusSeconds, config.breakModel, config.breakRatio);

  // Central number: focus time counting up during work, break countdown during rest
  const mainDisplay =
    phase === "break"
      ? formatSeconds(breakSecondsRemaining)
      : formatSeconds(elapsedFocusSeconds);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--bg-page)">
      <WaterTank level={flowtimeWaterLevel} color={flowtimeWaterColor} />

      <Header />

      {showNudge && (
        <FlowNudge
          elapsedSec={elapsedFocusSeconds}
          onDismiss={dismissNudge}
          onTakeBreak={takeBreak}
        />
      )}

      {needsAuth && <AuthPrompt onClose={clearNeedsAuth} />}

      <NavigationBlockerModal blocker={blocker} />

      <div className="relative z-10 w-[min(94vw,580px)] rounded-2xl px-12 sm:px-20 py-12 sm:py-16 bg-(--glass-bg) backdrop-blur-md border border-(--glass-border) shadow-(--shadow-glass) flex flex-col items-center gap-8">

        <p className="text-(--text-secondary) text-sm font-medium uppercase tracking-widest">
          {phase === "idle" ? "Flowtime" : phase === "focus" ? "Focusing" : "On break"}
        </p>

        <div className="text-[5rem] sm:text-[8rem] lg:text-[10rem] font-bold leading-none tabular-nums text-(--text-primary)">
          {mainDisplay}
        </div>

        {/* Break earned indicator — visible only during focus, grows with work time */}
        {phase === "focus" && (
          <div className="flex items-center gap-2.5 text-(--text-secondary)">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8h1a4 4 0 010 8h-1" />
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            <span className="text-base font-medium tabular-nums">
              Break earned: <span className="font-bold text-(--text-primary)">{formatSeconds(breakEarned)}</span>
            </span>
          </div>
        )}

        {!isActive && (
          <input
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
className="w-full text-center text-sm font-medium bg-transparent border-b-2 border-brand-ft-work/40 outline-none py-2 text-(--text-primary) placeholder:text-(--text-muted) placeholder:font-normal focus:border-brand-ft-work transition-colors duration-200"
          />
        )}

        {saveError && (
          <p className="text-sm text-(--text-error) text-center">
            Session could not be saved. Check your connection.
          </p>
        )}

        {!isActive && (
          <>
            <FlowtimeConfig config={config} onChange={setConfig} disabled={isActive} />
            {isAuthenticated && (
              <PresetSelector
                technique="flowtime"
                currentConfig={{ breakModel: config.breakModel, breakRatio: config.breakRatio }}
                onApplyPreset={(c) =>
                  setConfig({
                    breakModel: (c.breakModel as FlowtimeConfigType['breakModel']) ?? config.breakModel,
                    breakRatio: Number(c.breakRatio) || config.breakRatio,
                  })
                }
              />
            )}
          </>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          {phase === "idle" && (
            <Button variant="cta" size="lg" onClick={startFocus}>
              Start focus
            </Button>
          )}
          {phase === "focus" && (
            <>
              <Button variant="secondary" size="lg" onClick={takeBreak}>
                Take a break
              </Button>
              <Button variant="secondary" size="md" onClick={() => endSession(true)}>
                End session
              </Button>
            </>
          )}
          {phase === "break" && (
            <>
              <Button variant="secondary" size="lg" onClick={resumeFocus}>
                Back to work
              </Button>
              <Button variant="secondary" size="md" onClick={() => endSession(true)}>
                End session
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
