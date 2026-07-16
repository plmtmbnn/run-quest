/**
 * Action system + starter catalog for the time engine.
 *
 * Actions are declarative: an `energyCost` (intra-day), a `dayCost` (whole days),
 * optional age/resource `requires`, and additive `effects`. Applying an action
 * is a pure transform of GameState.
 */

import { deriveDate } from "./calendar";
import type { GameState, Action, ActionId, StatKey } from "./time-types";
import { RETIREMENT_AGE } from "./time-types";
import { earnFromWork, earnRacePrize, earnChampionshipBonus, earnSponsorPayout, earnAchievementBonus, earnStreakMilestone, spendRaceEntry, spendTreatment, spendStreakProtection } from "../../economy/earning-engine";
import { getTrainingBonus, getRaceBonus, getWinBonus, claimMonthlyStipend } from "../../economy/sponsorship-engine";
import { getEntryFee } from "../../economy/economy-balance";

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
    const { economy: newEconomy } = earnFromWork(updatedState.economy, updatedState);
    updatedState = { ...updatedState, economy: newEconomy };
  }

  // Handle sponsor payouts if applicable (e.g., monthly stipend check on new day)
  if (action.dayCost > 0) {
    const { sponsorshipState: newSponsorship, amount } = claimMonthlyStipend(updatedState.sponsorship, updatedState.dayIndex);
    if (amount > 0) {
      const { economy: newEconomy } = earnSponsorPayout(updatedState.economy, updatedState, updatedState.sponsorship.currentSponsor || "Unknown", amount, "Monthly Stipend");
      updatedState = { ...updatedState, economy: newEconomy };
    }
    updatedState = { ...updatedState, sponsorship: newSponsorship };
  }

  // Synchronize timeline resources.money with unified economy balance
  updatedState.resources.money = updatedState.economy.currentBalance;

  return updatedState;
}
