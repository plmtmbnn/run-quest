import type { LocalizedText, SimulationState } from "@/types/engine";

/**
 * Breaking point types
 */
export type BreakingPointType =
  | "the_wall" // Classic marathon bonk
  | "cramp" // Muscle cramp
  | "bonk" // Energy depletion
  | "mental_break" // Psychological collapse
  | "stitch"; // Side stitch

/**
 * Breaking point severity
 */
export type BreakingPointSeverity = "warning" | "onset" | "critical";

/**
 * Recovery options
 */
export interface RecoveryOption {
  id: string;
  action: LocalizedText;
  effects: BreakingPointEffects;
  recoveryChance: number; // 0-1
  risk: "low" | "medium" | "high";
  triggersEndorphins?: boolean; // If true, triggers endorphin rush
  endorphinIntensity?: import("@/engine/endorphins/endorphin-types").EndorphinIntensity;
}

/**
 * Effects of breaking point
 */
export interface BreakingPointEffects {
  energy?: number;
  hydration?: number;
  pace?: number; // Seconds per km
  muscleFatigue?: number;
  mentalFatigue?: number;
  confidence?: number;
  momentum?: number;
}

/**
 * Breaking point definition
 */
export interface BreakingPoint {
  id: string;
  type: BreakingPointType;
  severity: BreakingPointSeverity;
  trigger: (state: SimulationState) => boolean;
  warningMessage?: LocalizedText; // 1-2km before
  onsetMessage: LocalizedText; // When it hits
  symptoms: LocalizedText;
  effects: BreakingPointEffects;
  recoveryOptions: RecoveryOption[];
  priority: number;
}

/**
 * Active breaking point
 */
export interface ActiveBreakingPoint {
  breakingPoint: BreakingPoint;
  km: number;
  timestamp: number;
  resolved: boolean;
  recoveryAttempted?: string; // Recovery option ID
  recovered?: boolean;
}
