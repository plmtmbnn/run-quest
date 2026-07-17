/**
 * Season Database (Sprint 24)
 *
 * Predefined racing seasons with goals, phases, and qualification systems.
 */

import type { Season, SeasonPhase } from "./season-types";

/**
 * Racing seasons throughout the year.
 */
export const SEASONS: Record<string, Season> = {
  spring_5k_series: {
    id: "spring_5k_series",
    name: "Spring 5K Series",
    tier: "local",
    startDay: 60, // ~Day 60 of year (early March)
    endDay: 150, // ~Day 150 (late May)
    phases: [
      {
        phase: "preseason",
        startDay: 30,
        endDay: 59,
        label: "Pre-Season Training",
        description: "Build your base fitness before the season starts",
        focus: "Base building and preparation",
      },
      {
        phase: "early",
        startDay: 60,
        endDay: 90,
        label: "Early Season",
        description: "Get your legs under you with early races",
        focus: "Find your rhythm and race fitness",
      },
      {
        phase: "mid",
        startDay: 91,
        endDay: 120,
        label: "Mid Season",
        description: "Peak fitness window - chase PRs",
        focus: "Peak performance and personal bests",
      },
      {
        phase: "championship",
        startDay: 121,
        endDay: 150,
        label: "Championship Phase",
        description: "Season finale - the championship awaits",
        focus: "Championship preparation and execution",
      },
    ],
    primaryGoal: "Win the Local 5K Championship",
    secondaryGoals: [
      "Complete 5 races in the series",
      "Set a personal best",
      "Finish on the podium 3 times",
    ],
    races: ["local_5k_park"],
    championship: "local_5k_championship",
    rewards: {
      completion: {
        rating: 25,
        money: 100,
        reputation: 5,
      },
      championship: {
        rating: 50,
        money: 200,
        title: "Local Champion",
        unlocks: ["regional_10k_hills"],
        reputation: 15,
      },
      allGoals: {
        rating: 75,
        money: 300,
        reputation: 20,
      },
    },
  },

  summer_10k_circuit: {
    id: "summer_10k_circuit",
    name: "Summer 10K Circuit",
    tier: "regional",
    startDay: 151, // Early June
    endDay: 243, // Late August
    phases: [
      {
        phase: "early",
        startDay: 151,
        endDay: 180,
        label: "Circuit Opens",
        description: "Summer racing season begins",
        focus: "Accumulate circuit points",
      },
      {
        phase: "mid",
        startDay: 181,
        endDay: 220,
        label: "Points Race",
        description: "Every race counts toward circuit standings",
        focus: "Consistent performance for points",
      },
      {
        phase: "championship",
        startDay: 221,
        endDay: 243,
        label: "Circuit Finals",
        description: "Top points earners compete for the title",
        focus: "Regional championship",
      },
    ],
    primaryGoal: "Qualify for Regional Championship",
    secondaryGoals: [
      "Earn 300 circuit points",
      "Win at least 2 races",
      "Top 5 in circuit standings",
    ],
    races: ["regional_10k_hills"],
    championship: "regional_10k_championship",
    qualificationSystem: {
      method: "points",
      requirements: {
        pointsNeeded: 300,
        topNPlaces: 10,
      },
      qualificationWindow: {
        startDay: 151,
        endDay: 220,
      },
      description:
        "Earn 300 points or finish top 10 in circuit standings to qualify for championship",
    },
    rewards: {
      completion: {
        rating: 50,
        money: 300,
        reputation: 15,
      },
      championship: {
        rating: 100,
        money: 500,
        title: "Regional Champion",
        unlocks: ["state_half_coastal"],
        reputation: 30,
      },
      allGoals: {
        rating: 150,
        money: 800,
        reputation: 40,
      },
    },
  },

  fall_half_marathon_season: {
    id: "fall_half_marathon_season",
    name: "Fall Half Marathon Season",
    tier: "national",
    startDay: 244, // Early September
    endDay: 330, // Late November
    phases: [
      {
        phase: "early",
        startDay: 244,
        endDay: 273,
        label: "Season Opener",
        description: "Early autumn racing begins",
        focus: "Qualify for state championship",
      },
      {
        phase: "mid",
        startDay: 274,
        endDay: 303,
        label: "Peak Season",
        description: "Prime racing conditions",
        focus: "Chase fast times and qualification",
      },
      {
        phase: "championship",
        startDay: 304,
        endDay: 330,
        label: "State Championship",
        description: "The state's best compete",
        focus: "State championship and national qualification",
      },
    ],
    primaryGoal: "Qualify for State Half Marathon Championship",
    secondaryGoals: [
      "Run sub-1:15:00 half marathon",
      "Win a regional half marathon",
      "Finish top 3 at state championship",
    ],
    races: ["state_half_coastal"],
    championship: "state_half_championship",
    qualificationSystem: {
      method: "time_standard",
      requirements: {
        timeStandard: 4500, // 1:15:00
      },
      qualificationWindow: {
        startDay: 244,
        endDay: 303,
      },
      description: "Run 1:15:00 or faster to qualify for state championship",
    },
    rewards: {
      completion: {
        rating: 100,
        money: 500,
        reputation: 25,
      },
      championship: {
        rating: 200,
        money: 2000,
        title: "State Champion",
        unlocks: ["national_marathon_city"],
        reputation: 60,
      },
      allGoals: {
        rating: 300,
        money: 3000,
        reputation: 80,
      },
    },
  },

  marathon_championship_season: {
    id: "marathon_championship_season",
    name: "National Marathon Championship Season",
    tier: "national",
    startDay: 30, // Late January
    endDay: 120, // Late April
    phases: [
      {
        phase: "preseason",
        startDay: 1,
        endDay: 29,
        label: "Training Camp",
        description: "Elite preparation phase",
        focus: "Marathon-specific training block",
      },
      {
        phase: "early",
        startDay: 30,
        endDay: 59,
        label: "Qualifier Period",
        description: "Marathon qualifying window opens",
        focus: "Hit the qualifying standard",
      },
      {
        phase: "mid",
        startDay: 60,
        endDay: 89,
        label: "Final Tune-Ups",
        description: "Last chance to qualify or sharpen fitness",
        focus: "Peak and taper",
      },
      {
        phase: "championship",
        startDay: 90,
        endDay: 120,
        label: "National Championship",
        description: "The nation's best compete for the title",
        focus: "National championship and Olympic Trials qualification",
      },
    ],
    primaryGoal: "Qualify for National Marathon Championship",
    secondaryGoals: [
      "Run sub-2:20:00 marathon",
      "Finish top 10 at nationals",
      "Earn Olympic Trials consideration",
    ],
    races: ["national_marathon_city"],
    championship: "national_marathon_championship",
    qualificationSystem: {
      method: "time_standard",
      requirements: {
        timeStandard: 8400, // 2:20:00
      },
      qualificationWindow: {
        startDay: 30,
        endDay: 89,
      },
      description: "Run 2:20:00 or faster to qualify for national championship",
    },
    rewards: {
      completion: {
        rating: 200,
        money: 2000,
        reputation: 50,
      },
      championship: {
        rating: 350,
        money: 10000,
        title: "National Champion",
        unlocks: ["olympic_trials"],
        reputation: 120,
      },
      allGoals: {
        rating: 500,
        money: 15000,
        reputation: 150,
      },
    },
  },

  olympic_trials_season: {
    id: "olympic_trials_season",
    name: "Olympic Trials Season",
    tier: "international",
    startDay: 150, // Early summer of Olympic year
    endDay: 180, // Olympic Trials date
    phases: [
      {
        phase: "preseason",
        startDay: 90,
        endDay: 149,
        label: "Final Preparation",
        description: "Last training block before Olympic Trials",
        focus: "Peak for the biggest race of your life",
      },
      {
        phase: "championship",
        startDay: 150,
        endDay: 180,
        label: "Olympic Trials",
        description: "Top 3 make the Olympic team",
        focus: "Everything on the line",
      },
    ],
    primaryGoal: "Make the Olympic Team (Top 3)",
    secondaryGoals: [
      "Qualify for Olympic Trials",
      "Run a personal best at Trials",
      "Top 10 finish at Trials",
    ],
    races: ["olympic_trials"],
    championship: "olympic_trials",
    qualificationSystem: {
      method: "time_standard",
      requirements: {
        timeStandard: 7800, // 2:10:00 (Olympic A standard)
      },
      qualificationWindow: {
        startDay: 1,
        endDay: 149,
      },
      description:
        "Run 2:10:00 or faster (Olympic A standard) to qualify for Trials",
    },
    rewards: {
      completion: {
        rating: 300,
        money: 5000,
        reputation: 80,
      },
      championship: {
        rating: 500,
        money: 25000,
        title: "Olympian",
        reputation: 250,
      },
      allGoals: {
        rating: 600,
        money: 30000,
        reputation: 300,
      },
    },
  },
};

/**
 * Get current season based on day of year.
 */
export function getCurrentSeason(dayOfYear: number): Season | undefined {
  return Object.values(SEASONS).find(
    (season) => dayOfYear >= season.startDay && dayOfYear <= season.endDay,
  );
}

/**
 * Get current phase within a season.
 */
export function getCurrentPhase(
  season: Season,
  dayOfYear: number,
): SeasonPhase | undefined {
  const phase = season.phases.find(
    (p) => dayOfYear >= p.startDay && dayOfYear <= p.endDay,
  );
  return phase?.phase;
}

/**
 * Get upcoming seasons.
 */
export function getUpcomingSeasons(dayOfYear: number): Season[] {
  return Object.values(SEASONS)
    .filter((season) => season.startDay > dayOfYear)
    .sort((a, b) => a.startDay - b.startDay);
}

/**
 * Check if currently in qualification window.
 */
export function isInQualificationWindow(
  season: Season,
  dayOfYear: number,
): boolean {
  if (!season.qualificationSystem) return true;

  const { startDay, endDay } = season.qualificationSystem.qualificationWindow;
  return dayOfYear >= startDay && dayOfYear <= endDay;
}
