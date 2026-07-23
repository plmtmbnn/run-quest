// training-store.ts
// State management and persistence for the Training & Recovery System.

import { useEffect } from "react";
import { create } from "zustand";
import type { TrainingState, WeeklyPlan, DailyActivity } from "./training-types";
import { DEFAULT_TRAINING_STATE } from "./training-types";
import type { RunnerState } from "../runner/runner-types";
import type { RaceOccurrence } from "../scheduling/race-calendar-types";
import {
  generateWeeklyPlan,
  completeActivity as completeActivityInPlan,
  swapActivity as swapActivityInPlan,
  calculateAdherence,
  getTodaysPlannedActivity,
} from "./weekly-plan-engine";

const TRAINING_STORAGE_KEY = "trainingState";
const WEEKLY_PLAN_STORAGE_KEY = "weeklyPlan";
const PLAN_HISTORY_STORAGE_KEY = "planHistory";

interface TrainingStoreState {
  trainingState: TrainingState;
  setTrainingState: (state: TrainingState) => void;
  // Sprint 30: Weekly Plan State
  currentWeeklyPlan: WeeklyPlan | null;
  planHistory: WeeklyPlan[];
  lastPlanGenerated: number;
  setCurrentPlan: (plan: WeeklyPlan) => void;
  generateNewPlan: (dayIndex: number, runnerState: RunnerState, upcomingRaces?: RaceOccurrence[], templateId?: string) => void;
  completeActivity: (dayIndex: number, activity: DailyActivity) => void;
  swapActivity: (dayIndex: number, newActivity: DailyActivity) => void;
  archivePlan: (plan: WeeklyPlan) => void;
  getAdherenceMetrics: (currentDayIndex?: number) => { completionRate: number; substitutionRate: number; missedWorkouts: number; totalPlanned: number; totalCompleted: number; };
  getTodaysActivity: (currentDayIndex: number) => { activity: DailyActivity; energyCost: number; } | null;
}

// Helpers to get initial state safely for SSR
const getInitialWeeklyPlan = (): WeeklyPlan | null => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  try {
    const stored = localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as WeeklyPlan) : null;
  } catch {
    return null;
  }
};

const getInitialPlanHistory = (): WeeklyPlan[] => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return [];
  try {
    const stored = localStorage.getItem(PLAN_HISTORY_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as WeeklyPlan[]) : [];
  } catch {
    return [];
  }
};

const getInitialTrainingState = (): TrainingState => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return DEFAULT_TRAINING_STATE;
  try {
    const stored = localStorage.getItem(TRAINING_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as TrainingState) : DEFAULT_TRAINING_STATE;
  } catch {
    return DEFAULT_TRAINING_STATE;
  }
};

const useGlobalTrainingStore = create<TrainingStoreState>((set, get) => {
  const initialPlan = getInitialWeeklyPlan();
  return {
    trainingState: getInitialTrainingState(),
    setTrainingState: (state) => set({ trainingState: state }),
    
    // Sprint 30: Weekly Plan State
    currentWeeklyPlan: initialPlan,
    planHistory: getInitialPlanHistory(),
    lastPlanGenerated: initialPlan ? initialPlan.weekStartDay : 0,

  setCurrentPlan: (plan) => {
    set({ currentWeeklyPlan: plan, lastPlanGenerated: plan.weekStartDay });
    saveWeeklyPlan(plan);
  },

  generateNewPlan: (dayIndex, runnerState, upcomingRaces = [], templateId?: string) => {
    const newPlan = generateWeeklyPlan(dayIndex, runnerState, upcomingRaces, templateId);
    
    // Archive old plan if exists
    const { currentWeeklyPlan } = get();
    if (currentWeeklyPlan) {
      get().archivePlan({ ...currentWeeklyPlan, isActive: false });
    }
    
    get().setCurrentPlan(newPlan);
  },

  completeActivity: (dayIndex, activity) => {
    const { currentWeeklyPlan } = get();
    if (!currentWeeklyPlan) return;

    const updatedPlan = completeActivityInPlan(currentWeeklyPlan, dayIndex, activity);
    get().setCurrentPlan(updatedPlan);
  },

  swapActivity: (dayIndex, newActivity) => {
    const { currentWeeklyPlan } = get();
    if (!currentWeeklyPlan) return;

    const updatedPlan = swapActivityInPlan(currentWeeklyPlan, dayIndex, newActivity);
    get().setCurrentPlan(updatedPlan);
  },

  archivePlan: (plan) => {
    const { planHistory } = get();
    const updatedHistory = [...planHistory, plan];
    
    // Keep only last 8 weeks
    const recentHistory = updatedHistory.slice(-8);
    
    set({ planHistory: recentHistory });
    savePlanHistory(recentHistory);
  },

  getAdherenceMetrics: (currentDayIndex?: number) => {
    const { currentWeeklyPlan } = get();
    if (!currentWeeklyPlan) {
      return {
        completionRate: 0,
        substitutionRate: 0,
        missedWorkouts: 0,
        totalPlanned: 0,
        totalCompleted: 0,
      };
    }
    return calculateAdherence(currentWeeklyPlan, currentDayIndex);
  },

  getTodaysActivity: (currentDayIndex) => {
    const { currentWeeklyPlan } = get();
    const plannedActivity = getTodaysPlannedActivity(currentWeeklyPlan, currentDayIndex);
    
    if (!plannedActivity) return null;
    
    return {
      activity: plannedActivity.activity,
      energyCost: plannedActivity.energyCost,
    };
  },
};
});

let inMemoryTrainingState: TrainingState | null = null;

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
  return inMemoryTrainingState || DEFAULT_TRAINING_STATE;
};

/**
 * Saves the training state to local storage.
 * @param state The training state to save.
 */
export const saveTrainingState = (state: TrainingState): void => {
  inMemoryTrainingState = state;
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
    initializeWeeklyPlanState();
  }, []);

  return {
    trainingState,
    setTrainingState: saveTrainingState,
    // Sprint 30: Weekly Plan Methods
    currentWeeklyPlan: useGlobalTrainingStore((s) => s.currentWeeklyPlan),
    planHistory: useGlobalTrainingStore((s) => s.planHistory),
    lastPlanGenerated: useGlobalTrainingStore((s) => s.lastPlanGenerated),
    setCurrentPlan: useGlobalTrainingStore.getState().setCurrentPlan,
    generateNewPlan: useGlobalTrainingStore.getState().generateNewPlan,
    completeActivity: useGlobalTrainingStore.getState().completeActivity,
    swapActivity: useGlobalTrainingStore.getState().swapActivity,
    archivePlan: useGlobalTrainingStore.getState().archivePlan,
    getAdherenceMetrics: useGlobalTrainingStore.getState().getAdherenceMetrics,
    getTodaysActivity: useGlobalTrainingStore.getState().getTodaysActivity,
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

// ═══════════════════════════════════════════════════════════════════════
// Sprint 30: Weekly Plan Storage Functions
// ═══════════════════════════════════════════════════════════════════════

/**
 * Loads the current weekly plan from local storage.
 */
const loadWeeklyPlan = (): WeeklyPlan | null => {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as WeeklyPlan;
      }
    }
  } catch (error) {
    console.error("Failed to load weekly plan from local storage:", error);
  }
  return null;
};

/**
 * Saves the current weekly plan to local storage.
 */
const saveWeeklyPlan = (plan: WeeklyPlan): void => {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(WEEKLY_PLAN_STORAGE_KEY, JSON.stringify(plan));
    }
  } catch (error) {
    console.error("Failed to save weekly plan to local storage:", error);
  }
};

/**
 * Loads the plan history from local storage.
 */
const loadPlanHistory = (): WeeklyPlan[] => {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(PLAN_HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as WeeklyPlan[];
      }
    }
  } catch (error) {
    console.error("Failed to load plan history from local storage:", error);
  }
  return [];
};

/**
 * Saves the plan history to local storage.
 */
const savePlanHistory = (history: WeeklyPlan[]): void => {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(PLAN_HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error("Failed to save plan history to local storage:", error);
  }
};

/**
 * Initialize weekly plan state from storage on app load
 */
export const initializeWeeklyPlanState = (): void => {
  const plan = loadWeeklyPlan();
  const history = loadPlanHistory();
  
  if (plan) {
    useGlobalTrainingStore.setState({ 
      currentWeeklyPlan: plan,
      lastPlanGenerated: plan.weekStartDay,
    });
  }
  
  if (history.length > 0) {
    useGlobalTrainingStore.setState({ planHistory: history });
  }
};
