/**
 * Story System - Sprint 22 Implementation
 *
 * A comprehensive 5-chapter career story mode for RunQuest
 */

// Career Biography
export type {
  CareerBiography,
  CareerMilestone,
  CareerStatistics,
} from "./career-biography";
export {
  generateCareerBiography,
  getAchievementBadges,
  getCareerSummary,
} from "./career-biography";
// Championship Generator
export {
  generateChampionshipChallenge,
  getChampionshipData,
  isChampionshipRace,
} from "./championship-generator";
// Chapter Database
export {
  getChapterById,
  getChapterByNumber,
  getUnlockedChapters,
  isChapterUnlocked,
  STORY_CHAPTERS,
} from "./chapter-database";
// Story Engine
export {
  addStoryMilestone,
  completeChapter,
  getActiveChapter,
  getAvailableChapters,
  getChampionshipAttempts,
  getChapterCompletionPercent,
  getPendingStoryEvents,
  getTotalStoryCompletion,
  hasWonChampionship,
  incrementStoryRaces,
  initializeStoryProgress,
  isChampionshipAvailable,
  isChapterComplete,
  markStoryBeatViewed,
  recordChampionshipAttempt,
  recordChampionshipResult,
} from "./story-engine";
// Story Integration
export {
  canAccessRace,
  getRecommendedRacesForChapter,
  getStoryRewardMultiplier,
  handleRaceComplete,
} from "./story-integration";
// Persistence
export {
  clearStoryProgress,
  loadOrInitializeStoryProgress,
  loadStoryProgress,
  saveStoryProgress,
} from "./story-persistence";
// State Management
export {
  selectCompletedChapters,
  selectCurrentChapter,
  selectIsLoaded,
  selectStoryProgress,
  selectTotalStoryRaces,
  useStoryStore,
} from "./story-store";
// Core Types
export type {
  ActiveChapterState,
  ChampionshipRace,
  ChampionshipResult,
  ChapterRequirements,
  ChapterRewards,
  ChapterTheme,
  ChapterUnlock,
  CinematicType,
  StoryBeat,
  StoryBeatTrigger,
  StoryChapter,
  StoryEvent,
  StoryProgress,
} from "./story-types";

// Story Unlocks
export type { UnlockState } from "./story-unlocks";

export {
  getAvailableRivals,
  getLockedContent,
  getNewUnlocksFromChapter,
  getUnlockedFeatures,
  getUnlockNotification,
  getUnlockPreviewText,
  getUnlockRequirements,
  isFeatureUnlocked,
  isGearUnlocked,
  isRivalUnlocked,
  isTrainingUnlocked,
} from "./story-unlocks";
