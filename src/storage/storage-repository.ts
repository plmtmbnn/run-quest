import type { ZodType } from "zod/v4";
import type { GameState } from "@/engine/timeline";
import {
  StoredDailyBoardSchema,
  StoredDailySchema,
  StoredGameStateSchema,
  StoredHistorySchema,
  StoredPlayerSchema,
  StoredSettingsSchema,
} from "./schemas";
import { storageAdapter } from "./storage-adapter";
import type {
  StorageKey,
  StoredDaily,
  StoredDailyBoard,
  StoredGameState,
  StoredHistory,
  StoredPlayer,
  StoredSettings,
} from "./types";

const TIMELINE_VERSION = 1;

/**
 * Parse JSON from localStorage and validate with a Zod schema.
 * Returns null if the key is missing, JSON is invalid, or validation fails.
 */
function loadAndValidate<T>(key: StorageKey, schema: ZodType<T>): T | null {
  const raw = storageAdapter.get(key);
  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[StorageRepository] Validation failed for key: ${key}`,
        result.error,
      );
      return null;
    }
    return result.data;
  } catch {
    console.warn(`[StorageRepository] Invalid JSON for key: ${key}`);
    return null;
  }
}

/**
 * Serialize and save a typed object to localStorage.
 */
function save<T>(key: StorageKey, value: T): void {
  try {
    storageAdapter.set(key, JSON.stringify(value));
  } catch {
    console.warn(`[StorageRepository] Failed to serialize key: ${key}`);
  }
}

/**
 * Repository — the single public interface for all storage operations.
 * Components and stores must only use this module, never the adapter directly.
 */
export const storageRepository = {
  // ── Player ──────────────────────────────────────────────

  loadPlayer(): StoredPlayer | null {
    return loadAndValidate("runquest.player", StoredPlayerSchema);
  },

  savePlayer(player: StoredPlayer): void {
    save("runquest.player", player);
  },

  // ── Settings ─────────────────────────────────────────────

  loadSettings(): StoredSettings | null {
    return loadAndValidate("runquest.settings", StoredSettingsSchema);
  },

  saveSettings(settings: StoredSettings): void {
    save("runquest.settings", settings);
  },

  // ── Daily Progress ────────────────────────────────────────

  loadDaily(): StoredDaily | null {
    return loadAndValidate("runquest.daily", StoredDailySchema);
  },

  saveDaily(daily: StoredDaily): void {
    save("runquest.daily", daily);
  },

  // ── Daily Board ───────────────────────────────────────────

  loadDailyBoard(): StoredDailyBoard | null {
    return loadAndValidate("runquest.board", StoredDailyBoardSchema);
  },

  saveDailyBoard(board: StoredDailyBoard): void {
    save("runquest.board", board);
  },

  // ── Race History ──────────────────────────────────────────

  loadHistory(): StoredHistory | null {
    return loadAndValidate("runquest.history", StoredHistorySchema);
  },

  saveHistory(history: StoredHistory): void {
    save("runquest.history", history);
  },

  // ── Time & Calendar Engine (Sprint 23-B) ─────────────────────

  loadGameState(): StoredGameState | null {
    return loadAndValidate("runquest.timeline", StoredGameStateSchema);
  },

  saveGameState(state: GameState): void {
    save("runquest.timeline", {
      version: TIMELINE_VERSION,
      ...state,
    } as StoredGameState);
  },

  // ── Utilities ─────────────────────────────────────────────

  exists(key: StorageKey): boolean {
    return storageAdapter.exists(key);
  },

  remove(key: StorageKey): void {
    storageAdapter.remove(key);
  },

  clearAll(): void {
    storageAdapter.clear();
  },
};
