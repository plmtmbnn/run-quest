/**
 * Race Schedule Database (Sprint 26 - Task 4)
 *
 * Defines when every race happens in the game timeline.
 *
 * Schedule Philosophy:
 * - Daily races: Always available, local tier, small entry fee
 * - Weekly races: Regional-tier events on specific days
 * - Monthly races: State-level championships
 * - Seasonal races: National events tied to year seasons
 * - Annual races: Olympic Trials, major championships
 * - One-time: Special story events
 */

import type { RaceSchedule } from "./race-calendar-types";
import { formatCurrency } from "../economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Master schedule of all races in the game.
 */
const preferredCurrency = useSettingsStore.getState().settings.preferredCurrency || "USD";

export const RACE_SCHEDULES: RaceSchedule[] = [
  // ═══════════════════════════════════════════════════════
  // DAILY RACES - Always available, local tier
  // ═══════════════════════════════════════════════════════

  {
    id: "daily_local_5k",
    raceId: "local_5k_park",
    name: "Jakarta Fun Run 5K",
    locationId: "local_5k_park",
    tier: "local",
    description:
      "The classic street run through Jakarta's center. Same course, different day. A great way to build consistency.",
    schedule: {
      frequency: "daily",
    },
    registration: {
      opensDaysBefore: 30,
      closesDaysBefore: 7,
    },
    entry: {
      fee: 35,
    },
    icon: "🏃",
    color: "text-green-500",
    prizeInfo: "Winner takes 40% of entry pool",
  },

  {
    id: "daily_10k_circuit",
    raceId: "regional_10k_hills",
    name: "Bandung Heritage 10K",
    locationId: "regional_10k_hills",
    tier: "local",
    description:
      "A challenging 10K through the scenic heritage streets of Bandung. Tests endurance and pacing.",
    schedule: {
      frequency: "daily",
    },
    registration: {
      opensDaysBefore: 30,
      closesDaysBefore: 7,
    },
    entry: {
      fee: 55,
    },
    icon: "🏃‍♂️",
    color: "text-emerald-500",
    prizeInfo: "Winner takes 40% of entry pool",
  },

  // ═══════════════════════════════════════════════════════
  // WEEKLY RACES - Regional tier on specific days
  // ═══════════════════════════════════════════════════════

  {
    id: "weekly_saturday_5k",
    raceId: "local_5k_park",
    name: "Bali Marathon Saturday Series",
    locationId: "local_5k_park",
    tier: "regional",
    description:
      "The weekly Saturday showdown along the beaches of Bali. Higher stakes, better competition, bigger prizes.",
    schedule: {
      frequency: "weekly",
      dayOfWeek: 6, // Saturday
    },
    registration: {
      opensDaysBefore: 30,
      closesDaysBefore: 7,
    },
    entry: {
      fee: 120,
    },
    maxEntrants: 100,
    icon: "🏆",
    color: "text-blue-500",
    prizeInfo: "Regional prize pool, 70% goes to top 5",
  },

  {
    id: "weekly_sunday_hills",
    raceId: "regional_10k_hills",
    name: "Borobudur Hills Challenge",
    locationId: "regional_10k_hills",
    tier: "regional",
    description:
      "Conquer the historical trails around Borobudur every Sunday. Builds character and leg strength.",
    schedule: {
      frequency: "weekly",
      dayOfWeek: 0, // Sunday
    },
    registration: {
      opensDaysBefore: 30,
      closesDaysBefore: 7,
    },
    entry: {
      fee: 180,
    },
    maxEntrants: 80,
    icon: "⛰️",
    color: "text-sky-500",
    prizeInfo: "Regional prize pool, 70% goes to top 5",
  },

  // ═══════════════════════════════════════════════════════
  // MONTHLY RACES - State level championships
  // ═══════════════════════════════════════════════════════

  {
    id: "monthly_state_5k",
    raceId: "local_5k_park",
    name: "Jakarta Marathon Championship",
    locationId: "local_5k_park",
    tier: "state",
    description:
      "Monthly championship in Jakarta. Top runners from across the region compete. Points count toward annual standings.",
    schedule: {
      frequency: "monthly",
      dayOfMonth: 15, // 15th of each month
    },
    registration: {
      opensDaysBefore: 45,
      closesDaysBefore: 10,
    },
    entry: {
      fee: 450,
      prerequisites: {
        minLevel: 8,
        minRating: 1800,
      },
    },
    maxEntrants: 50,
    icon: "👑",
    color: "text-purple-500",
    prizeInfo: "State championship purse, champion gets title + bonus",
  },

  {
    id: "monthly_state_half",
    raceId: "state_half_coastal",
    name: "Mandalika Coastal Half Marathon",
    locationId: "state_half_coastal",
    tier: "state",
    description:
      "Monthly half marathon along the breathtaking Mandalika coastline. The premier distance event of the month.",
    schedule: {
      frequency: "monthly",
      dayOfMonth: 28, // 28th of each month
    },
    registration: {
      opensDaysBefore: 45,
      closesDaysBefore: 10,
    },
    entry: {
      fee: 600,
      prerequisites: {
        minLevel: 12,
        minRating: 1900,
      },
    },
    maxEntrants: 100,
    icon: "🌊",
    color: "text-cyan-500",
    prizeInfo: "State half marathon purse + title",
  },

  // ═══════════════════════════════════════════════════════
  // SEASONAL RACES - National tier, specific months
  // ═══════════════════════════════════════════════════════

  {
    id: "seasonal_spring_marathon",
    raceId: "national_marathon_city",
    name: "Tokyo Marathon",
    locationId: "national_marathon_city",
    tier: "national",
    description:
      "The premier Asian major marathon in Tokyo. National TV coverage. The best in the country compete.",
    schedule: {
      frequency: "seasonal",
      dayOfYear: 120, // Early May (day 120 of 336-day year)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 1200,
      prerequisites: {
        minLevel: 18,
        minRating: 2100,
        requiresQualification: true,
      },
    },
    maxEntrants: 200,
    icon: "🌷",
    color: "text-orange-500",
    prizeInfo: `National prize purse: ${formatCurrency(10000, preferredCurrency)} to champion`,
  },

  {
    id: "seasonal_fall_marathon",
    raceId: "national_marathon_city",
    name: "New York City Marathon",
    locationId: "national_marathon_city",
    tier: "national",
    description:
      "Run through the five boroughs of NYC. Fall marathon with perfect racing temperatures. Record-breaking conditions expected.",
    schedule: {
      frequency: "seasonal",
      dayOfYear: 280, // Early October (day 280 of 336-day year)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 1500,
      prerequisites: {
        minLevel: 18,
        minRating: 2100,
        requiresQualification: true,
      },
    },
    maxEntrants: 200,
    icon: "🍂",
    color: "text-amber-500",
    prizeInfo: `National prize purse: ${formatCurrency(10000, preferredCurrency)} to champion`,
  },

  // ═══════════════════════════════════════════════════════
  // ANNUAL RACES - The biggest events of the year
  // ═══════════════════════════════════════════════════════

  {
    id: "annual_olympic_trials",
    raceId: "olympic_trials",
    name: "World Athletics Championship Marathon",
    locationId: "olympic_trials",
    tier: "international",
    description:
      "ONCE A YEAR. Top 3 make the World Athletics team. The highest stakes in running. Every four game years, this decides who represents the nation.",
    schedule: {
      frequency: "annual",
      dayOfYear: 150, // Late May (every year)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 30,
    },
    entry: {
      fee: 3000,
      prerequisites: {
        minLevel: 28,
        minRating: 2400,
        requiresQualification: true,
        storyChapter: 5,
      },
    },
    maxEntrants: 200,
    icon: "🏅",
    color: "text-red-500",
    prizeInfo: "Olympic Trials - Top 3 qualify for Olympic team",
  },

  {
    id: "annual_national_championship",
    raceId: "national_marathon_city",
    name: "Boston Marathon",
    locationId: "national_marathon_city",
    tier: "national",
    description:
      "The world's oldest annual marathon. The best runners in the country compete for the title of Champion.",
    schedule: {
      frequency: "annual",
      dayOfYear: 90, // Late March
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 30,
    },
    entry: {
      fee: 2000,
      prerequisites: {
        minLevel: 22,
        minRating: 2200,
        requiresQualification: true,
        storyChapter: 4,
      },
    },
    maxEntrants: 300,
    icon: "🇺🇸",
    color: "text-blue-600",
    prizeInfo: `National Champion title + ${formatCurrency(25000, preferredCurrency)} prize`,
  },

  // ═══════════════════════════════════════════════════════
  // ONE-TIME EVENTS - Story-specific races
  // ═══════════════════════════════════════════════════════

  {
    id: "one_time_debut",
    raceId: "local_5k_park",
    name: "Sudirman Street First Run",
    locationId: "local_5k_park",
    tier: "local",
    description:
      "Your very first race down Sudirman Street. No pressure, just run. This is where every champion starts.",
    schedule: {
      frequency: "one_time",
      specificDays: [5], // Available on career day 5
    },
    registration: {
      opensDaysBefore: 0,
      closesDaysBefore: 0,
    },
    entry: {
      fee: 0, // Free first race
    },
    icon: "🌟",
    color: "text-yellow-500",
    prizeInfo: "No prize pool - this is about participation",
  },

  {
    id: "one_time_chapter_complete",
    raceId: "local_5k_park",
    name: "Ancol Seaside Championship",
    locationId: "local_5k_park",
    tier: "regional",
    description:
      "The end of your first story chapter by the Ancol seaside. Win this to prove you've grown beyond a local runner.",
    schedule: {
      frequency: "one_time",
      specificDays: [50], // Day 50
    },
    registration: {
      opensDaysBefore: 14,
      closesDaysBefore: 3,
    },
    entry: {
      fee: 80,
      prerequisites: {
        storyChapter: 1,
      },
    },
    maxEntrants: 30,
    icon: "📖",
    color: "text-indigo-500",
    prizeInfo: "Story milestone - unlocks next chapter",
  },
];

/**
 * Get the default daily races (always available).
 */
export function getDefaultDailyRaces(): RaceSchedule[] {
  return RACE_SCHEDULES.filter((s) => s.schedule.frequency === "daily");
}

/**
 * Get races by tier.
 */
export function getRacesByTier(tier: string): RaceSchedule[] {
  return RACE_SCHEDULES.filter((s) => s.tier === tier);
}

/**
 * Get the next big race (championship or national+) for player targets.
 */
export function getNextBigRace(
  currentDayIndex: number,
): RaceSchedule | undefined {
  return RACE_SCHEDULES.filter(
    (s) =>
      s.schedule.frequency !== "daily" && s.schedule.frequency !== "weekly",
  ).sort((a, b) => {
    // Find next occurrence and compare
    return a.registration.opensDaysBefore - b.registration.opensDaysBefore;
  })[0];
}

/**
 * Check if a race schedule is a championship (state or higher).
 */
export function isChampionship(schedule: RaceSchedule): boolean {
  return ["state", "national", "international"].includes(schedule.tier);
}

/**
 * Get entry fee range description for display.
 */
export function getRaceScheduleSummary(): {
  daily: number;
  weekly: number;
  monthly: number;
  seasonal: number;
  annual: number;
  oneTime: number;
  total: number;
} {
  const counts = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    seasonal: 0,
    annual: 0,
    oneTime: 0,
  };

  for (const s of RACE_SCHEDULES) {
    const freq = s.schedule.frequency;
    if (freq === "one_time") {
      counts.oneTime++;
    } else {
      counts[freq]++;
    }
  }

  return {
    ...counts,
    total: RACE_SCHEDULES.length,
  };
}
