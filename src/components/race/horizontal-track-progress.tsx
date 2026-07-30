"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import type { RouteProfile } from "@/types/route-profile";

interface Runner {
  id: string;
  name: string;
  isPlayer: boolean;
  distance: number;
  accumulatedTime: number;
  isDNF: boolean;
  isGhost?: boolean;
}

interface HorizontalTrackProgressProps {
  runners: Runner[];
  currentKm: number;
  raceDistance: number;
  simSpeed: 1 | 2 | 5;
  isPaused: boolean;
  routeProfile?: RouteProfile;
  surface: "road" | "trail" | "track";
  playerEnergy: number;
}

// Terrain-specific visual identity — each surface reads like the material it is
const SURFACE_STYLES: Record<
  HorizontalTrackProgressProps["surface"],
  { lane: string; texture: string; label: string; icon: string }
> = {
  road: {
    lane: "bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800",
    texture:
      "repeating-linear-gradient(90deg, transparent 0, transparent 14px, rgba(255,255,255,0.55) 14px, rgba(255,255,255,0.55) 26px)",
    label: "Road",
    icon: "🛣️",
  },
  trail: {
    lane: "bg-gradient-to-b from-amber-200 to-emerald-300/60 dark:from-amber-950/60 dark:to-emerald-950/60",
    texture:
      "repeating-linear-gradient(90deg, rgba(120,83,42,0.25) 0, rgba(120,83,42,0.25) 3px, transparent 3px, transparent 18px)",
    label: "Trail",
    icon: "🌲",
  },
  track: {
    lane: "bg-gradient-to-b from-orange-300 to-red-500/70 dark:from-orange-950/70 dark:to-red-950/70",
    texture:
      "repeating-linear-gradient(90deg, transparent 0, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 33px)",
    label: "Track",
    icon: "🏟️",
  },
};

const RANK_STYLES = [
  { ring: "ring-amber-400 dark:ring-amber-400", badge: "bg-amber-400 text-amber-950", icon: "🥇" },
  { ring: "ring-slate-300 dark:ring-slate-400", badge: "bg-slate-300 text-slate-800", icon: "🥈" },
  { ring: "ring-orange-400 dark:ring-orange-500", badge: "bg-orange-400 text-orange-950", icon: "🥉" },
];

export function HorizontalTrackProgress({
  runners,
  currentKm,
  raceDistance,
  simSpeed,
  isPaused,
  routeProfile,
  surface,
  playerEnergy,
}: HorizontalTrackProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const surfaceStyle = SURFACE_STYLES[surface];

  // Generate distance markers based on race distance
  const distanceMarkers = useMemo(() => {
    const markers: number[] = [];
    let interval = 1;

    if (raceDistance >= 42) {
      interval = 5;
    } else if (raceDistance >= 20) {
      interval = 2;
    }

    for (let i = 0; i <= raceDistance; i += interval) {
      markers.push(i);
    }

    if (markers[markers.length - 1] !== raceDistance) {
      markers.push(raceDistance);
    }

    return markers;
  }, [raceDistance]);

  // Smoothed elevation path, colored by grade rather than a flat line
  const elevation = useMemo(() => {
    const profile = routeProfile?.elevationPoints;
    if (!profile || profile.length === 0) {
      return { path: "M 0 50 L 100 50", segments: [] as { d: string; grade: "climb" | "descent" | "flat" }[] };
    }

    const minElev = Math.min(...profile.map((p) => p.elevation));
    const maxElev = Math.max(...profile.map((p) => p.elevation));
    const elevRange = maxElev - minElev || 1;

    const coords = profile.map((point) => {
      const x = point.distance * 100;
      const normalizedElev = ((point.elevation - minElev) / elevRange) * 40;
      const y = 50 - normalizedElev + 10;
      return { x, y, raw: point.elevation };
    });

    // Full smoothed path (quadratic curve through midpoints) for the fill
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
    }
    path += ` T ${coords[coords.length - 1].x} ${coords[coords.length - 1].y}`;

    // Per-segment grade classification for coloring
    const segments = coords.slice(1).map((curr, i) => {
      const prev = coords[i];
      const grade = curr.raw - prev.raw;
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      return {
        d: `M ${prev.x} ${prev.y} Q ${prev.x} ${prev.y} ${midX} ${midY} T ${curr.x} ${curr.y}`,
        grade: grade > 0.02 ? ("climb" as const) : grade < -0.02 ? ("descent" as const) : ("flat" as const),
      };
    });

    return { path, segments };
  }, [routeProfile]);

  const currentTerrain = useMemo(() => {
    if (!routeProfile?.elevationPoints || routeProfile.elevationPoints.length < 2) {
      return { icon: "➡️", label: "Flat" };
    }

    const profile = routeProfile.elevationPoints;
    const progress = currentKm / raceDistance;
    const currentIdx = Math.floor(progress * (profile.length - 1));
    const prevIdx = Math.max(0, currentIdx - 1);

    if (currentIdx >= profile.length) {
      return { icon: "🏁", label: "Finish" };
    }

    const current = profile[currentIdx];
    const prev = profile[prevIdx];
    const gradient = (current.elevation - prev.elevation) * 100;

    if (gradient > 0.15) return { icon: "⛰️", label: "Steep Climb" };
    if (gradient > 0.05) return { icon: "⬆️", label: "Uphill" };
    if (gradient < -0.15) return { icon: "⬇️", label: "Steep Down" };
    if (gradient < -0.05) return { icon: "↘️", label: "Downhill" };
    return { icon: "➡️", label: "Flat" };
  }, [currentKm, raceDistance, routeProfile]);

  const sortedRunners = useMemo(() => {
    return [...runners].sort((a, b) => b.distance - a.distance);
  }, [runners]);

  const leaderDistance = sortedRunners[0]?.distance ?? 0;
  const player = runners.find((r) => r.isPlayer);
  const playerRank = player ? sortedRunners.findIndex((r) => r.id === player.id) : -1;
  const playerGapMeters = player ? Math.max(0, Math.round((leaderDistance - player.distance) * 1000)) : 0;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
            Track Progress
          </h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            <span className="text-lg leading-none">{currentTerrain.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {currentTerrain.label}
            </span>
          </div>
          {player && !player.isDNF && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {playerRank === 0
                  ? "Leading"
                  : `P${playerRank + 1} · -${playerGapMeters}m`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPaused ? (
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
              Paused
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
              {simSpeed}×
            </span>
          )}
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 tabular-nums">
            {currentKm.toFixed(2)} / {raceDistance} km
          </span>
        </div>
      </div>

      {/* Track Container */}
      <div className="relative w-full">
        {/* Elevation Profile Background, colored by grade */}
        <div className="absolute inset-x-0 top-0 h-24 md:h-32">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path
              d={`${elevation.path} L 100 100 L 0 100 Z`}
              className="fill-slate-200/40 dark:fill-slate-700/30"
            />
            {elevation.segments.length > 0 ? (
              elevation.segments.map((seg, i) => (
                <path
                  key={i}
                  d={seg.d}
                  className={
                    seg.grade === "climb"
                      ? "fill-none stroke-amber-500/80 dark:stroke-amber-400/80"
                      : seg.grade === "descent"
                      ? "fill-none stroke-sky-500/70 dark:stroke-sky-400/70"
                      : "fill-none stroke-slate-400 dark:stroke-slate-600"
                  }
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))
            ) : (
              <path
                d={elevation.path}
                className="fill-none stroke-slate-400 dark:stroke-slate-600"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>

        {/* Track Line */}
        <div className="relative h-24 md:h-32 flex items-center">
          {/* Terrain-textured lane surface */}
          <div
            className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full overflow-hidden ${surfaceStyle.lane}`}
          >
            <div
              className="absolute inset-0 opacity-70"
              style={{ backgroundImage: surfaceStyle.texture }}
            />
          </div>

          {/* Start Gate */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 flex flex-col items-center">
            <span className="text-3xl md:text-4xl drop-shadow-lg">🚩</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
              Start
            </span>
          </div>

          {/* Finish Gate — checkered banner as the signature element */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 flex flex-col items-center">
            <div
              className="w-6 h-8 md:w-7 md:h-9 rounded-sm shadow-lg border border-slate-900/20"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(#0f172a 0% 25%, #f8fafc 0% 50%)",
                backgroundSize: "6px 6px",
              }}
            />
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
              Finish
            </span>
          </div>

          {/* Distance Markers */}
          {distanceMarkers.map((km) => {
            const position = (km / raceDistance) * 100;
            const isFinish = km === raceDistance;
            return (
              <div key={km} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${position}%` }}>
                <div
                  className={`w-0.5 h-3 ${
                    isFinish ? "bg-slate-500 dark:bg-slate-400" : "bg-slate-400 dark:bg-slate-600"
                  }`}
                />
                <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                    {isFinish ? `${km}km` : km}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Runners */}
          {sortedRunners.map((runner, rank) => {
            const position = Math.min((runner.distance / raceDistance) * 100, 100);
            const isPlayer = runner.isPlayer;
            const isGhost = runner.isGhost;
            const isDNF = runner.isDNF;
            const medal = !isDNF && !isGhost ? RANK_STYLES[rank] : undefined;

            return (
              <motion.div
                key={runner.id}
                className="absolute top-1/2 -translate-y-1/2 z-20"
                initial={{ left: "0%" }}
                animate={{ left: `${position}%` }}
                transition={{
                  duration: isPaused ? 0 : 0.5 / simSpeed,
                  ease: "linear",
                }}
              >
                <div className="relative -translate-x-1/2">
                  {/* Rank badge for top 3 */}
                  {medal && (
                    <div className="absolute -top-1.5 -left-1.5 z-10 w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow ring-1 ring-white dark:ring-slate-900">
                      <span>{medal.icon}</span>
                    </div>
                  )}

                  {/* Runner Avatar */}
                  <motion.div
                    className={`
                      w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg md:text-xl
                      transition-all duration-300
                      ${
                        isPlayer
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg ring-2 ring-emerald-400 dark:ring-emerald-500"
                          : isGhost
                          ? "bg-slate-400/50 dark:bg-slate-500/50 opacity-70"
                          : "bg-indigo-500 dark:bg-indigo-600 shadow-md"
                      }
                      ${medal && !isPlayer ? `ring-2 ${medal.ring}` : ""}
                      ${isDNF ? "grayscale opacity-40" : ""}
                    `}
                    animate={
                      !isPaused && !isDNF && !prefersReducedMotion
                        ? { scale: [1, 1.05, 1] }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {isPlayer ? "🏃" : isGhost ? "👻" : "👤"}
                  </motion.div>

                  {/* Runner Name Label */}
                  <div
                    className={`
                      absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                      px-2 py-0.5 rounded-full text-[9px] font-bold
                      ${
                        isPlayer
                          ? "bg-emerald-500 text-white"
                          : isGhost
                          ? "bg-slate-400/70 text-white"
                          : "bg-indigo-500 text-white"
                      }
                      ${isDNF ? "line-through opacity-60" : ""}
                    `}
                  >
                    {runner.name}
                  </div>

                  {/* Energy indicator for player */}
                  {isPlayer && !isDNF && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12">
                      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            playerEnergy > 60
                              ? "bg-emerald-500"
                              : playerEnergy > 30
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${playerEnergy}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Surface & Route Info */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold uppercase tracking-wider">
            {surfaceStyle.icon} {surfaceStyle.label}
          </span>
          {routeProfile && <span className="font-mono">{routeProfile.name}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tabular-nums">
            {sortedRunners.filter((r) => !r.isDNF).length} / {sortedRunners.length} Running
          </span>
        </div>
      </div>
    </div>
  );
}