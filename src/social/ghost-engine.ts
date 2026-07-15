export interface GhostRun {
  challengeId: string;
  runnerName: string;
  finishTime: number;
  splits: number[]; // Index is km - 1
  recordedAt: string | number; // ISO timestamp or in-game dayIndex
}

const GHOST_STORAGE_KEY_PREFIX = "runquest.ghost.";

/**
 * Loads a ghost run for a specific challenge.
 */
export function loadGhostRun(challengeId: string): GhostRun | null {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const data = localStorage.getItem(
        `${GHOST_STORAGE_KEY_PREFIX}${challengeId}`,
      );
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
): boolean {
  const existing = loadGhostRun(challengeId);
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
      localStorage.setItem(
        `${GHOST_STORAGE_KEY_PREFIX}${challengeId}`,
        JSON.stringify(ghost),
      );
    }
  } catch (error) {
    console.error("Failed to save ghost run:", error);
  }
}
