"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTimelineStore } from "@/store/timeline-store";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { formatCurrency } from "@/economy/currency-converter";
import { formatCompact } from "@/utils/format-compact";
import { deriveDate } from "@/engine/timeline/calendar";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  className?: string;
  "aria-label"?: string;
}

function StatCard({ label, value, icon, className, "aria-label": ariaLabel }: StatCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50 ${className}`}
      aria-label={ariaLabel}
    >
      <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
        {label}
      </span>
      <span className="text-xs md:text-sm font-black mt-0.5 md:mt-1 truncate tracking-tight text-slate-800 dark:text-white flex items-center gap-1">
        {icon && <span>{icon}</span>} {value}
      </span>
    </div>
  );
}

export function GameStats() {
  const { t } = useTranslation();
  const gameState = useTimelineStore((state) => state.gameState);
  const player = usePlayerStore((state) => state.player);
  const settings = useSettingsStore((state) => state.settings);

  // Show loading skeleton while game state is initializing
  if (!gameState || !player) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-3 md:p-4 lg:p-5 shadow-sm flex flex-col gap-3 md:gap-4 w-full animate-pulse">
        {/* Clock Skeleton */}
        <div className="flex justify-center items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50 h-10">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        {/* Stats Skeletons */}
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

  const currentBalance = Math.max(0, gameState?.economy?.currentBalance ?? 0);
  const currentDate = gameState ? deriveDate(gameState) : null;

  const formattedBalance = useMemo(() =>
    formatCurrency(
      currentBalance,
      settings.preferredCurrency || "USD",
      { compact: true },
    ),
    [currentBalance, settings.preferredCurrency]
  );

  const runs = useMemo(() =>
    formatCompact(player?.statistics?.totalRuns ?? 0),
    [player?.statistics?.totalRuns]
  );

  const distance = useMemo(() =>
    `${formatCompact(player?.statistics?.totalDistance ?? 0)} km`,
    [player?.statistics?.totalDistance]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-3 md:p-4 lg:p-5 shadow-sm flex flex-col gap-3 md:gap-4 w-full"
    >
      {/* Clock Display */}
      {currentDate && (
        <div
          className="flex justify-center items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-2 md:p-3 text-center border border-slate-100 dark:border-slate-700/50"
          aria-label={`Game date: Year ${currentDate.yearOffset + 1}, Month ${currentDate.month + 1}, Week ${currentDate.week + 1}, Day ${currentDate.dayOfWeek + 1}`}
        >
          <span className="text-xs md:text-sm font-black text-slate-800 dark:text-white">
            Year {currentDate.yearOffset + 1}, Month {currentDate.month + 1}, Week {currentDate.week + 1}, Day {currentDate.dayOfWeek + 1}
          </span>
        </div>
      )}
      
      {/* Player Stats (Money, Runs, Distance) */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <StatCard
          label={t("home.stats.money" as TranslationKey)}
          value={formattedBalance}
          icon="💰"
          aria-label={`${t("home.stats.money" as TranslationKey)}: ${formattedBalance}`}
        />
        <StatCard
          label={t("home.stats.runs" as TranslationKey)}
          value={runs}
          aria-label={`${t("home.stats.runs" as TranslationKey)}: ${runs}`}
        />
        <StatCard
          label={t("home.stats.distance" as TranslationKey)}
          value={distance}
          aria-label={`${t("home.stats.distance" as TranslationKey)}: ${distance}`}
        />
      </div>
    </motion.div>
  );
}
