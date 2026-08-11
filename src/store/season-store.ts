import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Distance } from "@/store/focus-progression-store";

/**
 * Season Mode - Structured progression without timeline management
 * Players progress through seasons with weekly goals and season-long objectives
 */

export interface WeeklyGoal {
  week: number; // 1-12
  description: string;
  completed: boolean;
  reward: string;
  races: SeasonRace[];
}

export interface SeasonRace {
  id: string;
  name: string;
  distance: Distance;
  difficulty: "easy" | "medium" | "hard";
  unlocked: boolean;
  completed: boolean;
  bestResult?: {
    time: number;
    position: number;
  };
}

export interface SeasonGoal {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  reward: string;
}

export interface Season {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5; // Difficulty tier
  unlocked: boolean;
  completed: boolean;
  currentWeek: number; // 1-12
  weeks: WeeklyGoal[];
  seasonGoals: SeasonGoal[];
  rewards: {
    currency: number;
    unlockedGear: string[];
    achievements: string[];
  };
}

export interface SeasonState {
  currentSeasonId: string | null;
  seasons: Season[];

  // Actions
  unlockSeason: (seasonId: string) => void;
  startSeason: (seasonId: string) => void;
  completeWeek: (weekNumber: number) => void;
  completeRace: (raceId: string, time: number, position: number) => void;
  updateSeasonGoal: (goalId: string, value: number) => void;
  advanceWeek: () => void;
  completeSeason: () => void;
  resetSeason: (seasonId: string) => void;
}

const SEASON_1: Season = {
  id: "season-1",
  name: "Local Circuit",
  description: "Compete in local 5K and 10K races to build your reputation",
  tier: 1,
  unlocked: true,
  completed: false,
  currentWeek: 1,
  weeks: Array.from({ length: 12 }, (_, i) => ({
    week: i + 1,
    description: `Week ${i + 1}: Local races available`,
    completed: false,
    reward: i % 4 === 0 ? "Unlock new gear" : "500 currency",
    races: [
      {
        id: `w${i + 1}_5k_easy`,
        name: "Parkrun 5K",
        distance: 5 as Distance,
        difficulty: "easy" as const,
        unlocked: true,
        completed: false,
      },
      {
        id: `w${i + 1}_5k_med`,
        name: "City 5K Challenge",
        distance: 5 as Distance,
        difficulty: "medium" as const,
        unlocked: true,
        completed: false,
      },
      {
        id: `w${i + 1}_10k_easy`,
        name: "Community 10K",
        distance: 10 as Distance,
        difficulty: "easy" as const,
        unlocked: i >= 3,
        completed: false,
      },
    ],
  })),
  seasonGoals: [
    {
      id: "s1_podiums",
      description: "Finish on podium 5 times",
      targetValue: 5,
      currentValue: 0,
      completed: false,
      reward: "Unlock Season 2",
    },
    {
      id: "s1_sub20",
      description: "Break 20:00 in 5K",
      targetValue: 1200, // 20 minutes in seconds
      currentValue: 0,
      completed: false,
      reward: "Carbon Racer Shoes",
    },
    {
      id: "s1_races",
      description: "Complete 15 races",
      targetValue: 15,
      currentValue: 0,
      completed: false,
      reward: "500 currency bonus",
    },
  ],
  rewards: {
    currency: 2000,
    unlockedGear: ["carbon_racer"],
    achievements: ["local_legend"],
  },
};

const SEASON_2: Season = {
  id: "season-2",
  name: "Regional Championship",
  description:
    "Step up to regional competition with 10K and Half Marathon races",
  tier: 2,
  unlocked: false,
  completed: false,
  currentWeek: 1,
  weeks: Array.from({ length: 12 }, (_, i) => ({
    week: i + 1,
    description: `Week ${i + 1}: Regional races`,
    completed: false,
    reward: "750 currency",
    races: [
      {
        id: `s2_w${i + 1}_10k_med`,
        name: "Regional 10K",
        distance: 10 as Distance,
        difficulty: "medium" as const,
        unlocked: true,
        completed: false,
      },
      {
        id: `s2_w${i + 1}_10k_hard`,
        name: "Championship 10K",
        distance: 10 as Distance,
        difficulty: "hard" as const,
        unlocked: true,
        completed: false,
      },
      {
        id: `s2_w${i + 1}_half_easy`,
        name: "Half Marathon",
        distance: 21.1 as Distance,
        difficulty: "easy" as const,
        unlocked: i >= 4,
        completed: false,
      },
    ],
  })),
  seasonGoals: [
    {
      id: "s2_wins",
      description: "Win 3 races",
      targetValue: 3,
      currentValue: 0,
      completed: false,
      reward: "Unlock Season 3",
    },
    {
      id: "s2_half_finish",
      description: "Complete a Half Marathon",
      targetValue: 1,
      currentValue: 0,
      completed: false,
      reward: "Marathon Racer Shoes",
    },
  ],
  rewards: {
    currency: 5000,
    unlockedGear: ["marathon_racer", "hydration_vest"],
    achievements: ["regional_champion"],
  },
};

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      currentSeasonId: null,
      seasons: [SEASON_1, SEASON_2],

      unlockSeason: (seasonId) =>
        set((state) => ({
          seasons: state.seasons.map((s) =>
            s.id === seasonId ? { ...s, unlocked: true } : s,
          ),
        })),

      startSeason: (seasonId) => {
        const state = get();
        const season = state.seasons.find((s) => s.id === seasonId);
        if (season && season.unlocked) {
          set({ currentSeasonId: seasonId });
        }
      },

      completeWeek: (weekNumber) =>
        set((state) => {
          if (!state.currentSeasonId) return state;

          return {
            seasons: state.seasons.map((s) =>
              s.id === state.currentSeasonId
                ? {
                    ...s,
                    weeks: s.weeks.map((w) =>
                      w.week === weekNumber ? { ...w, completed: true } : w,
                    ),
                  }
                : s,
            ),
          };
        }),

      completeRace: (raceId, time, position) =>
        set((state) => {
          if (!state.currentSeasonId) return state;

          return {
            seasons: state.seasons.map((s) =>
              s.id === state.currentSeasonId
                ? {
                    ...s,
                    weeks: s.weeks.map((w) => ({
                      ...w,
                      races: w.races.map((r) =>
                        r.id === raceId
                          ? {
                              ...r,
                              completed: true,
                              bestResult:
                                !r.bestResult || time < r.bestResult.time
                                  ? { time, position }
                                  : r.bestResult,
                            }
                          : r,
                      ),
                    })),
                  }
                : s,
            ),
          };
        }),

      updateSeasonGoal: (goalId, value) =>
        set((state) => {
          if (!state.currentSeasonId) return state;

          return {
            seasons: state.seasons.map((s) =>
              s.id === state.currentSeasonId
                ? {
                    ...s,
                    seasonGoals: s.seasonGoals.map((g) =>
                      g.id === goalId
                        ? {
                            ...g,
                            currentValue: Math.max(g.currentValue, value),
                            completed: value >= g.targetValue,
                          }
                        : g,
                    ),
                  }
                : s,
            ),
          };
        }),

      advanceWeek: () =>
        set((state) => {
          if (!state.currentSeasonId) return state;

          return {
            seasons: state.seasons.map((s) =>
              s.id === state.currentSeasonId && s.currentWeek < 12
                ? { ...s, currentWeek: s.currentWeek + 1 }
                : s,
            ),
          };
        }),

      completeSeason: () =>
        set((state) => {
          if (!state.currentSeasonId) return state;

          return {
            seasons: state.seasons.map((s) =>
              s.id === state.currentSeasonId ? { ...s, completed: true } : s,
            ),
            currentSeasonId: null,
          };
        }),

      resetSeason: (seasonId) =>
        set((state) => ({
          seasons: state.seasons.map((s) =>
            s.id === seasonId
              ? {
                  ...s,
                  completed: false,
                  currentWeek: 1,
                  weeks: s.weeks.map((w) => ({
                    ...w,
                    completed: false,
                    races: w.races.map((r) => ({
                      ...r,
                      completed: false,
                      bestResult: undefined,
                    })),
                  })),
                  seasonGoals: s.seasonGoals.map((g) => ({
                    ...g,
                    currentValue: 0,
                    completed: false,
                  })),
                }
              : s,
          ),
        })),
    }),
    {
      name: "runquest.season",
    },
  ),
);
