// runner-types.ts
// TypeScript types for the Runner Profile and related entities.

/**
 * Represents the persistent Runner Profile.
 * This profile survives browser refreshes and future application updates.
 */
export interface RunnerProfile {
  id: string;
  displayName: string;
  createdAt: string; // ISO 8601 timestamp
  totalRuns: number;
  totalDistance: number; // in kilometers
  totalRaceTime: number; // in seconds
  totalTrainingDays: number;
  currentWeek: number;
  currentSeason: number;
  currentFitness: number;
  currentFatigue: number;
  currentReadiness: number;
  consistency: number;
  preferredSurface?: string; // e.g., "road", "trail"
  preferredDistance?: string; // e.g., "5K", "10K"
  preferredStrategy?: string; // e.g., "negative split", "even pace"
  runningIdentity?: string; // Locked initially
  coachRelationship?: number; // Future feature
  knowledgeProgress?: number; // Future feature
  level: number;
  xp: number;
  skillPoints: number;
  speedAttr: number;
  staminaAttr: number;
  hydrationAttr: number;
  willpowerAttr: number;
  coins: number;
  inventory: Record<string, number>;
  questClaims?: Record<string, string>;
}

/**
 * Represents the default values for a new Runner Profile.
 */
export const DEFAULT_RUNNER_PROFILE: RunnerProfile = {
  id: "",
  displayName: "New Runner",
  createdAt: new Date().toISOString(),
  totalRuns: 0,
  totalDistance: 0,
  totalRaceTime: 0,
  totalTrainingDays: 0,
  currentWeek: 1,
  currentSeason: 1,
  currentFitness: 50, // Neutral starting value
  currentFatigue: 0,
  currentReadiness: 100, // Neutral starting value
  consistency: 0,
  level: 1,
  xp: 0,
  skillPoints: 0,
  speedAttr: 10,
  staminaAttr: 10,
  hydrationAttr: 10,
  willpowerAttr: 10,
  coins: 100,
  inventory: { energy_gel: 1, electrolytes: 1, caffeine_gum: 0 },
  questClaims: {},
};

/**
 * Represents the possible surfaces for running.
 */
export type RunningSurface = "road" | "trail" | "track" | "treadmill";

/**
 * Represents the possible race distances.
 */
export type RaceDistance =
  | "5K"
  | "10K"
  | "Half Marathon"
  | "Marathon"
  | "Ultra";

/**
 * Represents the possible race strategies.
 */
export type RaceStrategy =
  | "negative split"
  | "even pace"
  | "positive split"
  | "front load"
  | "back load";

/**
 * Represents the state of the runner's profile and related data.
 */
export interface RunnerState {
  profile: RunnerProfile;
  lastUpdated: string; // ISO 8601 timestamp
}

/**
 * Represents the default state for a new runner.
 */
export const DEFAULT_RUNNER_STATE: RunnerState = {
  profile: DEFAULT_RUNNER_PROFILE,
  lastUpdated: new Date().toISOString(),
};
