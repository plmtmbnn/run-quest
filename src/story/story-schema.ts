import { z } from "zod/v4";

/**
 * Schema for championship result
 */
export const ChampionshipResultSchema = z.object({
  raceId: z.string(),
  won: z.boolean(),
  finishTime: z.number(),
  position: z.number(),
  attempts: z.number(),
  completedAt: z.string(),
  grade: z.string().optional(),
});

/**
 * Schema for story progress
 */
export const StoredStoryProgressSchema = z.object({
  version: z.number(),
  currentChapter: z.number(),
  completedChapters: z.array(z.number()),
  unlockedChapters: z.array(z.number()),
  viewedStoryBeats: z.array(z.string()),
  championshipAttempts: z.record(z.string(), z.number()),
  championshipResults: z.record(z.string(), ChampionshipResultSchema),
  chapterStartedAt: z.record(z.string(), z.string()),
  chapterCompletedAt: z.record(z.string(), z.string()),
  totalStoryRaces: z.number(),
  storyMilestones: z.array(z.string()),
});
