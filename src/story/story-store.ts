import { create } from "zustand";
import {
  loadOrInitializeStoryProgress,
  saveStoryProgress,
} from "./story-persistence";
import type { StoryProgress } from "./story-types";

/**
 * Story state management with Zustand
 */
interface StoryState {
  storyProgress: StoryProgress;
  isLoaded: boolean;

  // Actions
  setStoryProgress: (progress: StoryProgress) => void;
  updateStoryProgress: (
    updater: (prev: StoryProgress) => StoryProgress,
  ) => void;
  resetStoryProgress: () => void;
  loadFromStorage: () => void;
}

/**
 * Story store - manages story progression state with persistence
 */
export const useStoryStore = create<StoryState>((set, get) => ({
  storyProgress: loadOrInitializeStoryProgress(),
  isLoaded: false,

  setStoryProgress: (progress: StoryProgress) => {
    set({ storyProgress: progress });
    saveStoryProgress(progress);
  },

  updateStoryProgress: (updater: (prev: StoryProgress) => StoryProgress) => {
    const newProgress = updater(get().storyProgress);
    set({ storyProgress: newProgress });
    saveStoryProgress(newProgress);
  },

  resetStoryProgress: () => {
    const initialized = loadOrInitializeStoryProgress();
    set({ storyProgress: initialized });
    saveStoryProgress(initialized);
  },

  loadFromStorage: () => {
    const loaded = loadOrInitializeStoryProgress();
    set({ storyProgress: loaded, isLoaded: true });
  },
}));

/**
 * Selectors for accessing story state
 */
export const selectStoryProgress = (state: StoryState) => state.storyProgress;
export const selectCurrentChapter = (state: StoryState) =>
  state.storyProgress.currentChapter;
export const selectCompletedChapters = (state: StoryState) =>
  state.storyProgress.completedChapters;
export const selectTotalStoryRaces = (state: StoryState) =>
  state.storyProgress.totalStoryRaces;
export const selectIsLoaded = (state: StoryState) => state.isLoaded;
