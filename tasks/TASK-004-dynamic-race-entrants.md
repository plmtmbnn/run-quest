# TASK-004: Make Race Entrants Dynamic

## Priority: LOW
## Sprint: 41
## Estimated Effort: 2-3 hours

---

## Problem Statement

In the race entry modal (`race-entry-modal.tsx`), the entrants display currently shows a static "1 / X" format, where it always displays "1" as the current number of registered entrants. This should be dynamic to reflect the actual number of runners registered for the race.

### Current Behavior:
```
Entrants: 1 / 150
```
Even when there should be multiple registered runners.

### Expected Behavior:
```
Entrants: 47 / 150  (Dynamic count)
```

The count should:
1. Increase as the race day approaches (simulated registrations)
2. Vary by race tier (International races fill faster)
3. Show realistic registration patterns (early bird + last-minute rushes)
4. Cap at the maximum field size

---

## Root Cause Analysis

**File**: `src/components/scheduling/race-entry-modal.tsx`

The entrants display is likely hardcoded or using a static value:
```typescript
// Current implementation (suspected)
<div>Entrants: 1 / {race.maxEntrants}</div>
```

### What's Missing:
1. **Dynamic Registration System**: No logic to simulate other runners registering
2. **Time-Based Progression**: Entrant count doesn't change as days advance
3. **Storage**: No persistence of entrant counts per race occurrence
4. **Race Tier Logic**: No difference between local vs international registration rates

---

## Design Specification

### Registration Model

#### A. Field Size by Tier
```typescript
const FIELD_SIZE_BY_TIER: Record<RaceTier, { min: number; max: number; typical: number }> = {
  local: { min: 20, max: 100, typical: 50 },
  regional: { min: 50, max: 300, typical: 150 },
  state: { min: 100, max: 500, typical: 250 },
  national: { min: 200, max: 1500, typical: 800 },
  international: { min: 500, max: 5000, typical: 2500 },
};
```

#### B. Registration Timeline Pattern
Race day = Day 0 (the race happens)

| Days Before Race | % of Final Field Registered |
|------------------|------------------------------|
| 30+ days         | 5-10% (early birds)          |
| 21-30 days       | 20-30%                       |
| 14-21 days       | 40-50%                       |
| 7-14 days        | 60-70%                       |
| 3-7 days         | 80-90%                       |
| 1-3 days         | 95-98% (last minute rush)    |
| Race day         | 100% (field full)            |

#### C. Registration Curve Formula
```typescript
function calculateEntrantsByDay(
  daysUntilRace: number,
  maxEntrants: number,
  tier: RaceTier
): number {
  if (daysUntilRace <= 0) return maxEntrants;
  
  // Sigmoid curve for realistic registration pattern
  const earlyBirdFactor = tier === "international" ? 0.15 : 0.05;
  const rushDayThreshold = tier === "international" ? 7 : 3;
  
  if (daysUntilRace > 30) {
    return Math.floor(maxEntrants * earlyBirdFactor);
  }
  
  // Accelerating curve as race approaches
  const t = 1 - (daysUntilRace / 30); // 0 to 1 as race approaches
  const fillRate = Math.pow(t, 1.5); // Exponential growth
  
  // Last-minute rush
  if (daysUntilRace <= rushDayThreshold) {
    const rushBonus = (rushDayThreshold - daysUntilRace) / rushDayThreshold * 0.15;
    return Math.floor(maxEntrants * Math.min(1, fillRate + rushBonus));
  }
  
  return Math.floor(maxEntrants * fillRate);
}
```

#### D. Entrant Count Variability
Add ±10% randomness to make each race feel unique:
```typescript
const variance = (Math.random() - 0.5) * 0.2; // ±10%
const finalCount = Math.floor(baseCount * (1 + variance));
```

---

## Implementation Plan

### Phase 1: Create Dynamic Entrants Engine

#### 1.1: Create Entrants Calculator
**File**: `src/scheduling/race-entrants-engine.ts` (NEW FILE)

```typescript
/**
 * Race Entrants Engine
 * Dynamically calculates registered runners for race occurrences
 */

import type { RaceOccurrence, RaceTier } from "./race-calendar-types";

interface FieldSizeConfig {
  min: number;
  max: number;
  typical: number;
}

const FIELD_SIZE_BY_TIER: Record<RaceTier, FieldSizeConfig> = {
  local: { min: 20, max: 100, typical: 50 },
  regional: { min: 50, max: 300, typical: 150 },
  state: { min: 100, max: 500, typical: 250 },
  national: { min: 200, max: 1500, typical: 800 },
  international: { min: 500, max: 5000, typical: 2500 },
};

/**
 * Calculate number of entrants for a race based on days until race
 * 
 * @param race - The race occurrence
 * @param currentDayIndex - Current game day
 * @param raceDayIndex - Day the race occurs
 * @returns Number of registered entrants
 */
export function calculateDynamicEntrants(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number
): number {
  const daysUntilRace = raceDayIndex - currentDayIndex;
  
  // Get max field size for this race
  const maxEntrants = getMaxEntrantsForRace(race);
  
  // If race has passed, return max
  if (daysUntilRace <= 0) return maxEntrants;
  
  // Calculate base entrants from timeline
  const baseEntrants = calculateBaseEntrantsByTimeline(
    daysUntilRace,
    maxEntrants,
    race.tier
  );
  
  // Add seeded variance for consistency
  const variance = getSeededVariance(race.id);
  const finalEntrants = Math.floor(baseEntrants * (1 + variance));
  
  // Always ensure at least 1 entrant (the player)
  return Math.max(1, Math.min(maxEntrants, finalEntrants));
}

/**
 * Get maximum field size for a race
 */
function getMaxEntrantsForRace(race: RaceOccurrence): number {
  const config = FIELD_SIZE_BY_TIER[race.tier];
  
  // Use category-specific entrants if available, otherwise typical
  if (race.categories && race.categories.length > 0) {
    const selectedCategory = race.categories.find(
      c => c.id === race.selectedCategoryId
    ) || race.categories[0];
    
    if (selectedCategory.entrants) {
      return selectedCategory.entrants;
    }
  }
  
  // Default to typical for tier
  return config.typical;
}

/**
 * Calculate entrants based on registration timeline curve
 */
function calculateBaseEntrantsByTimeline(
  daysUntilRace: number,
  maxEntrants: number,
  tier: RaceTier
): number {
  // Early bird period (30+ days out)
  if (daysUntilRace > 30) {
    const earlyBirdRate = tier === "international" ? 0.15 : 0.05;
    return Math.floor(maxEntrants * earlyBirdRate);
  }
  
  // Registration curve (0-30 days)
  const timeProgress = 1 - (daysUntilRace / 30); // 0 → 1 as race approaches
  const baseFillRate = Math.pow(timeProgress, 1.5); // Exponential curve
  
  // Last-minute rush (final 7 days for international, 3 days for others)
  const rushThreshold = tier === "international" ? 7 : 3;
  let fillRate = baseFillRate;
  
  if (daysUntilRace <= rushThreshold) {
    const rushProgress = (rushThreshold - daysUntilRace) / rushThreshold;
    const rushBonus = rushProgress * 0.15; // Up to +15% in final rush
    fillRate = Math.min(1, baseFillRate + rushBonus);
  }
  
  return Math.floor(maxEntrants * fillRate);
}

/**
 * Generate consistent variance for a race (±10%)
 * Uses race ID as seed for consistency across views
 */
function getSeededVariance(raceId: string): number {
  // Simple hash function for seeding
  let hash = 0;
  for (let i = 0; i < raceId.length; i++) {
    hash = ((hash << 5) - hash) + raceId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert hash to -0.1 to +0.1 range
  const normalized = (Math.abs(hash) % 1000) / 1000; // 0 to 1
  return (normalized - 0.5) * 0.2; // -0.1 to +0.1
}

/**
 * Get entrant count with "X registered" format
 * 
 * @param race - Race occurrence
 * @param currentDayIndex - Current game day
 * @param raceDayIndex - Race day
 * @returns Formatted string like "47 / 150"
 */
export function getEntrantsDisplay(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number
): string {
  const current = calculateDynamicEntrants(race, currentDayIndex, raceDayIndex);
  const max = getMaxEntrantsForRace(race);
  return `${current} / ${max}`;
}

/**
 * Check if a race is nearly full (>90% capacity)
 */
export function isRaceNearlyFull(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number
): boolean {
  const current = calculateDynamicEntrants(race, currentDayIndex, raceDayIndex);
  const max = getMaxEntrantsForRace(race);
  return (current / max) >= 0.9;
}

/**
 * Get fill rate percentage (0-100)
 */
export function getFillRatePercentage(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number
): number {
  const current = calculateDynamicEntrants(race, currentDayIndex, raceDayIndex);
  const max = getMaxEntrantsForRace(race);
  return Math.round((current / max) * 100);
}
```

---

### Phase 2: Integrate into Race Entry Modal

#### 2.1: Update Race Entry Modal
**File**: `src/components/scheduling/race-entry-modal.tsx`

Import and use the new engine:
```typescript
import { 
  calculateDynamicEntrants, 
  getEntrantsDisplay,
  isRaceNearlyFull,
  getFillRatePercentage 
} from "@/scheduling/race-entrants-engine";

export function RaceEntryModal({
  race,
  validation,
  currentBalance,
  onConfirm,
  onCancel,
}: RaceEntryModalProps) {
  const { t } = useTranslation();
  const currentDayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);
  
  // Calculate race day index
  const raceDayIndex = race.dayIndex || currentDayIndex; // Use race.dayIndex if available
  
  // Get dynamic entrant counts
  const entrantsDisplay = getEntrantsDisplay(race, currentDayIndex, raceDayIndex);
  const fillRate = getFillRatePercentage(race, currentDayIndex, raceDayIndex);
  const nearlyFull = isRaceNearlyFull(race, currentDayIndex, raceDayIndex);
  
  return (
    <div className="...">
      {/* Race Details Section */}
      <div className="space-y-3">
        {/* Entrants Display */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
              Entrants
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">
              {entrantsDisplay}
            </span>
            
            {/* Fill Rate Indicator */}
            {nearlyFull && (
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[9px] font-bold uppercase tracking-wider rounded">
                Almost Full
              </span>
            )}
            
            {fillRate < 50 && (
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold uppercase tracking-wider rounded">
                Open
              </span>
            )}
          </div>
        </div>
        
        {/* Visual fill bar (optional enhancement) */}
        <div className="px-3">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                fillRate >= 90 ? "bg-rose-500" :
                fillRate >= 70 ? "bg-amber-500" :
                "bg-emerald-500"
              }`}
              style={{ width: `${fillRate}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center">
            {fillRate}% registered
          </p>
        </div>
      </div>
      
      {/* Rest of modal content */}
    </div>
  );
}
```

---

### Phase 3: Update Race Calendar Display

#### 3.1: Show Entrant Counts in Race List
**File**: `src/features/scheduling/race-calendar.tsx`

Add entrant badges to race cards:
```typescript
import { getFillRatePercentage, isRaceNearlyFull } from "@/scheduling/race-entrants-engine";

// In race card rendering
const fillRate = getFillRatePercentage(race, currentDayIndex, race.dayIndex);
const nearlyFull = isRaceNearlyFull(race, currentDayIndex, race.dayIndex);

<div className="race-card">
  {/* Existing race info */}
  
  {/* Add entrant indicator */}
  <div className="flex items-center gap-1.5 mt-2">
    <Users className="w-3.5 h-3.5 text-slate-400" />
    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
      {fillRate}%
    </span>
    {nearlyFull && (
      <span className="text-[9px] font-bold uppercase text-rose-600">
        Almost Full!
      </span>
    )}
  </div>
</div>
```

---

### Phase 4: Add Translations

#### 4.1: English Translations
**File**: `src/content/translations/en.json`

```json
{
  "race_entry": {
    "entrants": "Entrants",
    "fill_rate": "{percent}% registered",
    "status": {
      "open": "Open",
      "filling": "Filling Up",
      "almost_full": "Almost Full",
      "full": "Full"
    }
  }
}
```

#### 4.2: Indonesian Translations
**File**: `src/content/translations/id.json`

```json
{
  "race_entry": {
    "entrants": "Peserta",
    "fill_rate": "{percent}% terdaftar",
    "status": {
      "open": "Terbuka",
      "filling": "Sedang Terisi",
      "almost_full": "Hampir Penuh",
      "full": "Penuh"
    }
  }
}
```

---

## Testing Plan

### Unit Tests:
1. ✅ `calculateDynamicEntrants()` returns values between 1 and max
2. ✅ Entrant count increases as race day approaches
3. ✅ International races fill faster than local races
4. ✅ Same race ID always returns same variance (consistency)
5. ✅ 30+ days out: 5-15% filled
6. ✅ 7 days out: 60-80% filled
7. ✅ Race day: 100% filled
8. ✅ `isRaceNearlyFull()` returns true when >90%

### Integration Tests:
1. ✅ Race entry modal displays dynamic count
2. ✅ Count updates when viewing same race on different days
3. ✅ "Almost Full" badge appears at >90%
4. ✅ Fill rate bar renders correctly
5. ✅ Race calendar shows entrant percentages
6. ✅ No errors when race.dayIndex is undefined

### Visual Tests:
1. ✅ Entrant display fits in modal layout
2. ✅ Fill bar animates smoothly
3. ✅ Status badges are readable
4. ✅ Dark mode colors look good

---

## Files to Modify

### Phase 1: Core Engine
1. `src/scheduling/race-entrants-engine.ts` - **NEW FILE** - Entrant calculation logic

### Phase 2: Entry Modal
2. `src/components/scheduling/race-entry-modal.tsx` - Add dynamic display

### Phase 3: Calendar
3. `src/features/scheduling/race-calendar.tsx` - Add entrant indicators (optional)

### Phase 4: Translations
4. `src/content/translations/en.json` - English strings
5. `src/content/translations/id.json` - Indonesian strings

### May Need Updates:
6. `src/scheduling/race-calendar-types.ts` - Ensure `dayIndex` exists on `RaceOccurrence`

---

## Success Criteria

- [ ] Entrant count is dynamic and realistic
- [ ] Registration follows sigmoid curve pattern
- [ ] International races fill faster than local
- [ ] Same race shows consistent variance across views
- [ ] "Almost Full" indicator works correctly
- [ ] Fill rate percentage is accurate
- [ ] Visual fill bar displays correctly
- [ ] Translations work for EN/ID
- [ ] No performance issues calculating entrants
- [ ] Code is well-documented and maintainable

---

## Future Enhancements

- [ ] Add "Waitlist" system when races reach 100%
- [ ] Show entrant count trend (e.g., "+23 in last 3 days")
- [ ] Add "Popular" badge for fast-filling races
- [ ] Show player's registration number (e.g., "You are #47")
- [ ] Add notification when race is filling up fast
- [ ] Track entrant demographics (beginner/advanced ratio)
- [ ] Add "Early Bird Discount" for early registration

---

## Notes

- Keep calculation lightweight—it runs every render
- Use seeded randomness for consistency
- Don't store entrant counts—calculate on-the-fly
- Ensure edge cases handle gracefully (past races, invalid dates)
- Consider caching results if performance becomes an issue
