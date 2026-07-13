import { create } from "zustand";
import type { Rival, RivalRelationship } from "./rival-types";

interface RivalState {
  /** Currently active rival for the race (if any) */
  activeRival: Rival | null;

  /** All rival relationships tracked */
  rivalRelationships: Record<string, RivalRelationship>;

  /** Set the active rival for current race */
  setActiveRival: (rival: Rival | null) => void;

  /** Record a race outcome against a rival */
  recordRaceOutcome: (
    rivalId: string,
    playerWon: boolean,
    marginSeconds: number,
  ) => void;

  /** Get relationship with specific rival */
  getRivalRelationship: (rivalId: string) => RivalRelationship | null;

  /** Initialize rival relationships from saved data */
  initializeRelationships: (
    relationships: Record<string, RivalRelationship>,
  ) => void;

  /** Clear active rival (after race ends) */
  clearActiveRival: () => void;
}

export const useRivalStore = create<RivalState>((set, get) => ({
  activeRival: null,
  rivalRelationships: {},

  setActiveRival: (rival) => {
    set({ activeRival: rival });
  },

  recordRaceOutcome: (rivalId, playerWon, marginSeconds) => {
    const { rivalRelationships } = get();

    // Get or create relationship
    const existing = rivalRelationships[rivalId] || {
      rivalId,
      wins: 0,
      losses: 0,
      lastEncounter: null,
      relationshipLevel: 0,
      totalEncounters: 0,
      closestMargin: Infinity,
      biggestWin: 0,
      biggestLoss: 0,
    };

    // Update stats
    const updated: RivalRelationship = {
      ...existing,
      wins: playerWon ? existing.wins + 1 : existing.wins,
      losses: playerWon ? existing.losses : existing.losses + 1,
      lastEncounter: new Date().toISOString(),
      totalEncounters: existing.totalEncounters + 1,
      closestMargin: Math.min(existing.closestMargin, Math.abs(marginSeconds)),
    };

    // Update biggest win/loss
    if (playerWon && marginSeconds > updated.biggestWin) {
      updated.biggestWin = marginSeconds;
    } else if (!playerWon && marginSeconds > updated.biggestLoss) {
      updated.biggestLoss = marginSeconds;
    }

    // Adjust relationship level
    // Winning increases rivalry (negative), losing decreases it
    if (playerWon) {
      updated.relationshipLevel = Math.max(-100, updated.relationshipLevel - 5);
    } else {
      updated.relationshipLevel = Math.min(100, updated.relationshipLevel + 3);
    }

    // Close races increase rivalry
    if (Math.abs(marginSeconds) < 10) {
      updated.relationshipLevel -= 10;
    }

    set({
      rivalRelationships: {
        ...rivalRelationships,
        [rivalId]: updated,
      },
    });
  },

  getRivalRelationship: (rivalId) => {
    return get().rivalRelationships[rivalId] || null;
  },

  initializeRelationships: (relationships) => {
    set({ rivalRelationships: relationships });
  },

  clearActiveRival: () => {
    set({ activeRival: null });
  },
}));
