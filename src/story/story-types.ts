import type { RunnerProfile } from "@/runner/runner-types";
import type { LocalizedText } from "@/types/engine";

/**
 * Story chapter themes define the narrative arc
 */
export type ChapterTheme =
  | "origins" // Discovery and determination
  | "growth" // Competition and rivalry
  | "trials" // Adversity and comeback
  | "glory" // Championship pursuit
  | "legacy"; // Career culmination

/**
 * Story beat trigger points
 */
export type StoryBeatTrigger =
  | "chapter_start" // When chapter unlocks
  | "mid_chapter" // After 50% chapter progress
  | "pre_final" // Before final championship race
  | "chapter_complete" // After winning chapter
  | "chapter_failure"; // After losing chapter race

/**
 * Cinematic presentation types
 */
export type CinematicType =
  | "text" // Simple text card
  | "dialogue" // Coach/rival dialogue
  | "montage" // Visual montage with narration
  | "flashback"; // Memory sequence

/**
 * Represents a story beat (narrative moment)
 */
export interface StoryBeat {
  id: string;
  trigger: StoryBeatTrigger;
  cinematicType: CinematicType;
  title: LocalizedText;
  content: LocalizedText;
  characterAppearances?: string[]; // e.g., ["coach", "marcus", "elena"]
  emotionalTone?: "inspiring" | "tense" | "triumphant" | "reflective";
  voiceOver?: LocalizedText; // Optional narration
  backgroundImage?: string; // Optional visual
  skipable?: boolean; // Can player skip this?
}

/**
 * Chapter unlock requirements
 */
export interface ChapterRequirements {
  minLevel: number;
  minTotalRaces?: number;
  minTotalDistance?: number; // in km
  previousChapterComplete?: number; // Previous chapter number
  specificRivalDefeated?: string[];
  customCondition?: (profile: RunnerProfile) => boolean;
}

/**
 * Championship race for chapter finale
 */
export interface ChampionshipRace {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  distance: number; // in km
  location: string; // e.g., "Boston", "New York"
  stakes: LocalizedText; // What's on the line
  rivalLineup: string[]; // Rival IDs participating
  difficulty: "easy" | "medium" | "hard" | "extreme";
  requiredToComplete: boolean; // Must win to unlock next chapter
  retryable: boolean; // Can retry if lost
  unlockMessage?: LocalizedText; // Shown when available
}

/**
 * Rewards for completing a chapter
 */
export interface ChapterRewards {
  xp: number;
  coins: number;
  unlocks: ChapterUnlock[];
  title?: LocalizedText; // Special title/badge
  specialItem?: string; // Unique gear or item
}

/**
 * Feature unlocks from completing chapters
 */
export interface ChapterUnlock {
  type:
    | "rival" // New rival available
    | "training" // New training type
    | "gear" // New equipment
    | "location" // New race location
    | "feature" // System feature
    | "story"; // Story content
  id: string;
  name: LocalizedText;
  description: LocalizedText;
}

/**
 * Represents a career story chapter
 */
export interface StoryChapter {
  id: string;
  number: 1 | 2 | 3 | 4 | 5;
  title: LocalizedText;
  subtitle: LocalizedText; // e.g., "The Beginning"
  theme: ChapterTheme;
  synopsis: LocalizedText; // Brief chapter overview
  unlockRequirements: ChapterRequirements;
  storyBeats: StoryBeat[];
  finalRace: ChampionshipRace;
  rewards: ChapterRewards;
  estimatedRaces: number; // How many races in this chapter
  icon?: string; // Emoji or icon
}

/**
 * Player's story progression state
 */
export interface StoryProgress {
  currentChapter: number;
  completedChapters: number[];
  unlockedChapters: number[];
  viewedStoryBeats: string[]; // IDs of seen story beats
  championshipAttempts: Record<string, number>; // race ID -> attempt count
  championshipResults: Record<string, ChampionshipResult>;
  chapterStartedAt: Record<number, string>; // chapter -> ISO timestamp
  chapterCompletedAt: Record<number, string>; // chapter -> ISO timestamp
  totalStoryRaces: number;
  storyMilestones: string[]; // Special story achievement IDs
}

/**
 * Championship race result
 */
export interface ChampionshipResult {
  raceId: string;
  won: boolean;
  finishTime: number; // in seconds
  position: number; // 1-based
  attempts: number;
  completedAt: string; // ISO timestamp
  grade?: string; // e.g., "S", "A", "B"
}

/**
 * Story state for active chapter
 */
export interface ActiveChapterState {
  chapter: StoryChapter;
  racesCompleted: number;
  progressPercent: number; // 0-100
  nextStoryBeat: StoryBeat | null;
  championshipUnlocked: boolean;
}

/**
 * Default story progress for new runners
 */
export const DEFAULT_STORY_PROGRESS: StoryProgress = {
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

/**
 * Story event for triggering cinematics
 */
export interface StoryEvent {
  type: "story_beat" | "chapter_unlock" | "championship_available";
  storyBeat?: StoryBeat;
  chapter?: StoryChapter;
  timestamp: string;
}
