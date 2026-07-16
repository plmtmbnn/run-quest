"use client";

import { TransactionLog } from "@/components/economy/transaction-log";
import { getEconomicSummary } from "@/economy/earning-engine";
import { useTimelineStore } from "@/store/timeline-store";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/use-sound";

export default function EconomyPage() {
  const router = useRouter();
  const { playSound } = useSound();
  const { gameState } = useTimelineStore();

  if (!gameState) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading Economy...</div>;
  }

  const economyState = gameState.economy;

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
        <TransactionLog economy={economyState} getSummary={() => getEconomicSummary(economyState)} />
      </main>
    </motion.div>
  );
}
