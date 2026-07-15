"use client";

import { useTimelineStore } from "@/store/timeline-store";
import { deriveDate } from "@/engine/timeline/calendar";
import { motion } from "framer-motion";
import { Coffee, Moon } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

export function GameClock() {
  const { gameState, doAction } = useTimelineStore();
  const { playSound } = useSound();

  if (!gameState) return null;

  const { age, yearOffset, month, week, dayOfWeek } = deriveDate(gameState);

  const currentYear = yearOffset + 1;
  const currentMonth = month + 1;
  const currentWeek = week + 1;
  const currentDay = dayOfWeek + 1;

  const energyPercent = (gameState.energy / gameState.energyMax) * 100;

  const handleRest = () => {
    playSound("click");
    doAction("rest");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 w-full"
    >
      {/* Calendar & Age info */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-heading font-black text-xs px-3.5 py-1.5 rounded-2xl uppercase tracking-wider shadow-sm flex items-center gap-1.5">
          <span>📅</span> Year {currentYear}, M{currentMonth}, W{currentWeek}, D
          {currentDay}
        </div>
        <div className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-extrabold px-3 py-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
          Age {age}
        </div>
      </div>

      {/* Energy / Stamina Bar & Rest Button */}
      <div className="flex items-center gap-4 flex-1 justify-end max-w-md w-full">
        {/* Stamina Meter */}
        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <Coffee className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <div className="relative flex-1 h-3.5 bg-gray-100 dark:bg-slate-850 rounded-full overflow-hidden border border-gray-150 dark:border-slate-800 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ type: "spring", stiffness: 80 }}
              className={`h-full rounded-full ${
                energyPercent > 50
                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                  : energyPercent > 20
                    ? "bg-gradient-to-r from-amber-500 to-orange-400"
                    : "bg-gradient-to-r from-rose-500 to-red-400 animate-pulse"
              }`}
            />
            <span className="absolute inset-0 flex items-center justify-center font-mono font-black text-[9px] text-slate-750 dark:text-slate-200">
              {Math.round(gameState.energy)}/{gameState.energyMax} EP
            </span>
          </div>
        </div>

        {/* Manual Rest Button */}
        <button
          type="button"
          onClick={handleRest}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-950 dark:border-slate-50 hover:bg-slate-800 dark:hover:bg-white active:scale-95 transition-all transform flex-shrink-0 shadow-sm"
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Rest (1 Day)</span>
        </button>
      </div>
    </motion.div>
  );
}
