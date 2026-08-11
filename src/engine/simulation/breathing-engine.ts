export type BreathingCategory = "calm" | "elevated" | "labored" | "gasping";

export interface BreathingState {
  category: BreathingCategory;
  breathsPerMin: number;
  heartRateBpm: number;
  canControl: boolean;
  cooldownRemainingMs: number;
  lastControlledAtTime: number;
}

/**
 * Maps Heart Rate (BPM) to breathing category and breath rate per minute:
 * - Calm: HR < 150 (12-14 bpm)
 * - Elevated: HR 150-170 (18-22 bpm)
 * - Labored: HR 170-190 (25-30 bpm)
 * - Gasping: HR > 190 (35+ bpm)
 */
export function getBreathingCategory(heartRateBpm: number): {
  category: BreathingCategory;
  breathsPerMin: number;
} {
  if (heartRateBpm < 150) {
    return { category: "calm", breathsPerMin: 14 };
  }
  if (heartRateBpm <= 170) {
    return { category: "elevated", breathsPerMin: 20 };
  }
  if (heartRateBpm <= 190) {
    return { category: "labored", breathsPerMin: 28 };
  }
  return { category: "gasping", breathsPerMin: 36 };
}

export function createInitialBreathingState(
  heartRateBpm: number = 130,
): BreathingState {
  const { category, breathsPerMin } = getBreathingCategory(heartRateBpm);
  return {
    category,
    breathsPerMin,
    heartRateBpm,
    canControl: false,
    cooldownRemainingMs: 0,
    lastControlledAtTime: 0,
  };
}

/**
 * Updates breathing state with current Heart Rate and calculates 2-minute cooldown.
 */
export function updateBreathingState(
  currentState: BreathingState,
  heartRateBpm: number,
  currentTimeMs: number = Date.now(),
): BreathingState {
  const { category, breathsPerMin } = getBreathingCategory(heartRateBpm);
  const cooldownDurationMs = 120000; // 2 minutes
  const timeSinceLastControl =
    currentState.lastControlledAtTime > 0
      ? currentTimeMs - currentState.lastControlledAtTime
      : cooldownDurationMs;
  const cooldownRemainingMs = Math.max(
    0,
    cooldownDurationMs - timeSinceLastControl,
  );

  // Can control when HR > 180 or labored/gasping and cooldown has expired
  const canControl =
    (heartRateBpm >= 180 || category === "gasping" || category === "labored") &&
    cooldownRemainingMs === 0;

  return {
    category,
    breathsPerMin,
    heartRateBpm,
    canControl,
    cooldownRemainingMs,
    lastControlledAtTime: currentState.lastControlledAtTime,
  };
}

/**
 * Evaluates successful breathing control exercise:
 * - Reduces Heart Rate penalty by 10 BPM
 * - Grants +5% Focus recovery
 * - Starts 2-minute cooldown (120,000ms)
 */
export function processBreathingControlSuccess(
  currentState: BreathingState,
  currentTimeMs: number = Date.now(),
): {
  nextState: BreathingState;
  focusBonus: number;
  heartRateReduction: number;
} {
  const newHR = Math.max(100, currentState.heartRateBpm - 10);
  const { category, breathsPerMin } = getBreathingCategory(newHR);

  const nextState: BreathingState = {
    category,
    breathsPerMin,
    heartRateBpm: newHR,
    canControl: false,
    cooldownRemainingMs: 120000,
    lastControlledAtTime: currentTimeMs,
  };

  return {
    nextState,
    focusBonus: 5,
    heartRateReduction: 10,
  };
}
