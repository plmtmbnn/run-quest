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

// ═══════════════════════════════════════════════════════════════════════
// Sprint 30: Weekly Training Planner Types
// ═══════════════════════════════════════════════════════════════════════

/**
 * Represents a planned activity for a specific day in the weekly plan.
 */
export interface PlannedActivity {
  /** Absolute day index in the game timeline */
  dayIndex: number;
  /** Day of week (0 = Monday, 6 = Sunday) */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** The planned activity for this day */
  activity: DailyActivity;
  /** Whether this activity has been completed */
  isCompleted: boolean;
  /** The actual activity performed (if different from planned) */
  actualActivity?: DailyActivity;
  /** Timestamp when the activity was completed */
  completedAt?: number;
  /** Status of the activity */
  reason?: "completed" | "swapped" | "missed";
  /** Energy cost for this activity */
  energyCost: number;
}

/**
 * Represents a complete weekly training plan.
 */
export interface WeeklyPlan {
  /** Unique identifier for this plan */
  id: string;
  /** Day index of Monday (week start) */
  weekStartDay: number;
  /** Day index of Sunday (week end) */
  weekEndDay: number;
  /** Planned activities for the 7 days */
  plannedActivities: PlannedActivity[];
  /** Template used to generate this plan */
  templateUsed?: "beginner" | "base" | "performance" | "recovery" | "custom";
  /** Timestamp when plan was created */
  createdAt: number;
  /** Overall adherence rate (0-100) */
  adherenceRate?: number;
  /** Coach feedback messages for this plan */
  coachFeedback?: string[];
  /** Whether this plan is currently active */
  isActive: boolean;
}

/**
 * Represents a training plan template.
 */
export interface PlanTemplate {
  /** Unique template identifier */
  id: string;
  /** Display name of the template */
  name: string;
  /** Brief description of the template */
  description: string;
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** 7 daily activities (Monday to Sunday) */
  weeklyActivities: DailyActivity[];
  /** Minimum fitness level recommended */
  targetFitness: number;
  /** Maximum safe fatigue level */
  maxFatigue: number;
  /** Total weekly volume in kilometers */
  totalVolume: number;
  /** Icon/emoji for the template */
  icon: string;
}

/**
 * Validation result for a weekly plan.
 */
export interface PlanValidation {
  /** Whether the plan is safe and valid */
  isValid: boolean;
  /** Warning messages about potential issues */
  warnings: string[];
  /** Suggestions for improvement */
  suggestions: string[];
  /** Overall plan quality score (0-100) */
  score: number;
}

/**
 * Metrics tracking how well the player follows their plan.
 */
export interface AdherenceMetrics {
  /** Percentage of workouts completed as planned (0-100) */
  completionRate: number;
  /** Percentage of workouts that were substituted (0-100) */
  substitutionRate: number;
  /** Number of missed workouts */
  missedWorkouts: number;
  /** Total planned workouts */
  totalPlanned: number;
  /** Total completed workouts */
  totalCompleted: number;
}
