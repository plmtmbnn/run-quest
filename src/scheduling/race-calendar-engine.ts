/**
 * Race Calendar Engine (Sprint 26 - Task 4)
 *
 * Manages when races are available based on the game timeline.
 * No more "race anytime" - races happen on a schedule!
 */

import { calculateExpectedPrize } from "../economy/economy-balance";
import { deriveDate } from "../engine/timeline/calendar";
import type { GameState } from "../engine/timeline/time-types";
import {
  DAYS_PER_MONTH,
  DAYS_PER_WEEK,
  DAYS_PER_YEAR,
} from "../engine/timeline/time-types";
import type {
  RaceOccurrence,
  RaceSchedule,
  SchedulingState,
  CategoryId,
} from "./race-calendar-types";
import { RACE_SCHEDULES, RACE_SCHEDULES_GETTER } from "./race-schedule-database";

/**
 * Build the composite registration key for a specific race occurrence.
 * Each unique (scheduleId × month × game-year) combination produces its own
 * key, so registering for the same monthly race in different months never
 * overwrites each other.
 *
 * Format: `{scheduleId}_m{gameMonth}_y{gameYear}`
 */
export function makeRegistrationKey(
  scheduleId: string,
  dayIndex: number,
): string {
  const gameMonth = Math.floor(dayIndex / DAYS_PER_MONTH) % 12; // 0–11
  const gameYear = Math.floor(dayIndex / DAYS_PER_YEAR); // years since start
  return `${scheduleId}_m${gameMonth}_y${gameYear}`;
}

/**
 * Get all races available to enter TODAY.
 * These are races the player can register for or race right now.
 */
export function getTodaysRaces(
  schedulingState: SchedulingState,
  gameState: GameState,
  currentDayIndex: number,
): RaceOccurrence[] {
  const available: RaceOccurrence[] = [];
  const totalEntrants = 50; // Default field size

  for (const schedule of RACE_SCHEDULES) {
    const occurrence = getRaceOccurrence(
      schedule,
      schedulingState,
      currentDayIndex,
      totalEntrants,
    );
    if (!occurrence) continue;

    // A race on today's date can only be run if:
    // 1. The player is registered for it, OR
    // 2. Registration opens today AND closes today (e.g. tutorial/debut race)
    const isTutorialOrDebut =
      occurrence.registrationOpensAt === occurrence.dayIndex &&
      occurrence.registrationClosesAt === occurrence.dayIndex;

    const canRunToday =
      !occurrence.isCompleted && (occurrence.isRegistered || isTutorialOrDebut);

    if (canRunToday) {
      available.push(occurrence);
    }
  }

  // Sort by tier (local first) then by name
  const tierOrder = {
    local: 0,
    regional: 1,
    state: 2,
    national: 3,
    international: 4,
  };
  available.sort((a, b) => {
    const tierDiff = (tierOrder[a.tier] ?? 0) - (tierOrder[b.tier] ?? 0);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  });

  return available;
}

/**
 * Get upcoming races for the next N days (for calendar preview).
 */
export function getUpcomingRaces(
  schedulingState: SchedulingState,
  currentDayIndex: number,
  daysAhead: number = 336,
): RaceOccurrence[] {
  const upcoming: RaceOccurrence[] = [];
  const totalEntrants = 50;

  for (const schedule of RACE_SCHEDULES) {
    // Check next occurrence of this race within the year window
    for (let offset = 0; offset < daysAhead; offset++) {
      const dayToCheck = currentDayIndex + offset;
      const occurrence = getRaceOccurrence(
        schedule,
        schedulingState,
        dayToCheck,
        totalEntrants,
      );
      if (occurrence && dayToCheck > currentDayIndex) {
        upcoming.push(occurrence);
        break; // Only show the next upcoming occurrence for each race schedule
      }
    }
  }

  // Sort by dayIndex (soonest first)
  upcoming.sort((a, b) => a.dayIndex - b.dayIndex);

  return upcoming;
}

/**
 * Get a specific race occurrence for a given day.
 * Returns null if the race doesn't run on that day.
 */
function getRaceOccurrence(
  schedule: RaceSchedule,
  schedulingState: SchedulingState,
  dayIndex: number,
  defaultEntrants: number,
): RaceOccurrence | null {
  // Check if schedule matches this day
  if (!isRaceOnDay(schedule, dayIndex)) {
    return null;
  }

  // Check if one-time event already completed
  if (
    schedule.schedule.frequency === "one_time" &&
    schedulingState.completedOneTimeEvents.includes(schedule.id)
  ) {
    return null;
  }

  // Build the composite key for this specific occurrence
  const registrationInstanceId = makeRegistrationKey(schedule.id, dayIndex);

  // Check completion — try composite key first, then legacy plain-key format
  const completedDay =
    schedulingState.completedRaces[registrationInstanceId] ??
    schedulingState.completedRaces[`${schedule.id}_${dayIndex}`] ??
    (schedulingState.completedRaces[schedule.id] === dayIndex
      ? dayIndex
      : undefined);
  const isCompleted = completedDay !== undefined;

  // Calculate dates
  const registrationOpensAt = dayIndex - schedule.registration.opensDaysBefore;
  const registrationClosesAt =
    dayIndex - schedule.registration.closesDaysBefore;

  // Count registered entrants — look for any key that starts with scheduleId
  // and whose stored dayIndex matches this occurrence day
  const registeredCount = Object.entries(schedulingState.registered).filter(
    ([id, regVal]) => {
      const regDay = typeof regVal === "object" ? regVal.dayIndex : regVal;
      return id.startsWith(schedule.id) && regDay === dayIndex;
    },
  ).length;

  // Look up registration by composite key first, fall back to legacy plain key
  const regVal =
    schedulingState.registered[registrationInstanceId] ??
    schedulingState.registered[schedule.id];
  const regDay = typeof regVal === "object" ? regVal.dayIndex : regVal;
  const selectedCategoryId =
    typeof regVal === "object" ? regVal.categoryId : undefined;

  const isRegistered = regDay === dayIndex;
  const isFull = schedule.maxEntrants
    ? registeredCount >= schedule.maxEntrants
    : false;

  // Estimate entrants for prize pool calculation
  const entrants = schedule.maxEntrants ?? defaultEntrants;
  const prizePool = calculateExpectedPrize(schedule.entry.fee, entrants, 1) * 5; // Approximate total prize pool (top 5 prizes)

  const yearsElapsed = Math.floor(dayIndex / DAYS_PER_YEAR);
  const gameYear = 2026 + yearsElapsed;
  const occurrenceName = `${schedule.name} ${gameYear}`;

  return {
    scheduleId: schedule.id,
    raceId: schedule.raceId,
    name: occurrenceName,
    locationId: schedule.locationId,
    tier: schedule.tier,
    description: schedule.description,
    dayIndex,
    registrationInstanceId,
    registrationOpensAt,
    registrationClosesAt,
    entryFee: schedule.entry.fee,
    prerequisites: schedule.entry.prerequisites,
    maxEntrants: schedule.maxEntrants,
    categories: schedule.categories,
    selectedCategoryId,
    entrants: registeredCount,
    prizePool,
    icon: schedule.icon,
    color: schedule.color,
    isRegistered,
    isCompleted,
    isFull,
  };
}

/**
 * Check if a race runs on a specific day.
 * Sprint 29 Task 5: Enforce weekend-only races (except daily training races)
 */
function isRaceOnDay(schedule: RaceSchedule, dayIndex: number): boolean {
  const sched = schedule.schedule;

  // Sprint 29 Task 5: Helper to check if a day is a weekend
  // 0 = Sunday, 6 = Saturday in standard week numbering
  const isWeekend = (day: number): boolean => {
    const dayOfWeek = day % DAYS_PER_WEEK;
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  switch (sched.frequency) {
    case "daily":
      // Daily races are low-tier training races, allow every day
      return true;

    case "weekly":
      // Check day of week (0=Sunday, 6=Saturday)
      // Sprint 29: Enforce weekend-only for weekly races
      if (sched.dayOfWeek === undefined) return false;
      const targetDay = sched.dayOfWeek % DAYS_PER_WEEK;
      const currentDay = dayIndex % DAYS_PER_WEEK;
      
      // Only allow if it matches the schedule AND is a weekend
      return currentDay === targetDay && isWeekend(dayIndex);

    case "monthly": {
      // Check day of month (1-28)
      // Sprint 29: Ensure monthly races fall on weekends
      if (sched.dayOfMonth === undefined) return false;
      const dayOfMonth = (dayIndex % DAYS_PER_MONTH) + 1; // 1-based
      
      // Only allow if it's the right day of month AND a weekend
      return dayOfMonth === sched.dayOfMonth && isWeekend(dayIndex);
    }

    case "seasonal": {
      // Seasonal = specific month, e.g. month 3 (April)
      // Sprint 29: Ensure seasonal races fall on weekends
      if (sched.dayOfYear === undefined) return false;
      const dayOfYear = dayIndex % DAYS_PER_YEAR;
      
      // Only allow if it's the right day of year AND a weekend
      return dayOfYear === sched.dayOfYear && isWeekend(dayIndex);
    }

    case "annual": {
      // Runs on specific day of year
      // Sprint 29: Ensure annual races fall on weekends
      if (sched.dayOfYear === undefined) return false;
      const dayOfYearAnnual = dayIndex % DAYS_PER_YEAR;
      
      // Only allow if it's the right day of year AND a weekend
      return dayOfYearAnnual === sched.dayOfYear && isWeekend(dayIndex);
    }

    case "one_time":
      // Runs on specific explicit day(s)
      // Sprint 29: Ensure one-time events fall on weekends
      const isSpecificDay = sched.specificDays?.includes(dayIndex) ?? false;
      return isSpecificDay && isWeekend(dayIndex);

    default:
      return false;
  }
}

/**
 * Register for a scheduled race.
 * Uses a composite key (`{scheduleId}_m{month}_y{year}`) so that the same
 * monthly schedule can be registered across multiple months simultaneously.
 */
export function registerForRace(
  schedulingState: SchedulingState,
  scheduleId: string,
  dayIndex: number,
  categoryId?: CategoryId,
): SchedulingState {
  const key = makeRegistrationKey(scheduleId, dayIndex);
  return {
    ...schedulingState,
    registered: {
      ...schedulingState.registered,
      [key]: categoryId ? { dayIndex, categoryId } : dayIndex,
    },
  };
}

/**
 * Mark a race as completed.
 * Removes the composite key registration and records completion.
 */
export function completeRace(
  schedulingState: SchedulingState,
  raceId: string,
  scheduleId: string,
  dayIndex: number,
): SchedulingState {
  const instanceKey = makeRegistrationKey(scheduleId, dayIndex);
  return {
    ...schedulingState,
    completedRaces: {
      ...schedulingState.completedRaces,
      // Composite key (new format)
      [instanceKey]: dayIndex,
      // Legacy formats kept for backward compat with existing save data
      [`${scheduleId}_${dayIndex}`]: dayIndex,
      [raceId]: dayIndex,
    },
    registered: Object.fromEntries(
      Object.entries(schedulingState.registered).filter(
        // Remove the specific occurrence key; other occurrences of the same
        // schedule (different months) remain untouched
        ([id]) => id !== instanceKey && id !== scheduleId,
      ),
    ),
    completedOneTimeEvents: scheduleId.includes("one_time")
      ? [...schedulingState.completedOneTimeEvents, scheduleId]
      : schedulingState.completedOneTimeEvents,
  };
}

/**
 * Check if player can register for a race (within registration window).
 */
export function canRegisterForRace(
  schedule: RaceSchedule,
  currentDayIndex: number,
): {
  canRegister: boolean;
  reason?: string;
  opensAt?: number;
} {
  // For daily races with no registration window, always available
  if (
    schedule.schedule.frequency === "daily" ||
    schedule.registration.opensDaysBefore === 0
  ) {
    return { canRegister: true };
  }

  // For scheduled races, check window
  const raceDay = findNextRaceDay(schedule, currentDayIndex);
  if (!raceDay) {
    return { canRegister: false, reason: "Race schedule not available" };
  }

  const opensAt = raceDay - schedule.registration.opensDaysBefore;
  const closesAt = raceDay - schedule.registration.closesDaysBefore;

  if (currentDayIndex < opensAt) {
    return {
      canRegister: false,
      reason: `Registration opens on day ${opensAt}`,
      opensAt,
    };
  }

  if (currentDayIndex > closesAt) {
    return {
      canRegister: false,
      reason: "Registration for this race has closed",
    };
  }

  return { canRegister: true };
}

/**
 * Find the next occurrence of a scheduled race.
 */
function findNextRaceDay(
  schedule: RaceSchedule,
  currentDayIndex: number,
): number | null {
  // Check forward up to 90 days
  for (let offset = 0; offset <= 90; offset++) {
    const checkDay = currentDayIndex + offset;
    if (isRaceOnDay(schedule, checkDay)) {
      return checkDay;
    }
  }
  return null;
}

/**
 * Get race schedule by ID.
 */
export function getScheduleById(scheduleId: string): RaceSchedule | undefined {
  return RACE_SCHEDULES.find((s) => s.id === scheduleId);
}

/**
 * Generate the daily seed from dayIndex.
 */
export function generateDailySeed(dayIndex: number): number {
  return (dayIndex * 9301 + 49297) % 233280;
}

/**
 * Get race schedule summary for monthly calendar.
 */
export function getMonthlyCalendar(
  schedulingState: SchedulingState,
  currentDayIndex: number,
  monthOffset: number = 0,
): {
  month: number;
  year: number;
  days: Array<{
    day: number;
    dayIndex: number;
    races: RaceOccurrence[];
  }>;
} {
  const dateInfo = deriveDate({
    dayIndex: currentDayIndex,
    startAge: 30,
  } as unknown as GameState); // Using startAge=30 for rough calendar
  const startOfMonth =
    currentDayIndex -
    (currentDayIndex % DAYS_PER_MONTH) +
    monthOffset * DAYS_PER_MONTH;

  const days = [];
  for (let d = 0; d < DAYS_PER_MONTH; d++) {
    const dayIndex = startOfMonth + d;
    const races = getTodaysRaces(
      schedulingState,
      null as unknown as GameState,
      dayIndex,
    );
    days.push({
      day: d + 1,
      dayIndex,
      races,
    });
  }

  return {
    month: (currentDayIndex / DAYS_PER_MONTH + monthOffset) % 12,
    year: Math.floor(currentDayIndex / DAYS_PER_MONTH / 12),
    days,
  };
}

/**
 * Get all future or active races the player is currently registered for.
 *
 * - Shows races whose race day is >= today (upcoming + same-day).
 * - Races whose day has already passed are considered expired/missed and are
 *   NOT shown (they clear automatically when the clock advances past race day).
 * - Completed races (finished today or earlier) are shown for the remainder of
 *   race day only; on day+1 they are gone.
 */
export function getRegisteredRaces(
  schedulingState: SchedulingState,
  currentDayIndex: number,
): RaceOccurrence[] {
  const registered: RaceOccurrence[] = [];
  const totalEntrants = 50;

  // Gather all registered race occurrences.
  // Registration keys are now composite: `{scheduleId}_m{month}_y{year}`.
  // Strip the suffix to find the underlying RaceSchedule definition.
  for (const [compositeKey, regVal] of Object.entries(schedulingState.registered)) {
    // Strip composite suffix (e.g. "_m0_y0") to get base schedule id
    const baseScheduleId = compositeKey.replace(/_m\d+_y\d+$/, "");
    const schedule = RACE_SCHEDULES.find((s) => s.id === baseScheduleId);
    if (!schedule) continue;

    const dayIdx = typeof regVal === "object" ? regVal.dayIndex : regVal;

    // Skip races that are strictly in the past (day already over)
    if (Number(dayIdx) < currentDayIndex) continue;

    const occurrence = getRaceOccurrence(
      schedule,
      schedulingState,
      Number(dayIdx),
      totalEntrants,
    );
    if (!occurrence) continue;

    // Determine completion status using the composite instance key
    const instanceKey = occurrence.registrationInstanceId;
    const completedDay =
      schedulingState.completedRaces[instanceKey] ??
      schedulingState.completedRaces[`${occurrence.scheduleId}_${occurrence.dayIndex}`] ??
      (schedulingState.completedRaces[occurrence.scheduleId] === occurrence.dayIndex
        ? occurrence.dayIndex
        : undefined);
    occurrence.isCompleted = completedDay !== undefined;

    registered.push(occurrence);
  }

  // Sort: today's races first, then upcoming by ascending day
  registered.sort((a, b) => a.dayIndex - b.dayIndex);

  return registered;
}


// Re-export for convenience
export { RACE_SCHEDULES };
