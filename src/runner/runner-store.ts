// runner-store.ts
// State management and persistence for the Runner Profile.

import { useCallback, useEffect, useState } from "react";
import { loadRunnerState, saveRunnerState } from "./runner-persistence";
import { DEFAULT_RUNNER_STATE, type RunnerState } from "./runner-types";

/**
 * Custom hook for managing the Runner Profile state.
 * @returns The current RunnerState and a function to update it.
 */
export const useRunnerStore = () => {
  const [runnerState, setRunnerStateInternal] =
    useState<RunnerState>(DEFAULT_RUNNER_STATE);

  // Load the runner state from local storage on mount and listen for external updates.
  useEffect(() => {
    setRunnerStateInternal(loadRunnerState());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RunnerState>;
      if (customEvent.detail) {
        setRunnerStateInternal(customEvent.detail);
      } else {
        setRunnerStateInternal(loadRunnerState());
      }
    };

    window.addEventListener("runner-state-updated", handleUpdate);
    return () => {
      window.removeEventListener("runner-state-updated", handleUpdate);
    };
  }, []);

  const setRunnerState = useCallback((state: RunnerState) => {
    saveRunnerState(state);
    setRunnerStateInternal(state);
  }, []);

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
