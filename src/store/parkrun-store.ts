import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Distance } from "@/store/focus-progression-store";

/**
 * Parkrun System - Always-available quick races for Career Mode
 * Low barrier, immediate access, reduced rewards
 */

export interface ParkrunEvent {
  id: string;
  name: string;
  distance: Distance;
  location: string;
  difficulty: "easy" | "medium" | "hard";
  entryFee: number; // Lower than scheduled races
  energyCost: number; // Lower than scheduled races
  prizeMultiplier: number; // 0.5 = 50% of normal race prizes
  xpMultiplier: number; // 0.5 = 50% of normal XP
  alwaysAvailable: true;
  description: string;
}

export interface ParkrunHistory {
  eventId: string;
  dayIndex: number;
  time: number;
  position: number;
  totalRunners: number;
}

export interface ParkrunState {
  availableParkruns: ParkrunEvent[];
  history: ParkrunHistory[];
  totalParkruns: number;
  bestTimes: Record<string, number>; // eventId -> best time

  // Actions
  getParkrunsByDistance: (distance: Distance) => ParkrunEvent[];
  recordParkrun: (history: ParkrunHistory) => void;
  getBestTime: (eventId: string) => number | null;
  getParkrunStats: () => {
    total: number;
    thisWeek: number;
    bestFinish: number;
  };
}

const DEFAULT_PARKRUNS: ParkrunEvent[] = [
  {
    id: "parkrun_5k_easy",
    name: "Community Parkrun",
    distance: 5,
    location: "City Park",
    difficulty: "easy",
    entryFee: 5,
    energyCost: 10,
    prizeMultiplier: 0.3,
    xpMultiplier: 0.5,
    alwaysAvailable: true,
    description:
      "Friendly local 5K, perfect for testing fitness or warm-up racing",
  },
  {
    id: "parkrun_5k_medium",
    name: "Competitive Parkrun",
    distance: 5,
    location: "Athletic Track",
    difficulty: "medium",
    entryFee: 10,
    energyCost: 15,
    prizeMultiplier: 0.4,
    xpMultiplier: 0.6,
    alwaysAvailable: true,
    description: "More competitive field, good for testing speed",
  },
  {
    id: "parkrun_10k_easy",
    name: "Weekend 10K",
    distance: 10,
    location: "Riverside Path",
    difficulty: "easy",
    entryFee: 10,
    energyCost: 20,
    prizeMultiplier: 0.3,
    xpMultiplier: 0.5,
    alwaysAvailable: true,
    description: "Casual 10K for building endurance",
  },
  {
    id: "parkrun_10k_medium",
    name: "City 10K Challenge",
    distance: 10,
    location: "Downtown Circuit",
    difficulty: "medium",
    entryFee: 15,
    energyCost: 25,
    prizeMultiplier: 0.4,
    xpMultiplier: 0.6,
    alwaysAvailable: true,
    description: "Competitive 10K with strong local runners",
  },
  {
    id: "time_trial_5k",
    name: "5K Time Trial",
    distance: 5,
    location: "Track",
    difficulty: "easy",
    entryFee: 3,
    energyCost: 8,
    prizeMultiplier: 0.2,
    xpMultiplier: 0.3,
    alwaysAvailable: true,
    description:
      "Solo time trial, minimal competition, perfect for testing pacing",
  },
];

export const useParkrunStore = create<ParkrunState>()(
  persist(
    (set, get) => ({
      availableParkruns: DEFAULT_PARKRUNS,
      history: [],
      totalParkruns: 0,
      bestTimes: {},

      getParkrunsByDistance: (distance) => {
        const state = get();
        return state.availableParkruns.filter((pr) => pr.distance === distance);
      },

      recordParkrun: (history) =>
        set((state) => {
          const bestTime = state.bestTimes[history.eventId];
          const isNewBest = !bestTime || history.time < bestTime;

          return {
            history: [...state.history, history],
            totalParkruns: state.totalParkruns + 1,
            bestTimes: isNewBest
              ? { ...state.bestTimes, [history.eventId]: history.time }
              : state.bestTimes,
          };
        }),

      getBestTime: (eventId) => {
        const state = get();
        return state.bestTimes[eventId] || null;
      },

      getParkrunStats: () => {
        const state = get();

        // Get current day index from timeline store if available
        // For now, use a simple week calculation
        const thisWeekRuns = state.history.filter((h) => {
          // Last 7 days
          return true; // Simplified - would need actual day tracking
        });

        const bestFinish =
          state.history.length > 0
            ? Math.min(...state.history.map((h) => h.position))
            : 999;

        return {
          total: state.totalParkruns,
          thisWeek: thisWeekRuns.length,
          bestFinish,
        };
      },
    }),
    {
      name: "runquest.parkruns",
    },
  ),
);
