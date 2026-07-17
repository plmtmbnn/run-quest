/**
 * Race Entry Engine (Sprint 26 - Task 3)
 *
 * Validates and processes race entry with fee and prerequisites.
 */

import type { GameState } from "../engine/timeline/time-types";
import { spendRaceEntry } from "./earning-engine";
import { getEntryFee } from "./economy-balance";
import type { EconomyState, RaceTier } from "./economy-types";
import { useSettingsStore } from "@/store/settings-store";
import { formatCurrency } from "@/economy/currency-converter";

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
  type:
    | "money"
    | "energy"
    | "level"
    | "rating"
    | "story"
    | "qualification"
    | "schedule"
    | "custom";
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
  options?: {
    onlyRegister?: boolean;
    isRegistered?: boolean;
  }
): EntryValidation {
  const blockers: EntryBlocker[] = [];
  const warnings: string[] = [];

  const onlyRegister = options?.onlyRegister ?? false;
  const isRegistered = options?.isRegistered ?? false;

  // Determine entry fee - if already registered, fee is 0
  const entryFee = isRegistered ? 0 : (prerequisites?.entryFee ?? getEntryFee(raceTier));
  const energyCost = onlyRegister ? 0 : 25; // compete action cost

  const preferredCurrency = useSettingsStore.getState().settings.preferredCurrency || "USD";
  const entryFeeStr = formatCurrency(entryFee, preferredCurrency);
  const balanceStr = formatCurrency(economy.currentBalance, preferredCurrency);

  // Check money
  if (economy.currentBalance < entryFee) {
    blockers.push({
      reason: `Need ${entryFeeStr} to enter (have ${balanceStr})`,
      type: "money",
      resolved: false,
      howToResolve: "Work or win races to earn money",
    });
  }

  // Check energy
  if (energyCost > 0 && gameState.energy < energyCost) {
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
    const rating = (gameState.flags.rating as number) ?? 0;
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
    const chapter = (gameState.flags.storyChapter as number) ?? 0;
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
    const qualified = (gameState.flags.qualified_for_race as boolean) ?? false;
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
  if (entryFee > 0 && economy.currentBalance < entryFee * 0.2) {
    warnings.push("⚠️ Spending most of your money on this race");
  }

  if (energyCost > 0 && gameState.energy < energyCost + 10) {
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
  options?: {
    onlyRegister?: boolean;
    isRegistered?: boolean;
  }
): {
  economy: EconomyState;
  gameState: GameState;
  success: boolean;
  validation: EntryValidation;
} {
  const onlyRegister = options?.onlyRegister ?? false;
  const isRegistered = options?.isRegistered ?? false;

  // Validate first
  const validation = validateRaceEntry(
    economy,
    gameState,
    raceTier,
    prerequisites,
    options
  );

  if (!validation.eligible) {
    return { economy, gameState, success: false, validation };
  }

  // Deduct entry fee if not registered yet
  const entryFee = isRegistered ? 0 : (prerequisites?.entryFee ?? getEntryFee(raceTier));
  let updatedEconomy = economy;
  let success = true;

  if (entryFee > 0) {
    const res = spendRaceEntry(
      economy,
      gameState,
      entryFee,
      raceName,
    );
    updatedEconomy = res.economy;
    success = res.success;
  }

  // Deduct energy if not only registering
  const energyDeduction = onlyRegister ? 0 : 25;

  return {
    economy: updatedEconomy,
    gameState: {
      ...gameState,
      energy: gameState.energy - energyDeduction,
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
