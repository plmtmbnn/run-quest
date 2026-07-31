# TASK-001: Fix XP Progression System Reset Bug

## Priority: HIGH
## Sprint: 41
## Estimated Effort: 3-4 hours

---

## Problem Statement

The XP and level progression system is resetting to 0 when players perform rest actions (Rest 1 Day, Rest 1 Week). The XP should **never reset** and should only increase through various game activities. Currently, XP is only awarded during training activities, which is too limited.

### Current Issues:
1. **XP Resets to 0**: When resting (1 day or 1 week), the level and XP progress display shows 0
2. **Limited XP Sources**: XP is only awarded from training activities (20 XP per session)
3. **Missing XP Activities**: No XP for getting jobs, registering for races, completing races, or other meaningful activities
4. **Unbalanced Rewards**: All XP rewards are flat, not proportional to effort/achievement

---

## Root Cause Analysis

### Files Affected:
- `src/runner/progression-engine.ts` - XP calculation logic (appears correct)
- `src/training/training-engine.ts` - Awards 20 XP for training
- `src/features/profile/profile-screen.tsx` - Displays XP/level
- `src/store/timeline-store.ts` - Handles rest actions and day advancement
- `src/engine/timeline/actions.ts` - Timeline action definitions

### Suspected Root Causes:
1. **State Overwrite Issue**: Rest actions or timeline fast-forward may be overwriting runner state without preserving XP/level
2. **Store Sync Issue**: `timeline-store.ts:updateHealthForDaysAdvanced()` doesn't preserve runner XP when advancing days
3. **Persistence Gap**: Runner state may not be properly loaded/saved during rest actions
4. **Missing XP Integration**: No XP reward hooks in race completion, job changes, or race registration flows

---

## Proposed XP Reward Structure

Based on **effort proportionality**, XP rewards should follow this hierarchy:

### 1. **Training Activities** (Base: 15-30 XP)
- Easy Run: 15 XP
- Tempo Run: 25 XP
- Long Run: 30 XP
- Interval Training: 28 XP
- Hill Repeats: 28 XP
- Strength Training: 20 XP
- Recovery/Rest: 5 XP (for consistency)

### 2. **Race Registration** (10-50 XP based on tier)
- Local: 10 XP
- Regional: 15 XP
- State: 25 XP
- National: 40 XP
- International: 50 XP

### 3. **Race Completion** (50-500 XP based on placement and tier)
**Formula**: `Base XP × Tier Multiplier × Placement Multiplier`

**Base XP by Distance**:
- 5K: 50 XP
- 10K: 80 XP
- Half Marathon: 120 XP
- Marathon: 200 XP
- Ultra (50K+): 300 XP

**Tier Multipliers** (already in `progression-engine.ts`):
- Local: 1.0×
- Regional: 1.2×
- State: 1.5×
- National: 2.0×
- International: 3.0×

**Placement Multipliers**:
- 1st place: 2.5×
- 2nd-3rd: 2.0×
- Top 10: 1.5×
- Top 25%: 1.2×
- Top 50%: 1.0×
- Finished: 0.8×
- DNF: 0.3× (participation XP)

**Championship Bonus**: +50% XP

### 4. **Job Activities** (5-15 XP)
- Get a Job: 20 XP (one-time per job)
- Work Day: 5 XP (small reward for consistency)
- Job Change: 15 XP (switching jobs)

### 5. **Milestone Activities** (bonus XP)
- First race completion: +50 XP (one-time)
- Breaking personal record: +30 XP
- Winning first race: +100 XP (one-time)
- Completing training week: +10 XP

---

## Implementation Plan

### Phase 1: Diagnose and Fix XP Reset Bug (Priority)

#### Step 1.1: Add XP Preservation Logging
**File**: `src/store/timeline-store.ts`

```typescript
// In doAction() method, before timeline advancement
console.log('📊 [XP-DEBUG] Before action:', {
  actionId,
  runnerXP: loadRunnerState().profile.xp,
  runnerLevel: loadRunnerState().profile.level,
  dayIndex: gameState.dayIndex
});

// After timeline advancement
console.log('📊 [XP-DEBUG] After action:', {
  actionId,
  runnerXP: loadRunnerState().profile.xp,
  runnerLevel: loadRunnerState().profile.level,
  dayIndex: next.dayIndex
});
```

#### Step 1.2: Ensure XP Preservation in Fast-Forward
**File**: `src/store/timeline-store.ts`

In the `ff()` method around line 200, ensure runner state is loaded before and preserved after:

```typescript
ff(mode: FastForwardMode) {
  const { gameState } = get();
  if (!gameState) return;
  
  // ✅ PRESERVE runner state before fast-forward
  const runnerStateBefore = loadRunnerState();
  console.log('🚀 [FF-DEBUG] Runner state before FF:', {
    xp: runnerStateBefore.profile.xp,
    level: runnerStateBefore.profile.level
  });
  
  const [next, events] = fastForward(gameState, mode, ...) // existing code
  
  // ✅ VERIFY runner state after fast-forward
  const runnerStateAfter = loadRunnerState();
  console.log('🚀 [FF-DEBUG] Runner state after FF:', {
    xp: runnerStateAfter.profile.xp,
    level: runnerStateAfter.profile.level
  });
  
  // If XP was lost, restore it
  if (runnerStateAfter.profile.xp < runnerStateBefore.profile.xp) {
    console.error('⚠️ XP was lost during fast-forward! Restoring...');
    saveRunnerState({
      ...runnerStateAfter,
      profile: {
        ...runnerStateAfter.profile,
        xp: runnerStateBefore.profile.xp,
        level: runnerStateBefore.profile.level,
        skillPoints: runnerStateBefore.profile.skillPoints
      }
    });
  }
}
```

#### Step 1.3: Check Rest Action Implementation
**File**: `src/engine/timeline/actions.ts`

Verify that rest actions don't mutate runner profile. If they do, ensure XP/level are preserved.

### Phase 2: Expand XP Sources

#### Step 2.1: Add XP for Training Activities
**File**: `src/training/training-engine.ts`

Update `recordTrainingActivity()` at line 54:

```typescript
// Replace fixed 20 XP with proportional rewards
const XP_BY_ACTIVITY: Record<DailyActivity, number> = {
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
};

const xpGained = XP_BY_ACTIVITY[activity] || 15;
```

#### Step 2.2: Add XP for Race Registration
**File**: Create `src/runner/xp-rewards.ts`

```typescript
/**
 * Centralized XP reward calculation for all game activities
 */
import { awardXP, applyXPReward } from './progression-engine';
import { loadRunnerState, saveRunnerState } from './runner-persistence';

export function awardRegistrationXP(tier: string): void {
  const tierXP: Record<string, number> = {
    local: 10,
    regional: 15,
    state: 25,
    national: 40,
    international: 50,
  };
  
  const xp = tierXP[tier] || 10;
  const currentProfile = loadRunnerState();
  const updatedProfile = applyXPReward(currentProfile, xp);
  saveRunnerState(updatedProfile);
  
  console.log(`🎯 Awarded ${xp} XP for registering for ${tier} race`);
}

export function awardJobXP(action: 'get_job' | 'work' | 'change_job'): void {
  const xpMap = {
    get_job: 20,
    work: 5,
    change_job: 15,
  };
  
  const xp = xpMap[action];
  const currentProfile = loadRunnerState();
  const updatedProfile = applyXPReward(currentProfile, xp);
  saveRunnerState(updatedProfile);
  
  console.log(`💼 Awarded ${xp} XP for ${action}`);
}
```

#### Step 2.3: Integrate Race Completion XP
**File**: `src/features/race/race-screen.tsx`

In the race completion handler (around line 400-500), add:

```typescript
import { calculateRaceXP } from '@/runner/progression-engine';
import { applyXPReward } from '@/runner/progression-engine';

// After race finishes
const raceXP = calculateRaceXP(
  placement,
  totalEntrants,
  raceDistance,
  raceTier,
  isChampionship
);

const currentRunner = loadRunnerState();
const updatedRunner = applyXPReward(currentRunner, raceXP);
saveRunnerState(updatedRunner);

console.log(`🏆 Race completed! Awarded ${raceXP} XP (Placement: ${placement}/${totalEntrants})`);
```

#### Step 2.4: Integrate Registration XP
**File**: `src/features/scheduling/race-calendar.tsx` or race entry handler

```typescript
import { awardRegistrationXP } from '@/runner/xp-rewards';

// When player confirms race registration
function handleRaceRegistration(race: RaceOccurrence) {
  // ... existing registration logic
  
  // Award XP for registration
  awardRegistrationXP(race.tier);
}
```

#### Step 2.5: Integrate Work XP
**File**: `src/features/work/work-screen.tsx` (or wherever work is handled)

```typescript
import { awardJobXP } from '@/runner/xp-rewards';

// When player works
function handleWork() {
  // ... existing work logic
  awardJobXP('work');
}

// When player gets/changes job
function handleJobChange() {
  // ... existing job logic
  awardJobXP('change_job');
}
```

### Phase 3: Testing & Validation

#### Test Cases:
1. ✅ Train → XP increases
2. ✅ Rest 1 day → XP preserved
3. ✅ Rest 1 week → XP preserved
4. ✅ Register for race → XP increases
5. ✅ Complete race (1st place) → Large XP gain
6. ✅ Complete race (DNF) → Small XP gain
7. ✅ Get job → XP increases
8. ✅ Work → Small XP gain
9. ✅ Level up → Skill points awarded
10. ✅ Multiple activities → XP cumulative

---

## Files to Modify

### Must Edit:
1. `src/store/timeline-store.ts` - Fix XP preservation in rest/fast-forward
2. `src/training/training-engine.ts` - Update training XP rewards
3. `src/runner/xp-rewards.ts` - **NEW FILE** - Centralized XP reward system
4. `src/features/race/race-screen.tsx` - Add race completion XP
5. `src/scheduling/race-calendar-engine.ts` - Add registration XP hook

### May Need to Check:
6. `src/engine/timeline/actions.ts` - Verify rest actions don't mutate runner
7. `src/features/work/work-screen.tsx` - Add work XP (if applicable)
8. `src/features/profile/profile-screen.tsx` - Verify XP display logic

---

## Expected Outcomes

### Before Fix:
- Rest 1 day → Level/XP shows 0
- Only training gives XP
- XP progression feels slow and unrewarding

### After Fix:
- Rest 1 day → Level/XP preserved
- Multiple activities reward XP proportionally
- Race wins give significant XP boost
- Progression feels balanced and rewarding
- Players see XP gain after most meaningful activities

---

## Success Criteria

- [ ] XP never resets to 0 under any action
- [ ] Training activities award proportional XP (15-30 range)
- [ ] Race registration awards XP based on tier (10-50)
- [ ] Race completion awards XP based on placement and tier (50-1500+)
- [ ] Job activities award XP (5-20)
- [ ] XP gains are logged to console for verification
- [ ] Level-up triggers correctly when XP threshold is reached
- [ ] Skill points are awarded on level-up
- [ ] Profile screen displays correct XP/level at all times

---

## Notes

- The `progression-engine.ts` formulas appear correct; the bug is likely in state management
- All XP rewards should go through `applyXPReward()` to ensure consistency
- Consider adding XP gain notifications to the UI (toast/popup)
- Future: Add XP history tracking for player analytics
