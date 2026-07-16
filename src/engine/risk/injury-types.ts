/**
 * Injury & Risk System Types (Sprint 24)
 * 
 * Defines injury mechanics, severity levels, and recovery systems.
 * Integrates with the timeline engine to add meaningful stakes to races.
 */

export type InjuryType =
  | "muscle_strain"
  | "stress_fracture"
  | "tendinitis"
  | "fatigue_syndrome"
  | "minor_pain";

export type InjurySeverity = "minor" | "moderate" | "severe";

export type AffectedAttribute = "speed" | "stamina" | "all";

export type TreatmentType = "rest" | "active_recovery" | "medical";

export interface Treatment {
  id: TreatmentType;
  label: string;
  cost: number; // in money
  daysReduced: number; // days off recovery time
  description: string;
}

/**
 * Represents an active injury on the runner.
 */
export interface Injury {
  id: string;
  type: InjuryType;
  severity: InjurySeverity;
  affectedAttribute: AffectedAttribute;
  /** Performance penalty as a percentage (0-1) */
  performancePenalty: number;
  /** Days remaining until full recovery */
  recoveryDaysRemaining: number;
  /** Original recovery time */
  recoveryDaysTotal: number;
  /** Chance of worsening if racing injured (0-1) */
  riskOfWorsening: number;
  /** Day index when injury occurred */
  acquiredOnDay: number;
  /** Available treatment options */
  treatmentOptions: Treatment[];
}

/**
 * Risk factors that contribute to injury probability.
 */
export interface RiskFactors {
  /** Training load indicator (0-1, higher = more risk) */
  trainingLoad: number;
  /** Race frequency indicator (0-1, higher = more risk) */
  raceFrequency: number;
  /** Recent breaking point pushes (count in last 7 days) */
  recentBreakingPoints: number;
  /** Equipment condition (0-1, lower = more risk) */
  equipmentCondition: number;
  /** Base random factor (5-10%) */
  randomFactor: number;
}

/**
 * Configuration for injury probability calculations.
 */
export interface InjuryRiskConfig {
  /** Base injury probability per race (3-8%) */
  baseRiskPerRace: number;
  /** Multiplier for overtraining (1.5x-3x) */
  overtrainingMultiplier: number;
  /** Multiplier for racing while fatigued (1.3x-2x) */
  fatigueMultiplier: number;
  /** Multiplier per breaking point in last 7 days (1.2x each) */
  breakingPointMultiplier: number;
  /** Multiplier for poor equipment (1.5x-2x) */
  equipmentMultiplier: number;
  /** Whether injuries are enabled (can be disabled in casual mode) */
  injuriesEnabled: boolean;
}

/**
 * State tracking for injury and risk management.
 */
export interface InjuryState {
  /** Currently active injuries */
  activeInjuries: Injury[];
  /** History of past injuries (for statistics) */
  injuryHistory: Array<{
    type: InjuryType;
    severity: InjurySeverity;
    dayAcquired: number;
    dayRecovered: number;
  }>;
  /** Last 10 race day indices for frequency tracking */
  recentRaceDays: number[];
  /** Last 10 training day indices for load tracking */
  recentTrainingDays: number[];
  /** Breaking points pushed in last 7 days */
  recentBreakingPoints: number;
  /** Configuration */
  config: InjuryRiskConfig;
}

/**
 * Default injury risk configuration.
 */
export const DEFAULT_INJURY_CONFIG: InjuryRiskConfig = {
  baseRiskPerRace: 0.05, // 5% base risk
  overtrainingMultiplier: 2.0,
  fatigueMultiplier: 1.5,
  breakingPointMultiplier: 1.2,
  equipmentMultiplier: 1.5,
  injuriesEnabled: true,
};

/**
 * Default injury state for new runners.
 */
export const DEFAULT_INJURY_STATE: InjuryState = {
  activeInjuries: [],
  injuryHistory: [],
  recentRaceDays: [],
  recentTrainingDays: [],
  recentBreakingPoints: 0,
  config: DEFAULT_INJURY_CONFIG,
};

/**
 * Treatment options available for injuries.
 */
export const TREATMENT_OPTIONS: Record<TreatmentType, Treatment> = {
  rest: {
    id: "rest",
    label: "Complete Rest",
    cost: 0,
    daysReduced: 0,
    description: "Natural recovery - no cost but takes full time",
  },
  active_recovery: {
    id: "active_recovery",
    label: "Active Recovery",
    cost: 50,
    daysReduced: 2,
    description: "Light training and stretching - reduces recovery by 2 days",
  },
  medical: {
    id: "medical",
    label: "Medical Treatment",
    cost: 200,
    daysReduced: 5,
    description: "Professional care - significantly reduces recovery time",
  },
};
