"use client";

import { motion } from "framer-motion";
import { useTimelineStore } from "@/store/timeline-store";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { formatCurrency } from "@/economy/currency-converter";
import { formatCompact } from "@/utils/format-compact";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

export function GameClock() {
  const { gameState } = useTimelineStore();
  const player = usePlayerStore((state) => state.player);
  const settings = useSettingsStore((state) => state.settings);
  const { t } = useTranslation();

  // Show loading skeleton while game state is initializing
  if (!gameState || !player) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-3 md:p-4 lg:p-5 shadow-sm flex flex-col gap-3 md:gap-4 w-full animate-pulse">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50 h-16">
              <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentBalance = gameState.economy?.currentBalance ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-3 md:p-4 lg:p-5 shadow-sm flex flex-col gap-3 md:gap-4 w-full"
    >
      {/* Player Stats (Money, Runs, Distance) */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            {t("home.stats.money" as TranslationKey)}
          </span>
          <span className="text-xs md:text-sm font-black flex items-center gap-1 mt-0.5 md:mt-1 truncate tracking-tight text-slate-800 dark:text-white">
            💰 {formatCurrency(
              currentBalance,
              settings.preferredCurrency || "USD",
              { compact: true },
            )}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            {t("home.stats.runs" as TranslationKey)}
          </span>
          <span className="text-xs md:text-sm font-black mt-0.5 md:mt-1 text-slate-800 dark:text-white">
            {formatCompact(player.statistics.totalRuns)}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            {t("home.stats.distance" as TranslationKey)}
          </span>
          <span className="text-xs md:text-sm font-black mt-0.5 md:mt-1 truncate text-slate-800 dark:text-white">
            {formatCompact(player.statistics.totalDistance)} km
          </span>
        </div>
      </div>


    </motion.div>
  );
}
