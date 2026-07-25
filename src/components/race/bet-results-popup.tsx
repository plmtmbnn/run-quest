"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";
import type { PlacedBet } from "./self-bet-panel";

interface BetResultsPopupProps {
  results: Array<PlacedBet & { payout: number; won: boolean }>;
  onClose: () => void;
  onRunItBack: () => void;
}

/**
 * Full-screen overlay shown after race finishes to reveal bet outcomes.
 */
export function BetResultsPopup({ results, onClose, onRunItBack }: BetResultsPopupProps) {
  const preferredCurrency = useSettingsStore(
    (s) => s.settings.preferredCurrency ?? "USD",
  );

  const totalPayout = results.filter((r) => r.won).reduce((sum, r) => sum + r.payout, 0);
  const totalWagered = results.reduce((sum, r) => sum + r.wager, 0);
  const netGain = results.filter((r) => r.won).reduce((sum, r) => sum + r.payout - r.wager, 0);
  const anyWon = results.some((r) => r.won);
  const allWon = results.every((r) => r.won);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
            className="text-4xl mb-2"
          >
            {allWon ? "🎉" : anyWon ? "🏅" : "💸"}
          </motion.div>
          <h2 className="text-xl font-black text-white">
            {allWon ? "Bets Won!" : anyWon ? "Partial Win!" : "Better Luck Next Time"}
          </h2>
          {anyWon && (
            <p className="text-emerald-400 font-bold text-sm mt-1">
              +{formatCurrency(netGain, preferredCurrency)} net gain
            </p>
          )}
        </div>

        {/* Individual bet results */}
        <div className="flex flex-col gap-2">
          {results.map((result, i) => {
            const payout = Math.round(result.wager * result.target.multiplier);
            return (
              <motion.div
                key={result.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-2xl border
                  ${result.won
                    ? "bg-emerald-950/40 border-emerald-600/40"
                    : "bg-red-950/30 border-red-700/30"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{result.won ? "✅" : "❌"}</span>
                  <div>
                    <p className="text-xs font-black text-white">{result.target.label}</p>
                    <p className="text-[10px] text-slate-400">
                      Wagered {formatCurrency(result.wager, preferredCurrency)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {result.won ? (
                    <motion.p
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, delay: 0.2 + i * 0.1 }}
                      className="text-sm font-black text-emerald-400"
                    >
                      +{formatCurrency(payout, preferredCurrency)}
                    </motion.p>
                  ) : (
                    <p className="text-sm font-bold text-red-400">
                      -{formatCurrency(result.wager, preferredCurrency)}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-500">{result.target.multiplier}x</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Total summary */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-3 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-bold">Net Result</span>
          <span className={`font-black text-base ${netGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {netGain >= 0 ? "+" : ""}{formatCurrency(netGain, preferredCurrency)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!anyWon && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onRunItBack}
              className="flex-1 py-3 rounded-2xl text-sm font-black text-orange-400 border border-orange-500/40 hover:bg-orange-950/30 transition-all"
            >
              🔄 Run it Back?
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onClose}
            className={`py-3 rounded-2xl text-sm font-black transition-all active:scale-95
              ${anyWon
                ? "flex-1 bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20"
                : "flex-1 bg-slate-700 hover:bg-slate-600 text-white"
              }`}
          >
            {anyWon ? "Collect & Continue" : "Continue"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
