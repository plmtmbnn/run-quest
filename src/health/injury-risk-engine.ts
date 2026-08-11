// injury-risk-engine.ts
// Core injury risk calculation and injury determination logic.

import type { RunnerProfile } from "@/runner/runner-types";
import type { TrainingActivity } from "@/training/training-types";
import type { InjurySeverity, InjuryType } from "./injury-types";
import {
  getAllInjuryDefinitions,
  getInjuryDefinitionsBySeverity,
  type HealthState,
} from "./injury-types";

/**
 * Risk factors affecting injury probability.
 */
export interface RiskFactors {
  baseRisk: number;
  trainingFactors: {
    consecutiveDays: number;
    weeklyVolume: number;
    intensitySpike: number;
    inadequateRecovery: number;
    lowFitness: number;
  };
  racingFactors?: {
    lengthVsFitness: number;
    weather: number;
    pushedPace: number;
    inadequatePrep: number;
    equipment: number;
  };
  preventionModifiers: {
    restDays: number;
    equipment: number;
    progression: number;
    nutrition: number;
    warmup: number;
  };
  totalRisk: number;
}

/**
 * Activity details for risk calculation.
 */
export interface ActivityDetails {
  type: "training" | "racing";
  distance?: number;
  intensity?: number;
  duration?: number;
  raceTier?: string;
  weatherCondition?: string;
  isPushingPace?: boolean;
  daysSinceLastRest?: number;
  hasProperEquipment?: boolean;
  hasGoodNutrition?: boolean;
  didWarmup?: boolean;
  isFollowingTrainingPlan?: boolean;
}

/**
 * Default risk factors.
 */
const DEFAULT_RISK_FACTORS: Omit<RiskFactors, "totalRisk"> = {
  baseRisk: 5, // Base 5% injury risk
  trainingFactors: {
    consecutiveDays: 0,
    weeklyVolume: 0,
    intensitySpike: 0,
    inadequateRecovery: 0,
    lowFitness: 0,
  },
  racingFactors: {
    lengthVsFitness: 0,
    weather: 0,
    pushedPace: 0,
    inadequatePrep: 0,
    equipment: 0,
  },
  preventionModifiers: {
    restDays: 0,
    equipment: 0,
    progression: 0,
    nutrition: 0,
    warmup: 0,
  },
};

/**
 * Risk thresholds for different severity levels.
 */
const SEVERITY_THRESHOLDS = {
  minor: 0.7, // 70% chance of minor injury when injury occurs
  moderate: 0.2, // 20% chance of moderate injury when injury occurs
  major: 0.08, // 8% chance of major injury when injury occurs
  critical: 0.02, // 2% chance of critical injury when injury occurs
};

/**
 * Calculate training-specific risk factors.
 */
function calculateTrainingRiskFactors(
  healthState: HealthState,
  runnerProfile: RunnerProfile,
  activityDetails: ActivityDetails,
): RiskFactors["trainingFactors"] {
  const factors: RiskFactors["trainingFactors"] = {
    consecutiveDays: 0,
    weeklyVolume: 0,
    intensitySpike: 0,
    inadequateRecovery: 0,
    lowFitness: 0,
  };

  // Consecutive training days risk
  if (healthState.consecutiveTrainingDays >= 5) {
    factors.consecutiveDays = 15; // +15% risk
  } else if (healthState.consecutiveTrainingDays >= 3) {
    factors.consecutiveDays = 10; // +10% risk
  }

  // Weekly volume risk (assuming >50km/week is high)
  // For now, we'll use a simplified approach based on consecutive days
  if (healthState.consecutiveTrainingDays >= 7) {
    factors.weeklyVolume = 10; // +10% risk for training every day
  }

  // Intensity spike risk
  if (activityDetails.intensity && activityDetails.intensity > 0.8) {
    factors.intensitySpike = 20; // +20% risk for high intensity
  } else if (activityDetails.intensity && activityDetails.intensity > 0.6) {
    factors.intensitySpike = 10; // +10% risk for moderate-high intensity
  }

  // Inadequate recovery risk
  const daysSinceLastRest =
    activityDetails.daysSinceLastRest ?? healthState.consecutiveTrainingDays;
  if (daysSinceLastRest >= 7) {
    factors.inadequateRecovery = 15; // +15% risk if no rest in past week
  } else if (daysSinceLastRest >= 4) {
    factors.inadequateRecovery = 10; // +10% risk if no rest in past 4 days
  }

  // Low fitness risk (training above current level)
  if (runnerProfile.currentFitness && runnerProfile.currentFitness < 50) {
    factors.lowFitness = 25; // +25% risk if fitness is low
  } else if (
    runnerProfile.currentFitness &&
    runnerProfile.currentFitness < 70
  ) {
    factors.lowFitness = 15; // +15% risk if fitness is moderate
  }

  return factors;
}

/**
 * Calculate racing-specific risk factors.
 */
function calculateRacingRiskFactors(
  healthState: HealthState,
  runnerProfile: RunnerProfile,
  activityDetails: ActivityDetails,
): RiskFactors["racingFactors"] {
  const factors: RiskFactors["racingFactors"] = {
    lengthVsFitness: 0,
    weather: 0,
    pushedPace: 0,
    inadequatePrep: 0,
    equipment: 0,
  };

  // Race length vs fitness risk
  if (activityDetails.distance) {
    // Simplified: longer races are riskier
    if (activityDetails.distance >= 42.2) {
      // Marathon distance
      factors.lengthVsFitness = 30; // +30% risk for marathon
    } else if (activityDetails.distance >= 21.1) {
      // Half marathon
      factors.lengthVsFitness = 20; // +20% risk for half marathon
    } else if (activityDetails.distance >= 10) {
      // 10K+
      factors.lengthVsFitness = 10; // +10% risk for 10K+
    }
  }

  // Weather conditions risk
  if (activityDetails.weatherCondition) {
    const extremeConditions = [
      "extreme_heat",
      "extreme_cold",
      "heavy_rain",
      "storm",
    ];
    if (extremeConditions.includes(activityDetails.weatherCondition)) {
      factors.weather = 15; // +15% risk for extreme weather
    } else if (activityDetails.weatherCondition !== "ideal") {
      factors.weather = 5; // +5% risk for non-ideal conditions
    }
  }

  // Pushed pace risk
  if (activityDetails.isPushingPace) {
    factors.pushedPace = 20; // +20% risk for going all-out
  }

  // Inadequate preparation risk
  const daysSinceLastRest =
    activityDetails.daysSinceLastRest ?? healthState.consecutiveTrainingDays;
  if (daysSinceLastRest && daysSinceLastRest < 3) {
    factors.inadequatePrep = 0; // Good prep
  } else if (daysSinceLastRest && daysSinceLastRest < 5) {
    factors.inadequatePrep = 10; // +10% risk for moderate prep
  } else {
    factors.inadequatePrep = 25; // +25% risk for inadequate prep
  }

  // Equipment mismatch risk
  if (!activityDetails.hasProperEquipment) {
    factors.equipment = 10; // +10% risk for wrong equipment
  }

  return factors;
}

/**
 * Calculate prevention modifiers that reduce injury risk.
 */
function calculatePreventionModifiers(
  healthState: HealthState,
  activityDetails: ActivityDetails,
): RiskFactors["preventionModifiers"] {
  const modifiers: RiskFactors["preventionModifiers"] = {
    restDays: 0,
    equipment: 0,
    progression: 0,
    nutrition: 0,
    warmup: 0,
  };

  // Rest days modifier
  if (healthState.totalRestDays > 0) {
    // -10% risk per rest day in past 7 days (capped at -30%)
    modifiers.restDays = Math.min(30, healthState.totalRestDays * 10);
  }

  // Proper equipment modifier
  if (activityDetails.hasProperEquipment) {
    modifiers.equipment = 15; // -15% risk for proper equipment
  }

  // Training progression modifier
  if (activityDetails.isFollowingTrainingPlan) {
    modifiers.progression = 20; // -20% risk for following training plan
  }

  // Good nutrition modifier
  if (activityDetails.hasGoodNutrition) {
    modifiers.nutrition = 10; // -10% risk for good nutrition
  }

  // Warmup modifier
  if (activityDetails.didWarmup) {
    modifiers.warmup = 15; // -15% risk for proper warmup
  }

  return modifiers;
}

/**
 * Calculate comprehensive injury risk for a given activity.
 * @param healthState Current health state of the runner
 * @param runnerProfile Runner profile with fitness levels
 * @param activityDetails Details about the planned activity
 * @returns Complete risk factors including total risk percentage
 */
export function calculateInjuryRisk(
  healthState: HealthState,
  runnerProfile: RunnerProfile,
  activityDetails: ActivityDetails,
): RiskFactors {
  const baseFactors = { ...DEFAULT_RISK_FACTORS };

  // Calculate activity-specific factors
  if (activityDetails.type === "training") {
    baseFactors.trainingFactors = calculateTrainingRiskFactors(
      healthState,
      runnerProfile,
      activityDetails,
    );
  } else {
    baseFactors.racingFactors = calculateRacingRiskFactors(
      healthState,
      runnerProfile,
      activityDetails,
    );
  }

  // Calculate prevention modifiers
  baseFactors.preventionModifiers = calculatePreventionModifiers(
    healthState,
    activityDetails,
  );

  // Calculate total risk
  const totalRisk = calculateTotalRisk(baseFactors, activityDetails.type);

  return {
    ...baseFactors,
    totalRisk,
  };
}

/**
 * Calculate the total injury risk percentage from all factors.
 */
function calculateTotalRisk(
  factors: Omit<RiskFactors, "totalRisk">,
  activityType: "training" | "racing",
): number {
  let totalRisk = factors.baseRisk;

  // Add training or racing factors
  if (activityType === "training") {
    totalRisk += factors.trainingFactors.consecutiveDays;
    totalRisk += factors.trainingFactors.weeklyVolume;
    totalRisk += factors.trainingFactors.intensitySpike;
    totalRisk += factors.trainingFactors.inadequateRecovery;
    totalRisk += factors.trainingFactors.lowFitness;
  } else {
    if (factors.racingFactors) {
      totalRisk += factors.racingFactors.lengthVsFitness;
      totalRisk += factors.racingFactors.weather;
      totalRisk += factors.racingFactors.pushedPace;
      totalRisk += factors.racingFactors.inadequatePrep;
      totalRisk += factors.racingFactors.equipment;
    }
  }

  // Subtract prevention modifiers
  totalRisk -= factors.preventionModifiers.restDays;
  totalRisk -= factors.preventionModifiers.equipment;
  totalRisk -= factors.preventionModifiers.progression;
  totalRisk -= factors.preventionModifiers.nutrition;
  totalRisk -= factors.preventionModifiers.warmup;

  // Ensure risk is within bounds (0-95%)
  return Math.max(0, Math.min(95, totalRisk));
}

/**
 * Roll for injury based on risk percentage.
 * @param riskPercentage The total injury risk percentage (0-100)
 * @returns Result of the injury roll
 */
export function rollForInjury(riskPercentage: number): {
  injured: boolean;
  injuryType: InjuryType | null;
  severity: InjurySeverity | null;
} {
  const risk = Math.random() * 100; // Random number between 0-100

  if (risk > riskPercentage) {
    // No injury
    return {
      injured: false,
      injuryType: null,
      severity: null,
    };
  }

  // Injury occurred! Determine severity and type
  const severityRoll = Math.random();
  let severity: InjurySeverity;

  if (severityRoll < SEVERITY_THRESHOLDS.critical) {
    severity = "critical";
  } else if (
    severityRoll <
    SEVERITY_THRESHOLDS.critical + SEVERITY_THRESHOLDS.major
  ) {
    severity = "major";
  } else if (
    severityRoll <
    SEVERITY_THRESHOLDS.critical +
      SEVERITY_THRESHOLDS.major +
      SEVERITY_THRESHOLDS.moderate
  ) {
    severity = "moderate";
  } else {
    severity = "minor";
  }

  // Get available injury types for this severity
  const availableInjuries = getInjuryDefinitionsBySeverity(severity);

  // Select a random injury type weighted by riskWeight
  const totalWeight = availableInjuries.reduce(
    (sum, injury) => sum + injury.riskWeight,
    0,
  );
  let weightRoll = Math.random() * totalWeight;

  let selectedInjury = availableInjuries[0]; // Default to first
  for (const injury of availableInjuries) {
    weightRoll -= injury.riskWeight;
    if (weightRoll <= 0) {
      selectedInjury = injury;
      break;
    }
  }

  return {
    injured: true,
    injuryType: selectedInjury.type,
    severity: selectedInjury.severity,
  };
}

/**
 * Create a new injury instance.
 * @param type The type of injury
 * @param severity The severity of injury
 * @param dayIndex The current day index when injury occurred
 * @returns A new Injury object
 */
export function createInjury(
  type: InjuryType,
  severity: InjurySeverity,
  dayIndex: number,
): import("./injury-types").Injury {
  const definition = getAllInjuryDefinitions().find(
    (def) => def.type === type && def.severity === severity,
  );

  if (!definition) {
    throw new Error(`Unknown injury type: ${type} with severity: ${severity}`);
  }

  // Add some randomness to recovery time (±20%)
  const recoveryVariation = 1 + (Math.random() * 0.4 - 0.2); // ±20%
  const daysToRecover = Math.round(
    definition.baseRecoveryDays * recoveryVariation,
  );

  return {
    id: `injury_${type}_${dayIndex}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    daysToRecover,
    daysElapsed: 0,
    acquiredOnDay: dayIndex,
    performanceImpact: definition.performanceImpact,
    canTrain: definition.canTrain,
    canRace: definition.canRace,
    description: definition.description,
    treatment: definition.treatment,
    isTreated: false,
    treatmentType: undefined,
  };
}

/**
 * Check if the runner can train based on current injuries.
 */
export function canTrainWithInjuries(healthState: HealthState): boolean {
  if (healthState.currentInjuries.length === 0) {
    return true;
  }

  // If any injury prevents training, cannot train
  for (const injury of healthState.currentInjuries) {
    if (!injury.canTrain) {
      return false;
    }
  }

  return true;
}

/**
 * Check if the runner can race based on current injuries.
 */
export function canRaceWithInjuries(healthState: HealthState): boolean {
  if (healthState.currentInjuries.length === 0) {
    return true;
  }

  // If any injury prevents racing, cannot race
  for (const injury of healthState.currentInjuries) {
    if (!injury.canRace) {
      return false;
    }
  }

  return true;
}

/**
 * Get the overall performance modifier from all current injuries.
 */
export function getPerformanceModifier(healthState: HealthState): number {
  if (healthState.currentInjuries.length === 0) {
    return 1.0; // No performance impact
  }

  // Combine performance impacts multiplicatively
  let modifier = 1.0;
  for (const injury of healthState.currentInjuries) {
    modifier *= injury.performanceImpact;
  }

  // Ensure modifier is within reasonable bounds
  return Math.max(0.1, Math.min(1.0, modifier));
}

/**
 * Get the most severe current injury.
 */
export function getMostSevereInjury(
  healthState: HealthState,
): import("./injury-types").Injury | null {
  if (healthState.currentInjuries.length === 0) {
    return null;
  }

  // Severity order: critical > major > moderate > minor
  const severityOrder: InjurySeverity[] = [
    "critical",
    "major",
    "moderate",
    "minor",
  ];

  for (const severity of severityOrder) {
    const severeInjury = healthState.currentInjuries.find(
      (injury) => injury.severity === severity,
    );
    if (severeInjury) {
      return severeInjury;
    }
  }

  return null;
}
