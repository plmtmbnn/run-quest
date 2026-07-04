// runner-store.ts
// State management and persistence for the Runner Profile.

import { useEffect, useState } from "react";
import { loadRunnerState, saveRunnerState } from "./runner-persistence";
import { DEFAULT_RUNNER_STATE, type RunnerState } from "./runner-types";

/**
 * Custom hook for managing the Runner Profile state.
 * @returns The current RunnerState and a function to update it.
 */
export const useRunnerStore = () => {
  const [runnerState, setRunnerState] =
    useState<RunnerState>(DEFAULT_RUNNER_STATE);

  // Load the runner state from local storage on mount.
  useEffect(() => {
    const storedState = loadRunnerState();
    setRunnerState(storedState);
  }, []);

  // Save the runner state to local storage whenever it changes.
  useEffect(() => {
    saveRunnerState(runnerState);
  }, [runnerState]);

  return {
    runnerState,
    setRunnerState,
  };
};

/**
 * Gets the current RunnerState.
 * @returns The current RunnerState.
 */
export const getRunnerState = (): RunnerState => {
  return loadRunnerState();
};

/**
 * Updates the RunnerState.
 * @param state The new RunnerState.
 */
export const setRunnerState = (state: RunnerState): void => {
  saveRunnerState(state);
};
