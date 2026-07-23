// adaptation-engine.ts
// Delayed adaptation logic for the Training & Recovery System.

import { loadRunnerState, saveRunnerState } from "@/runner/runner-persistence";
import { loadTrainingState, saveTrainingState } from "./training-store";

/**
 * Processes the adaptation queue and applies delayed fitness gains.
 */
export const processAdaptationQueue = (currentDayIndex: number): void => {
  const trainingState = loadTrainingState();
  const runnerState = loadRunnerState();
  const today = currentDayIndex;

  // Filter adaptations that are ready to be applied.
  const adaptationsToApply = trainingState.adaptationQueue.filter(
    (adaptation) => adaptation.date <= today,
  );

  if (adaptationsToApply.length === 0) {
    return;
  }

  // Apply each adaptation to the runner's fitness.
  let updatedFitness = runnerState.profile.currentFitness;
  adaptationsToApply.forEach((adaptation) => {
    updatedFitness += adaptation.fitnessGain;
  });

  // Update the runner's fitness.
  const updatedRunnerState = {
    ...runnerState,
    profile: {
      ...runnerState.profile,
      currentFitness: Math.min(100, Math.max(0, updatedFitness)),
    },
    lastUpdated: new Date().toISOString(), // Keeping save metadata
  };
  saveRunnerState(updatedRunnerState);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("runner-state-updated", { detail: updatedRunnerState })
    );
  }

  // Remove applied adaptations from the queue.
  const updatedAdaptationQueue = trainingState.adaptationQueue.filter(
    (adaptation) => adaptation.date > today,
  );

  const updatedTrainingState = {
    ...trainingState,
    adaptationQueue: updatedAdaptationQueue,
    lastUpdated: currentDayIndex,
  };
  saveTrainingState(updatedTrainingState);
};

/**
 * Adds a delayed adaptation to the queue.
 * @param fitnessGain The amount of fitness to gain after the delay.
 * @param adaptationDays The number of days until the adaptation is applied.
 */
export const queueAdaptation = (
  fitnessGain: number,
  adaptationDays: number,
  currentDayIndex: number,
): void => {
  const trainingState = loadTrainingState();
  const adaptationDate = currentDayIndex + adaptationDays;

  const updatedAdaptationQueue = [
    ...trainingState.adaptationQueue,
    {
      date: adaptationDate,
      fitnessGain,
    },
  ];

  const updatedTrainingState = {
    ...trainingState,
    adaptationQueue: updatedAdaptationQueue,
    lastUpdated: currentDayIndex,
  };
  saveTrainingState(updatedTrainingState);
};

/**
 * Checks if the adaptation queue has pending adaptations.
 * @returns True if there are pending adaptations.
 */
export const hasPendingAdaptations = (currentDayIndex: number): boolean => {
  const trainingState = loadTrainingState();
  const today = currentDayIndex;
  return trainingState.adaptationQueue.some(
    (adaptation) => adaptation.date <= today,
  );
};
