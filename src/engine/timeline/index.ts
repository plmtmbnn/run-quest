/**
 * Time & Calendar Engine (Sprint 23-B) — public surface.
 *
 * Pure, deterministic, framework-agnostic. UI and stores consume this barrel;
 * the engine never imports React, storage, or feature code.
 */

export { applyAction, canAfford, getAction, STARTER_ACTIONS } from "./actions";
export {
  createInitialState,
  daysRemaining,
  deriveDate,
  endDay,
  isDead,
} from "./calendar";
export type { EventProvider, FastForwardMode } from "./routine";
export { executeRoutineDay, fastForward, resolveSlot } from "./routine";
export {
  getScheduledStoryEvents,
  storyEventsToCalendarEvents,
} from "./story-adapter";
export type {
  Action,
  ActionEffect,
  ActionId,
  ActionRequirements,
  CalendarEvent,
  CalendarEventType,
  DateInfo,
  GameFlags,
  GameState,
  PlayerResources,
  PlayerStats,
  Routine,
  RoutineSlot,
  StatKey,
} from "./time-types";
export {
  DAYS_PER_MONTH,
  DAYS_PER_WEEK,
  DAYS_PER_YEAR,
  ENERGY_MAX,
  MAX_LIFESPAN,
  MAX_START_AGE,
  MIN_LIFESPAN,
  MIN_START_AGE,
  RETIREMENT_AGE,
} from "./time-types";
