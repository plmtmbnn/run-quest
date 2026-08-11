/**
 * XP Tracker - Centralized XP management to prevent race conditions
 *
 * This module provides a transactional approach to XP awards to ensure
 * XP is never lost due to race conditions between different systems.
 */

import {
  applyXPReward,
  awardXP,
  type LevelUpResult,
} from "./progression-engine";
import { loadRunnerState, saveRunnerState } from "./runner-persistence";
import type { RunnerProfile, RunnerState } from "./runner-types";

// Track pending XP awards to prevent race conditions
let pendingXPAwards: Array<{ xp: number; source: string; timestamp: number }> =
  [];
let isProcessingXP = false;

/**
 * Safely award XP with transaction-like semantics
 *
 * This ensures XP awards are processed sequentially and never lost
 * due to race conditions between different game systems.
 */
export function safelyAwardXP(amount: number, source: string): LevelUpResult {
  if (amount <= 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `⚠️ Attempted to award non-positive XP: ${amount} from ${source}`,
      );
    }
    return {
      xp: 0,
      level: 1,
      skillPoints: 0,
      leveledUp: false,
      levelsGained: 0,
    };
  }

  // Add to pending queue
  pendingXPAwards.push({
    xp: amount,
    source,
    timestamp: Date.now(),
  });

  // Process queue if not already processing
  if (!isProcessingXP) {
    processXPQueue();
  }

  // Return the result after processing
  const currentState = loadRunnerState();
  return {
    xp: currentState.profile.xp || 0,
    level: currentState.profile.level || 1,
    skillPoints: currentState.profile.skillPoints || 0,
    leveledUp: false,
    levelsGained: 0,
  };
}

/**
 * Process the XP queue sequentially
 */
async function processXPQueue(): Promise<void> {
  if (isProcessingXP) return;

  isProcessingXP = true;

  try {
    while (pendingXPAwards.length > 0) {
      const award = pendingXPAwards.shift()!;

      // Load current state
      const currentState = loadRunnerState();
      const currentProfile = currentState.profile;

      // Apply XP award
      const result = awardXP(currentProfile, award.xp);

      // Update profile
      const updatedProfile: RunnerProfile = {
        ...currentProfile,
        xp: result.xp,
        level: result.level,
        skillPoints: result.skillPoints,
      };

      // Save updated state
      const updatedState: RunnerState = {
        ...currentState,
        profile: updatedProfile,
        lastUpdated: new Date().toISOString(),
      };

      saveRunnerState(updatedState);

      if (process.env.NODE_ENV !== "production") {
        console.log(
          `✅ XP Awarded: +${award.xp} from ${award.source} | Total: ${result.xp}, Level: ${result.level}`,
        );
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ XP Queue Processing Error:", error);
    }
  } finally {
    isProcessingXP = false;
  }
}

/**
 * Get current XP state for debugging
 */
export function getXPState(): {
  xp: number;
  level: number;
  skillPoints: number;
  pending: number;
} {
  const currentState = loadRunnerState();
  return {
    xp: currentState.profile.xp || 0,
    level: currentState.profile.level || 1,
    skillPoints: currentState.profile.skillPoints || 0,
    pending: pendingXPAwards.length,
  };
}

/**
 * Reset XP tracker (for testing or new game)
 */
export function resetXPTracker(): void {
  pendingXPAwards = [];
  isProcessingXP = false;
}

/**
 * Force flush any pending XP awards
 */
export async function flushXPAwards(): Promise<void> {
  await processXPQueue();
}

// Export for testing
export { pendingXPAwards, isProcessingXP };
