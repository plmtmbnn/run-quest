import { create } from "zustand";
import { getTierAndDivision } from "./ranking-engine";
import type { Competitor, RivalActivity } from "./ranking-types";
import { simulateRivalsDay, type RivalAIData } from "./rival-engine";
import {
  loadSocialState,
  type SocialStateData,
  saveSocialState,
  seedClubMembers,
  seedRegionalCompetitors,
  seedGlobalCompetitors,
  seedRivalActivities,
} from "./social-persistence";

interface SocialStoreState extends SocialStateData {
  isLoaded: boolean;

  setRegion: (region: string) => void;
  joinClub: (clubId: string) => void;
  simulateCompetitionDay: (playerKm: number, playerRp?: number) => void;
  loadFromStorage: () => void;
  resetSocial: () => void;
}

export const useSocialStore = create<SocialStoreState>((set, get) => ({
  ...loadSocialState(),
  isLoaded: false,

  setRegion: (region: string) => {
    const regionalCompetitors = seedRegionalCompetitors(region);
    const updated = {
      ...get(),
      region,
      regionalCompetitors,
    };

    // Clean Zustand state from methods
    const { isLoaded, ...toPersist } = updated;
    set(updated as any);
    saveSocialState(toPersist);
  },

  joinClub: (clubId: string) => {
    const updated = {
      ...get(),
      clubId,
      weeklyContributedKm: 0,
      weeklyProgressKm: 77, // Reset to base progress
      clubMembers: seedClubMembers(),
    };

    const { isLoaded, ...toPersist } = updated;
    set(updated as any);
    saveSocialState(toPersist);
  },

  simulateCompetitionDay: (playerKm: number, playerRp?: number) => {
    const state = get();
    if (!state.region) return;

    // Build a minimal player profile for the rival engine
    const playerProfile = { rankPoints: playerRp ?? 0 } as any;

    // 1. Simulate Regional Competitors (60% chance of RP change per day)
    const updatedRegional = state.regionalCompetitors.map((comp) => {
      if (Math.random() > 0.4) {
        const rpChange = Math.floor(Math.random() * 45) - 10; // -10 to +34 RP
        const newRp = Math.max(0, comp.rp + rpChange);
        const { tier, division } = getTierAndDivision(newRp);
        const lastRunDistance =
          Math.random() > 0.5 ? (Math.random() > 0.5 ? 5 : 10) : 15;
        return {
          ...comp,
          rp: newRp,
          tier,
          division,
          level: comp.level + (Math.random() > 0.95 ? 1 : 0),
          lastRunDistance,
        };
      }
      return comp;
    });

    // 2. Simulate Global Competitors (Elite)
    const updatedGlobal = state.globalLeaderboard.map((comp) => {
      if (Math.random() > 0.3) {
        const rpChange = Math.floor(Math.random() * 40) - 5; // -5 to +34 RP
        const newRp = Math.max(2000, comp.rp + rpChange); // Clamp to global elite minimum
        const { tier, division } = getTierAndDivision(newRp);
        return {
          ...comp,
          rp: newRp,
          tier,
          division,
          level: comp.level + (Math.random() > 0.95 ? 1 : 0),
        };
      }
      return comp;
    });

    // 3. Simulate Club Progress
    let weeklyContributedKm = state.weeklyContributedKm;
    let weeklyProgressKm = state.weeklyProgressKm;
    let updatedMembers = state.clubMembers;

    if (state.clubId) {
      weeklyContributedKm = Number((weeklyContributedKm + playerKm).toFixed(2));

      // Update other members contributions (add 2 to 6 km each)
      updatedMembers = state.clubMembers.map((member) => {
        const added = Number((2 + Math.random() * 4).toFixed(1));
        return {
          ...member,
          contributionKm: Number((member.contributionKm + added).toFixed(1)),
        };
      });

      const totalMembersAdded = updatedMembers.reduce(
        (sum, m) => sum + m.contributionKm,
        0,
      );
      weeklyProgressKm = Number(
        (weeklyContributedKm + totalMembersAdded).toFixed(1),
      );
    }

    // 4. Rival AI Progression — use the rival engine
    const daySeed = Date.now();
    const { updatedRivals, activities } = simulateRivalsDay(
      state.rivalAIData,
      playerProfile,
      daySeed,
    );

    // Convert rival training results to RivalActivity entries for the feed
    const newActivities: RivalActivity[] = activities.map((act) => ({
      id: `act_${Date.now()}_${Math.random()}`,
      rivalId: act.rivalId,
      rivalName: act.rivalName,
      timestamp: "Just now",
      action: act.result.description,
      attributeImproved: act.result.attributeImproved,
    }));

    // Age existing timestamps and prepend new activities, limit to 10
    const updatedActivities = [
      ...newActivities,
      ...state.rivalActivities.map((a) => {
        if (a.timestamp === "Just now") return { ...a, timestamp: "2h ago" };
        if (a.timestamp === "2h ago") return { ...a, timestamp: "5h ago" };
        if (a.timestamp === "5h ago") return { ...a, timestamp: "12h ago" };
        if (a.timestamp === "12h ago") return { ...a, timestamp: "1d ago" };
        return a;
      }),
    ].slice(0, 10);

    const updated = {
      ...state,
      regionalCompetitors: updatedRegional,
      globalLeaderboard: updatedGlobal,
      weeklyContributedKm,
      weeklyProgressKm,
      clubMembers: updatedMembers,
      rivalActivities: updatedActivities,
      rivalAIData: updatedRivals,
      lastSimulationDate: new Date().toISOString(),
    };

    const { isLoaded, ...toPersist } = updated;
    set(updated as any);
    saveSocialState(toPersist);
  },

  loadFromStorage: () => {
    const loaded = loadSocialState();
    set({ ...loaded, isLoaded: true });
  },

  resetSocial: () => {
    const defaults = {
      region: null,
      regionalCompetitors: [],
      globalLeaderboard: seedGlobalCompetitors(),
      clubId: null,
      weeklyProgressKm: 77,
      weeklyContributedKm: 0,
      clubMembers: seedClubMembers(),
      rivalActivities: seedRivalActivities(),
      rivalAIData: [] as RivalAIData[],
      lastSimulationDate: null,
    };
    set({ ...defaults, isLoaded: true });
    saveSocialState(defaults);
  },
}));
