// training-engine.ts
// Core training logic for the Training & Recovery System.

import { analyzeTraining } from "@/coach/coach-analysis";
import type { TrainingTelemetry } from "@/coach/coach-types";
import { loadRunnerState, saveRunnerState } from "@/runner/runner-persistence";
import { awardXP } from "@/runner/runner-engine";
import { queueAdaptation } from "./adaptation-engine";
import {
  ACTIVITY_EFFECTS,
  isEasyActivity,
  isHardActivity,
  isLongRun,
  isRecoveryActivity,
  isRestDay,
  isStrengthActivity,
} from "./training-effects";
import { loadTrainingState, saveTrainingState } from "./training-store";
import type {
  DailyActivity,
  TrainingDay,
  TrainingState,
} from "./training-types";

/**
 * Records today's training activity and updates the runner's state.
 * @param activity The daily activity performed.
 */
export const recordTrainingActivity = (activity: DailyActivity): void => {
  const today = new Date().toISOString().split("T")[0];
  const trainingState = loadTrainingState();
  const runnerState = loadRunnerState();

  // Get the effect of the activity.
  const effect = ACTIVITY_EFFECTS[activity];

  // Update the runner's fatigue and readiness immediately.
  const updatedFatigue = runnerState.profile.currentFatigue + effect.fatigue;
  const updatedReadiness =
    runnerState.profile.currentReadiness + effect.readiness;

  // Award 20 XP and 30 Coins for training
  const xpGained = 20;
  const coinsGained = 30;
  const runnerProfileWithXP = awardXP(runnerState.profile, xpGained);

  const updatedRunnerState = {
    ...runnerState,
    profile: {
      ...runnerProfileWithXP,
      coins: (runnerProfileWithXP.coins || 0) + coinsGained,
      currentFatigue: Math.min(100, Math.max(0, updatedFatigue)),
      currentReadiness: Math.min(100, Math.max(0, updatedReadiness)),
    },
    lastUpdated: new Date().toISOString(),
  };
  saveRunnerState(updatedRunnerState);

  // Queue delayed adaptation if applicable.
  if (effect.adaptationDays && effect.fitness > 0) {
    queueAdaptation(effect.fitness, effect.adaptationDays);
  }

  // Create a new training day entry.
  const newTrainingDay: TrainingDay = {
    date: today,
    activity,
    effect,
    adaptationApplied: false,
  };

  // Update the training history.
  const updatedTrainingHistory = [
    ...trainingState.trainingHistory.filter((day) => day.date !== today),
    newTrainingDay,
  ];

  // Update the weekly training balance.
  const updatedWeeklyBalance = updateWeeklyBalance(
    trainingState.weeklyBalance,
    activity,
  );

  const updatedTrainingState: TrainingState = {
    ...trainingState,
    trainingHistory: updatedTrainingHistory,
    weeklyBalance: updatedWeeklyBalance,
    lastUpdated: new Date().toISOString(),
  };
  saveTrainingState(updatedTrainingState);

  // Compute consecutive hard sessions ending on this day
  let consecutiveHardDays = 0;
  if (isHardActivity(activity)) {
    consecutiveHardDays = 1;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const checkDateStr = checkDate.toISOString().split("T")[0];
      const prevDay = updatedTrainingHistory.find(
        (day) => day.date === checkDateStr,
      );
      if (prevDay && isHardActivity(prevDay.activity)) {
        consecutiveHardDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const tomorrowDay = (new Date().getDay() + 1) % 7;
  const isPreRaceDay = tomorrowDay === 0 || tomorrowDay === 6;

  const telemetry: TrainingTelemetry = {
    activity,
    fatigueBefore: runnerState.profile.currentFatigue,
    fatigueAfter: Math.min(100, Math.max(0, updatedFatigue)),
    readinessBefore: runnerState.profile.currentReadiness,
    stress: effect.stress,
    consecutiveHardDays,
    isPreRaceDay,
    weeklyBalance: updatedWeeklyBalance,
  };

  // Run the training analysis (will save feedback and tendencies)
  analyzeTraining(telemetry);
};

/**
 * Updates the weekly training balance based on the activity.
 * @param balance The current weekly balance.
 * @param activity The daily activity performed.
 * @returns The updated weekly balance.
 */
export const updateWeeklyBalance = (
  balance: TrainingState["weeklyBalance"],
  activity: DailyActivity,
): TrainingState["weeklyBalance"] => {
  const updatedBalance = { ...balance };

  if (isEasyActivity(activity)) {
    updatedBalance.easySessions += 1;
  } else if (isHardActivity(activity)) {
    updatedBalance.hardSessions += 1;
  } else if (isRecoveryActivity(activity)) {
    updatedBalance.recoverySessions += 1;
  } else if (isStrengthActivity(activity)) {
    updatedBalance.strengthSessions += 1;
  } else if (isLongRun(activity)) {
    updatedBalance.longRuns += 1;
  } else if (isRestDay(activity)) {
    updatedBalance.restDays += 1;
  }

  return updatedBalance;
};

/**
 * Resets the weekly training balance at the start of a new week.
 */
export const resetWeeklyBalance = (): void => {
  const trainingState = loadTrainingState();
  const updatedTrainingState: TrainingState = {
    ...trainingState,
    weeklyBalance: {
      easySessions: 0,
      hardSessions: 0,
      recoverySessions: 0,
      strengthSessions: 0,
      longRuns: 0,
      restDays: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
  saveTrainingState(updatedTrainingState);
};

/**
 * Gets the training history for the current week.
 * @returns The training history for the current week.
 */
export const getCurrentWeekTrainingHistory = (): TrainingDay[] => {
  const trainingState = loadTrainingState();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  return trainingState.trainingHistory.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate >= startOfWeek;
  });
};

/**
 * Gets today's training activity (if any).
 * @returns Today's training activity or null if none.
 */
export const getTodaysActivity = (): TrainingDay | null => {
  const trainingState = loadTrainingState();
  const today = new Date().toISOString().split("T")[0];
  return (
    trainingState.trainingHistory.find((day) => day.date === today) || null
  );
};
