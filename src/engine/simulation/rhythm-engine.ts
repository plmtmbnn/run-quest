export type RhythmHitAccuracy = "perfect" | "good" | "miss";

export interface RhythmHitResult {
  accuracy: RhythmHitAccuracy;
  timeDiffMs: number;
  efficiencyBoost: number; // 0.02 (perfect), 0.01 (good), 0 (miss), +0.03 at 10+ combo
  comboCount: number;
}

export interface RhythmState {
  spm: number; // Steps per minute (170 - 180)
  comboCount: number;
  activeEfficiencyBoost: number; // Decimal percentage (e.g., 0.05 = 5%)
  boostExpiresAtKm: number;
  isMinimized: boolean;
}

/**
 * Calculates optimal runner cadence (SPM) based on speed attribute.
 * Clamped between 170 and 180 SPM.
 */
export function calculateTargetSPM(speedAttr: number = 10): number {
  const bonus = Math.max(0, Math.min(10, (speedAttr - 10) * 0.5));
  return Math.round(170 + bonus);
}

export function createInitialRhythmState(speedAttr: number = 10): RhythmState {
  return {
    spm: calculateTargetSPM(speedAttr),
    comboCount: 0,
    activeEfficiencyBoost: 0,
    boostExpiresAtKm: 0,
    isMinimized: false,
  };
}

/**
 * Evaluates hit timing against optimal beat pulse.
 * - Perfect: <= 25ms (+2% efficiency)
 * - Good: <= 50ms (+1% efficiency)
 * - Miss: > 50ms (combo reset)
 * - Combo Bonus: 10+ hits = +3% additional efficiency
 */
export function evaluateRhythmHit(
  timeDiffMs: number,
  currentComboCount: number,
): RhythmHitResult {
  const absDiff = Math.abs(timeDiffMs);
  let accuracy: RhythmHitAccuracy = "miss";
  let baseBoost = 0;
  let newCombo = 0;

  if (absDiff <= 25) {
    accuracy = "perfect";
    baseBoost = 0.02;
    newCombo = currentComboCount + 1;
  } else if (absDiff <= 50) {
    accuracy = "good";
    baseBoost = 0.01;
    newCombo = currentComboCount + 1;
  } else {
    accuracy = "miss";
    baseBoost = 0;
    newCombo = 0;
  }

  const comboBonus = newCombo >= 10 ? 0.03 : 0;
  const totalBoost = baseBoost > 0 ? baseBoost + comboBonus : 0;

  return {
    accuracy,
    timeDiffMs,
    efficiencyBoost: totalBoost,
    comboCount: newCombo,
  };
}
