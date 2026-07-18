# Sprint 29 — Bug Fixes, Enhancements, and Code Organization

## Objective

Address critical bugs in the race registration and rest systems, improve UI/UX for training and race calendar screens, expand the work economy system, reorganize code structure, and implement a complete data reset functionality.

---

## Sprint Overview

This sprint focuses on:
1. **Critical Bug Fixes**: Race re-registration, race re-start, rest week not advancing date, and race day filtering issues
2. **Economy Expansion**: Adding more work types with varied requirements and rewards
3. **Code Organization**: Moving `work-types.ts` to match the structure of other economy modules
4. **UI/UX Enhancements**: Improving training screen and race calendar interfaces
5. **Player Identity**: Dynamic displayName generation and management
6. **Data Management**: Complete game reset functionality

---

## Tasks

### 🐛 Critical Bug Fixes (Priority: HIGH)

#### Task 1: Fix "Rest 1 Week" Not Advancing Date
**File**: `src/engine/timeline/actions.ts` or timeline-related logic
**Issue**: When player clicks "Rest 1 week", the game date remains the same, while "Rest 1 day" works correctly.
**Expected Behavior**: "Rest 1 week" should advance `dayIndex` by 7 days.
**Acceptance Criteria**:
- [ ] Identify the rest action handler for "Rest 1 Week"
- [ ] Verify that `dayIndex` increments by 7
- [ ] Verify that energy recovers appropriately
- [ ] Test that scheduled races are checked during the 7-day advance
- [ ] Ensure fast-forward logic halts on registered race days

---

#### Task 2: Prevent Re-joining Finished/Past Races
**File**: `src/components/scheduling/race-calendar.tsx`, race registration logic
**Issue**: Races that have already finished or passed can still be re-joined and re-started.
**Expected Behavior**: 
- Completed races (marked as `isCompleted: true`) should not allow registration or start
- Races where `dayIndex < currentDayIndex` should not be startable
**Acceptance Criteria**:
- [ ] Add validation before race start: check `race.isCompleted` and `race.dayIndex >= currentDayIndex`
- [ ] Disable "Start Race" button for past/finished races
- [ ] Show appropriate status message (e.g., "Race Finished", "Race Passed")
- [ ] Test with races from different time periods

---

#### Task 3: Prevent Re-registering for Already Registered Races
**File**: `src/components/scheduling/race-calendar.tsx`, upcoming races tab
**Issue**: In the "Upcoming" tab, races that the player has already registered for can still be registered again.
**Expected Behavior**: If `race.isRegistered === true`, the registration button should be disabled or hidden.
**Acceptance Criteria**:
- [ ] Check `race.isRegistered` before allowing registration
- [ ] Update button state: show "Already Registered" instead of "Register"
- [ ] Disable registration button for already-registered races
- [ ] Verify badge showing "Registered" status is visible
- [ ] Test registering -> navigating away -> returning to verify state persistence

---

#### Task 4: Fix "Race Day" Tab Showing All Registered Races
**File**: `src/components/scheduling/race-calendar.tsx`
**Issue**: The "Race Day" tab shows all registered races forever, instead of only races scheduled for the current `dayIndex`.
**Expected Behavior**: 
- "Race Day" tab should only show races where `race.dayIndex === currentDayIndex` AND `race.isRegistered === true`
- Past registered races should appear in "Registered" tab with appropriate status
**Acceptance Criteria**:
- [ ] Filter `todayRaces` to only include: `race.dayIndex === currentDayIndex && race.isRegistered === true`
- [ ] Verify "Race Day" tab is empty on days without scheduled races
- [ ] Verify registered races appear in "Race Day" tab only on their scheduled day
- [ ] Test fast-forwarding through multiple days to verify correct filtering

---

### ⚙️ System Enhancements (Priority: MEDIUM)

#### Task 5: Enforce Unique Weekend-Only Races
**File**: `src/scheduling/race-generator.ts` or race scheduling logic
**Issue**: Races can duplicate and occur on any day of the week.
**Expected Behavior**: 
- Each race should be unique (no duplicate race IDs on the same day)
- Races should only be scheduled on weekends (Day 6 = Saturday, Day 7 = Sunday)
**Acceptance Criteria**:
- [ ] Add validation: `dayIndex % 7 === 6 || dayIndex % 7 === 0` (weekend check)
- [ ] Ensure race generation creates unique race instances per day
- [ ] Add deduplication logic if races are generated multiple times
- [ ] Update race generation to prefer weekend days
- [ ] Test calendar to verify no weekday races appear

**Implementation Notes**:
```typescript
// Example weekend check
function isWeekend(dayIndex: number): boolean {
  const dayOfWeek = dayIndex % 7; // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}
```

---

#### Task 6: Add More Work Types
**File**: `src/economy/work-types.ts`
**Objective**: Expand the economy system with more diverse work options to give players more variety and progression paths.

**New Work Types to Add**:
1. **"Content Creator"** 🎬
   - Pay: $40-80 (scales with charisma)
   - Energy Cost: 30 EP
   - Requirements: Min Charisma 15, Min Age 16
   - Effects: +1 Charisma, -1 Health

2. **"Personal Trainer"** 💪
   - Pay: $60-120 (scales with running skill)
   - Energy Cost: 35 EP
   - Requirements: Min Running Skill 25, Min Age 18
   - Effects: +1 Running, -2 Health

3. **"Sports Nutritionist"** 🥗
   - Pay: $80-150 (scales with intellect + running skill)
   - Energy Cost: 25 EP
   - Requirements: Min Intellect 20, Min Running Skill 15
   - Effects: +2 Intellect, +1 Health

4. **"Running Store Staff"** 👟
   - Pay: $35-50
   - Energy Cost: 25 EP
   - Requirements: Min Age 16
   - Effects: +1 Charisma, -1 Health

5. **"Event Organizer"** 📋
   - Pay: $100-200 (scales with charisma + intellect)
   - Energy Cost: 40 EP
   - Requirements: Min Charisma 25, Min Intellect 20, Min Career Wins 5
   - Effects: +2 Charisma, +1 Intellect, -2 Health

**Acceptance Criteria**:
- [ ] Add 5 new work types with appropriate requirements
- [ ] Ensure pay scaling works correctly with player stats
- [ ] Add appropriate icons and colors for each work type
- [ ] Test unlocking conditions based on player progression
- [ ] Verify energy costs and stat effects apply correctly
- [ ] Update any related UI to display new work options

---

#### Task 7: Move work-types.ts to Economy Directory Structure
**Current Location**: `src/economy/work-types.ts`
**Target Location**: `src/app/economy/work-types.ts` (or similar structure matching the economy page)

**Objective**: Reorganize the work-types configuration to match the structure of other economy modules, specifically to be alongside `src/app/economy/page.tsx`.

**Acceptance Criteria**:
- [ ] Move `src/economy/work-types.ts` to appropriate location (e.g., `src/app/economy/work-types.ts` or `src/features/economy/work-types.ts`)
- [ ] Update all imports across the codebase
- [ ] Verify no TypeScript errors after move
- [ ] Run build to ensure no broken references
- [ ] Update any related documentation or comments

**Files to Update** (likely imports):
- `src/app/economy/page.tsx`
- `src/components/economy/work-selector-modal.tsx`
- `src/engine/timeline/actions.ts`
- Any other files importing work types

**Note**: Consider the existing structure:
- `src/app/economy/page.tsx` exists
- `src/economy/work-types.ts` exists
- Decide whether to move to `src/app/economy/` or create `src/features/economy/`

---

### 🎨 UI/UX Enhancements (Priority: MEDIUM)

#### Task 8: Enhance Race Calendar UI/UX
**File**: `src/components/scheduling/race-calendar.tsx`

**Improvements**:
1. **Visual Status Indicators**:
   - More prominent "Already Registered" badges
   - Clear visual distinction between available, registered, and past races
   - Color-coded status indicators (Green = Available, Blue = Registered, Gray = Past/Completed)

2. **Better Tab Counts**:
   - Show accurate counts for each tab
   - Add empty state messages when tabs have no races

3. **Improved Race Cards**:
   - Better spacing and typography
   - More readable status messages
   - Add tooltips for disabled actions

4. **Responsive Design**:
   - Ensure calendar works well on mobile devices
   - Improve scrolling for long race lists

**Acceptance Criteria**:
- [ ] Implement visual improvements for race status
- [ ] Add color coding for different race states
- [ ] Improve empty state messages ("No races today", "No registered races")
- [ ] Add loading states if applicable
- [ ] Test responsive design on mobile viewport
- [ ] Ensure accessibility (ARIA labels, keyboard navigation)

---

#### Task 9: Enhance Training Screen UI/UX
**File**: `src/features/training/training-screen.tsx`

**Improvements**:
1. **Activity Selection**:
   - Add visual previews or descriptions for each activity type
   - Show expected benefits/effects before selecting
   - Highlight recommended activities from coach

2. **Energy Display**:
   - More prominent energy indicator
   - Visual warning when energy is low
   - Show energy cost per activity

3. **Weekly Training Summary**:
   - Better visual presentation of training history
   - Add progress indicators (e.g., "3/7 days trained this week")
   - Show training streak

4. **Coach Recommendations**:
   - Make recommendations more prominent
   - Add reasoning tooltip ("Why this activity?")
   - Visual distinction from regular activities

**Acceptance Criteria**:
- [ ] Improve activity card designs with better information hierarchy
- [ ] Add energy cost badges to each activity option
- [ ] Enhance coach recommendation section with better visibility
- [ ] Improve weekly training summary presentation
- [ ] Add visual feedback for selection state
- [ ] Test on mobile devices for usability

---

### 👤 Player Identity (Priority: LOW)

#### Task 10: Dynamic displayName Generation and Management
**File**: `src/runner/runner-types.ts`, `src/features/settings/settings-screen.tsx`

**Current Issue**: `displayName` in `RunnerProfile` is static and not properly initialized.

**Required Changes**:
1. **On Game Start** (First-time player):
   - Generate a random runner name using existing `generateRunnerName()` utility
   - Set as `displayName` in `RunnerProfile`

2. **In Settings**:
   - Allow player to edit `displayName`
   - Show current `displayName` from runner profile
   - Save changes to runner profile store

3. **At Beginning of Game** (Onboarding):
   - Optionally show a name selection screen
   - Allow player to randomize or input custom name
   - Initialize profile with chosen name

**Acceptance Criteria**:
- [ ] Generate random `displayName` on first profile creation
- [ ] Link settings screen name input to `runnerState.profile.displayName`
- [ ] Update `useRunnerStore` to expose `setDisplayName` action
- [ ] Display `displayName` throughout the app (profile, results, etc.)
- [ ] Ensure name persists across sessions (localStorage)
- [ ] Test: Generate name → Change in settings → Verify persistence

**Implementation Note**:
```typescript
// In runner-store.ts
setDisplayName: (name: string) => set((state) => ({
  runnerState: {
    ...state.runnerState,
    profile: {
      ...state.runnerState.profile,
      displayName: name.trim(),
    },
    lastUpdated: new Date().toISOString(),
  },
})),
```

---

### 🗑️ Data Management (Priority: HIGH)

#### Task 11: Implement Complete Game Reset in Settings
**File**: `src/features/settings/settings-screen.tsx`

**Current State**: Settings screen has a "Reset All Data" button that calls `resetAllData()` from settings store.

**Required Enhancement**: 
The reset should clear **everything** and return the player to the beginning of the game, including:
- Runner profile
- Training state
- Timeline/game state
- Race history
- Economy state
- All localStorage data

**Acceptance Criteria**:
- [ ] Identify all Zustand stores that need resetting:
  - `useRunnerStore`
  - `useTrainingStore`
  - `useTimelineStore`
  - `usePlayerStore`
  - `useSettingsStore` (partially - keep language/sound preferences)
  - Any other game state stores
- [ ] Create a global reset function or enhance existing `resetAllData()`
- [ ] Call reset on all stores when "Reset All Data" is confirmed
- [ ] Clear all localStorage keys related to game state
- [ ] Redirect user to home/onboarding screen after reset
- [ ] Show success message after reset
- [ ] Test: Full game progress → Reset → Verify clean slate

**Implementation Approach**:
```typescript
// In settings-store.ts or new reset-utility.ts
export function resetAllGameData() {
  // Reset all stores
  useRunnerStore.getState().resetProfile();
  useTrainingStore.getState().resetTraining();
  useTimelineStore.getState().resetTimeline();
  usePlayerStore.getState().resetPlayer();
  
  // Preserve user preferences
  const currentLang = useSettingsStore.getState().settings.language;
  const currentSound = useSettingsStore.getState().settings.sound;
  
  useSettingsStore.getState().resetAllData();
  
  // Restore preferences
  useSettingsStore.getState().setLanguage(currentLang);
  useSettingsStore.getState().setSound(currentSound);
  
  // Clear any additional localStorage
  localStorage.removeItem('race-history');
  // ... clear other keys as needed
  
  // Redirect to fresh start
  window.location.href = '/';
}
```

---

## Technical Notes

### Race State Management
- All race filtering should happen at the component level
- Use `currentDayIndex` from `useTimelineStore` for date comparisons
- Race state properties to check:
  - `isRegistered`: Player has signed up
  - `isCompleted`: Race has been finished
  - `dayIndex`: Scheduled race day

### Timeline Actions
- Rest actions should properly increment `dayIndex`
- Fast-forward should check for scheduled events (races, sponsor meetings)
- Energy recovery should scale with rest duration

### Work Types Structure
```typescript
export type WorkTypeId = 
  | "part_time"
  | "full_time"
  | "freelance"
  | "coaching"
  | "sponsor_event"
  | "corporate"
  | "brand_ambassador"
  | "marathon_trainer"
  | "coach"
  | "content_creator"      // NEW
  | "personal_trainer"     // NEW
  | "sports_nutritionist"  // NEW
  | "running_store_staff"  // NEW
  | "event_organizer";     // NEW
```

---

## Testing Checklist

### Bug Fixes
- [ ] "Rest 1 Week" advances date by 7 days
- [ ] Completed races cannot be restarted
- [ ] Past races show correct status
- [ ] Already-registered races cannot be re-registered
- [ ] "Race Day" tab only shows today's races
- [ ] Race uniqueness is enforced
- [ ] Races only appear on weekends

### Features
- [ ] New work types unlock correctly
- [ ] Work type pay scaling functions properly
- [ ] displayName generates on first load
- [ ] displayName can be changed in settings
- [ ] displayName persists across sessions
- [ ] Complete reset clears all game data
- [ ] User preferences survive reset

### UI/UX
- [ ] Race calendar is visually clear
- [ ] Training screen shows relevant information
- [ ] Mobile responsiveness works
- [ ] Empty states display properly
- [ ] Loading states work as expected

---

## Build Verification

After completing all tasks:
```bash
# Type check
pnpm tsc --noEmit

# Run tests
pnpm test

# Build production
pnpm build
```

All commands should complete without errors.

---

## Priority Order

1. **HIGH**: Bug fixes (Tasks 1-4, 11)
2. **MEDIUM**: System enhancements and UI improvements (Tasks 5-9)
3. **LOW**: Nice-to-have features (Task 10)

---

## Definition of Done

- [ ] All acceptance criteria met for each task
- [ ] No TypeScript errors
- [ ] Production build succeeds
- [ ] Manual testing completed for all features
- [ ] Code follows existing patterns and conventions
- [ ] No regressions in existing functionality
- [ ] Sprint documented and committed

---

## Sprint Success Criteria

This sprint is successful when:
1. All critical bugs are fixed and verified
2. Players cannot exploit race registration/restart
3. Rest mechanics work correctly for all durations
4. Work economy is expanded with 5+ new jobs
5. Code organization matches project structure
6. UI/UX improvements are noticeable and functional
7. Complete game reset works reliably
