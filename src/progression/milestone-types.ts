import type { RunnerProfile } from "@/runner/runner-types";
import type { LocalizedText } from "@/types/engine";

/**
 * Milestone categories
 */
export type MilestoneCategory =
  | "distance" // Total distance milestones
  | "speed" // Time-based achievements
  | "wins" // Victory milestones
  | "streak" // Consistency milestones
  | "level" // Progression milestones
  | "rivalry" // Rival-related achievements
  | "training" // Training achievements
  | "special"; // Unique accomplishments

/**
 * Represents a career milestone achievement
 */
export interface Milestone {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  category: MilestoneCategory;
  icon: string; // Emoji or icon identifier
  celebrationText: LocalizedText;
  trigger: (profile: RunnerProfile, context?: MilestoneContext) => boolean;
  rewards?: MilestoneRewards;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

/**
 * Context for milestone checking
 */
export interface MilestoneContext {
  raceDistance?: number;
  raceTime?: number;
  rivalDefeated?: string;
  isVictory?: boolean;
  isPerfectRace?: boolean;
}

/**
 * Rewards for achieving milestone
 */
export interface MilestoneRewards {
  xp?: number;
  coins?: number;
  unlocks?: string[];
}

/**
 * Achievement celebration data
 */
export interface MilestoneAchievement {
  milestone: Milestone;
  achievedAt: string; // ISO timestamp
  context?: MilestoneContext;
}
