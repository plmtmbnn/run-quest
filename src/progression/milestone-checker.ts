import type { RunnerProfile } from "@/runner/runner-types";
import { MILESTONES } from "./milestone-database";
import type {
  Milestone,
  MilestoneAchievement,
  MilestoneContext,
} from "./milestone-types";

/**
 * Check for newly achieved milestones
 * Returns milestones that were just achieved (not previously unlocked)
 */
export function checkForNewMilestones(
  profile: RunnerProfile,
  previouslyAchieved: string[],
  context?: MilestoneContext,
): MilestoneAchievement[] {
  const newAchievements: MilestoneAchievement[] = [];

  for (const milestone of MILESTONES) {
    // Skip if already achieved
    if (previouslyAchieved.includes(milestone.id)) {
      continue;
    }

    // Check if milestone condition is met
    try {
      if (milestone.trigger(profile, context)) {
        newAchievements.push({
          milestone,
          achievedAt: new Date().toISOString(),
          context,
        });
      }
    } catch (error) {
      console.error(`Error checking milestone ${milestone.id}:`, error);
    }
  }

  return newAchievements;
}

/**
 * Check for milestones after race completion
 */
export function checkRaceMilestones(
  profile: RunnerProfile,
  previouslyAchieved: string[],
  raceDistance: number,
  raceTime: number,
  isVictory: boolean,
  isPerfectRace: boolean,
  rivalDefeated?: string,
): MilestoneAchievement[] {
  const context: MilestoneContext = {
    raceDistance,
    raceTime,
    isVictory,
    isPerfectRace,
    rivalDefeated,
  };

  return checkForNewMilestones(profile, previouslyAchieved, context);
}

/**
 * Check for milestones after training
 */
export function checkTrainingMilestones(
  profile: RunnerProfile,
  previouslyAchieved: string[],
): MilestoneAchievement[] {
  return checkForNewMilestones(profile, previouslyAchieved);
}

/**
 * Check for general progression milestones (level, stats, etc.)
 */
export function checkProgressionMilestones(
  profile: RunnerProfile,
  previouslyAchieved: string[],
): MilestoneAchievement[] {
  return checkForNewMilestones(profile, previouslyAchieved);
}

/**
 * Apply milestone rewards to profile
 */
export function applyMilestoneRewards(
  profile: RunnerProfile,
  milestone: Milestone,
): RunnerProfile {
  if (!milestone.rewards) {
    return profile;
  }

  const updatedProfile = { ...profile };

  // Apply XP
  if (milestone.rewards.xp) {
    updatedProfile.xp = (updatedProfile.xp || 0) + milestone.rewards.xp;

    // Check for level up
    let xpNeeded = updatedProfile.level * 100;
    while (updatedProfile.xp >= xpNeeded) {
      updatedProfile.xp -= xpNeeded;
      updatedProfile.level += 1;
      updatedProfile.skillPoints = (updatedProfile.skillPoints || 0) + 3;
      xpNeeded = updatedProfile.level * 100;
    }
  }

  // Apply coins
  if (milestone.rewards.coins) {
    updatedProfile.coins =
      (updatedProfile.coins || 0) + milestone.rewards.coins;
  }

  return updatedProfile;
}

/**
 * Get achievement progress (0-1) for a specific milestone
 */
export function getMilestoneProgress(
  milestone: Milestone,
  profile: RunnerProfile,
): number {
  // This is a simple estimation - you could make it more sophisticated
  try {
    if (milestone.trigger(profile)) {
      return 1.0;
    }
    return 0.0;
  } catch {
    return 0.0;
  }
}
