// training-types.ts
// TypeScript types for the Training & Recovery System.

/**
 * Represents the possible daily activities a runner can perform.
 */
export type DailyActivity =
  | "Recovery Run"
  | "Easy Run"
  | "Tempo Run"
  | "Interval Training"
  | "Long Run"
  | "Hill Repeats"
  | "Strength Training"
  | "Mobility Session"
  | "Full Rest";

/**
 * Represents the effect of a daily activity on the runner's metrics.
 */
export interface ActivityEffect {
  fitness: number; // Immediate or delayed fitness change
  fatigue: number; // Immediate fatigue change
  readiness: number; // Immediate readiness change
  adaptationDays?: number; // Days until fitness adaptation is applied
  stress: number; // Training stress (used for adaptation)
}

/**
 * Represents the training history for a single day.
 */
export interface TrainingDay {
  date: number; // dayIndex
  activity: DailyActivity;
  effect: ActivityEffect;
  adaptationApplied: boolean; // Whether delayed adaptation has been applied
}

/**
 * Represents the weekly training distribution.
 */
export interface WeeklyTrainingBalance {
  easySessions: number;
  hardSessions: number;
  recoverySessions: number;
  strengthSessions: number;
  longRuns: number;
  restDays: number;
}

/**
 * Represents the state of the training system.
 */
export interface TrainingState {
  trainingHistory: TrainingDay[];
  weeklyBalance: WeeklyTrainingBalance;
  adaptationQueue: Array<{
    date: number; // dayIndex
    fitnessGain: number;
  }>;
  lastUpdated: number; // dayIndex
}

/**
 * Represents the default state for a new training system.
 */
export const DEFAULT_TRAINING_STATE: TrainingState = {
  trainingHistory: [],
  weeklyBalance: {
    easySessions: 0,
    hardSessions: 0,
    recoverySessions: 0,
    strengthSessions: 0,
    longRuns: 0,
    restDays: 0,
  },
  adaptationQueue: [],
  lastUpdated: 0,
};

/**
 * Represents a coach recommendation for today's activity.
 */
export interface CoachRecommendation {
  recommendation: DailyActivity;
  message: string;
  reason: string;
}
