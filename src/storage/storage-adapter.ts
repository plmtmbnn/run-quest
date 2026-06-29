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
   */
  clear(): void {
    const keysToRemove: StorageKey[] = [
      "runquest.version",
      "runquest.player",
      "runquest.settings",
      "runquest.history",
      "runquest.daily",
      "runquest.cache",
    ];
    for (const key of keysToRemove) {
      this.remove(key);
    }
  },
};
