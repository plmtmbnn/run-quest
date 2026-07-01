import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { storageRepository } from "@/storage/storage-repository";
import type {
  PlayerStatistics,
  StoredDaily,
  StoredPlayer,
} from "@/storage/types";
import type { SimulationResult } from "@/types/engine";
import { generateRunnerName } from "@/utils/name-generator";

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
    name: generateRunnerName(),
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
  /** Update runner name. */
  setPlayerName: (name: string) => void;
  /** Persist language preference on the player record. */
  setLanguage: (language: "en" | "id") => void;
  /** Complete today's run and update all statistics and daily lockout markers. */
  completeChallenge: (
    challengeId: string,
    distance: number,
    result: SimulationResult,
    language: "en" | "id",
  ) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,

  initializePlayer() {
    const existing = storageRepository.loadPlayer();
    if (existing) {
      if (!existing.name) {
        existing.name = generateRunnerName();
        storageRepository.savePlayer(existing);
      }
      set({ player: existing });
    } else {
      const newPlayer = createNewPlayer();
      storageRepository.savePlayer(newPlayer);
      set({ player: newPlayer });
    }
  },

  setPlayerName(name) {
    const { player } = get();
    if (!player) return;
    const updated: StoredPlayer = { ...player, name };
    storageRepository.savePlayer(updated);
    set({ player: updated });
  },

  setLanguage(language) {
    const { player } = get();
    if (!player) return;
    const updated: StoredPlayer = { ...player, language };
    storageRepository.savePlayer(updated);
    set({ player: updated });
  },

  completeChallenge(challengeId, distance, result, language) {
    const { player } = get();
    if (!player) return;

    const lang = language === "id" ? "id" : "en";
    const headline = result.story.headline[lang] || result.story.headline.en;

    // 1. Create or load history
    const history = storageRepository.loadHistory() || {
      version: 1,
      entries: [],
    };
    const entryExists = history.entries.some(
      (e) => e.challengeId === challengeId,
    );

    if (!entryExists) {
      history.entries.push({
        challengeId,
        playedAt: new Date().toISOString(),
        finishTime: result.finishTime,
        grade: result.grade as "S" | "A" | "B" | "C" | "D" | "F",
        headline,
        score: result.score,
        outcome: result.outcome,
      });
      storageRepository.saveHistory(history);
    }

    // 2. Update player stats
    const stats = { ...player.statistics };
    const distanceRun = result.outcome === "dns" ? 0 : distance;
    if (result.outcome !== "dns") {
      stats.totalRuns += 1;
    }
    stats.totalDistance = Number(
      (stats.totalDistance + distanceRun).toFixed(2),
    );

    if (result.outcome !== "dnf" && result.outcome !== "dns") {
      stats.totalWins += 1;
    }
    if (result.grade === "S") {
      stats.perfectRuns += 1;
    }

    // Streak calculation
    const lastPlayedStr = player.lastPlayedAt;
    let newStreak = player.statistics.currentStreak;

    if (lastPlayedStr) {
      const lastPlayed = new Date(lastPlayedStr);
      const today = new Date();

      // Zero out time details to compare calendar dates
      lastPlayed.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastPlayed.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // If diffDays is 0 (completed on same day), do not modify current streak
    } else {
      newStreak = 1;
    }

    stats.currentStreak = newStreak;
    if (newStreak > stats.longestStreak) {
      stats.longestStreak = newStreak;
    }

    const updatedPlayer: StoredPlayer = {
      ...player,
      lastPlayedAt: new Date().toISOString(),
      statistics: stats,
    };

    storageRepository.savePlayer(updatedPlayer);
    set({ player: updatedPlayer });

    // 3. Mark daily challenge as completed
    const daily: StoredDaily = {
      version: 1,
      challengeId,
      status: "completed",
      completedAt: new Date().toISOString(),
      resultId: result.outcome,
    };
    storageRepository.saveDaily(daily);

    // 4. Update Daily Board status completed marker
    const boardStatus = storageRepository.loadDailyBoard();
    if (boardStatus) {
      boardStatus.completedEntryId = challengeId;
      storageRepository.saveDailyBoard(boardStatus);
    }
  },
}));
