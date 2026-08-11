"use client";

import React, { useMemo } from "react";
import type { GhostRunner } from "@/store/ghost-store";

export interface CalculatedGhostPosition {
  ghost: GhostRunner;
  distanceKm: number;
  timeSec: number;
  gapMeters: number; // Positive = ghost is ahead, negative = ghost is behind player
  status: "ahead" | "behind" | "neck_and_neck";
}

/**
 * Calculates a ghost runner's position in KM at a specific elapsed time (in seconds).
 */
export function calculateGhostDistanceAtTime(
  ghost: GhostRunner,
  elapsedSec: number,
): number {
  if (!ghost.splitTimes || ghost.splitTimes.length === 0) return 0;

  if (elapsedSec <= 0) return 0;
  if (elapsedSec >= ghost.finalTime) return ghost.distance;

  // Find which split interval the ghost is currently in
  for (let i = 0; i < ghost.splitTimes.length - 1; i++) {
    const tStart = ghost.splitTimes[i];
    const tEnd = ghost.splitTimes[i + 1];

    if (elapsedSec >= tStart && elapsedSec <= tEnd) {
      const kmStart = i;
      const kmEnd = i + 1;
      const progressInInterval = (elapsedSec - tStart) / (tEnd - tStart || 1);
      return kmStart + progressInInterval * (kmEnd - kmStart);
    }
  }

  // Fallback linear interpolation
  const avgPaceSecPerKm = ghost.finalTime / (ghost.distance || 1);
  return Math.min(ghost.distance, elapsedSec / (avgPaceSecPerKm || 1));
}

/**
 * Calculates gap in meters between player distance and ghost distance.
 */
export function getGhostGapMeters(playerKm: number, ghostKm: number): number {
  const kmDiff = ghostKm - playerKm;
  return Math.round(kmDiff * 1000);
}

interface GhostRunnerDisplayProps {
  ghost: GhostRunner;
  ghostKm: number;
  playerKm: number;
}

export function GhostRunnerBadge({
  ghost,
  ghostKm,
  playerKm,
}: GhostRunnerDisplayProps) {
  const gapMeters = getGhostGapMeters(playerKm, ghostKm);
  const isAhead = gapMeters > 0;
  const isClose = Math.abs(gapMeters) <= 30;

  const typeStyles = {
    personal: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    friend: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    world: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    rival: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  };

  const typeLabels = {
    personal: "PB",
    friend: "Friend",
    world: "WR",
    rival: "Rival",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold backdrop-blur-sm shadow-sm ${
        typeStyles[ghost.type]
      }`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: ghost.avatarColor }}
      />
      <span>{ghost.name}</span>
      <span className="px-1 bg-black/30 rounded text-[9px] uppercase font-sans">
        {typeLabels[ghost.type]}
      </span>
      <span>
        {isClose ? "EVEN" : isAhead ? `+${gapMeters}m` : `${gapMeters}m`}
      </span>
    </div>
  );
}
