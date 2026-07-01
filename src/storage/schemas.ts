import { z } from "zod/v4";

/**
 * Schema for the storage version marker.
 */
export const StorageVersionSchema = z.object({
  version: z.number(),
});

/**
 * Schema for player statistics.
 */
export const PlayerStatisticsSchema = z.object({
  totalRuns: z.number(),
  totalWins: z.number(),
  totalDistance: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  perfectRuns: z.number(),
});

/**
 * Schema for a stored player.
 */
export const StoredPlayerSchema = z.object({
  version: z.number(),
  id: z.string(),
  name: z.string().optional(),
  language: z.enum(["en", "id"]),
  createdAt: z.string(),
  lastPlayedAt: z.string().nullable(),
  statistics: PlayerStatisticsSchema,
});

/**
 * Schema for stored settings.
 */
export const StoredSettingsSchema = z.object({
  version: z.number(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "id"]),
  reducedMotion: z.boolean(),
  sound: z.boolean(),
  preferences: z
    .object({
      preferredSurface: z.enum(["road", "trail", "track", "any"]),
      preferredDistance: z.enum(["short", "medium", "long", "any"]),
    })
    .default({ preferredSurface: "any", preferredDistance: "any" }),
});

/**
 * Schema for daily progress tracking.
 */
export const StoredDailySchema = z.object({
  version: z.number(),
  challengeId: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  completedAt: z.string().nullable(),
  resultId: z.string().nullable(),
});

/**
 * Schema for a single race history entry.
 */
export const RaceHistoryEntrySchema = z.object({
  challengeId: z.string(),
  playedAt: z.string(),
  finishTime: z.number(),
  grade: z.enum(["S", "A", "B", "C", "D", "F"]),
  headline: z.string(),
  score: z.number(),
  outcome: z
    .enum(["gold", "silver", "bronze", "finish", "dnf", "dns"])
    .optional()
    .default("finish"),
});

/**
 * Schema for the full race history array.
 */
export const StoredHistorySchema = z.object({
  version: z.number(),
  entries: z.array(RaceHistoryEntrySchema),
});

/**
 * Schema for stored daily board status.
 */
export const StoredDailyBoardSchema = z.object({
  version: z.number(),
  boardId: z.string(),
  entriesRemaining: z.number(),
  selectedEntryId: z.string().nullable(),
  completedEntryId: z.string().nullable(),
});
