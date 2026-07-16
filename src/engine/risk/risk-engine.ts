/**
 * Risk Engine (Sprint 24)
 * 
 * Main orchestrator for the injury and risk system.
 * Integrates with the timeline engine and race flow.
 */

import type { GameState } from "../timeline/time-types";
import type { Injury, InjuryState, InjuryType, RiskFactors } from "./injury-types";
import { DEFAULT_INJURY_STATE } from "./injury-types";
import { createInjury } from "./injury-database";
import {
  calculateInjuryProbability,
  calculateRiskFactors,
  getRaceWarnings,
  getRiskLevelDescription,
  selectInjuryType,
  shouldCauseInjury,
} from "./injury-calculator";
import {
  addInjury,
  advanceRecovery,
  applyTreatment,
  calculatePerformancePenalty,
  checkInjuryWorsening,
  getRecoveryStatus,
  recordBreakingPoint,
  recordRaceDay,
  recordTrainingDay,
} from "./recovery-engine";

/**
 * Complete risk assessment for an upcoming race.
 */
export interface RiskAssessment {
  probability: number;
  riskLevel: "low" | "moderate" | "high" | "extreme";
  riskLabel: string;
  riskColor: string;
  warnings: string[];
  performancePenalty: {
    speedPenalty: number;
    staminaPenalty: number;
    overallPenalty: number;
  };
  canRaceSafely: boolean;
}

/**
 * Assess risk before a race.
 */
export function assessRaceRisk(
  gameState: GameState,
  injuryState: InjuryState,
): RiskAssessment {
  const riskFactors = calculateRiskFactors(gameState, injuryState);
  const probability = calculateInjuryProbability(riskFactors, injuryState);
  const riskLevel = getRiskLevelDescription(probability);
  const warnings = getRaceWarnings(riskFactors, injuryState);
  const performancePenalty = calculatePerformancePenalty(injuryState);
  const recoveryStatus = getRecoveryStatus(injuryState);

  return {
    probability,
    riskLevel: riskLevel.level,
    riskLabel: riskLevel.label,
    riskColor: riskLevel.color,
    warnings,
    performancePenalty,
    canRaceSafely: recoveryStatus.canRace,
  };
}

/**
 * Process a race completion - check for new injuries and injury worsening.
 */
export function processRaceCompletion(
  gameState: GameState,
  injuryState: InjuryState,
  pushedBreakingPoint: boolean = false,
): {
  injuryState: InjuryState;
  newInjuries: Injury[];
  worsenedInjuries: Injury[];
} {
  let updatedState = recordRaceDay(injuryState, gameState.dayIndex);

  // Check for injury worsening if racing with existing injuries
  const { injuryState: stateAfterWorsening, worsened } = checkInjuryWorsening(
    updatedState,
    gameState.seed + gameState.dayIndex
  );
  updatedState = stateAfterWorsening;

  // Check for new injuries
  const newInjuries: Injury[] = [];
  const riskFactors = calculateRiskFactors(gameState, updatedState);
  const probability = calculateInjuryProbability(riskFactors, updatedState);

  if (shouldCauseInjury(probability, gameState.seed + gameState.dayIndex + 1)) {
    const injuryType = selectInjuryType(
      riskFactors,
      gameState.seed + gameState.dayIndex + 2
    );
    const injury = createInjury(
      injuryType,
      gameState.dayIndex,
      ((gameState.seed + gameState.dayIndex + 3) % 233280) / 233280
    );
    updatedState = addInjury(updatedState, injury);
    newInjuries.push(injury);
  }

  // Record breaking point if pushed
  if (pushedBreakingPoint) {
    updatedState = recordBreakingPoint(updatedState, gameState.dayIndex);
  }

  return {
    injuryState: updatedState,
    newInjuries,
    worsenedInjuries: worsened,
  };
}

/**
 * Process a training session - update injury state.
 */
export function processTraining(
  gameState: GameState,
  injuryState: InjuryState,
): InjuryState {
  return recordTrainingDay(injuryState, gameState.dayIndex);
}

/**
 * Process a rest day - advance recovery for all injuries.
 */
export function processRestDay(
  gameState: GameState,
  injuryState: InjuryState,
): InjuryState {
  let updatedState = advanceRecovery(injuryState);

  // Update recovery history with current day
  updatedState = {
    ...updatedState,
    injuryHistory: updatedState.injuryHistory.map((record) => {
      if (record.dayRecovered === 0) {
        return { ...record, dayRecovered: gameState.dayIndex };
      }
      return record;
    }),
  };

  return updatedState;
}

/**
 * Get a displayable summary of current injury status.
 */
export function getInjuryStatusSummary(injuryState: InjuryState): {
  status: "healthy" | "minor" | "moderate" | "severe";
  message: string;
  icon: string;
  color: string;
} {
  if (injuryState.activeInjuries.length === 0) {
    return {
      status: "healthy",
      message: "Fully healthy - ready to race",
      icon: "✅",
      color: "text-green-500",
    };
  }

  const hasSevere = injuryState.activeInjuries.some(
    (inj) => inj.severity === "severe"
  );
  const hasModerate = injuryState.activeInjuries.some(
    (inj) => inj.severity === "moderate"
  );

  if (hasSevere) {
    return {
      status: "severe",
      message: `${injuryState.activeInjuries.length} severe injury(ies) - racing not recommended`,
      icon: "❌",
      color: "text-red-500",
    };
  }

  if (hasModerate) {
    return {
      status: "moderate",
      message: `${injuryState.activeInjuries.length} active injury(ies) - race carefully`,
      icon: "⚠️",
      color: "text-orange-500",
    };
  }

  return {
    status: "minor",
    message: `${injuryState.activeInjuries.length} minor ache(s) - manageable`,
    icon: "⚡",
    color: "text-yellow-500",
  };
}

// Re-export key functions
export {
  advanceRecovery,
  applyTreatment,
  calculatePerformancePenalty,
  getRecoveryStatus,
};

// Re-export types
export type { InjuryState, Injury, RiskFactors };
export { DEFAULT_INJURY_STATE };
