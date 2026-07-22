import type { LocalizedText } from "@/types/engine";

/**
 * Endorphin intensity levels
 */
export type EndorphinIntensity = "mild" | "moderate" | "intense" | "extreme";

/**
 * Effects applied during endorphin rush
 */
export interface EndorphinEffects {
  /** Energy boost (0-100) */
  energyBoost: number;
  /** Pace improvement in seconds per km (negative = faster) */
  paceBonus: number;
  /** Reduces impact of fatigue (0-100) */
  painSuppression: number;
  /** Confidence boost (0-100) */
  confidenceBoost: number;
  /** Duration in kilometers */
  duration: number;
  /** Momentum boost (0-100) */
  momentumBoost?: number;
}

/**
 * Current endorphin state during a race
 */
export interface EndorphinState {
  /** Current endorphin intensity (0-100) */
  currentLevel: number;
  /** Long-term addiction level (0-100) */
  addictionLevel: number;
  /** Current craving intensity (0-10) */
  cravingIntensity: number;
  /** Kilometer mark when last triggered */
  lastEndorphinKm: number | null;
  /** Total endorphin uses this race */
  totalEndorphinUses: number;
  /** Currently experiencing endorphin rush */
  isActive: boolean;
  /** Active effects being applied */
  activeEffects: EndorphinEffects | null;
  /** Kilometers remaining for current rush */
  remainingDuration: number;
}

/**
 * Withdrawal effects applied when addicted but not using
 */
export interface WithdrawalEffects {
  /** Energy penalty (0-100) */
  energyPenalty: number;
  /** Focus penalty (0-100) */
  focusPenalty: number;
  /** Confidence penalty (0-100) */
  confidencePenalty: number;
  /** Mental fatigue penalty (0-100) */
  mentalFatiguePenalty: number;
  /** Craving message to display */
  cravingMessage?: LocalizedText;
}

/**
 * Addiction profile stored in runner profile
 */
export interface AddictionProfile {
  /** Overall addiction level (0-100) */
  addictionLevel: number;
  /** Last race day that used endorphins */
  lastEndorphinRaceDay: number | null;
  /** Total lifetime endorphin uses */
  totalEndorphinUses: number;
  /** Days since last endorphin use */
  recoveryDays: number;
  /** Currently experiencing withdrawal */
  withdrawalActive: boolean;
}

/**
 * Active endorphin rush overlay state
 */
export interface ActiveEndorphinRush {
  intensity: EndorphinIntensity;
  effects: EndorphinEffects;
  km: number;
  timestamp: number;
  dismissed: boolean;
}

/**
 * Endorphin trigger context
 */
export interface EndorphinTrigger {
  /** Source of the endorphin trigger */
  source: "breaking_point" | "desperation" | "clutch_moment" | "manual";
  /** Intensity of the trigger */
  intensity: EndorphinIntensity;
  /** Risk level associated with trigger */
  risk: "low" | "medium" | "high" | "extreme";
  /** Description of what triggered it */
  description: LocalizedText;
}

/**
 * Default endorphin state
 */
export const DEFAULT_ENDORPHIN_STATE: EndorphinState = {
  currentLevel: 0,
  addictionLevel: 0,
  cravingIntensity: 0,
  lastEndorphinKm: null,
  totalEndorphinUses: 0,
  isActive: false,
  activeEffects: null,
  remainingDuration: 0,
};

/**
 * Default addiction profile
 */
export const DEFAULT_ADDICTION_PROFILE: AddictionProfile = {
  addictionLevel: 0,
  lastEndorphinRaceDay: null,
  totalEndorphinUses: 0,
  recoveryDays: 0,
  withdrawalActive: false,
};
