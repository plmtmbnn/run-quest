import { create } from "zustand";
import type { DailyChallenge, SimulationResult } from "@/types/engine";

interface GameState {
  currentChallenge: DailyChallenge | null;
  lastResult: SimulationResult | null;

  setChallenge: (challenge: DailyChallenge) => void;
  setResult: (result: SimulationResult) => void;
  clearState: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentChallenge: null,
  lastResult: null,

  setChallenge: (challenge) => set({ currentChallenge: challenge }),
  setResult: (result) => set({ lastResult: result }),
  clearState: () => set({ currentChallenge: null, lastResult: null }),
}));
