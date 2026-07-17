"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TransactionLog } from "@/components/economy/transaction-log";
import { WorkSelectorModal } from "@/components/economy/work-selector-modal";
import { earnFromWork, getEconomicSummary } from "@/economy/earning-engine";
import type { WorkTypeId } from "@/economy/work-types";
import { getWorkTypeById } from "@/economy/work-types";
import { applyAction } from "@/engine/timeline";
import {
  createWorkAction,
  getAvailableWorkActions,
} from "@/engine/timeline/actions";
import { useSound } from "@/hooks/use-sound";
import { useTimelineStore } from "@/store/timeline-store";

export default function EconomyPage() {
  const router = useRouter();
  const { playSound } = useSound();
  const { gameState, setGameState, doAction } = useTimelineStore();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading Economy...
      </div>
    );
  }

  const economyState = gameState.economy;

  const handleSelectWork = (workTypeId: WorkTypeId) => {
    playSound("click");
    setIsWorkModalOpen(false);

    const workType = getWorkTypeById(workTypeId);
    if (!workType) return;

    // For work actions, we need to pass the work type metadata
    const workAction = createWorkAction(workType);

    // Apply the action directly since doAction only takes actionId
    // We need to use the store's internal applyAction
    const { gameState: currentState } = useTimelineStore.getState();
    if (currentState) {
      const nextState = applyAction(currentState, workAction);
      setGameState(nextState);
    }
  };

  const availableWorkActions = getAvailableWorkActions(gameState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-background flex flex-col pb-12"
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.back();
          }}
          className="rounded-full p-2.5 bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
          💰 Economy
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="flex-1 px-6 py-4">
        {/* Work Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Options
            </h2>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setIsWorkModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Briefcase className="h-4 w-4" />
              Choose Work
              {availableWorkActions.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {availableWorkActions.length} available
                </span>
              )}
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">
              Earn money by working. Different work types unlock as you progress
              and offer varying pay rates.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Current energy: {gameState.energy}/{gameState.energyMax}
            </p>
          </div>
        </section>

        {/* Transaction Log */}
        <TransactionLog
          economy={economyState}
          getSummary={() => getEconomicSummary(economyState)}
        />
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
