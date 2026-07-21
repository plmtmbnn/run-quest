/**
 * Personal Best (PB) Tracking System
 * 
 * Tracks and predicts race times for:
 * - 5K
 * - 10K
 * - Half Marathon (21.1km)
 * - Marathon (42.2km)
 * - Ultra (50K+)
 */

import type { RunnerProfile } from "./runner-types";

/** Distance categories for PB tracking */
export type DistanceCategory = "5K" | "10K" | "HM" | "FM" | "Ultra";

/** A personal best record */
export interface PersonalBest {
  /** Distance category */
  category: DistanceCategory;
  /** Actual distance in km */
  distance: number;
  /** Finish time in seconds */
  finishTime: number;
  /** Date achieved (ISO string) */
  date: string;
  /** Challenge/race ID */
  challengeId?: string;
  /** Average pace in seconds per km */
  averagePace: number;
}

/** All PBs for a runner */
export interface RunnerPBs {
  pbs: PersonalBest[];
  lastUpdated: string;
}

const PB_STORAGE_KEY = "runquest.personalbests";

/**
 * Get the distance category from a race distance in km
 */
export function getDistanceCategory(distanceKm: number): DistanceCategory {
  if (distanceKm <= 5) return "5K";
  if (distanceKm <= 12) return "10K";
  if (distanceKm <= 25) return "HM";
  if (distanceKm <= 45) return "FM";
  return "Ultra";
}

/**
 * Get the standard distance for a category
 */
export function getStandardDistance(category: DistanceCategory): number {
  switch (category) {
    case "5K": return 5;
    case "10K": return 10;
    case "HM": return 21.1;
    case "FM": return 42.2;
    case "Ultra": return 50;
  }
}

/**
 * Load all PBs from localStorage
 */
export function loadRunnerPBs(): RunnerPBs {
  try {
    if (typeof window !== "undefined" && localStorage) {
      const data = localStorage.getItem(PB_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as RunnerPBs;
      }
    }
  } catch (error) {
    console.error("Failed to load PBs:", error);
  }
  return { pbs: [], lastUpdated: new Date().toISOString() };
}

/**
 * Save all PBs to localStorage
 */
export function saveRunnerPBs(pbs: RunnerPBs): void {
  try {
    if (typeof window !== "undefined" && localStorage) {
      localStorage.setItem(PB_STORAGE_KEY, JSON.stringify(pbs));
    }
  } catch (error) {
    console.error("Failed to save PBs:", error);
  }
}

/**
 * Get PB for a specific category
 */
export function getPB(category: DistanceCategory): PersonalBest | null {
  const pbs = loadRunnerPBs();
  return pbs.pbs.find((pb) => pb.category === category) || null;
}

/**
 * Check if a finish time is a new PB for the given distance
 */
export function isNewPB(distanceKm: number, finishTime: number): boolean {
  const category = getDistanceCategory(distanceKm);
  const currentPB = getPB(category);
  
  if (!currentPB) return true;
  return finishTime < currentPB.finishTime;
}

/**
 * Save a new PB if it's faster than the existing one
 * Returns true if a new PB was set
 */
export function setPBIfFaster(
  distanceKm: number,
  finishTime: number,
  challengeId?: string,
): boolean {
  const category = getDistanceCategory(distanceKm);
  const pbs = loadRunnerPBs();
  const existingPB = pbs.pbs.find((pb) => pb.category === category);
  
  // Check if new time is better
  if (existingPB && finishTime >= existingPB.finishTime) {
    return false; // Not a new PB
  }
  
  const averagePace = finishTime / distanceKm;
  const newPB: PersonalBest = {
    category,
    distance: distanceKm,
    finishTime,
    date: new Date().toISOString(),
    challengeId,
    averagePace,
  };
  
  if (existingPB) {
    // Update existing
    const index = pbs.pbs.indexOf(existingPB);
    pbs.pbs[index] = newPB;
  } else {
    // Add new
    pbs.pbs.push(newPB);
  }
  
  pbs.lastUpdated = new Date().toISOString();
  saveRunnerPBs(pbs);
  return true;
}

/**
 * Format seconds to HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Predict finish time for a target distance based on a PB at another distance
 * Uses Riegel's formula: T2 = T1 * (D2 / D1)^1.06
 * 
 * @param sourceDistanceKm - The distance of the known PB
 * @param sourceTimeSeconds - The known PB time
 * @param targetDistanceKm - The target distance to predict
 * @returns Predicted finish time in seconds
 */
export function predictFinishTime(
  sourceDistanceKm: number,
  sourceTimeSeconds: number,
  targetDistanceKm: number,
): number {
  // Riegel's formula constant (typically 1.06 for endurance events)
  const RIEGEL_CONSTANT = 1.06;
  
  if (sourceDistanceKm <= 0 || targetDistanceKm <= 0) return 0;
  
  const predicted = sourceTimeSeconds * Math.pow(
    targetDistanceKm / sourceDistanceKm,
    RIEGEL_CONSTANT,
  );
  
  return Math.round(predicted);
}

/**
 * Predict finish time using the best available PB
 * Uses the runner's best PB to predict performance at target distance
 */
export function predictFromBestPB(targetDistanceKm: number): {
  predictedTime: number;
  basedOn: DistanceCategory;
  confidence: "high" | "medium" | "low";
} | null {
  const pbs = loadRunnerPBs();
  
  if (pbs.pbs.length === 0) return null;
  
  // Find the best PB (fastest pace)
  const bestPB = pbs.pbs.reduce((best, current) => {
    return current.averagePace < best.averagePace ? current : best;
  });
  
  const predictedTime = predictFinishTime(
    bestPB.distance,
    bestPB.finishTime,
    targetDistanceKm,
  );
  
  // Determine confidence based on distance ratio
  const ratio = targetDistanceKm / bestPB.distance;
  let confidence: "high" | "medium" | "low";
  
  if (ratio <= 1.5) {
    confidence = "high";
  } else if (ratio <= 2.5) {
    confidence = "medium";
  } else {
    confidence = "low";
  }
  
  return {
    predictedTime,
    basedOn: bestPB.category,
    confidence,
  };
}

/**
 * Get training recommendation based on PBs
 */
export function getTrainingRecommendation(): {
  focusDistance: DistanceCategory;
  reason: string;
  targetPace: number; // seconds per km
} | null {
  const pbs = loadRunnerPBs();
  
  if (pbs.pbs.length === 0) {
    return {
      focusDistance: "5K",
      reason: "Start with 5K to establish your baseline",
      targetPace: 360, // 6:00/km
    };
  }
  
  // Find weakest distance (slowest pace)
  const weakest = pbs.pbs.reduce((worst, current) => {
    return current.averagePace > worst.averagePace ? current : worst;
  });
  
  const recommendations: Record<DistanceCategory, { reason: string; targetPace: number }> = {
    "5K": {
      reason: "Build speed with shorter intervals",
      targetPace: weakest.averagePace * 0.95,
    },
    "10K": {
      reason: "Develop endurance at threshold pace",
      targetPace: weakest.averagePace * 0.98,
    },
    "HM": {
      reason: "Increase long run distance",
      targetPace: weakest.averagePace * 1.02,
    },
    "FM": {
      reason: "Build marathon-specific endurance",
      targetPace: weakest.averagePace * 1.05,
    },
    "Ultra": {
      reason: "Focus on ultra-specific training",
      targetPace: weakest.averagePace * 1.10,
    },
  };
  
  return {
    focusDistance: weakest.category,
    ...recommendations[weakest.category],
  };
}

/**
 * Get all PBs as an array
 */
export function getAllPBs(): PersonalBest[] {
  return loadRunnerPBs().pbs;
}

/**
 * Clear all PBs (for testing/reset)
 */
export function clearAllPBs(): void {
  saveRunnerPBs({ pbs: [], lastUpdated: new Date().toISOString() });
}