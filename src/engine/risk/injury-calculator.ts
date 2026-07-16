/**
 * Injury Probability Calculator (Sprint 24)
 * 
 * Calculates injury risk based on training load, race frequency,
 * breaking points, equipment condition, and random factors.
 */

import type { GameState } from "../timeline/time-types";
import type { InjuryState, InjuryType, RiskFactors } from "./injury-types";
import { INJURY_TEMPLATES } from "./injury-database";

/**
 * Calculate current risk factors for the runner.
 */
export function calculateRiskFactors(
  gameState: GameState,
  injuryState: InjuryState,
): RiskFactors {
  const { dayIndex, stats, flags } = gameState;
  const { recentRaceDays, recentTrainingDays, recentBreakingPoints, config } =
    injuryState;

  // Training load: based on recent training frequency (last 14 days)
  const recentTraining = recentTrainingDays.filter(
    (day) => dayIndex - day <= 14
  ).length;
  const trainingLoad = Math.min(1.0, recentTraining / 10); // 10+ sessions = max load

  // Race frequency: races in last 7 days
  const recentRaces = recentRaceDays.filter((day) => dayIndex - day <= 7).length;
  const raceFrequency = Math.min(1.0, recentRaces / 3); // 3+ races/week = max

  // Equipment condition: based on equipped shoes durability (if available)
  let equipmentCondition = 1.0;
  if (flags.shoeDurability && typeof flags.shoeDurability === "number") {
    equipmentCondition = flags.shoeDurability / 100; // normalized 0-1
  }

  // Random factor: 5-10%
  const seed = gameState.seed + dayIndex;
  const randomFactor = 0.05 + (((seed * 9301 + 49297) % 233280) / 233280) * 0.05;

  return {
    trainingLoad,
    raceFrequency,
    recentBreakingPoints,
    equipmentCondition,
    randomFactor,
  };
}

/**
 * Calculate injury probability for an upcoming race.
 * Returns a probability between 0 and 1.
 */
export function calculateInjuryProbability(
  riskFactors: RiskFactors,
  injuryState: InjuryState,
): number {
  const config = injuryState.config;

  if (!config.injuriesEnabled) return 0;

  let probability = config.baseRiskPerRace;

  // Training load multiplier
  if (riskFactors.trainingLoad > 0.7) {
    probability *= config.overtrainingMultiplier;
  }

  // Race frequency multiplier
  if (riskFactors.raceFrequency > 0.5) {
    probability *= config.fatigueMultiplier;
  }

  // Breaking points multiplier
  probability *= Math.pow(
    config.breakingPointMultiplier,
    riskFactors.recentBreakingPoints
  );

  // Equipment multiplier
  if (riskFactors.equipmentCondition < 0.3) {
    probability *= config.equipmentMultiplier;
  }

  // Add random factor
  probability += riskFactors.randomFactor;

  // Cap at reasonable maximum (40%)
  return Math.min(0.4, probability);
}

/**
 * Determine if an injury should occur based on calculated probability.
 */
export function shouldCauseInjury(
  probability: number,
  randomSeed: number,
): boolean {
  const roll = ((randomSeed * 9301 + 49297) % 233280) / 233280;
  return roll < probability;
}

/**
 * Select which type of injury occurs (weighted by training patterns).
 */
export function selectInjuryType(
  riskFactors: RiskFactors,
  randomSeed: number,
): InjuryType {
  // Weighted distribution based on risk factors
  let weights: Record<InjuryType, number> = {
    minor_pain: 40, // Most common
    muscle_strain: 30,
    tendinitis: 15,
    fatigue_syndrome: 10,
    stress_fracture: 5, // Rarest but most serious
  };

  // Adjust weights based on risk factors
  if (riskFactors.trainingLoad > 0.8) {
    weights.fatigue_syndrome *= 2;
  }

  if (riskFactors.raceFrequency > 0.7) {
    weights.tendinitis *= 1.5;
    weights.stress_fracture *= 1.5;
  }

  if (riskFactors.recentBreakingPoints > 2) {
    weights.muscle_strain *= 2;
  }

  if (riskFactors.equipmentCondition < 0.3) {
    weights.stress_fracture *= 2;
  }

  // Select based on weighted random
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const roll = ((randomSeed * 9301 + 49297) % 233280) / 233280;
  const target = roll * totalWeight;

  let cumulative = 0;
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (target < cumulative) {
      return type as InjuryType;
    }
  }

  return "minor_pain"; // Fallback
}

/**
 * Get a risk level description for UI display.
 */
export function getRiskLevelDescription(probability: number): {
  level: "low" | "moderate" | "high" | "extreme";
  label: string;
  color: string;
} {
  if (probability < 0.1) {
    return { level: "low", label: "Low Risk", color: "text-green-500" };
  }
  if (probability < 0.2) {
    return { level: "moderate", label: "Moderate Risk", color: "text-yellow-500" };
  }
  if (probability < 0.3) {
    return { level: "high", label: "High Risk", color: "text-orange-500" };
  }
  return { level: "extreme", label: "Extreme Risk", color: "text-red-500" };
}

/**
 * Get warnings to display before a risky race.
 */
export function getRaceWarnings(
  riskFactors: RiskFactors,
  injuryState: InjuryState,
): string[] {
  const warnings: string[] = [];

  if (injuryState.activeInjuries.length > 0) {
    warnings.push(
      `⚠️ You have ${injuryState.activeInjuries.length} active injury/injuries - racing may worsen them`
    );
  }

  if (riskFactors.trainingLoad > 0.7) {
    warnings.push("⚠️ Heavy training load - your body needs rest");
  }

  if (riskFactors.raceFrequency > 0.6) {
    warnings.push("⚠️ Racing frequently - insufficient recovery time");
  }

  if (riskFactors.recentBreakingPoints > 2) {
    warnings.push(
      "⚠️ Multiple breaking points pushed recently - high injury risk"
    );
  }

  if (riskFactors.equipmentCondition < 0.3) {
    warnings.push("⚠️ Worn equipment - consider replacing shoes");
  }

  return warnings;
}
