import { create } from "zustand";
import { persist } from "zustand/middleware";

// Distance types for progression
export type Distance = 5 | 10 | 21.1 | 42.2;

// Difficulty levels
export type Difficulty = "recreational" | "competitive" | "elite" | "professional";

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number; // timestamp
  rarity: "common" | "rare" | "epic" | "legendary";
}

// Personal Best tracking
export interface PersonalBest {
  distance: Distance;
  time: number; // in seconds
  date: number; // timestamp
  position: number;
  totalRunners: number;
  isPR: boolean;
}

// Challenge types for races
export interface RaceChallenge {
  id: string;
  type: "time" | "position" | "negative-split" | "perfect-pacing" | "endurance";
  distance: Distance;
  difficulty: 1 | 2 | 3 | 4 | 5; // star rating
  description: string;
  targetValue: number; // time in seconds, or position number
  reward: {
    type: "unlock-distance" | "unlock-difficulty" | "achievement";
    value: string;
  };
  completed: boolean;
}

// Session stats (resets daily or per session)
export interface SessionStats {
  racesCompleted: number;
  prsAchieved: number;
  podiumFinishes: number;
  totalDistance: number;
  currentStreak: number; // consecutive podiums, PRs, etc.
  startedAt: number; // timestamp
}

// Main progression state
export interface FocusProgressionState {
  // Core progression
  unlockedDistances: Distance[];
  unlockedDifficulties: Difficulty[];
  currentDifficulty: Difficulty;
  
  // Personal Bests
  personalBests: Record<Distance, PersonalBest | null>;
  
  // Achievements
  achievements: Achievement[];
  
  // Challenges
  availableChallenges: RaceChallenge[];
  completedChallenges: string[]; // challenge IDs
  
  // Cumulative stats
  totalRaces: number;
  totalDistance: number;
  totalPodiums: number;
  bestFinishes: Record<Distance, number>; // best position per distance
  
  // Session tracking
  sessionStats: SessionStats;
  
  // Actions
  unlockDistance: (distance: Distance) => void;
  unlockDifficulty: (difficulty: Difficulty) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  updatePersonalBest: (pb: PersonalBest) => void;
  addAchievement: (achievement: Achievement) => void;
  completeChallenge: (challengeId: string) => void;
  updateSessionStats: (stats: Partial<SessionStats>) => void;
  resetSessionStats: () => void;
  recordRaceResult: (distance: Distance, time: number, position: number, totalRunners: number) => void;
  checkAndUnlockProgression: () => void;
  reset: () => void;
}

const INITIAL_SESSION_STATS: SessionStats = {
  racesCompleted: 0,
  prsAchieved: 0,
  podiumFinishes: 0,
  totalDistance: 0,
  currentStreak: 0,
  startedAt: Date.now(),
};

// Initial challenges for 5K
const INITIAL_CHALLENGES: RaceChallenge[] = [
  {
    id: "5k_sub20",
    type: "time",
    distance: 5,
    difficulty: 3,
    description: "Break 20:00 in 5K",
    targetValue: 20 * 60, // 20 minutes in seconds
    reward: { type: "unlock-distance", value: "10" },
    completed: false,
  },
  {
    id: "5k_podium",
    type: "position",
    distance: 5,
    difficulty: 2,
    description: "Finish on the podium (Top 3)",
    targetValue: 3,
    reward: { type: "achievement", value: "podium_master" },
    completed: false,
  },
  {
    id: "5k_top10_negative",
    type: "negative-split",
    distance: 5,
    difficulty: 4,
    description: "Top 10 finish with negative split",
    targetValue: 10,
    reward: { type: "unlock-difficulty", value: "competitive" },
    completed: false,
  },
];

export const useFocusProgressionStore = create<FocusProgressionState>()(
  persist(
    (set, get) => ({
      // Initial state - only 5K recreational unlocked
      unlockedDistances: [5],
      unlockedDifficulties: ["recreational"],
      currentDifficulty: "recreational",
      
      personalBests: {
        5: null,
        10: null,
        21.1: null,
        42.2: null,
      },
      
      achievements: [],
      availableChallenges: INITIAL_CHALLENGES,
      completedChallenges: [],
      
      totalRaces: 0,
      totalDistance: 0,
      totalPodiums: 0,
      bestFinishes: {
        5: 999,
        10: 999,
        21.1: 999,
        42.2: 999,
      },
      
      sessionStats: INITIAL_SESSION_STATS,
      
      // Actions
      unlockDistance: (distance) =>
        set((state) => ({
          unlockedDistances: state.unlockedDistances.includes(distance)
            ? state.unlockedDistances
            : [...state.unlockedDistances, distance].sort((a, b) => a - b),
        })),
      
      unlockDifficulty: (difficulty) =>
        set((state) => ({
          unlockedDifficulties: state.unlockedDifficulties.includes(difficulty)
            ? state.unlockedDifficulties
            : [...state.unlockedDifficulties, difficulty],
        })),
      
      setDifficulty: (difficulty) =>
        set({ currentDifficulty: difficulty }),
      
      updatePersonalBest: (pb) =>
        set((state) => {
          const currentPB = state.personalBests[pb.distance];
          const isNewPB = !currentPB || pb.time < currentPB.time;
          
          if (isNewPB) {
            return {
              personalBests: {
                ...state.personalBests,
                [pb.distance]: { ...pb, isPR: true },
              },
              sessionStats: {
                ...state.sessionStats,
                prsAchieved: state.sessionStats.prsAchieved + 1,
              },
            };
          }
          
          return state;
        }),
      
      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [...state.achievements, achievement],
        })),
      
      completeChallenge: (challengeId) =>
        set((state) => ({
          completedChallenges: [...state.completedChallenges, challengeId],
          availableChallenges: state.availableChallenges.map((c) =>
            c.id === challengeId ? { ...c, completed: true } : c
          ),
        })),
      
      updateSessionStats: (stats) =>
        set((state) => ({
          sessionStats: { ...state.sessionStats, ...stats },
        })),
      
      resetSessionStats: () =>
        set({
          sessionStats: { ...INITIAL_SESSION_STATS, startedAt: Date.now() },
        }),
      
      recordRaceResult: (distance, time, position, totalRunners) =>
        set((state) => {
          const isPodium = position <= 3;
          const newBestFinish = position < state.bestFinishes[distance];
          
          // Update cumulative stats
          const updates: Partial<FocusProgressionState> = {
            totalRaces: state.totalRaces + 1,
            totalDistance: state.totalDistance + distance,
            totalPodiums: isPodium ? state.totalPodiums + 1 : state.totalPodiums,
          };
          
          // Update best finish
          if (newBestFinish) {
            updates.bestFinishes = {
              ...state.bestFinishes,
              [distance]: position,
            };
          }
          
          // Update session stats
          updates.sessionStats = {
            ...state.sessionStats,
            racesCompleted: state.sessionStats.racesCompleted + 1,
            podiumFinishes: isPodium
              ? state.sessionStats.podiumFinishes + 1
              : state.sessionStats.podiumFinishes,
            totalDistance: state.sessionStats.totalDistance + distance,
          };
          
          return updates;
        }),
      
      checkAndUnlockProgression: () => {
        const state = get();
        
        // Auto-unlock 10K if player has finished 5K in top 50%
        if (!state.unlockedDistances.includes(10)) {
          const best5K = state.bestFinishes[5];
          if (best5K <= 50) {
            // Top 50% (assuming 100 runners)
            get().unlockDistance(10);
          }
        }
        
        // Unlock Half Marathon after 3 podiums in 10K
        if (!state.unlockedDistances.includes(21.1)) {
          const podiumsIn10K = state.totalPodiums >= 3 && state.unlockedDistances.includes(10);
          if (podiumsIn10K) {
            get().unlockDistance(21.1);
          }
        }
        
        // Unlock Marathon after sub-90min Half
        if (!state.unlockedDistances.includes(42.2)) {
          const halfPB = state.personalBests[21.1];
          if (halfPB && halfPB.time < 90 * 60) {
            get().unlockDistance(42.2);
          }
        }
        
        // Unlock competitive difficulty after 5 races
        if (!state.unlockedDifficulties.includes("competitive") && state.totalRaces >= 5) {
          get().unlockDifficulty("competitive");
        }
        
        // Unlock elite after 10 podiums
        if (!state.unlockedDifficulties.includes("elite") && state.totalPodiums >= 10) {
          get().unlockDifficulty("elite");
        }
        
        // Unlock professional after 5 wins
        const totalWins = Object.values(state.bestFinishes).filter((pos) => pos === 1).length;
        if (!state.unlockedDifficulties.includes("professional") && totalWins >= 5) {
          get().unlockDifficulty("professional");
        }
      },
      
      reset: () =>
        set({
          unlockedDistances: [5],
          unlockedDifficulties: ["recreational"],
          currentDifficulty: "recreational",
          personalBests: { 5: null, 10: null, 21.1: null, 42.2: null },
          achievements: [],
          availableChallenges: INITIAL_CHALLENGES,
          completedChallenges: [],
          totalRaces: 0,
          totalDistance: 0,
          totalPodiums: 0,
          bestFinishes: { 5: 999, 10: 999, 21.1: 999, 42.2: 999 },
          sessionStats: { ...INITIAL_SESSION_STATS, startedAt: Date.now() },
        }),
    }),
    {
      name: "runquest.focus-progression",
    }
  )
);
