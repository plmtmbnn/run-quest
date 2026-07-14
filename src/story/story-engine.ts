import type { RunnerProfile } from "@/runner/runner-types";
import type {
  ActiveChapterState,
  ChampionshipResult,
  StoryBeat,
  StoryChapter,
  StoryEvent,
  StoryProgress,
} from "./story-types";
import { getChapterByNumber, isChapterUnlocked, STORY_CHAPTERS } from "./chapter-database";

/**
 * Story Engine - Manages story progression and chapter unlocks
 */

/**
 * Initialize story progress for a new runner
 */
export function initializeStoryProgress(): StoryProgress {
  return {
    currentChapter: 1,
    completedChapters: [],
    unlockedChapters: [1], // Chapter 1 starts unlocked
    viewedStoryBeats: [],
    championshipAttempts: {},
    championshipResults: {},
    chapterStartedAt: { 1: new Date().toISOString() },
    chapterCompletedAt: {},
    totalStoryRaces: 0,
    storyMilestones: [],
  };
}

/**
 * Get the active chapter state for the player
 */
export function getActiveChapter(
  profile: RunnerProfile,
  storyProgress: StoryProgress,
): ActiveChapterState | null {
  const chapter = getChapterByNumber(storyProgress.currentChapter);
  if (!chapter) return null;

  // Calculate progress based on races completed
  const racesCompleted = storyProgress.totalStoryRaces;
  const progressPercent = Math.min(
    100,
    (racesCompleted / chapter.estimatedRaces) * 100,
  );

  // Determine next story beat
  const nextBeat = getNextStoryBeat(chapter, storyProgress, progressPercent);

  // Check if championship is unlocked
  const championshipUnlocked = progressPercent >= 80; // Unlock at 80% progress

  return {
    chapter,
    racesCompleted: storyProgress.totalStoryRaces,
    progressPercent,
    nextStoryBeat: nextBeat,
    championshipUnlocked,
  };
}

/**
 * Get the next story beat that should be shown
 */
function getNextStoryBeat(
  chapter: StoryChapter,
  storyProgress: StoryProgress,
  progressPercent: number,
): StoryBeat | null {
  for (const beat of chapter.storyBeats) {
    // Skip if already viewed
    if (storyProgress.viewedStoryBeats.includes(beat.id)) {
      continue;
    }

    // Check trigger conditions
    if (beat.trigger === "chapter_start" && progressPercent === 0) {
      return beat;
    }

    if (beat.trigger === "mid_chapter" && progressPercent >= 50) {
      return beat;
    }

    if (beat.trigger === "pre_final" && progressPercent >= 80) {
      return beat;
    }
  }

  return null;
}

/**
 * Mark a story beat as viewed
 */
export function markStoryBeatViewed(
  storyProgress: StoryProgress,
  beatId: string,
): StoryProgress {
  return {
    ...storyProgress,
    viewedStoryBeats: [...storyProgress.viewedStoryBeats, beatId],
  };
}

/**
 * Record a championship attempt
 */
export function recordChampionshipAttempt(
  storyProgress: StoryProgress,
  raceId: string,
): StoryProgress {
  const currentAttempts = storyProgress.championshipAttempts[raceId] || 0;
  return {
    ...storyProgress,
    championshipAttempts: {
      ...storyProgress.championshipAttempts,
      [raceId]: currentAttempts + 1,
    },
  };
}

/**
 * Record a championship result
 */
export function recordChampionshipResult(
  storyProgress: StoryProgress,
  result: ChampionshipResult,
): StoryProgress {
  return {
    ...storyProgress,
    championshipResults: {
      ...storyProgress.championshipResults,
      [result.raceId]: result,
    },
  };
}

/**
 * Complete a chapter and unlock the next one
 */
export function completeChapter(
  storyProgress: StoryProgress,
  chapterNumber: number,
): StoryProgress {
  const nextChapter = chapterNumber + 1;
  const now = new Date().toISOString();

  return {
    ...storyProgress,
    completedChapters: [...storyProgress.completedChapters, chapterNumber],
    unlockedChapters: storyProgress.unlockedChapters.includes(nextChapter)
      ? storyProgress.unlockedChapters
      : [...storyProgress.unlockedChapters, nextChapter],
    currentChapter: nextChapter <= 5 ? nextChapter : chapterNumber,
    chapterCompletedAt: {
      ...storyProgress.chapterCompletedAt,
      [chapterNumber]: now,
    },
    chapterStartedAt: {
      ...storyProgress.chapterStartedAt,
      [nextChapter]: now,
    },
    totalStoryRaces: 0, // Reset counter for new chapter
  };
}

/**
 * Increment story race count
 */
export function incrementStoryRaces(storyProgress: StoryProgress): StoryProgress {
  return {
    ...storyProgress,
    totalStoryRaces: storyProgress.totalStoryRaces + 1,
  };
}

/**
 * Check if a chapter is completed
 */
export function isChapterComplete(
  storyProgress: StoryProgress,
  chapterNumber: number,
): boolean {
  return storyProgress.completedChapters.includes(chapterNumber);
}

/**
 * Get all available chapters for the player
 */
export function getAvailableChapters(
  profile: RunnerProfile,
  storyProgress: StoryProgress,
): StoryChapter[] {
  return STORY_CHAPTERS.filter((chapter) => {
    // Check if unlocked in story progress
    if (!storyProgress.unlockedChapters.includes(chapter.number)) {
      return false;
    }

    // Check if requirements are met
    return isChapterUnlocked(chapter, profile);
  });
}

/**
 * Check if championship race is available
 */
export function isChampionshipAvailable(
  chapter: StoryChapter,
  storyProgress: StoryProgress,
): boolean {
  // Check if chapter is current
  if (storyProgress.currentChapter !== chapter.number) {
    return false;
  }

  // Check if already completed
  const result = storyProgress.championshipResults[chapter.finalRace.id];
  if (result && result.won && chapter.finalRace.requiredToComplete) {
    return false; // Already won and can't retry
  }

  // Check progress requirement (80% of estimated races)
  const activeChapter = getActiveChapter(
    {} as RunnerProfile,
    storyProgress,
  );
  if (!activeChapter) return false;

  return activeChapter.championshipUnlocked;
}

/**
 * Get pending story events (beats that should trigger)
 */
export function getPendingStoryEvents(
  profile: RunnerProfile,
  storyProgress: StoryProgress,
): StoryEvent[] {
  const events: StoryEvent[] = [];

  // Check for chapter unlock events
  for (const chapter of STORY_CHAPTERS) {
    if (
      !storyProgress.unlockedChapters.includes(chapter.number) &&
      isChapterUnlocked(chapter, profile)
    ) {
      events.push({
        type: "chapter_unlock",
        chapter,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Check for story beat events
  const activeChapter = getActiveChapter(profile, storyProgress);
  if (activeChapter?.nextStoryBeat) {
    events.push({
      type: "story_beat",
      storyBeat: activeChapter.nextStoryBeat,
      timestamp: new Date().toISOString(),
    });
  }

  // Check for championship availability
  if (activeChapter?.championshipUnlocked) {
    const chapter = activeChapter.chapter;
    const alreadyNotified = storyProgress.viewedStoryBeats.includes(
      `championship_available_${chapter.number}`,
    );
    if (!alreadyNotified) {
      events.push({
        type: "championship_available",
        chapter,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return events;
}

/**
 * Get chapter completion percentage
 */
export function getChapterCompletionPercent(
  chapterNumber: number,
  storyProgress: StoryProgress,
): number {
  const chapter = getChapterByNumber(chapterNumber);
  if (!chapter) return 0;

  if (storyProgress.completedChapters.includes(chapterNumber)) {
    return 100;
  }

  if (storyProgress.currentChapter === chapterNumber) {
    const racesCompleted = storyProgress.totalStoryRaces;
    return Math.min(100, (racesCompleted / chapter.estimatedRaces) * 100);
  }

  return 0;
}

/**
 * Get total story completion percentage
 */
export function getTotalStoryCompletion(storyProgress: StoryProgress): number {
  const totalChapters = STORY_CHAPTERS.length;
  const completedChapters = storyProgress.completedChapters.length;
  return Math.round((completedChapters / totalChapters) * 100);
}

/**
 * Add a story milestone
 */
export function addStoryMilestone(
  storyProgress: StoryProgress,
  milestoneId: string,
): StoryProgress {
  if (storyProgress.storyMilestones.includes(milestoneId)) {
    return storyProgress;
  }

  return {
    ...storyProgress,
    storyMilestones: [...storyProgress.storyMilestones, milestoneId],
  };
}

/**
 * Check if a specific championship has been won
 */
export function hasWonChampionship(
  storyProgress: StoryProgress,
  raceId: string,
): boolean {
  const result = storyProgress.championshipResults[raceId];
  return result?.won ?? false;
}

/**
 * Get championship attempts for a race
 */
export function getChampionshipAttempts(
  storyProgress: StoryProgress,
  raceId: string,
): number {
  return storyProgress.championshipAttempts[raceId] || 0;
}
