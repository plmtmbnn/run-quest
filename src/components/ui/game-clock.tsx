"use client";

import { motion } from "framer-motion";
import { deriveDate } from "@/engine/timeline/calendar";
import { useTimelineStore } from "@/store/timeline-store";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { formatCurrency } from "@/economy/currency-converter";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

export function GameClock() {
  const { gameState } = useTimelineStore();
  const player = usePlayerStore((state) => state.player);
  const settings = useSettingsStore((state) => state.settings);
  const { t } = useTranslation();

  if (!gameState || !player) return null;

  const { age, yearOffset, month, week, dayOfWeek } = deriveDate(gameState);

  const currentYear = yearOffset + 1;
  const currentMonth = month + 1;
  const currentWeek = week + 1;
  const currentDay = dayOfWeek + 1;

  const currentBalance = gameState.economy?.currentBalance ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-3 md:p-4 lg:p-5 shadow-sm flex flex-col gap-3 md:gap-4 w-full"
    >
      {/* Top Row: Calendar & Age */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-heading font-black text-[10px] md:text-[11px] px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl uppercase tracking-wider shadow-sm flex items-center gap-1.5 md:gap-2">
          <span className="text-xs md:text-sm">📅</span> 
          <span className="hidden sm:inline">Year {currentYear}, M{currentMonth}, W{currentWeek}, D{currentDay}</span>
          <span className="sm:hidden">Y{currentYear} M{currentMonth} W{currentWeek} D{currentDay}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] md:text-[11px] font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-[#E5E7EB] dark:border-slate-700 uppercase tracking-wider">
          Age {age}
        </div>
      </div>

      {/* Middle Row: Player Stats (Money, Runs, Distance) */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            {t("home.stats.money" as TranslationKey)}
          </span>
          <span className="text-xs md:text-sm font-black flex items-center gap-1 mt-0.5 md:mt-1 truncate tracking-tight text-slate-800 dark:text-white">
            💰 {formatCurrency(
              currentBalance,
              settings.preferredCurrency || "USD",
            )}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            {t("home.stats.runs" as TranslationKey)}
          </span>
          <span className="text-xs md:text-sm font-black mt-0.5 md:mt-1 text-slate-800 dark:text-white">
            {player.statistics.totalRuns}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            {t("home.stats.distance" as TranslationKey)}
          </span>
          <span className="text-xs md:text-sm font-black mt-0.5 md:mt-1 truncate text-slate-800 dark:text-white">
            {player.statistics.totalDistance} km
          </span>
        </div>
      </div>


    </motion.div>
  );
}
