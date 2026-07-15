/**
 * Core type definitions for the Time & Calendar Engine (Sprint 23-B).
 *
 * Time model: a single global `dayIndex` from birth drives a flat calendar of
 * Years -> Months (4 weeks) -> Weeks (7 days) -> Days. The world only advances
 * when an action is committed; it never moves on the real clock.
 */

// ── Calendar constants (flat 4-week months) ────────────────────────────────
export const DAYS_PER_WEEK = 7;
export const WEEKS_PER_MONTH = 4;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_MONTH = DAYS_PER_WEEK * WEEKS_PER_MONTH; // 28
export const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR; // 336

// ── Lifecycle constants ────────────────────────────────────────────────────
export const ENERGY_MAX = 100;
export const MIN_START_AGE = 18;
export const MAX_START_AGE = 30;
export const MIN_LIFESPAN = 70;
export const MAX_LIFESPAN = 90;
export const RETIREMENT_AGE = 65;

/** Mutable player stats tracked by the engine. */
export type StatKey = "health" | "strength" | "intellect" | "charisma";

export interface PlayerStats {
  health: number;
  strength: number;
  intellect: number;
  charisma: number;
}

export interface PlayerResources {
  money: number;
}

/** Declarative, additive effect applied to state by an action. */
export interface ActionEffect {
  money?: number;
  stats?: Partial<PlayerStats>;
  skills?: Record<string, number>;
  relationships?: Record<string, number>;
  flags?: Record<string, string | number | boolean>;
}

export interface ActionRequirements {
  minAge?: number;
  maxAge?: number;
  money?: number;
  stats?: Partial<PlayerStats>;
}

/** Identifiers for built-in actions; extend with care (storage depends on them). */
export type ActionId =
  | "work"
  | "study"
  | "train"
  | "social"
  | "compete"
  | "rest"
  | "travel";

export interface Action {
  id: ActionId;
  label: string;
  /** Intra-day cost; deducted from the day's energy meter. */
  energyCost: number;
  /** Whole-day cost; 0 = same day, N = jump N days (skips energy meters). */
  dayCost: number;
  requires?: ActionRequirements;
  effects: ActionEffect;
}

/** A routine slot is any action, including the built-in rest action. */
export type RoutineSlot = ActionId;
export type Routine = RoutineSlot[];

export type CalendarEventType = "story" | "competition" | "random";

/**
 * An event that can halt fast-forward. `dayIndex` is the in-game day it fires on.
 * The engine never stores events; callers supply them via an EventProvider.
 */
export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  dayIndex: number;
  payload?: unknown;
}

export type GameFlags = Record<string, string | number | boolean>;

/**
 * The full saved game-state slice for the time engine.
 * Derived values (age/month/week/day) are NEVER stored — they are computed.
 */
export interface GameState {
  dayIndex: number;
  startAge: number;
  lifespan: number;
  /** Seed for deterministic randomness (competitions, rolls). */
  seed: number;
  energy: number;
  energyMax: number;
  resources: PlayerResources;
  stats: PlayerStats;
  skills: Record<string, number>;
  relationships: Record<string, number>;
  routine: Routine;
  flags: GameFlags;
}

/** Derived calendar position for a given state. */
export interface DateInfo {
  /** Absolute age = startAge + years elapsed. */
  age: number;
  /** Years since birth (0-based). */
  yearOffset: number;
  /** Month of the current year, 0..11. */
  month: number;
  /** Week within the month, 0..3. */
  week: number;
  /** Day of week, 0 = Monday .. 6 = Sunday. */
  dayOfWeek: number;
}
