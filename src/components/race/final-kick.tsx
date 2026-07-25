"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export type KickTiming = "perfect" | "good" | "miss";

interface FinalKickProps {
  /** Meters remaining to the finish (0-500) */
  metersRemaining: number;
  onKick: (timing: KickTiming) => void;
  /** Cumulative seconds saved through kicks */
  totalBoost: number;
  /** Number of perfect kicks so far */
  perfectCount: number;
  isPaused: boolean;
}

// Checkpoints: kick windows appear at every 100m mark (500, 400, 300, 200, 100)
const KICK_CHECKPOINTS = [500, 400, 300, 200, 100] as const;
const WINDOW_MS = 600; // 0.6s window to tap

/**
 * Full-width banner that activates during the final 500m of a race.
 * Shows a timed "KICK!" button at each 100m checkpoint. Timing quality
 * (perfect / good / miss) determines the pace bonus granted.
 */
export function FinalKick({ metersRemaining, onKick, totalBoost, perfectCount, isPaused }: FinalKickProps) {
  const [activeWindow, setActiveWindow] = useState<number | null>(null); // which checkpoint is active
  const [lastResult, setLastResult] = useState<{ timing: KickTiming; checkpoint: number } | null>(null);
  const [firedCheckpoints, setFiredCheckpoints] = useState<Set<number>>(new Set());
  const windowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windowOpenTimeRef = useRef<number>(0);

  // Clear timers on unmount / pause
  useEffect(() => {
    return () => {
      if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
    };
  }, []);

  // Detect when we cross a checkpoint
  useEffect(() => {
    if (isPaused) return;

    for (const checkpoint of KICK_CHECKPOINTS) {
      // Trigger when meters remaining drops to or below checkpoint and we haven't fired it yet
      if (metersRemaining <= checkpoint && !firedCheckpoints.has(checkpoint)) {
        setFiredCheckpoints((prev) => new Set([...prev, checkpoint]));
        setActiveWindow(checkpoint);
        windowOpenTimeRef.current = Date.now();

        // Auto-close window after WINDOW_MS
        if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
        windowTimerRef.current = setTimeout(() => {
          setActiveWindow((prev) => {
            if (prev === checkpoint) {
              // Missed!
              handleKickResult("miss", checkpoint);
              return null;
            }
            return prev;
          });
        }, WINDOW_MS);

        break; // Only trigger one at a time
      }
    }
  }, [metersRemaining, isPaused, firedCheckpoints]);

  const handleKickResult = useCallback(
    (timing: KickTiming, checkpoint: number) => {
      setLastResult({ timing, checkpoint });
      onKick(timing);
      setTimeout(() => setLastResult(null), 800);
    },
    [onKick],
  );

  const handleKickPress = useCallback(() => {
    if (activeWindow === null) return;
    const elapsed = Date.now() - windowOpenTimeRef.current;
    const timing: KickTiming = elapsed < WINDOW_MS * 0.4 ? "perfect" : elapsed < WINDOW_MS * 0.75 ? "good" : "miss";
    const checkpoint = activeWindow;
    setActiveWindow(null);
    if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
    handleKickResult(timing, checkpoint);
  }, [activeWindow, handleKickResult]);

  const isPerfectRun = perfectCount === 5;
  const boostColor = totalBoost >= 2 ? "text-emerald-400" : totalBoost >= 1 ? "text-amber-400" : "text-slate-400";

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="w-full"
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border p-4
          bg-gradient-to-r from-red-950/80 via-orange-950/60 to-red-950/80
          border-red-800/60
          shadow-lg shadow-red-900/30
        `}
      >
        {/* Animated background pulse */}
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/30 to-orange-500/20 pointer-events-none rounded-2xl"
        />

        <div className="relative z-10 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                className="text-xl"
              >
                🏃
              </motion.span>
              <div>
                <motion.p
                  animate={{ textShadow: ["0 0 6px #f97316", "0 0 20px #f97316", "0 0 6px #f97316"] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="text-sm font-black uppercase tracking-widest text-orange-400"
                >
                  FINAL KICK!
                </motion.p>
                <p className="text-[10px] text-red-300/80">
                  {metersRemaining > 0 ? `${Math.round(metersRemaining)}m to finish` : "FINISH!"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400">Boost</p>
                <p className={`text-sm font-black font-mono ${boostColor}`}>
                  -{totalBoost.toFixed(1)}s
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400">Perfect</p>
                <p className="text-sm font-black text-amber-400">
                  {perfectCount}/5
                </p>
              </div>
            </div>
          </div>

          {/* Boost bar */}
          <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min(100, (totalBoost / 2.5) * 100)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`h-full rounded-full ${totalBoost >= 2.5 ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
            />
          </div>

          {/* Checkpoint progress dots */}
          <div className="flex items-center justify-center gap-2">
            {KICK_CHECKPOINTS.map((cp) => {
              const fired = firedCheckpoints.has(cp) || metersRemaining < cp;
              const isActive = activeWindow === cp;
              return (
                <motion.div
                  key={cp}
                  animate={isActive ? { scale: [1, 1.3, 1], boxShadow: ["0 0 0 0 #f97316", "0 0 0 6px #f97316aa", "0 0 0 0 #f97316"] } : {}}
                  transition={{ duration: 0.5, repeat: isActive ? Number.POSITIVE_INFINITY : 0 }}
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black
                    ${fired ? "bg-orange-500 border-orange-400 text-white" : "bg-slate-800 border-slate-600 text-slate-500"}
                    ${isActive ? "border-orange-300 shadow-[0_0_10px_#f97316]" : ""}
                  `}
                >
                  {cp / 100}
                </motion.div>
              );
            })}
          </div>

          {/* Kick button zone */}
          <AnimatePresence mode="wait">
            {activeWindow !== null ? (
              <motion.button
                key="kick-btn"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={handleKickPress}
                type="button"
                className="w-full py-4 rounded-xl text-xl font-black uppercase tracking-widest text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 active:scale-95 transition-transform shadow-lg shadow-orange-500/40 border border-orange-400/50"
              >
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY }}
                >
                  ⚡ KICK!
                </motion.span>
              </motion.button>
            ) : lastResult ? (
              <motion.div
                key="result"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-3 rounded-xl font-black text-lg uppercase tracking-widest
                  ${lastResult.timing === "perfect" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30" : lastResult.timing === "good" ? "text-amber-400 bg-amber-500/10 border border-amber-500/30" : "text-slate-400 bg-slate-800/50 border border-slate-700"}`}
              >
                {lastResult.timing === "perfect" && "⚡ PERFECT!"}
                {lastResult.timing === "good" && "👍 Good!"}
                {lastResult.timing === "miss" && "💨 Missed"}
              </motion.div>
            ) : (
              <div
                key="waiting"
                className="text-center py-3 text-[11px] text-slate-500 uppercase tracking-widest"
              >
                Ready for next checkpoint...
              </div>
            )}
          </AnimatePresence>

          {/* Perfect kick celebration */}
          <AnimatePresence>
            {isPerfectRun && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-2 rounded-xl text-sm font-black text-amber-300 bg-amber-500/10 border border-amber-500/30"
              >
                🔥 PERFECT KICK! All 5 checkpoints!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
