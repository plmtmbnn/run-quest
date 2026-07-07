// coach-engine.ts
// Core observation evaluation and insight selection logic.
//
// This is the single entry point for generating coach insights.
// It is deterministic: same inputs always produce the same outputs.
// No external I/O. No React dependencies.

import {
  extractRaceKnowledgeEvidence,
  extractRaceTendencyEvidence,
  extractTrainingTendencyEvidence,
  RACE_RULES,
  TRAINING_RULES,
} from "./coach-rules";
import type {
  CoachInsight,
  RaceTelemetry,
  TrainingTelemetry,
} from "./coach-types";

// ---------------------------------------------------------------------------
// Telemetry derivation
// ---------------------------------------------------------------------------

/**
 * Derives a complete RaceTelemetry from a SimulationResult and its inputs.
 * This is the translation layer between the engine domain and the coach domain.
 */
export function deriveRaceTelemetry(
  result: import("@/types/engine").SimulationResult,
  challenge: import("@/types/engine").DailyChallenge,
  preparation: import("@/types/engine").Preparation,
): RaceTelemetry {
  const { finishTime, grade, outcome, stateLog } = result;
  const targetTime = challenge.objective.targetTime;
  const distance = challenge.race.distance;

  // Compute per-km pace from state log
  const kmTimes: number[] = [];
  for (let i = 1; i < stateLog.length; i++) {
    const dt = stateLog[i].accumulatedTime - stateLog[i - 1].accumulatedTime;
    if (dt > 0) kmTimes.push(dt);
  }

  const averagePace =
    kmTimes.length > 0
      ? kmTimes.reduce((a, b) => a + b, 0) / kmTimes.length
      : finishTime / Math.max(1, distance);

  // Pace variability: std dev of per-km times
  const mean =
    kmTimes.length > 0
      ? kmTimes.reduce((a, b) => a + b, 0) / kmTimes.length
      : 0;
  const paceVariability =
    kmTimes.length > 1
      ? Math.sqrt(
          kmTimes.reduce((sum, v) => sum + (v - mean) ** 2, 0) / kmTimes.length,
        )
      : 0;

  // First half vs second half pace
  const mid = Math.floor(kmTimes.length / 2);
  const firstHalfPace =
    mid > 0
      ? kmTimes.slice(0, mid).reduce((a, b) => a + b, 0) / mid
      : averagePace;
  const secondHalfPace =
    kmTimes.length - mid > 0
      ? kmTimes.slice(mid).reduce((a, b) => a + b, 0) / (kmTimes.length - mid)
      : averagePace;

  const negativeSplit = secondHalfPace < firstHalfPace;

  // Final state values
  const finalState = stateLog[stateLog.length - 1] ?? stateLog[0];
  const _initialState = stateLog[0];

  const finalEnergy = finalState?.energy ?? 0;
  const finalHydration = finalState?.hydration ?? 0;
  const finalFatigue = finalState?.fatigue ?? 0;

  const lowestHydration = stateLog.reduce(
    (min, s) => Math.min(min, s.hydration ?? 100),
    100,
  );

  const peakFatigue = stateLog.reduce(
    (max, s) => Math.max(max, s.fatigue ?? 0),
    0,
  );

  // First km where hydration dropped below 40
  const dehydrationLog = stateLog.findIndex((s) => (s.hydration ?? 100) < 40);
  const firstDehydrationKm = dehydrationLog > 0 ? dehydrationLog : -1;

  // Risk exposure: count km with riskLevel in each band
  const riskExposure = { low: 0, medium: 0, high: 0 };
  for (const s of stateLog) {
    const r = s.riskLevel ?? 0;
    if (r < 30) riskExposure.low++;
    else if (r < 60) riskExposure.medium++;
    else riskExposure.high++;
  }

  // Decision profile
  const decisionProfile = { aggressive: 0, balanced: 0, conservative: 0 };
  for (const b of finalState?.decisionHistory ?? []) {
    decisionProfile[b] = (decisionProfile[b] ?? 0) + 1;
  }

  // Did the player attack early?
  // "Early attack" = first-half pace was more than 5% faster than target pace per km
  const targetPacePerKm = targetTime / Math.max(1, distance);
  const attackedEarly =
    firstHalfPace < targetPacePerKm * 0.95 &&
    secondHalfPace > firstHalfPace * 1.05;

  return {
    distance,
    finishTime,
    outcome,
    grade,
    targetTime,
    targetAchieved: outcome === "gold" || outcome === "silver",
    averagePace,
    paceVariability,
    firstHalfPace,
    secondHalfPace,
    negativeSplit,
    finalEnergy,
    finalHydration,
    lowestHydration,
    finalFatigue,
    peakFatigue,
    riskExposure,
    decisionProfile,
    firstDehydrationKm,
    attackedEarly,
    weather: challenge.environment.weather,
    temperature: challenge.environment.temperature,
    humidity: challenge.environment.humidity,
    preparation,
    stateLog,
  };
}

// ---------------------------------------------------------------------------
// Race insight evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluates all race rules against the telemetry and returns ranked insights.
 * Insights are sorted by priority descending.
 */
export function evaluateRaceInsights(telemetry: RaceTelemetry): CoachInsight[] {
  const insights: CoachInsight[] = [];

  for (const rule of RACE_RULES) {
    const insight = rule(telemetry);
    if (insight !== null) {
      insights.push(insight);
    }
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

// ---------------------------------------------------------------------------
// Training insight evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluates all training rules against the telemetry and returns ranked insights.
 */
export function evaluateTrainingInsights(
  telemetry: TrainingTelemetry,
): CoachInsight[] {
  const insights: CoachInsight[] = [];

  for (const rule of TRAINING_RULES) {
    const insight = rule(telemetry);
    if (insight !== null) {
      insights.push(insight);
    }
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

// ---------------------------------------------------------------------------
// Knowledge & tendency extraction
// ---------------------------------------------------------------------------

/**
 * Returns the knowledge discovery evidence IDs produced by this race.
 */
export function extractRaceEvidence(telemetry: RaceTelemetry): string[] {
  return extractRaceKnowledgeEvidence(telemetry);
}

/**
 * Returns tendency delta map produced by this race.
 */
export function extractRaceTendencies(
  telemetry: RaceTelemetry,
): Record<string, number> {
  return extractRaceTendencyEvidence(telemetry);
}

/**
 * Returns tendency delta map produced by this training session.
 */
export function extractTrainingTendencies(
  telemetry: TrainingTelemetry,
): Record<string, number> {
  return extractTrainingTendencyEvidence(telemetry);
}
