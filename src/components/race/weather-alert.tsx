"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { WeatherTransition } from "@/types/engine";
import { WEATHER_EMOJI } from "@/engine/weather/weather-transitions";

interface WeatherAlertProps {
  transition: WeatherTransition | null;
  onDismiss: () => void;
}

/**
 * Sprint 34 – Task 5: Dynamic Mid-Race Weather Alert
 *
 * Slides in from the top whenever a mid-race weather transition fires.
 * Auto-dismisses after 4 seconds. Shows a persistent weather icon in the
 * header via the parent component after dismissal.
 */
export function WeatherAlert({ transition, onDismiss }: WeatherAlertProps) {
  useEffect(() => {
    if (!transition) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [transition, onDismiss]);

  if (!transition) return null;

  const fromEmoji = WEATHER_EMOJI[transition.from];
  const toEmoji = WEATHER_EMOJI[transition.to];

  // Choose alert colour based on severity
  const isPositive = transition.effect.energyCostMultiplier < 1.0;
  const isNeutral = transition.effect.energyCostMultiplier === 1.0;
  const colorClass = isPositive
    ? "from-emerald-500/90 to-teal-600/90 border-emerald-400/50"
    : isNeutral
      ? "from-sky-500/90 to-blue-600/90 border-blue-400/50"
      : transition.effect.energyCostMultiplier >= 1.25
        ? "from-red-500/90 to-rose-600/90 border-red-400/50"
        : "from-amber-500/90 to-orange-600/90 border-amber-400/50";

  const energyImpact = Math.round((transition.effect.energyCostMultiplier - 1) * 100);
  const impactText =
    energyImpact < 0
      ? `Energy cost ↓${Math.abs(energyImpact)}%`
      : energyImpact > 0
        ? `Energy cost ↑${energyImpact}%`
        : "Energy neutral";

  const moraleImpact = transition.effect.moraleModifier;
  const moraleText =
    moraleImpact > 0
      ? `Morale ↑${moraleImpact}%`
      : moraleImpact < 0
        ? `Morale ↓${Math.abs(moraleImpact)}%`
        : "";

  return (
    <AnimatePresence>
      {transition && (
        <motion.div
          key={transition.id}
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-[60]
            flex items-center gap-3
            px-5 py-3 rounded-2xl
            bg-gradient-to-r ${colorClass}
            border backdrop-blur-md
            shadow-2xl shadow-black/30
            max-w-sm w-[92vw]
            cursor-pointer
          `}
          onClick={onDismiss}
          role="alert"
          aria-live="assertive"
        >
          {/* Weather icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: 2, duration: 0.4 }}
              className="text-2xl"
            >
              {fromEmoji}
            </motion.span>
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: 3, duration: 0.3 }}
              className="text-white font-bold text-base"
            >
              →
            </motion.span>
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-2xl"
            >
              {toEmoji}
            </motion.span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm leading-tight">
              Weather Shifting!
            </p>
            <p className="text-white/85 text-xs mt-0.5 leading-snug">
              {impactText}
              {moraleText ? ` · ${moraleText}` : ""}
            </p>
          </div>

          {/* Dismiss hint */}
          <button
            type="button"
            aria-label="Dismiss weather alert"
            className="shrink-0 text-white/60 hover:text-white transition-colors text-lg leading-none"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
          >
            ×
          </button>

          {/* Auto-dismiss progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: "linear" }}
            style={{ originX: 0 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 rounded-b-2xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
