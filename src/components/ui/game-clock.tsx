"use client";

import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { deriveDate } from "@/engine/timeline/calendar";
import { useTimelineStore } from "@/store/timeline-store";

export function GameClock() {
  const { gameState } = useTimelineStore();

  if (!gameState) return null;

  const { age, yearOffset, month, week, dayOfWeek } = deriveDate(gameState);

  const currentYear = yearOffset + 1;
  const currentMonth = month + 1;
  const currentWeek = week + 1;
  const currentDay = dayOfWeek + 1;

  const energyPercent = (gameState.energy / gameState.energyMax) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-4 md:px-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 w-full"
    >
      {/* Calendar & Age info */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-heading font-black text-[11px] px-4 py-2 rounded-2xl uppercase tracking-wider shadow-sm flex items-center gap-2">
          <span className="text-sm">📅</span> Year {currentYear}, M{currentMonth}, W{currentWeek}, D{currentDay}
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-4 py-2 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 uppercase tracking-wider">
          Age {age}
        </div>
      </div>

      {/* Energy / Stamina Bar */}
      <div className="flex items-center gap-4 flex-1 justify-end max-w-md w-full">
        {/* Stamina Meter */}
        <div className="flex items-center gap-3 flex-1 min-w-[120px]">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/30 text-orange-500 shrink-0 shadow-sm">
            <Coffee className="h-4 w-4" />
          </div>
          <div className="relative flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E7EB] dark:border-slate-700/50 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                energyPercent > 50
                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                  : energyPercent > 20
                    ? "bg-gradient-to-r from-amber-500 to-orange-400"
                    : "bg-gradient-to-r from-rose-500 to-red-400 animate-pulse"
              }`}
              style={{ width: `${energyPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-black font-heading tracking-tight text-[10px] text-slate-800 dark:text-white mix-blend-overlay">
              {Math.round(gameState.energy)}/{gameState.energyMax} EP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
