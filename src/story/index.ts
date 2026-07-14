/**
 * Story System - Sprint 22 Implementation
 * 
 * A comprehensive 5-chapter career story mode for RunQuest
 */

// Core Types
export type {
  StoryChapter,
  StoryBeat,
  StoryProgress,
  ChapterRequirements,
  ChampionshipRace,
  ChapterRewards,
  ChapterUnlock,
  ActiveChapterState,
  StoryEvent,
  ChampionshipResult,
  ChapterTheme,
  StoryBeatTrigger,
  CinematicType,
} from "./story-types";

// Chapter Database
export {
  STORY_CHAPTERS,
  getChapterByNumber,
  getChapterById,
  getUnlockedChapters,
  isChapterUnlocked,
} from "./chapter-database";

// Story Engine
export {
  initializeStoryProgress,
  getActiveChapter,
  markStoryBeatViewed,
  recordChampionshipAttempt,
  recordChampionshipResult,
  completeChapter,
  incrementStoryRaces,
  isChapterComplete,
  getAvailableChapters,
  isChampionshipAvailable,
  getPendingStoryEvents,
  getChapterCompletionPercent,
  getTotalStoryCompletion,
  addStoryMilestone,
  hasWonChampionship,
  getChampionshipAttempts,
} from "./story-engine";

// State Management
export {
  useStoryStore,
  selectStoryProgress,
  selectCurrentChapter,
  selectCompletedChapters,
  selectTotalStoryRaces,
  selectIsLoaded,
} from "./story-store";

// Persistence
export {
  loadStoryProgress,
  saveStoryProgress,
  loadOrInitializeStoryProgress,
  clearStoryProgress,
} from "./story-persistence";

// Championship Generator
export {
  generateChampionshipChallenge,
  isChampionshipRace,
  getChampionshipData,
} from "./championship-generator";

// Story Integration
export {
  handleRaceComplete,
  canAccessRace,
  getRecommendedRacesForChapter,
  getStoryRewardMultiplier,
} from "./story-integration";

// Career Biography
export type {
  CareerMilestone,
  CareerStatistics,
  CareerBiography,
} from "./career-biography";

export {
  generateCareerBiography,
  getCareerSummary,
  getAchievementBadges,
} from "./career-biography";

// Story Unlocks
export type { UnlockState } from "./story-unlocks";

export {
  getUnlockedFeatures,
  isFeatureUnlocked,
  isRivalUnlocked,
  getAvailableRivals,
  getUnlockRequirements,
  getNewUnlocksFromChapter,
  getLockedContent,
  getUnlockPreviewText,
  isTrainingUnlocked,
  isGearUnlocked,
  getUnlockNotification,
} from "./story-unlocks";
