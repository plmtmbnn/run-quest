# TASK-005: Enhanced Live Standings with Top 10 + Bottom 3 + Player Position

## Priority: MEDIUM
## Sprint: 41
## Estimated Effort: 3-4 hours

---

## Problem Statement

The live standings display in both `race-screen.tsx` and `mobile-race-navbar.tsx` currently shows a limited number of runners. For races with many entrants (50-5000 runners), this doesn't provide enough context for players to understand:

1. **Top Competition**: Who's leading the race
2. **Bottom Context**: Who's struggling or DNF'd
3. **Player Position**: Where they stand if not in top positions

### Current Behavior:
Shows approximately 5-10 runners in a simple list, but doesn't intelligently show player position when they're mid-pack.

### Proposed Behavior:
```
🏆 LIVE STANDINGS (Race Position)

Top 10:
1. Sarah Chen         42.1 km  ⚡ YOU
2. Marcus Rodriguez   42.0 km
3. Emily Watson       41.9 km
...
10. David Kim         41.2 km

           ... (142 runners) ...

47. YOU               38.5 km  ← Your current position
48. Anna Kowalski     38.4 km
49. James Thompson    38.3 km

           ... (89 runners) ...

Bottom 3:
148. Maria Silva      32.1 km
149. Ahmed Hassan     DNF (injured)
150. Sophie Dubois    DNF

Total: 150 runners • 2 DNF
```

---

## Design Specification

### Display Logic

#### A. Always Show Sections:
1. **Top 10**: First 10 positions (or fewer if field is small)
2. **Player Context** (if not in Top 10 or Bottom 3):
   - Player's position
   - 1 runner ahead
   - 1 runner behind
3. **Bottom 3**: Last 3 positions (including DNFs)

#### B. Divider Display:
- Show `... (X runners) ...` between sections
- Calculate X dynamically based on gaps

#### C. Edge Cases:
- **Field < 15 runners**: Show all runners, no dividers
- **Player in Top 10**: Don't show separate player context
- **Player in Bottom 3**: Don't show separate player context
- **Player DNF**: Highlight in bottom 3

#### D. Visual Enhancements:
- **Player Row**: Highlighted with distinct background color
- **Top 3**: Gold/Silver/Bronze medal icons (🥇🥈🥉)
- **DNF Runners**: Strikethrough with red color and reason
- **Pace Indicators**: Show if runner is gaining/losing (↗️↘️)

---

## Implementation Plan

### Phase 1: Create Enhanced Standings Component

#### 1.1: Create Standings Display Logic
**File**: `src/components/race/enhanced-standings.tsx` (NEW FILE)

```typescript
/**
 * Enhanced Live Standings Component
 * Shows Top 10, Player Context, and Bottom 3 with intelligent dividers
 */

"use client";

import { Trophy, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface Runner {
  id: string;
  name: string;
  distance: number;
  isPlayer: boolean;
  isDNF: boolean;
  dnfReason?: string;
  pace?: number; // Current pace in seconds per km
  previousDistance?: number; // For calculating momentum
}

interface EnhancedStandingsProps {
  runners: Runner[];
  raceDistance: number;
  showMobileVersion?: boolean; // Compact layout for mobile navbar
}

export function EnhancedStandings({ 
  runners, 
  raceDistance,
  showMobileVersion = false 
}: EnhancedStandingsProps) {
  const { t } = useTranslation();
  
  // Sort runners by distance (descending)
  const sortedRunners = [...runners].sort((a, b) => {
    // DNF runners go to bottom
    if (a.isDNF && !b.isDNF) return 1;
    if (!a.isDNF && b.isDNF) return -1;
    // Otherwise sort by distance
    return b.distance - a.distance;
  });

  const playerIndex = sortedRunners.findIndex(r => r.isPlayer);
  const totalRunners = sortedRunners.length;
  const dnfCount = sortedRunners.filter(r => r.isDNF).length;
  const activeRunners = totalRunners - dnfCount;

  // Determine display sections
  const sections = calculateStandingsSections(
    sortedRunners,
    playerIndex,
    totalRunners
  );

  return (
    <div className={`${showMobileVersion ? 'text-xs' : 'text-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Trophy className={`${showMobileVersion ? 'w-4 h-4' : 'w-5 h-5'} text-amber-500`} />
          <h3 className={`font-heading font-black ${showMobileVersion ? 'text-sm' : 'text-base'} text-slate-800 dark:text-white`}>
            {t("race.live_standings" as TranslationKey)}
          </h3>
        </div>
        <div className={`${showMobileVersion ? 'text-[10px]' : 'text-xs'} font-mono font-bold text-slate-500`}>
          {activeRunners} {t("race.active" as TranslationKey)}
          {dnfCount > 0 && ` • ${dnfCount} DNF`}
        </div>
      </div>

      {/* Top 10 Section */}
      {sections.top10.length > 0 && (
        <div className="mb-2">
          {sections.top10.map((runner, idx) => (
            <RunnerRow
              key={runner.id}
              runner={runner}
              position={idx + 1}
              raceDistance={raceDistance}
              showMobile={showMobileVersion}
            />
          ))}
        </div>
      )}

      {/* Divider between Top 10 and Player Context */}
      {sections.middleGap1 > 0 && (
        <Divider runnerCount={sections.middleGap1} showMobile={showMobileVersion} />
      )}

      {/* Player Context Section (if not in Top 10 or Bottom 3) */}
      {sections.playerContext.length > 0 && (
        <div className="mb-2">
          {sections.playerContext.map((runner, idx) => {
            const actualPosition = playerIndex + idx; // Calculate actual position
            return (
              <RunnerRow
                key={runner.id}
                runner={runner}
                position={actualPosition + 1}
                raceDistance={raceDistance}
                showMobile={showMobileVersion}
              />
            );
          })}
        </div>
      )}

      {/* Divider between Player Context and Bottom 3 */}
      {sections.middleGap2 > 0 && (
        <Divider runnerCount={sections.middleGap2} showMobile={showMobileVersion} />
      )}

      {/* Bottom 3 Section */}
      {sections.bottom3.length > 0 && (
        <div>
          {sections.bottom3.map((runner, idx) => {
            const position = totalRunners - sections.bottom3.length + idx + 1;
            return (
              <RunnerRow
                key={runner.id}
                runner={runner}
                position={position}
                raceDistance={raceDistance}
                showMobile={showMobileVersion}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Calculate which runners to show in each section
 */
function calculateStandingsSections(
  sortedRunners: Runner[],
  playerIndex: number,
  totalRunners: number
) {
  const top10Count = Math.min(10, totalRunners);
  const bottom3Count = Math.min(3, totalRunners);
  
  // Edge case: Small field (< 15 runners), show all
  if (totalRunners < 15) {
    return {
      top10: sortedRunners,
      playerContext: [],
      bottom3: [],
      middleGap1: 0,
      middleGap2: 0,
    };
  }

  // Top 10
  const top10 = sortedRunners.slice(0, top10Count);
  
  // Bottom 3
  const bottom3 = sortedRunners.slice(-bottom3Count);
  
  // Player context (if player is between Top 10 and Bottom 3)
  let playerContext: Runner[] = [];
  let middleGap1 = 0;
  let middleGap2 = 0;
  
  const playerInTop10 = playerIndex < top10Count;
  const playerInBottom3 = playerIndex >= totalRunners - bottom3Count;
  
  if (!playerInTop10 && !playerInBottom3) {
    // Show player + 1 ahead + 1 behind
    const contextStart = Math.max(top10Count, playerIndex - 1);
    const contextEnd = Math.min(totalRunners - bottom3Count, playerIndex + 2);
    playerContext = sortedRunners.slice(contextStart, contextEnd);
    
    // Calculate gaps
    middleGap1 = contextStart - top10Count;
    middleGap2 = (totalRunners - bottom3Count) - contextEnd;
  } else {
    // Player is in Top 10 or Bottom 3, calculate single gap
    middleGap1 = totalRunners - top10Count - bottom3Count;
  }

  return {
    top10,
    playerContext,
    bottom3,
    middleGap1,
    middleGap2,
  };
}

/**
 * Individual runner row component
 */
interface RunnerRowProps {
  runner: Runner;
  position: number;
  raceDistance: number;
  showMobile: boolean;
}

function RunnerRow({ runner, position, raceDistance, showMobile }: RunnerRowProps) {
  const progressPercent = (runner.distance / raceDistance) * 100;
  const isMedal = position <= 3 && !runner.isDNF;
  const medalIcons = { 1: "🥇", 2: "🥈", 3: "🥉" };
  
  // Calculate momentum (gaining or losing ground)
  const momentum = calculateMomentum(runner);
  
  return (
    <div
      className={`
        flex items-center justify-between gap-2 py-2 px-3 rounded-lg
        ${runner.isPlayer 
          ? 'bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-600' 
          : 'bg-slate-50 dark:bg-slate-800/50'}
        ${runner.isDNF ? 'opacity-60' : ''}
        ${showMobile ? 'py-1.5 px-2' : ''}
        mb-1
      `}
    >
      {/* Position + Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Position Number or Medal */}
        <span className={`
          ${showMobile ? 'text-[10px] w-5' : 'text-xs w-6'}
          font-mono font-black text-slate-600 dark:text-slate-400 text-right
        `}>
          {isMedal ? medalIcons[position as 1 | 2 | 3] : position}
        </span>
        
        {/* Runner Name */}
        <span className={`
          ${showMobile ? 'text-xs' : 'text-sm'}
          font-semibold truncate
          ${runner.isPlayer ? 'text-indigo-800 dark:text-indigo-200 font-bold' : 'text-slate-700 dark:text-slate-300'}
          ${runner.isDNF ? 'line-through' : ''}
        `}>
          {runner.name}
          {runner.isPlayer && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-bold uppercase rounded">
              You
            </span>
          )}
        </span>
      </div>

      {/* Distance or DNF Reason */}
      <div className="flex items-center gap-2">
        {runner.isDNF ? (
          <div className="flex items-center gap-1">
            <AlertCircle className={`${showMobile ? 'w-3 h-3' : 'w-4 h-4'} text-rose-500`} />
            <span className={`${showMobile ? 'text-[10px]' : 'text-xs'} font-bold text-rose-600 dark:text-rose-400`}>
              DNF
            </span>
            {runner.dnfReason && !showMobile && (
              <span className="text-[10px] text-slate-500">
                ({runner.dnfReason})
              </span>
            )}
          </div>
        ) : (
          <>
            {/* Momentum Indicator */}
            {momentum !== "neutral" && (
              momentum === "gaining" ? (
                <TrendingUp className={`${showMobile ? 'w-3 h-3' : 'w-4 h-4'} text-emerald-500`} />
              ) : (
                <TrendingDown className={`${showMobile ? 'w-3 h-3' : 'w-4 h-4'} text-rose-500`} />
              )
            )}
            
            {/* Distance */}
            <span className={`
              ${showMobile ? 'text-[10px]' : 'text-xs'}
              font-mono font-bold text-slate-800 dark:text-white
            `}>
              {runner.distance.toFixed(1)} km
            </span>
            
            {/* Progress Bar (optional, for desktop) */}
            {!showMobile && (
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Divider showing hidden runner count
 */
function Divider({ runnerCount, showMobile }: { runnerCount: number; showMobile: boolean }) {
  if (runnerCount <= 0) return null;
  
  return (
    <div className={`
      flex items-center justify-center gap-2 my-2
      ${showMobile ? 'text-[10px]' : 'text-xs'}
      text-slate-400 dark:text-slate-600
    `}>
      <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
      <span className="font-mono font-bold">
        ... ({runnerCount} {runnerCount === 1 ? 'runner' : 'runners'}) ...
      </span>
      <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
    </div>
  );
}

/**
 * Calculate runner momentum (gaining/losing/neutral)
 */
function calculateMomentum(runner: Runner): "gaining" | "losing" | "neutral" {
  if (!runner.previousDistance || runner.isDNF) return "neutral";
  
  const distanceGain = runner.distance - runner.previousDistance;
  
  // Threshold: significant if gained/lost more than 0.05 km since last update
  if (distanceGain > 0.05) return "gaining";
  if (distanceGain < -0.05) return "losing";
  return "neutral";
}
```

---

### Phase 2: Integrate into Race Screen

#### 2.1: Update Desktop Race Screen
**File**: `src/features/race/race-screen.tsx`

Replace existing standings with enhanced component:
```typescript
import { EnhancedStandings } from "@/components/race/enhanced-standings";

// In the race screen render, find the current standings display
// Replace it with:
<div className="standings-container">
  <EnhancedStandings
    runners={runnersWithPreviousDistance} // Track previous distance for momentum
    raceDistance={challenge.race.distance}
    showMobileVersion={false}
  />
</div>
```

Add previous distance tracking in simulation state:
```typescript
// Track previous runner distances for momentum calculation
const [previousRunnerDistances, setPreviousRunnerDistances] = useState<Record<string, number>>({});

// In simulation loop, update previous distances
useEffect(() => {
  if (simState) {
    setPreviousRunnerDistances(prev => {
      const updated = { ...prev };
      simState.runners.forEach(r => {
        updated[r.id] = r.distance;
      });
      return updated;
    });
  }
}, [simState?.tick]); // Update on every simulation tick

// Map runners to include previousDistance
const runnersWithPreviousDistance = simState.runners.map(r => ({
  ...r,
  previousDistance: previousRunnerDistances[r.id],
}));
```

#### 2.2: Update Mobile Race Navbar
**File**: `src/components/race/mobile-race-navbar.tsx`

Replace leaderboard section (around lines 60-100):
```typescript
import { EnhancedStandings } from "./enhanced-standings";

// In the leaderboard collapsible section
{activeSection === "leaderboard" && (
  <motion.div
    initial={{ height: 0 }}
    animate={{ height: "auto" }}
    exit={{ height: 0 }}
    className="border-t border-slate-200 dark:border-slate-700 p-3"
  >
    <EnhancedStandings
      runners={runners}
      raceDistance={raceDistance}
      showMobileVersion={true}
    />
  </motion.div>
)}
```

---

### Phase 3: Add Translations

#### 3.1: English Translations
**File**: `src/content/translations/en.json`

```json
{
  "race": {
    "live_standings": "Live Standings",
    "active": "active",
    "dnf": "DNF",
    "you": "YOU",
    "gaining": "Gaining",
    "losing": "Losing",
    "runners": "runners",
    "runner": "runner"
  }
}
```

#### 3.2: Indonesian Translations
**File**: `src/content/translations/id.json`

```json
{
  "race": {
    "live_standings": "Klasemen Langsung",
    "active": "aktif",
    "dnf": "DNF",
    "you": "ANDA",
    "gaining": "Memimpin",
    "losing": "Tertinggal",
    "runners": "pelari",
    "runner": "pelari"
  }
}
```

---

### Phase 4: Styling & Polish

#### 4.1: Add Smooth Animations
```typescript
// In RunnerRow component, add framer-motion
import { motion } from "framer-motion";

<motion.div
  layout
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  transition={{ duration: 0.3 }}
  className="runner-row..."
>
  {/* Runner content */}
</motion.div>
```

#### 4.2: Add Hover States (Desktop Only)
```typescript
<div
  className={`
    runner-row
    hover:bg-slate-100 dark:hover:bg-slate-700/50
    transition-colors cursor-pointer
    ${!showMobile ? 'hover:shadow-md' : ''}
  `}
>
```

---

## Testing Plan

### Unit Tests:
1. ✅ `calculateStandingsSections()` correctly identifies Top 10
2. ✅ Player context shows when player is mid-pack (11-147 in 150-runner field)
3. ✅ Player context doesn't show when player in Top 10
4. ✅ Player context doesn't show when player in Bottom 3
5. ✅ Bottom 3 includes DNF runners
6. ✅ Divider counts are accurate
7. ✅ Small fields (<15) show all runners, no dividers
8. ✅ Momentum calculation works correctly

### Integration Tests:
1. ✅ Enhanced standings render in desktop race screen
2. ✅ Enhanced standings render in mobile navbar
3. ✅ Player row is highlighted
4. ✅ Medal icons appear for Top 3
5. ✅ DNF runners show in bottom section with reason
6. ✅ Momentum indicators appear correctly
7. ✅ Layout doesn't break with 5000-runner field
8. ✅ Translations work for EN/ID

### Visual Tests:
1. ✅ Player row stands out clearly
2. ✅ Dividers are subtle but readable
3. ✅ Mobile version is compact and usable
4. ✅ Dark mode colors look good
5. ✅ Animations are smooth
6. ✅ No layout shifts during race

### Performance Tests:
1. ✅ Renders smoothly with 5000 runners
2. ✅ No lag when updating standings every tick
3. ✅ Section calculation is fast (<5ms)

---

## Files to Modify

### Phase 1: Component Creation
1. `src/components/race/enhanced-standings.tsx` - **NEW FILE** - Enhanced standings component

### Phase 2: Integration
2. `src/features/race/race-screen.tsx` - Integrate enhanced standings (desktop)
3. `src/components/race/mobile-race-navbar.tsx` - Integrate enhanced standings (mobile)

### Phase 3: Translations
4. `src/content/translations/en.json` - English strings
5. `src/content/translations/id.json` - Indonesian strings

---

## Success Criteria

- [ ] Top 10 always visible
- [ ] Bottom 3 always visible
- [ ] Player position visible when mid-pack (with ±1 context)
- [ ] Dividers show correct runner counts
- [ ] Medal icons for Top 3
- [ ] DNF runners highlighted with reason
- [ ] Momentum indicators work (↗️↘️)
- [ ] Player row clearly highlighted
- [ ] Mobile version is compact and readable
- [ ] Smooth animations and transitions
- [ ] No performance issues with large fields
- [ ] Dark mode looks great
- [ ] Translations work correctly

---

## Edge Cases to Handle

1. **Player wins race**: Show in Top 10, no separate context
2. **Player DNFs**: Show in Bottom 3 with DNF badge
3. **Very small field (5 runners)**: Show all, no dividers
4. **Player is exactly 10th**: Should be in Top 10, not context
5. **Player is exactly last**: Should be in Bottom 3
6. **All runners DNF**: Handle gracefully
7. **Tie in positions**: Show in order by runner ID

---

## Future Enhancements

- [ ] Click runner to see their stats/profile
- [ ] Show split times for each runner
- [ ] Add mini-graph of position changes over race
- [ ] Show projected finish times
- [ ] Add "Watch" feature to track specific competitor
- [ ] Show runner avatars/photos
- [ ] Add country flags for international races
- [ ] Show pace differential vs player

---

## Notes

- Keep rendering lightweight—standings update every simulation tick
- Use `React.memo()` to prevent unnecessary re-renders
- Consider virtualizing for extremely large fields (5000+)
- Ensure position calculations are accurate with DNFs
- Test with various field sizes (5, 50, 500, 5000 runners)
- Add loading skeleton while race initializes
