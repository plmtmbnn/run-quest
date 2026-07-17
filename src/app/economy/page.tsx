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
import { useTimelineStore } from "@/store/timeline-store";
import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";

export default function EconomyPage() {
  const router = useRouter();
  const { playSound } = useSound();
  const { gameState, setGameState } = useTimelineStore();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const preferredCurrency = useSettingsStore((state) => state.settings.preferredCurrency) || "USD";

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin text-blue-500 text-3xl">🔄</div>
          <p className="text-gray-400">Loading Economy...</p>
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
      className="min-h-screen bg-slate-950 text-white flex flex-col pb-16"
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-10">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.back();
          }}
          className="rounded-full p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 shadow-sm transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          💰 Economy & Work
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full space-y-8">
        {/* Active Job Section */}
        {activeJob && (
          <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Job Details */}
              <div className="flex items-start gap-4">
                <span className="text-4xl p-3 bg-slate-800 rounded-xl block shrink-0">{activeJob.icon || "💼"}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-white">{activeJob.name}</h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/10">
                      Active Job
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-md">{activeJob.description}</p>
                </div>
              </div>

              {/* Action and switcher buttons */}
              <div className="flex flex-col gap-2 shrink-0 md:w-48">
                <button
                  type="button"
                  onClick={handlePerformWork}
                  disabled={!canPerformWork}
                  className={`
                    w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm
                    ${
                      canPerformWork
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white active:scale-95 cursor-pointer"
                        : "bg-slate-800 text-slate-550 border border-slate-700/50 cursor-not-allowed"
                    }
                  `}
                >
                  <Zap className="h-4.5 w-4.5 text-yellow-400" />
                  Perform Work
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setIsWorkModalOpen(true);
                  }}
                  disabled={cooldownDaysRemaining > 0}
                  className={`w-full py-2.5 rounded-xl border border-slate-700 text-xs font-semibold tracking-wide transition-colors ${
                    cooldownDaysRemaining > 0 ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "hover:bg-slate-800 text-gray-300"
                  }`}
                >
                  {cooldownDaysRemaining > 0 ? `Wait ${cooldownDaysRemaining}d` : "Apply Job"}
                </button>
              </div>
            </div>

            {/* Constraints Display */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="text-green-400">💰</span> Pay Rate:{" "}
                <span className="text-white font-medium">
                  {formatCurrency(activeJob.pay.min, preferredCurrency)}
                  {activeJob.pay.max !== activeJob.pay.min &&
                    ` - ${formatCurrency(activeJob.pay.max, preferredCurrency)}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400">⚡</span> Energy Cost:{" "}
                <span className="text-white font-medium">{activeJob.energyCost} EP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400">⚡</span> Current Energy:{" "}
                <span className="text-white font-medium">{gameState.energy} / {gameState.energyMax} EP</span>
              </div>

              {/* Status Warning */}
              {hasWorkedToday && (
                <div className="w-full mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                  <Calendar className="h-4 w-4" /> Already worked today. Rest or wait until tomorrow to work again.
                </div>
              )}
              {!hasWorkedToday && gameState.energy < activeJob.energyCost && (
                <div className="w-full mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-lg flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> Low energy! Rest to recover energy.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Transaction History & Balance Card */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            📊 Ledger & History
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
