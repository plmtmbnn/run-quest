import { create } from "zustand";
import type { DailyChallenge, SimulationResult } from "@/types/engine";

interface GameState {
  currentChallenge: DailyChallenge | null;
  lastResult: SimulationResult | null;
  activeGhost: { runnerName: string; splits: number[] } | null;

  setChallenge: (challenge: DailyChallenge) => void;
  setResult: (result: SimulationResult) => void;
  setActiveGhost: (
    ghost: { runnerName: string; splits: number[] } | null,
  ) => void;
  clearState: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentChallenge: null,
  lastResult: null,
  activeGhost: null,

  setChallenge: (challenge) => set({ currentChallenge: challenge }),
  setResult: (result) => set({ lastResult: result }),
  setActiveGhost: (ghost) => set({ activeGhost: ghost }),
  clearState: () =>
    set({ currentChallenge: null, lastResult: null, activeGhost: null }),
}));
