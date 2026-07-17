/**
 * Action system + starter catalog for the time engine.
 *
 * Actions are declarative: an `energyCost` (intra-day), a `dayCost` (whole days),
 * optional age/resource `requires`, and additive `effects`. Applying an action
 * is a pure transform of GameState.
 */

import {
  earnAchievementBonus,
  earnChampionshipBonus,
  earnFromWork,
  earnRacePrize,
  earnSponsorPayout,
  earnStreakMilestone,
  spendRaceEntry,
  spendStreakProtection,
  spendTreatment,
} from "../../economy/earning-engine";
import { getEntryFee } from "../../economy/economy-balance";
import {
  claimMonthlyStipend,
  getRaceBonus,
  getTrainingBonus,
  getWinBonus,
} from "../../economy/sponsorship-engine";
import type { WorkType, WorkTypeId } from "../../economy/work-types";
import { isWorkTypeUnlocked, WORK_TYPES } from "../../economy/work-types";
import { deriveDate } from "./calendar";
import type { Action, ActionId, GameState, StatKey } from "./time-types";
import { RETIREMENT_AGE } from "./time-types";

/** The starter action catalog. Competition resolution is layered by the social engine. */
export const STARTER_ACTIONS: Record<ActionId, Action> = {
  work: {
    id: "work",
    label: "Work",
    energyCost: 40,
    dayCost: 0,
    requires: { minAge: 18, maxAge: RETIREMENT_AGE },
    effects: { stats: { health: -2 } }, // Money handling is now externalized to earnFromWork
  },
  study: {
    id: "study",
    label: "Study",
    energyCost: 35,
    dayCost: 0,
    requires: { maxAge: 30 },
    effects: { money: -10, stats: { intellect: 3 } },
  },
  train: {
    id: "train",
    label: "Train",
    energyCost: 30,
    dayCost: 0,
    effects: { stats: { strength: 2, health: -1 }, skills: { running: 1 } },
  },
  social: {
    id: "social",
    label: "Social",
    energyCost: 20,
    dayCost: 0,
    effects: { stats: { charisma: 1 }, relationships: { network: 2 } },
  },
  compete: {
    id: "compete",
    label: "Compete",
    energyCost: 25,
    dayCost: 0,
    effects: {
      stats: { strength: 1 },
      skills: { running: 1 },
      relationships: { network: 1 },
    },
  },
  rest: {
    id: "rest",
    label: "Rest",
    energyCost: 0,
    dayCost: 1,
    effects: { stats: { health: 10 } },
  },
  travel: {
    id: "travel",
    label: "Travel",
    energyCost: 0,
    dayCost: 2,
    effects: { flags: { relocated: true } },
  },
};

/** Look up a built-in action by id. */
export function getAction(id: ActionId): Action {
  return STARTER_ACTIONS[id];
}

/**
 * Create a work action from a work type.
 * Extended action with work type metadata for dynamic pay calculation.
 */
export function createWorkAction(
  workType: WorkType,
): Action & { workTypeId: WorkTypeId } {
  return {
    id: "work",
    label: workType.name,
    energyCost: workType.energyCost,
    dayCost: workType.dayCost,
    requires: {
      minAge: workType.requirements.minAge,
      maxAge: workType.requirements.maxAge,
    },
    effects: {
      stats: workType.effects || {},
    },
    workTypeId: workType.id,
  };
}

/**
 * Get all available work options for the player.
 * Returns work actions that are currently unlocked.
 */
export function getAvailableWorkActions(
  gameState: GameState,
): Array<Action & { workTypeId: WorkTypeId }> {
  return Object.values(WORK_TYPES)
    .filter((workType) => isWorkTypeUnlocked(workType, gameState))
    .map((workType) => createWorkAction(workType));
}

/**
 * Get all work actions with unlock status (for UI display).
 */
export function getAllWorkActionsWithStatus(gameState: GameState): Array<{
  action: Action & { workTypeId: WorkTypeId };
  unlocked: boolean;
  missingRequirements: string[];
}> {
  return Object.values(WORK_TYPES).map((workType) => {
    const unlocked = isWorkTypeUnlocked(workType, gameState);
    const action = createWorkAction(workType);
    const missingRequirements: string[] = [];

    // Check missing requirements
    const req = workType.requirements;
    const { age } = deriveDate(gameState);
    const stats = gameState.stats;
    const skills = gameState.skills;

    if (req.minAge !== undefined && age < req.minAge) {
      missingRequirements.push(`Age ${req.minAge}+`);
    }
    if (
      req.minIntellect !== undefined &&
      (stats.intellect ?? 0) < req.minIntellect
    ) {
      missingRequirements.push(`Intellect ${req.minIntellect}+`);
    }
    if (
      req.minCharisma !== undefined &&
      (stats.charisma ?? 0) < req.minCharisma
    ) {
      missingRequirements.push(`Charisma ${req.minCharisma}+`);
    }
    if (
      req.minRunningSkill !== undefined &&
      (skills.running ?? 0) < req.minRunningSkill
    ) {
      missingRequirements.push(`Running ${req.minRunningSkill}+`);
    }
    if (req.hasActiveSponsor && !gameState.sponsorship?.currentSponsor) {
      missingRequirements.push("Active sponsor");
    }

    return { action, unlocked, missingRequirements };
  });
}

/** Whether the state can currently pay the action's energy, age and resource costs. */
export function canAfford(state: GameState, action: Action): boolean {
  if (action.energyCost > state.energy) return false;
  const req = action.requires;
  if (!req) return true;

  const { age } = deriveDate(state);
  if (req.minAge !== undefined && age < req.minAge) return false;
  if (req.maxAge !== undefined && age > req.maxAge) return false;
  if (req.money !== undefined && state.resources.money < req.money)
    return false;

  if (req.stats) {
    for (const key of Object.keys(req.stats) as StatKey[]) {
      if (state.stats[key] < (req.stats[key] ?? 0)) return false;
    }
  }
  return true;
}

const clampHealth = (value: number): number =>
  Math.max(0, Math.min(100, value));

/** Apply an action's effects, advancing the calendar if it has a day cost. */
export function applyAction(state: GameState, action: Action): GameState {
  if (!canAfford(state, action)) return state;

  const stats = { ...state.stats };
  const resources = { ...state.resources };
  const skills = { ...state.skills };
  const relationships = { ...state.relationships };
  const flags = { ...state.flags };

  const e = action.effects;
  if (e.stats) {
    for (const key of Object.keys(e.stats) as StatKey[]) {
      const delta = e.stats[key] ?? 0;
      stats[key] =
        key === "health" ? clampHealth(stats[key] + delta) : stats[key] + delta;
    }
  }
  if (e.skills) {
    for (const key of Object.keys(e.skills)) {
      skills[key] = (skills[key] ?? 0) + (e.skills[key] ?? 0);
    }
  }
  if (e.relationships) {
    for (const key of Object.keys(e.relationships)) {
      relationships[key] =
        (relationships[key] ?? 0) + (e.relationships[key] ?? 0);
    }
  }
  if (e.flags) {
    for (const key of Object.keys(e.flags)) {
      flags[key] = e.flags[key];
    }
  }

  const dayIndex =
    action.dayCost > 0 ? state.dayIndex + action.dayCost : state.dayIndex;
  const energy =
    action.dayCost > 0 ? state.energyMax : state.energy - action.energyCost;

  let updatedState: GameState = {
    ...state,
    dayIndex,
    energy,
    stats,
    resources,
    skills,
    relationships,
    flags,
  };

  // Handle specific action logic that impacts new systems
  if (action.id === "work") {
    // Extract work type from action metadata if provided, or default to active job
    const age = deriveDate(updatedState).age;
    const defaultJob = age >= 18 ? "full_time" : "part_time";
    const activeJobId = (updatedState.flags.activeJobId as WorkTypeId) || defaultJob;
    const workTypeId = (action as any).workTypeId as WorkTypeId | undefined || activeJobId;

    const { economy: newEconomy } = earnFromWork(
      updatedState.economy,
      updatedState,
      workTypeId,
    );
    updatedState = {
      ...updatedState,
      economy: newEconomy,
      flags: {
        ...updatedState.flags,
        lastWorkedDay: updatedState.dayIndex,
      },
    };
  }

  // Handle sponsor payouts if applicable (e.g., monthly stipend check on new day)
  if (action.dayCost > 0) {
    const { sponsorshipState: newSponsorship, amount } = claimMonthlyStipend(
      updatedState.sponsorship,
      updatedState.dayIndex,
    );
    if (amount > 0) {
      const { economy: newEconomy } = earnSponsorPayout(
        updatedState.economy,
        updatedState,
        updatedState.sponsorship.currentSponsor || "Unknown",
        amount,
        "Monthly Stipend",
      );
      updatedState = { ...updatedState, economy: newEconomy };
    }
    updatedState = { ...updatedState, sponsorship: newSponsorship };
  }

  // Synchronize timeline resources.money with unified economy balance
  updatedState.resources.money = updatedState.economy.currentBalance;

  return updatedState;
}
