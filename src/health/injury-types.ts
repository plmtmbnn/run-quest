// injury-types.ts
// Core injury types and health state definitions for the Injury & Health Management System.

/**
 * Injury types categorized by severity and body part affected.
 */
export type InjuryType =
  | "muscle_soreness"
  | "blisters"
  | "minor_strain"
  | "muscle_pull"
  | "shin_splints"
  | "runners_knee"
  | "joint_pain"
  | "stress_fracture"
  | "ligament_strain"
  | "tendon_injury"
  | "fracture"
  | "torn_ligament"
  | "chronic_condition";

/**
 * Injury severity levels with corresponding effects.
 */
export type InjurySeverity = "minor" | "moderate" | "major" | "critical";

/**
 * A single injury affecting the runner.
 */
export interface Injury {
  id: string;
  type: InjuryType;
  severity: InjurySeverity;
  daysToRecover: number;
  daysElapsed: number;
  acquiredOnDay: number;
  performanceImpact: number; // Multiplier: 0.8 = -20% performance, 0.6 = -40%, etc.
  canTrain: boolean;
  canRace: boolean;
  description: string;
  treatment: string;
  isTreated: boolean;
  treatmentType?: string;
}

/**
 * Health state tracking the runner's overall condition.
 */
export interface HealthState {
  currentInjuries: Injury[];
  injuryHistory: Injury[];
  overtrainLevel: number; // 0-100, higher = more injury risk
  fatigueLevel: number; // 0-100, affects recovery speed
  consecutiveTrainingDays: number;
  totalRestDays: number;
  lastInjuryDay: number | null;
  lastRestDay: number | null;
}

/**
 * Default health state for a new runner.
 */
export const DEFAULT_HEALTH_STATE: HealthState = {
  currentInjuries: [],
  injuryHistory: [],
  overtrainLevel: 0,
  fatigueLevel: 0,
  consecutiveTrainingDays: 0,
  totalRestDays: 0,
  lastInjuryDay: null,
  lastRestDay: null,
};

/**
 * Injury definitions with their properties.
 */
export interface InjuryDefinition {
  type: InjuryType;
  severity: InjurySeverity;
  baseRecoveryDays: number;
  performanceImpact: number;
  canTrain: boolean;
  canRace: boolean;
  description: string;
  treatment: string;
  riskWeight: number; // Relative likelihood of this injury occurring
}

/**
 * Injury definitions organized by severity.
 */
export const INJURY_DEFINITIONS: Record<InjurySeverity, InjuryDefinition[]> = {
  minor: [
    {
      type: "muscle_soreness",
      severity: "minor",
      baseRecoveryDays: 2,
      performanceImpact: 0.8, // -20% performance
      canTrain: true,
      canRace: true,
      description: "General muscle soreness from increased training intensity",
      treatment: "Rest, light stretching, and proper hydration",
      riskWeight: 30,
    },
    {
      type: "blisters",
      severity: "minor",
      baseRecoveryDays: 1,
      performanceImpact: 0.85, // -15% performance
      canTrain: true,
      canRace: true,
      description: "Foot blisters from friction with new or improper shoes",
      treatment:
        "Proper foot care, moisture-wicking socks, and well-fitted shoes",
      riskWeight: 25,
    },
    {
      type: "minor_strain",
      severity: "minor",
      baseRecoveryDays: 3,
      performanceImpact: 0.8, // -20% performance
      canTrain: true,
      canRace: true,
      description: "Minor muscle strain from inadequate warmup or cool-down",
      treatment: "Rest, ice, compression, and elevation (RICE)",
      riskWeight: 20,
    },
  ],

  moderate: [
    {
      type: "muscle_pull",
      severity: "moderate",
      baseRecoveryDays: 7,
      performanceImpact: 0.6, // -40% performance
      canTrain: false,
      canRace: false,
      description: "Muscle pull from overexertion during training or racing",
      treatment: "Rest, physiotherapy, and gradual return to activity",
      riskWeight: 25,
    },
    {
      type: "shin_splints",
      severity: "moderate",
      baseRecoveryDays: 8,
      performanceImpact: 0.6, // -40% performance
      canTrain: false,
      canRace: false,
      description:
        "Pain along the shinbone from overtraining or sudden intensity increases",
      treatment: "Rest, ice, proper footwear, and strength exercises",
      riskWeight: 30,
    },
    {
      type: "runners_knee",
      severity: "moderate",
      baseRecoveryDays: 10,
      performanceImpact: 0.6, // -40% performance
      canTrain: false,
      canRace: false,
      description:
        "Patellofemoral pain syndrome from high mileage without adequate rest",
      treatment: "Rest, knee strengthening exercises, and proper running form",
      riskWeight: 25,
    },
    {
      type: "joint_pain",
      severity: "moderate",
      baseRecoveryDays: 6,
      performanceImpact: 0.6, // -40% performance
      canTrain: false,
      canRace: false,
      description: "General joint pain from impact accumulation over time",
      treatment:
        "Rest, anti-inflammatory medication, and low-impact cross-training",
      riskWeight: 20,
    },
  ],

  major: [
    {
      type: "stress_fracture",
      severity: "major",
      baseRecoveryDays: 21,
      performanceImpact: 0.4, // -60% performance
      canTrain: false,
      canRace: false,
      description:
        "Stress fracture from severe overtraining without proper recovery",
      treatment:
        "Complete rest, medical evaluation, and gradual return under supervision",
      riskWeight: 20,
    },
    {
      type: "ligament_strain",
      severity: "major",
      baseRecoveryDays: 28,
      performanceImpact: 0.4, // -60% performance
      canTrain: false,
      canRace: false,
      description: "Ligament strain from acute overexertion during a race",
      treatment: "Rest, physiotherapy, and medical evaluation",
      riskWeight: 25,
    },
    {
      type: "tendon_injury",
      severity: "major",
      baseRecoveryDays: 21,
      performanceImpact: 0.4, // -60% performance
      canTrain: false,
      canRace: false,
      description: "Tendon injury from chronic overload and repetitive stress",
      treatment: "Rest, eccentric strengthening, and medical treatment",
      riskWeight: 20,
    },
  ],

  critical: [
    {
      type: "fracture",
      severity: "critical",
      baseRecoveryDays: 60,
      performanceImpact: 0.0, // Cannot perform at all
      canTrain: false,
      canRace: false,
      description:
        "Bone fracture from severe race incident or extreme overexertion",
      treatment: "Medical intervention, casting, and extensive rehabilitation",
      riskWeight: 15,
    },
    {
      type: "torn_ligament",
      severity: "critical",
      baseRecoveryDays: 90,
      performanceImpact: 0.0, // Cannot perform at all
      canTrain: false,
      canRace: false,
      description: "Complete ligament tear requiring surgical intervention",
      treatment:
        "Surgery, extensive rehabilitation, and gradual return to sport",
      riskWeight: 20,
    },
    {
      type: "chronic_condition",
      severity: "critical",
      baseRecoveryDays: 45,
      performanceImpact: 0.2, // Severely limited performance
      canTrain: false,
      canRace: false,
      description:
        "Chronic condition developed from ignoring previous injuries",
      treatment:
        "Long-term medical treatment, lifestyle changes, and careful management",
      riskWeight: 15,
    },
  ],
};

/**
 * Get injury definition by type.
 */
export function getInjuryDefinition(type: InjuryType): InjuryDefinition | null {
  for (const severity of Object.keys(INJURY_DEFINITIONS) as InjurySeverity[]) {
    const injuryDef = INJURY_DEFINITIONS[severity].find(
      (def) => def.type === type,
    );
    if (injuryDef) {
      return injuryDef;
    }
  }
  return null;
}

/**
 * Get all injury definitions as a flat array.
 */
export function getAllInjuryDefinitions(): InjuryDefinition[] {
  const allDefinitions: InjuryDefinition[] = [];
  for (const severity of Object.keys(INJURY_DEFINITIONS) as InjurySeverity[]) {
    allDefinitions.push(...INJURY_DEFINITIONS[severity]);
  }
  return allDefinitions;
}

/**
 * Get injury definitions for a specific severity.
 */
export function getInjuryDefinitionsBySeverity(
  severity: InjurySeverity,
): InjuryDefinition[] {
  return INJURY_DEFINITIONS[severity] || [];
}
