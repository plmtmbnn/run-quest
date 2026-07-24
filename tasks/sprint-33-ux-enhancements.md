# Sprint 33: UX Enhancements & Race Day Experience

**Sprint Goal:** Improve player onboarding flexibility, race day notifications, EP deduction timing, story presentation, and rival leaderboard depth.

---

## 📋 Overview

This sprint focuses on quality-of-life improvements and UX refinements across multiple screens:

1. **Date of Birth Selection** - Add randomize option for onboarding and settings
2. **Race Day Alert** - Auto-dismissible popup when race starts today
3. **EP Deduction Timing** - Move EP reduction from race entry to preparation ready
4. **Story Presentation** - Make highlights collapsible with selective sharing
5. **Ghost Rival Pool** - Expand to 10+ ghost players for competitive depth
6. **Share Components** - Refactor for better modularity and reusability

---

## 🎯 Feature Breakdown

### 1. Date of Birth Selection Enhancement

**Files Affected:**
- `src/features/onboarding/onboarding-screen.tsx`
- `src/features/settings/settings-screen.tsx`
- `src/i18n/translations/*.json` (new keys)

**Current State:**
- Manual date input only
- No randomization option

**Target State:**
- Add "Randomize" button next to date of birth input
- Generate realistic random DOB (18-65 years old range)
- Same functionality in both onboarding and settings screens
- Maintain existing manual input capability

**Implementation Notes:**
```typescript
// Generate random DOB between 18-65 years old
const generateRandomDOB = (): string => {
  const today = new Date();
  const minAge = 18;
  const maxAge = 65;
  const ageRange = maxAge - minAge;
  
  const randomAge = Math.floor(Math.random() * ageRange) + minAge;
  const birthYear = today.getFullYear() - randomAge;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
  const birthDay = Math.floor(Math.random() * daysInMonth) + 1;
  
  return `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
};
```

**i18n Keys:**
```json
{
  "onboarding.dob.randomize": "Randomize",
  "settings.profile.dob.randomize": "Randomize"
}
```

---

### 2. Race Day Alert Popup

**Files Affected:**
- `src/features/home/home-screen.tsx` (or create new `src/components/alerts/race-day-alert.tsx`)
- `src/store/timeline-store.ts` (check for scheduled races)
- `src/i18n/translations/*.json`

**Current State:**
- No notification when race day arrives
- Player must check schedule manually

**Target State:**
- Alert popup appears on home screen when race starts today
- Auto-closes after 5 seconds
- Closable by user click/tap
- Shows race title and distance
- Only shows once per race day (use localStorage flag)

**Implementation Notes:**
```typescript
// Race day check logic
const checkRaceToday = () => {
  const { gameState } = useTimelineStore.getState();
  const scheduledRaces = gameState?.scheduledRaces || [];
  const todayIndex = gameState?.dayIndex || 0;
  
  const racesToday = scheduledRaces.filter(r => r.dayIndex === todayIndex);
  
  if (racesToday.length > 0) {
    const alertKey = `race_alert_shown_${todayIndex}`;
    const hasShown = localStorage.getItem(alertKey);
    
    if (!hasShown) {
      showRaceAlert(racesToday[0]);
      localStorage.setItem(alertKey, 'true');
    }
  }
};
```

**Alert Component Structure:**
```tsx
<RaceDayAlert
  isOpen={showAlert}
  onClose={() => setShowAlert(false)}
  raceTitle={race.title}
  raceDistance={race.distance}
  autoCloseDelay={5000}
/>
```

**i18n Keys:**
```json
{
  "alert.race_today.title": "Race Day!",
  "alert.race_today.message": "Your race starts today: {{title}} ({{distance}}km)",
  "alert.race_today.button": "Let's Go!",
  "alert.race_today.dismiss": "Dismiss"
}
```

---

### 3. EP Deduction Timing Fix

**Files Affected:**
- `src/features/race/race-entry-screen.tsx` (remove EP deduction)
- `src/features/preparation/preparation-screen.tsx` (add EP deduction on ready)
- `src/store/player-store.ts` or relevant energy point store

**Current State:**
- EP deducted when "Start Race" button clicked on race entry
- Player can back out after EP spent but before race simulation

**Target State:**
- EP deducted only when "Ready" clicked on preparation screen
- Race entry screen becomes informational only
- No EP loss if player backs out of preparation

**Implementation Notes:**

**Remove from race-entry-screen.tsx:**
```typescript
// DELETE or comment out:
// const handleStartRace = () => {
//   deductEnergyPoints(raceCost);
//   router.push('/preparation');
// };
```

**Add to preparation-screen.tsx:**
```typescript
const handleReady = () => {
  // Deduct EP here before starting race
  const epCost = calculateRaceEPCost(challenge);
  
  if (playerEP < epCost) {
    showError("Not enough Energy Points!");
    return;
  }
  
  deductEnergyPoints(epCost);
  router.push('/race');
};
```

**Validation:**
- Show EP cost preview on preparation screen header
- Disable "Ready" button if insufficient EP
- Add confirmation dialog: "This will cost X EP. Continue?"

---

### 4. Story Highlights Refactor

**Files Affected:**
- `src/features/result/result-screen.tsx` (lines 674-723)
- `src/engine/story/story-builder.ts` (highlight generation logic)
- `src/components/share/share-card-renderer.tsx`
- `src/i18n/translations/*.json`

**Current State:**
- All highlights expanded by default
- Every highlight has a share button
- Can be overwhelming with many highlights

**Target State:**
- Highlights section collapsed by default
- Expandable/collapsible section
- Share button only on significant highlights (e.g., synergies, critical decisions, key events)
- Remove share from tactical style and minor events

**Implementation Notes:**

**Collapsible Section:**
```tsx
const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(false);

<div className="flex flex-col gap-3">
  <button
    onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
    className="flex items-center justify-between w-full text-left"
  >
    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
      {t("challenge.result.story_headline")} ({story.highlights.length})
    </h3>
    <ChevronDown 
      className={`h-4 w-4 transition-transform ${isHighlightsExpanded ? 'rotate-180' : ''}`}
    />
  </button>
  
  {isHighlightsExpanded && (
    <ul className="flex flex-col gap-2.5">
      {story.highlights.map((h, idx) => {
        const isShareable = determineIfShareable(h, idx);
        // ... rest of highlight rendering
      })}
    </ul>
  )}
</div>
```

**Shareable Logic:**
```typescript
const determineIfShareable = (highlight: LocalizedText, index: number): boolean => {
  const text = highlight.en;
  
  // Shareable: Synergies, key km events, breaking points
  if (text.includes('SYNERGY UNLOCKED')) return true;
  if (text.includes('At km ') && text.includes(':')) return true;
  if (text.includes('Breaking Point') || text.includes('Desperation')) return true;
  
  // Not shareable: Tactical style summaries, generic statements
  if (text.includes('Tactical style:')) return false;
  if (text.includes('Carbon Racer shoes gave')) return false;
  
  return false; // Default to not shareable
};
```

**i18n Updates:**
```json
{
  "challenge.result.highlights_collapsed": "Show {{count}} Highlights",
  "challenge.result.highlights_expanded": "Hide Highlights"
}
```

---

### 5. Expand Ghost Rival Pool (10+ Runners)

**Files Affected:**
- `src/features/race/race-screen.tsx` (lines 491-571 - runner list generation)
- `src/features/result/result-screen.tsx` (lines 323-354 - leaderboard)
- `src/engine/simulation/opponent-generator.ts` (new file or expand existing)
- `src/config/ghost-runners.ts` (new file)

**Current State:**
- 2-4 ghost opponents per race
- Limited competitive depth
- Predictable leaderboard

**Target State:**
- 10+ ghost runners in every race
- Varied skill levels (some faster, some slower than player)
- Diverse names and realistic performance
- Better sense of competition

**Implementation Notes:**

**Create Ghost Pool Config:**
```typescript
// src/config/ghost-runners.ts
export const GHOST_RUNNER_POOL = [
  // Elite Runners (Top 10%)
  { name: "Marcus 'The Machine' Rivera", skillMultiplier: 1.15, consistency: 0.95 },
  { name: "Ellie 'Lightning' Park", skillMultiplier: 1.12, consistency: 0.92 },
  { name: "Kenji 'Silent Storm' Nakamura", skillMultiplier: 1.10, consistency: 0.90 },
  
  // Strong Runners (Top 25%)
  { name: "Sarah 'Ironheart' Chen", skillMultiplier: 1.05, consistency: 0.88 },
  { name: "Alex 'The Natural' Santos", skillMultiplier: 1.04, consistency: 0.85 },
  { name: "Maria 'Momentum' Gonzalez", skillMultiplier: 1.03, consistency: 0.87 },
  
  // Mid-Pack Runners (50%)
  { name: "Jordan 'Steady' Thompson", skillMultiplier: 1.00, consistency: 0.80 },
  { name: "Casey 'Grinder' Williams", skillMultiplier: 0.98, consistency: 0.82 },
  { name: "Taylor 'Pacer' Anderson", skillMultiplier: 0.97, consistency: 0.85 },
  { name: "Riley 'Endurance' Martinez", skillMultiplier: 0.96, consistency: 0.78 },
  
  // Back-of-Pack (Bottom 25%)
  { name: "Jamie 'Rookie' Lee", skillMultiplier: 0.90, consistency: 0.70 },
  { name: "Morgan 'Learner' Davis", skillMultiplier: 0.88, consistency: 0.68 },
  { name: "Sam 'Newbie' Rodriguez", skillMultiplier: 0.85, consistency: 0.65 },
];

export const generateRaceField = (playerSkillLevel: number, count: number = 12) => {
  // Select subset based on player's current ranking
  // Ensure mix of faster/slower opponents
  // Add randomness to performance
};
```

**Opponent Generation Logic:**
```typescript
const generateOpponents = (
  playerProfile: RunnerProfile,
  raceDistance: number,
  count: number = 12
) => {
  const playerSkill = calculatePlayerSkillLevel(playerProfile);
  
  // Select opponents with skill range around player
  const opponents = GHOST_RUNNER_POOL
    .map(ghost => ({
      ...ghost,
      // Add race-day variance
      raceMultiplier: ghost.skillMultiplier * (0.95 + Math.random() * 0.1),
    }))
    .sort(() => Math.random() - 0.5) // Shuffle
    .slice(0, count);
  
  return opponents;
};
```

**UI Considerations:**
- Leaderboard should scroll if > 10 runners
- Show top 5 + player position + bottom 3 in compact view
- Full leaderboard in expanded view
- Keep performance optimized (virtualized list if needed)

---

### 6. Refactor Share Components

**Files Affected:**
- `src/components/share/share-card-renderer.tsx`
- `src/components/share/race-report-card.tsx`
- `src/components/share/coach-quote-card.tsx`
- `src/components/share/event-highlight-card.tsx`

**Current State:**
- Basic share card renderer
- Some duplication across card types

**Target State:**
- Unified base component with composition
- Better props typing
- Reusable gradient/decoration system
- Easier to add new card types

**Refactor Structure:**
```typescript
// Base card with common layout
interface ShareCardBaseProps {
  date?: string;
  headerTitle?: string;
  headerIcon?: React.ReactNode;
  footerLeft?: string;
  footerRight?: string;
  children: React.ReactNode;
  variant?: 'race' | 'coach' | 'event' | 'achievement';
}

export const ShareCardBase = forwardRef<HTMLDivElement, ShareCardBaseProps>(
  ({ variant = 'race', ...props }, ref) => {
    const gradients = {
      race: 'from-slate-900 via-indigo-950 to-slate-900',
      coach: 'from-slate-900 via-blue-950 to-slate-900',
      event: 'from-slate-900 via-purple-950 to-slate-900',
      achievement: 'from-slate-900 via-emerald-950 to-slate-900',
    };
    
    return (
      <div
        ref={ref}
        className={`w-[800px] h-[450px] bg-gradient-to-br ${gradients[variant]} ...`}
      >
        {/* Common layout structure */}
      </div>
    );
  }
);
```

---

## 🔄 Implementation Order

1. **Phase 1: Quick Wins** (2-3 hours)
   - Date of Birth randomizer (onboarding + settings)
   - EP deduction timing fix
   - i18n keys for new features

2. **Phase 2: Race Day Experience** (3-4 hours)
   - Race day alert popup component
   - Alert dismissal and auto-close logic
   - localStorage tracking for shown alerts

3. **Phase 3: Story & Sharing** (4-5 hours)
   - Collapsible highlights section
   - Selective share button logic
   - Refactor share components

4. **Phase 4: Ghost Rivals** (5-6 hours)
   - Create ghost runner pool config
   - Opponent generation system
   - Update race and result leaderboards
   - Performance optimization

---

## 🧪 Testing Checklist

### Date of Birth Randomizer
- [ ] Randomize generates valid date in 18-65 age range
- [ ] Works in onboarding screen
- [ ] Works in settings screen
- [ ] Can still manually input date
- [ ] Validation still works correctly

### Race Day Alert
- [ ] Alert shows when race scheduled for today
- [ ] Alert auto-closes after 5 seconds
- [ ] Can manually close alert
- [ ] Only shows once per race day
- [ ] Doesn't show on non-race days
- [ ] Works across app restarts

### EP Deduction
- [ ] EP NOT deducted on race entry screen
- [ ] EP deducted when clicking "Ready" in preparation
- [ ] Can back out of preparation without EP loss
- [ ] EP cost displayed on preparation screen
- [ ] "Ready" button disabled if insufficient EP
- [ ] Confirmation dialog works correctly

### Story Highlights
- [ ] Highlights collapsed by default
- [ ] Expand/collapse animation smooth
- [ ] Share button only on key highlights
- [ ] No share on tactical summaries
- [ ] Collapsible header shows count
- [ ] Icon rotates on expand/collapse

### Ghost Rivals
- [ ] At least 10 ghost runners per race
- [ ] Mix of faster/slower opponents
- [ ] Realistic performance variation
- [ ] Leaderboard shows all opponents
- [ ] Leaderboard scrollable if needed
- [ ] Performance remains smooth
- [ ] Ghost runner names consistent

### Share Components
- [ ] All existing share cards still work
- [ ] No visual regressions
- [ ] Props properly typed
- [ ] Easy to add new card types

---

## 📊 Acceptance Criteria

### Must Have
- ✅ DOB randomizer in onboarding and settings
- ✅ Race day alert popup (auto-dismissible)
- ✅ EP deduction moved to preparation ready
- ✅ Highlights collapsible by default
- ✅ 10+ ghost runners in races

### Should Have
- ✅ Selective share buttons (not all highlights)
- ✅ Share component refactoring
- ✅ EP confirmation dialog
- ✅ Alert shown only once per race day

### Nice to Have
- 🔲 Ghost runner personality traits
- 🔲 Rival history tracking across races
- 🔲 Customizable alert sound
- 🔲 More share card variants

---

## 🐛 Known Issues to Address

1. **Date Picker Cross-browser**
   - Ensure DOB randomizer works on all browsers
   - Test mobile date picker compatibility

2. **Alert Z-index**
   - Ensure race day alert appears above all content
   - Test with modals/overlays open

3. **Leaderboard Scroll**
   - Optimize rendering for 10+ runners
   - Consider virtual scrolling for 20+ runners

4. **EP State Sync**
   - Ensure EP deduction doesn't cause race conditions
   - Verify EP updates persist correctly

---

## 📝 Migration Notes

### Breaking Changes
None expected - all changes are additive or internal timing adjustments.

### Data Migration
None required - no schema changes.

### Rollback Plan
- DOB randomizer: Can be disabled via feature flag
- Race alert: LocalStorage can be cleared
- EP timing: Can revert to old flow
- Ghost rivals: Can reduce count to previous level

---

## 🎨 UI/UX Mockup References

### Race Day Alert Mockup
```
┌─────────────────────────────────────┐
│  🏃 Race Day!                    ✕  │
│                                      │
│  Your race starts today:             │
│  Mountain Trail Challenge (10km)     │
│                                      │
│  [ Let's Go! ]  [ Dismiss ]          │
│                                      │
│  Auto-closing in 5s...               │
└─────────────────────────────────────┘
```

### Collapsible Highlights
```
┌────────────────────────────────────┐
│ 🌟 Race Highlights (5)          ▼  │  ← Collapsed
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🌟 Race Highlights (5)          ▲  │  ← Expanded
├────────────────────────────────────┤
│ • Synergy unlocked: Trail Master   │ [Share]
│ • At km 3: Steep climb...          │ [Share]
│ • Tactical style: Aggressive       │
│ • Breaking Point at km 7           │ [Share]
│ • Carbon Racer shoes provided...   │
└────────────────────────────────────┘
```

---

## 🚀 Post-Sprint Follow-up

### Metrics to Track
- Alert engagement rate (closed vs auto-dismissed)
- EP backing-out rate (prep screen exits)
- Highlight expansion rate
- Average player ranking in 12-runner races

### Future Enhancements
- Custom ghost runner creation
- Race replay with highlight bookmarks
- Advanced alert preferences
- Rival relationship system
- Share template customization

---

## 👥 Contributor Notes

### Code Style
- Follow existing TypeScript patterns
- Use Tailwind utility classes
- Maintain i18n coverage
- Add JSDoc comments for new utilities

### Testing
- Unit tests for utility functions
- Component tests for new UI elements
- Integration tests for EP flow
- Manual testing on mobile/desktop

### Documentation
- Update README if adding new utils
- Add inline comments for complex logic
- Update i18n documentation

---

**Sprint Start Date:** TBD  
**Target Completion:** TBD  
**Assignees:** TBD  
**Priority:** Medium-High  
**Status:** 📋 Planning
