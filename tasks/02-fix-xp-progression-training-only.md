# Task: Fix XP Progression - Training Only, No Race Reset

## Issue
Currently, XP progress in `home-screen.tsx` increases during training but **resets to 0 when the player finishes a race**. This is incorrect behavior - XP and level should be persistent progression metrics that never decrease.

## Current Behavior
- XP increases when doing daily training in `training-screen.tsx`
- XP (and possibly level) resets to 0 after completing a race
- This makes progression feel punishing and demotivating
- Level might also be resetting, which breaks the entire progression system

## Expected Behavior
- **XP should ONLY increase, never decrease or reset**
- XP should increase from:
  - Completing daily training workouts
  - Finishing races (based on performance/placement)
  - Completing quests/achievements
- Level should increase when XP threshold is reached
- Level should NEVER decrease
- XP progress bar should show steady progression toward next level

## Root Cause Analysis

### Likely Issues
1. **Race completion handler** is resetting runner profile stats
2. **Profile state management** is not properly preserving XP/level
3. **Quest system** might be overwriting profile instead of merging updates

### Files to Investigate

#### Primary Suspects
1. **`src/features/race/race-screen.tsx`** or race completion handler
   - Look for profile reset/overwrite logic after race
   - Check if it's creating a new profile object without preserving XP

2. **`src/runner/runner-store.ts`**
   - Verify state updates merge correctly
   - Ensure XP/level are preserved in all profile updates

3. **`src/features/home/home-screen.tsx`** (lines 135-176)
   - Quest claiming logic correctly increments XP
   - Verify this pattern is consistent everywhere

#### Supporting Files
4. **`src/features/training/training-screen.tsx`** (lines 120-160)
   - Training correctly increases XP (this part works)
   - Use this as reference for correct XP increment pattern

5. **`src/runner/runner-persistence.ts`**
   - Ensure load/save operations preserve XP/level
   - Check for any data migration that might reset values

6. **`src/engine/race/race-completion-engine.ts`** (if exists)
   - Race rewards and stat updates
   - Must preserve existing XP and add race completion XP

## Implementation Plan

### Step 1: Audit All Profile Update Locations
Search codebase for:
- `setRunnerState`
- `profile.xp`
- `profile.level`
- Race completion handlers
- Quest completion handlers

### Step 2: Fix Race Completion Handler
```typescript
// WRONG - Overwrites profile
const updatedProfile = {
  displayName: profile.displayName,
  level: 1, // ❌ RESETS LEVEL
  xp: 0,    // ❌ RESETS XP
  // ... other fields
};

// CORRECT - Preserves and increments
const raceXpReward = calculateRaceXP(placement, difficulty);
const updatedProfile = {
  ...profile, // ✅ Preserve all existing fields
  xp: (profile.xp || 0) + raceXpReward, // ✅ Add to existing
  level: profile.level || 1, // ✅ Keep current level
  rankPoints: (profile.rankPoints || 0) + rpGained,
  // ... only update fields that should change
};

// Check for level up
let { xp, level, skillPoints } = updatedProfile;
let xpNeeded = level * 100;
while (xp >= xpNeeded) {
  xp -= xpNeeded;
  level += 1;
  skillPoints = (skillPoints || 0) + 3;
  xpNeeded = level * 100;
}

const finalProfile = { ...updatedProfile, xp, level, skillPoints };
```

### Step 3: Create Helper Function for XP/Level System
```typescript
// src/runner/progression-engine.ts
export interface LevelUpResult {
  xp: number;
  level: number;
  skillPoints: number;
  leveledUp: boolean;
  levelsGained: number;
}

/**
 * Award XP and handle level ups
 * @param currentProfile - Current runner profile
 * @param xpGained - Amount of XP to add
 * @returns Updated XP, level, and skill points with level up status
 */
export function awardXP(
  currentProfile: RunnerProfile,
  xpGained: number
): LevelUpResult {
  let xp = (currentProfile.xp || 0) + xpGained;
  let level = currentProfile.level || 1;
  let skillPoints = currentProfile.skillPoints || 0;
  let levelsGained = 0;
  
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
 * Calculate XP reward based on race performance
 */
export function calculateRaceXP(
  placement: number,
  totalEntrants: number,
  tier: RaceTier,
  isChampionship: boolean
): number {
  const baseXP = 50;
  const tierMultiplier = {
    local: 1.0,
    regional: 1.2,
    state: 1.5,
    national: 2.0,
    international: 3.0,
  }[tier];
  
  const championshipBonus = isChampionship ? 1.5 : 1.0;
  
  // Placement bonus: 1st = 100%, 2nd = 80%, 3rd = 60%, etc.
  const placementPercentile = 1 - ((placement - 1) / totalEntrants);
  const placementMultiplier = Math.max(0.2, placementPercentile);
  
  return Math.round(
    baseXP * tierMultiplier * championshipBonus * placementMultiplier
  );
}
```

### Step 4: Update All XP Award Locations
1. **Training Completion** (`training-screen.tsx` line ~151)
   - Already working correctly, but migrate to use `awardXP` helper

2. **Race Completion** (race result handler)
   - Use `awardXP` helper
   - Display XP gained in race results screen

3. **Quest Completion** (`home-screen.tsx` lines 135-176)
   - Already mostly correct, but use `awardXP` helper for consistency

### Step 5: Add XP Gain Feedback
- Show "+XX XP" toast/notification when XP is gained
- Display level up celebration modal
- Show XP breakdown in race results screen
- Add XP progress indicator during activities

## Validation Criteria

### Critical Tests
- [ ] Complete a training session → XP increases
- [ ] Complete a race → XP increases further (not reset)
- [ ] Complete another training → XP continues from previous total
- [ ] Level up during training → Level increases, XP carries over
- [ ] Level up during race → Level increases, XP carries over
- [ ] Restart game → XP and level persist from storage
- [ ] Complete quest → XP increases correctly

### Edge Cases
- [ ] Multiple level ups in one activity (gain 350 XP at level 1)
- [ ] XP gain when exactly at level threshold
- [ ] Level 99+ progression (ensure no overflow issues)
- [ ] Profile merge when multiple updates happen quickly

## Debug Checklist

### To find the reset bug:
1. Add console logs before/after race completion:
   ```typescript
   console.log('Pre-race profile:', { xp: profile.xp, level: profile.level });
   // ... race completion logic ...
   console.log('Post-race profile:', { xp: updatedProfile.xp, level: updatedProfile.level });
   ```

2. Check browser localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('runquest.runner'))
   ```

3. Monitor `setRunnerState` calls during race flow

4. Verify profile persistence after each major state change

## Technical Notes

### State Management Pattern
Always use spread operator to preserve existing profile fields:
```typescript
// ✅ CORRECT
setRunnerState({
  ...runnerState,
  profile: {
    ...profile,
    xp: newXp,
    level: newLevel,
  },
  lastUpdated: new Date().toISOString(),
});

// ❌ WRONG - loses other profile fields
setRunnerState({
  profile: {
    xp: newXp,
    level: newLevel,
  },
  lastUpdated: new Date().toISOString(),
});
```

### XP Formula Reference
- **Training**: 20-40 XP (based on workout difficulty)
- **Race**: 20-150 XP (based on placement, tier, championship status)
- **Quest**: 50 XP (current standard)
- **Level Up Threshold**: `level * 100` XP required

### Skill Points
- Gained at level up: +3 SP per level
- Should accumulate and never reset
- Must persist through all state changes

## Priority
**CRITICAL** - This breaks core player progression and creates negative player experience

## Estimated Complexity
**Medium** - Need to audit multiple locations but fix pattern is clear

## Related Tasks
- Add level up celebration/modal
- Add XP gain feedback (toasts/animations)
- Create progression analytics dashboard
- Add XP gain preview in activity selection
