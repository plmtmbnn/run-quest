// race-injury-integration.ts
// Integration of injury system with race simulation.

import type { SimulationResult, SimulationState } from '@/types/engine';
import { useHealthStore } from './health-store';
import { calculateInjuryRisk, rollForInjury, createInjury, canRaceWithInjuries } from './injury-risk-engine';
import type { RunnerProfile } from '@/runner/runner-types';

/**
 * Race details for injury risk calculation.
 */
export interface RaceInjuryDetails {
  distance: number;
  raceTier: string;
  weatherCondition: string;
  isPushingPace: boolean;
  daysSinceLastRest: number;
  hasProperEquipment: boolean;
  hasGoodNutrition: boolean;
  didWarmup: boolean;
  isFollowingTrainingPlan: boolean;
  position: number; // Final race position (1 = win)
  isDNF: boolean; // Did not finish
}

/**
 * Check if runner can race based on current injuries.
 * @returns true if can race, false otherwise
 */
export function checkCanRace(): boolean {
  const healthStore = useHealthStore.getState();
  return canRaceWithInjuries(healthStore.healthState);
}

/**
 * Get performance modifier for race based on current injuries.
 * @returns Performance multiplier (1.0 = no effect, 0.8 = -20% performance, etc.)
 */
export function getRacePerformanceModifier(): number {
  const healthStore = useHealthStore.getState();
  return healthStore.getPerformanceModifier();
}

/**
 * Apply performance penalty to race simulation based on injuries.
 * @param runnerStats Original runner stats
 * @returns Modified stats with injury penalties applied
 */
export function applyInjuryPerformancePenalty(runnerStats: {
  speed?: number;
  stamina?: number;
  endurance?: number;
  [key: string]: any;
}): {
  speed: number;
  stamina: number;
  endurance: number;
  [key: string]: any;
} {
  const performanceModifier = getRacePerformanceModifier();
  
  if (performanceModifier >= 1.0) {
    // No penalty
    return {
      ...runnerStats,
      speed: runnerStats.speed || 0,
      stamina: runnerStats.stamina || 0,
      endurance: runnerStats.endurance || 0,
    };
  }

  return {
    ...runnerStats,
    speed: (runnerStats.speed || 0) * performanceModifier,
    stamina: (runnerStats.stamina || 0) * performanceModifier,
    endurance: (runnerStats.endurance || 0) * performanceModifier,
  };
}

/**
 * Check for injury after completing a race.
 * @param raceDetails Details about the completed race
 * @param runnerProfile Runner profile
 * @param dayIndex Current day index
 * @returns Injury that was sustained, or null if no injury
 */
export function checkForRaceInjury(
  raceDetails: RaceInjuryDetails,
  runnerProfile: RunnerProfile,
  dayIndex: number
): import('./injury-types').Injury | null {
  const healthStore = useHealthStore.getState();
  const healthState = healthStore.healthState;

  // Calculate injury risk based on race details
  const activityDetails = {
    type: 'racing' as const,
    distance: raceDetails.distance,
    raceTier: raceDetails.raceTier,
    weatherCondition: raceDetails.weatherCondition,
    isPushingPace: raceDetails.isPushingPace,
    daysSinceLastRest: raceDetails.daysSinceLastRest,
    hasProperEquipment: raceDetails.hasProperEquipment,
    hasGoodNutrition: raceDetails.hasGoodNutrition,
    didWarmup: raceDetails.didWarmup,
    isFollowingTrainingPlan: raceDetails.isFollowingTrainingPlan,
  };

  const injuryRisk = calculateInjuryRisk(healthState, runnerProfile, activityDetails);
  
  // Higher injury risk for races than training
  // Races are more intense, so multiply risk by 1.5
  const adjustedRisk = Math.min(95, injuryRisk.totalRisk * 1.5);
  
  // Even higher risk if pushing pace
  const finalRisk = raceDetails.isPushingPace 
    ? Math.min(95, adjustedRisk * 1.2) 
    : adjustedRisk;

  // Roll for injury
  const injuryResult = rollForInjury(finalRisk);
  
  if (injuryResult.injured) {
    const injury = createInjury(
      injuryResult.injuryType!,
      injuryResult.severity!,
      dayIndex
    );
    
    // Add injury to health state
    healthStore.addInjury(injury);
    healthStore.saveToStorage();
    
    return injury;
  }

  return null;
}

/**
 * Update health state after completing a race.
 * @param raceDetails Details about the completed race
 * @param dayIndex Current day index
 */
export function updateHealthAfterRace(
  raceDetails: RaceInjuryDetails,
  dayIndex: number
): void {
  const healthStore = useHealthStore.getState();

  // Increment consecutive training days (racing counts as activity)
  healthStore.incrementConsecutiveTrainingDays();
  
  // Update overtraining level based on race intensity
  // Races are more intense than training, so higher overtraining increase
  const overtrainDelta = Math.min(20, raceDetails.distance * 0.5); // Cap at +20
  healthStore.updateOvertrainLevel(overtrainDelta);
  
  // Update fatigue level based on race distance and intensity
  const fatigueDelta = Math.min(30, raceDetails.distance * 1.5); // Cap at +30
  healthStore.updateFatigueLevel(fatigueDelta);
  
  // If this was a very intense race (pushing pace), add extra fatigue
  if (raceDetails.isPushingPace) {
    healthStore.updateFatigueLevel(10);
  }
  
  healthStore.saveToStorage();
}

/**
 * Get race injury risk assessment for display to player.
 * @param raceDetails Details about the upcoming race
 * @param runnerProfile Runner profile
 * @returns Risk assessment with percentage and factors
 */
export function getRaceInjuryRiskAssessment(
  raceDetails: RaceInjuryDetails,
  runnerProfile: RunnerProfile
): {
  riskPercentage: number;
  riskFactors: string[];
  recommendations: string[];
} {
  const healthStore = useHealthStore.getState();
  const healthState = healthStore.healthState;

  const activityDetails = {
    type: 'racing' as const,
    distance: raceDetails.distance,
    raceTier: raceDetails.raceTier,
    weatherCondition: raceDetails.weatherCondition,
    isPushingPace: raceDetails.isPushingPace,
    daysSinceLastRest: raceDetails.daysSinceLastRest,
    hasProperEquipment: raceDetails.hasProperEquipment,
    hasGoodNutrition: raceDetails.hasGoodNutrition,
    didWarmup: raceDetails.didWarmup,
    isFollowingTrainingPlan: raceDetails.isFollowingTrainingPlan,
  };

  const injuryRisk = calculateInjuryRisk(healthState, runnerProfile, activityDetails);
  const finalRisk = raceDetails.isPushingPace 
    ? Math.min(95, injuryRisk.totalRisk * 1.5 * 1.2) 
    : Math.min(95, injuryRisk.totalRisk * 1.5);

  // Generate risk factors
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  if (healthState.overtrainLevel > 70) {
    riskFactors.push('High overtraining level');
    recommendations.push('Take rest days to reduce overtraining');
  }

  if (healthState.fatigueLevel > 70) {
    riskFactors.push('High fatigue level');
    recommendations.push('Get adequate rest and recovery');
  }

  if (healthState.consecutiveTrainingDays > 5) {
    riskFactors.push('Many consecutive training days');
    recommendations.push('Take a rest day to recover');
  }

  if (raceDetails.isPushingPace) {
    riskFactors.push('Pushing pace increases injury risk');
    recommendations.push('Consider a more conservative pacing strategy');
  }

  if (raceDetails.distance >= 21.1) {
    riskFactors.push('Long race distance');
    recommendations.push('Ensure proper preparation for long races');
  }

  if (raceDetails.weatherCondition !== 'ideal') {
    riskFactors.push('Non-ideal weather conditions');
    recommendations.push('Check weather and adjust strategy accordingly');
  }

  return {
    riskPercentage: Math.round(finalRisk),
    riskFactors,
    recommendations,
  };
}