import type { StoryProgress } from "./story-types";
import { StoredStoryProgressSchema } from "./story-schema";
import { initializeStoryProgress } from "./story-engine";

const STORY_STORAGE_KEY = "runquest.story";
const STORY_VERSION = 1;

/**
 * Story persistence utilities
 */

/**
 * Load story progress from localStorage
 */
export function loadStoryProgress(): StoryProgress | null {
  try {
    const raw = localStorage.getItem(STORY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const result = StoredStoryProgressSchema.safeParse(parsed);

    if (!result.success) {
      console.warn("[Story] Failed to validate stored story progress", result.error);
      return null;
    }

    // Convert stored format to runtime format (remove version field)
    const { version: _, ...storyProgress } = result.data;
    return storyProgress as StoryProgress;
  } catch (error) {
    console.warn("[Story] Failed to load story progress", error);
    return null;
  }
}

/**
 * Save story progress to localStorage
 */
export function saveStoryProgress(progress: StoryProgress): void {
  try {
    const stored = {
      version: STORY_VERSION,
      ...progress,
    };
    localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.warn("[Story] Failed to save story progress", error);
  }
}

/**
 * Load or initialize story progress
 */
export function loadOrInitializeStoryProgress(): StoryProgress {
  const loaded = loadStoryProgress();
  if (loaded) return loaded;

  const initialized = initializeStoryProgress();
  saveStoryProgress(initialized);
  return initialized;
}

/**
 * Clear story progress
 */
export function clearStoryProgress(): void {
  try {
    localStorage.removeItem(STORY_STORAGE_KEY);
  } catch (error) {
    console.warn("[Story] Failed to clear story progress", error);
  }
}
