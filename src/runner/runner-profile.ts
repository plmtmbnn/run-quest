// runner-profile.ts
// Core Runner Profile logic and initialization.

import { calculateRaceReadiness } from "./runner-engine";
import {
  loadRunnerState,
  saveRunnerState,
  updateRunnerProfile,
} from "./runner-persistence";
import {
  DEFAULT_RUNNER_PROFILE,
  type RunnerProfile,
  type RunnerState,
} from "./runner-types";

/**
 * Initializes a new Runner Profile with default values.
 * @param displayName The name to assign to the runner.
 * @returns The initialized RunnerProfile.
 */
export const initializeRunnerProfile = (displayName: string): RunnerProfile => {
  const newProfile: RunnerProfile = {
    ...DEFAULT_RUNNER_PROFILE,
    id: crypto.randomUUID(),
    displayName,
    createdAt: new Date().toISOString(),
  };
  return newProfile;
};

/**
 * Initializes the RunnerState with a new or existing profile.
 * @param displayName The name to assign to the runner if creating a new profile.
 * @returns The initialized RunnerState.
 */
export const initializeRunnerState = (displayName: string): RunnerState => {
  const storedState = loadRunnerState();
  if (storedState.profile.id) {
    return storedState;
  }

  const newProfile = initializeRunnerProfile(displayName);
  const newState: RunnerState = {
    profile: newProfile,
    lastUpdated: new Date().toISOString(),
  };
  saveRunnerState(newState);
  return newState;
};

/**
 * Updates the runner's display name.
 * @param displayName The new display name.
 */
export const updateDisplayName = (displayName: string): void => {
  updateRunnerProfile("displayName", displayName);
};

/**
 * Updates the runner's preferred surface.
 * @param surface The preferred running surface.
 */
export const updatePreferredSurface = (surface: string): void => {
  updateRunnerProfile("preferredSurface", surface);
};

/**
 * Updates the runner's preferred distance.
 * @param distance The preferred race distance.
 */
export const updatePreferredDistance = (distance: string): void => {
  updateRunnerProfile("preferredDistance", distance);
};

/**
 * Updates the runner's preferred strategy.
 * @param strategy The preferred race strategy.
 */
export const updatePreferredStrategy = (strategy: string): void => {
  updateRunnerProfile("preferredStrategy", strategy);
};

/**
 * Gets the current RunnerProfile.
 * @returns The current RunnerProfile.
 */
export const getRunnerProfile = (): RunnerProfile => {
  const storedState = loadRunnerState();
  return storedState.profile;
};

/**
 * Gets the current Race Readiness value.
 * @returns The current Race Readiness value.
 */
export const getRaceReadiness = (): number => {
  const profile = getRunnerProfile();
  return calculateRaceReadiness(profile);
};
