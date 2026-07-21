"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Calendar, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TransactionLog } from "@/components/economy/transaction-log";
import { WorkSelectorModal } from "@/components/economy/work-selector-modal";
import { getEconomicSummary } from "@/economy/earning-engine";
import type { WorkTypeId } from "@/economy/work-types";
import { getWorkTypeById } from "@/economy/work-types";
import { applyAction } from "@/engine/timeline";
import {
  createWorkAction,
  getAvailableWorkActions,
} from "@/engine/timeline/actions";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useTimelineStore } from "@/store/timeline-store";
import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";

function interpolate(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : "{" + k + "}",
  );
}

export default function EconomyPage() {
  const router = useRouter();
  const { playSound } = useSound();
  const { t } = useTranslation();
  const { gameState, setGameState } = useTimelineStore();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const preferredCurrency = useSettingsStore((state) => state.settings.preferredCurrency) || "USD";

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin text-blue-500 text-3xl">🔄</div>
          <p className="text-gray-400 dark:text-gray-500">Loading Economy...</p>
        </div>
      </div>
    );
  }

  const economyState = gameState.economy;

  // Resolve current active job (defaults based on age)
  const age = gameState.startAge + Math.floor(gameState.dayIndex / 360);
  const defaultJob = age >= 18 ? "full_time" : "part_time";
  const activeJobId = (gameState.flags.activeJobId as WorkTypeId) || defaultJob;
  const activeJob = getWorkTypeById(activeJobId);

  // Daily limits check
  const hasWorkedToday = gameState.flags.lastWorkedDay === gameState.dayIndex;
  const lastJobChangeDay = (gameState.flags.lastJobChangeDay as number) ?? -7;
  const cooldownDaysRemaining = Math.max(0, 7 - (gameState.dayIndex - lastJobChangeDay));
  const canPerformWork = activeJob && gameState.energy >= activeJob.energyCost && !hasWorkedToday;

  const handleSelectWork = (workTypeId: WorkTypeId) => {
    playSound("success");
    setIsWorkModalOpen(false);

    // Accept the job
    setGameState((prev) => ({
      ...prev!,
      flags: {
        ...prev!.flags,
        activeJobId: workTypeId,
        lastJobChangeDay: prev!.dayIndex,
      },
    }));
  };

  const handlePerformWork = () => {
    if (!activeJob || !canPerformWork) return;
    playSound("click");

    const workAction = createWorkAction(activeJob);
    const nextState = applyAction(gameState, workAction);
    setGameState(nextState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white flex flex-col pb-16"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-gray-800 bg-white/95 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between w-full">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.back();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="font-heading text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            💰 {t("economy.page_title" as TranslationKey)}
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full space-y-6">
        {/* Active Job Section */}
        {activeJob && (
          <section className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Job Details */}
              <div className="flex items-start gap-4">
                <span className="text-4xl p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl block shrink-0">{activeJob.icon || "💼"}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white tracking-tight">{activeJob.name}</h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                      {t("economy.active_job" as TranslationKey)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed max-w-md">{activeJob.description}</p>
                </div>
              </div>

              {/* Action and switcher buttons */}
              <div className="flex flex-col gap-2 shrink-0 md:w-48">
                <button
                  type="button"
                  onClick={handlePerformWork}
                  disabled={!canPerformWork}
                  className={`
                    w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                    ${
                      canPerformWork
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white active:scale-95 cursor-pointer"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border border-[#E5E7EB] dark:border-slate-700 cursor-not-allowed"
                    }
                  `}
                >
                  <Zap className="h-4.5 w-4.5 text-yellow-400" />
                  {t("economy.perform_work" as TranslationKey)}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setIsWorkModalOpen(true);
                  }}
                  disabled={cooldownDaysRemaining > 0}
                  className={`w-full py-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700 text-xs font-semibold tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    cooldownDaysRemaining > 0 ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cooldownDaysRemaining > 0
                    ? interpolate(t("economy.wait_days" as TranslationKey), { days: cooldownDaysRemaining })
                    : t("economy.apply_job" as TranslationKey)}
                </button>
              </div>
            </div>

            {/* Constraints Display */}
            <div className="mt-6 pt-4 border-t border-slate-100/50 dark:border-slate-800/50 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="text-green-500 dark:text-green-400">💰</span> {t("economy.pay_rate" as TranslationKey)}:{" "}
                <span className="text-slate-800 dark:text-white font-medium">
                  {formatCurrency(activeJob.pay.min, preferredCurrency)}
                  {activeJob.pay.max !== activeJob.pay.min &&
                    ` - ${formatCurrency(activeJob.pay.max, preferredCurrency)}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-500 dark:text-yellow-400">⚡</span> {t("economy.energy_cost" as TranslationKey)}:{" "}
                <span className="text-slate-800 dark:text-white font-medium">{activeJob.energyCost} EP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-500 dark:text-blue-400">⚡</span> {t("economy.current_energy" as TranslationKey)}:{" "}
                <span className="text-slate-800 dark:text-white font-medium">{gameState.energy} / {gameState.energyMax} EP</span>
              </div>

              {/* Status Warning */}
              {hasWorkedToday && (
                <div className="w-full mt-3 px-3 py-2 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-950/30 text-amber-600 dark:text-amber-400 font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                  <Calendar className="h-4 w-4" /> {t("economy.already_worked_today" as TranslationKey)}
                </div>
              )}
              {!hasWorkedToday && gameState.energy < activeJob.energyCost && (
                <div className="w-full mt-3 px-3 py-2 bg-red-50/40 dark:bg-red-950/10 border border-red-100/30 dark:border-red-950/30 text-red-500 dark:text-red-400 font-bold rounded-lg flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> {t("economy.low_energy_warning" as TranslationKey)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Transaction History & Balance Card */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            📊 {t("economy.ledger_title" as TranslationKey)}
          </h2>
          <TransactionLog
            economy={economyState}
            getSummary={() => getEconomicSummary(economyState)}
          />
        </section>
      </main>

      {/* Work Selector Modal */}
      {isWorkModalOpen && gameState && (
        <WorkSelectorModal
          gameState={gameState}
          onSelectWork={handleSelectWork}
          onClose={() => setIsWorkModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
