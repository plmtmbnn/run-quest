/**
 * Sponsorship Types (Sprint 26 - Task 2)
 * 
 * Sponsorship tiers and definitions for earning passive income.
 */

import type { RaceTier } from "../economy/economy-types";

export type SponsorTier = "local" | "regional" | "national";

/**
 * A sponsor contract the player can earn.
 */
export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  description: string;
  
  /** Requirements to unlock this sponsor */
  requirements: {
    minRating?: number;
    minWins?: number;
    minLevel?: number;
    previousSponsor?: string; // Must have this sponsor first
    chaptersRequired?: number;
  };
  
  /** Financial benefits */
  benefits: SponsorBenefits;
  
  /** Narrative flavor */
  signature: string; // Their catchphrase/logo
  colors: {
    primary: string;
    secondary: string;
  };
}

/**
 * Financial benefits provided by a sponsor.
 */
export interface SponsorBenefits {
  /** Bonus per training session */
  trainingBonus: number;
  /** Bonus per race completed (any position) */
  raceCompletionBonus: number;
  /** Bonus per victory */
  winBonus: number;
  /** Monthly stipend (per 28 days) */
  monthlyStipend: number;
}

/**
 * Active sponsorship state.
 */
export interface SponsorshipState {
  currentSponsor?: string;
  sponsorsAvailable: string[];
  lifetimeSponsorEarnings: number;
  monthlyStipendLastClaimed: number; // dayIndex
  signedAtDay: number;
}

/**
 * Sponsor definitions database.
 */
export const SPONSORS: Record<string, Sponsor> = {
  local_runner_shop: {
    id: "local_runner_shop",
    name: "Runner's Corner",
    tier: "local",
    description: "Your local running shop believes in community runners",
    requirements: {
      minWins: 3,
      minRating: 1600,
    },
    benefits: {
      trainingBonus: 5,
      raceCompletionBonus: 10,
      winBonus: 25,
      monthlyStipend: 50,
    },
    signature: "Run local, dream big",
    colors: { primary: "#22c55e", secondary: "#16a34a" },
  },

  regional_fitness_app: {
    id: "regional_fitness_app",
    name: "FitTrack",
    tier: "regional",
    description: "Leading fitness tracking app needs ambassadors",
    requirements: {
      minWins: 10,
      minRating: 1900,
      previousSponsor: "local_runner_shop",
    },
    benefits: {
      trainingBonus: 15,
      raceCompletionBonus: 30,
      winBonus: 75,
      monthlyStipend: 150,
    },
    signature: "Track your greatness",
    colors: { primary: "#3b82f6", secondary: "#2563eb" },
  },

  national_sports_brand: {
    id: "national_sports_brand",
    name: "Apex Athletics",
    tier: "national",
    description: "Premium sportswear company looking for elite athletes",
    requirements: {
      minWins: 25,
      minRating: 2200,
      previousSponsor: "regional_fitness_app",
      chaptersRequired: 3,
    },
    benefits: {
      trainingBonus: 50,
      raceCompletionBonus: 100,
      winBonus: 250,
      monthlyStipend: 500,
    },
    signature: "Unleash your potential",
    colors: { primary: "#8b5cf6", secondary: "#7c3aed" },
  },
};

export const DEFAULT_SPONSORSHIP_STATE: SponsorshipState = {
  sponsorsAvailable: [],
  lifetimeSponsorEarnings: 0,
  monthlyStipendLastClaimed: 0,
  signedAtDay: 0,
};

/**
 * Get sponsor by tier ordering.
 */
export const SPONSOR_TIER_ORDER: SponsorTier[] = ["local", "regional", "national"];
