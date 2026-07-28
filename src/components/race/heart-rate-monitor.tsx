"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { PacingPlan, SimulationState } from "@/types/engine";

interface HeartRateMonitorProps {
  state: SimulationState;
  currentPacing: PacingPlan;
}

/**
 * Calculate heart rate (BPM) based on race conditions
 */
function calculateBPM(state: SimulationState, currentPacing: PacingPlan): number {
  // Base heart rate by pacing intensity
  let baseBPM = 120;
  
  switch (currentPacing) {
    case "jog":
    case "conservative":
      baseBPM = 125;
      break;
    case "cruise":
    case "steady":
      baseBPM = 150;
      break;
    case "push":
    case "aggressive":
      baseBPM = 170;
      break;
    case "sprint":
      baseBPM = 190;
      break;
    case "negative_split":
      // Progressive increase based on distance
      const progressPct = state.distanceCovered / state.totalDistance;
      baseBPM = 140 + (progressPct * 40); // 140 -> 180
      break;
  }

  // Fatigue multiplier: +1 bpm per 1% muscle fatigue
  const fatigueImpact = state.muscleFatigue * 0.8;
  
  // Mental stress: +0.5 bpm per 1% mental fatigue
  const mentalStressImpact = state.mentalFatigue * 0.5;
  
  // Energy depletion: +20 bpm when energy < 30%
  const energyImpact = state.energy < 30 ? 20 : 0;
  
  // Breaking point spike: +20 bpm
  const breakingPointImpact = state.activeBreakingPoint ? 20 : 0;
  
  // Desperation mode surge: +30 bpm
  const desperationImpact = state.desperationMode ? 30 : 0;
  
  // Runner's high: -10 bpm (calming effect)
  const runnersHighImpact = state.isRunnersHighActive ? -10 : 0;
  
  // Final calculation
  const totalBPM = Math.round(
    baseBPM +
    fatigueImpact +
    mentalStressImpact +
    energyImpact +
    breakingPointImpact +
    desperationImpact +
    runnersHighImpact
  );
  
  // Clamp between realistic ranges: 100-220 bpm
  return Math.max(100, Math.min(220, totalBPM));
}

/**
 * Get heart rate zone classification
 */
function getHeartRateZone(bpm: number): {
  zone: string;
  color: string;
  textColor: string;
  label: string;
} {
  if (bpm < 130) {
    return {
      zone: "recovery",
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      label: "Recovery",
    };
  } else if (bpm < 150) {
    return {
      zone: "aerobic",
      color: "bg-green-500",
      textColor: "text-green-500",
      label: "Aerobic",
    };
  } else if (bpm < 170) {
    return {
      zone: "tempo",
      color: "bg-amber-500",
      textColor: "text-amber-500",
      label: "Tempo",
    };
  } else if (bpm < 190) {
    return {
      zone: "threshold",
      color: "bg-orange-500",
      textColor: "text-orange-500",
      label: "Threshold",
    };
  } else if (bpm < 200) {
    return {
      zone: "max",
      color: "bg-rose-500",
      textColor: "text-rose-500",
      label: "Max Effort",
    };
  } else {
    return {
      zone: "danger",
      color: "bg-red-600",
      textColor: "text-red-600",
      label: "DANGER",
    };
  }
}

/**
 * HeartRateMonitor - Real-time physiological feedback
 * Displays current BPM with color-coded zones and pulsing animation
 */
export function HeartRateMonitor({ state, currentPacing }: HeartRateMonitorProps) {
  const bpm = calculateBPM(state, currentPacing);
  const zone = getHeartRateZone(bpm);
  
  // Calculate pulse animation speed based on BPM
  // 60 bpm = 1 beat per second = 1000ms
  // Formula: duration = 60000 / bpm
  const pulseDuration = Math.max(0.3, Math.min(1.5, 60 / bpm));
  
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
      {/* Pulsing Heart Icon */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={zone.textColor}
      >
        <Heart
          className={`w-6 h-6 ${bpm >= 200 ? "fill-current" : ""}`}
          strokeWidth={2.5}
        />
      </motion.div>
      
      {/* BPM Display */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-black text-2xl ${zone.textColor}`}>
            {bpm}
          </span>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            BPM
          </span>
        </div>
        
        {/* Zone Label */}
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${zone.textColor}`}
        >
          {zone.label}
        </span>
      </div>
      
      {/* Critical Warning for Danger Zone */}
      {bpm >= 200 && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="ml-auto"
        >
          <span className="text-xs font-bold text-red-600 dark:text-red-500 uppercase">
            ⚠️ Critical
          </span>
        </motion.div>
      )}
    </div>
  );
}
