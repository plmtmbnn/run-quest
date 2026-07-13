import type { LocalizedText, SimulationState } from "@/types/engine";

/**
 * Clutch situation types
 */
export type ClutchSituation =
  | "final_sprint" // Last push to the finish
  | "overtake_rival" // Attempt to pass rival
  | "survival" // Just trying to finish
  | "comeback"; // Behind, trying to catch up

/**
 * Clutch moment requirements
 */
export interface ClutchRequirements {
  minKm: number; // Usually 80%+ into race
  energyBelow?: number;
  rivalWithin?: number; // meters
  positionRequirement?: "winning" | "losing" | "tied";
  confidenceAbove?: number;
}

/**
 * Clutch outcome
 */
export interface ClutchOutcome {
  success: LocalizedText;
  failure: LocalizedText;
  successEffects: ClutchEffects;
  failureEffects: ClutchEffects;
}

/**
 * Effects of clutch attempt
 */
export interface ClutchEffects {
  energy?: number;
  confidence?: number;
  momentum?: number;
  pace?: number; // Pace change in seconds per km
  muscleFatigue?: number;
  mentalFatigue?: number;
}

/**
 * Clutch decision
 */
export interface ClutchDecision {
  attempt: LocalizedText;
  holdBack: LocalizedText;
}

/**
 * Clutch moment definition
 */
export interface ClutchMoment {
  id: string;
  situation: ClutchSituation;
  requirements: ClutchRequirements;
  stakes: LocalizedText; // What's on the line
  setup: LocalizedText; // Situation description
  decision: ClutchDecision;
  outcome: ClutchOutcome;
  successProbability: (state: SimulationState) => number; // 0-1
  priority: number;
}

/**
 * Active clutch moment
 */
export interface ActiveClutchMoment {
  clutchMoment: ClutchMoment;
  km: number;
  timestamp: number;
  resolved: boolean;
  succeeded?: boolean;
  playerAttempted?: boolean;
}
