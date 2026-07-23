import type { RaceOccurrence } from "@/scheduling/race-calendar-types";
import { loadRunnerState } from "@/runner/runner-persistence";
import { isHardActivity, isRecoveryActivity } from "./training-effects";
import { loadTrainingState } from "./training-store";
import type { CoachRecommendation, DailyActivity } from "./training-types";

/**
 * Generates a coach recommendation for today's activity.
 * @param currentDayIndex Current day index.
 * @param upcomingRaces Optional list of registered upcoming races.
 * @returns The coach recommendation.
 */
export const generateCoachRecommendation = (
  currentDayIndex: number,
  upcomingRaces: RaceOccurrence[] = [],
): CoachRecommendation => {
  const runnerState = loadRunnerState();
  const trainingState = loadTrainingState();
  const { currentFatigue, currentReadiness } = runnerState.profile;
  const { trainingHistory } = trainingState;

  // Check for upcoming races
  const nearestRace = upcomingRaces
    .filter((r) => !r.isCompleted && r.dayIndex >= currentDayIndex)
    .sort((a, b) => a.dayIndex - b.dayIndex)[0];

  const daysToRace = nearestRace ? nearestRace.dayIndex - currentDayIndex : null;

  // Get yesterday's activity (if any).
  const yesterdayIndex = currentDayIndex - 1;
  const yesterdayActivity = trainingHistory.find(
    (day) => day.date === yesterdayIndex,
  )?.activity;

  // Determine recommendation
  let recommendation: DailyActivity;
  let message: string;
  let reason: string;

  if (daysToRace === 0) {
    recommendation = "Full Rest";
    message = "Race Day! Good luck out there! 🏆";
    reason = "Focus completely on race execution and peak performance.";
  } else if (daysToRace === 1) {
    recommendation = "Full Rest";
    message = "Rest up, big race tomorrow! 🏆";
    reason = "Save all your energy and muscle freshness for race day.";
  } else if (daysToRace !== null && daysToRace >= 2 && daysToRace <= 3) {
    recommendation = "Recovery Run";
    message = "Taper — light run today, save your legs";
    reason = "Keep your legs loose while shedding accumulated fatigue before race day.";
  } else if (daysToRace !== null && daysToRace >= 4 && daysToRace <= 7) {
    recommendation = currentFatigue < 50 ? "Tempo Run" : "Easy Run";
    message = "Last quality session before race week!";
    reason = "Maintain race pace rhythm without risking overtraining before taper.";
  } else if (currentFatigue >= 80) {
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
