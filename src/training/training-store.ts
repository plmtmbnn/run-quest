// training-store.ts
// State management and persistence for the Training & Recovery System.

import { useEffect, useState } from "react";
import type { TrainingState } from "./training-types";
import { DEFAULT_TRAINING_STATE } from "./training-types";

const TRAINING_STORAGE_KEY = "trainingState";

/**
 * Loads the training state from local storage.
 * @returns The training state, or the default state if not found.
 */
export const loadTrainingState = (): TrainingState => {
  try {
    const storedState = localStorage.getItem(TRAINING_STORAGE_KEY);
    if (storedState) {
      return JSON.parse(storedState) as TrainingState;
    }
  } catch (error) {
    console.error("Failed to load training state from local storage:", error);
  }
  return DEFAULT_TRAINING_STATE;
};

/**
 * Saves the training state to local storage.
 * @param state The training state to save.
 */
export const saveTrainingState = (state: TrainingState): void => {
  try {
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save training state to local storage:", error);
  }
};

/**
 * Custom hook for managing the training state.
 * @returns The current training state and a function to update it.
 */
export const useTrainingStore = () => {
  const [trainingState, setTrainingState] = useState<TrainingState>(
    DEFAULT_TRAINING_STATE,
  );

  // Load the training state from local storage on mount.
  useEffect(() => {
    const storedState = loadTrainingState();
    setTrainingState(storedState);
  }, []);

  // Save the training state to local storage whenever it changes.
  useEffect(() => {
    saveTrainingState(trainingState);
  }, [trainingState]);

  return {
    trainingState,
    setTrainingState,
  };
};

/**
 * Gets the current training state.
 * @returns The current training state.
 */
export const getTrainingState = (): TrainingState => {
  return loadTrainingState();
};

/**
 * Updates the training state.
 * @param state The new training state.
 */
export const setTrainingState = (state: TrainingState): void => {
  saveTrainingState(state);
};
