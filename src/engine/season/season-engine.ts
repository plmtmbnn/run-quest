/**
 * Season Engine (Sprint 24)
 *
 * Manages season enrollment, progress tracking, and qualification.
 */

import { deriveDate } from "../timeline/calendar";
import type { GameState } from "../timeline/time-types";
import {
  getCurrentPhase,
  isInQualificationWindow,
  SEASONS,
} from "./season-database";
import type {
  Season,
  SeasonHistoryRecord,
  SeasonProgress,
  SeasonState,
} from "./season-types";
import { STANDARD_POINTS } from "./season-types";

/**
 * Enroll in a season.
 */
export function enrollInSeason(
  seasonState: SeasonState,
  seasonId: string,
): SeasonState {
  if (seasonState.activeSeasons[seasonId]) {
    return seasonState; // Already enrolled
  }

  const season = SEASONS[seasonId];
  if (!season) return seasonState;

  const progress: SeasonProgress = {
    seasonId,
    enrolled: true,
    currentPhase: "preseason",
    racesCompleted: [],
    goalsCompleted: [],
    qualified: false,
    qualificationAttempts: 0,
    victories: 0,
    podiums: 0,
    personalBests: 0,
    points: 0,
  };

  return {
    ...seasonState,
    currentSeasonId: seasonId,
    activeSeasons: {
      ...seasonState.activeSeasons,
      [seasonId]: progress,
    },
  };
}

/**
 * Update season progress after a race.
 */
export function updateSeasonProgress(
  seasonState: SeasonState,
  gameState: GameState,
  raceId: string,
  position: number,
  time: number,
  isPersonalBest: boolean,
): SeasonState {
  const seasonId = seasonState.currentSeasonId;
  if (!seasonId) return seasonState;

  const progress = seasonState.activeSeasons[seasonId];
  if (!progress) return seasonState;

  const season = SEASONS[seasonId];
  if (!season) return seasonState;

  // Check if race is part of this season
  if (!season.races.includes(raceId) && season.championship !== raceId) {
    return seasonState;
  }

  // Update races completed
  const racesCompleted = [...progress.racesCompleted, raceId];

  // Update statistics
  const victories =
    position === 1 ? progress.victories + 1 : progress.victories;
  const podiums = position <= 3 ? progress.podiums + 1 : progress.podiums;
  const personalBests = isPersonalBest
    ? progress.personalBests + 1
    : progress.personalBests;

  // Update points (if points-based system)
  let points = progress.points ?? 0;
  if (season.qualificationSystem?.method === "points") {
    points += calculatePoints(position, isPersonalBest, false, time);
  }

  // Update best time (if time-based system)
  let bestTime = progress.bestTime;
  if (season.qualificationSystem?.method === "time_standard") {
    bestTime = !bestTime || time < bestTime ? time : bestTime;
  }

  // Check qualification
  const qualified = checkQualification(season, {
    ...progress,
    racesCompleted,
    points,
    bestTime,
  });

  // Update current phase
  const dateInfo = deriveDate(gameState);
  const dayOfYear = (gameState.dayIndex - dateInfo.yearOffset * 336) % 336;
  const currentPhase =
    getCurrentPhase(season, dayOfYear) ?? progress.currentPhase;

  // Check goal completion
  const goalsCompleted = checkGoalCompletion(season, {
    ...progress,
    racesCompleted,
    victories,
    podiums,
    personalBests,
    bestTime,
  });

  const updatedProgress: SeasonProgress = {
    ...progress,
    racesCompleted,
    currentPhase,
    victories,
    podiums,
    personalBests,
    points,
    bestTime,
    qualified,
    goalsCompleted,
  };

  return {
    ...seasonState,
    activeSeasons: {
      ...seasonState.activeSeasons,
      [seasonId]: updatedProgress,
    },
  };
}

/**
 * Calculate points for a race result.
 */
function calculatePoints(
  position: number,
  isPersonalBest: boolean,
  isCourseRecord: boolean,
  margin: number,
): number {
  let points = 0;

  // Base points for placement
  const placementPoints = STANDARD_POINTS.raceResults.find(
    (r) => r.place === position,
  );
  if (placementPoints) {
    points += placementPoints.points;
  } else if (position <= 20) {
    // Points for 11-20th place
    points += Math.max(5, 26 - position);
  }

  // Bonuses
  if (isPersonalBest) {
    points += STANDARD_POINTS.bonuses.personalBest;
  }
  if (isCourseRecord) {
    points += STANDARD_POINTS.bonuses.courseRecord;
  }
  if (position === 1 && margin > 30) {
    // Dominant victory (30+ second margin)
    points += STANDARD_POINTS.bonuses.dominantVictory;
  }

  return points;
}

/**
 * Check if qualification requirements are met.
 */
function checkQualification(season: Season, progress: SeasonProgress): boolean {
  if (!season.qualificationSystem) return true; // No qualification needed

  const { method, requirements } = season.qualificationSystem;

  switch (method) {
    case "time_standard":
      return (
        progress.bestTime !== undefined &&
        requirements.timeStandard !== undefined &&
        progress.bestTime <= requirements.timeStandard
      );

    case "points":
      return (
        progress.points !== undefined &&
        requirements.pointsNeeded !== undefined &&
        progress.points >= requirements.pointsNeeded
      );

    case "placement":
      // Would need to track overall standings
      return false; // Not implemented yet

    case "ranking":
      // Would need to integrate with ranking system
      return false; // Not implemented yet

    default:
      return false;
  }
}

/**
 * Check which goals have been completed.
 */
function checkGoalCompletion(
  season: Season,
  progress: SeasonProgress,
): string[] {
  const completed: string[] = [];

  // Check primary goal (usually championship victory)
  if (
    season.championship &&
    progress.racesCompleted.includes(season.championship)
  ) {
    completed.push(season.primaryGoal);
  }

  // Check secondary goals
  for (const goal of season.secondaryGoals) {
    if (isGoalCompleted(goal, progress, season)) {
      completed.push(goal);
    }
  }

  return completed;
}

/**
 * Check if a specific goal is completed.
 */
function isGoalCompleted(
  goal: string,
  progress: SeasonProgress,
  season: Season,
): boolean {
  // Parse goal text for common patterns
  const lowerGoal = goal.toLowerCase();

  // "Complete X races"
  if (lowerGoal.includes("complete") && lowerGoal.includes("races")) {
    const match = goal.match(/(\d+)\s+races/);
    if (match) {
      const required = Number.parseInt(match[1]);
      return progress.racesCompleted.length >= required;
    }
  }

  // "Win at least X races"
  if (lowerGoal.includes("win") && lowerGoal.includes("races")) {
    const match = goal.match(/(\d+)\s+races/);
    if (match) {
      const required = Number.parseInt(match[1]);
      return progress.victories >= required;
    }
  }

  // "Finish on the podium X times"
  if (lowerGoal.includes("podium")) {
    const match = goal.match(/(\d+)\s+times/);
    if (match) {
      const required = Number.parseInt(match[1]);
      return progress.podiums >= required;
    }
  }

  // "Set a personal best"
  if (lowerGoal.includes("personal best")) {
    return progress.personalBests > 0;
  }

  // "Earn X points"
  if (lowerGoal.includes("points")) {
    const match = goal.match(/(\d+)\s+points/);
    if (match) {
      const required = Number.parseInt(match[1]);
      return (progress.points ?? 0) >= required;
    }
  }

  // "Run sub-X:XX"
  if (lowerGoal.includes("run sub-") || lowerGoal.includes("run faster than")) {
    const match = goal.match(/(\d+):(\d+):(\d+)/);
    if (match && progress.bestTime) {
      const [_, hours, minutes, seconds] = match;
      const targetTime =
        Number.parseInt(hours) * 3600 +
        Number.parseInt(minutes) * 60 +
        Number.parseInt(seconds);
      return progress.bestTime <= targetTime;
    }
  }

  // "Qualify for"
  if (lowerGoal.includes("qualify")) {
    return progress.qualified;
  }

  // "Top X"
  if (lowerGoal.includes("top")) {
    const match = goal.match(/top\s+(\d+)/);
    if (
      match &&
      season.championship &&
      progress.racesCompleted.includes(season.championship)
    ) {
      // Would need championship position tracking
      return false; // Not implemented yet
    }
  }

  return false;
}

/**
 * Complete a season and record history.
 */
export function completeSeason(
  seasonState: SeasonState,
  gameState: GameState,
  seasonId: string,
  championshipPosition?: number,
): { seasonState: SeasonState; gameState: GameState; rewards: string[] } {
  const progress = seasonState.activeSeasons[seasonId];
  const season = SEASONS[seasonId];

  if (!progress || !season) {
    return { seasonState, gameState, rewards: [] };
  }

  const rewards: string[] = [];
  let updatedGameState = gameState;

  // Calculate which rewards to apply
  const goalsCompleted = progress.goalsCompleted.length;
  const totalGoals = season.secondaryGoals.length + 1; // +1 for primary goal
  const allGoalsCompleted = goalsCompleted >= totalGoals;
  const wonChampionship = championshipPosition === 1;

  // Apply completion reward
  const completionReward = season.rewards.completion;
  updatedGameState = applyReward(
    updatedGameState,
    completionReward,
    rewards,
    "Season completion",
  );

  // Apply championship reward if won
  if (wonChampionship) {
    const championshipReward = season.rewards.championship;
    updatedGameState = applyReward(
      updatedGameState,
      championshipReward,
      rewards,
      "Championship victory",
    );
  }

  // Apply all goals reward if completed
  if (allGoalsCompleted) {
    const allGoalsReward = season.rewards.allGoals;
    updatedGameState = applyReward(
      updatedGameState,
      allGoalsReward,
      rewards,
      "All goals completed",
    );
  }

  // Record history
  const dateInfo = deriveDate(gameState);
  const historyRecord: SeasonHistoryRecord = {
    seasonId,
    tier: season.tier,
    year: dateInfo.age,
    goalsCompleted,
    totalGoals,
    championshipPosition,
    qualified: progress.qualified,
    rating: (updatedGameState.flags.rating as number) ?? 1500,
  };

  // Update state
  const { [seasonId]: _, ...remainingActive } = seasonState.activeSeasons;

  const updatedSeasonState: SeasonState = {
    ...seasonState,
    currentSeasonId:
      seasonState.currentSeasonId === seasonId
        ? undefined
        : seasonState.currentSeasonId,
    activeSeasons: remainingActive,
    completedSeasons: [...seasonState.completedSeasons, seasonId],
    seasonHistory: [...seasonState.seasonHistory, historyRecord],
  };

  return {
    seasonState: updatedSeasonState,
    gameState: updatedGameState,
    rewards,
  };
}

/**
 * Apply a season reward to game state.
 */
function applyReward(
  gameState: GameState,
  reward: any,
  rewardsList: string[],
  context: string,
): GameState {
  let updated = gameState;

  if (reward.rating) {
    const currentRating = (gameState.flags.rating as number) ?? 1500;
    updated = {
      ...updated,
      flags: {
        ...updated.flags,
        rating: currentRating + reward.rating,
      },
    };
    rewardsList.push(`${context}: +${reward.rating} rating`);
  }

  if (reward.money) {
    updated = {
      ...updated,
      resources: {
        ...updated.resources,
        money: updated.resources.money + reward.money,
      },
    };
    rewardsList.push(`${context}: $${reward.money}`);
  }

  if (reward.reputation) {
    const currentRep = (gameState.flags.reputation as number) ?? 0;
    updated = {
      ...updated,
      flags: {
        ...updated.flags,
        reputation: currentRep + reward.reputation,
      },
    };
    rewardsList.push(`${context}: +${reward.reputation} reputation`);
  }

  if (reward.title) {
    updated = {
      ...updated,
      flags: {
        ...updated.flags,
        [`title_${reward.title.replace(/\s+/g, "_").toLowerCase()}`]:
          reward.title,
      },
    };
    rewardsList.push(`${context}: Title - ${reward.title}`);
  }

  if (reward.unlocks) {
    for (const unlock of reward.unlocks) {
      updated = {
        ...updated,
        flags: {
          ...updated.flags,
          [`unlocked_${unlock}`]: true,
        },
      };
      rewardsList.push(`${context}: Unlocked ${unlock}`);
    }
  }

  return updated;
}

/**
 * Get season status summary.
 */
export function getSeasonStatus(
  seasonState: SeasonState,
  gameState: GameState,
  seasonId: string,
): {
  enrolled: boolean;
  qualified: boolean;
  goalsCompleted: number;
  totalGoals: number;
  inQualificationWindow: boolean;
  phase: string;
} | null {
  const progress = seasonState.activeSeasons[seasonId];
  const season = SEASONS[seasonId];

  if (!season) return null;

  const dateInfo = deriveDate(gameState);
  const dayOfYear = (gameState.dayIndex - dateInfo.yearOffset * 336) % 336;

  return {
    enrolled: !!progress,
    qualified: progress?.qualified ?? false,
    goalsCompleted: progress?.goalsCompleted.length ?? 0,
    totalGoals: season.secondaryGoals.length + 1,
    inQualificationWindow: isInQualificationWindow(season, dayOfYear),
    phase: getCurrentPhase(season, dayOfYear) ?? "offseason",
  };
}

// Re-export
export { SEASONS };
export type { Season, SeasonState, SeasonProgress };
