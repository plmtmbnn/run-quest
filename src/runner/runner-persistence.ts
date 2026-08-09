// runner-persistence.ts
// Handles local storage operations for persisting the Runner Profile.

import {
  DEFAULT_RUNNER_STATE,
  type RunnerProfile,
  type RunnerState,
} from "./runner-types";

import { storageRepository } from "@/storage/storage-repository";
import { resetXPTracker } from "./xp-tracker";

const RUNNER_STORAGE_KEY = "runquest.runner";
const OLD_RUNNER_STORAGE_KEY = "runnerProfile"; // Legacy key for migration

let inMemoryRunnerState: RunnerState | null = null;

/**
 * Loads the Runner Profile from local storage with backward compatibility.
 * @returns The RunnerState, or the default state if not found.
 */
export const loadRunnerState = (): RunnerState => {
  try {
    // Try new key first
    const storedState = storageRepository.loadCustom<RunnerState>(RUNNER_STORAGE_KEY);
    if (storedState) {
      inMemoryRunnerState = storedState;
      return storedState;
    }

    // Migration: Check old key if new key doesn't exist
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const legacyData = localStorage.getItem(OLD_RUNNER_STORAGE_KEY);
      if (legacyData) {
        try {
          const parsed = JSON.parse(legacyData) as RunnerState;
          // Migrate to new key
          saveRunnerState(parsed);
          // Remove old key
          localStorage.removeItem(OLD_RUNNER_STORAGE_KEY);
          inMemoryRunnerState = parsed;
          return parsed;
        } catch (e) {
          console.error("Failed to migrate legacy runner data:", e);
        }
      }
    }
  } catch (error) {
    console.error("Failed to load runner state from local storage:", error);
  }
  return inMemoryRunnerState || DEFAULT_RUNNER_STATE;
};

/**
 * Saves the Runner Profile to local storage.
 * @param state The RunnerState to save.
 */
export const saveRunnerState = (state: RunnerState): void => {
  inMemoryRunnerState = state;
  try {
    storageRepository.saveCustom(RUNNER_STORAGE_KEY, state);
    window.dispatchEvent(
      new CustomEvent("runner-state-updated", { detail: state })
    );
  } catch (error) {
    console.error("Failed to save runner state to local storage:", error);
  }
};

/**
 * Resets the Runner Profile to default values.
 */
export const resetRunnerState = (): void => {
  saveRunnerState(DEFAULT_RUNNER_STATE);
  resetXPTracker();
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
