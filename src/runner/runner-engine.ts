// runner-engine.ts
// Business logic and calculations for the Runner Profile.

import { loadRunnerState, saveRunnerState } from "./runner-persistence";
import type { RunnerProfile, RunnerState } from "./runner-types";

/**
 * Calculates the runner's Race Readiness based on Fitness, Fatigue, and other factors.
 * @param profile The RunnerProfile to calculate readiness for.
 * @returns The calculated Race Readiness value.
 */
export const calculateRaceReadiness = (profile: RunnerProfile): number => {
  // Readiness is influenced by Fitness, Fatigue, Consistency, and recent activity.
  // This is a simplified calculation for the foundation.
  const fitnessFactor = profile.currentFitness * 0.6;
  const fatigueFactor = profile.currentFatigue * -0.4;
  const consistencyFactor = profile.consistency * 0.2;

  // Ensure readiness is within a reasonable range (0-100).
  const readiness = Math.max(
    0,
    Math.min(100, 100 + fitnessFactor + fatigueFactor + consistencyFactor),
  );
  return Math.round(readiness);
};

/**
 * Updates the runner's Fitness after a race or training session.
 * @param profile The RunnerProfile to update.
 * @param distance The distance run in kilometers.
 * @param intensity The intensity of the session (0-1).
 */
export const updateFitness = (
  profile: RunnerProfile,
  distance: number,
  intensity: number,
): number => {
  // Fitness increases slowly based on distance and intensity.
  // This is a simplified model for the foundation.
  const fitnessGain = distance * intensity * 0.1;
  const newFitness = profile.currentFitness + fitnessGain;

  // Ensure fitness does not exceed reasonable bounds.
  return Math.min(100, Math.max(0, newFitness));
};

/**
 * Updates the runner's Fatigue after a race or training session.
 * @param profile The RunnerProfile to update.
 * @param distance The distance run in kilometers.
 * @param intensity The intensity of the session (0-1).
 */
export const updateFatigue = (
  profile: RunnerProfile,
  distance: number,
  intensity: number,
): number => {
  // Fatigue increases based on distance and intensity.
  // This is a simplified model for the foundation.
  const fatigueGain = distance * intensity * 0.5;
  const newFatigue = profile.currentFatigue + fatigueGain;

  // Ensure fatigue does not exceed reasonable bounds.
  return Math.min(100, Math.max(0, newFatigue));
};

/**
 * Updates the runner's Consistency based on recent activity.
 * @param profile The RunnerProfile to update.
 * @param daysActive The number of days the runner has been active.
 */
export const updateConsistency = (
  profile: RunnerProfile,
  daysActive: number,
): number => {
  // Consistency increases with regular activity.
  // This is a simplified model for the foundation.
  const consistencyGain = daysActive * 0.5;
  const newConsistency = profile.consistency + consistencyGain;

  // Ensure consistency does not exceed reasonable bounds.
  return Math.min(100, Math.max(0, newConsistency));
};

/**
 * Updates the runner's profile after completing a race.
 * @param distance The distance run in kilometers.
 * @param time The time taken in seconds.
 * @param intensity The intensity of the race (0-1).
 */
/**
 * Awards XP to the runner profile and processes leveling up.
 * @param profile The RunnerProfile to award XP to.
 * @param xpGained The amount of XP gained.
 * @returns The updated RunnerProfile with new levels and skill points if leveled up.
 */
export const awardXP = (
  profile: RunnerProfile,
  xpGained: number,
): RunnerProfile => {
  let xp = profile.xp + xpGained;
  let level = profile.level;
  let skillPoints = profile.skillPoints;

  let xpNeeded = level * 100;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    skillPoints += 3; // Grant 3 skill points per level up
    xpNeeded = level * 100;
  }

  return {
    ...profile,
    level,
    xp,
    skillPoints,
  };
};

/**
 * Updates the runner's profile after completing a race.
 * @param distance The distance run in kilometers.
 * @param time The time taken in seconds.
 * @param intensity The intensity of the race (0-1).
 * @param xpGained The amount of XP gained from the race outcome.
 */
export const completeRace = (
  distance: number,
  time: number,
  intensity: number,
  xpGained?: number,
  coinsGained?: number,
): void => {
  const currentState = loadRunnerState();
  const profile = currentState.profile;

  // Update total runs, distance, and race time.
  let updatedProfile: RunnerProfile = {
    ...profile,
    totalRuns: profile.totalRuns + 1,
    totalDistance: profile.totalDistance + distance,
    totalRaceTime: profile.totalRaceTime + time,
    currentFitness: updateFitness(profile, distance, intensity),
    currentFatigue: updateFatigue(profile, distance, intensity),
    currentReadiness: 0, // Will be recalculated below.
  };

  // Recalculate Race Readiness.
  updatedProfile.currentReadiness = calculateRaceReadiness(updatedProfile);

  if (xpGained) {
    updatedProfile = awardXP(updatedProfile, xpGained);
  }

  if (coinsGained) {
    updatedProfile.coins = (updatedProfile.coins || 0) + coinsGained;
  }

  // Save the updated profile.
  const updatedState: RunnerState = {
    profile: updatedProfile,
    lastUpdated: new Date().toISOString(),
  };
  saveRunnerState(updatedState);
};

/**
 * Updates the runner's profile after a training day.
 * @param distance The distance run in kilometers.
 * @param intensity The intensity of the training (0-1).
 * @param isActive Whether the runner was active today.
 * @param xpGained The amount of XP gained from training.
 */
export const updateTrainingDay = (
  distance: number,
  intensity: number,
  isActive: boolean,
  xpGained?: number,
  coinsGained?: number,
): void => {
  const currentState = loadRunnerState();
  const profile = currentState.profile;

  // Update total training days if active.
  const totalTrainingDays = isActive
    ? profile.totalTrainingDays + 1
    : profile.totalTrainingDays;

  // Update Consistency.
  const daysActive = isActive ? 1 : 0;
  const consistency = updateConsistency(profile, daysActive);

  // Update Fitness and Fatigue if active.
  const currentFitness = isActive
    ? updateFitness(profile, distance, intensity)
    : profile.currentFitness;
  const currentFatigue = isActive
    ? updateFatigue(profile, distance, intensity)
    : profile.currentFatigue;

  let updatedProfile: RunnerProfile = {
    ...profile,
    totalTrainingDays,
    consistency,
    currentFitness,
    currentFatigue,
    currentReadiness: 0, // Will be recalculated below.
  };

  // Recalculate Race Readiness.
  updatedProfile.currentReadiness = calculateRaceReadiness(updatedProfile);

  if (xpGained) {
    updatedProfile = awardXP(updatedProfile, xpGained);
  }

  if (coinsGained) {
    updatedProfile.coins = (updatedProfile.coins || 0) + coinsGained;
  }

  // Save the updated profile.
  const updatedState: RunnerState = {
    profile: updatedProfile,
    lastUpdated: new Date().toISOString(),
  };
  saveRunnerState(updatedState);
};

/**
 * Advances the runner's week and season.
 */
export const advanceWeekAndSeason = (): void => {
  const currentState = loadRunnerState();
  const profile = currentState.profile;

  // Simplified logic for advancing week and season.
  const currentWeek = profile.currentWeek + 1;
  const currentSeason =
    currentWeek > 12 ? profile.currentSeason + 1 : profile.currentSeason;

  const updatedProfile: RunnerProfile = {
    ...profile,
    currentWeek: currentWeek > 12 ? 1 : currentWeek,
    currentSeason,
  };

  const updatedState: RunnerState = {
    profile: updatedProfile,
    lastUpdated: new Date().toISOString(),
  };
  saveRunnerState(updatedState);
};
