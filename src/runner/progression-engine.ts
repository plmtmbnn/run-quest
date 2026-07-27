/**
 * XP Progression Engine
 * 
 * Centralized XP and leveling system to ensure XP never resets
 */

import type { RunnerProfile } from "./runner-types";

export interface LevelUpResult {
  xp: number;
  level: number;
  skillPoints: number;
  leveledUp: boolean;
  levelsGained: number;
}

/**
 * Award XP and handle level ups
 * XP should ONLY increase, never decrease or reset
 * 
 * @param currentProfile - Current runner profile
 * @param xpGained - Amount of XP to add (must be >= 0)
 * @returns Updated XP, level, and skill points with level up status
 */
export function awardXP(
  currentProfile: RunnerProfile,
  xpGained: number
): LevelUpResult {
  if (xpGained < 0) {
    console.warn('⚠️ Attempted to award negative XP:', xpGained);
    xpGained = 0;
  }

  // Start with current values, ensuring they exist
  let xp = (currentProfile.xp || 0) + xpGained;
  let level = currentProfile.level || 1;
  let skillPoints = currentProfile.skillPoints || 0;
  let levelsGained = 0;
  
  // Level up loop
  let xpNeeded = level * 100;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    skillPoints += 3;
    levelsGained += 1;
    xpNeeded = level * 100;
  }
  
  return {
    xp,
    level,
    skillPoints,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

/**
 * Calculate XP reward for race completion
 * 
 * @param placement - Player's finishing position (1 = 1st place)
 * @param totalEntrants - Total number of racers
 * @param distance - Race distance in km
 * @param tier - Race tier
 * @param isChampionship - Whether this is a championship race
 * @returns XP amount to award
 */
export function calculateRaceXP(
  placement: number,
  totalEntrants: number,
  distance: number,
  tier: "local" | "regional" | "state" | "national" | "international",
  isChampionship: boolean = false
): number {
  // Base XP scales with distance
  const baseXP = Math.max(20, Math.floor(distance * 4));
  
  // Tier multipliers
  const tierMultiplier: Record<typeof tier, number> = {
    local: 1.0,
    regional: 1.2,
    state: 1.5,
    national: 2.0,
    international: 3.0,
  };
  
  const tierBonus = tierMultiplier[tier] || 1.0;
  
  // Championship bonus
  const championshipBonus = isChampionship ? 1.5 : 1.0;
  
  // Placement bonus: better placement = more XP
  // 1st place = 100%, 2nd = 80%, 3rd = 60%, then gradual decay
  const placementPercentile = 1 - ((placement - 1) / totalEntrants);
  const placementMultiplier = Math.max(0.2, placementPercentile);
  
  // Special bonuses for podium finishes
  const podiumBonus = placement === 1 ? 1.5 : placement === 2 ? 1.3 : placement === 3 ? 1.2 : 1.0;
  
  const totalXP = Math.round(
    baseXP * tierBonus * championshipBonus * placementMultiplier * podiumBonus
  );
  
  return Math.max(10, totalXP); // Minimum 10 XP for completing any race
}

/**
 * Calculate XP reward for training completion
 * 
 * @param activityType - Type of training activity
 * @param distance - Distance trained in km
 * @param intensity - Intensity level (0-1)
 * @returns XP amount to award
 */
export function calculateTrainingXP(
  activityType: string,
  distance: number,
  intensity: number = 0.7
): number {
  // Base XP for training
  const baseXP = 15;
  
  // Distance bonus
  const distanceBonus = Math.floor(distance * 2);
  
  // Intensity bonus
  const intensityBonus = Math.floor(intensity * 10);
  
  // Activity type modifiers
  const activityMultiplier: Record<string, number> = {
    'Easy Run': 0.8,
    'Tempo Run': 1.2,
    'Interval Training': 1.5,
    'Long Run': 1.3,
    'Hill Repeats': 1.4,
    'Recovery Run': 0.6,
    'Rest Day': 0,
  };
  
  const typeMultiplier = activityMultiplier[activityType] || 1.0;
  
  const totalXP = Math.round(
    (baseXP + distanceBonus + intensityBonus) * typeMultiplier
  );
  
  return Math.max(5, totalXP); // Minimum 5 XP for any training
}

/**
 * Calculate XP needed for next level
 * 
 * @param currentLevel - Current level
 * @returns XP needed to reach next level
 */
export function getXPNeededForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

/**
 * Get XP progress as a percentage
 * 
 * @param currentXP - Current XP amount
 * @param currentLevel - Current level
 * @returns Percentage progress to next level (0-100)
 */
export function getXPProgress(currentXP: number, currentLevel: number): number {
  const xpNeeded = getXPNeededForNextLevel(currentLevel);
  return Math.min(100, Math.round((currentXP / xpNeeded) * 100));
}

/**
 * Apply XP reward to profile with proper merging
 * This is the SAFE way to update profile with XP
 * 
 * @param currentProfile - Current profile state
 * @param xpGained - XP to award
 * @returns Updated profile with new XP/level/skillPoints
 */
export function applyXPReward(
  currentProfile: RunnerProfile,
  xpGained: number
): RunnerProfile {
  const result = awardXP(currentProfile, xpGained);
  
  return {
    ...currentProfile, // ✅ PRESERVE all existing fields
    xp: result.xp,
    level: result.level,
    skillPoints: result.skillPoints,
  };
}
