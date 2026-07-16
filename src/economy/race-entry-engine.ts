/**
 * Race Entry Engine (Sprint 26 - Task 3)
 * 
 * Validates and processes race entry with fee and prerequisites.
 */

import type { GameState } from "../engine/timeline/time-types";
import type { EconomyState, RaceTier } from "./economy-types";
import { getEntryFee } from "./economy-balance";
import { spendRaceEntry } from "./earning-engine";

/**
 * Prerequisites that may be required for a race.
 */
export interface RacePrerequisites {
  /** Minimum money needed (overrides standard entry fee) */
  entryFee?: number;
  
  /** Minimum running skill level */
  minLevel?: number;
  
  /** Minimum competitive rating */
  minRating?: number;
  
  /** Story chapter required */
  storyChapter?: number;
  
  /** Qualification required (for championships) */
  requiresQualification?: boolean;
  
  /** Custom prerequisite check */
  customCheck?: string; // description of custom check
}

/**
 * Result of entry validation.
 */
export interface EntryValidation {
  canEnter: boolean;
  eligible: boolean;
  blockers: EntryBlocker[];
  warnings: string[];
  
  /** Cost breakdown */
  cost: {
    entryFee: number;
    energyCost: number;
    total: number;
  };
}

/**
 * A specific reason why entry is blocked.
 */
export interface EntryBlocker {
  reason: string;
  type: "money" | "energy" | "level" | "rating" | "story" | "qualification" | "schedule" | "custom";
  resolved: boolean;
  howToResolve?: string;
}

/**
 * Validate if a player can enter a specific race.
 */
export function validateRaceEntry(
  economy: EconomyState,
  gameState: GameState,
  raceTier: RaceTier,
  prerequisites?: RacePrerequisites,
): EntryValidation {
  const blockers: EntryBlocker[] = [];
  const warnings: string[] = [];

  // Determine entry fee
  const entryFee = prerequisites?.entryFee ?? getEntryFee(raceTier);
  const energyCost = 25; // compete action cost

  // Check money
  if (economy.currentBalance < entryFee) {
    blockers.push({
      reason: `Need $${entryFee} to enter (have $${economy.currentBalance})`,
      type: "money",
      resolved: false,
      howToResolve: "Work or win races to earn money",
    });
  }

  // Check energy
  if (gameState.energy < energyCost) {
    blockers.push({
      reason: `Need ${energyCost} energy to race (have ${gameState.energy})`,
      type: "energy",
      resolved: false,
      howToResolve: "Rest to recover energy (1 day rest = full recovery)",
    });
  }

  // Check level
  if (prerequisites?.minLevel) {
    const level = gameState.skills.running ?? 0;
    if (level < prerequisites.minLevel) {
      blockers.push({
        reason: `Running skill ${prerequisites.minLevel} required (have ${level})`,
        type: "level",
        resolved: false,
        howToResolve: "Train to increase running skill",
      });
    }
  }

  // Check rating
  if (prerequisites?.minRating) {
    const rating = gameState.flags.rating as number ?? 0;
    if (rating < prerequisites.minRating) {
      blockers.push({
        reason: `Rating ${prerequisites.minRating} required (have ${rating})`,
        type: "rating",
        resolved: false,
        howToResolve: "Race and win to increase rating",
      });
    }
  }

  // Check story chapter
  if (prerequisites?.storyChapter) {
    const chapter = gameState.flags.storyChapter as number ?? 0;
    if (chapter < prerequisites.storyChapter) {
      blockers.push({
        reason: `Story Chapter ${prerequisites.storyChapter} required`,
        type: "story",
        resolved: false,
        howToResolve: "Progress through your career story",
      });
    }
  }

  // Check qualification
  if (prerequisites?.requiresQualification) {
    const qualified = gameState.flags.qualified_for_race as boolean ?? false;
    if (!qualified) {
      blockers.push({
        reason: "Qualification required for this race",
        type: "qualification",
        resolved: false,
        howToResolve: "Achieve qualification standard through races",
      });
    }
  }

  // Check custom
  if (prerequisites?.customCheck) {
    blockers.push({
      reason: prerequisites.customCheck,
      type: "custom",
      resolved: false,
      howToResolve: "See race details for requirements",
    });
  }

  // Add warnings based on state
  if (economy.currentBalance < entryFee * 0.2) {
    warnings.push("⚠️ Spending most of your money on this race");
  }

  if (gameState.energy < energyCost + 10) {
    warnings.push("⚠️ Will be very low on energy after this race");
  }

  if (blockers.length > 0) {
    warnings.push("Complete all requirements before entering");
  }

  const eligible = blockers.length === 0;

  return {
    canEnter: eligible,
    eligible,
    blockers,
    warnings,
    cost: {
      entryFee,
      energyCost,
      total: entryFee,
    },
  };
}

/**
 * Process race entry - deduct fee and update state.
 */
export function processRaceEntry(
  economy: EconomyState,
  gameState: GameState,
  raceTier: RaceTier,
  raceName: string,
  prerequisites?: RacePrerequisites,
): {
  economy: EconomyState;
  gameState: GameState;
  success: boolean;
  validation: EntryValidation;
} {
  // Validate first
  const validation = validateRaceEntry(economy, gameState, raceTier, prerequisites);

  if (!validation.eligible) {
    return { economy, gameState, success: false, validation };
  }

  // Deduct entry fee
  const entryFee = prerequisites?.entryFee ?? getEntryFee(raceTier);
  const { economy: updatedEconomy, success } = spendRaceEntry(
    economy,
    gameState,
    entryFee,
    raceName,
  );

  return {
    economy: updatedEconomy,
    gameState: {
      ...gameState,
      energy: gameState.energy - 25, // Deduct energy for compete action
    },
    success,
    validation,
  };
}

/**
 * Get a human-readable description of race tier.
 */
export function getRaceTierLabel(tier: RaceTier): string {
  const labels: Record<RaceTier, string> = {
    local: "Local Race",
    regional: "Regional Event",
    state: "State Championship",
    national: "National Championship",
    international: "International Elite Event",
  };
  return labels[tier];
}

/**
 * Get difficulty description for a race tier.
 */
export function getRaceDifficulty(tier: RaceTier): {
  label: string;
  color: string;
} {
  const difficulties: Record<RaceTier, { label: string; color: string }> = {
    local: { label: "Beginner", color: "text-green-500" },
    regional: { label: "Intermediate", color: "text-blue-500" },
    state: { label: "Advanced", color: "text-purple-500" },
    national: { label: "Elite", color: "text-orange-500" },
    international: { label: "Legendary", color: "text-red-500" },
  };
  return difficulties[tier];
}
