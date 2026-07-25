"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "@/i18n/use-translation";
import { loadGhostRun } from "@/social/ghost-engine";
import type { SimulationState } from "@/types/engine";
import type { DailyChallenge } from "@/types/engine";

interface GhostSplitComparisonProps {
  /** Current challenge data */
  challenge: DailyChallenge;
  /** Current simulation state log */
  stateLog: SimulationState[];
  /** Current kilometer */
  currentKm: number;
  /** Player's current pace */
  currentPace: number;
  /** Language for translations */
  lang: "en" | "id";
  /** Active ghost from game store */
  activeGhost: { runnerName: string; splits: number[] } | null;
  /** Player name */
  playerName: string;
  /** Whether the race is paused */
  isPaused: boolean;
}

interface SplitData {
  km: number;
  playerTime: number;
  ghostTime: number;
  delta: number; // positive = player is slower, negative = player is faster
}

/**
 * Component that displays ghost split comparison during a race.
 * Shows live delta, split comparison table, and pace sparkline.
 */
export function GhostSplitComparison({
  challenge,
  stateLog,
  currentKm,
  currentPace,
  lang,
  activeGhost,
  playerName,
  isPaused,
}: GhostSplitComparisonProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableGhosts, setAvailableGhosts] = useState<{ runnerName: string; splits: number[]; finishTime: number; recordedAt: string | number }[]>([]);
  const [selectedGhostIndex, setSelectedGhostIndex] = useState(0);

  // Load available ghosts for this challenge
  useEffect(() => {
    if (!challenge?.id) return;
    
    // Try to load ghost runs for this challenge
    const ghost = loadGhostRun(challenge.id, challenge.race.distance);
    if (ghost) {
      setAvailableGhosts([ghost]);
    } else {
      // Try without distance
      const ghostNoDistance = loadGhostRun(challenge.id);
      if (ghostNoDistance) {
        setAvailableGhosts([ghostNoDistance]);
      }
    }
    
    // If activeGhost is provided, add it to the list
    if (activeGhost) {
      setAvailableGhosts(prev => {
        // Check if already exists
        const exists = prev.some(g => g.runnerName === activeGhost.runnerName);
        if (!exists) {
          return [...prev, {
            runnerName: activeGhost.runnerName,
            splits: activeGhost.splits,
            finishTime: activeGhost.splits.reduce((a, b) => a + b, 0),
            recordedAt: new Date().toISOString()
          }];
        }
        return prev;
      });
    }
  }, [challenge?.id, challenge?.race.distance, activeGhost]);

  // Use active ghost or first available ghost
  const selectedGhost = useMemo(() => {
    if (activeGhost) {
      return {
        runnerName: activeGhost.runnerName,
        splits: activeGhost.splits,
        finishTime: activeGhost.splits.reduce((a, b) => a + b, 0)
      };
    }
    return availableGhosts[selectedGhostIndex] || null;
  }, [activeGhost, availableGhosts, selectedGhostIndex]);

  // Calculate split data for comparison
  const splitData: SplitData[] = useMemo(() => {
    if (!selectedGhost || !stateLog || stateLog.length === 0) return [];
    
    const splits: SplitData[] = [];
    
    // Start from km 1 (index 1 in stateLog)
    for (let i = 1; i < stateLog.length && i <= challenge.race.distance; i++) {
      const currentState = stateLog[i];
      const prevState = stateLog[i - 1];
      
      if (!currentState || !prevState) continue;
      
      const playerSplitTime = currentState.accumulatedTime - prevState.accumulatedTime;
      const ghostSplitTime = selectedGhost.splits[i - 1] || 0; // splits array is 0-indexed for km 1
      
      splits.push({
        km: i,
        playerTime: playerSplitTime,
        ghostTime: ghostSplitTime,
        delta: playerSplitTime - ghostSplitTime
      });
    }
    
    return splits;
  }, [selectedGhost, stateLog, challenge.race.distance]);

  // Get current delta (for live display)
  const currentDelta = useMemo(() => {
    if (!selectedGhost || splitData.length === 0) return null;
    
    // Find the most recent split
    const latestSplit = splitData[splitData.length - 1];
    return latestSplit?.delta || 0;
  }, [selectedGhost, splitData]);

  // Calculate cumulative comparison
  const cumulativeData = useMemo(() => {
    if (!selectedGhost || splitData.length === 0) return { playerTotal: 0, ghostTotal: 0, delta: 0 };
    
    const playerTotal = splitData.reduce((sum, split) => sum + split.playerTime, 0);
    const ghostTotal = splitData.reduce((sum, split) => sum + split.ghostTime, 0);
    
    return {
      playerTotal,
      ghostTotal,
      delta: playerTotal - ghostTotal
    };
  }, [selectedGhost, splitData]);

  // Format time
  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format delta
  const formatDelta = (seconds: number) => {
    if (seconds === 0) return "0.0s";
    if (seconds > 0) return `+${seconds.toFixed(1)}s`;
    return `${seconds.toFixed(1)}s`;
  };

  // Get delta color
  const getDeltaColor = (delta: number) => {
    if (delta > 0) return "text-red-400"; // Player is slower
    if (delta < 0) return "text-emerald-400"; // Player is faster
    return "text-slate-400";
  };

  // Get delta sign for display
  const getDeltaSign = (delta: number) => {
    if (delta > 0) return lang === "en" ? "behind" : "di belakang";
    if (delta < 0) return lang === "en" ? "ahead" : "di depan";
    return lang === "en" ? "equal" : "sama";
  };

  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Change selected ghost
  const handleGhostChange = useCallback((index: number) => {
    setSelectedGhostIndex(index);
  }, []);

  // No ghost available
  if (!selectedGhost && availableGhosts.length === 0) {
    return null;
  }

  // No split data yet
  if (splitData.length === 0 && currentKm === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full bg-slate-900/30 dark:bg-slate-800/40 border border-slate-700/50 dark:border-slate-700/60 rounded-2xl overflow-hidden"
    >
      {/* Header with live delta */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={toggleExpanded}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/20 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">👻</span>
          <div>
            <h3 className="text-sm font-bold text-white">
              {t("race.ghost_splits.title" as any)}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === "en" ? "vs" : "vs"} {selectedGhost?.runnerName || "Ghost"}
            </p>
          </div>
        </div>

        {/* Live Delta Display */}
        <div className="flex items-center gap-2">
          {currentDelta !== null && (
            <motion.span
              key={currentDelta}
              initial={{ scale: 1.2, color: "#34d399" }}
              animate={{ scale: 1, color: getDeltaColor(currentDelta) }}
              transition={{ duration: 0.3 }}
              className={`text-lg font-black font-mono ${getDeltaColor(currentDelta)}`}
            >
              {formatDelta(currentDelta)}
            </motion.span>
          )}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.span>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-700/40"
          >
            {/* Ghost Selection (if multiple ghosts available) */}
            {availableGhosts.length > 1 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                {availableGhosts.map((ghost, index) => (
                  <button
                    key={ghost.runnerName + index}
                    onClick={() => handleGhostChange(index)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedGhostIndex === index
                        ? "bg-orange-500 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                    }`}
                  >
                    {ghost.runnerName}
                  </button>
                ))}
              </div>
            )}

            {/* Split Comparison Table */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="col-span-2 text-center">KM</span>
                <span className="col-span-4 text-center">
                  {lang === "en" ? "You" : "Kamu"}
                </span>
                <span className="col-span-4 text-center">
                  {lang === "en" ? "Ghost" : "Hantu"}
                </span>
                <span className="col-span-2 text-center">Delta</span>
              </div>

              <div className="space-y-1">
                {splitData.map((split, index) => {
                  const isCurrentKm = split.km === currentKm;
                  return (
                    <motion.div
                      key={split.km}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-12 gap-1 items-center py-1.5 px-2 rounded-lg ${
                        isCurrentKm 
                          ? "bg-orange-500/10 border border-orange-500/30" 
                          : "hover:bg-slate-700/20"
                      }`}
                    >
                      <span className="col-span-2 text-center font-mono text-sm">
                        {split.km}
                      </span>
                      <span className="col-span-4 text-center font-mono text-sm">
                        {formatTime(split.playerTime)}
                      </span>
                      <span className="col-span-4 text-center font-mono text-sm">
                        {formatTime(split.ghostTime)}
                      </span>
                      <span className={`col-span-2 text-center font-mono text-sm ${getDeltaColor(split.delta)}`}>
                        {formatDelta(split.delta)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Cumulative Comparison */}
            <div className="px-4 py-3 border-t border-slate-700/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {lang === "en" ? "Overall" : "Total"}
                </span>
                <span className={`text-sm font-bold ${getDeltaColor(cumulativeData.delta)}`}>
                  {formatDelta(cumulativeData.delta)}
                </span>
              </div>
              
              {/* Mini progress bar */}
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${cumulativeData.delta > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.abs(cumulativeData.delta) / 10 * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {cumulativeData.delta > 0 
                  ? (lang === "en" ? "Behind ghost" : "Di belakang hantu")
                  : cumulativeData.delta < 0 
                    ? (lang === "en" ? "Ahead of ghost" : "Di depan hantu")
                    : (lang === "en" ? "Tied with ghost" : "Sama dengan hantu")}
              </p>
            </div>

            {/* Pace Sparkline */}
            <div className="px-4 py-3 border-t border-slate-700/40">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                {lang === "en" ? "Pace Comparison" : "Perbandingan Pace"}
              </h4>
              <PaceSparkline
                playerPaces={splitData.map(s => s.playerTime)}
                ghostPaces={splitData.map(s => s.ghostTime)}
                currentKm={currentKm}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Mini sparkline component for comparing player pace vs ghost pace
 */
interface PaceSparklineProps {
  playerPaces: number[];
  ghostPaces: number[];
  currentKm: number;
}

function PaceSparkline({ playerPaces, ghostPaces, currentKm }: PaceSparklineProps) {
  const maxPace = useMemo(() => {
    const allPaces = [...playerPaces, ...ghostPaces];
    return Math.max(...allPaces.filter(p => p > 0), 1);
  }, [playerPaces, ghostPaces]);

  const minPace = useMemo(() => {
    const allPaces = [...playerPaces, ...ghostPaces];
    return Math.min(...allPaces.filter(p => p > 0), maxPace);
  }, [playerPaces, ghostPaces, maxPace]);

  const paceRange = maxPace - minPace || 1;

  // Normalize pace values for display (invert so lower pace = higher position)
  const normalizePace = (pace: number) => {
    if (pace <= 0) return 0;
    const normalized = (maxPace - pace) / paceRange;
    return Math.max(0, Math.min(100, normalized * 100));
  };

  return (
    <div className="relative h-20 flex items-end justify-between gap-1">
      {/* Player pace line */}
      <div className="absolute bottom-0 left-0 right-0 h-full">
        {playerPaces.map((pace, index) => {
          const height = normalizePace(pace);
          const isCurrent = index + 1 === currentKm;
          return (
            <motion.div
              key={`player-${index}`}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`absolute left-0 w-full/${playerPaces.length} bg-blue-500/80 rounded-t-sm transition-all ${
                isCurrent ? "ring-2 ring-blue-400 ring-inset" : ""
              }`}
              style={{ left: `${(index / (playerPaces.length - 1)) * 100}%` }}
              title={`KM ${index + 1}: ${Math.floor(pace / 60)}:${(pace % 60).toString().padStart(2, "0")}`}
            />
          );
        })}
      </div>

      {/* Ghost pace line */}
      <div className="absolute bottom-0 left-0 right-0 h-full">
        {ghostPaces.map((pace, index) => {
          const height = normalizePace(pace);
          const isCurrent = index + 1 === currentKm;
          return (
            <motion.div
              key={`ghost-${index}`}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              className={`absolute left-0 w-full/${ghostPaces.length} bg-orange-500/80 rounded-t-sm transition-all ${
                isCurrent ? "ring-2 ring-orange-400 ring-inset" : ""
              }`}
              style={{ left: `${(index / (ghostPaces.length - 1)) * 100}%` }}
              title={`KM ${index + 1}: ${Math.floor(pace / 60)}:${(pace % 60).toString().padStart(2, "0")}`}
            />
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between text-[8px] text-slate-500">
        {playerPaces.map((_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-[-30px] top-0 bottom-0 flex flex-col justify-between text-[8px] text-slate-500">
        <span>{formatTime(minPace)}</span>
        <span>{formatTime((minPace + maxPace) / 2)}</span>
        <span>{formatTime(maxPace)}</span>
      </div>

      {/* Legend */}
      <div className="absolute top-0 right-0 flex gap-2 text-[8px]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500/80"></span>
          <span className="text-slate-400">You</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500/80"></span>
          <span className="text-slate-400">Ghost</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(seconds: number) {
  if (!seconds || seconds <= 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
