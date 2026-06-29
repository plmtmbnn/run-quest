import type { z } from "zod/v4";
import type {
  PlayerStatisticsSchema,
  RaceHistoryEntrySchema,
  StoredDailyBoardSchema,
  StoredDailySchema,
  StoredHistorySchema,
  StoredPlayerSchema,
  StoredSettingsSchema,
} from "./schemas";

export type StoredPlayer = z.infer<typeof StoredPlayerSchema>;
export type StoredSettings = z.infer<typeof StoredSettingsSchema>;
export type StoredDaily = z.infer<typeof StoredDailySchema>;
export type StoredDailyBoard = z.infer<typeof StoredDailyBoardSchema>;
export type StoredHistory = z.infer<typeof StoredHistorySchema>;
export type PlayerStatistics = z.infer<typeof PlayerStatisticsSchema>;
export type RaceHistoryEntry = z.infer<typeof RaceHistoryEntrySchema>;

/**
 * All recognized storage keys.
 */
export type StorageKey =
  | "runquest.version"
  | "runquest.player"
  | "runquest.settings"
  | "runquest.history"
  | "runquest.daily"
  | "runquest.board"
  | "runquest.cache";
