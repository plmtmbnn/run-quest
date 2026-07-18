export interface GhostRun {
  challengeId: string;
  runnerName: string;
  finishTime: number;
  splits: number[]; // Index is km - 1
  recordedAt: string | number; // ISO timestamp or in-game dayIndex
}

const GHOST_STORAGE_KEY_PREFIX = "runquest.ghost.";

function getGhostKey(challengeId: string, distance?: number): string {
  if (distance) {
    return `${GHOST_STORAGE_KEY_PREFIX}${challengeId}_${distance}km`;
  }
  return `${GHOST_STORAGE_KEY_PREFIX}${challengeId}`;
}

/**
 * Loads a ghost run for a specific challenge.
 */
export function loadGhostRun(
  challengeId: string,
  distance?: number,
): GhostRun | null {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const key = getGhostKey(challengeId, distance);
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as GhostRun;
      }
    }
  } catch (error) {
    console.error("Failed to load ghost run:", error);
  }
  return null;
}

/**
 * Checks if a finish time qualifies as a new personal best.
 */
export function isNewPersonalBest(
  challengeId: string,
  finishTime: number,
  distance?: number,
): boolean {
  const existing = loadGhostRun(challengeId, distance);
  if (!existing) return true; // No record exists yet, so it is a PB
  return finishTime < existing.finishTime; // Lower time is better
}

/**
 * Saves a ghost run for a specific challenge.
 */
export function saveGhostRun(
  challengeId: string,
  runnerName: string,
  finishTime: number,
  splits: number[],
  inGameDayIndex?: number,
  distance?: number,
): void {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const ghost: GhostRun = {
        challengeId,
        runnerName,
        finishTime,
        splits,
        recordedAt:
          inGameDayIndex !== undefined
            ? inGameDayIndex
            : new Date().toISOString(),
      };
      const key = getGhostKey(challengeId, distance);
      localStorage.setItem(key, JSON.stringify(ghost));
    }
  } catch (error) {
    console.error("Failed to save ghost run:", error);
  }
}
