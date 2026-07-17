/**
 * Calendar math and day-transition primitives for the time engine.
 * Pure functions: no randomness, no I/O, no React.
 */

import { SeededRandom } from "@/utils/random/seeded-random";
import { DEFAULT_ECONOMY_STATE } from "../../economy/economy-types";
import { DEFAULT_SPONSORSHIP_STATE } from "../../economy/sponsorship-types";
import { DEFAULT_SCHEDULING_STATE } from "../../scheduling/race-calendar-types";
import type { DateInfo, GameState } from "./time-types";
import {
  DAYS_PER_MONTH,
  DAYS_PER_WEEK,
  DAYS_PER_YEAR,
  ENERGY_MAX,
  MAX_LIFESPAN,
  MAX_START_AGE,
  MIN_LIFESPAN,
  MIN_START_AGE,
} from "./time-types";

/** Derive the calendar position from the global day index. */
export function deriveDate(state: GameState): DateInfo {
  const yearsElapsed = Math.floor(state.dayIndex / DAYS_PER_YEAR);
  const age = state.startAge + yearsElapsed;
  const dayOfLife = state.dayIndex % DAYS_PER_YEAR;
  const month = Math.floor(dayOfLife / DAYS_PER_MONTH);
  const dayOfMonth = dayOfLife % DAYS_PER_MONTH;
  const week = Math.floor(dayOfMonth / DAYS_PER_WEEK);
  const dayOfWeek = dayOfMonth % DAYS_PER_WEEK;
  return { age, yearOffset: yearsElapsed, month, week, dayOfWeek };
}

/** Whole days left before the rolled lifespan is reached. */
export function daysRemaining(state: GameState): number {
  const totalDays = (state.lifespan - state.startAge) * DAYS_PER_YEAR;
  return Math.max(0, totalDays - state.dayIndex);
}

/** True once the player's age reaches the rolled lifespan. */
export function isDead(state: GameState): boolean {
  return deriveDate(state).age >= state.lifespan;
}

/** Advance exactly one day and refill the energy meter. */
export function endDay(state: GameState): GameState {
  return { ...state, dayIndex: state.dayIndex + 1, energy: state.energyMax };
}

/**
 * Create a fresh life. Start age (18-30) and lifespan (70-90) are rolled from a
 * seed so a given seed always produces the same character (deterministic).
 */
export function createInitialState(seed: number): GameState {
  const rng = new SeededRandom(seed);
  const startAge = Math.floor(rng.nextRange(MIN_START_AGE, MAX_START_AGE + 1));
  const lifespan = Math.floor(rng.nextRange(MIN_LIFESPAN, MAX_LIFESPAN + 1));
  return {
    dayIndex: 0,
    startAge,
    lifespan,
    seed,
    energy: ENERGY_MAX,
    energyMax: ENERGY_MAX,
    resources: { money: 0 },
    stats: { health: 100, strength: 0, intellect: 0, charisma: 0 },
    skills: {},
    relationships: {},
    routine: ["work", "work", "work", "work", "work", "train", "social"],
    flags: {},
    economy: DEFAULT_ECONOMY_STATE,
    sponsorship: DEFAULT_SPONSORSHIP_STATE,
    scheduling: DEFAULT_SCHEDULING_STATE,
  };
}
