import type { RunnerProfile } from "@/runner/runner-types";
import { getChapterByNumber } from "./chapter-database";
import {
  completeChapter,
  getActiveChapter,
  getPendingStoryEvents,
  incrementStoryRaces,
  recordChampionshipResult,
} from "./story-engine";
import type { ChampionshipResult, StoryProgress } from "./story-types";

/**
 * Story integration hooks for race system
 */

/**
 * Handle post-race story progression updates
 */
export function handleRaceComplete(
  profile: RunnerProfile,
  storyProgress: StoryProgress,
  options: {
    isChampionship?: boolean;
    championshipRaceId?: string;
    won?: boolean;
    finishTime?: number;
    position?: number;
    grade?: string;
  },
  currentDayIndex: number,
): {
  updatedProgress: StoryProgress;
  events: Array<{
    type:
      | "chapter_complete"
      | "story_beat"
      | "championship_won"
      | "championship_lost";
    data: any;
  }>;
} {
  let updatedProgress = storyProgress;
  const events: Array<{ type: string; data: any }> = [];

  // If it's a championship race
  if (options.isChampionship && options.championshipRaceId) {
    const result: ChampionshipResult = {
      raceId: options.championshipRaceId,
      won: options.won ?? false,
      finishTime: options.finishTime ?? 0,
      position: options.position ?? 1,
      attempts:
        (storyProgress.championshipAttempts[options.championshipRaceId] || 0) +
        1,
      completedAt: currentDayIndex,
      grade: options.grade,
    };

    updatedProgress = recordChampionshipResult(updatedProgress, result);

    if (result.won) {
      events.push({
        type: "championship_won",
        data: { raceId: options.championshipRaceId, result },
      });

      // Check if this completes the current chapter
      const currentChapter = getChapterByNumber(storyProgress.currentChapter);
      if (
        currentChapter &&
        currentChapter.finalRace.id === options.championshipRaceId
      ) {
        updatedProgress = completeChapter(
          updatedProgress,
          storyProgress.currentChapter,
          currentDayIndex,
        );
        events.push({
          type: "chapter_complete",
          data: {
            chapterNumber: storyProgress.currentChapter,
            rewards: currentChapter.rewards,
          },
        });
      }
    } else {
      events.push({
        type: "championship_lost",
        data: { raceId: options.championshipRaceId, result },
      });
    }
  } else {
    // Regular story race - increment counter
    updatedProgress = incrementStoryRaces(updatedProgress);
  }

  // Check for pending story events
  const pendingEvents = getPendingStoryEvents(profile, updatedProgress);
  for (const event of pendingEvents) {
    if (event.type === "story_beat") {
      events.push({
        type: "story_beat",
        data: event.storyBeat,
      });
    }
  }

  return {
    updatedProgress,
    events: events as Array<{
      type:
        | "chapter_complete"
        | "story_beat"
        | "championship_won"
        | "championship_lost";
      data: any;
    }>,
  };
}

/**
 * Check if player can access a specific race based on story progress
 */
export function canAccessRace(
  raceId: string,
  storyProgress: StoryProgress,
): {
  allowed: boolean;
  reason?: string;
} {
  // Check if it's a championship race
  for (let i = 1; i <= 5; i++) {
    const chapter = getChapterByNumber(i);
    if (chapter?.finalRace.id === raceId) {
      // Check if chapter is current
      if (storyProgress.currentChapter !== i) {
        return {
          allowed: false,
          reason: `Complete Chapter ${i - 1} first`,
        };
      }

      // Check if already won (and can't retry)
      const result = storyProgress.championshipResults[raceId];
      if (result?.won && !chapter.finalRace.retryable) {
        return {
          allowed: false,
          reason: "Already completed",
        };
      }

      return { allowed: true };
    }
  }

  // Regular race - always allowed
  return { allowed: true };
}

/**
 * Get recommended races for current story chapter
 */
export function getRecommendedRacesForChapter(storyProgress: StoryProgress): {
  distance: number;
  surface: "road" | "track" | "trail";
  difficulty: "easy" | "medium" | "hard";
}[] {
  const chapter = getChapterByNumber(storyProgress.currentChapter);
  if (!chapter) return [];

  const recommendations = [];

  // Chapter 1: Easy 5K races
  if (chapter.number === 1) {
    recommendations.push(
      { distance: 5, surface: "road" as const, difficulty: "easy" as const },
      { distance: 5, surface: "track" as const, difficulty: "easy" as const },
    );
  }

  // Chapter 2: Medium 10K races
  if (chapter.number === 2) {
    recommendations.push(
      { distance: 10, surface: "road" as const, difficulty: "medium" as const },
      {
        distance: 10,
        surface: "track" as const,
        difficulty: "medium" as const,
      },
    );
  }

  // Chapter 3: Half marathon preparation
  if (chapter.number === 3) {
    recommendations.push(
      { distance: 10, surface: "road" as const, difficulty: "hard" as const },
      { distance: 15, surface: "road" as const, difficulty: "medium" as const },
      {
        distance: 21.1,
        surface: "road" as const,
        difficulty: "medium" as const,
      },
    );
  }

  // Chapter 4: Marathon preparation
  if (chapter.number === 4) {
    recommendations.push(
      { distance: 21.1, surface: "road" as const, difficulty: "hard" as const },
      { distance: 30, surface: "road" as const, difficulty: "medium" as const },
      {
        distance: 42.195,
        surface: "road" as const,
        difficulty: "medium" as const,
      },
    );
  }

  // Chapter 5: Elite level
  if (chapter.number === 5) {
    recommendations.push(
      {
        distance: 42.195,
        surface: "road" as const,
        difficulty: "hard" as const,
      },
      {
        distance: 42.195,
        surface: "track" as const,
        difficulty: "hard" as const,
      },
    );
  }

  return recommendations;
}

/**
 * Calculate story contribution multiplier for XP/rewards
 */
export function getStoryRewardMultiplier(
  raceDistance: number,
  storyProgress: StoryProgress,
): number {
  const chapter = getChapterByNumber(storyProgress.currentChapter);
  if (!chapter) return 1.0;

  // Championship races give bonus rewards
  const activeChapter = getActiveChapter({} as RunnerProfile, storyProgress);
  if (activeChapter?.championshipUnlocked) {
    return 1.5; // 50% bonus when championship is available
  }

  // Regular multiplier based on chapter progress
  const progressPercent = activeChapter?.progressPercent || 0;
  if (progressPercent > 75) {
    return 1.3; // Near championship
  }
  if (progressPercent > 50) {
    return 1.2; // Mid chapter
  }

  return 1.1; // Early chapter
}
