import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { earnRacePrize, earnSponsorPayout } from "@/economy/earning-engine";
import {
  checkForNewOffers,
  getRaceBonus,
  getWinBonus,
} from "@/economy/sponsorship-engine";
import { completeRace } from "@/runner/runner-engine";
import { storageRepository } from "@/storage/storage-repository";
import type {
  PlayerStatistics,
  StoredDaily,
  StoredPlayer,
} from "@/storage/types";
import { useGameStore } from "@/store/game-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useTimelineStore } from "@/store/timeline-store";
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

    // Calculate XP and Coins earned from race outcome
    let xpGained = 35;
    let coinsGained = 50;
    if (result.outcome === "gold") {
      xpGained = 100;
      coinsGained = 150;
    } else if (result.outcome === "silver") {
      xpGained = 75;
      coinsGained = 100;
    } else if (result.outcome === "bronze") {
      xpGained = 50;
      coinsGained = 75;
    } else if (result.outcome === "dnf" || result.outcome === "dns") {
      xpGained = 10;
      coinsGained = 20;
    }

    // Load active preparation pacing strategy to determine intensity
    let intensity = 0.7; // default steady
    const prep = usePreparationStore.getState().preparation;
    if (prep.pacing === "aggressive") intensity = 1.0;
    else if (prep.pacing === "conservative") intensity = 0.4;

    const finalState =
      result.stateLog && result.stateLog.length > 0
        ? result.stateLog[result.stateLog.length - 1]
        : null;

    // Calculate player's position in standings
    let position = 1;
    if (finalState && finalState.opponents) {
      const entries = [
        {
          time: result.finishTime,
          isDNF: result.outcome === "dnf" || result.outcome === "dns",
          isPlayer: true,
        },
        ...finalState.opponents.map((opp) => ({
          time: opp.accumulatedTime,
          isDNF: opp.isDNF,
          isPlayer: false,
        })),
      ];
      entries.sort((a, b) => {
        if (a.isDNF && !b.isDNF) return 1;
        if (!a.isDNF && b.isDNF) return -1;
        return a.time - b.time;
      });
      const playerIndex = entries.findIndex((e) => e.isPlayer);
      position = playerIndex !== -1 ? playerIndex + 1 : 1;
    }

    // Determine if the player beat the Nemesis in this race
    let didBeatNemesis: boolean | undefined;
    if (finalState && finalState.opponents) {
      const nemesis = finalState.opponents.find((opp) => opp.isNemesis);
      if (nemesis) {
        if (result.outcome === "dnf" || result.outcome === "dns") {
          didBeatNemesis = false;
        } else if (nemesis.isDNF) {
          didBeatNemesis = true;
        } else {
          didBeatNemesis = result.finishTime < nemesis.accumulatedTime;
        }
      }
    }

    // Record race and award XP/Coins to the runner profile
    completeRace(
      distance,
      result.finishTime,
      intensity,
      xpGained,
      coinsGained,
      didBeatNemesis,
    );

    // Apply Economy updates (Sprint 27 integration)
    const gameState = useTimelineStore.getState().gameState;
    if (gameState) {
      // 1. Position calculated above


      // 2. Award race prize money (only if player didn't DNF/DNS)
      const currentChallenge = useGameStore.getState().currentChallenge;
      const entryFee = currentChallenge?.entryFee ?? 0;
      const totalEntrants = currentChallenge?.totalEntrants ?? 5;
      const raceName =
        currentChallenge?.race.title[lang] ||
        currentChallenge?.race.title.en ||
        "Race";

      let updatedEconomy = gameState.economy;
      let prize = 0;

      if (result.outcome !== "dnf" && result.outcome !== "dns") {
        const racePrizeResult = earnRacePrize(
          gameState.economy,
          gameState,
          entryFee,
          totalEntrants,
          position,
          raceName,
        );
        updatedEconomy = racePrizeResult.economy;
        prize = racePrizeResult.prize;
      }

      // 3. Award sponsorship bonuses
      let updatedSponsorship = { ...gameState.sponsorship };
      const sponsorName = updatedSponsorship.currentSponsor;
      if (sponsorName) {
        // Race Completion Bonus
        const completionBonus = getRaceBonus(updatedSponsorship);
        if (completionBonus > 0) {
          const res = earnSponsorPayout(
            updatedEconomy,
            gameState,
            sponsorName,
            completionBonus,
            "Race Completion Bonus",
          );
          updatedEconomy = res.economy;
        }

        // Victory / Win Bonus
        if (
          position === 1 &&
          result.outcome !== "dnf" &&
          result.outcome !== "dns"
        ) {
          const winBonus = getWinBonus(updatedSponsorship);
          if (winBonus > 0) {
            const res = earnSponsorPayout(
              updatedEconomy,
              gameState,
              sponsorName,
              winBonus,
              "Race Victory Bonus",
            );
            updatedEconomy = res.economy;
          }
        }
      }

      // 4. Check for new sponsor offers
      const offerCheck = checkForNewOffers(updatedSponsorship, {
        ...gameState,
        economy: updatedEconomy,
        sponsorship: updatedSponsorship,
      });
      updatedSponsorship = offerCheck.sponsorshipState;

      // 5. Update timeline store game state
      useTimelineStore.getState().setGameState((prev) => ({
        ...prev!,
        economy: updatedEconomy,
        sponsorship: updatedSponsorship,
        resources: {
          ...prev!.resources,
          money: updatedEconomy.currentBalance,
        },
      }));
    }

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
      if (position === 1) {
        stats.totalWins += 1;
      }
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
