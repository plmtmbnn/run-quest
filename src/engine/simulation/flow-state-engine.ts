import type { FlowLevel, FlowState } from "@/engine/simulation/types";

export function createInitialFlowState(): FlowState {
  return {
    score: 0,
    level: "building",
    isInTheZone: false,
    consecutiveOptimalPaceKm: 0,
  };
}

/**
 * Calculates flow level based on current flow score and zone hysteresis.
 * - Building: 0 - 30
 * - Flowing: 31 - 60
 * - The Zone: 61 - 100 (enters at >= 61, deactivates when score drops below 50)
 */
export function getFlowLevelAndZoneStatus(
  currentScore: number,
  currentlyInZone: boolean,
): { level: FlowLevel; isInTheZone: boolean } {
  const score = Math.max(0, Math.min(100, currentScore));
  let isInTheZone = currentlyInZone;

  if (!currentlyInZone && score >= 61) {
    isInTheZone = true;
  } else if (currentlyInZone && score < 50) {
    isInTheZone = false;
  }

  let level: FlowLevel = "building";
  if (isInTheZone || score >= 61) {
    level = "zone";
  } else if (score >= 31) {
    level = "flowing";
  } else {
    level = "building";
  }

  return { level, isInTheZone };
}

export interface FlowKmEvaluationParams {
  actualPaceSeconds: number;
  targetPaceSeconds: number;
  hasActiveBreakingPoint: boolean;
  energy: number;
}

/**
 * Evaluates km step flow score delta based on performance:
 * - Pace consistency: +5 per km within 5% of target pace
 * - No breaking points: +3 per km without crisis
 * - Energy management: +5 if energy between 40-70%
 */
export function evaluateKmFlowDelta(params: FlowKmEvaluationParams): {
  delta: number;
  isPaceOptimal: boolean;
} {
  let delta = 0;
  let isPaceOptimal = false;

  // Pace consistency: within 5% of target pace
  if (params.targetPaceSeconds > 0) {
    const paceDiff = Math.abs(
      params.actualPaceSeconds - params.targetPaceSeconds,
    );
    const paceMargin = params.targetPaceSeconds * 0.05;
    if (paceDiff <= paceMargin) {
      delta += 5;
      isPaceOptimal = true;
    }
  }

  // No breaking points: +3 per km without crisis
  if (!params.hasActiveBreakingPoint) {
    delta += 3;
  }

  // Energy management: +5 if energy between 40-70%
  if (params.energy >= 40 && params.energy <= 70) {
    delta += 5;
  }

  return { delta, isPaceOptimal };
}

/**
 * Applies a delta change to current FlowState and updates level / Zone status.
 */
export function applyFlowScoreDelta(
  currentState: FlowState,
  delta: number,
  isPaceOptimal?: boolean,
): FlowState {
  const newScore = Math.max(0, Math.min(100, currentState.score + delta));
  const { level, isInTheZone } = getFlowLevelAndZoneStatus(
    newScore,
    currentState.isInTheZone,
  );
  const consecutiveOptimalPaceKm =
    isPaceOptimal === true
      ? currentState.consecutiveOptimalPaceKm + 1
      : isPaceOptimal === false
        ? 0
        : currentState.consecutiveOptimalPaceKm;

  return {
    score: newScore,
    level,
    isInTheZone,
    consecutiveOptimalPaceKm,
  };
}
