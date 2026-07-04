// coach-recommendation.ts
// Daily coach recommendations for the Training & Recovery System.

import { loadRunnerState } from "@/runner/runner-persistence";
import { isHardActivity, isRecoveryActivity } from "./training-effects";
import { loadTrainingState } from "./training-store";
import type { CoachRecommendation, DailyActivity } from "./training-types";

/**
 * Generates a coach recommendation for today's activity.
 * @returns The coach recommendation.
 */
export const generateCoachRecommendation = (): CoachRecommendation => {
  const runnerState = loadRunnerState();
  const trainingState = loadTrainingState();
  const { currentFatigue, currentReadiness } = runnerState.profile;
  const { trainingHistory } = trainingState;

  // Get yesterday's activity (if any).
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const yesterdayActivity = trainingHistory.find(
    (day) => day.date === yesterdayStr,
  )?.activity;

  // Determine the recommendation based on current state.
  let recommendation: DailyActivity;
  let message: string;
  let reason: string;

  if (currentFatigue >= 80) {
    recommendation = "Full Rest";
    message = "You are carrying too much fatigue. Take a rest day.";
    reason = "High fatigue levels increase injury risk and reduce performance.";
  } else if (currentFatigue >= 60) {
    recommendation = "Recovery Run";
    message = "You are still recovering from recent efforts.";
    reason = "A recovery run will help reduce fatigue without adding stress.";
  } else if (currentReadiness <= 30) {
    recommendation = "Mobility Session";
    message = "Your readiness is low. Focus on mobility today.";
    reason = "Mobility work will improve readiness without adding fatigue.";
  } else if (yesterdayActivity && isHardActivity(yesterdayActivity)) {
    recommendation = "Easy Run";
    message = "Yesterday was tough. Keep it easy today.";
    reason = "Easy runs promote recovery while maintaining consistency.";
  } else if (yesterdayActivity && isRecoveryActivity(yesterdayActivity)) {
    recommendation = "Tempo Run";
    message = "You recovered well yesterday. Time for a tempo run!";
    reason = "Tempo runs build fitness with manageable fatigue.";
  } else if (currentFatigue <= 20 && currentReadiness >= 80) {
    recommendation = "Interval Training";
    message = "You are fresh and ready. Push yourself today!";
    reason =
      "Interval training maximizes fitness gains when readiness is high.";
  } else {
    recommendation = "Easy Run";
    message = "An easy run would be beneficial today.";
    reason = "Easy runs are the foundation of consistent training.";
  }

  return {
    recommendation,
    message,
    reason,
  };
};
