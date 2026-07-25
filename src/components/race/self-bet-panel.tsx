"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BetTargetId =
  | "top_3"
  | "win"
  | "beat_pb"
  | "negative_split"
  | "no_dnf"
  | "clean_race";

export interface BetTarget {
  id: BetTargetId;
  label: string;
  labelId: string;
  description: string;
  multiplier: number;
  emoji: string;
}

export interface PlacedBet {
  id: string;
  target: BetTarget;
  wager: number;
  status: "pending" | "won" | "lost";
}

export const BET_TARGETS: BetTarget[] = [
  {
    id: "no_dnf",
    label: "No DNF",
    labelId: "Tidak DNF",
    description: "Finish the race without dropping out",
    multiplier: 1.5,
    emoji: "🛡️",
  },
  {
    id: "top_3",
    label: "Finish Top 3",
    labelId: "Finis 3 Besar",
    description: "Cross the line in 1st, 2nd or 3rd place",
    multiplier: 2.0,
    emoji: "🥉",
  },
  {
    id: "beat_pb",
    label: "Beat Personal Best",
    labelId: "Kalahkan PB",
    description: "Finish faster than your best time for this distance",
    multiplier: 3.0,
    emoji: "⏱️",
  },
  {
    id: "negative_split",
    label: "Negative Split",
    labelId: "Split Negatif",
    description: "Run the second half faster than the first",
    multiplier: 2.5,
    emoji: "📈",
  },
  {
    id: "win",
    label: "Win the Race",
    labelId: "Menangkan Lomba",
    description: "Take 1st place overall",
    multiplier: 5.0,
    emoji: "🏆",
  },
  {
    id: "clean_race",
    label: "Clean Race",
    labelId: "Lomba Bersih",
    description: "Complete without any breaking point triggered",
    multiplier: 2.0,
    emoji: "✨",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_BETS = 2;
const MIN_WAGER = 50;
const MAX_BALANCE_FRACTION = 0.25; // 25% of balance

// ─── Component ───────────────────────────────────────────────────────────────

interface SelfBetPanelProps {
  currentBalance: number;
  placedBets: PlacedBet[];
  onPlaceBet: (target: BetTarget, wager: number) => void;
  onCancelBet: (betId: string) => void;
  /** km already run — panel locks after km 2 */
  currentKm: number;
  hasBreakingPoint: boolean;
}

export function SelfBetPanel({
  currentBalance,
  placedBets,
  onPlaceBet,
  onCancelBet,
  currentKm,
  hasBreakingPoint,
}: SelfBetPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<BetTarget | null>(null);
  const [wagerInput, setWagerInput] = useState("");
  const [error, setError] = useState("");

  const preferredCurrency = useSettingsStore(
    (s) => s.settings.preferredCurrency ?? "USD",
  );
  const lang = "en"; // resolved upstream, pass later if needed

  const isLocked = currentKm > 2;
  const maxWager = Math.floor(currentBalance * MAX_BALANCE_FRACTION);
  const totalWagered = placedBets.reduce((sum, b) => sum + b.wager, 0);
  const remainingBalance = currentBalance - totalWagered;
  const canAddBet = placedBets.length < MAX_BETS && !isLocked && remainingBalance >= MIN_WAGER;

  const placedIds = new Set(placedBets.map((b) => b.target.id));

  function handlePlace() {
    setError("");
    if (!selectedTarget) { setError("Pick a bet type first."); return; }
    const wager = Number.parseInt(wagerInput, 10);
    if (!wager || wager < MIN_WAGER) { setError(`Minimum wager is ${formatCurrency(MIN_WAGER, preferredCurrency)}.`); return; }
    if (wager > Math.min(maxWager, remainingBalance)) {
      setError(`Max wager is ${formatCurrency(Math.min(maxWager, remainingBalance), preferredCurrency)}.`);
      return;
    }
    if (hasBreakingPoint) { setError("Cannot bet with a severe injury."); return; }
    onPlaceBet(selectedTarget, wager);
    setSelectedTarget(null);
    setWagerInput("");
    setIsOpen(false);
  }

  return (
    <div className="w-full">
      {/* Collapsed toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-950/30 to-orange-950/20 dark:from-amber-950/40 dark:to-orange-950/30 hover:border-amber-400/60 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <span className="text-sm font-black text-amber-300 uppercase tracking-widest">
            Bet on Yourself
          </span>
          {placedBets.length > 0 && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              {placedBets.length} active
            </span>
          )}
          {isLocked && (
            <span className="text-[10px] font-bold bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">
              🔒 Locked (past km 2)
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-amber-400 text-xs font-bold"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-950/20 to-slate-950/60 p-4 flex flex-col gap-4">

              {/* Balance info */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Available</span>
                <span className="font-black text-amber-300 font-mono">
                  {formatCurrency(remainingBalance, preferredCurrency)}
                </span>
              </div>

              {/* Active bets */}
              {placedBets.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Active Bets</span>
                  {placedBets.map((bet) => {
                    const payout = Math.round(bet.wager * bet.target.multiplier);
                    return (
                      <div
                        key={bet.id}
                        className="flex items-center justify-between bg-amber-900/20 border border-amber-700/30 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span>{bet.target.emoji}</span>
                          <div>
                            <p className="text-xs font-bold text-amber-200">{bet.target.label}</p>
                            <p className="text-[10px] text-slate-400">
                              {formatCurrency(bet.wager, preferredCurrency)} → {formatCurrency(payout, preferredCurrency)} ({bet.target.multiplier}x)
                            </p>
                          </div>
                        </div>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => onCancelBet(bet.id)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded hover:bg-red-900/20"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add new bet — only if can add */}
              {canAddBet && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    {placedBets.length === 0 ? "Choose a Bet" : "Add Another"}
                  </span>

                  {/* Bet target chips */}
                  <div className="grid grid-cols-2 gap-2">
                    {BET_TARGETS.map((target) => {
                      const alreadyPlaced = placedIds.has(target.id);
                      const isSelected = selectedTarget?.id === target.id;
                      return (
                        <button
                          key={target.id}
                          type="button"
                          disabled={alreadyPlaced}
                          onClick={() => setSelectedTarget(isSelected ? null : target)}
                          className={`flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left transition-all
                            ${isSelected
                              ? "border-amber-400 bg-amber-900/40 shadow-sm shadow-amber-500/20"
                              : alreadyPlaced
                                ? "border-slate-700 bg-slate-900/20 opacity-40 cursor-not-allowed"
                                : "border-slate-700/60 bg-slate-900/30 hover:border-amber-600/60 hover:bg-amber-950/30"
                            }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{target.emoji}</span>
                            <span className="text-[11px] font-black text-white leading-tight">{target.label}</span>
                          </div>
                          <span className="text-[9px] text-amber-400 font-bold">{target.multiplier}x payout</span>
                          <span className="text-[9px] text-slate-400 leading-tight">{target.description}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Wager input */}
                  {selectedTarget && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                          <span className="px-3 text-slate-400 text-sm font-bold">
                            {formatCurrency(1, preferredCurrency).replace("1.00", "").replace("1", "").trim() || "$"}
                          </span>
                          <input
                            type="number"
                            min={MIN_WAGER}
                            max={Math.min(maxWager, remainingBalance)}
                            value={wagerInput}
                            onChange={(e) => { setWagerInput(e.target.value); setError(""); }}
                            placeholder={String(MIN_WAGER)}
                            className="flex-1 bg-transparent text-white text-sm font-mono font-bold py-2.5 outline-none pr-3"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handlePlace}
                          className="px-4 py-2.5 rounded-xl text-sm font-black bg-amber-500 hover:bg-amber-400 text-black transition-all active:scale-95 shadow-sm shadow-amber-500/30"
                        >
                          Bet!
                        </button>
                      </div>

                      {/* Payout preview */}
                      {wagerInput && Number(wagerInput) >= MIN_WAGER && (
                        <p className="text-xs text-center text-emerald-400 font-bold">
                          {formatCurrency(Number(wagerInput), preferredCurrency)} →{" "}
                          <span className="text-emerald-300">
                            {formatCurrency(Math.round(Number(wagerInput) * selectedTarget.multiplier), preferredCurrency)}
                          </span>{" "}
                          ({selectedTarget.multiplier}x)
                        </p>
                      )}

                      {/* Slider shortcut */}
                      <input
                        type="range"
                        min={MIN_WAGER}
                        max={Math.min(maxWager, remainingBalance)}
                        value={wagerInput || MIN_WAGER}
                        onChange={(e) => { setWagerInput(e.target.value); setError(""); }}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>{formatCurrency(MIN_WAGER, preferredCurrency)}</span>
                        <span>{formatCurrency(Math.min(maxWager, remainingBalance), preferredCurrency)}</span>
                      </div>

                      {/* Error */}
                      {error && (
                        <p className="text-xs text-red-400 font-bold text-center">{error}</p>
                      )}

                      {remainingBalance < 100 && (
                        <p className="text-[10px] text-amber-500 text-center font-bold">
                          ⚠️ High risk — low balance!
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Max bets reached */}
              {placedBets.length >= MAX_BETS && !isLocked && (
                <p className="text-[11px] text-slate-400 text-center">
                  Maximum {MAX_BETS} bets per race reached.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
