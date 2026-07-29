"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Compass, Maximize2, Minimize2, Mountain, TrendingUp, TrendingDown } from "lucide-react";
import type { Surface, PacingPlan } from "@/types/engine";

import type { RouteProfile } from "@/types/route-profile";

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
  isPaused?: boolean;
  /** Optional route profile ID for this race - overrides procedural generation */
  routeProfileId?: string;
}

import { ROUTE_PROFILES, getRouteProfile } from "@/data/route-profiles";

// Generate elevation profile for the race using bezier-like curve OR route profile
function generateElevationProfile(
  distance: number, 
  surface: Surface,
  routeProfileId?: string
): number[] {
  // If a route profile is provided, use it
  if (routeProfileId && ROUTE_PROFILES[routeProfileId]) {
    const profile = ROUTE_PROFILES[routeProfileId];
    return profileElevationPointsToNumericArray(profile, distance);
  }
  
  // Fallback to procedural generation
  const points: number[] = [];
  const segments = Math.ceil(distance * 10); // 10 points per km for smooth curve
  
  // Different terrain profiles based on surface
  const terrainConfig = {
    road: { amplitude: 0.15, frequency: 0.3, baseline: 0.5 },
    trail: { amplitude: 0.35, frequency: 0.5, baseline: 0.5 },
    track: { amplitude: 0.05, frequency: 0.1, baseline: 0.5 }, // Almost flat
  };
  
  const config = terrainConfig[surface] || terrainConfig.road;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const noise1 = Math.sin(t * Math.PI * config.frequency * 2) * config.amplitude;
    const noise2 = Math.sin(t * Math.PI * config.frequency * 4) * (config.amplitude * 0.5);
    const noise3 = Math.sin(t * Math.PI * config.frequency * 8) * (config.amplitude * 0.25);
    points.push(config.baseline + noise1 + noise2 + noise3);
  }
  
  return points;
}

/**
 * Convert route profile elevation points to numeric array based on distance
 */
function profileElevationPointsToNumericArray(
  profile: RouteProfile, 
  distance: number
): number[] {
  const points: number[] = [];
  const segments = Math.ceil(distance * 10); // Match resolution to procedural generation
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // 0 to 1
    const elevation = interpolateElevationAtDistance(t, profile.elevationPoints);
    points.push(elevation);
  }
  
  return points;
}

// Helper to get elevation at normalized distance from profile points
function interpolateElevationAtDistance(
  t: number, 
  points: Array<{ distance: number; elevation: number }>
): number {
  if (points.length === 0) return 0.5;
  if (t <= 0) return points[0].elevation;
  if (t >= 1) return points[points.length - 1].elevation;
  
  // Find the two points to interpolate between
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    if (t >= p1.distance && t <= p2.distance) {
      const localT = (t - p1.distance) / (p2.distance - p1.distance);
      return p1.elevation + (p2.elevation - p1.elevation) * localT;
    }
  }
  
  return points[points.length - 1].elevation;
}

// Get elevation at specific distance using route profile if available
function getElevationAtDistance(
  distance: number, 
  elevationProfile: number[], 
  raceDistance: number,
  routeProfileId?: string
): number {
  // If route profile exists and matches, use it directly for more accurate terrain
  if (routeProfileId && ROUTE_PROFILES[routeProfileId]) {
    const profile = ROUTE_PROFILES[routeProfileId];
    const normalizedDist = distance / raceDistance;
    return interpolateElevationAtDistance(normalizedDist, profile.elevationPoints);
  }
  
  // Fallback to array-based interpolation
  const index = (distance / raceDistance) * (elevationProfile.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const fraction = index - lowerIndex;
  
  if (upperIndex >= elevationProfile.length) return elevationProfile[elevationProfile.length - 1];
  if (lowerIndex < 0) return elevationProfile[0];
  
  // Linear interpolation
  return elevationProfile[lowerIndex] * (1 - fraction) + elevationProfile[upperIndex] * fraction;
}

// Calculate terrain grade (slope) for visual indicators - with route profile support
function getTerrainGrade(
  distance: number, 
  elevationProfile: number[], 
  raceDistance: number,
  routeProfileId?: string
): number {
  const lookAhead = 0.1; // Look ahead 100m
  const currentElev = getElevationAtDistance(distance, elevationProfile, raceDistance, routeProfileId);
  const futureElev = getElevationAtDistance(distance + lookAhead, elevationProfile, raceDistance, routeProfileId);
  return (futureElev - currentElev) / lookAhead;
}

export function TrackPositionVisualizer({
  runners,
  currentKm,
  raceDistance,
  simSpeed,
  selectedPacing,
  surface,
  playerEnergy,
  isPaused = false,
  routeProfileId, // Add this missing parameter
}: TrackPositionVisualizerProps) {
  const [viewMode, setViewMode] = useState<"full" | "proximity">("full");
  const [overtakeMessage, setOvertakeMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const scrollOffsetRef = useRef(0);

  // Generate elevation profile once - use route profile if provided
  const elevationProfile = useMemo(() => {
    return generateElevationProfile(raceDistance, surface, routeProfileId);
  }, [raceDistance, surface, routeProfileId]);

  // Keep track of previous runner ranks to detect overtakes
  const prevRanksRef = useRef<Map<string, number>>(new Map());

  // Rank sorting for badges & overtake detection
  const sortedRunners = useMemo(() =>
    [...runners].sort((a, b) => {
      if (a.isDNF && !b.isDNF) return 1;
      if (!a.isDNF && b.isDNF) return -1;
      if (a.isDNF && b.isDNF) return 0;
      if (b.distance !== a.distance) return b.distance - a.distance;
      return a.accumulatedTime - b.accumulatedTime;
    }),
    [runners]
  );

  const playerRunner = runners.find((r) => r.isPlayer);
  const playerDistance = playerRunner ? playerRunner.distance : currentKm;
  const playerRank = useMemo(() =>
    sortedRunners.findIndex((r) => r.isPlayer) + 1,
    [sortedRunners]
  );

  // Detect overtakes
  useEffect(() => {
    if (!playerRunner) return;

    const currentRanks = new Map<string, number>();
    sortedRunners.forEach((r, idx) => currentRanks.set(r.id, idx + 1));

    const playerId = playerRunner.id;
    const prevPlayerRank = prevRanksRef.current.get(playerId);
    if (prevPlayerRank !== undefined && playerRank < prevPlayerRank) {
      const passedRunner = sortedRunners[playerRank];
      const msg = passedRunner ? `Overtook ${passedRunner.name}! ⚡` : "Moved up in position! ⚡";
      setOvertakeMessage(msg);
      const timer = setTimeout(() => setOvertakeMessage(null), 3000);
      return () => clearTimeout(timer);
    }

    prevRanksRef.current = currentRanks;
  }, [playerRank, sortedRunners, playerRunner]);

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
    if (minDist === maxDist) {
      maxDist = Math.min(raceDistance, minDist + 1);
    }
  }

  // Multi-lane staggering using deterministic hashing
  const getStableLane = (id: string, isPlayer: boolean, isGhost?: boolean): number => {
    if (isPlayer) return 1;
    if (isGhost) return 0;
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 3;
  };

  // Surface background styling
  const surfaceStyles: Partial<Record<Surface, { bg: string; border: string; text: string; gradient: string }>> = {
    road: { 
      bg: "bg-slate-900", 
      border: "border-slate-700/80", 
      text: "text-slate-300",
      gradient: "from-slate-800 via-slate-900 to-slate-800"
    },
    trail: { 
      bg: "bg-amber-950/40", 
      border: "border-amber-900/60", 
      text: "text-amber-200",
      gradient: "from-amber-900/30 via-amber-950/50 to-amber-900/30"
    },
    track: { 
      bg: "bg-red-950/40", 
      border: "border-red-900/60", 
      text: "text-red-200",
      gradient: "from-red-900/30 via-red-950/50 to-red-900/30"
    },
  };

  const currentStyle = surfaceStyles[surface] || surfaceStyles.road!;

  // Pacing mode helpers
  const isSprint = selectedPacing === "sprint" || selectedPacing === "aggressive";
  const isPush = selectedPacing === "push" || selectedPacing === "negative_split";
  const isSteady = selectedPacing === "cruise" || selectedPacing === "steady";

  // Stride animation speed
  const bounceDuration = isSprint ? 0.35 : isPush ? 0.5 : isSteady ? 0.65 : 0.85;

  // Parallax scrolling animation
  useEffect(() => {
    if (!canvasRef.current || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Smooth parallax scroll based on player distance
      const targetOffset = (playerDistance / raceDistance) * 50;
      scrollOffsetRef.current += (targetOffset - scrollOffsetRef.current) * 0.05;

      // Update canvas rendering would go here
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playerDistance, raceDistance, isPaused]);

  // Get current terrain grade for player - use route profile if available
  const currentGrade = getTerrainGrade(
    playerDistance, 
    elevationProfile, 
    raceDistance,
    routeProfileId
  );
  const isUphill = currentGrade > 0.05;
  const isDownhill = currentGrade < -0.05;

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
          {/* Terrain Grade Indicator */}
          {(isUphill || isDownhill) && (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isUphill 
                  ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isUphill ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUphill ? "Uphill" : "Downhill"}
            </motion.span>
          )}
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

      {/* Main Enhanced 2D Track Container with Elevation Profile */}
      <div className="relative rounded-[1.75rem] border overflow-hidden shadow-lg" style={{ height: '160px' }}>
        {/* Parallax Background Layers */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${currentStyle.gradient} opacity-30`}
          animate={{ x: -(playerDistance / raceDistance) * 20 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Distant Mountains/Trees Layer (slowest parallax) */}
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{ x: -(playerDistance / raceDistance) * 30 }}
          transition={{ duration: 0.3 }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`mountain-${i}`}
              className="absolute bottom-0 opacity-40"
              style={{
                left: `${i * 15}%`,
                width: '100px',
                height: `${40 + Math.sin(i * 1.5) * 20}px`,
                background: 'linear-gradient(to top, currentColor, transparent)',
              }}
            />
          ))}
        </motion.div>

        {/* Middle Ground Layer (medium parallax) */}
        <motion.div
          className="absolute inset-0 opacity-10 pointer-events-none"
          animate={{ x: -(playerDistance / raceDistance) * 50 }}
          transition={{ duration: 0.3 }}
        >
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`tree-${i}`}
              className="absolute bottom-0"
              style={{
                left: `${i * 8}%`,
                width: '2px',
                height: `${20 + Math.sin(i * 2) * 10}px`,
                backgroundColor: 'currentColor',
                opacity: 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Elevation Profile Track Path (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Draw elevation path */}
          <path
            d={(() => {
              const width = 1000;
              const height = 160;
              const startIndex = Math.floor((minDist / raceDistance) * (elevationProfile.length - 1));
              const endIndex = Math.ceil((maxDist / raceDistance) * (elevationProfile.length - 1));
              const visibleProfile = elevationProfile.slice(startIndex, endIndex + 1);
              
              let path = `M 0 ${height}`;
              visibleProfile.forEach((elev, i) => {
                const x = (i / (visibleProfile.length - 1)) * width;
                const y = height - (elev * height * 0.6) - 20;
                path += ` L ${x} ${y}`;
              });
              path += ` L ${width} ${height} Z`;
              return path;
            })()}
            fill="url(#trackGradient)"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.4"
            className={currentStyle.text}
          />
        </svg>

        {/* Track Surface with Border */}
        <div className={`absolute inset-0 ${currentStyle.bg} ${currentStyle.border} border opacity-40`} style={{ zIndex: 0 }} />

        {/* Ground Markings (fastest parallax) */}
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{ x: -(playerDistance / raceDistance) * 100 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 2 }}
        >
          {Array.from({ length: Math.ceil(raceDistance) * 2 }).map((_, i) => (
            <div
              key={`mark-${i}`}
              className="absolute bottom-1/2 h-px bg-white/30"
              style={{
                left: `${i * 5}%`,
                width: '20px',
                transform: 'translateY(50%)',
              }}
            />
          ))}
        </motion.div>

        {/* Start/Finish Line Markers */}
        {minDist === 0 && (
          <div className="absolute left-3 top-0 bottom-0 flex flex-col items-center justify-center opacity-50 pointer-events-none z-10">
            <div className="h-full w-1 border-r-2 border-dashed border-emerald-400" />
            <span className="absolute top-2 text-[8px] font-black tracking-tighter uppercase text-emerald-400 bg-slate-900/50 px-1 rounded">
              START
            </span>
          </div>
        )}

        {maxDist === raceDistance && (
          <div className="absolute right-3 top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="h-full w-1.5 bg-gradient-to-b from-white via-black to-white opacity-60" />
            <span className="absolute top-2 text-[8px] font-black tracking-tighter uppercase text-amber-400 bg-slate-900/50 px-1 rounded">
              FINISH 🏁
            </span>
          </div>
        )}

        {/* Kilometer Markers on Elevation Path */}
        <div className="absolute inset-0 px-6 pointer-events-none" style={{ zIndex: 5 }}>
          {Array.from({ length: Math.ceil(maxDist - minDist) + 1 }).map((_, i) => {
            const km = Math.floor(minDist) + i;
            if (km > raceDistance) return null;
            
            const range = maxDist - minDist || 1;
            const pct = ((km - minDist) / range) * 100;
            const elevation = getElevationAtDistance(km, elevationProfile, raceDistance);
            const yPos = 100 - (elevation * 60) - 12;
            
            return (
              <div
                key={`marker-${km}`}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${Math.min(96, Math.max(4, pct))}%`, top: `${yPos}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-slate-400/60 rounded-full" />
                  <span className="text-[8px] font-extrabold text-slate-300/80 font-mono bg-slate-900/40 px-1 rounded mt-0.5">
                    {km}k
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paused Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] z-30 flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-extrabold rounded-full shadow-lg border border-amber-300/40 flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
              <span>⏸️</span> Race Paused
            </span>
          </div>
        )}

        {/* Runners on Elevation Path with Micro-animations */}
        {runners.map((r) => {
          const range = maxDist - minDist || 1;
          const rawPct = ((r.distance - minDist) / range) * 100;
          const clampedPct = Math.min(94, Math.max(4, rawPct));
          
          // Calculate Y position based on elevation profile
          const elevation = getElevationAtDistance(r.distance, elevationProfile, raceDistance);
          const baseY = 100 - (elevation * 60) - 12;
          
          // Lane offset for vertical separation
          const lane = getStableLane(r.id, r.isPlayer, r.isGhost);
          const laneOffset = (lane - 1) * 8; // -8%, 0%, +8%
          const finalY = baseY + laneOffset;
          
          const isExhausted = r.isPlayer && playerEnergy <= 25;
          const rankIndex = sortedRunners.findIndex((s) => s.id === r.id) + 1;

          // Dust kick animation for runners
          const showDustKick = !r.isDNF && !isPaused && (r.isPlayer ? isSprint || isPush : true);

          return (
            <motion.div
              key={r.id}
              initial={{ left: `${clampedPct}%`, top: `${finalY}%` }}
              animate={{
                left: `${clampedPct}%`,
                top: `${finalY}%`,
              }}
              transition={{
                left: { duration: isPaused ? 0 : 1.5 / simSpeed, ease: "linear" },
                top: { duration: isPaused ? 0 : 0.6, ease: "easeOut" },
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: r.isPlayer ? 25 : r.isGhost ? 20 : 15, pointerEvents: "auto" }}
            >
              <div className="relative group flex flex-col items-center">
                {/* Pacing Aura */}
                {r.isPlayer && (
                  <div
                    className={`absolute -inset-2 rounded-full blur-md transition-all ${
                      isSprint
                        ? "bg-gradient-to-r from-orange-500 to-red-600 opacity-90 scale-125 animate-pulse"
                        : isPush
                          ? "bg-cyan-400 opacity-70 scale-110"
                          : isExhausted
                            ? "bg-red-500 opacity-80 animate-ping"
                            : "bg-orange-400/40 opacity-40"
                    }`}
                  />
                )}

                {r.isGhost && (
                  <div className="absolute -inset-1.5 rounded-full bg-indigo-500/40 blur-md animate-pulse" />
                )}

                {/* Dust Kick Effect */}
                {showDustKick && (
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    animate={{
                      scale: [0.5, 1, 0],
                      opacity: [0.6, 0.3, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: bounceDuration,
                      ease: "easeOut",
                    }}
                  >
                    <div className="w-3 h-1 bg-slate-400/40 rounded-full blur-sm" />
                  </motion.div>
                )}

                {/* Runner Avatar with Bounce */}
                <motion.div
                  animate={
                    !r.isDNF && !isPaused
                      ? {
                          y: [0, -4, 0],
                          rotate: isUphill ? [0, -2, 0] : isDownhill ? [0, 2, 0] : [0, 0, 0],
                        }
                      : { y: 0, rotate: 0 }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: bounceDuration,
                    ease: "easeInOut",
                  }}
                  className={`relative h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black text-white shadow-lg border-2 transition-all cursor-pointer ${
                    r.isPlayer
                      ? "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 border-white dark:border-slate-900 scale-110 ring-2 ring-orange-500/40"
                      : r.isGhost
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-200 opacity-60 hover:opacity-100"
                        : r.isDNF
                          ? "bg-slate-600 border-slate-400 opacity-50 grayscale"
                          : "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {/* Rank Badge */}
                  <span className="absolute -top-2 -right-1.5 bg-slate-950/90 text-white font-extrabold text-[8px] px-1 py-0.5 rounded-full border border-slate-700 shadow-sm font-mono">
                    #{rankIndex}
                  </span>

                  {/* Avatar Content */}
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

                {/* Runner Name Label */}
                <div
                  className={`mt-1.5 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold whitespace-nowrap backdrop-blur-md shadow-md border transition-all ${
                    r.isPlayer
                      ? "bg-orange-500/90 text-white border-orange-300/40 shadow-orange-500/30"
                      : "bg-slate-900/80 text-slate-300 border-slate-700/50 opacity-80 group-hover:opacity-100"
                  }`}
                >
                  {r.name} • {r.distance.toFixed(1)}k
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hidden canvas for advanced rendering (future enhancement) */}
      <canvas ref={canvasRef} className="hidden" width={800} height={200} />
    </div>
  );
}
