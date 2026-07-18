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

  /** Sponsors that have sent offers, waiting for player response */
  pendingOffers: string[];

  /** Sponsors that player has rejected */
  rejectedOffers: string[];

  /** Track when each offer was received (sponsorId -> dayIndex) */
  offerReceivedDay: Record<string, number>;

  /** Track how many times each sponsor was rejected (sponsorId -> count) */
  rejectionCount: Record<string, number>;

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
    name: "FleetFeetz",
    tier: "local",
    description: "Your local running shop hookup for those fresh kicks.",
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
    signature: "Keep it local, keep it loud",
    colors: { primary: "#22c55e", secondary: "#16a34a" },
  },
  local_city_striders: {
    id: "local_city_striders",
    name: "ParkRunnaz",
    tier: "local",
    description: "The weekend warriors taking over the local parks.",
    requirements: {
      minWins: 5,
      minRating: 1700,
    },
    benefits: {
      trainingBonus: 8,
      raceCompletionBonus: 15,
      winBonus: 35,
      monthlyStipend: 75,
    },
    signature: "5K everyday",
    colors: { primary: "#10b981", secondary: "#059669" },
  },

  regional_fitness_app: {
    id: "regional_fitness_app",
    name: "Stravbros",
    tier: "regional",
    description: "If it ain't on the app, did you even run bro?",
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
    signature: "Kudos for days",
    colors: { primary: "#f97316", secondary: "#ea580c" }, // Strava orange
  },
  regional_pioneer: {
    id: "regional_pioneer",
    name: "Hokaz",
    tier: "regional",
    description: "Maximalist cushions for those heavy mileage flexes.",
    requirements: {
      minWins: 15,
      minRating: 2000,
    },
    benefits: {
      trainingBonus: 20,
      raceCompletionBonus: 40,
      winBonus: 100,
      monthlyStipend: 200,
    },
    signature: "Fly over the pavement",
    colors: { primary: "#0ea5e9", secondary: "#0284c7" },
  },

  national_sports_brand: {
    id: "national_sports_brand",
    name: "The Swoosh",
    tier: "national",
    description: "The biggest sportswear flex on the planet.",
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
    signature: "Just Send It",
    colors: { primary: "#111827", secondary: "#374151" }, // Black/dark grey
  },
  national_global_energy: {
    id: "national_global_energy",
    name: "GatorJuice",
    tier: "national",
    description: "Electrolytes for when you're completely gassed out.",
    requirements: {
      minWins: 40,
      minRating: 2500,
    },
    benefits: {
      trainingBonus: 75,
      raceCompletionBonus: 150,
      winBonus: 400,
      monthlyStipend: 1000,
    },
    signature: "Is it in you bro?",
    colors: { primary: "#10b981", secondary: "#047857" }, // Gatorade green/orange vibe
  },
};

export const DEFAULT_SPONSORSHIP_STATE: SponsorshipState = {
  sponsorsAvailable: [],
  pendingOffers: [],
  rejectedOffers: [],
  offerReceivedDay: {},
  rejectionCount: {},
  lifetimeSponsorEarnings: 0,
  monthlyStipendLastClaimed: 0,
  signedAtDay: 0,
};

/**
 * Get sponsor by tier ordering.
 */
export const SPONSOR_TIER_ORDER: SponsorTier[] = [
  "local",
  "regional",
  "national",
];
