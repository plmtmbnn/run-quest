// coach-types.ts
// TypeScript types for the Coach Intelligence & Training Feedback system.

import type {
  DailyActivity,
  WeeklyTrainingBalance,
} from "@/training/training-types";
import type {
  ChoiceBehavior,
  Grade,
  Outcome,
  Preparation,
  SimulationState,
  Weather,
} from "@/types/engine";

// ---------------------------------------------------------------------------
// Telemetry — raw race data fed into the coach
// ---------------------------------------------------------------------------

/**
 * Derived telemetry extracted from a completed race simulation.
 * Every field here has a direct 1-to-1 mapping to simulation data.
 * The coach may ONLY make statements that are supported by this struct.
 */
export interface RaceTelemetry {
  /** Race distance in km. */
  distance: number;
  /** Finish time in seconds. 0 for DNS/DNF. */
  finishTime: number;
  /** Race outcome. */
  outcome: Outcome;
  /** Performance grade. */
  grade: Grade;
  /** Target finish time in seconds. */
  targetTime: number;
  /** Whether the player achieved the target time. */
  targetAchieved: boolean;
  /** Average pace in seconds per km. */
  averagePace: number;
  /** Standard deviation of per-km pace. Higher = more erratic. */
  paceVariability: number;
  /** First-half average pace in sec/km. */
  firstHalfPace: number;
  /** Second-half average pace in sec/km. */
  secondHalfPace: number;
  /** Was second half faster than first half (negative split)? */
  negativeSplit: boolean;
  /** Energy level at finish (0-100). Low = depleted. */
  finalEnergy: number;
  /** Hydration level at finish (0-100). Low = dehydrated. */
  finalHydration: number;
  /** Lowest hydration reached during race (0-100). */
  lowestHydration: number;
  /** Fatigue level at finish (0-100). */
  finalFatigue: number;
  /** Peak fatigue reached during race (0-100). */
  peakFatigue: number;
  /** Distribution of km spent in each risk band. */
  riskExposure: { low: number; medium: number; high: number };
  /** Distribution of decisions made by behavior type. */
  decisionProfile: Record<ChoiceBehavior, number>;
  /** The km at which hydration first dropped below 40. -1 if never. */
  firstDehydrationKm: number;
  /** Whether player attacked early (first half pace > final target pace * 0.95). */
  attackedEarly: boolean;
  /** Weather during the race. */
  weather: Weather;
  /** Temperature during the race (celsius). */
  temperature: number;
  /** Humidity (0-100). */
  humidity: number;
  /** Preparation choices made before race. */
  preparation: Preparation;
  /** Full km-by-km state snapshots. */
  stateLog: SimulationState[];
}

/**
 * Telemetry from a completed training session.
 */
export interface TrainingTelemetry {
  /** The activity performed. */
  activity: DailyActivity;
  /** Fatigue before the session. */
  fatigueBefore: number;
  /** Fatigue after the session. */
  fatigueAfter: number;
  /** Readiness before the session. */
  readinessBefore: number;
  /** Training stress score for this session. */
  stress: number;
  /** Consecutive hard sessions ending on this day (>= 2 = concern). */
  consecutiveHardDays: number;
  /** Whether this is the day before a scheduled race. */
  isPreRaceDay: boolean;
  /** Current weekly balance at time of session. */
  weeklyBalance: WeeklyTrainingBalance;
}

// ---------------------------------------------------------------------------
// Coach insight — structured output from rule evaluation
// ---------------------------------------------------------------------------

/**
 * The analysis categories the Coach may comment on.
 * A coach insight must belong to exactly one category.
 */
export type CoachCategory =
  | "pacing"
  | "heart_rate"
  | "hydration"
  | "nutrition"
  | "fatigue"
  | "recovery"
  | "environment"
  | "decision_making"
  | "risk"
  | "weekly_balance";

/**
 * How certain the Coach is about a recommendation.
 * Reflected in the hedging language of the feedback message.
 */
export type CoachConfidence = "high" | "medium" | "low";

/**
 * A structured insight produced by the rule evaluator.
 * This is the internal, presentation-agnostic form of coach output.
 */
export interface CoachInsight {
  /** Unique ID for this insight type (e.g. "pacing_first_half_excellent"). */
  id: string;
  /** The analysis category this insight belongs to. */
  category: CoachCategory;
  /** How confident the Coach is in this observation. */
  confidence: CoachConfidence;
  /**
   * Template key for the human-readable message.
   * Resolved by coach-feedback.ts into a final string.
   */
  messageKey: string;
  /**
   * Named variables interpolated into the message template.
   * All values must be derived from telemetry, never invented.
   */
  params: Record<string, string | number>;
  /**
   * Priority for display ordering. Higher = shown first.
   * Insights with the same priority are sorted by category.
   */
  priority: number;
  /**
   * Coach personality type to use for this insight.
   */
  coachType?: string;
}

// ---------------------------------------------------------------------------
// Feedback — assembled output delivered to the presentation layer
// ---------------------------------------------------------------------------

/**
 * A single resolved feedback message ready for display.
 */
export interface CoachFeedbackMessage {
  id: string;
  category: CoachCategory;
  confidence: CoachConfidence;
  /** Fully-resolved human-readable message. */
  message: string;
  priority: number;
}

/**
 * Complete post-race coaching report.
 */
export interface PostRaceFeedback {
  type: "race";
  /** Primary insight (highest priority). */
  primary: CoachFeedbackMessage;
  /** Supporting insights (up to 3). */
  secondary: CoachFeedbackMessage[];
  /** Optional training recommendation for tomorrow. */
  recommendation?: CoachFeedbackMessage;
  /**
   * Coach personality type used for this feedback.
   */
  coachType?: string;
}

/**
 * Complete post-training coaching report.
 */
export interface PostTrainingFeedback {
  type: "training";
  /** Primary insight (highest priority). */
  primary: CoachFeedbackMessage;
  /** Supporting insights (up to 2). */
  secondary: CoachFeedbackMessage[];
  /** Optional training recommendation for tomorrow. */
  recommendation?: CoachFeedbackMessage;
  /**
   * Coach personality type used for this feedback.
   */
  coachType?: string;
}

// ---------------------------------------------------------------------------
// Weekly Review
// ---------------------------------------------------------------------------

export type WeeklyMetricRating =
  | "Excellent"
  | "Optimal"
  | "Good"
  | "Needs Improvement"
  | "Poor"
  | "Improving"
  | "Stable";

export interface WeeklyReview {
  weekNumber: number;
  generatedAt: string; // ISO 8601
  metrics: {
    trainingLoad: WeeklyMetricRating;
    recovery: WeeklyMetricRating;
    consistency: WeeklyMetricRating;
    nutrition: WeeklyMetricRating;
    raceReadiness: WeeklyMetricRating;
  };
  /** 1–3 focus suggestions for next week. */
  suggestedFocus: string[];
  /** Raw observation keys that fed into this review. */
  observationIds: string[];
}

// ---------------------------------------------------------------------------
// Knowledge Discovery
// ---------------------------------------------------------------------------

/**
 * An educational milestone the player can unlock through repeated behavior.
 * Does NOT increase player stats.
 */
export interface KnowledgeDiscovery {
  id: string;
  /** Short descriptive name (e.g. "Heat Management"). */
  name: string;
  /** Plain-language explanation of what was learned. */
  description: string;
  /** How many qualifying events are required to unlock. */
  requiredEvidence: number;
  /** ISO timestamp when unlocked. Undefined if still locked. */
  unlockedAt?: string;
}

// ---------------------------------------------------------------------------
// Runner Tendencies
// ---------------------------------------------------------------------------

/**
 * A behavioral pattern observed across multiple races and sessions.
 * Tendencies remain hidden until confidence is sufficient.
 */
export interface RunnerTendency {
  id: string;
  /** Human-readable label (shown only when visible). */
  label: string;
  /** Valence: positive tendencies are strengths; negative are areas to improve. */
  valence: "positive" | "negative" | "neutral";
  /** Running count of supporting observations. */
  evidenceCount: number;
  /** Minimum evidence before this tendency is considered established. */
  requiredEvidence: number;
  /** Whether this tendency is visible to the player. */
  visible: boolean;
  /** ISO timestamp of last evidence update. */
  lastUpdatedAt: string;
}

// ---------------------------------------------------------------------------
// Coach Memory — persisted state for the coach domain
// ---------------------------------------------------------------------------

/**
 * The persistent state managed by coach-memory.ts.
 */
export interface CoachMemoryState {
  /** Weekly reviews, keyed by week number. */
  weeklyReviews: Record<number, WeeklyReview>;
  /** All post-race feedback records stored by date (YYYY-MM-DD). */
  raceFeedbackHistory: Record<string, PostRaceFeedback>;
  /** All post-training feedback records stored by date (YYYY-MM-DD). */
  trainingFeedbackHistory: Record<string, PostTrainingFeedback>;
  /** All knowledge discoveries (locked and unlocked). */
  knowledgeDiscoveries: Record<string, KnowledgeDiscovery>;
  /** All runner tendencies being tracked. */
  tendencies: Record<string, RunnerTendency>;
  /** Counts for knowledge discovery evidence accumulation. */
  evidenceCounts: Record<string, number>;
  /** ISO timestamp of last update. */
  lastUpdatedAt: string;
}

/**
 * Default state for a fresh coach memory.
 */
export const DEFAULT_COACH_MEMORY: CoachMemoryState = {
  weeklyReviews: {},
  raceFeedbackHistory: {},
  trainingFeedbackHistory: {},
  knowledgeDiscoveries: {},
  tendencies: {},
  evidenceCounts: {},
  lastUpdatedAt: new Date().toISOString(),
};
