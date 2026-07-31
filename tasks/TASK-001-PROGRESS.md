## XP System Implementation - Summary & Next Steps

### ✅ Completed (Phase 1-4)

1. **Created Centralized XP Reward System** (`src/runner/xp-rewards.ts`)
   - All XP rewards now go through a single, safe module
   - Prevents XP loss and ensures consistency
   - Logging for debugging

2. **Fixed XP Preservation in Timeline**
   - Added XP preservation checks in `timeline-store.ts`
   - Both `doAction()` and `ff()` now verify and restore XP if lost
   - Console logging tracks XP changes during rest actions

3. **Updated Training XP Rewards**
   - Changed from flat 20 XP to proportional rewards (5-30 XP)
   - Easy runs: 15 XP, Long runs: 30 XP, Rest: 5 XP, etc.
   - Integrated in `training-engine.ts`

4. **Added Work XP Rewards**
   - Work action: 5 XP per work session
   - Integrated in `actions.ts`

5. **Added Race Registration XP Rewards**
   - Local: 10 XP, Regional: 15 XP, State: 25 XP, National: 40 XP, International: 50 XP
   - Integrated in `home-screen.tsx`

### 🔄 Remaining: Race Completion XP

**Where to Add**: Race completion XP needs to be awarded when the race finishes and placement is calculated.

**Files to check**:
- `src/features/race/race-screen.tsx` - Where `simResult` is finalized
- `src/engine/simulation/engine.ts` - Where placement is calculated
- Result screen or post-race processing

**To integrate**:
```typescript
import { awardRaceCompletionXP } from "@/runner/xp-rewards";

// After race completes and placement is known
const placement = /* calculate from simResult */;
const totalEntrants = challenge.totalEntrants || 100;
const distance = challenge.race.distance;
const tier = challenge.race.tier;
const isChampionship = challenge.isChampionship || false;

awardRaceCompletionXP(placement, totalEntrants, distance, tier, isChampionship);
```

### 📋 Modified Files

1. ✅ `src/runner/xp-rewards.ts` - NEW FILE
2. ✅ `src/store/timeline-store.ts` - Added XP preservation
3. ✅ `src/training/training-engine.ts` - Proportional XP
4. ✅ `src/engine/timeline/actions.ts` - Work XP
5. ✅ `src/features/home/home-screen.tsx` - Registration XP
6. ⏳ Race completion XP - **TODO: Find placement calculation location**

---

## Testing Checklist

Once race completion XP is added, test:

- [ ] Train → XP increases
- [ ] Rest 1 day → XP preserved (not reset to 0)
- [ ] Rest 1 week → XP preserved
- [ ] Work → +5 XP
- [ ] Register for race → +10-50 XP (tier-based)
- [ ] Complete race (1st place) → Large XP gain
- [ ] Complete race (DNF) → Small XP gain
- [ ] Level up triggers correctly
- [ ] Check console for XP debug logs

---

## Notes

- The XP reset bug was NOT caused by a code error resetting XP to 0
- It was caused by the timeline operations not preserving runner state
- Now both `doAction()` and `ff()` have safety checks to restore XP if lost
- All XP awards are logged to console for verification
