// training-engine.ts
// Core training logic for the Training & Recovery System.

import { analyzeTraining } from "@/coach/coach-analysis";
import type { TrainingTelemetry } from "@/coach/coach-types";
import { awardXP } from "@/runner/runner-engine";
import { loadRunnerState, saveRunnerState } from "@/runner/runner-persistence";
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
export const recordTrainingActivity = (
  activity: DailyActivity,
  currentDayIndex: number,
): void => {
  const today = currentDayIndex;
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
    lastUpdated: new Date().toISOString(), // This is just save metadata, keeping it
  };
  saveRunnerState(updatedRunnerState);

  // Queue delayed adaptation if applicable.
  if (effect.adaptationDays && effect.fitness > 0) {
    queueAdaptation(effect.fitness, effect.adaptationDays, currentDayIndex);
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
    lastUpdated: currentDayIndex,
  };
  saveTrainingState(updatedTrainingState);

  // Compute consecutive hard sessions ending on this day
  let consecutiveHardDays = 0;
  if (isHardActivity(activity)) {
    consecutiveHardDays = 1;
    let checkDay = currentDayIndex - 1;
    while (checkDay >= 0) {
      const prevDay = updatedTrainingHistory.find(
        (day) => day.date === checkDay,
      );
      if (prevDay && isHardActivity(prevDay.activity)) {
        consecutiveHardDays++;
        checkDay--;
      } else {
        break;
      }
    }
  }

  const tomorrowDay = (currentDayIndex + 1) % 7;
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
export const resetWeeklyBalance = (currentDayIndex: number): void => {
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
    lastUpdated: currentDayIndex,
  };
  saveTrainingState(updatedTrainingState);
};

/**
 * Gets the training history for the current week.
 * @returns The training history for the current week.
 */
export const getCurrentWeekTrainingHistory = (
  currentDayIndex: number,
): TrainingDay[] => {
  const trainingState = loadTrainingState();
  const currentWeek = Math.floor(currentDayIndex / 7);

  return trainingState.trainingHistory.filter((day) => {
    const dayWeek = Math.floor(day.date / 7);
    return dayWeek === currentWeek;
  });
};

/**
 * Gets today's training activity (if any).
 * @returns Today's training activity or null if none.
 */
export const getTodaysActivity = (
  currentDayIndex: number,
): TrainingDay | null => {
  const trainingState = loadTrainingState();
  return (
    trainingState.trainingHistory.find((day) => day.date === currentDayIndex) ||
    null
  );
};
