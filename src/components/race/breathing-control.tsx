"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Wind, Heart, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { BreathingState } from "@/engine/simulation/breathing-engine";
import { useSound } from "@/hooks/use-sound";

interface BreathingControlProps {
  breathingState?: BreathingState;
  onControlSuccess?: () => void;
  className?: string;
}

export function BreathingControl({
  breathingState,
  onControlSuccess,
  className = "",
}: BreathingControlProps) {
  const { playSound } = useSound();
  const [isExercising, setIsExercising] = useState(false);
  const [breathCount, setBreathCount] = useState(1);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  const category = breathingState?.category ?? "calm";
  const canControl = breathingState?.canControl ?? false;
  const cooldownMs = breathingState?.cooldownRemainingMs ?? 0;
  const cooldownSec = Math.ceil(cooldownMs / 1000);

  const getCategoryColor = () => {
    switch (category) {
      case "gasping":
      case "labored":
        return "text-rose-500 border-rose-500 bg-rose-500/10";
      case "elevated":
        return "text-amber-500 border-amber-500 bg-amber-500/10";
      default:
        return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
    }
  };

  const startExercise = useCallback(() => {
    if (!canControl || isExercising) return;
    setIsExercising(true);
    setBreathCount(1);
    setBreathPhase("inhale");
    playSound("click");
  }, [canControl, isExercising, playSound]);

  // Keyboard shortcut listener (B key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "b" || e.key === "B") &&
        !e.repeat &&
        canControl &&
        !isExercising
      ) {
        e.preventDefault();
        startExercise();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canControl, isExercising, startExercise]);

  // Guided 3-breath exercise sequence
  useEffect(() => {
    if (!isExercising) return;

    // Breath cycle: Inhale 2s -> Hold 1s -> Exhale 2s
    let timeout: NodeJS.Timeout;

    if (breathPhase === "inhale") {
      playSound("click");
      timeout = setTimeout(() => {
        setBreathPhase("hold");
      }, 2000);
    } else if (breathPhase === "hold") {
      timeout = setTimeout(() => {
        setBreathPhase("exhale");
      }, 1000);
    } else if (breathPhase === "exhale") {
      playSound("tick");
      timeout = setTimeout(() => {
        if (breathCount < 3) {
          setBreathCount((prev) => prev + 1);
          setBreathPhase("inhale");
        } else {
          // Completed 3 deep breaths
          setIsExercising(false);
          playSound("success");
          if (onControlSuccess) {
            onControlSuccess();
          }
        }
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [isExercising, breathPhase, breathCount, playSound, onControlSuccess]);

  return (
    <div className={`relative p-3 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>
      {/* Main Widget Summary */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Animated Pulsing Ring */}
          <div className="relative flex items-center justify-center w-8 h-8">
            <motion.div
              className={`absolute inset-0 rounded-full border-2 ${getCategoryColor()}`}
              animate={{ scale: [0.8, 1.15, 0.8] }}
              transition={{
                duration: Math.max(1.2, 60 / (breathingState?.breathsPerMin || 18)),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Wind className={`w-4 h-4 ${category === "gasping" ? "text-rose-500 animate-bounce" : "text-emerald-500"}`} />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                BREATHING RATE
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                {breathingState?.breathsPerMin ?? 16} BPM
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">
              STATE: <span className="text-slate-700 dark:text-slate-200">{category.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Action Prompt / Cooldown Display */}
        {canControl ? (
          <button
            type="button"
            onClick={startExercise}
            className="px-2.5 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 animate-pulse flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            CONTROL (B)
          </button>
        ) : cooldownSec > 0 ? (
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            ⏳ {cooldownSec}s
          </span>
        ) : null}
      </div>

      {/* 3-Breath Guided Mini-Game Modal */}
      <AnimatePresence>
        {isExercising && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4"
          >
            <div className="relative p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => setIsExercising(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">
                DEEP BREATHING EXERCISE ({breathCount}/3)
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-4">
                {breathPhase === "inhale"
                  ? "Breathe In Deeply..."
                  : breathPhase === "hold"
                    ? "Hold Breath..."
                    : "Exhale Slowly..."}
              </h3>

              {/* Pulsing Guided Breath Circle */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-500/20 border-4 border-emerald-500"
                  animate={{
                    scale:
                      breathPhase === "inhale"
                        ? 1.2
                        : breathPhase === "hold"
                          ? 1.2
                          : 0.7,
                  }}
                  transition={{ duration: breathPhase === "hold" ? 0.2 : 2.0, ease: "easeInOut" }}
                />
                <Heart className="w-10 h-10 text-emerald-500 animate-pulse" />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Follow the pulsing ring to lower stress and recover focus.
              </p>

              <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                Reward: -10 BPM Stress | +5% Focus
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
