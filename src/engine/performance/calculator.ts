import type {
  Grade,
  Objective,
  Outcome,
  SimulationState,
} from "@/types/engine";

export interface GradeAndOutcome {
  grade: Grade;
  outcome: Outcome;
  score: number;
}

/**
 * Calculates the race score, grade, and outcome category based on the objective,
 * final simulated state, and whether the runner DNFed.
 */
export function calculatePerformance(
  accumulatedTime: number,
  objective: Objective,
  finalState: SimulationState,
): GradeAndOutcome {
  // Check for DNS (Did Not Start)
  const isDNS = finalState.eventsResolved.some((e) =>
    e.title.en.includes("DNS"),
  );

  if (isDNS) {
    return {
      grade: "F",
      outcome: "dns",
      score: 0,
    };
  }

  // Check for DNF (Did Not Finish)
  // Runner DNFs if energy or hydration drops to 0
  const isDNF = finalState.energy <= 0 || finalState.hydration <= 0;

  if (isDNF) {
    return {
      grade: "F",
      outcome: "dnf",
      score: 0,
    };
  }

  const target = objective.targetTime;
  const ratio = accumulatedTime / target;

  let grade: Grade = "D";
  let outcome: Outcome = "finish";

  // 1. Grade mapping
  if (ratio <= 0.93) {
    grade = "S";
  } else if (ratio <= 1.0) {
    grade = "A";
  } else if (ratio <= 1.08) {
    grade = "B";
  } else if (ratio <= 1.18) {
    grade = "C";
  } else if (ratio <= 1.35) {
    grade = "D";
  } else {
    grade = "F";
  }

  // 2. Outcome mapping
  if (ratio <= 0.95) {
    outcome = "gold";
  } else if (ratio <= 1.01) {
    outcome = "silver";
  } else if (ratio <= 1.08) {
    outcome = "bronze";
  } else {
    outcome = "finish";
  }

  // 3. Score mapping (scaled 0-1000)
  let score = Math.floor(1000 * (target / accumulatedTime));
  score = Math.max(10, Math.min(1000, score));

  // Focus and Confidence bonus
  const averageStatusBonus = (finalState.focus + finalState.confidence) / 10;
  score = Math.min(1000, score + Math.floor(averageStatusBonus));

  return {
    grade,
    outcome,
    score,
  };
}
