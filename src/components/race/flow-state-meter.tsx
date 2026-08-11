"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { FlowState } from "@/engine/simulation/types";

interface FlowStateMeterProps {
  flowState?: FlowState;
  className?: string;
}

export function FlowStateMeter({
  flowState,
  className = "",
}: FlowStateMeterProps) {
  const score = flowState?.score ?? 0;
  const level = flowState?.level ?? "building";
  const isInTheZone = flowState?.isInTheZone ?? false;

  const getLevelLabel = () => {
    switch (level) {
      case "zone":
        return "THE ZONE";
      case "flowing":
        return "FLOWING";
      default:
        return "BUILDING";
    }
  };

  const getLevelColor = () => {
    switch (level) {
      case "zone":
        return "text-purple-600 dark:text-purple-400";
      case "flowing":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-slate-500 dark:text-slate-400";
    }
  };

  return (
    <div
      className={`relative p-3.5 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-300 ${
        isInTheZone
          ? "ring-2 ring-purple-500/50 shadow-purple-500/20 shadow-lg"
          : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5">
          <Zap
            className={`w-4 h-4 ${
              isInTheZone
                ? "text-purple-500 animate-bounce"
                : level === "flowing"
                  ? "text-blue-500"
                  : "text-slate-400"
            }`}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            FLOW STATE
          </span>
        </div>
        <span
          className={`text-xs font-black uppercase tracking-wide ${getLevelColor()}`}
        >
          {getLevelLabel()}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Vertical Progress Bar */}
        <div className="relative h-32 w-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60 flex flex-col justify-end p-0.5">
          <motion.div
            className={`w-full rounded-full bg-gradient-to-t from-slate-400 via-blue-500 to-purple-600 ${
              isInTheZone ? "animate-pulse" : ""
            }`}
            initial={{ height: "0%" }}
            animate={{ height: `${score}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>

        {/* Meter Info & Percentage */}
        <div className="flex flex-col justify-between h-32 py-1">
          <div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white leading-none">
              {Math.round(score)}
              <span className="text-xs text-slate-400 font-sans ml-0.5">%</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
              {isInTheZone
                ? "-15% Fatigue | +5% Speed"
                : level === "flowing"
                  ? "Focus building..."
                  : "Keep steady rhythm"}
            </p>
          </div>

          {isInTheZone && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider"
            >
              ✨ ZONE ACTIVE
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
