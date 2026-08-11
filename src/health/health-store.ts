// health-store.ts
// Zustand store for managing health state and injuries.

import { create } from "zustand";
import { storageRepository } from "@/storage/storage-repository";
import type { HealthState, Injury } from "./injury-types";
import { DEFAULT_HEALTH_STATE } from "./injury-types";

interface HealthStore {
  healthState: HealthState;

  // Injury management
  addInjury: (injury: Injury) => void;
  updateInjuryRecovery: (daysPassed: number) => void;
  removeInjury: (injuryId: string) => void;
  getActiveInjuries: () => Injury[];
  getMostSevereInjury: () => Injury | null;

  // Status checks
  canTrain: () => boolean;
  canRace: () => boolean;
  getPerformanceModifier: () => number;

  // Risk tracking
  incrementConsecutiveTrainingDays: () => void;
  resetConsecutiveTrainingDays: () => void;
  updateOvertrainLevel: (delta: number) => void;
  updateFatigueLevel: (delta: number) => void;
  addRestDay: () => void;

  // Treatment
  applyTreatment: (
    injuryId: string,
    treatmentType: string,
    recoverySpeedup: number,
  ) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  reset: () => void;
}

/**
 * Storage key for health state.
 */
const HEALTH_STORAGE_KEY = "runquest.health";

/**
 * Stored health state for persistence.
 */
interface StoredHealthState {
  version: number;
  healthState: HealthState;
}

/**
 * Load health state from storage.
 */
function loadHealthStateFromStorage(): HealthState | null {
  try {
    const stored =
      storageRepository.loadCustom<StoredHealthState>(HEALTH_STORAGE_KEY);
    if (stored && stored.version === 1) {
      return stored.healthState;
    }
  } catch {
    // Storage read failed, return null
  }
  return null;
}

/**
 * Save health state to storage.
 */
function saveHealthStateToStorage(healthState: HealthState): void {
  try {
    const stored: StoredHealthState = {
      version: 1,
      healthState,
    };
    storageRepository.saveCustom(HEALTH_STORAGE_KEY, stored);
  } catch {
    // Storage write failed, silently fail
    console.error("Failed to save health state to storage");
  }
}

/**
 * Check if the runner can train based on current injuries.
 */
function checkCanTrain(healthState: HealthState): boolean {
  if (healthState.currentInjuries.length === 0) {
    return true;
  }

  // If any injury prevents training, cannot train
  for (const injury of healthState.currentInjuries) {
    if (!injury.canTrain) {
      return false;
    }
  }

  return true;
}

/**
 * Check if the runner can race based on current injuries.
 */
function checkCanRace(healthState: HealthState): boolean {
  if (healthState.currentInjuries.length === 0) {
    return true;
  }

  // If any injury prevents racing, cannot race
  for (const injury of healthState.currentInjuries) {
    if (!injury.canRace) {
      return false;
    }
  }

  return true;
}

/**
 * Get the overall performance modifier from all current injuries.
 */
function calculatePerformanceModifier(healthState: HealthState): number {
  if (healthState.currentInjuries.length === 0) {
    return 1.0; // No performance impact
  }

  // Combine performance impacts multiplicatively
  let modifier = 1.0;
  for (const injury of healthState.currentInjuries) {
    modifier *= injury.performanceImpact;
  }

  // Ensure modifier is within reasonable bounds
  return Math.max(0.1, Math.min(1.0, modifier));
}

/**
 * Get the most severe current injury.
 */
function getMostSevereInjuryFromState(healthState: HealthState): Injury | null {
  if (healthState.currentInjuries.length === 0) {
    return null;
  }

  // Severity order: critical > major > moderate > minor
  const severityOrder: import("./injury-types").InjurySeverity[] = [
    "critical",
    "major",
    "moderate",
    "minor",
  ];

  for (const severity of severityOrder) {
    const severeInjury = healthState.currentInjuries.find(
      (injury) => injury.severity === severity,
    );
    if (severeInjury) {
      return severeInjury;
    }
  }

  return null;
}

export const useHealthStore = create<HealthStore>((set, get) => ({
  healthState: DEFAULT_HEALTH_STATE,

  // Initialize from storage
  loadFromStorage() {
    const storedState = loadHealthStateFromStorage();
    if (storedState) {
      set({ healthState: storedState });
    } else {
      // Initialize with default state
      set({ healthState: DEFAULT_HEALTH_STATE });
      saveHealthStateToStorage(DEFAULT_HEALTH_STATE);
    }
  },

  // Save current state to storage
  saveToStorage() {
    const { healthState } = get();
    saveHealthStateToStorage(healthState);
  },

  // Reset to default state
  reset() {
    set({ healthState: DEFAULT_HEALTH_STATE });
    saveHealthStateToStorage(DEFAULT_HEALTH_STATE);
  },

  // Injury management
  addInjury(injury) {
    set((state) => {
      const updatedState = {
        ...state.healthState,
        currentInjuries: [...state.healthState.currentInjuries, injury],
        injuryHistory: [...state.healthState.injuryHistory, injury],
        lastInjuryDay: injury.acquiredOnDay,
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },

  updateInjuryRecovery(daysPassed) {
    set((state) => {
      let updatedState = { ...state.healthState };
      let injuriesUpdated = false;

      // Update recovery progress for each injury
      const updatedInjuries = updatedState.currentInjuries
        .map((injury) => {
          const newDaysElapsed = injury.daysElapsed + daysPassed;

          if (newDaysElapsed >= injury.daysToRecover) {
            // Injury has healed
            injuriesUpdated = true;
            return null; // Will be filtered out
          }

          return {
            ...injury,
            daysElapsed: newDaysElapsed,
          };
        })
        .filter(Boolean) as Injury[];

      // Only update if there were changes
      if (
        injuriesUpdated ||
        updatedInjuries.length !== updatedState.currentInjuries.length
      ) {
        updatedState = {
          ...updatedState,
          currentInjuries: updatedInjuries,
        };
        saveHealthStateToStorage(updatedState);
      }

      return { healthState: updatedState };
    });
  },

  removeInjury(injuryId) {
    set((state) => {
      const updatedState = {
        ...state.healthState,
        currentInjuries: state.healthState.currentInjuries.filter(
          (injury) => injury.id !== injuryId,
        ),
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },

  getActiveInjuries() {
    return get().healthState.currentInjuries;
  },

  getMostSevereInjury() {
    return getMostSevereInjuryFromState(get().healthState);
  },

  // Status checks
  canTrain() {
    return checkCanTrain(get().healthState);
  },

  canRace() {
    return checkCanRace(get().healthState);
  },

  getPerformanceModifier() {
    return calculatePerformanceModifier(get().healthState);
  },

  // Risk tracking
  incrementConsecutiveTrainingDays() {
    set((state) => {
      const updatedState = {
        ...state.healthState,
        consecutiveTrainingDays: state.healthState.consecutiveTrainingDays + 1,
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },

  resetConsecutiveTrainingDays() {
    set((state) => {
      const updatedState = {
        ...state.healthState,
        consecutiveTrainingDays: 0,
        lastRestDay: state.healthState.lastRestDay ?? 0, // Keep existing if set
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },

  updateOvertrainLevel(delta) {
    set((state) => {
      const newOvertrainLevel = Math.max(
        0,
        Math.min(100, state.healthState.overtrainLevel + delta),
      );
      const updatedState = {
        ...state.healthState,
        overtrainLevel: newOvertrainLevel,
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },

  updateFatigueLevel(delta) {
    set((state) => {
      const newFatigueLevel = Math.max(
        0,
        Math.min(100, state.healthState.fatigueLevel + delta),
      );
      const updatedState = {
        ...state.healthState,
        fatigueLevel: newFatigueLevel,
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },

  addRestDay() {
    set((state) => {
      const dayIndex = state.healthState.lastRestDay
        ? state.healthState.lastRestDay + 1
        : 0;
      const updatedState = {
        ...state.healthState,
        totalRestDays: state.healthState.totalRestDays + 1,
        lastRestDay: dayIndex,
        consecutiveTrainingDays: 0, // Reset consecutive training days
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },

  // Treatment
  applyTreatment(injuryId, treatmentType, recoverySpeedup) {
    set((state) => {
      const updatedInjuries = state.healthState.currentInjuries.map(
        (injury) => {
          if (injury.id !== injuryId) {
            return injury;
          }

          // Apply treatment effect
          const newDaysToRecover = Math.max(
            1,
            Math.round(injury.daysToRecover * recoverySpeedup),
          );

          return {
            ...injury,
            daysToRecover: newDaysToRecover,
            isTreated: true,
            treatmentType,
          };
        },
      );

      const updatedState = {
        ...state.healthState,
        currentInjuries: updatedInjuries,
      };
      saveHealthStateToStorage(updatedState);
      return { healthState: updatedState };
    });
  },
}));

// Initialize the store on module load
// Note: This will be called when the store is first used
useHealthStore.getState().loadFromStorage();
