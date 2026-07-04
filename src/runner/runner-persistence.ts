// runner-persistence.ts
// Handles local storage operations for persisting the Runner Profile.

import {
  DEFAULT_RUNNER_STATE,
  type RunnerProfile,
  type RunnerState,
} from "./runner-types";

const RUNNER_STORAGE_KEY = "runnerProfile";

/**
 * Loads the Runner Profile from local storage.
 * @returns The RunnerState, or the default state if not found.
 */
export const loadRunnerState = (): RunnerState => {
  try {
    const storedState = localStorage.getItem(RUNNER_STORAGE_KEY);
    if (storedState) {
      return JSON.parse(storedState) as RunnerState;
    }
  } catch (error) {
    console.error("Failed to load runner state from local storage:", error);
  }
  return DEFAULT_RUNNER_STATE;
};

/**
 * Saves the Runner Profile to local storage.
 * @param state The RunnerState to save.
 */
export const saveRunnerState = (state: RunnerState): void => {
  try {
    localStorage.setItem(RUNNER_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save runner state to local storage:", error);
  }
};

/**
 * Resets the Runner Profile to default values.
 */
export const resetRunnerState = (): void => {
  saveRunnerState(DEFAULT_RUNNER_STATE);
};

/**
 * Updates a specific field in the Runner Profile.
 * @param key The key of the field to update.
 * @param value The new value for the field.
 */
export const updateRunnerProfile = <K extends keyof RunnerProfile>(
  key: K,
  value: RunnerProfile[K],
): void => {
  const currentState = loadRunnerState();
  const updatedProfile = { ...currentState.profile, [key]: value };
  const updatedState = {
    ...currentState,
    profile: updatedProfile,
    lastUpdated: new Date().toISOString(),
  };
  saveRunnerState(updatedState);
};
