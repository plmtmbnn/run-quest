/**
 * Routines and the fast-forward loop — the compression layer that turns a
 * 13k-24k-day lifetime into a handful of player decisions.
 *
 * A routine is 7 daily slots (Mon..Sun). Fast-forward runs the routine day by
 * day and stops at a week/month boundary, the next scheduled event, or death.
 */

import { applyAction, getAction } from "./actions";
import { daysRemaining, deriveDate, endDay, isDead } from "./calendar";
import {
  type CalendarEvent,
  DAYS_PER_MONTH,
  DAYS_PER_WEEK,
  type GameState,
  type RoutineSlot,
} from "./time-types";

export type FastForwardMode = "day" | "week" | "month" | "event";

/** Supplies the events scheduled to fire on a given in-game day. */
export type EventProvider = (dayIndex: number) => CalendarEvent[];

/**
 * Resolve a single routine slot into a new state.
 * - Multi-day actions (or "rest") already advance the calendar themselves.
 * - Same-day actions are applied, then the day is ended.
 */
export function resolveSlot(state: GameState, slot: RoutineSlot): GameState {
  const action = getAction(slot);
  if (action.dayCost > 0) return applyAction(state, action);
  return endDay(applyAction(state, action));
}

/** Run the routine slot for the current day of week and advance the calendar. */
export function executeRoutineDay(state: GameState): GameState {
  const dow = deriveDate(state).dayOfWeek;
  const slot = state.routine[dow] ?? "rest";
  return resolveSlot(state, slot);
}

/** Absolute day index at which the given fast-forward mode should stop. */
function computeStop(
  state: GameState,
  mode: FastForwardMode,
  eventsForDay: EventProvider,
): number {
  const date = deriveDate(state);
  if (mode === "day") return state.dayIndex + 1;
  if (mode === "week") return state.dayIndex + DAYS_PER_WEEK; // Sprint 29 Task 1: Advance by exactly 7 days
  if (mode === "month") {
    const intoMonth = date.week * DAYS_PER_WEEK + date.dayOfWeek;
    return state.dayIndex + (DAYS_PER_MONTH - intoMonth);
  }
  // event: first future day that has an event, else the final day of life.
  const horizon = state.dayIndex + daysRemaining(state);
  for (let d = state.dayIndex + 1; d <= horizon; d++) {
    if (eventsForDay(d).length > 0) return d;
  }
  return horizon + 1;
}

/**
 * Fast-forward the calendar. Returns the resulting state plus any events that
 * halted the run (empty if it stopped at a boundary or death). The world only
 * moves inside this loop — never on the real clock.
 * 
 * Sprint 29 Issue 1: Fixed "week" mode to complete full 7 days even with events
 * Fix: Only halt on events AFTER advancing at least 1 day, so rest actions work
 */
export function fastForward(
  state: GameState,
  mode: FastForwardMode,
  eventsForDay: EventProvider = () => [],
): { state: GameState; events: CalendarEvent[] } {
  const stop = computeStop(state, mode, eventsForDay);
  let current = state;
  let hasAdvanced = false; // Track if we've advanced at least 1 day

  while (true) {
    if (isDead(current)) return { state: current, events: [] };
    
    // Halt on any scheduled event ONLY after we've advanced at least 1 day
    // This ensures rest (1 week) completes full 7 days even with registered races
    const dayEvents = eventsForDay(current.dayIndex);
    if (hasAdvanced && dayEvents.length > 0) {
      return { state: current, events: dayEvents };
    }
    
    if (current.dayIndex >= stop) {
      return { state: current, events: [] };
    }
    
    current = executeRoutineDay(current);
    hasAdvanced = true;
  }
}
