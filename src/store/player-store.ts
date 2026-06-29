import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { storageRepository } from "@/storage/storage-repository";
import type { PlayerStatistics, StoredPlayer } from "@/storage/types";

const DEFAULT_STATISTICS: PlayerStatistics = {
  totalRuns: 0,
  totalWins: 0,
  totalDistance: 0,
  currentStreak: 0,
  longestStreak: 0,
  perfectRuns: 0,
};

/**
 * Creates a brand-new player with a generated UUID.
 */
function createNewPlayer(): StoredPlayer {
  return {
    version: 1,
    id: uuidv4(),
    language: "en",
    createdAt: new Date().toISOString(),
    lastPlayedAt: null,
    statistics: DEFAULT_STATISTICS,
  };
}

export interface PlayerState {
  player: StoredPlayer | null;
  /** Load from storage or create a new player. Must be called once on app boot. */
  initializePlayer: () => void;
  /** Persist language preference on the player record. */
  setLanguage: (language: "en" | "id") => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,

  initializePlayer() {
    const existing = storageRepository.loadPlayer();
    if (existing) {
      set({ player: existing });
    } else {
      const newPlayer = createNewPlayer();
      storageRepository.savePlayer(newPlayer);
      set({ player: newPlayer });
    }
  },

  setLanguage(language) {
    const { player } = get();
    if (!player) return;
    const updated: StoredPlayer = { ...player, language };
    storageRepository.savePlayer(updated);
    set({ player: updated });
  },
}));
