import { useState } from "react";
import { useBolsaSession } from "@/features/bolsa/hooks/useBolsaSession";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { BolsaConfigPanel } from "@/features/bolsa/components/BolsaConfigPanel";
import { WaterTank } from "@/shared/components/WaterTank";
import { AuthPrompt } from "@/shared/components/AuthPrompt";
import { Button } from "@/shared/components/ui/Button";
import { Header } from "@/shared/components/layout/Header";
import { NavigationBlockerModal } from "@/shared/components/NavigationBlockerModal";
import { formatSeconds } from "@/features/timer/utils/time.utils";
import { DEFAULT_BOLSA_CONFIG } from "@/features/bolsa/types/bolsa.types";
import type { BolsaConfig } from "@/features/bolsa/types/bolsa.types";
import { BagIcon } from "@/shared/components/icons/BagIcon";
import { BlockIcon } from "@/shared/components/icons/BlockIcon";

export default function BolsaPage() {
  const [config, setConfig] = useState<BolsaConfig>(DEFAULT_BOLSA_CONFIG);
  const [taskName, setTaskName] = useState("");

  const {
    phase,
    blockSecondsRemaining,
    budgetSecondsRemaining,
    budgetExhausted,
    startBlock,
    takePause,
    resumeWork,
    endEarly,
    saveError,
    needsAuth,
    clearNeedsAuth,
  } = useBolsaSession(config, taskName);

  const isActive = phase !== "idle" && phase !== "completed";
  const { blocker } = useNavigationGuard(isActive);

  // Work phase: water drains with block time (block = 100% full)
  // Break phase: water drains with budget time (budget = 100% full)
  // Page bg stays neutral — the WaterTank color provides the phase tint
  const bolsaWaterLevel =
    phase === "working"
      ? blockSecondsRemaining / config.blockDurationSec
      : phase === "break"
        ? budgetSecondsRemaining / config.budgetSec
        : 0;
  const bolsaWaterColor = phase === "break" ? "#a8d5be" : "#7daa6c";

  // Main display: during work show block, during break show budget
  const mainTimerSec =
    phase === "break"
      ? budgetSecondsRemaining
      : isActive
        ? blockSecondsRemaining
        : config.blockDurationSec;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--bg-page)">
      <WaterTank level={bolsaWaterLevel} color={bolsaWaterColor} />

      <Header />

      {needsAuth && <AuthPrompt onClose={clearNeedsAuth} />}

      <NavigationBlockerModal blocker={blocker} />

      <div className="relative z-10 w-[min(94vw,580px)] rounded-2xl px-12 sm:px-20 py-12 sm:py-16 bg-(--glass-bg) backdrop-blur-md border border-(--glass-border) shadow-(--shadow-glass) flex flex-col items-center gap-8">

        <p className="text-(--text-secondary) text-sm font-medium uppercase tracking-widest">
          {phase === "idle"
            ? "Time Budget"
            : phase === "working"
              ? "Working"
              : phase === "break"
                ? "On break"
                : "Block complete!"}
        </p>

        <div className="text-[5rem] sm:text-[8rem] lg:text-[10rem] font-bold leading-none tabular-nums text-(--text-primary)">
          {formatSeconds(mainTimerSec)}
        </div>

        {/* Two indicators: budget remaining + block remaining */}
        {isActive && (
          <div className="flex items-center gap-6 text-(--text-secondary)">
            {/* Budget indicator */}
            <div className="flex items-center gap-1.5">
              <BagIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm tabular-nums">
                {formatSeconds(budgetSecondsRemaining)}
              </span>
              {budgetExhausted && (
                <span className="text-xs text-red-400 font-medium">empty</span>
              )}
            </div>
            {/* Block indicator */}
            <div className="flex items-center gap-1.5">
              <BlockIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm tabular-nums">
                {formatSeconds(blockSecondsRemaining)}
              </span>
            </div>
          </div>
        )}

        {!isActive && (
          <>
            <input
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
className="w-full text-center text-sm font-medium bg-transparent border-b-2 border-brand-bl-work/40 outline-none py-2 text-(--text-primary) placeholder:text-(--text-muted) placeholder:font-normal focus:border-brand-bl-work transition-colors duration-200"
            />
            <BolsaConfigPanel config={config} onChange={setConfig} />
          </>
        )}

        {saveError && (
          <p className="text-sm text-(--text-error) text-center">
            Session could not be saved. Check your connection.
          </p>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          {phase === "idle" && (
            <Button variant="cta" size="lg" onClick={startBlock}>
              Start block
            </Button>
          )}
          {phase === "working" && (
            <>
              <Button variant="secondary" size="lg" onClick={takePause} disabled={budgetExhausted}>
                {budgetExhausted ? "No budget left" : "Take a break"}
              </Button>
              <Button variant="secondary" size="md" onClick={endEarly}>
                End
              </Button>
            </>
          )}
          {phase === "break" && (
            <>
              <Button variant="secondary" size="lg" onClick={resumeWork}>
                Back to work
              </Button>
              <Button variant="secondary" size="md" onClick={endEarly}>
                End
              </Button>
            </>
          )}
          {phase === "completed" && (
            <Button variant="cta" size="lg" onClick={() => startBlock()}>
              New block
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
