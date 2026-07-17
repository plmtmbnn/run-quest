/**
 * Recovery Engine (Sprint 24)
 *
 * Handles injury recovery, treatment application, and racing-while-injured logic.
 */

import type { GameState } from "../timeline/time-types";
import { createInjury } from "./injury-database";
import type {
  Injury,
  InjuryState,
  Treatment,
  TreatmentType,
} from "./injury-types";

/**
 * Advance recovery for all active injuries by one day.
 * Called when the day advances (rest action or dayCost actions).
 */
export function advanceRecovery(injuryState: InjuryState): InjuryState {
  const activeInjuries = injuryState.activeInjuries
    .map((injury) => ({
      ...injury,
      recoveryDaysRemaining: Math.max(0, injury.recoveryDaysRemaining - 1),
    }))
    .filter((injury) => injury.recoveryDaysRemaining > 0);

  // Move fully recovered injuries to history
  const recovered = injuryState.activeInjuries.filter(
    (injury) => injury.recoveryDaysRemaining <= 1,
  );

  const injuryHistory = [
    ...injuryState.injuryHistory,
    ...recovered.map((injury) => ({
      type: injury.type,
      severity: injury.severity,
      dayAcquired: injury.acquiredOnDay,
      dayRecovered: 0, // Will be set by caller with current dayIndex
    })),
  ];

  return {
    ...injuryState,
    activeInjuries,
    injuryHistory,
  };
}

/**
 * Apply a treatment to reduce recovery time.
 */
export function applyTreatment(
  injuryState: InjuryState,
  gameState: GameState,
  injuryId: string,
  treatmentType: TreatmentType,
): { injuryState: InjuryState; gameState: GameState; success: boolean } {
  const injury = injuryState.activeInjuries.find((inj) => inj.id === injuryId);
  if (!injury) {
    return { injuryState, gameState, success: false };
  }

  const treatment = injury.treatmentOptions.find((t) => t.id === treatmentType);
  if (!treatment) {
    return { injuryState, gameState, success: false };
  }

  // Check if player can afford treatment
  if (gameState.resources.money < treatment.cost) {
    return { injuryState, gameState, success: false };
  }

  // Deduct cost
  const newGameState: GameState = {
    ...gameState,
    resources: {
      ...gameState.resources,
      money: gameState.resources.money - treatment.cost,
    },
  };

  // Reduce recovery time
  const updatedInjuries = injuryState.activeInjuries.map((inj) => {
    if (inj.id === injuryId) {
      return {
        ...inj,
        recoveryDaysRemaining: Math.max(
          1,
          inj.recoveryDaysRemaining - treatment.daysReduced,
        ),
      };
    }
    return inj;
  });

  const newInjuryState: InjuryState = {
    ...injuryState,
    activeInjuries: updatedInjuries,
  };

  return {
    injuryState: newInjuryState,
    gameState: newGameState,
    success: true,
  };
}

/**
 * Calculate performance penalty for racing with injuries.
 */
export function calculatePerformancePenalty(injuryState: InjuryState): {
  speedPenalty: number;
  staminaPenalty: number;
  overallPenalty: number;
} {
  let speedPenalty = 0;
  let staminaPenalty = 0;

  for (const injury of injuryState.activeInjuries) {
    if (
      injury.affectedAttribute === "speed" ||
      injury.affectedAttribute === "all"
    ) {
      speedPenalty += injury.performancePenalty;
    }
    if (
      injury.affectedAttribute === "stamina" ||
      injury.affectedAttribute === "all"
    ) {
      staminaPenalty += injury.performancePenalty;
    }
  }

  // Cap penalties at 80% (still possible to finish, but very impaired)
  speedPenalty = Math.min(0.8, speedPenalty);
  staminaPenalty = Math.min(0.8, staminaPenalty);
  const overallPenalty = Math.min(0.8, (speedPenalty + staminaPenalty) / 2);

  return { speedPenalty, staminaPenalty, overallPenalty };
}

/**
 * Check if racing should worsen existing injuries.
 * Returns updated injury state with potentially worsened injuries.
 */
export function checkInjuryWorsening(
  injuryState: InjuryState,
  randomSeed: number,
): { injuryState: InjuryState; worsened: Injury[] } {
  const worsened: Injury[] = [];
  const updatedInjuries = injuryState.activeInjuries.map((injury) => {
    const roll = ((randomSeed * 9301 + 49297) % 233280) / 233280;

    if (roll < injury.riskOfWorsening) {
      // Injury worsened - increase recovery time and penalty
      const worsenedInjury: Injury = {
        ...injury,
        recoveryDaysRemaining: Math.floor(injury.recoveryDaysRemaining * 1.5),
        recoveryDaysTotal: Math.floor(injury.recoveryDaysTotal * 1.5),
        performancePenalty: Math.min(0.8, injury.performancePenalty * 1.3),
        severity:
          injury.severity === "minor"
            ? "moderate"
            : injury.severity === "moderate"
              ? "severe"
              : "severe",
      };
      worsened.push(worsenedInjury);
      return worsenedInjury;
    }

    return injury;
  });

  return {
    injuryState: { ...injuryState, activeInjuries: updatedInjuries },
    worsened,
  };
}

/**
 * Record a race day for injury risk tracking.
 */
export function recordRaceDay(
  injuryState: InjuryState,
  dayIndex: number,
): InjuryState {
  const recentRaceDays = [...injuryState.recentRaceDays, dayIndex].slice(-10); // Keep last 10

  return {
    ...injuryState,
    recentRaceDays,
  };
}

/**
 * Record a training day for injury risk tracking.
 */
export function recordTrainingDay(
  injuryState: InjuryState,
  dayIndex: number,
): InjuryState {
  const recentTrainingDays = [
    ...injuryState.recentTrainingDays,
    dayIndex,
  ].slice(-10);

  return {
    ...injuryState,
    recentTrainingDays,
  };
}

/**
 * Record a breaking point push for injury risk tracking.
 */
export function recordBreakingPoint(
  injuryState: InjuryState,
  dayIndex: number,
): InjuryState {
  // Count breaking points in the last 7 days
  const cutoff = dayIndex - 7;
  const count = 0;

  // Increment count (we'll clean it up when checking risk)
  return {
    ...injuryState,
    recentBreakingPoints: injuryState.recentBreakingPoints + 1,
  };
}

/**
 * Clean up old breaking point counts (older than 7 days).
 * This should be called periodically, e.g., on day advance.
 */
export function cleanupBreakingPoints(
  injuryState: InjuryState,
  dayIndex: number,
): InjuryState {
  // For simplicity, decay the count gradually
  // In a more complex system, you'd track timestamps
  const decayRate = 0.85; // 15% decay per day

  return {
    ...injuryState,
    recentBreakingPoints: Math.floor(
      injuryState.recentBreakingPoints * decayRate,
    ),
  };
}

/**
 * Add a new injury to the state.
 */
export function addInjury(
  injuryState: InjuryState,
  injury: Injury,
): InjuryState {
  return {
    ...injuryState,
    activeInjuries: [...injuryState.activeInjuries, injury],
  };
}

/**
 * Check if the runner can safely race (no severe injuries).
 */
export function canRaceSafely(injuryState: InjuryState): boolean {
  return !injuryState.activeInjuries.some(
    (injury) => injury.severity === "severe",
  );
}

/**
 * Get a recovery status summary for UI display.
 */
export function getRecoveryStatus(injuryState: InjuryState): {
  hasInjuries: boolean;
  totalInjuries: number;
  daysUntilFullRecovery: number;
  canRace: boolean;
  warnings: string[];
} {
  const hasInjuries = injuryState.activeInjuries.length > 0;
  const totalInjuries = injuryState.activeInjuries.length;
  const daysUntilFullRecovery = Math.max(
    ...injuryState.activeInjuries.map((inj) => inj.recoveryDaysRemaining),
    0,
  );
  const canRace = canRaceSafely(injuryState);

  const warnings: string[] = [];
  if (!canRace) {
    warnings.push("❌ Severe injuries present - racing not recommended");
  } else if (hasInjuries) {
    warnings.push("⚠️ Active injuries - race at your own risk");
  }

  return {
    hasInjuries,
    totalInjuries,
    daysUntilFullRecovery,
    canRace,
    warnings,
  };
}
