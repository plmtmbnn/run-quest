import type { StorageKey } from "./types";

/**
 * Low-level adapter wrapping the browser's localStorage API.
 * This is the only module that may call localStorage directly.
 * Every other module must go through StorageRepository.
 */
export const storageAdapter = {
  /**
   * Read a raw string value from localStorage.
   */
  get(key: StorageKey): string | null {
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /**
   * Write a raw string value to localStorage.
   */
  set(key: StorageKey, value: string): void {
    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      console.warn(`[StorageAdapter] Failed to write key: ${key}`);
    }
  },

  /**
   * Remove a key from localStorage.
   */
  remove(key: StorageKey): void {
    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      console.warn(`[StorageAdapter] Failed to remove key: ${key}`);
    }
  },

  /**
   * Check whether a key exists in localStorage.
   */
  exists(key: StorageKey): boolean {
    try {
      return globalThis.localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  /**
   * Remove all runquest keys from localStorage.
   * Sprint 29 Task 11: Enhanced to clear all game-related keys
   */
  clear(): void {
    const keysToRemove: StorageKey[] = [
      "runquest.version",
      "runquest.player",
      "runquest.settings",
      "runquest.history",
      "runquest.daily",
      "runquest.board",
      "runquest.cache",
      "runquest.timeline", // Sprint 29: Added missing timeline key
    ];
    for (const key of keysToRemove) {
      this.remove(key);
    }
    
    // Sprint 29: Clear additional non-prefixed keys used by various stores
    try {
      globalThis.localStorage.removeItem("runnerProfile"); // Runner store
      globalThis.localStorage.removeItem("trainingState"); // Training store (if exists)
      globalThis.localStorage.removeItem("rivalData"); // Rival store (if exists)
      globalThis.localStorage.removeItem("storyProgress"); // Story store (if exists)
      globalThis.localStorage.removeItem("socialData"); // Social store (if exists)
    } catch (e) {
      console.warn("[StorageAdapter] Failed to clear some additional keys", e);
    }
  },
};
