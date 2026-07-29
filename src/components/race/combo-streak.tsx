"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Crown, Award } from "lucide-react";

interface ComboStreakProps {
  comboCount: number;
  winStreak: number;
  isComboBroken?: boolean;
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 16) return 2.5;
  if (combo >= 11) return 2.0;
  if (combo >= 6) return 1.5;
  if (combo >= 3) return 1.2;
  return 1.0;
}

export function getComboStatusText(combo: number): { label: string; color: string; icon: string } {
  if (combo >= 16) return { label: "Legendary 👑", color: "from-red-500 to-rose-600 text-white", icon: "👑" };
  if (combo >= 11) return { label: "Unstoppable ⚡", color: "from-orange-500 to-amber-500 text-white", icon: "⚡" };
  if (combo >= 6) return { label: "On Fire 🔥", color: "from-amber-400 to-yellow-500 text-slate-900", icon: "🔥" };
  if (combo >= 3) return { label: "Flowing ✨", color: "from-blue-400 to-cyan-400 text-slate-900", icon: "✨" };
  return { label: "Standard", color: "bg-slate-800 text-slate-300", icon: "" };
}

export function ComboStreak({ comboCount, winStreak, isComboBroken }: ComboStreakProps) {
  const [showBreakBanner, setShowBreakBanner] = useState(false);

  useEffect(() => {
    if (isComboBroken) {
      setShowBreakBanner(true);
      const timer = setTimeout(() => setShowBreakBanner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isComboBroken]);

  const multiplier = getComboMultiplier(comboCount);
  const status = getComboStatusText(comboCount);

  return (
    <div className="flex flex-col items-center gap-1 z-30">
      {/* Combo Broken Flash Banner */}
      <AnimatePresence>
        {showBreakBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-lg border border-rose-400 animate-bounce"
          >
            💥 COMBO LOST!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Combo Counter Widget */}
      {comboCount >= 3 && !showBreakBanner && (
        <motion.div
          key={comboCount}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-3.5 py-1 rounded-full bg-gradient-to-r ${status.color} shadow-lg border border-white/20 flex items-center gap-2 backdrop-blur-md`}
        >
          <Flame className="w-4 h-4 animate-bounce" />
          <span className="font-mono font-black text-sm">{comboCount}x COMBO</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/30">
            ×{multiplier} XP
          </span>
        </motion.div>
      )}

      {/* Win Streak Indicator */}
      {winStreak >= 2 && (
        <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
          <span>🔥</span>
          <span>{winStreak} Race Win Streak</span>
        </div>
      )}
    </div>
  );
}
