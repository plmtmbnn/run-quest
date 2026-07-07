// coach-analysis.ts
// Post-race and post-training analysis pipeline.
//
// This is the orchestrator: it accepts raw gameplay data, runs the engine,
// assembles feedback, updates memory, and returns the final reports.
// It is the public API surface of the coach domain.

import type { WeeklyTrainingBalance } from "@/training/training-types";
import {
  deriveRaceTelemetry,
  evaluateRaceInsights,
  evaluateTrainingInsights,
  extractRaceEvidence,
  extractRaceTendencies,
  extractTrainingTendencies,
} from "./coach-engine";
import {
  assemblePostRaceFeedback,
  assemblePostTrainingFeedback,
} from "./coach-feedback";
import {
  loadCoachMemory,
  recordRaceFeedback,
  recordTrainingFeedback,
  updateKnowledgeEvidence,
  updateTendencies,
} from "./coach-memory";
import type {
  PostRaceFeedback,
  PostTrainingFeedback,
  RaceTelemetry,
  TrainingTelemetry,
  WeeklyMetricRating,
  WeeklyReview,
} from "./coach-types";

// ---------------------------------------------------------------------------
// Post-race analysis
// ---------------------------------------------------------------------------

/**
 * Runs the complete post-race analysis pipeline.
 *
 * 1. Derives telemetry from engine output.
 * 2. Evaluates all race rules.
 * 3. Assembles structured feedback.
 * 4. Persists feedback and updates knowledge/tendencies.
 *
 * @returns Fully assembled PostRaceFeedback for display.
 */
export function analyzeRace(
  result: import("@/types/engine").SimulationResult,
  challenge: import("@/types/engine").DailyChallenge,
  preparation: import("@/types/engine").Preparation,
): PostRaceFeedback {
  // Step 1: Derive telemetry
  const telemetry: RaceTelemetry = deriveRaceTelemetry(
    result,
    challenge,
    preparation,
  );

  // Step 2: Evaluate rules
  const insights = evaluateRaceInsights(telemetry);

  // Step 3: Assemble feedback
  const feedback = assemblePostRaceFeedback(insights, telemetry);

  // Step 4: Persist and update cross-session data
  const today = new Date().toISOString().split("T")[0];
  recordRaceFeedback(today, feedback);
  updateKnowledgeEvidence(extractRaceEvidence(telemetry));
  updateTendencies(extractRaceTendencies(telemetry));

  return feedback;
}

// ---------------------------------------------------------------------------
// Post-training analysis
// ---------------------------------------------------------------------------

/**
 * Runs the complete post-training analysis pipeline.
 *
 * @param telemetry - Pre-built TrainingTelemetry from the training domain.
 * @returns Fully assembled PostTrainingFeedback for display.
 */
export function analyzeTraining(
  telemetry: TrainingTelemetry,
): PostTrainingFeedback {
  // Evaluate rules
  const insights = evaluateTrainingInsights(telemetry);

  // Assemble feedback
  const feedback = assemblePostTrainingFeedback(insights, telemetry);

  // Persist and update tendencies
  const today = new Date().toISOString().split("T")[0];
  recordTrainingFeedback(today, feedback);
  updateTendencies(extractTrainingTendencies(telemetry));

  return feedback;
}

// ---------------------------------------------------------------------------
// Weekly review generation
// ---------------------------------------------------------------------------

/**
 * Rates a weekly metric based on a numeric value in [0, 1] range.
 */
function rateMetric(value: number): WeeklyMetricRating {
  if (value >= 0.85) return "Excellent";
  if (value >= 0.7) return "Optimal";
  if (value >= 0.55) return "Good";
  if (value >= 0.35) return "Stable";
  if (value >= 0.2) return "Improving";
  if (value >= 0.1) return "Needs Improvement";
  return "Poor";
}

/**
 * Generates a weekly review from available data.
 *
 * @param weekNumber - The week number to generate the review for.
 * @param weeklyBalance - The weekly training balance.
 * @param currentFitness - Runner's current fitness (0-100).
 * @param currentFatigue - Runner's current fatigue (0-100).
 * @param consistency - Runner's consistency score (0-100).
 */
export function generateWeeklyReview(
  weekNumber: number,
  weeklyBalance: WeeklyTrainingBalance,
  currentFitness: number,
  currentFatigue: number,
  consistency: number,
): WeeklyReview {
  const memory = loadCoachMemory();

  // --- Training Load ---
  const totalSessions =
    weeklyBalance.easySessions +
    weeklyBalance.hardSessions +
    weeklyBalance.recoverySessions +
    weeklyBalance.strengthSessions +
    weeklyBalance.longRuns;
  // Optimal week = 5-6 sessions
  const loadScore = Math.min(1, totalSessions / 6);
  const trainingLoad = rateMetric(loadScore);

  // --- Recovery ---
  const recoveryDays = weeklyBalance.recoverySessions + weeklyBalance.restDays;
  // Good week = at least 2 recovery days, low fatigue
  const recoveryScore =
    (Math.min(2, recoveryDays) / 2) * 0.6 +
    (1 - Math.min(1, currentFatigue / 100)) * 0.4;
  const recovery = rateMetric(recoveryScore);

  // --- Consistency ---
  const consistencyScore = Math.min(1, consistency / 100);
  const consistencyRating = rateMetric(consistencyScore);

  // --- Nutrition (proxy from race history: hydration discipline) ---
  const raceDates = Object.keys(memory.raceFeedbackHistory);
  const recentRaces = raceDates
    .sort()
    .slice(-7)
    .map((d) => memory.raceFeedbackHistory[d]);
  const hydrationIssues = recentRaces.filter(
    (r) =>
      r.primary.category === "hydration" ||
      r.secondary.some((s) => s.category === "hydration"),
  ).length;
  const nutritionScore =
    1 - Math.min(1, hydrationIssues / Math.max(1, recentRaces.length));
  const nutrition = rateMetric(nutritionScore);

  // --- Race Readiness (derived from fitness & fatigue) ---
  const readinessScore =
    (currentFitness / 100) * 0.6 + (1 - currentFatigue / 100) * 0.4;
  const raceReadiness = rateMetric(readinessScore);

  // --- Suggested Focus ---
  const suggestedFocus: string[] = [];

  if (recovery === "Needs Improvement" || recovery === "Poor") {
    suggestedFocus.push("Improve recovery between hard sessions.");
  }
  if (
    weeklyBalance.hardSessions >= 3 &&
    weeklyBalance.recoverySessions + weeklyBalance.restDays < 2
  ) {
    suggestedFocus.push(
      "Include at least two dedicated recovery sessions next week.",
    );
  }
  if (
    consistencyRating === "Needs Improvement" ||
    consistencyRating === "Poor"
  ) {
    suggestedFocus.push(
      "Focus on training consistency before increasing intensity.",
    );
  }
  if (nutrition === "Needs Improvement" || nutrition === "Poor") {
    suggestedFocus.push("Review hydration strategy during races.");
  }
  if (suggestedFocus.length === 0) {
    suggestedFocus.push(
      "Maintain current training distribution into next week.",
    );
  }

  const observationIds = [
    ...Object.keys(memory.raceFeedbackHistory)
      .sort()
      .slice(-3)
      .map((d) => `race:${d}`),
    ...Object.keys(memory.trainingFeedbackHistory)
      .sort()
      .slice(-3)
      .map((d) => `training:${d}`),
  ];

  return {
    weekNumber,
    generatedAt: new Date().toISOString(),
    metrics: {
      trainingLoad,
      recovery,
      consistency: consistencyRating,
      nutrition,
      raceReadiness,
    },
    suggestedFocus: suggestedFocus.slice(0, 3),
    observationIds,
  };
}

// ---------------------------------------------------------------------------
// Coach memory cross-week narrative
// ---------------------------------------------------------------------------

/**
 * Looks back through coach memory to find recurring patterns
 * and returns a narrative string for display.
 * Returns null if there is insufficient history.
 */
export function generateCrossWeekNarrative(): string | null {
  const memory = loadCoachMemory();
  const reviews = Object.values(memory.weeklyReviews).sort(
    (a, b) => a.weekNumber - b.weekNumber,
  );

  if (reviews.length < 3) return null;

  // Check for repeated poor recovery over 3+ consecutive weeks
  const lastThree = reviews.slice(-3);
  const allPoorRecovery = lastThree.every(
    (r) =>
      r.metrics.recovery === "Needs Improvement" ||
      r.metrics.recovery === "Poor",
  );

  if (allPoorRecovery) {
    const weekCount = lastThree.length;
    return `I noticed this is the ${weekCount === 3 ? "third" : `${weekCount}th`} consecutive week in which fatigue accumulated before the weekend race.`;
  }

  // Check for improving pacing (negative_split tendency)
  const negativeSplitTendency = memory.tendencies.negative_splitter;
  if (negativeSplitTendency && negativeSplitTendency.evidenceCount >= 3) {
    return "You've become significantly more consistent at running controlled second halves.";
  }

  return null;
}
