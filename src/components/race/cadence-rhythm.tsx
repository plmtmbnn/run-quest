"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Music } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  evaluateRhythmHit,
  type RhythmHitAccuracy,
  type RhythmHitResult,
  type RhythmState,
} from "@/engine/simulation/rhythm-engine";
import { useSound } from "@/hooks/use-sound";

interface CadenceRhythmProps {
  rhythmState?: RhythmState;
  selectedPacing: string;
  currentKm: number;
  onHit?: (result: RhythmHitResult) => void;
  className?: string;
}

export function CadenceRhythm({
  rhythmState,
  selectedPacing,
  onHit,
  className = "",
}: CadenceRhythmProps) {
  const { playSound } = useSound();
  const spm = rhythmState?.spm ?? 175;
  const beatIntervalMs = Math.round(60000 / spm);

  const [isMinimized, setIsMinimized] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState<RhythmHitAccuracy | null>(
    null,
  );
  const [combo, setCombo] = useState(rhythmState?.comboCount ?? 0);
  const [isBeating, setIsBeating] = useState(false);

  const lastBeatTimeRef = useRef<number>(Date.now());
  const activeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync combo count from props
  useEffect(() => {
    if (rhythmState?.comboCount !== undefined) {
      setCombo(rhythmState.comboCount);
    }
  }, [rhythmState?.comboCount]);

  // Metronome tick loop during Cruise pace
  useEffect(() => {
    if (selectedPacing !== "cruise") return;

    lastBeatTimeRef.current = Date.now();
    const interval = setInterval(() => {
      lastBeatTimeRef.current = Date.now();
      setIsBeating(true);
      playSound("tick");

      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      activeTimerRef.current = setTimeout(() => {
        setIsBeating(false);
      }, 100);
    }, beatIntervalMs);

    return () => {
      clearInterval(interval);
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    };
  }, [selectedPacing, beatIntervalMs, playSound]);

  // Handler for rhythm tap / spacebar press
  const handleTap = useCallback(() => {
    if (selectedPacing !== "cruise") return;

    const now = Date.now();
    const timeSinceLastBeat = now - lastBeatTimeRef.current;
    const timeToNextBeat = beatIntervalMs - timeSinceLastBeat;
    // Difference relative to nearest beat
    const timeDiffMs =
      timeSinceLastBeat < timeToNextBeat ? timeSinceLastBeat : -timeToNextBeat;

    const result = evaluateRhythmHit(timeDiffMs, combo);
    setLastAccuracy(result.accuracy);
    setCombo(result.comboCount);

    if (result.accuracy === "perfect" || result.accuracy === "good") {
      playSound("click");
    }

    if (onHit) {
      onHit(result);
    }
  }, [selectedPacing, beatIntervalMs, combo, onHit, playSound]);

  // Keyboard shortcut listener (Spacebar)
  useEffect(() => {
    if (selectedPacing !== "cruise") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        // Prevent page scrolling on spacebar tap
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPacing, handleTap]);

  // Rhythm mechanic is active ONLY during "Cruise" pace mode
  if (selectedPacing !== "cruise") {
    return null;
  }

  const getAccuracyBadge = () => {
    switch (lastAccuracy) {
      case "perfect":
        return { text: "PERFECT! 🎯", color: "bg-emerald-500 text-white" };
      case "good":
        return { text: "GOOD 👍", color: "bg-amber-500 text-white" };
      case "miss":
        return { text: "MISS ❌", color: "bg-slate-400 text-white" };
      default:
        return null;
    }
  };

  const badge = getAccuracyBadge();

  return (
    <div className={`flex justify-center my-2 ${className}`}>
      <div className="relative p-3 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-md max-w-sm w-full transition-all">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <Music className="w-4 h-4 animate-pulse" />
            <span className="uppercase tracking-wider text-[10px]">
              CADENCE RHYTHM ({spm} SPM)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Toggle rhythm panel"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {!isMinimized ? (
          <div className="flex flex-col items-center gap-3 py-1">
            {/* Interactive Pulsing Circle */}
            <button
              type="button"
              onClick={handleTap}
              className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center cursor-pointer transition-transform active:scale-90 select-none ${
                isBeating
                  ? "border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30"
                  : "border-slate-300 dark:border-slate-700 scale-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full transition-all duration-100 ${
                  isBeating
                    ? "bg-emerald-500/80 scale-100"
                    : "bg-slate-200 dark:bg-slate-800 scale-75"
                }`}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                TAP
              </span>
            </button>

            {/* Timing Guidance & Input Tip */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
              Tap in rhythm with footfalls{" "}
              <span className="font-mono font-bold">(Spacebar)</span>
            </p>

            {/* Accuracy & Combo Display */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {badge && (
                  <motion.span
                    key={`${lastAccuracy ?? "hit"}-${Date.now()}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}
                  >
                    {badge.text}
                  </motion.span>
                )}
              </AnimatePresence>

              {combo > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ×{combo} {combo >= 10 ? "🔥 RHYTHM BONUS!" : "COMBO"}
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Minimized Compact View */
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              Tap spacebar to match {spm} SPM
            </span>
            {combo > 0 && (
              <span className="font-mono font-bold text-emerald-500 text-[11px]">
                ×{combo}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
