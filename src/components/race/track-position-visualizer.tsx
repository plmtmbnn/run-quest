"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Compass, Maximize2, Minimize2 } from "lucide-react";
import type { Surface, PacingPlan } from "@/types/engine";

export interface TrackRunner {
  id: string;
  name: string;
  isPlayer: boolean;
  distance: number;
  accumulatedTime: number;
  isDNF: boolean;
  isGhost?: boolean;
}

interface TrackPositionVisualizerProps {
  runners: TrackRunner[];
  currentKm: number;
  raceDistance: number;
  simSpeed: 1 | 2 | 5;
  selectedPacing: PacingPlan;
  surface: Surface;
  playerEnergy: number;
  playSound?: (sound: "click" | "tick" | "success" | "alert") => void;
}

export function TrackPositionVisualizer({
  runners,
  currentKm,
  raceDistance,
  simSpeed,
  selectedPacing,
  surface,
  playerEnergy,
  playSound,
}: TrackPositionVisualizerProps) {
  const [viewMode, setViewMode] = useState<"full" | "proximity">("full");
  const [overtakeMessage, setOvertakeMessage] = useState<string | null>(null);

  // Keep track of previous runner ranks to detect overtakes
  const prevRanksRef = useRef<Map<string, number>>(new Map());

  // Rank sorting for badges & overtake detection
  const sortedRunners = [...runners].sort((a, b) => {
    if (a.isDNF && !b.isDNF) return 1;
    if (!a.isDNF && b.isDNF) return -1;
    if (a.isDNF && b.isDNF) return 0;
    if (b.distance !== a.distance) return b.distance - a.distance;
    return a.accumulatedTime - b.accumulatedTime;
  });

  const playerRunner = runners.find((r) => r.isPlayer);
  const playerDistance = playerRunner ? playerRunner.distance : currentKm;
  const playerRank = sortedRunners.findIndex((r) => r.isPlayer) + 1;

  // Detect overtakes
  useEffect(() => {
    const currentRanks = new Map<string, number>();
    sortedRunners.forEach((r, idx) => currentRanks.set(r.id, idx + 1));

    const prevPlayerRank = prevRanksRef.current.get("player_local");
    if (prevPlayerRank !== undefined && playerRank < prevPlayerRank) {
      // Player gained rank!
      const passedRunner = sortedRunners[playerRank]; // runner right behind player now
      const msg = passedRunner ? `Overtook ${passedRunner.name}! ⚡` : "Moved up in position! ⚡";
      setOvertakeMessage(msg);
      if (playSound) playSound("success");

      const timer = setTimeout(() => setOvertakeMessage(null), 3000);
      return () => clearTimeout(timer);
    }

    prevRanksRef.current = currentRanks;
  }, [playerRank, sortedRunners, playSound]);

  // Calculate view bounds for full vs proximity mode
  let minDist = 0;
  let maxDist = raceDistance;

  if (viewMode === "proximity") {
    const span = Math.max(3, Math.min(6, raceDistance * 0.3));
    minDist = Math.max(0, playerDistance - span / 2);
    maxDist = Math.min(raceDistance, minDist + span);
    if (maxDist === raceDistance) {
      minDist = Math.max(0, raceDistance - span);
    }
  }

  // Calculate kilometer tick markers
  const markerStep = raceDistance > 20 ? 5 : raceDistance > 10 ? 2 : 1;
  const trackMarkers: number[] = [];
  for (let i = 0; i <= raceDistance; i += markerStep) {
    if (i >= minDist && i <= maxDist) {
      trackMarkers.push(i);
    }
  }
  if (trackMarkers.length === 0 || trackMarkers[trackMarkers.length - 1] < Math.min(raceDistance, maxDist)) {
    if (raceDistance >= minDist && raceDistance <= maxDist) {
      trackMarkers.push(raceDistance);
    }
  }

  // Multi-lane staggering calculation to prevent overlapping avatars
  // We divide the runners into 3 vertical lanes (0, 1, 2) based on proximity
  const runnerLaneMap = new Map<string, number>();
  sortedRunners.forEach((r, index) => {
    // Alternate lanes for close runners
    const lane = index % 3;
    runnerLaneMap.set(r.id, lane);
  });

  // Surface background styling
  const surfaceStyles: Partial<Record<Surface, string>> = {
    road: "bg-slate-900 border-slate-700/80 text-slate-300",
    trail: "bg-amber-950/40 border-amber-900/60 text-amber-200",
    track: "bg-red-950/40 border-red-900/60 text-red-200",
  };

  // Pacing mode helpers
  const isSprint = selectedPacing === "sprint" || selectedPacing === "aggressive";
  const isPush = selectedPacing === "push" || selectedPacing === "negative_split";
  const isSteady = selectedPacing === "cruise" || selectedPacing === "steady";

  // Stride animation speed based on pacing strategy
  const bounceDuration = isSprint ? 0.35 : isPush ? 0.5 : isSteady ? 0.65 : 0.85;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Info & View Switcher Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
            <span>Track Position</span>
          </h4>
          <span className="text-[10px] md:text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
            Rank #{playerRank} of {runners.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Overtake Banner Toast */}
          <AnimatePresence>
            {overtakeMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-lg shadow-orange-500/30"
              >
                <Zap className="w-3.5 h-3.5 fill-current animate-bounce" />
                <span>{overtakeMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setViewMode((prev) => (prev === "full" ? "proximity" : "full"));
              if (playSound) playSound("click");
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
            title="Toggle between Full Track and Proximity View"
          >
            {viewMode === "full" ? (
              <>
                <Minimize2 className="w-3 h-3 text-orange-500" />
                <span>Proximity View</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 text-orange-500" />
                <span>Full Track</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Visual Track Container */}
      <div
        className={`relative h-28 md:h-32 rounded-[1.75rem] border p-2 flex items-center overflow-hidden transition-all shadow-inner ${
          surfaceStyles[surface] || surfaceStyles.road
        }`}
      >
        {/* Track Lane Decorative Lines */}
        <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-white/10 pointer-events-none" />
        <div className="absolute inset-x-0 top-2/3 border-b border-dashed border-white/10 pointer-events-none" />

        {/* Start / Water / Finish Line Markers */}
        {minDist === 0 && (
          <div className="absolute left-3 top-0 bottom-0 flex flex-col items-center justify-center opacity-40 pointer-events-none z-0">
            <div className="h-full w-1 border-r-2 border-dashed border-emerald-400" />
            <span className="absolute top-1 text-[8px] font-black tracking-tighter uppercase text-emerald-400">
              START
            </span>
          </div>
        )}

        {maxDist === raceDistance && (
          <div className="absolute right-3 top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <div className="h-full w-1.5 bg-gradient-to-b from-white via-black to-white opacity-60" />
            <span className="absolute top-1 text-[8px] font-black tracking-tighter uppercase text-amber-400">
              FINISH 🏁
            </span>
          </div>
        )}

        {/* Kilometer Track Markers */}
        <div className="absolute inset-0 px-6 pointer-events-none">
          {trackMarkers.map((markerKm) => {
            const range = maxDist - minDist || 1;
            const pct = ((markerKm - minDist) / range) * 100;
            return (
              <div
                key={`marker-${markerKm}`}
                className="absolute top-0 bottom-0 flex flex-col items-center justify-between py-1 transform -translate-x-1/2"
                style={{ left: `${Math.min(96, Math.max(4, pct))}%` }}
              >
                <div className="h-2 w-0.5 bg-slate-400/40 rounded-full" />
                <span className="text-[8px] md:text-[9px] font-extrabold text-slate-400/70 font-mono">
                  {markerKm}k
                </span>
              </div>
            );
          })}
        </div>

        {/* Runners on the track with Multi-Lane Staggering & Smooth Motion */}
        {runners.map((r) => {
          const range = maxDist - minDist || 1;
          const rawPct = ((r.distance - minDist) / range) * 100;
          const clampedPct = Math.min(94, Math.max(4, rawPct));

          const lane = runnerLaneMap.get(r.id) ?? 1;
          // Calculate top percentage position for 3 distinct lanes: 18%, 48%, 75%
          const topPercent = lane === 0 ? "18%" : lane === 1 ? "48%" : "75%";
          const isExhausted = r.isPlayer && playerEnergy <= 25;
          const rankIndex = sortedRunners.findIndex((s) => s.id === r.id) + 1;

          return (
            <motion.div
              key={r.id}
              initial={{ left: `${clampedPct}%`, top: topPercent }}
              animate={{
                left: `${clampedPct}%`,
                top: topPercent,
              }}
              transition={{
                left: { duration: 10 / simSpeed, ease: "linear" },
                top: { duration: 0.4, ease: "easeInOut" },
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10`}
              style={{ pointerEvents: "auto" }}
            >
              {/* Runner Container */}
              <div className="relative group flex flex-col items-center">
                {/* Active Pacing Aura / FX */}
                {r.isPlayer && (
                  <div
                    className={`absolute -inset-1.5 rounded-full blur-sm transition-all animate-pulse ${
                      isSprint
                        ? "bg-gradient-to-r from-orange-500 to-red-600 opacity-90 scale-125"
                        : isPush
                          ? "bg-cyan-400 opacity-70 scale-110"
                          : isExhausted
                            ? "bg-red-500 opacity-80 animate-ping"
                            : "bg-orange-400/40 opacity-40"
                    }`}
                  />
                )}

                {r.isGhost && (
                  <div className="absolute -inset-1 rounded-full bg-indigo-500/40 blur-sm animate-pulse" />
                )}

                {/* Stride Oscillation Avatar Box */}
                <motion.div
                  animate={
                    !r.isDNF
                      ? {
                          y: [0, -3, 0],
                        }
                      : {}
                  }
                  transition={{
                    repeat: Infinity,
                    duration: bounceDuration,
                    ease: "easeInOut",
                  }}
                  className={`relative h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black text-white shadow-lg border-2 transition-all cursor-pointer ${
                    r.isPlayer
                      ? "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 border-white dark:border-slate-900 z-30 scale-110 ring-2 ring-orange-500/40"
                      : r.isGhost
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-200 z-20 opacity-90"
                        : r.isDNF
                          ? "bg-slate-600 border-slate-400 opacity-50 grayscale z-0"
                          : "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-300 dark:border-slate-700 z-10"
                  }`}
                >
                  {/* Rank Badge Indicator */}
                  <span className="absolute -top-2 -right-1 bg-slate-950/90 text-white font-extrabold text-[8px] px-1 py-0.2 rounded-full border border-slate-700 shadow-sm font-mono">
                    #{rankIndex}
                  </span>

                  {/* Icon or Initials */}
                  {r.isPlayer ? (
                    <span className="flex items-center justify-center">
                      {isSprint ? (
                        <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
                      ) : (
                        "YOU"
                      )}
                    </span>
                  ) : r.isGhost ? (
                    "👻"
                  ) : (
                    r.name[0]
                  )}
                </motion.div>

                {/* Always-on or Hover Tooltip for Runner Name & Distance */}
                <div
                  className={`mt-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-extrabold whitespace-nowrap backdrop-blur-md shadow-sm border transition-all ${
                    r.isPlayer
                      ? "bg-orange-500/90 text-white border-orange-300/40"
                      : "bg-slate-900/80 text-slate-300 border-slate-700 opacity-75 group-hover:opacity-100"
                  }`}
                >
                  {r.name} ({r.distance}k)
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
