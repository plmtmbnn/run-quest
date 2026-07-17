/**
 * Race Calendar Types (Sprint 26 - Task 4)
 *
 * Defines when races are available based on the game timeline.
 */

import type { RaceTier } from "../economy/economy-types";
import type { RacePrerequisites } from "../economy/race-entry-engine";

export type ScheduleFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "seasonal"
  | "annual"
  | "one_time";

/**
 * Schedule definition for a race that repeats.
 */
export interface RaceSchedule {
  id: string;
  raceId: string;
  name: string;
  locationId: string;
  tier: RaceTier;
  description: string;

  /** When this race runs */
  schedule: {
    frequency: ScheduleFrequency;
    dayOfWeek?: number; // 0=Mon..6=Sun for weekly
    dayOfMonth?: number; // 1-28 for monthly
    dayOfYear?: number; // 0-335 for annual
    specificDays?: number[]; // explicit dayIndex for one-time
  };

  /** Registration window */
  registration: {
    opensDaysBefore: number; // When registration opens (e.g., 7 days before)
    closesDaysBefore: number; // When registration closes (e.g., 1 day before)
  };

  /** Entry fee and requirements */
  entry: {
    fee: number;
    prerequisites?: RacePrerequisites;
  };

  /** Field limits */
  maxEntrants?: number;

  /** Prize pool info */
  prizeInfo: string;

  /** Visual identity */
  icon: string;
  color: string;
}

/**
 * State for the race scheduling system.
 */
export interface SchedulingState {
  /** Track which races have been completed (raceId -> last completed dayIndex) */
  completedRaces: Record<string, number>;

  /** Track registration status (raceScheduleId -> registered dayIndex) */
  registered: Record<string, number>;

  /** Track which one-time events have occurred */
  completedOneTimeEvents: string[];

  /** Current day's seed for generating race details */
  dailySeed: number;
}

/**
 * A race occurrence - specific instance of a scheduled race.
 */
export interface RaceOccurrence {
  scheduleId: string;
  raceId: string;
  name: string;
  locationId: string;
  tier: RaceTier;
  description: string;

  /** When this occurrence happens */
  dayIndex: number;

  /** Registration dates */
  registrationOpensAt: number;
  registrationClosesAt: number;

  /** Entry info */
  entryFee: number;
  prerequisites?: RacePrerequisites;
  maxEntrants?: number;

  /** Derived info */
  entrants?: number; // How many have entered
  prizePool: number;

  /** Visual */
  icon: string;
  color: string;

  /** State flags */
  isRegistered: boolean;
  isCompleted: boolean;
  isFull: boolean;
}

export const DEFAULT_SCHEDULING_STATE: SchedulingState = {
  completedRaces: {},
  registered: {},
  completedOneTimeEvents: [],
  dailySeed: 0,
};
