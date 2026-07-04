// runner-selectors.ts
// Derived state calculations for the Runner Profile.

import type { RunnerProfile } from "./runner-types";

/**
 * Calculates the runner's running streak based on total training days and consistency.
 * @param profile The RunnerProfile to calculate the streak for.
 * @returns The calculated running streak.
 */
export const calculateRunningStreak = (profile: RunnerProfile): number => {
  // Simplified calculation for the foundation.
  // Streak is influenced by consistency and recent activity.
  const streak = Math.floor(profile.consistency / 10);
  return Math.min(30, Math.max(0, streak)); // Cap at 30 days for now.
};

/**
 * Calculates the runner's lifetime distance in a human-readable format.
 * @param profile The RunnerProfile to calculate the distance for.
 * @returns The formatted distance string.
 */
export const calculateLifetimeDistance = (profile: RunnerProfile): string => {
  const distance = profile.totalDistance;
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)} km`;
  }
  return `${distance} km`;
};

/**
 * Calculates the runner's total race time in a human-readable format.
 * @param profile The RunnerProfile to calculate the time for.
 * @returns The formatted time string.
 */
export const calculateTotalRaceTime = (profile: RunnerProfile): string => {
  const totalSeconds = profile.totalRaceTime;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Determines the runner's readiness level based on Race Readiness.
 * @param profile The RunnerProfile to evaluate.
 * @returns A human-readable readiness level.
 */
export const getReadinessLevel = (profile: RunnerProfile): string => {
  const readiness = profile.currentReadiness;
  if (readiness >= 90) {
    return "Peak";
  } else if (readiness >= 70) {
    return "High";
  } else if (readiness >= 50) {
    return "Moderate";
  } else if (readiness >= 30) {
    return "Low";
  } else {
    return "Exhausted";
  }
};

/**
 * Determines the runner's fitness level based on current Fitness.
 * @param profile The RunnerProfile to evaluate.
 * @returns A human-readable fitness level.
 */
export const getFitnessLevel = (profile: RunnerProfile): string => {
  const fitness = profile.currentFitness;
  if (fitness >= 80) {
    return "Elite";
  } else if (fitness >= 60) {
    return "Advanced";
  } else if (fitness >= 40) {
    return "Intermediate";
  } else if (fitness >= 20) {
    return "Beginner";
  } else {
    return "Novice";
  }
};

/**
 * Determines the runner's fatigue level based on current Fatigue.
 * @param profile The RunnerProfile to evaluate.
 * @returns A human-readable fatigue level.
 */
export const getFatigueLevel = (profile: RunnerProfile): string => {
  const fatigue = profile.currentFatigue;
  if (fatigue >= 80) {
    return "Exhausted";
  } else if (fatigue >= 60) {
    return "High";
  } else if (fatigue >= 40) {
    return "Moderate";
  } else if (fatigue >= 20) {
    return "Low";
  } else {
    return "Fresh";
  }
};
