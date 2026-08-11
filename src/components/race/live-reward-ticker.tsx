"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coins, Flame, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";

export interface RewardPopupItem {
  id: string;
  type: "xp" | "money";
  amount: number;
  label: string;
  multiplier?: number;
}

interface LiveRewardTickerProps {
  totalXpGained: number;
  totalMoneyGained: number;
  popups: RewardPopupItem[];
  isRaceActive: boolean;
}

export function LiveRewardTicker({
  totalXpGained,
  totalMoneyGained,
  popups,
  isRaceActive,
}: LiveRewardTickerProps) {
  const preferredCurrency = useSettingsStore(
    (s) => s.settings.preferredCurrency ?? "USD",
  );
  const [activePopups, setActivePopups] = useState<RewardPopupItem[]>([]);

  useEffect(() => {
    if (popups.length > 0) {
      const latest = popups[popups.length - 1];
      setActivePopups((prev) => [...prev.slice(-3), latest]);
      const timer = setTimeout(() => {
        setActivePopups((prev) => prev.filter((p) => p.id !== latest.id));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [popups]);

  if (!isRaceActive) return null;

  return (
    <>
      {/* Floating Popups Container */}
      <div className="fixed top-36 right-6 z-40 flex flex-col items-end gap-1.5 pointer-events-none">
        <AnimatePresence>
          {activePopups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className={`px-3 py-1 rounded-full border text-xs font-mono font-black shadow-lg backdrop-blur-md flex items-center gap-1.5 ${
                popup.type === "xp"
                  ? "bg-indigo-950/80 border-indigo-500/60 text-indigo-300"
                  : "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
              }`}
            >
              <span>{popup.type === "xp" ? "⚡" : "💰"}</span>
              <span>
                +{popup.amount}{" "}
                {popup.type === "xp"
                  ? "XP"
                  : formatCurrency(popup.amount, preferredCurrency)}
              </span>
              {popup.multiplier && popup.multiplier > 1 && (
                <span className="text-[10px] text-amber-400 font-bold px-1 bg-black/40 rounded">
                  ×{popup.multiplier} 🔥
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Running Total Ticker in Top-Right */}
      <div className="fixed top-14 right-32 z-30 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-xs font-mono font-bold text-slate-200">
        <span className="text-indigo-400">+{totalXpGained} XP</span>
        <span className="text-slate-500">|</span>
        <span className="text-emerald-400">
          +{formatCurrency(totalMoneyGained, preferredCurrency)}
        </span>
      </div>
    </>
  );
}
