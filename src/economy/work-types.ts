/**
 * Work Types Configuration (Sprint 26.5 - Task 1)
 *
 * Defines multiple work options with varying requirements, pay, and energy costs.
 * Provides player variety and income progression tied to character development.
 */

import { deriveDate } from "../engine/timeline/calendar";
import type { GameState } from "../engine/timeline/time-types";

export type WorkTypeId =
  | "part_time"
  | "full_time"
  | "freelance"
  | "coaching"
  | "sponsor_event"
  | "corporate";

export interface WorkType {
  id: WorkTypeId;
  name: string;
  description: string;

  /** Base pay range (can vary based on player stats) */
  pay: {
    min: number;
    max: number;
  };

  /** Energy cost to perform this work */
  energyCost: number;

  /** Time cost in days */
  dayCost: number;

  /** Requirements to unlock this work type */
  requirements: {
    minAge?: number;
    maxAge?: number;
    minIntellect?: number;
    minRunningSkill?: number;
    minCharisma?: number;
    hasActiveSponsor?: boolean;
    minCareerWins?: number;
  };

  /** Which stats influence pay (higher stat = higher pay) */
  payScaling?: {
    intellect?: number; // Pay multiplier per intellect point
    running?: number; // Pay multiplier per running skill point
    charisma?: number; // Pay multiplier per charisma point
  };

  /** Side effects on stats */
  effects?: {
    health?: number;
    intellect?: number;
    charisma?: number;
  };

  /** Visual presentation */
  icon?: string;
  color?: string;
}

/**
 * All available work types in the game.
 */
export const WORK_TYPES: Record<WorkTypeId, WorkType> = {
  part_time: {
    id: "part_time",
    name: "Part-time Job",
    description:
      "Low-stress work at a local shop. Always available, modest pay.",
    pay: { min: 30, max: 30 },
    energyCost: 25,
    dayCost: 0,
    requirements: {
      minAge: 16,
    },
    effects: {
      health: -1,
    },
    icon: "🏪",
    color: "#94a3b8",
  },

  full_time: {
    id: "full_time",
    name: "Full-time Work",
    description: "Standard job with steady income. The baseline option.",
    pay: { min: 50, max: 50 },
    energyCost: 40,
    dayCost: 0,
    requirements: {
      minAge: 18,
    },
    effects: {
      health: -2,
    },
    icon: "💼",
    color: "#64748b",
  },

  freelance: {
    id: "freelance",
    name: "Freelance Gig",
    description:
      "Contract work with variable pay. Higher intellect earns more.",
    pay: { min: 40, max: 80 },
    energyCost: 30,
    dayCost: 0,
    requirements: {
      minAge: 18,
      minIntellect: 50,
    },
    payScaling: {
      intellect: 0.5, // +$0.50 per intellect point above 50
    },
    effects: {
      health: -1,
      intellect: 1,
    },
    icon: "💻",
    color: "#3b82f6",
  },

  coaching: {
    id: "coaching",
    name: "Running Coach",
    description: "Train other runners. Pay scales with your running skill.",
    pay: { min: 60, max: 120 },
    energyCost: 35,
    dayCost: 0,
    requirements: {
      minAge: 21,
      minRunningSkill: 30,
    },
    payScaling: {
      running: 1.0, // +$1 per running skill point above 30
    },
    effects: {
      health: -1,
      charisma: 1,
    },
    icon: "🏃‍♂️",
    color: "#22c55e",
  },

  sponsor_event: {
    id: "sponsor_event",
    name: "Sponsorship Event",
    description: "Paid appearance for your sponsor. Best pay/energy ratio.",
    pay: { min: 100, max: 300 },
    energyCost: 20,
    dayCost: 0,
    requirements: {
      hasActiveSponsor: true,
      minCharisma: 40,
    },
    payScaling: {
      charisma: 2.0, // +$2 per charisma point above 40
    },
    effects: {
      charisma: 2,
    },
    icon: "⭐",
    color: "#f59e0b",
  },

  corporate: {
    id: "corporate",
    name: "Corporate Work",
    description: "High-paying office job. Demanding but lucrative.",
    pay: { min: 100, max: 100 },
    energyCost: 50,
    dayCost: 0,
    requirements: {
      minAge: 25,
      minIntellect: 60,
    },
    effects: {
      health: -3,
      intellect: 1,
    },
    icon: "🏢",
    color: "#8b5cf6",
  },
};

/**
 * Check if a work type is unlocked for the player.
 */
export function isWorkTypeUnlocked(
  workType: WorkType,
  gameState: GameState,
): boolean {
  const req = workType.requirements;
  const { age } = deriveDate(gameState);
  const stats = gameState.stats;
  const skills = gameState.skills;
  const flags = gameState.flags;

  // Age requirements
  if (req.minAge !== undefined && age < req.minAge) return false;
  if (req.maxAge !== undefined && age > req.maxAge) return false;

  // Stat requirements
  if (
    req.minIntellect !== undefined &&
    (stats.intellect ?? 0) < req.minIntellect
  )
    return false;
  if (req.minCharisma !== undefined && (stats.charisma ?? 0) < req.minCharisma)
    return false;

  // Skill requirements
  if (
    req.minRunningSkill !== undefined &&
    (skills.running ?? 0) < req.minRunningSkill
  )
    return false;

  // Sponsor requirement
  if (req.hasActiveSponsor && !gameState.sponsorship?.currentSponsor)
    return false;

  // Career wins requirement
  if (
    req.minCareerWins !== undefined &&
    ((flags.career_wins as number) ?? 0) < req.minCareerWins
  )
    return false;

  return true;
}

/**
 * Calculate actual pay for a work type based on player stats.
 */
export function calculateWorkPay(
  workType: WorkType,
  gameState: GameState,
): number {
  let pay = workType.pay.min;

  // If no scaling, return fixed pay (or max if min == max)
  if (!workType.payScaling) {
    return workType.pay.max;
  }

  // Apply scaling based on player stats
  const stats = gameState.stats;
  const skills = gameState.skills;

  if (workType.payScaling.intellect) {
    const intellectAboveMin = Math.max(
      0,
      (stats.intellect ?? 0) - (workType.requirements.minIntellect ?? 0),
    );
    pay += intellectAboveMin * workType.payScaling.intellect;
  }

  if (workType.payScaling.running) {
    const runningAboveMin = Math.max(
      0,
      (skills.running ?? 0) - (workType.requirements.minRunningSkill ?? 0),
    );
    pay += runningAboveMin * workType.payScaling.running;
  }

  if (workType.payScaling.charisma) {
    const charismaAboveMin = Math.max(
      0,
      (stats.charisma ?? 0) - (workType.requirements.minCharisma ?? 0),
    );
    pay += charismaAboveMin * workType.payScaling.charisma;
  }

  // Clamp to max pay
  return Math.min(pay, workType.pay.max);
}

/**
 * Get all available (unlocked) work types for the player.
 */
export function getAvailableWorkTypes(gameState: GameState): WorkType[] {
  return Object.values(WORK_TYPES).filter((workType) =>
    isWorkTypeUnlocked(workType, gameState),
  );
}

/**
 * Get all work types with unlock status.
 */
export function getAllWorkTypesWithStatus(gameState: GameState): Array<{
  workType: WorkType;
  unlocked: boolean;
  estimatedPay: number;
  missingRequirements: string[];
}> {
  return Object.values(WORK_TYPES).map((workType) => {
    const unlocked = isWorkTypeUnlocked(workType, gameState);
    const estimatedPay = unlocked
      ? calculateWorkPay(workType, gameState)
      : workType.pay.min;
    const missingRequirements = getMissingRequirements(workType, gameState);

    return {
      workType,
      unlocked,
      estimatedPay,
      missingRequirements,
    };
  });
}

/**
 * Get human-readable missing requirements for a work type.
 */
function getMissingRequirements(
  workType: WorkType,
  gameState: GameState,
): string[] {
  const missing: string[] = [];
  const req = workType.requirements;
  const { age } = deriveDate(gameState);
  const stats = gameState.stats;
  const skills = gameState.skills;
  const flags = gameState.flags;

  if (req.minAge !== undefined && age < req.minAge) {
    missing.push(`Age ${req.minAge}+ required (currently ${age})`);
  }

  if (req.maxAge !== undefined && age > req.maxAge) {
    missing.push(`Age ${req.maxAge} or younger required (currently ${age})`);
  }

  if (
    req.minIntellect !== undefined &&
    (stats.intellect ?? 0) < req.minIntellect
  ) {
    missing.push(
      `Intellect ${req.minIntellect}+ required (currently ${stats.intellect ?? 0})`,
    );
  }

  if (
    req.minCharisma !== undefined &&
    (stats.charisma ?? 0) < req.minCharisma
  ) {
    missing.push(
      `Charisma ${req.minCharisma}+ required (currently ${stats.charisma ?? 0})`,
    );
  }

  if (
    req.minRunningSkill !== undefined &&
    (skills.running ?? 0) < req.minRunningSkill
  ) {
    missing.push(
      `Running skill ${req.minRunningSkill}+ required (currently ${skills.running ?? 0})`,
    );
  }

  if (req.hasActiveSponsor && !gameState.sponsorship?.currentSponsor) {
    missing.push("Active sponsor required");
  }

  if (
    req.minCareerWins !== undefined &&
    ((flags.career_wins as number) ?? 0) < req.minCareerWins
  ) {
    missing.push(
      `${req.minCareerWins} career wins required (currently ${(flags.career_wins as number) ?? 0})`,
    );
  }

  return missing;
}

/**
 * Get work type by ID.
 */
export function getWorkTypeById(id: WorkTypeId): WorkType | undefined {
  return WORK_TYPES[id];
}

/**
 * Get work efficiency (pay per energy).
 */
export function getWorkEfficiency(workType: WorkType, pay: number): number {
  return pay / workType.energyCost;
}
