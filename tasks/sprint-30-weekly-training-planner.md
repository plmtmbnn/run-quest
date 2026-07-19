# Sprint 30 — Weekly Training Planner & Intelligent Guidance

## Objective

Transform the training system from reactive daily selection to proactive weekly planning. Introduce auto-generated weekly training plans, intelligent coach guidance, plan vs reality tracking, and replace the current daily training screen with a comprehensive weekly planner interface.

---

## Sprint Overview

This sprint focuses on:
1. **Weekly Plan Architecture**: New data structures and engine for weekly training plans
2. **Auto-Generated Plans**: System creates sensible weekly plans every Monday with player override
3. **Plan Templates**: Beginner, Base Building, Performance, and Recovery week templates
4. **Intelligent Guidance**: Coach feedback on plan quality, spacing, and coherence
5. **Plan Adherence Tracking**: Visual comparison of planned vs actual activities
6. **Complete UI Replacement**: Replace daily training screen with weekly planner view
7. **Mobile-First Design**: Responsive weekly calendar with touch-friendly interactions

---

## Design Decisions

### ✅ Confirmed Decisions
1. **When to Create Plans**: **Option A** - Auto-generate at week start (Monday) with manual override capability
2. **Strictness Level**: **Option B** - Guidance + feedback, no penalties (fun over frustration)
3. **Integration**: Replace daily training screen entirely - weekly planner becomes the primary interface

---

## Tasks

### 📊 Phase 1: Data Architecture & Engine (Priority: HIGH)

#### Task 1: Create Weekly Training Plan Data Structures
**File**: `src/training/training-types.ts`

**New Types to Add**:
```typescript
export interface WeeklyPlan {
  id: string;
  weekStartDay: number; // dayIndex of Monday
  weekEndDay: number;   // dayIndex of Sunday
  plannedActivities: PlannedActivity[];
  templateUsed?: "beginner" | "base" | "performance" | "recovery" | "custom";
  createdAt: number;
  adherenceRate?: number;
  coachFeedback?: string[];
  isActive: boolean;
}

export interface PlannedActivity {
  dayIndex: number;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Mon-Sun (0 = Monday)
  activity: DailyActivity;
  isCompleted: boolean;
  actualActivity?: DailyActivity; // If different from planned
  completedAt?: number;
  reason?: "completed" | "swapped" | "missed";
  energyCost: number;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  weeklyActivities: DailyActivity[]; // 7 days Mon-Sun
  targetFitness: number; // Min fitness level
  maxFatigue: number;    // Max safe fatigue
  totalVolume: number;   // Total KM per week
  icon: string;
}

export interface PlanValidation {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
}

export interface AdherenceMetrics {
  completionRate: number; // 0-100%
  substitutionRate: number; // 0-100%
  missedWorkouts: number;
  totalPlanned: number;
  totalCompleted: number;
}
```

**Acceptance Criteria**:
- [ ] Add all new types to `training-types.ts`
- [ ] Ensure types are exported properly
- [ ] Add JSDoc comments for complex types
- [ ] No TypeScript errors after adding types

---

#### Task 2: Create Training Plan Templates
**File**: `src/training/plan-templates.ts` (NEW)

**Templates to Create**:

1. **Beginner Template** (Low volume, high recovery)
   - Mon: Easy Run (5km)
   - Tue: Rest
   - Wed: Easy Run (5km)
   - Thu: Rest
   - Fri: Tempo Run (4km)
   - Sat: Long Run (8km)
   - Sun: Rest
   - Total: ~22km/week, Max Fatigue: 40

2. **Base Building Template** (Moderate volume)
   - Mon: Easy Run (6km)
   - Tue: Easy Run (5km)
   - Wed: Tempo Run (6km)
   - Thu: Easy Run (5km)
   - Fri: Rest
   - Sat: Long Run (12km)
   - Sun: Rest
   - Total: ~34km/week, Max Fatigue: 60

3. **Performance Template** (High intensity)
   - Mon: Easy Run (6km)
   - Tue: Intervals (5km)
   - Wed: Recovery Run (4km)
   - Thu: Tempo Run (8km)
   - Fri: Easy Run (5km)
   - Sat: Long Run (15km)
   - Sun: Strength Training
   - Total: ~43km/week, Max Fatigue: 75

4. **Recovery Week Template** (Active recovery)
   - Mon: Recovery Run (4km)
   - Tue: Rest
   - Wed: Easy Run (5km)
   - Thu: Rest
   - Fri: Recovery Run (4km)
   - Sat: Easy Run (6km)
   - Sun: Rest
   - Total: ~19km/week, Max Fatigue: 30

**Acceptance Criteria**:
- [ ] Create 4 complete plan templates with proper structure
- [ ] Add descriptive names and icons for each template
- [ ] Validate activity sequences (no back-to-back hard days)
- [ ] Export templates for use in plan engine
- [ ] Add template selection logic based on fitness/fatigue

---

#### Task 3: Build Weekly Plan Engine
**File**: `src/training/weekly-plan-engine.ts` (NEW)

**Functions to Implement**:

```typescript
/**
 * Auto-generate a weekly plan based on current runner state
 */
export function generateWeeklyPlan(
  startDayIndex: number,
  runnerState: RunnerState,
  upcomingRaces: RaceOccurrence[]
): WeeklyPlan;

/**
 * Select appropriate template based on fitness and fatigue
 */
export function selectOptimalTemplate(
  fitness: number,
  fatigue: number,
  isRecoveryWeek: boolean
): PlanTemplate;

/**
 * Validate a weekly plan for safety and effectiveness
 */
export function validateWeeklyPlan(
  plan: WeeklyPlan,
  runnerState: RunnerState
): PlanValidation;

/**
 * Generate coach feedback on plan quality
 */
export function generatePlanFeedback(
  plan: WeeklyPlan,
  validation: PlanValidation
): string[];

/**
 * Calculate plan adherence metrics
 */
export function calculateAdherence(
  plan: WeeklyPlan
): AdherenceMetrics;

/**
 * Swap a planned activity with a new one
 */
export function swapActivity(
  plan: WeeklyPlan,
  dayIndex: number,
  newActivity: DailyActivity
): WeeklyPlan;

/**
 * Mark activity as completed
 */
export function completeActivity(
  plan: WeeklyPlan,
  dayIndex: number,
  actualActivity: DailyActivity
): WeeklyPlan;

/**
 * Check if hard days are properly spaced (48h+ apart)
 */
export function validateHardDaySpacing(
  activities: DailyActivity[]
): boolean;

/**
 * Get Monday's dayIndex for current week
 */
export function getWeekStartDay(currentDayIndex: number): number;

/**
 * Check if it's time to generate a new plan (Monday)
 */
export function shouldGenerateNewPlan(
  currentDayIndex: number,
  lastPlanStartDay: number
): boolean;
```

**Validation Rules**:
- Maximum 2 hard days per week (Tempo, Intervals, Long Run)
- Hard days must be separated by 48+ hours (1 day minimum)
- Minimum 1 rest day per week
- Rest day recommended after long run
- Recovery run recommended after hard workout
- Race day needs 2-3 easy days before
- Maximum weekly volume based on fitness level

**Acceptance Criteria**:
- [ ] Implement all core functions with proper error handling
- [ ] Add validation logic with comprehensive warnings
- [ ] Generate smart feedback messages (20+ different messages)
- [ ] Test template selection for different fitness/fatigue combinations
- [ ] Verify hard day spacing validation works correctly
- [ ] Add unit tests for critical functions

---

#### Task 4: Integrate Plans into Training Store
**File**: `src/training/training-store.ts`

**Store Updates**:
```typescript
interface TrainingState {
  // ... existing fields
  currentWeeklyPlan: WeeklyPlan | null;
  planHistory: WeeklyPlan[];
  lastPlanGenerated: number; // dayIndex
}

// New actions to add
interface TrainingActions {
  // ... existing actions
  setCurrentPlan: (plan: WeeklyPlan) => void;
  generateNewPlan: (dayIndex: number, runnerState: RunnerState) => void;
  completeActivity: (dayIndex: number, activity: DailyActivity) => void;
  swapActivity: (dayIndex: number, newActivity: DailyActivity) => void;
  archivePlan: (plan: WeeklyPlan) => void;
  getAdherenceMetrics: () => AdherenceMetrics;
}
```

**Auto-Generation Logic**:
- Check on every day advance if it's Monday
- If Monday and no active plan, auto-generate
- Archive previous week's plan
- Store in plan history for adherence tracking

**Acceptance Criteria**:
- [ ] Add weekly plan fields to training state
- [ ] Implement all new store actions
- [ ] Add auto-generation trigger on Monday
- [ ] Persist plans to localStorage
- [ ] Test plan creation, updates, and archiving
- [ ] Verify state persistence across sessions

---

### 🎨 Phase 2: UI Components (Priority: HIGH)

#### Task 5: Build Weekly Calendar Grid Component
**File**: `src/components/training/weekly-calendar-grid.tsx` (NEW)

**Component Structure**:
```typescript
interface WeeklyCalendarGridProps {
  plan: WeeklyPlan;
  currentDayIndex: number;
  onDayClick: (dayIndex: number) => void;
  onActivityComplete: (dayIndex: number, activity: DailyActivity) => void;
}
```

**Features**:
- 7-column grid (Mon-Sun) on desktop
- Horizontal scroll on mobile
- Each day cell shows:
  - Day name and date
  - Planned activity icon + name
  - Actual activity (if different)
  - Completion checkmark
  - Energy cost badge
  - Status indicator (planned/completed/missed/swapped)
- Color coding:
  - Gray: Future planned
  - Green: Completed as planned
  - Yellow: Swapped/substituted
  - Red: Missed
  - Blue: Today's workout
- Highlight today's workout
- Visual distinction for rest days

**Mobile Responsive**:
- Stack days vertically on mobile
- Swipeable horizontal scroll
- Collapsible day details
- Touch-friendly tap targets (min 44x44px)

**Acceptance Criteria**:
- [ ] Create responsive 7-day grid layout
- [ ] Implement color-coded status indicators
- [ ] Add completion checkmarks and badges
- [ ] Handle click events for day selection
- [ ] Test on mobile (375px width)
- [ ] Add loading and empty states
- [ ] Follow UI/UX guidelines from docs

---

#### Task 6: Build Plan Template Selector
**File**: `src/components/training/plan-template-selector.tsx` (NEW)

**Component Features**:
- Card-based template selection
- 4 templates displayed as cards:
  - Icon, name, difficulty badge
  - Brief description
  - Weekly volume (km)
  - Target fitness range
  - Activity breakdown preview
- "Custom Plan" option to manually edit
- Visual indicator for recommended template
- Hover/focus states

**Template Card Design**:
```
┌────────────────────────────┐
│ 🏃 Beginner Plan          │
│ [Easy • 22km/week]        │
│                           │
│ • 3 Easy runs            │
│ • 1 Tempo                │
│ • 1 Long run             │
│ • 2 Rest days            │
│                           │
│ ✅ Recommended for you    │
│ [Select Plan]            │
└────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Create 4 template cards with all information
- [ ] Add selection interaction
- [ ] Highlight recommended template
- [ ] Show preview of activities
- [ ] Mobile responsive (stack cards)
- [ ] Add smooth animations on selection

---

#### Task 7: Build Coach Feedback Panel
**File**: `src/components/training/coach-feedback-panel.tsx` (NEW)

**Component Features**:
- Coach avatar/icon
- Feedback message area
- Color-coded feedback types:
  - ✅ Green: Positive feedback
  - ⚠️ Yellow: Warnings
  - 💡 Blue: Tips/suggestions
- Collapsible on mobile
- Animation when new feedback appears

**Feedback Examples**:
```
✅ "Great plan! Your hard days are well-spaced for optimal recovery."

⚠️ "Warning: You scheduled intervals on Tuesday and a long run on Wednesday. 
    Consider swapping Wednesday to an easy run."

💡 "Tip: Add a strength session on one of your rest days to build resilience."

🎯 "Race in 14 days: Consider tapering next week (reduce volume by 30%)."
```

**Acceptance Criteria**:
- [ ] Create feedback panel with icon-coded messages
- [ ] Support multiple feedback items
- [ ] Add expand/collapse on mobile
- [ ] Animate new feedback entries
- [ ] Color code by feedback type
- [ ] Test with various feedback scenarios

---

#### Task 8: Build Day Planner Cell Component
**File**: `src/components/training/day-planner-cell.tsx` (NEW)

**Component Structure**:
```typescript
interface DayPlannerCellProps {
  dayIndex: number;
  dayOfWeek: string;
  plannedActivity: DailyActivity;
  actualActivity?: DailyActivity;
  isCompleted: boolean;
  isToday: boolean;
  isRest: boolean;
  energyCost: number;
  onClick: () => void;
}
```

**Cell Layout**:
```
┌─────────────┐
│ Monday      │ <- Day name
│ Day 1       │ <- Date
├─────────────┤
│ 🏃 Easy Run │ <- Planned
│ 5km • 30 EP │ <- Details
├─────────────┤
│ ✓ Completed │ <- Status
└─────────────┘
```

**States**:
- **Planned** (future): Gray outline, activity preview
- **Today**: Blue border, pulsing animation
- **Completed**: Green background, checkmark
- **Swapped**: Yellow background, both activities shown
- **Missed**: Red outline, strikethrough
- **Rest**: Different visual (peaceful icon)

**Acceptance Criteria**:
- [ ] Implement all visual states
- [ ] Add smooth transitions between states
- [ ] Show activity details on hover/focus
- [ ] Handle click for activity modification
- [ ] Mobile-friendly sizing
- [ ] Accessibility (ARIA labels)

---

### 🏃 Phase 3: Weekly Planner Screen (Priority: HIGH)

#### Task 9: Create New Weekly Planner Screen
**File**: `src/features/training/training-screen.tsx` (REPLACE EXISTING)

**Screen Structure**:
```
┌─────────────────────────────────────┐
│ [< Back] Weekly Training Planner    │ <- Header
├─────────────────────────────────────┤
│ 📋 Quick Templates                  │ <- Template Selector
│ [Beginner] [Base] [Performance]     │
├─────────────────────────────────────┤
│ 📅 This Week's Plan (Week 42)       │ <- Week Header
│ Progress: 2/7 completed             │
│                                     │
│ ┌───┬───┬───┬───┬───┬───┬───┐      │ <- Weekly Grid
│ │Mon│Tue│Wed│Thu│Fri│Sat│Sun│      │
│ │ ✓ │ ✓ │...│...│...│...│...│      │
│ └───┴───┴───┴───┴───┴───┴───┘      │
├─────────────────────────────────────┤
│ 👨‍🏫 Coach Feedback                   │ <- Coach Panel
│ ✅ Balanced plan with good recovery │
│ ⚠️ Consider adding strength work    │
├─────────────────────────────────────┤
│ 📊 This Week's Stats                │ <- Stats Summary
│ Total Volume: 34 km                 │
│ Adherence: 29% (2/7)               │
└─────────────────────────────────────┘
│ [Regenerate Plan] [Edit Plan]      │ <- Actions
└─────────────────────────────────────┘
```

**Features**:
- Auto-load current week's plan on mount
- Show template selector at top
- Display weekly calendar grid
- Coach feedback panel
- Current week stats summary
- Actions: Regenerate plan, Manual edit mode
- Today's workout highlighted
- Start workout button (redirects to profile after completion)

**Mobile Adaptations**:
- Collapsible sections (templates, feedback)
- Horizontal scroll for calendar
- Sticky "Today's Workout" banner
- Bottom sheet for activity selection

**Acceptance Criteria**:
- [ ] Replace existing training screen completely
- [ ] Implement full layout with all sections
- [ ] Auto-load/generate plan on mount
- [ ] Handle all user interactions (select template, modify plan, complete workout)
- [ ] Mobile-first responsive design
- [ ] Add loading states during plan generation
- [ ] Test navigation flow (train → complete → profile)
- [ ] Verify plan persistence across sessions

---

### 🧠 Phase 4: Intelligent Features (Priority: MEDIUM)

#### Task 10: Implement Race-Aware Planning
**File**: `src/training/weekly-plan-engine.ts`

**Race Integration Logic**:
- Detect upcoming races within 4 weeks
- Auto-select Recovery template for week after race
- Reduce volume 30% in taper week (1 week before race)
- Add 2-3 easy days before race day
- Skip hard workouts in race week
- Show race day in weekly calendar

**Coach Messages for Race Weeks**:
```
"🏁 Race in 7 days: This is your taper week. Focus on rest and light runs."

"🎯 Race tomorrow! Keep today light and trust your training."

"🎉 Great race! This week is for recovery - easy efforts only."
```

**Acceptance Criteria**:
- [ ] Integrate race schedule into plan generation
- [ ] Auto-apply taper logic 1 week before race
- [ ] Force recovery template week after race
- [ ] Generate race-specific coach feedback
- [ ] Show race day in calendar with special indicator
- [ ] Test with various race schedules

---

#### Task 11: Add Plan Modification Interface
**File**: `src/components/training/plan-editor-modal.tsx` (NEW)

**Modal Features**:
- Opens when clicking a day cell
- Shows current planned activity
- Dropdown to select new activity
- Show energy cost changes
- Coach warning if change creates issues
- Save/Cancel buttons

**Validation on Edit**:
- Re-validate plan after each change
- Show warnings immediately if issues arise
- Suggest alternatives if change is unsafe
- Block saves that violate hard rules (0 rest days)

**Acceptance Criteria**:
- [ ] Create modal for activity editing
- [ ] Add activity dropdown selector
- [ ] Show real-time validation feedback
- [ ] Prevent unsafe edits with warnings
- [ ] Update plan and re-validate on save
- [ ] Test all validation scenarios

---

#### Task 12: Build Adherence Analytics View
**File**: `src/components/training/adherence-chart.tsx` (NEW)

**Analytics to Display**:
1. **Weekly Adherence Rate** (bar chart)
   - Last 4 weeks
   - Green = completed, Yellow = swapped, Red = missed

2. **Activity Distribution** (pie chart)
   - Easy: 40%, Hard: 30%, Rest: 30%

3. **Consistency Streak**
   - Days in a row following plan
   - Badge/medal for streaks

4. **Plan vs Reality Comparison**
   - Planned volume vs actual volume
   - Planned activity types vs actual

**Acceptance Criteria**:
- [ ] Create simple charts (can use CSS bars, no library needed)
- [ ] Calculate and display all metrics
- [ ] Show 4-week history
- [ ] Add streak counter
- [ ] Mobile responsive layout
- [ ] Test with various adherence patterns

---

### ✅ Phase 5: Integration & Polish (Priority: MEDIUM)

#### Task 13: Auto-Generate Plans on Monday
**File**: `src/training/training-engine.ts`

**Auto-Generation Trigger**:
- Hook into timeline day advance
- Check if new day is Monday
- If Monday and no active plan, generate
- Store old plan in history
- Notify player of new plan
- Send notification/toast

**Logic**:
```typescript
// In timeline advance logic
if (isMonday(newDayIndex)) {
  const hasActivePlan = trainingStore.currentWeeklyPlan?.isActive;
  
  if (!hasActivePlan) {
    const newPlan = generateWeeklyPlan(
      newDayIndex,
      runnerState,
      upcomingRaces
    );
    
    trainingStore.setCurrentPlan(newPlan);
    
    // Optional: Show toast notification
    toast.success("New training plan generated for this week!");
  }
}
```

**Acceptance Criteria**:
- [ ] Integrate plan generation into timeline system
- [ ] Detect Monday transitions
- [ ] Generate plan automatically
- [ ] Archive previous week's plan
- [ ] Show notification to player
- [ ] Test week transitions (Sun → Mon)
- [ ] Verify no duplicate plan generation

---

#### Task 14: Update Training Action to Use Weekly Plan
**File**: `src/engine/timeline/actions.ts`

**Changes Needed**:
- When player trains, look up today's planned activity
- Show planned activity as default selection
- Allow override if player wants different activity
- Mark activity as completed in weekly plan
- Update adherence metrics
- Deduct energy (existing logic)

**Flow**:
1. Player clicks "Daily Training" button
2. System loads today's planned activity from weekly plan
3. Show modal: "Today's plan: Easy Run 5km. Proceed or change?"
4. Player confirms or selects different activity
5. Record activity and update plan

**Acceptance Criteria**:
- [ ] Integrate weekly plan into train action
- [ ] Show today's planned activity
- [ ] Allow activity override with warning
- [ ] Update plan completion status
- [ ] Preserve existing energy/adaptation logic
- [ ] Test training with and without active plan

---

#### Task 15: Mobile-First Responsive Design
**Files**: All training components

**Mobile Optimizations**:
1. **Weekly Calendar**:
   - Horizontal scroll with snap points
   - Larger tap targets (min 44x44px)
   - Swipe between days
   - Bottom sheet for day details

2. **Template Selector**:
   - Vertical stack of cards
   - Swipeable carousel

3. **Coach Feedback**:
   - Collapsible section
   - Expandable on tap
   - Sticky at bottom when expanded

4. **Actions**:
   - Fixed bottom bar on mobile
   - Prominent "Start Today's Workout" button

**Breakpoints**:
- Mobile: 375px - 767px (base styles)
- Tablet: 768px - 1023px (md: prefix)
- Desktop: 1024px+ (lg: prefix)

**Acceptance Criteria**:
- [ ] Test all components at 375px width
- [ ] Verify touch targets meet 44x44px minimum
- [ ] Ensure horizontal scroll works smoothly
- [ ] Test swipe gestures on mobile devices
- [ ] Verify collapsible sections work
- [ ] No horizontal overflow on any screen size
- [ ] Follow UI/UX guidelines document

---

#### Task 16: Add Keyboard Shortcuts & Accessibility
**Files**: All training components

**Keyboard Shortcuts**:
- `←` / `→`: Navigate days
- `Enter`: Start today's workout
- `T`: Open template selector
- `E`: Enter edit mode
- `Esc`: Close modals

**Accessibility Requirements**:
- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators visible
- Screen reader announcements for plan changes
- Color contrast ratio ≥ 4.5:1
- Alternative to color-only status indicators

**Acceptance Criteria**:
- [ ] Implement all keyboard shortcuts
- [ ] Add ARIA labels to all components
- [ ] Test with keyboard-only navigation
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Verify color contrast ratios
- [ ] Add focus indicators to all interactive elements

---

## Technical Notes

### Weekly Planning Algorithm

```typescript
// Plan generation flow
1. Get current Monday's dayIndex
2. Check runner fitness/fatigue levels
3. Query upcoming races (next 4 weeks)
4. Select optimal template based on state
5. Adjust template if race in next 2 weeks
6. Generate 7 PlannedActivity entries
7. Validate plan safety
8. Generate coach feedback
9. Return WeeklyPlan object
```

### Hard Day Definition
- Tempo Run
- Interval Training
- Long Run (> 10km)
- Hill Repeats

### Easy Day Definition
- Recovery Run
- Easy Run (≤ 8km)
- Mobility/Strength

### Plan Validation Rules
```typescript
const rules = {
  maxHardDays: 2,
  minRestDays: 1,
  minDaysBetweenHard: 1, // 48 hours
  restAfterLongRun: true,
  maxWeeklyVolume: fitness * 0.5, // km
  taperReduction: 0.3, // 30% before race
  recoveryReduction: 0.5, // 50% after race
};
```

---

## Data Flow

```
Monday Arrives
    ↓
Timeline Advance
    ↓
Check: isMonday(dayIndex)
    ↓
Generate Weekly Plan
    ↓
├─ Get Runner State (fitness, fatigue)
├─ Get Upcoming Races
├─ Select Template
├─ Validate Plan
└─ Generate Feedback
    ↓
Store Plan in trainingStore
    ↓
Archive Previous Plan
    ↓
Notify Player
```

---

## Testing Checklist

### Plan Generation
- [ ] Plan auto-generates on Monday
- [ ] Correct template selected based on fitness/fatigue
- [ ] Plan accounts for upcoming races
- [ ] Taper applied 1 week before race
- [ ] Recovery template used after race
- [ ] Hard days properly spaced
- [ ] At least 1 rest day included

### Plan Validation
- [ ] Warns about back-to-back hard days
- [ ] Prevents 0 rest days
- [ ] Suggests improvements for suboptimal plans
- [ ] Validates after manual edits
- [ ] Blocks unsafe edits

### UI/UX
- [ ] Weekly calendar displays correctly
- [ ] Today's workout is highlighted
- [ ] Completion checkmarks appear
- [ ] Status colors are correct (green/yellow/red)
- [ ] Template selector works
- [ ] Coach feedback updates
- [ ] Mobile responsive (375px+)
- [ ] Keyboard navigation works
- [ ] Accessibility compliant

### Integration
- [ ] Plans persist across sessions
- [ ] Training action uses weekly plan
- [ ] Activity completion updates plan
- [ ] Adherence metrics calculate correctly
- [ ] Plan history stores properly
- [ ] Energy deduction still works

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

# Test on mobile simulator
pnpm dev
# Open http://localhost:3000/training in mobile viewport
```

All commands should complete without errors.

---

## Priority Order

1. **HIGH (Week 1)**: Tasks 1-9 (Architecture, Engine, Core UI)
2. **MEDIUM (Week 2)**: Tasks 10-13 (Intelligent Features, Integration)
3. **POLISH (Week 3)**: Tasks 14-16 (Mobile, Accessibility, Final Polish)

---

## Definition of Done

- [ ] All acceptance criteria met for each task
- [ ] No TypeScript errors
- [ ] Production build succeeds
- [ ] All tests passing
- [ ] Manual testing completed on desktop and mobile
- [ ] Keyboard navigation works
- [ ] Accessibility verified
- [ ] Code follows existing patterns
- [ ] No regressions in other features
- [ ] Sprint documented and committed

---

## Sprint Success Criteria

This sprint is successful when:
1. Players receive auto-generated weekly training plans every Monday
2. Coach provides intelligent feedback on plan quality
3. Weekly planner screen is fully functional and replaces daily training
4. Plan validation prevents unsafe training schedules
5. Players can track planned vs actual activities
6. Mobile experience is smooth and touch-friendly
7. Race schedule integrates with weekly planning (taper/recovery)
8. Adherence metrics display correctly
9. Plans persist and restore across sessions
10. The feature feels fun and educational, not restrictive

---

## Future Enhancements (Post-Sprint)

Consider for Sprint 31+:
- Multi-week planning (4-week mesocycles)
- Drag-and-drop activity rearrangement
- Export plan as calendar invite
- Share plans with friends
- AI-powered plan optimization
- Integration with wearable data
- Progressive overload tracking
- Periodization macros (base/build/peak/taper)

---

## Notes

- Keep validation guidance-focused, not punitive
- Emphasize learning over enforcement
- Make plan editing feel flexible and empowering
- Coach should be encouraging, not critical
- Visual design should make planning feel simple and clear
