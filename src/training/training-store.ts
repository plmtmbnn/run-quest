// training-store.ts
// State management and persistence for the Training & Recovery System.

import { useEffect } from "react";
import { create } from "zustand";
import type { TrainingState } from "./training-types";
import { DEFAULT_TRAINING_STATE } from "./training-types";

const TRAINING_STORAGE_KEY = "trainingState";

interface TrainingStoreState {
  trainingState: TrainingState;
  setTrainingState: (state: TrainingState) => void;
}

const useGlobalTrainingStore = create<TrainingStoreState>((set) => ({
  trainingState: {
    trainingHistory: [],
    weeklyBalance: {
      easySessions: 0,
      hardSessions: 0,
      recoverySessions: 0,
      strengthSessions: 0,
      longRuns: 0,
      restDays: 0,
    },
    adaptationQueue: [],
    lastUpdated: 0,
  },
  setTrainingState: (state) => set({ trainingState: state }),
}));

/**
 * Loads the training state from local storage.
 * @returns The training state, or the default state if not found.
 */
export const loadTrainingState = (): TrainingState => {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const storedState = localStorage.getItem(TRAINING_STORAGE_KEY);
      if (storedState) {
        return JSON.parse(storedState) as TrainingState;
      }
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
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error("Failed to save training state to local storage:", error);
  }
  useGlobalTrainingStore.getState().setTrainingState(state);
};

/**
 * Custom hook for managing the training state.
 * @returns The current training state and a function to update it.
 */
export const useTrainingStore = () => {
  const trainingState = useGlobalTrainingStore((s) => s.trainingState);

  // Load the training state from local storage on mount.
  useEffect(() => {
    const storedState = loadTrainingState();
    useGlobalTrainingStore.getState().setTrainingState(storedState);
  }, []);

  return {
    trainingState,
    setTrainingState: saveTrainingState,
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
