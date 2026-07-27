// training-engine.ts
// Core training logic for the Training & Recovery System.

import { analyzeTraining } from "@/coach/coach-analysis";
import type { TrainingTelemetry } from "@/coach/coach-types";
import { awardXP } from "@/runner/progression-engine";
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
import { useHealthStore } from "@/health/health-store";
import { calculateInjuryRisk, rollForInjury, createInjury, canTrainWithInjuries } from "@/health/injury-risk-engine";

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
  const healthState = useHealthStore.getState().healthState;

  // Check if runner can train due to injuries
  if (!canTrainWithInjuries(healthState)) {
    throw new Error('Cannot train while injured');
  }

  // Get the effect of the activity.
  const effect = ACTIVITY_EFFECTS[activity];

  // Calculate immediate fitness gain (30% immediate, 70% delayed adaptation)
  const immediateFitness = (effect.fitness || 0) * 0.3;
  const updatedFitness = Math.min(100, Math.max(0, runnerState.profile.currentFitness + immediateFitness));
  const updatedFatigue = Math.min(100, Math.max(0, runnerState.profile.currentFatigue + effect.fatigue));
  const updatedReadiness = Math.min(100, Math.max(0, runnerState.profile.currentReadiness + effect.readiness));

  // Award 20 XP for training
  const xpGained = 20;
  const xpResult = awardXP(runnerState.profile, xpGained);
  
  const runnerProfileWithXP = {
    ...runnerState.profile,
    xp: xpResult.xp,
    level: xpResult.level,
    skillPoints: xpResult.skillPoints,
  };

  const updatedRunnerState = {
    ...runnerState,
    profile: {
      ...runnerProfileWithXP,
      totalTrainingDays: (runnerState.profile.totalTrainingDays || 0) + 1,
      currentFitness: updatedFitness,
      currentFatigue: updatedFatigue,
      currentReadiness: updatedReadiness,
    },
    lastUpdated: new Date().toISOString(),
  };
  saveRunnerState(updatedRunnerState);

  // Notify reactive state listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("runner-state-updated", { detail: updatedRunnerState })
    );
  }

  // Queue remaining delayed adaptation (70%) if applicable.
  if (effect.adaptationDays && effect.fitness > 0) {
    const delayedFitness = effect.fitness * 0.7;
    queueAdaptation(delayedFitness, effect.adaptationDays, currentDayIndex);
  }

  // Fetch the latest training state (which includes any queued adaptations)
  const currentTrainingState = loadTrainingState();

  // Create a new training day entry.
  const newTrainingDay: TrainingDay = {
    date: today,
    activity,
    effect,
    adaptationApplied: false,
  };

  // Update the training history.
  const updatedTrainingHistory = [
    ...currentTrainingState.trainingHistory.filter((day) => day.date !== today),
    newTrainingDay,
  ];

  // Update the weekly training balance.
  const updatedWeeklyBalance = updateWeeklyBalance(
    currentTrainingState.weeklyBalance,
    activity,
  );

  const updatedTrainingState: TrainingState = {
    ...currentTrainingState,
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

  // Check for injury after training
  checkForTrainingInjury(currentDayIndex, runnerState.profile, activity, healthState);

  // Update health store with training day
  updateHealthAfterTraining(healthState, activity);

  // Run the training analysis (will save feedback and tendencies)
  analyzeTraining(telemetry);
};

/**
 * Check for injury after training activity.
 */
function checkForTrainingInjury(
  dayIndex: number,
  runnerProfile: any,
  activity: DailyActivity,
  healthState: any
): void {
  // Calculate injury risk based on training activity
  const activityDetails = {
    type: 'training' as const,
    distance: getActivityDistance(activity),
    intensity: getActivityIntensity(activity),
    duration: getActivityDuration(activity),
    daysSinceLastRest: healthState.consecutiveTrainingDays,
    hasProperEquipment: true, // Assume proper equipment for now
    hasGoodNutrition: true, // Assume good nutrition for now
    didWarmup: true, // Assume warmup was done
    isFollowingTrainingPlan: true, // Assume following plan
  };

  const injuryRisk = calculateInjuryRisk(healthState, runnerProfile, activityDetails);
  
  // Roll for injury
  const injuryResult = rollForInjury(injuryRisk.totalRisk);
  
  if (injuryResult.injured) {
    const injury = createInjury(
      injuryResult.injuryType!,
      injuryResult.severity!,
      dayIndex
    );
    
    // Add injury to health state
    const healthStore = useHealthStore.getState();
    healthStore.addInjury(injury);
    healthStore.saveToStorage();
  }
}

/**
 * Update health state after training.
 */
function updateHealthAfterTraining(healthState: any, activity: DailyActivity): void {
  const healthStore = useHealthStore.getState();
  
  // Increment consecutive training days
  if (!isRestDay(activity)) {
    healthStore.incrementConsecutiveTrainingDays();
  } else {
    // Reset consecutive training days for rest days
    healthStore.resetConsecutiveTrainingDays();
    healthStore.addRestDay();
  }
  
  // Update overtraining level based on activity intensity
  const intensity = getActivityIntensity(activity);
  const overtrainDelta = intensity * 5; // More intense activities increase overtraining more
  healthStore.updateOvertrainLevel(overtrainDelta);
  
  // Update fatigue level
  const fatigueDelta = intensity * 10; // More intense activities cause more fatigue
  healthStore.updateFatigueLevel(fatigueDelta);
  
  healthStore.saveToStorage();
}

/**
 * Get distance for a training activity.
 */
function getActivityDistance(activity: string): number {
  const distances: Record<string, number> = {
    rest: 0,
    easy_run: 5,
    moderate_run: 8,
    hard_run: 12,
    long_run: 15,
    speed_work: 6,
    hill_repeats: 4,
    tempo_run: 10,
    recovery_run: 3,
    cross_train: 8,
    strength: 0,
    yoga: 0,
    mobility: 0,
    "Recovery Run": 3,
    "Easy Run": 5,
    "Tempo Run": 10,
    "Interval Training": 6,
    "Long Run": 15,
    "Hill Repeats": 4,
    "Strength Training": 0,
    "Mobility Session": 0,
    "Full Rest": 0,
  };
  return distances[activity] || 5;
}

/**
 * Get intensity for a training activity (0-1).
 */
function getActivityIntensity(activity: string): number {
  const intensities: Record<string, number> = {
    rest: 0,
    easy_run: 0.4,
    moderate_run: 0.6,
    hard_run: 0.8,
    long_run: 0.7,
    speed_work: 0.9,
    hill_repeats: 0.85,
    tempo_run: 0.8,
    recovery_run: 0.3,
    cross_train: 0.5,
    strength: 0.6,
    yoga: 0.2,
    mobility: 0.1,
    "Recovery Run": 0.3,
    "Easy Run": 0.4,
    "Tempo Run": 0.8,
    "Interval Training": 0.9,
    "Long Run": 0.7,
    "Hill Repeats": 0.85,
    "Strength Training": 0.6,
    "Mobility Session": 0.1,
    "Full Rest": 0,
  };
  return intensities[activity] || 0.5;
}

/**
 * Get duration for a training activity in minutes.
 */
function getActivityDuration(activity: string): number {
  const durations: Record<string, number> = {
    rest: 0,
    easy_run: 30,
    moderate_run: 45,
    hard_run: 60,
    long_run: 90,
    speed_work: 45,
    hill_repeats: 30,
    tempo_run: 40,
    recovery_run: 20,
    cross_train: 60,
    strength: 45,
    yoga: 30,
    mobility: 15,
    "Recovery Run": 20,
    "Easy Run": 30,
    "Tempo Run": 40,
    "Interval Training": 45,
    "Long Run": 90,
    "Hill Repeats": 30,
    "Strength Training": 45,
    "Mobility Session": 15,
    "Full Rest": 0,
  };
  return durations[activity] || 45;
}

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
