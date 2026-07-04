// training-effects.ts
// Effects of each daily activity on the runner's metrics.

import type { ActivityEffect, DailyActivity } from "./training-types";

/**
 * Defines the effects of each daily activity.
 */
export const ACTIVITY_EFFECTS: Record<DailyActivity, ActivityEffect> = {
  "Recovery Run": {
    fitness: 0.5,
    fatigue: -5,
    readiness: 10,
    adaptationDays: 1,
    stress: 2,
  },
  "Easy Run": {
    fitness: 1,
    fatigue: 5,
    readiness: 5,
    adaptationDays: 2,
    stress: 5,
  },
  "Tempo Run": {
    fitness: 2,
    fatigue: 15,
    readiness: -5,
    adaptationDays: 3,
    stress: 10,
  },
  "Interval Training": {
    fitness: 3,
    fatigue: 20,
    readiness: -10,
    adaptationDays: 4,
    stress: 15,
  },
  "Long Run": {
    fitness: 2.5,
    fatigue: 25,
    readiness: -15,
    adaptationDays: 5,
    stress: 20,
  },
  "Hill Repeats": {
    fitness: 2,
    fatigue: 18,
    readiness: -8,
    adaptationDays: 3,
    stress: 12,
  },
  "Strength Training": {
    fitness: 1.5,
    fatigue: 10,
    readiness: 0,
    adaptationDays: 2,
    stress: 8,
  },
  "Mobility Session": {
    fitness: 0.2,
    fatigue: -3,
    readiness: 8,
    adaptationDays: 1,
    stress: 1,
  },
  "Full Rest": {
    fitness: 0,
    fatigue: -20,
    readiness: 20,
    adaptationDays: 0,
    stress: 0,
  },
};

/**
 * Determines whether an activity is a recovery-focused activity.
 * @param activity The daily activity.
 * @returns True if the activity is recovery-focused.
 */
export const isRecoveryActivity = (activity: DailyActivity): boolean => {
  return ["Recovery Run", "Mobility Session", "Full Rest"].includes(activity);
};

/**
 * Determines whether an activity is a hard training session.
 * @param activity The daily activity.
 * @returns True if the activity is a hard training session.
 */
export const isHardActivity = (activity: DailyActivity): boolean => {
  return [
    "Tempo Run",
    "Interval Training",
    "Long Run",
    "Hill Repeats",
  ].includes(activity);
};

/**
 * Determines whether an activity is an easy training session.
 * @param activity The daily activity.
 * @returns True if the activity is an easy training session.
 */
export const isEasyActivity = (activity: DailyActivity): boolean => {
  return ["Easy Run"].includes(activity);
};

/**
 * Determines whether an activity is a strength training session.
 * @param activity The daily activity.
 * @returns True if the activity is a strength training session.
 */
export const isStrengthActivity = (activity: DailyActivity): boolean => {
  return ["Strength Training"].includes(activity);
};

/**
 * Determines whether an activity is a long run.
 * @param activity The daily activity.
 * @returns True if the activity is a long run.
 */
export const isLongRun = (activity: DailyActivity): boolean => {
  return ["Long Run"].includes(activity);
};

/**
 * Determines whether an activity is a rest day.
 * @param activity The daily activity.
 * @returns True if the activity is a rest day.
 */
export const isRestDay = (activity: DailyActivity): boolean => {
  return ["Full Rest"].includes(activity);
};
