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
  | "corporate"
  | "brand_ambassador"
  | "marathon_trainer"
  | "coach"
  | "content_creator"      // Sprint 29 Task 6
  | "personal_trainer"     // Sprint 29 Task 6
  | "sports_nutritionist"  // Sprint 29 Task 6
  | "running_store_staff"  // Sprint 29 Task 6
  | "event_organizer"      // Sprint 29 Task 6
  | "warehouse_worker"     // Sprint 30 - New jobs
  | "delivery_driver"      // Sprint 30 - New jobs
  | "social_media_manager" // Sprint 30 - New jobs
  | "physical_therapist"   // Sprint 30 - New jobs
  | "race_official";       // Sprint 30 - New jobs

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
    strength?: number; // Pay multiplier per strength point
  };

  /** Side effects on stats */
  effects?: {
    health?: number;
    intellect?: number;
    charisma?: number;
    running?: number;
    strength?: number;
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
  // New entertaining work types
  coach: {
    id: "coach",
    name: "Fitness Coach",
    description: "Guide others on workouts. Small pay, high charisma boost.",
    pay: { min: 200, max: 200 },
    energyCost: 30,
    dayCost: 0,
    requirements: { minAge: 22, minCharisma: 30 },
    payScaling: { charisma: 1.5 },
    effects: { charisma: 2, health: -1 },
    icon: "🏅",
    color: "#f97316",
  },
  brand_ambassador: {
    id: "brand_ambassador",
    name: "Brand Ambassador",
    description: "Promote brands, earn commissions. Requires social flair.",
    pay: { min: 150, max: 150 },
    energyCost: 25,
    dayCost: 0,
    requirements: { minAge: 25, minCharisma: 35 },
    payScaling: { charisma: 2.0 },
    effects: { charisma: 3 },
    icon: "📣",
    color: "#eab308",
  },
  marathon_trainer: {
    id: "marathon_trainer",
    name: "Marathon Trainer",
    description: "Train runners for marathons. High stamina payoff.",
    pay: { min: 250, max: 250 },
    energyCost: 40,
    dayCost: 0,
    requirements: { minAge: 28, minRunningSkill: 40 },
    payScaling: { running: 1.2 },
    effects: { running: 1, health: -2 },
    icon: "🏃‍♀️",
    color: "#10b981",
  },
  
  // ═══════════════════════════════════════════════════════
  // Sprint 29 Task 6: New Work Types
  // ═══════════════════════════════════════════════════════
  
  content_creator: {
    id: "content_creator",
    name: "Content Creator",
    description: "Create running content for social media. Build your brand while earning.",
    pay: { min: 40, max: 80 },
    energyCost: 30,
    dayCost: 0,
    requirements: {
      minAge: 16,
      minCharisma: 15,
    },
    payScaling: {
      charisma: 2.5,
    },
    effects: {
      charisma: 1,
      health: -1,
    },
    icon: "🎬",
    color: "#ec4899",
  },
  
  personal_trainer: {
    id: "personal_trainer",
    name: "Personal Trainer",
    description: "Train clients one-on-one. Use your running expertise to help others.",
    pay: { min: 60, max: 120 },
    energyCost: 35,
    dayCost: 0,
    requirements: {
      minAge: 18,
      minRunningSkill: 25,
    },
    payScaling: {
      running: 2.0,
    },
    effects: {
      running: 1,
      health: -2,
    },
    icon: "💪",
    color: "#f59e0b",
  },
  
  sports_nutritionist: {
    id: "sports_nutritionist",
    name: "Sports Nutritionist",
    description: "Advise athletes on nutrition and diet. Blend knowledge with running experience.",
    pay: { min: 80, max: 150 },
    energyCost: 25,
    dayCost: 0,
    requirements: {
      minAge: 20,
      minIntellect: 20,
      minRunningSkill: 15,
    },
    payScaling: {
      intellect: 2.0,
      running: 1.5,
    },
    effects: {
      intellect: 2,
      health: 1,
    },
    icon: "🥗",
    color: "#10b981",
  },
  
  running_store_staff: {
    id: "running_store_staff",
    name: "Running Store Staff",
    description: "Work at a specialty running store. Help customers find the right gear.",
    pay: { min: 35, max: 50 },
    energyCost: 25,
    dayCost: 0,
    requirements: {
      minAge: 16,
    },
    payScaling: {
      charisma: 0.5,
    },
    effects: {
      charisma: 1,
      health: -1,
    },
    icon: "👟",
    color: "#6366f1",
  },
  
  event_organizer: {
    id: "event_organizer",
    name: "Event Organizer",
    description: "Organize running events and races. Leadership and experience required.",
    pay: { min: 100, max: 200 },
    energyCost: 40,
    dayCost: 0,
    requirements: {
      minAge: 25,
      minCharisma: 25,
      minIntellect: 20,
      minCareerWins: 5,
    },
    payScaling: {
      charisma: 3.0,
      intellect: 2.0,
    },
    effects: {
      charisma: 2,
      intellect: 1,
      health: -2,
    },
    icon: "📋",
    color: "#8b5cf6",
  },
  // End of Sprint 29 work types

  // Sprint 30 - New diverse work types
  warehouse_worker: {
    id: "warehouse_worker",
    name: "Warehouse Worker",
    description: "Physical labor loading and unloading packages. Low requirements, decent pay.",
    pay: { min: 40, max: 55 },
    energyCost: 35,
    dayCost: 0,
    requirements: {
      minAge: 18,
    },
    payScaling: {
      strength: 0.5,
    },
    effects: {
      strength: 1,
      health: -2,
    },
    icon: "📦",
    color: "#94a3b8",
  },

  delivery_driver: {
    id: "delivery_driver",
    name: "Delivery Driver",
    description: "Deliver packages around the city. Flexible hours, moderate pay.",
    pay: { min: 45, max: 70 },
    energyCost: 30,
    dayCost: 0,
    requirements: {
      minAge: 21,
    },
    payScaling: {
      intellect: 0.3,
      charisma: 0.5,
    },
    effects: {
      charisma: 1,
      health: -1,
    },
    icon: "🚚",
    color: "#f59e0b",
  },

  social_media_manager: {
    id: "social_media_manager",
    name: "Social Media Manager",
    description: "Manage social media for local businesses. Charisma and creativity focused.",
    pay: { min: 60, max: 120 },
    energyCost: 25,
    dayCost: 0,
    requirements: {
      minAge: 20,
      minCharisma: 20,
      minIntellect: 15,
    },
    payScaling: {
      charisma: 2.5,
      intellect: 1.5,
    },
    effects: {
      charisma: 2,
      intellect: 1,
    },
    icon: "📱",
    color: "#ec4899",
  },

  physical_therapist: {
    id: "physical_therapist",
    name: "Physical Therapist",
    description: "Help athletes recover from injuries. Running knowledge and intellect required.",
    pay: { min: 80, max: 150 },
    energyCost: 30,
    dayCost: 0,
    requirements: {
      minAge: 24,
      minIntellect: 30,
      minRunningSkill: 20,
    },
    payScaling: {
      intellect: 2.0,
      running: 1.5,
    },
    effects: {
      intellect: 2,
      health: 1,
      running: 1,
    },
    icon: "🏥",
    color: "#06b6d4",
  },

  race_official: {
    id: "race_official",
    name: "Race Official",
    description: "Officiate at running events. Requires race experience and professionalism.",
    pay: { min: 70, max: 110 },
    energyCost: 25,
    dayCost: 0,
    requirements: {
      minAge: 25,
      minCareerWins: 3,
      minRunningSkill: 15,
      minIntellect: 18,
    },
    payScaling: {
      running: 1.5,
      intellect: 1.0,
    },
    effects: {
      intellect: 1,
      charisma: 1,
    },
    icon: "🏁",
    color: "#8b5cf6",
  },
  // End of Sprint 30 work types
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

  if (workType.payScaling.strength) {
    const strengthAboveMin = Math.max(
      0,
      (stats.strength ?? 0) - 0, // No minStrength requirement in current interface
    );
    pay += strengthAboveMin * workType.payScaling.strength;
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
