# Sprint 32: Training System Overhaul — Making Training Central to Performance

## 🎯 Vision

Make training the **primary driver of race performance**. Currently, training is a cosmetic activity with no real impact on race outcomes. After this sprint:

- A disciplined runner who follows quality training plans **wins races**
- A lazy runner who skips training **performs poorly** and may DNF
- Every training session visibly impacts Fitness, Fatigue, Readiness, and Energy
- The adaptation system makes delayed fitness gains feel earned
- The weekly planner is the central hub the player returns to every day

---

## 🔍 Root Causes (What's Broken)

| # | Issue | Details |
|---|-------|---------|
| 1 | **Template selection is cosmetic** | Clicking a template card only sets `selectedTemplate` state — it never calls `generateNewPlan` with that template. The plan is auto-generated using `selectOptimalTemplate`, ignoring user choice. |
| 2 | **"Buat Jadwal Sendiri" is a ghost** | Passes `{} as PlanTemplate` (empty object cast). The handler just opens the day-swap modal for the first editable day. No real custom-plan builder exists. |
| 3 | **Training never applies to runner profile** | `handleStartWorkout` calls `doAction("train")` (engine stats) and `completeActivity` (weekly plan), but **never calls `recordTrainingActivity`** from `training-engine.ts`. So Fitness, Fatigue, Readiness never change from training. |
| 4 | **Adaptation queue is always empty** | `recordTrainingActivity` is what calls `queueAdaptation`. Since #3 means it's never called, `processAdaptationQueue` runs on mount but does nothing. Delayed fitness gains never happen. |
| 5 | **Starting fitness is too high** | `DEFAULT_RUNNER_PROFILE.currentFitness = 50` (Intermediate tier). A new player has no incentive to train because they start at mid-tier. Should be **30 (Beginner)** so training progression feels meaningful. |
| 6 | **Adherence date bug** | `calculateAdherence` uses `pa.dayIndex < Date.now()` (line 284 of `weekly-plan-engine.ts`). `Date.now()` returns epoch ms (~1.7 trillion), which no `dayIndex` (small integer) will ever be less than. So `missedWorkouts` is always 0. |
| 7 | **No post-training feedback** | After clicking "Start Workout," the player is silently redirected to `/profile`. No animation, no stat-change indicators, no sense of progression. |
| 8 | **Flat EP cost** | `doAction("train")` always deducts 30 EP regardless of activity intensity. A "Full Rest" should cost 0 EP, while "Interval Training" should cost 55 EP. The weekly plan already tracks `energyCost` per activity, but this info isn't used by the engine. |

---

## 📋 Implementation Tasks

### Task 1: Lower Default Starting Fitness (Beginner Tier)

**Files to modify:** `src/runner/runner-types.ts`, `src/engine/simulation/checkpoint-loop.ts`

**Changes:**
- Change `DEFAULT_RUNNER_PROFILE.currentFitness` from `50` → `30`
- Change `DEFAULT_RUNNER_PROFILE.currentFatigue` from `0` → `10` (slight starting fatigue to emphasize recovery)
- Update the fallback in `checkpoint-loop.ts` (line ~142-152) to match: `currentFitness: 30, currentFatigue: 10, currentReadiness: 80`

**Why:** A new player starting at fitness 30 (Beginner tier) means training has a visible, meaningful impact. The pace modifier formula `(50 - fitness) * 0.4` means fitness 30 adds +8 sec/km, while fitness 50 adds 0 sec/km. Racing at fitness 30 will feel noticeably harder, giving the player a clear incentive to train and improve.

---

### Task 2: Make Template Selection Actually Work

**Files to modify:** `src/features/training/training-screen.tsx`, `src/training/weekly-plan-engine.ts`

**Problem:** The `PlanTemplateSelector` shows 4 templates beautifully, but clicking one just sets `selectedTemplate` state. The plan is still auto-generated using the automatic selector.

**Changes in `training-screen.tsx`:**

1. Modify `handleSelectTemplate` to call `generateNewPlan` with the chosen template:

```typescript
const handleSelectTemplate = useCallback(
  (template: PlanTemplate) => {
    setSelectedTemplate(template);
    const hasId = Boolean((template as { id?: string }).id);
    if (hasId) {
      // User selected a real template — regenerate the plan with it
      generateNewPlan(dayIndex, runnerState, upcomingRaces, template.id);
    } else {
      // "Buat Jadwal Sendiri" — handled below
      if (currentWeeklyPlan) {
        const firstEditable = currentWeeklyPlan.plannedActivities
          .map((pa) => pa.dayIndex)
          .filter((d) => d >= dayIndex)
          .sort((a, b) => a - b)[0];
        if (firstEditable !== undefined) {
          setAutoExpandDayIndex(firstEditable);
          setSelectedDayIndex(firstEditable);
        }
      }
    }
  },
  [currentWeeklyPlan, dayIndex, generateNewPlan, runnerState, upcomingRaces],
);
```

2. Update `generateNewPlan` to accept an optional `templateId` parameter:

```typescript
generateNewPlan(dayIndex, runnerState, upcomingRaces, templateId?: string)
```

3. In `weekly-plan-engine.ts`, modify `generateWeeklyPlan` to accept an optional `templateId`:

```typescript
export function generateWeeklyPlan(
  startDayIndex: number,
  runnerState: RunnerState,
  upcomingRaces: RaceOccurrence[] = [],
  templateId?: string
): WeeklyPlan {
  // ... existing logic ...
  
  // If a specific template is requested, use it
  let template: PlanTemplate;
  if (templateId) {
    const requestedTemplate = getTemplateById(templateId);
    if (requestedTemplate) {
      template = requestedTemplate;
    } else {
      template = selectOptimalTemplate(...);
    }
  } else {
    // Fall back to auto-selection
    template = selectOptimalTemplate(...);
  }
  // ... rest of generation ...
}
```

4. Update the store's `generateNewPlan` to pass `templateId` through:

In `training-store.ts`:
```typescript
generateNewPlan: (dayIndex, runnerState, upcomingRaces = [], templateId?: string) => {
  const newPlan = generateWeeklyPlan(dayIndex, runnerState, upcomingRaces, templateId);
  // ... rest ...
}
```

---

### Task 3: Build "Buat Jadwal Sendiri" (Custom Plan Builder)

**Files to modify/create:** 
- `src/components/training/custom-plan-builder.tsx` (new)
- `src/features/training/training-screen.tsx`
- `src/content/translations/en.json`
- `src/content/translations/id.json`

**What it should do:**

Replace the current empty-object hack with a proper modal/drawer that lets the player compose a week from scratch:

1. **Day-by-day selector**: Show all 7 days of the week as rows. Each row has a dropdown/selector for `DailyActivity` type.

2. **Visual preview**: As the player selects activities, show:
   - Total weekly volume (estimated km)
   - Total EP cost
   - Hard day count & spacing validation
   - Rest day count

3. **Validation feedback**: Inline warnings if:
   - More than 2 hard days selected
   - Back-to-back hard days
   - No rest days
   - Insufficient recovery after hard days

4. **Save as custom plan**: Call `generateNewPlan` with a new custom template that reflects the player's choices.

5. **Template UX**:
   - Open as a full-screen drawer/sheet on mobile
   - Side panel on desktop
   - "Reset to recommended" button to clear and auto-fill

**Component structure:**

```
CustomPlanBuilder
├── Header (title, close button, estimated volume)
├── DaySelector (×7 days)
│   ├── DayLabel (Mon, Tue, ...)
│   ├── ActivityDropdown (all 9 DailyActivity types)
│   ├── EnergyCostBadge
│   └── ValidationIndicator (⚠️ if adjacent hard days)
├── WeeklySummary
│   ├── Volume (km)
│   ├── EP Cost
│   ├── Hard Days count
│   ├── Rest Days count
│   └── Validation messages
└── ActionBar
    ├── "Reset to Recommended"
    └── "Apply Plan" button
```

---

### Task 4: Connect Training Completion to `recordTrainingActivity`

**This is the most critical task.** Without it, training has zero impact on performance.

**Files to modify:** `src/features/training/training-screen.tsx`, `src/training/training-engine.ts`

**Changes in `training-screen.tsx` (`handleStartWorkout`):**

```typescript
const handleStartWorkout = useCallback(() => {
  if (!currentWeeklyPlan) return;
  
  const todaysActivity = currentWeeklyPlan.plannedActivities.find(
    (pa) => pa.dayIndex === dayIndex
  );
  
  if (todaysActivity) {
    // 1. Deduct EP via train action in timeline (engine-side)
    useTimelineStore.getState().doAction("train");
    
    // 2. Record training activity with proper effects (NEW)
    recordTrainingActivity(todaysActivity.activity, dayIndex);
    
    // 3. Mark the activity as completed in the weekly plan
    completeActivity(dayIndex, todaysActivity.activity);
    
    // 4. Show feedback before redirect
    router.push("/profile");
  }
}, [currentWeeklyPlan, dayIndex, completeActivity, router]);
```

**Changes in `training-engine.ts` (`recordTrainingActivity`):**

The function already modifies `currentFatigue` and `currentReadiness` correctly. However, it also needs to:

1. **Also directly update `currentFitness`** (currently only delayed adaptation does this):
   ```typescript
   // Apply immediate fitness gain (small, the bulk comes from adaptation)
   const immediateFitness = effect.fitness * 0.3; // 30% immediate, 70% delayed
   const updatedFitness = runnerState.profile.currentFitness + immediateFitness;
   ```
   
2. **Sync back to the zustand store** so the UI updates reactively:
   ```typescript
   // After saving, notify the runner store
   const useRunnerStore = dynamicImport or event emitter
   // Best approach: saveRunnerState already persists; add a dispatch event
   window.dispatchEvent(new CustomEvent("runner-state-updated", { 
     detail: updatedRunnerState 
   }));
   ```

3. **Fix the `totalTrainingDays` counter** — it's on `RunnerProfile` but never incremented from this function:
   ```typescript
   const updatedRunnerState = {
     ...runnerState,
     profile: {
       ...runnerProfileWithXP,
       totalTrainingDays: runnerState.profile.totalTrainingDays + 1,
       // ... other fields
     },
   };
   ```

---

### Task 5: Fix Adherence Date Bug

**Files to modify:** `src/training/weekly-plan-engine.ts`

**Change** (line 284):

```typescript
// Before (broken):
const missed = plan.plannedActivities.filter(
  (p) => !p.isCompleted && p.dayIndex < Date.now()
).length;

// After (fixed):
const missed = plan.plannedActivities.filter(
  (p) => !p.isCompleted && p.dayIndex < currentDayIndex
).length;
```

But `calculateAdherence` doesn't receive `currentDayIndex`. It needs to:

```typescript
export function calculateAdherence(
  plan: WeeklyPlan, 
  currentDayIndex?: number
): AdherenceMetrics {
  // ... 
  const effectiveDayIndex = currentDayIndex ?? Date.now();
  const missed = plan.plannedActivities.filter(
    (p) => !p.isCompleted && p.dayIndex < effectiveDayIndex
  ).length;
  // ...
}
```

And the call site in `training-store.ts` needs to pass the dayIndex.

---

### Task 6: Add Post-Training Performance Feedback

**Files to modify:** `src/features/training/training-screen.tsx`

After completing a workout, instead of silently redirecting, show a **training results panel**:

**What to show (brief overlay, auto-dismiss 3s):**

```
┌─────────────────────────────────┐
│  ✅ Training Complete!          │
│                                 │
│  Activity: Tempo Run            │
│  EP Used: -45                   │
│                                 │
│  📈 Fitness: 33 → 35           │
│  📉 Fatigue: 15 → 30           │
│  📊 Readiness: 85 → 80         │
│                                 │
│  ⏳ Adaptation: +2 fitness      │
│     in 3 days                   │
│                                 │
│  [OK]                           │
└─────────────────────────────────┘
```

**Implementation approaches:**

- **Option A (simpler)**: Show the overlay, "OK" button redirects to `/profile`
- **Option B (better)**: Stay on training screen, update all stats live via the store, show a celebratory animation

Use `framer-motion` for the overlay animation (already a dependency). Show changes with green (increase) and red (decrease) text.

**Data flow:** Before calling `recordTrainingActivity`, snapshot the current Fitness/Fatigue/Readiness. After the call, read the new values from the store. Diff them for display.

---

### Task 7: Variable EP Costs for Different Activities

**Files to modify:** `src/features/training/training-screen.tsx`, `src/engine/timeline/actions.ts`

**Problem:** Currently `doAction("train")` always deducts 30 EP. Harder workouts should cost more, easy ones less.

**Changes:**

1. In `training-screen.tsx`, instead of calling `doAction("train")` (flat 30 EP), calculate the correct EP cost:

```typescript
// Before:
useTimelineStore.getState().doAction("train");

// After:
const energyCost = todaysActivity.energyCost; // Already calculated in planned activity
useTimelineStore.getState().doAction("train", energyCost);
```

2. Modify the `doAction` signature in `timeline-store.ts` to accept an optional `customEnergyCost` parameter:

```typescript
doAction: (actionId: string, customEnergyCost?: number) => {
  // ...
  const energyCost = customEnergyCost ?? actionDef.energyCost;
  // ...
}
```

3. The `train` action definition in the actions config should keep its base 30 EP cost as a fallback.

---

### Task 8: Display Training Impact on Home Screen / Profile

**Files to modify:** `src/features/home/home-screen.tsx`, `src/features/profile/profile-screen.tsx`

**Goal:** Make training progress visible everywhere.

**Home screen additions:**
- Show "Today's Training" card if a workout is planned but not completed
- Show "Training Streak" or "Consistency Score"
- Show coach tip: "You have a Tempo Run today! ⚡"

**Profile screen additions:**
- Show training history graph (last 7-14 days of activities)
- Show "This Week's Training" summary (completed/total)
- Show adaptation status (pending fitness gains)
- Show fitness trend (↑ ↓ →) over the last week

---

### Task 9: Race-Aware Training — Coach Recommends Based on Upcoming Races

**Files to modify:** `src/training/coach-recommendation.ts`, `src/features/training/training-screen.tsx`

**Goal:** The coach should give specific advice based on upcoming races.

**New coach recommendations when race is in:**
- **1 day before**: "Rest up, big race tomorrow! 🏆"
- **2-3 days before**: "Taper — light run today, save your legs"
- **4-7 days before**: "Last hard session before race week"
- **7+ days before**: "Focus on your weakness — hill repeats if the race has elevation"

**Implementation:** 
- Pass `upcomingRaces` to coach recommendation function
- Generate contextual messages based on `race.dayIndex - currentDayIndex`
- Display in `CoachFeedbackPanel` with priority ordering

---

## 📦 Files to Create

| File | Purpose |
|------|---------|
| `src/components/training/custom-plan-builder.tsx` | Full custom weekly plan editor (Task 3) |
| `src/components/training/training-results-overlay.tsx` | Post-training feedback overlay (Task 6) |

## 📝 Files to Modify

| File | Changes |
|------|---------|
| `src/runner/runner-types.ts` | Lower default fitness from 50 → 30 (Task 1) |
| `src/engine/simulation/checkpoint-loop.ts` | Update fallback defaults to match (Task 1) |
| `src/training/weekly-plan-engine.ts` | Accept `templateId` param, fix adherence date bug (Tasks 2, 5) |
| `src/training/training-engine.ts` | Add immediate fitness gain, increment training counter, add store sync (Task 4) |
| `src/training/training-store.ts` | Update `generateNewPlan` signature, pass `currentDayIndex` to adherence (Tasks 2, 5) |
| `src/training/coach-recommendation.ts` | Race-aware recommendations (Task 9) |
| `src/features/training/training-screen.tsx` | Template selection triggers plan gen, call `recordTrainingActivity`, variable EP, feedback overlay (Tasks 2, 4, 6, 7) |
| `src/engine/timeline/actions.ts` | Accept optional `customEnergyCost` in `doAction` (Task 7) |
| `src/store/timeline-store.ts` | Pass through custom energy cost (Task 7) |
| `src/features/home/home-screen.tsx` | Today's training card, coach tip (Task 8) |
| `src/features/profile/profile-screen.tsx` | Training history, adaptation status (Task 8) |
| `src/content/translations/en.json` | New translation strings for custom plan builder, feedback overlay |
| `src/content/translations/id.json` | Indonesian translations |

---

## 🔗 Data Flow Diagram (After Fixes)

```
┌──────────────┐     selects template      ┌──────────────────────┐
│  Template    │ ─────────────────────────→ │  generateWeeklyPlan  │
│  Selector    │                            │  (with templateId)   │
└──────────────┘                            └──────────┬───────────┘
                                                       │
                                                       ▼
┌──────────────┐                              ┌──────────────────────┐
│  WeeklyPlan  │ ←─────────────────────────── │  New WeeklyPlan obj  │
│  Displayed   │                              │  (7 planned days)    │
└──────────────┘                              └──────────────────────┘
       │
       │ user clicks "Start Workout"
       ▼
┌──────────────────────────────────────────────────────────────┐
│  handleStartWorkout()                                         │
│                                                               │
│  1. deductEnergy(activity.energyCost)  ← variable EP         │
│  2. recordTrainingActivity(activity, dayIndex)                │
│     ├── Apply immediate fitness/fatigue/readiness changes    │
│     ├── Queue delayed adaptation                               │
│     ├── Award XP + Coins                                      │
│     └── Update totalTrainingDays                              │
│  3. completeActivity(dayIndex, activity)                      │
│     └── Mark weekly plan as completed                         │
│  4. Show TrainingResultsOverlay                               │
│     ├── Stat changes (green/red)                              │
│     ├── Adaptation pending                                    │
│     └── XP/Coins earned                                       │
└──────────────────────────────────────────────────────────────┘
                                                               │
                               ┌───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  Adaptation Queue (processed on next TrainingScreen mount)   │
│                                                               │
│  Day 0: Tempo Run → queue +2 fitness in 3 days               │
│  Day 3: Adaptation processed → currentFitness += 2           │
│                                                               │
│  Result: On race day, fitness is visibly higher →             │
│  pace modifier (50-fitness)*0.4 gives better race time       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

| Test | Expected Result |
|------|----------------|
| Click a template card | New plan generated with that template's activities |
| "Buat Jadwal Sendiri" opens custom editor | Full 7-day editor visible, can assign activities |
| Custom plan with 3 hard days shows warning | Validation: "Too many hard days" |
| Click "Start Workout" for Tempo Run | Fatigue increases by 15, Readiness drops by 5, Fitness gains queued |
| Click "Start Workout" for Full Rest | Fatigue decreases by 20, Readiness increases by 20 |
| Complete 3 days of training | Day 4: Fitness visibly higher (adaptation applied) |
| Miss 2 workouts | Adherence drops, missed workouts count > 0 |
| Race after consistent training week | Better pace, higher energy, better result |
| Race after skipping training | Worse pace, lower energy, possible DNF |
| Click "Start Workout" with 0 energy | Button disabled, "Need Energy" message shown |
| EP cost differs by activity | Full Rest = 0 EP, Interval = 55 EP |

---

## 📐 Success Metrics

| Metric | Current | Target After Sprint |
|--------|---------|-------------------|
| Training → Race Performance link | None (disconnected) | Direct causal chain |
| Default new player fitness | 50 (Intermediate) | 30 (Beginner) |
| Template selection works | No | Yes |
| Custom plan builder | Broken | Fully functional |
| Adherence tracking | Bugged (missed=0) | Accurate |
| Post-training feedback | Silent redirect | Visual overlay |
| Training history on profile | None | Last 7 days visible |
| Race-aware coach advice | None | Contextual tips |
| Variable EP costs | Flat 30 EP | Per-activity costing |

---

## 🚀 Future Considerations (Beyond Sprint 32)

- **Training streaks**: Consecutive training days → bonus fitness or XP
- **Overtraining penalty**: >5 hard days in 10 days → injury risk, forced rest
- **Periodization**: Mesocycle blocks (4-week base → 3-week build → 1-week peak → race)
- **Coach relationship**: Level up your coach → better templates, more tips
- **Social training**: Run with friends → morale boost, reduced fatigue
- **Training log export**: See your progress over real-world time
- **Workout intensity slider**: More intensity = more fitness gain but more fatigue