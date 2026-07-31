/**
 * Centralized XP Reward System
 * 
 * All XP rewards must go through this module to ensure:
 * 1. XP never decreases or resets
 * 2. Consistent reward calculations
 * 3. Proper state persistence
 * 4. Event dispatching for UI updates
 */

import { awardXP, applyXPReward } from './progression-engine';
import { loadRunnerState, saveRunnerState } from './runner-persistence';
import type { RunnerState } from './runner-types';

/**
 * XP rewards by training activity type
 */
export const XP_BY_TRAINING_ACTIVITY = {
  rest: 5,
  recovery_run: 10,
  easy_run: 15,
  tempo_run: 25,
  long_run: 30,
  interval_training: 28,
  hill_repeats: 28,
  fartlek: 24,
  race_pace: 26,
  strength_training: 20,
  cross_training: 18,
} as const;

/**
 * XP rewards by race tier for registration
 */
export const XP_BY_RACE_TIER_REGISTRATION = {
  local: 10,
  regional: 15,
  state: 25,
  national: 40,
  international: 50,
} as const;

/**
 * XP rewards for job activities
 */
export const XP_BY_JOB_ACTIVITY = {
  get_job: 20,      // Getting a new job
  work: 5,          // Working for a day
  change_job: 15,   // Switching jobs
} as const;

/**
 * Award XP for training activity
 */
export function awardTrainingXP(activity: keyof typeof XP_BY_TRAINING_ACTIVITY): number {
  const xp = XP_BY_TRAINING_ACTIVITY[activity] || 15;
  const currentState = loadRunnerState();
  const updatedProfile = applyXPReward(currentState.profile, xp);
  const updatedState = { ...currentState, profile: updatedProfile, lastUpdated: new Date().toISOString() };
  saveRunnerState(updatedState);
  
  console.log(`🏃 Training XP: +${xp} for ${activity} (Total: ${updatedState.profile.xp}, Level: ${updatedState.profile.level})`);
  return xp;
}

/**
 * Award XP for race registration
 */
export function awardRegistrationXP(tier: keyof typeof XP_BY_RACE_TIER_REGISTRATION): number {
  const xp = XP_BY_RACE_TIER_REGISTRATION[tier] || 10;
  const currentState = loadRunnerState();
  const updatedProfile = applyXPReward(currentState.profile, xp);
  const updatedState = { ...currentState, profile: updatedProfile, lastUpdated: new Date().toISOString() };
  saveRunnerState(updatedState);
  
  console.log(`📝 Registration XP: +${xp} for ${tier} race (Total: ${updatedState.profile.xp}, Level: ${updatedState.profile.level})`);
  return xp;
}

/**
 * Award XP for job activities
 */
export function awardJobXP(action: keyof typeof XP_BY_JOB_ACTIVITY): number {
  const xp = XP_BY_JOB_ACTIVITY[action];
  const currentState = loadRunnerState();
  const updatedProfile = applyXPReward(currentState.profile, xp);
  const updatedState = { ...currentState, profile: updatedProfile, lastUpdated: new Date().toISOString() };
  saveRunnerState(updatedState);
  
  console.log(`💼 Job XP: +${xp} for ${action} (Total: ${updatedState.profile.xp}, Level: ${updatedState.profile.level})`);
  return xp;
}

/**
 * Calculate player placement from simulation state
 * Compares player's finish time with AI opponents
 */
export function calculatePlacementFromState(
  playerFinishTime: number,
  opponents: Array<{ accumulatedTime: number; isDNF: boolean }> | undefined
): number {
  if (!opponents || opponents.length === 0) {
    return 1; // Solo race, player wins by default
  }

  // Count how many opponents finished faster than the player
  let fasterOpponents = 0;
  for (const opp of opponents) {
    if (opp.isDNF) continue; // DNF opponents don't count
    if (opp.accumulatedTime < playerFinishTime) {
      fasterOpponents++;
    }
  }

  // Player's placement is number of faster opponents + 1
  return fasterOpponents + 1;
}

/**
 * Award XP for race completion (uses existing progression-engine calculation)
 */
export function awardRaceCompletionXP(
  placement: number,
  totalEntrants: number,
  distance: number,
  tier: "local" | "regional" | "state" | "national" | "international",
  isChampionship: boolean = false
): number {
  // Use the existing calculation from progression-engine
  const { calculateRaceXP } = require('./progression-engine');
  const xp = calculateRaceXP(placement, totalEntrants, distance, tier, isChampionship);
  
  const currentState = loadRunnerState();
  const updatedProfile = applyXPReward(currentState.profile, xp);
  const updatedState = { ...currentState, profile: updatedProfile, lastUpdated: new Date().toISOString() };
  saveRunnerState(updatedState);
  
  console.log(`🏆 Race Completion XP: +${xp} (Placement: ${placement}/${totalEntrants}, Total: ${updatedState.profile.xp}, Level: ${updatedState.profile.level})`);
  return xp;
}

/**
 * Award race completion XP from simulation result
 * Convenience wrapper that calculates placement automatically
 */
export function awardRaceCompletionXPFromSimulation(
  simResult: { finishTime: number; stateLog: Array<{ opponents?: Array<{ accumulatedTime: number; isDNF: boolean }> }> },
  totalEntrants: number,
  distance: number,
  tier: "local" | "regional" | "state" | "national" | "international",
  isChampionship: boolean = false
): number {
  // Get final state with opponent data
  const finalState = simResult.stateLog[simResult.stateLog.length - 1];
  const placement = calculatePlacementFromState(simResult.finishTime, finalState?.opponents);
  
  return awardRaceCompletionXP(placement, totalEntrants, distance, tier, isChampionship);
}

/**
 * Award bonus XP for milestones or achievements
 */
export function awardBonusXP(amount: number, reason: string): number {
  if (amount < 0) {
    console.warn('⚠️ Attempted to award negative bonus XP:', amount);
    return 0;
  }
  
  const currentState = loadRunnerState();
  const updatedProfile = applyXPReward(currentState.profile, amount);
  const updatedState = { ...currentState, profile: updatedProfile, lastUpdated: new Date().toISOString() };
  saveRunnerState(updatedState);
  
  console.log(`⭐ Bonus XP: +${amount} for ${reason} (Total: ${updatedState.profile.xp}, Level: ${updatedState.profile.level})`);
  return amount;
}

/**
 * Safely ensure runner XP is preserved (utility for debugging)
 */
export function ensureXPPreserved(beforeState: RunnerState, afterState: RunnerState): RunnerState {
  if (afterState.profile.xp < beforeState.profile.xp) {
    console.error('⚠️ XP LOSS DETECTED! Restoring previous values.');
    console.error('Before:', beforeState.profile.xp, beforeState.profile.level);
    console.error('After:', afterState.profile.xp, afterState.profile.level);
    
    return {
      ...afterState,
      profile: {
        ...afterState.profile,
        xp: beforeState.profile.xp,
        level: beforeState.profile.level,
        skillPoints: beforeState.profile.skillPoints,
      },
    };
  }
  return afterState;
}

/**
 * Debug: Log current XP state
 */
export function logXPState(context: string): void {
  const currentState = loadRunnerState();
  console.log(`📊 [XP-DEBUG] ${context}:`, {
    xp: currentState.profile.xp,
    level: currentState.profile.level,
    skillPoints: currentState.profile.skillPoints,
  });
}
