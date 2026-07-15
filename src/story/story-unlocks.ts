import type { RunnerProfile } from "@/runner/runner-types";
import { getChapterByNumber } from "./chapter-database";
import type { ChapterUnlock, StoryProgress } from "./story-types";

/**
 * Story Unlocks System - Manages feature and content unlocks from story progression
 */

export interface UnlockState {
  rivals: string[]; // Unlocked rival IDs
  training: string[]; // Unlocked training types
  gear: string[]; // Unlocked gear items
  locations: string[]; // Unlocked locations
  features: string[]; // Unlocked system features
  story: string[]; // Unlocked story content
}

/**
 * Get all unlocks from completed chapters
 */
export function getUnlockedFeatures(storyProgress: StoryProgress): UnlockState {
  const unlocks: UnlockState = {
    rivals: [],
    training: [],
    gear: [],
    locations: [],
    features: [],
    story: [],
  };

  // Process each completed chapter
  for (const chapterNum of storyProgress.completedChapters) {
    const chapter = getChapterByNumber(chapterNum);
    if (!chapter) continue;

    // Add all unlocks from this chapter
    for (const unlock of chapter.rewards.unlocks) {
      switch (unlock.type) {
        case "rival":
          unlocks.rivals.push(unlock.id);
          break;
        case "training":
          unlocks.training.push(unlock.id);
          break;
        case "gear":
          unlocks.gear.push(unlock.id);
          break;
        case "location":
          unlocks.locations.push(unlock.id);
          break;
        case "feature":
          unlocks.features.push(unlock.id);
          break;
        case "story":
          unlocks.story.push(unlock.id);
          break;
      }
    }
  }

  return unlocks;
}

/**
 * Check if a specific feature is unlocked
 */
export function isFeatureUnlocked(
  featureId: string,
  storyProgress: StoryProgress,
): boolean {
  const unlocks = getUnlockedFeatures(storyProgress);
  return (
    unlocks.rivals.includes(featureId) ||
    unlocks.training.includes(featureId) ||
    unlocks.gear.includes(featureId) ||
    unlocks.locations.includes(featureId) ||
    unlocks.features.includes(featureId) ||
    unlocks.story.includes(featureId)
  );
}

/**
 * Check if a rival is unlocked
 */
export function isRivalUnlocked(
  rivalId: string,
  storyProgress: StoryProgress,
): boolean {
  // Some rivals are always available (from Sprint 20)
  const alwaysAvailable = ["alex", "jordan", "riley"];
  if (alwaysAvailable.includes(rivalId)) return true;

  const unlocks = getUnlockedFeatures(storyProgress);
  return unlocks.rivals.includes(rivalId);
}

/**
 * Get available rivals based on story progress
 */
export function getAvailableRivals(storyProgress: StoryProgress): string[] {
  const baseRivals = ["alex", "jordan", "riley"]; // Always available
  const unlocks = getUnlockedFeatures(storyProgress);
  return [...baseRivals, ...unlocks.rivals];
}

/**
 * Get unlock requirements for a feature
 */
export function getUnlockRequirements(featureId: string): {
  chapterNumber: number;
  chapterTitle: { en: string; id: string };
} | null {
  // Search through chapters to find which one unlocks this feature
  for (let i = 1; i <= 5; i++) {
    const chapter = getChapterByNumber(i);
    if (!chapter) continue;

    const hasUnlock = chapter.rewards.unlocks.some(
      (unlock) => unlock.id === featureId,
    );

    if (hasUnlock) {
      return {
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
      };
    }
  }

  return null;
}

/**
 * Get new unlocks from a chapter completion
 */
export function getNewUnlocksFromChapter(
  chapterNumber: number,
): ChapterUnlock[] {
  const chapter = getChapterByNumber(chapterNumber);
  return chapter?.rewards.unlocks || [];
}

/**
 * Apply unlocks to runner profile (for compatibility with existing systems)
 */
export function applyUnlocksToProfile(
  profile: RunnerProfile,
  unlocks: UnlockState,
): RunnerProfile {
  // This function can be extended to modify profile based on unlocks
  // For now, story unlocks are tracked separately in StoryProgress
  return profile;
}

/**
 * Get all locked content that player can see but not access
 */
export function getLockedContent(storyProgress: StoryProgress): Array<{
  type: "rival" | "training" | "gear" | "location" | "feature" | "story";
  id: string;
  name: { en: string; id: string };
  description: { en: string; id: string };
  unlockChapter: number;
}> {
  const locked: Array<{
    type: "rival" | "training" | "gear" | "location" | "feature" | "story";
    id: string;
    name: { en: string; id: string };
    description: { en: string; id: string };
    unlockChapter: number;
  }> = [];

  const currentUnlocks = getUnlockedFeatures(storyProgress);

  // Check next chapter's unlocks
  const nextChapter = storyProgress.currentChapter;
  for (let i = nextChapter; i <= 5; i++) {
    const chapter = getChapterByNumber(i);
    if (!chapter) continue;

    for (const unlock of chapter.rewards.unlocks) {
      // Check if not already unlocked
      const isUnlocked = (() => {
        switch (unlock.type) {
          case "rival":
            return currentUnlocks.rivals.includes(unlock.id);
          case "training":
            return currentUnlocks.training.includes(unlock.id);
          case "gear":
            return currentUnlocks.gear.includes(unlock.id);
          case "location":
            return currentUnlocks.locations.includes(unlock.id);
          case "feature":
            return currentUnlocks.features.includes(unlock.id);
          case "story":
            return currentUnlocks.story.includes(unlock.id);
        }
      })();

      if (!isUnlocked) {
        locked.push({
          type: unlock.type,
          id: unlock.id,
          name: unlock.name,
          description: unlock.description,
          unlockChapter: chapter.number,
        });
      }
    }
  }

  return locked;
}

/**
 * Get unlock preview text for UI
 */
export function getUnlockPreviewText(
  unlock: ChapterUnlock,
  lang: "en" | "id",
): string {
  const prefix = lang === "en" ? "🔓 Unlocks:" : "🔓 Membuka:";
  return `${prefix} ${unlock.name[lang]}`;
}

/**
 * Check if training type is unlocked
 */
export function isTrainingUnlocked(
  trainingId: string,
  storyProgress: StoryProgress,
): boolean {
  // Base training always available
  const baseTraining = ["easy_run", "tempo_run", "long_run"];
  if (baseTraining.includes(trainingId)) return true;

  const unlocks = getUnlockedFeatures(storyProgress);
  return unlocks.training.includes(trainingId);
}

/**
 * Check if gear is unlocked
 */
export function isGearUnlocked(
  gearId: string,
  storyProgress: StoryProgress,
): boolean {
  // Base gear always available
  const baseGear = ["daily_trainer", "water", "cap"];
  if (baseGear.includes(gearId)) return true;

  const unlocks = getUnlockedFeatures(storyProgress);
  return unlocks.gear.includes(gearId);
}

/**
 * Get unlock notification text
 */
export function getUnlockNotification(
  unlocks: ChapterUnlock[],
  lang: "en" | "id",
): string {
  if (unlocks.length === 0) return "";

  if (lang === "en") {
    if (unlocks.length === 1) {
      return `New unlock: ${unlocks[0].name.en}!`;
    }
    return `${unlocks.length} new features unlocked!`;
  }

  if (unlocks.length === 1) {
    return `Fitur baru terbuka: ${unlocks[0].name.id}!`;
  }
  return `${unlocks.length} fitur baru terbuka!`;
}
