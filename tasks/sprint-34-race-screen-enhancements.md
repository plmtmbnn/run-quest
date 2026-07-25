# Sprint 34: Race Screen Addictiveness Enhancements

**Date**: 2026-07-24
**Status**: 📋 Planned
**Priority**: High
**Effort**: 2-3 weeks
**Dependencies**: Sprint 33 (UX Enhancements) ✅ Complete

---

## 🎯 Vision

Make the race screen **irresistibly engaging** by adding layers of real-time feedback, emotional tension, risk/reward mechanics, and social shareability. After this sprint:

- Every kilometer feels rewarding with **pop-up micro-achievements**
- Players see their **predicted finish time** updating live, creating urgency
- The final 500m becomes an **epic sprint mini-game**
- Players can **bet on their own performance** for double-or-nothing stakes
- Rivals feel like **real characters** with story arcs
- Mid-race **dynamic weather** forces adaptation
- Close finishes trigger a **cinematic photo finish**
- Every race generates a **shareable result card**

---

## 🔍 Current State Analysis

| Area | Current State | Gap |
|------|--------------|-----|
| **Feedback** | Stats update per km, no celebratory moments | No dopamine hits mid-race |
| **Pacing** | Manual pacing buttons, no predictive feedback | No "what-if" / finish projection |
| **Finale** | Race just ends at last km, no climax | Final 500m feels same as any other km |
| **Stakes** | Only bragging rights and default rewards | No self-imposed risk/reward |
| **Rivals** | NPCs with names but no personality | No emotional attachment to opponents |
| **Weather** | Static, set at challenge generation | No adaptation required mid-race |
| **Finish** | Instant redirect to /result | No photo finish drama |
| **Sharing** | No sharing capability | Race memories stay local |
| **Audio** | Sound effects only (tick/click/success) | No dynamic music |
| **Post-race** | Basic result screen | No deep split analysis |

---

## 📋 Implementation Tasks

---

### Task 1: Live Pace Projector & Predicted Finish Time

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/pace-projector.tsx` (NEW)
- `src/i18n/translations/*.json`

**Estimate**: 1 day
**Priority**: P1 🚀

#### Subtask 1.1: Pace Projector Component

Create `src/components/race/pace-projector.tsx`:

```tsx
interface PaceProjectorProps {
  currentPace: number;        // seconds per km
  distanceCovered: number;     // current km
  totalDistance: number;       // race distance in km
  accumulatedTime: number;     // seconds elapsed
  targetTime?: number;         // personal best in seconds
  personalBest?: number;       // PB in seconds
  isPaused: boolean;
  simSpeed: 1 | 2 | 5;
}
```

**Display elements:**
- **Current pace** (already exists)
- **Predicted finish time**: `(accumulatedTime / distanceCovered) * totalDistance` — updates every km
- **Target comparison**: Show delta vs personal best with color coding
  - Green: "On track for PB! -12.3s ahead"
  - Red: "-8.5s behind PB — push harder!"
- **Pace needed**: "Need 4:35/km to beat PB"
- **Coach tip text**: Rotating contextual messages
  - "Looking strong — maintain this pace!"
  - "Slow and steady wins the race..."
  - "This is where champions are made — push!"

**Layout position:**
- Add below the circular distance tracker, above the TrackPositionVisualizer
- Use a subtle card with `rounded-[1.5rem]` to match existing style

#### Subtask 1.2: Integration in RaceScreen

Add state for projected finish and PB comparison:

```typescript
const [projectedFinish, setProjectedFinish] = useState<{
  predictedTime: number;  // seconds
  deltaToPB: number | null;  // seconds, negative = ahead
  paceNeeded: number | null; // seconds per km to beat PB
} | null>(null);
```

Update projection every time `currentKm` increments (inside the ticker `useEffect`):

```typescript
// Inside the ticker advance block, after reading snapshot
if (snapshot && snapshot.distanceCovered > 0) {
  const avgPace = snapshot.accumulatedTime / snapshot.distanceCovered;
  const predicted = avgPace * challenge.race.distance;
  const pb = runnerState.profile.personalBests?.[challenge.race.distance];
  setProjectedFinish({
    predictedTime: predicted,
    deltaToPB: pb ? predicted - pb : null,
    paceNeeded: pb ? (pb - snapshot.accumulatedTime) / (challenge.race.distance - snapshot.distanceCovered) : null,
  });
}
```

#### Subtask 1.3: Visual Treatment

- Use `motion` for smooth number transitions
- Animate PB delta with color fade (green ↔ red)
- Add a subtle shimmer effect when prediction improves

**Definition of Done:**
- ✅ Pace projector visible during race
- ✅ Predicted finish updates every km
- ✅ PB comparison with color coding
- ✅ Contextual coach tip text
- ✅ No performance degradation

---

### Task 2: During-Race Micro-Achievements (Pop-up Badges)

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/micro-achievement-popup.tsx` (NEW)
- `src/engine/achievements/race-achievements.ts` (NEW)
- `src/i18n/translations/*.json`

**Estimate**: 1.5 days
**Priority**: P1 🚀

#### Subtask 2.1: Achievement Detection Engine

Create `src/engine/achievements/race-achievements.ts`:

```typescript
interface RaceAchievement {
  id: string;
  title: { en: string; id: string };
  description: { en: string; id: string };
  icon: string;  // emoji
  condition: (snapshot: Omit<SimulationState, "accumulatedStateLog">, prevSnapshot: Omit<SimulationState, "accumulatedStateLog"> | null, context: AchievementContext) => boolean;
}

interface AchievementContext {
  km: number;
  totalDistance: number;
  playerPosition: number;
  totalRunners: number;
  isFirstTime: boolean;  // first time achieving this
}
```

**Achievement triggers:**

| ID | Icon | Title (EN) | Condition |
|----|------|------------|-----------|
| `fastest_km` | 🏅 | "Fastest Kilometer!" | Current km pace < any previous km pace |
| `overtake_leader` | 👑 | "Took the Lead!" | Position changed from 2+ to 1 |
| `overtake_rival` | ⚔️ | "Rival Down!" | Overtook a specific rival NPC |
| `halfway_there` | ⏱️ | "Halfway There!" | `currentKm >= totalDistance / 2` |
| `energy_crisis` | ⚡ | "Running on Empty!" | Energy dropped below 15% |
| `clutch_gel` | 🧪 | "Clutch Consumption!" | Used consumable when energy < 20% |
| `negative_split` | 📈 | "Negative Split!" | Second half avg pace < first half avg pace |
| `comeback_kid` | 🔥 | "Comeback Kid!" | Went from last place to top 3 |
| `sub_pace_target` | 🎯 | "On Target!" | Current pace within 2% of goal pace |
| `perfect_stability` | 🎯 | "Smooth Operator!" | Pace stability > 90% for 5+ consecutive km |
| `dnf_escape` | 💀 | "Dodged a Bullet!" | Finished with energy < 5% |
| `century_km` | 💯 | "Double Digits!" | Reached 10km in races 10k+ |
| `photo_finish` | 📸 | "Photo Finish!" | Win by < 1 second margin |

#### Subtask 2.2: Popup UI Component

Create `src/components/race/micro-achievement-popup.tsx`:

```tsx
interface MicroAchievementPopupProps {
  achievement: RaceAchievement;
  onComplete: () => void;
}
```

**Behavior:**
- Slide in from right with `motion.div`
- Auto-dismiss after 2.5 seconds
- Stack up to 3 simultaneously (queue-based system)
- Sound effect: short ascending chime (`playSound("achievement")`)
- Scale + glow animation on entry
- If it's the player's *first time* earning this achievement, show a special "🏆 FIRST!" badge

#### Subtask 2.3: Integration in RaceScreen

```typescript
const [achievementQueue, setAchievementQueue] = useState<RaceAchievement[]>([]);
```

Inside the ticker `useEffect`, after reading the snapshot, check conditions:

```typescript
// After dispatching stats update
const newAchievements = checkRaceAchievements(snapshot, prevSnapshot, {
  km: nextKmValue,
  totalDistance: challenge.race.distance,
  playerPosition: currentPlayerPosition,
  totalRunners: runners.length,
  isFirstTime: !earnedAchievements.has(achievementId),
});

if (newAchievements.length > 0) {
  setAchievementQueue(prev => [...prev, ...newAchievements]);
  newAchievements.forEach(a => {
    earnedAchievements.add(a.id);
    trackAchievement(a.id); // persist to storage
  });
}
```

#### Subtask 2.4: Achievement History

- Store earned achievements in `gameState` or dedicated storage key `runquest.achievements.race`
- Show a "Race Achievements" section in the profile screen
- Track counts: "Fastest Kilometer earned 12 times"

**Definition of Done:**
- ✅ 12+ achievement triggers implemented
- ✅ Pop-up animations working with queue
- ✅ Sound effect on each popup
- ✅ Achievements persist across sessions
- ✅ Achievement history viewable in profile

---

### Task 3: Final 500m "Kick" Mini-Game

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/final-kick.tsx` (NEW)
- `src/engine/simulation/engine.ts` (modify final km logic)
- `src/i18n/translations/*.json`

**Estimate**: 2 days
**Priority**: P2 ⚡

#### Subtask 3.1: Detect Final 500m Phase

In `race-screen.tsx`, add a flag:

```typescript
const [isFinalKick, setIsFinalKick] = useState(false);
const [kickMetersRemaining, setKickMetersRemaining] = useState(500);
const [kickBoost, setKickBoost] = useState(0); // pace bonus in seconds
```

Trigger when `currentKm >= raceDistance - 0.5` (i.e., within 500m of finish).

#### Subtask 3.2: Final Kick UI Component

Create `src/components/race/final-kick.tsx`:

**Visual elements:**
- **Full-width banner** at the bottom of the race content area
- **"FINAL KICK"** text with pulsing glow animation
- **Meters remaining** countdown: "450m... 300m... 100m... 50m..."
- **Timing tap zone**: A button that reads "🏃 KICK!" — tapping it within a 0.5s window of the meter marker gives max boost
- **Boost meter**: Visual bar showing accumulated boost (0-100%)
- **Perfect kick indicator**: Green flash when timing is perfect

**Mechanics:**
- Every 100m (5 checkpoints in final 500m), a "KICK!" button appears
- Player must tap within a 0.5s window centered on the checkpoint
- Perfect tap: +0.5s pace bonus (faster)
- Good tap: +0.2s pace bonus
- Miss: no bonus
- If player taps all 5 perfectly: "🔥 PERFECT KICK!" animation

```tsx
interface FinalKickProps {
  distanceRemaining: number;  // meters to finish
  onKick: (timing: "perfect" | "good" | "miss") => void;
  totalBoost: number;  // cumulative seconds saved
  perfectCount: number;
  isPaused: boolean;
}
```

#### Subtask 3.3: Simulation Engine Modification

In `checkpoint-loop.ts` or the advance simulation logic:
- When `distanceCovered >= raceDistance - 0.5`:
  - Reduce the step interval to 100m chunks instead of 1km
  - Apply pace bonus from kick timing to the next chunk
  - Log kick events for post-race display

```typescript
// In simulation advance, check if we're in final kick zone
const isFinalPhase = currentDist >= totalDist - 0.5;
if (isFinalPhase) {
  const kickBonus = pendingKickBoost || 0;
  // Apply pace modifier for this segment
  segmentPace = Math.max(segmentPace - kickBonus, minPossiblePace);
}
```

#### Subtask 3.4: Audio & Visual Treatment

- **Music shift**: Drums intensify, high-BPM electronic beat
- **Screen effect**: Subtle vignette darkening at edges
- **Pace display**: Changes color from white → orange → red as meters decrease
- **Crowd sound**: `playSound("crowd_roar")` with increasing volume
- **Finish line visual**: Track visualizer shows finish line approaching

**Definition of Done:**
- ✅ Final 500m triggers special UI mode
- ✅ Timing-based kick button with perfect/good/miss
- ✅ Pace bonus applied to simulation
- ✅ Cumulative boost displayed
- ✅ Perfect 5/5 triggers special celebration
- ✅ Audio treatment for final phase

---

### Task 4: Bet on Yourself (Risk/Reward Mechanic)

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/self-bet-panel.tsx` (NEW)
- `src/store/game-store.ts` (add bet state)
- `src/i18n/translations/*.json`

**Estimate**: 2 days
**Priority**: P2 ⚡

#### Subtask 4.1: Bet Data Model

In `src/components/race/self-bet-panel.tsx` or shared types:

```typescript
interface SelfBet {
  id: string;
  target: "top_3" | "win" | "beat_pb" | "negative_split" | "finish_strong" | "no_dnf";
  wager: number;  // money amount
  multiplier: number;  // e.g. 2x, 3x, 5x, 10x
  status: "pending" | "won" | "lost";
  condition: (result: SimulationResult, challenge: Challenge) => boolean;
}
```

**Bet tiers:**

| Target | Multiplier | Condition |
|--------|-----------|-----------|
| Finish Top 3 | 2x | Player position <= 3 |
| Beat Personal Best | 3x | Finish time < PB for this distance |
| Win the Race | 5x | Player position === 1 |
| Negative Split | 2.5x | Second half faster than first half |
| No DNF | 1.5x | Player does not DNF |
| Perfect Kick | 4x | All 5 kick timings perfect |
| Clean Race | 2x | No breaking point triggered |

#### Subtask 4.2: Bet Placement UI (Pre-Race or Early Race)

Show a collapsible panel **before the race starts** (or within first 2km):

```tsx
<SelfBetPanel
  playerBalance={currentBalance}
  availableBets={availableBets}
  activeBets={activeBets}
  onPlaceBet={(target, wager) => placeBet(target, wager)}
  onCancelBet={(betId) => cancelBet(betId)}
/>
```

**UI Design:**
- Card with gradient border (gold/orange) to differentiate from other panels
- Each bet target shown as a selectable chip
- Slider or input for wager amount (min 50, max = player balance * 0.25)
- Live multiplier display: "Bet 500 → Win 2,500"
- Warning if balance is low: "High risk — only 200 coins remaining!"

#### Subtask 4.3: Live Odds Display During Race

During the race, show a compact live bet status:

```
📈 Your Bets:
  🏆 Win Race      500 → 2,500 🟢 On Track!
  📉 Negative Split 200 → 500   🔴 Behind (need 0:15 faster 2nd half)
```

- Update status every km based on current performance
- Green = on track, Red = at risk, Yellow = too early to tell

#### Subtask 4.4: Bet Settlement on Race End

When race finishes:

```typescript
const settleBets = (result: SimulationResult) => {
  activeBets.forEach(bet => {
    const won = bet.condition(result, challenge);
    if (won) {
      const payout = bet.wager * bet.multiplier;
      useGameStore.getState().addMoney(payout);
      playSound("cash_win");
      showBetResult({ bet, won: true, payout });
    } else {
      // Wager already deducted, no refund
      showBetResult({ bet, won: false, payout: 0 });
    }
  });
};
```

**Bet result popup:**
- Win: Green card with "+2,500 coins!" and coin shower animation
- Loss: Red/gray card with "Better luck next time!" and a "Run it back?" button that re-enters race preparation

#### Subtask 4.5: Balance & Risk Guardrails

- Max 2 concurrent bets per race
- Max wager: 25% of current balance
- Min wager: 50 coins
- Cannot bet if balance < 100
- Cannot bet on race if player has a severe injury

**Definition of Done:**
- ✅ 5+ bet targets available
- ✅ Bet placement UI before race
- ✅ Live odds update during race
- ✅ Bet settlement on finish with animation
- ✅ Balance guardrails enforced
- ✅ Bet history tracked

---

### Task 5: Dynamic Mid-Race Weather System

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/engine/simulation/engine.ts` (add weather transition logic)
- `src/components/race/weather-alert.tsx` (NEW)
- `src/types/engine.ts` (extend Challenge environment)
- `src/i18n/translations/*.json`

**Estimate**: 2 days
**Priority**: P3 📈

#### Subtask 5.1: Weather Transition Events

Extend `RaceEvent` type to support weather changes:

```typescript
interface WeatherTransition {
  type: "weather_change";
  km: number;  // when it happens
  from: WeatherCondition;
  to: WeatherCondition;
  transitionDuration: number;  // km over which it gradually changes
  effect: {
    temperatureDelta: number;  // °C change
    energyCostMultiplier: number;  // e.g. 1.2 = 20% more energy per km
    moraleModifier: number;  // +/- percentage
  };
}
```

**Weather transition table:**

| Transition | Temperature | Energy Cost | Morale | Frequency |
|-----------|-------------|-------------|---------|-----------|
| Clear → Cloudy | -3°C | 0.95x | +5% | Common |
| Clear → Rain | -5°C | 1.15x | -10% | Uncommon |
| Cloudy → Rain | -2°C | 1.15x | -5% | Common |
| Cloudy → Sunny | +4°C | 1.05x | +10% | Uncommon |
| Rain → Storm | -2°C | 1.30x | -15% | Rare |
| Rain → Drizzle | +2°C | 1.05x | +5% | Uncommon |
| Sunny → Cloudy | -4°C | 0.95x | -5% | Uncommon |
| Sunny → Hot | +6°C | 1.20x | -5% | Rare |
| Wind Calm → Headwind | 0°C | 1.15x | -5% | Uncommon |
| Tailwind → Calm | 0°C | 1.00x | +5% | Uncommon |

#### Subtask 5.2: Weather Alert Component

Create `src/components/race/weather-alert.tsx`:

```tsx
interface WeatherAlertProps {
  transition: WeatherTransition;
  onAcknowledge: () => void;
}
```

**Visual:**
- Slides in from top with weather icon (☀️ → 🌧️)
- Shows transition text: "Weather shifting — Rain ahead in 2km!"
- Auto-dismisses after 4 seconds
- Persistent icon in the header showing current weather after transition

#### Subtask 5.3: Generation Logic

When generating a challenge, pre-roll 0-2 weather transitions:

```typescript
// In challenge generator
const possibleTransitions = WEATHER_TRANSITIONS.filter(t => t.from === challenge.environment.weather);
const numTransitions = weightedRandom([0.5, 0.35, 0.15]); // 50% none, 35% one, 15% two
for (let i = 0; i < numTransitions; i++) {
  const transitionKm = randomBetween(0.2, 0.8) * challenge.race.distance;
  transitions.push({
    km: Math.floor(transitionKm),
    ...pickWeighted(possibleTransitions),
  });
}
```

#### Subtask 5.4: Apply Effects to Simulation

In `advanceSimulation`, when passing a weather transition km:
- Modify `state.environment.temperature`
- Apply `energyCostMultiplier` to energy drain calculations for affected km range
- Apply `moraleModifier` to confidence/momentum

**Definition of Done:**
- ✅ Weather transitions generated and stored in challenge
- ✅ Alert popup when weather changes mid-race
- ✅ Temperature and energy cost modifiers applied
- ✅ Visual icon updates in header
- ✅ 10+ transition types possible

---

### Task 6: Rivalry System with Story Arcs

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/engine/rivals/rival-types.ts` (NEW)
- `src/engine/rivals/rival-engine.ts` (NEW)
- `src/components/race/rival-dialog.tsx` (NEW)
- `src/runner/runner-store.ts` (add rival relationship tracking)
- `src/i18n/translations/*.json`

**Estimate**: 3 days
**Priority**: P3 📈

#### Subtask 6.1: Rival Data Model

Create `src/engine/rivals/rival-types.ts`:

```typescript
interface Rival {
  id: string;
  name: string;
  nickName: string;
  personality: "aggressive" | "patient" | "consistent" | "wild_card" | "tactical";
  backstory: { en: string; id: string };
  avatar: string;  // emoji
  runningStyle: {
    startPace: "fast" | "moderate" | "slow";
    midRaceBehavior: "surge" | "steady" | "fade";
    kickStrength: "weak" | "moderate" | "strong";
  };
  skillLevel: number;  // 30-90, determines base pace
  catchphrases: {
    preRace: { en: string; id: string }[];
    duringRace: { en: string; id: string }[];
    postRaceWin: { en: string; id: string }[];
    postRaceLose: { en: string; id: string }[];
  };
  relationship: {
    rivalryLevel: number;  // 0-100, increases with encounters
    winsAgainst: number;
    lossesAgainst: number;
    currentStatus: "neutral" | "friendly" | "rivalry" | "nemesis";
  };
}
```

**Initial rival roster (6 characters):**

| Rival | Personality | Style | Catchphrase (EN) |
|-------|------------|-------|-------------------|
| **Diego "The Bull"** | Aggressive | Fast start, fades late | *"Not bad, rookie... but you'll crack at 30k!"* |
| **Maya "The Shadow"** | Patient | Stays behind, kicks at end | *"You've been running scared all race..."* |
| **Kaito "Old Man"** | Tactical | Smart pacing, experienced | *"Youth is wasted on the young. Watch and learn."* |
| **Sasha "Rocket"** | Wild card | Erratic pace, high risk | *"Rules are for amateurs. I run by feel."* |
| **Chen "The Engine"** | Consistent | Steady, never fades | *"I don't sprint. I don't jog. I just... endure."* |
| **Zara "Queen"** | Tactical | Reads opponents | *"Every runner has a tell. You just showed yours."* |

#### Subtask 6.2: Rival Engine

Create `src/engine/rivals/rival-engine.ts`:

```typescript
// Select rival for a race based on player skill level, history, and randomness
function selectRivalForRace(playerSkill: number, raceDistance: number, previousRivals: RivalRelationship[]): Rival;

// Generate dialog based on race context
function generateRivalDialog(
  rival: Rival,
  context: "pre_race" | "overtake_player" | "overtaken_by_player" | "post_race",
  playerPosition: number,
  km: number,
): string;

// Update relationship after race
function updateRivalRelationship(
  rival: Rival,
  playerFinishedAhead: boolean,
  margin: number,
): RivalRelationship;
```

#### Subtask 6.3: Rival Dialog UI

Create `src/components/race/rival-dialog.tsx`:

```tsx
interface RivalDialogProps {
  rival: Rival;
  text: string;
  context: "pre_race" | "overtake_player" | "overtaken_by_player";
  onDismiss: () => void;
}
```

**Visual:**
- Small speech bubble at the side of the leaderboard
- Shows rival avatar (emoji) + name + dialog
- Fades in with 3-second auto-dismiss
- During overtake: dialog pops up with larger emphasis
- Pre-race: show rival lineup with brief intro

#### Subtask 6.4: Relationship Progression

- Rivalry level increases by:
  - Racing against same rival: +10 per encounter
  - Beating a rival: +15
  - Losing to a rival: +5 (respect)
  - Close finish (< 5 sec): +10 extra
- At rivalry level thresholds:
  - **20**: Rival acknowledges you by name
  - **40**: Rival trash talk intensifies (nemesis tier)
  - **60**: Rival shows respect after race
  - **80**: Rival becomes friendly, offers tips
  - **100**: Rival becomes a training partner (unlock special training session)

#### Subtask 6.5: Integration in RaceScreen

- Before race starts, show "Today's Rivals" panel for 3 seconds
- When overtaking or being overtaken, trigger dialog popup
- Post-race, show "Rival Status Update" card

**Definition of Done:**
- ✅ 6 rival characters with distinct personalities
- ✅ Rival dialog triggers during race
- ✅ Relationship tracking across sessions
- ✅ Rivalry level progression with milestones
- ✅ Pre-race rival introduction

---

### Task 7: Photo Finish & Shareable Result Cards

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/photo-finish.tsx` (NEW)
- `src/components/race/result-card-generator.tsx` (NEW)
- `src/i18n/translations/*.json`

**Estimate**: 1.5 days
**Priority**: P3 📈

#### Subtask 7.1: Photo Finish Detection

Detect when race ends with a close margin:

```typescript
const isPhotoFinish = (result: SimulationResult): boolean => {
  if (!result.finalStandings || result.finalStandings.length < 2) return false;
  const winner = result.finalStandings[0];
  const second = result.finalStandings[1];
  return Math.abs(winner.accumulatedTime - second.accumulatedTime) < 1.0; // < 1 second
};
```

#### Subtask 7.2: Photo Finish Animation

Create `src/components/race/photo-finish.tsx`:

**Visual:**
- Full-screen overlay triggered when race ends and `isPhotoFinish`
- **Slow-motion effect**: Scale down ticker speed by 10x for the last 0.5 seconds
- **Split-screen**: Show player on left, closest opponent on right
- **Finish line**: Vertical line sweeping across both screens
- **Winner text**: "🏆 WINNER" with scale animation at the end
- **Margin display**: "by 0.3s!" with dramatic reveal
- **Replay button**: "Watch Again" replays the last 5 seconds

**Audio:**
- Crowd roar building up
- Slow-motion "whoosh" sound
- Bell ring on winner determination

#### Subtask 7.3: Shareable Result Card Generator

Create `src/components/race/result-card-generator.tsx`:

**Card layout (screenshot-ready):**
```
┌──────────────────────────────────────┐
│         🏃 RUN QUEST                 │
│                                      │
│   🏆 RACE COMPLETE                   │
│                                      │
│   {challenge.race.title[lang]}       │
│   {challenge.race.distance}km • {weather} │
│                                      │
│   ⏱️ {formattedFinishTime}           │
│   📍 Position {pos}/{total}          │
│                                      │
│   {medal emoji} {achievement badge}  │
│                                      │
│   PB: {+/- delta}                   │
│   Bets Won: {count} (+{amount})     │
│                                      │
│   #RunQuest #{hashtag}               │
└──────────────────────────────────────┘
```

**Functionality:**
- Generate via HTML canvas or `html-to-image` library
- Include top 3 standings
- Show any achievements earned during the race
- Show bet results
- "Download" and "Copy to Clipboard" buttons
- One-click button after race ends

#### Subtask 7.4: Integration

After race finishes and before redirect:

```typescript
if (isPhotoFinish(simResult)) {
  // Show photo finish for 3 seconds
  setIsPhotoFinishMode(true);
  await delay(3000);
  setIsPhotoFinishMode(false);
}

// Then show result card
setShowResultCard(true);
```

**Definition of Done:**
- ✅ Photo finish animation for < 1 second margin
- ✅ Result card generated as visual element
- ✅ Download and copy functionality
- ✅ Social sharing format ready

---

### Task 8: Ghost Runner with Lap Split Comparison

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/features/race/components/ghost-split-comparison.tsx` (NEW)
- `src/store/game-store.ts` (enhance ghost storage)

**Estimate**: 1.5 days
**Priority**: P3 📈

#### Subtask 8.1: Split Comparison Data

Store split data per race in ghost storage:

```typescript
interface GhostSplitData {
  ghostId: string;
  ghostName: string;
  raceDistance: number;
  splits: { km: number; splitTime: number; accumulatedTime: number }[];
  finishTime: number;
  paceHistory: number[];  // pace per km
}
```

#### Subtask 8.2: Split Comparison UI

Create `src/features/race/components/ghost-split-comparison.tsx`:

**Display elements:**
- **Delta indicator** next to pace display: "+2.3s vs Ghost" (green/red)
- **Split comparison table** accessible from a toggle button:
  ```
  Km | You    | Ghost  | Delta
  1  | 4:52   | 4:48   | +4.0s
  2  | 4:50   | 4:51   | -1.0s ✓
  3  | 4:55   | 4:49   | +6.0s
  ```
- **Visual pace graph**: Mini sparkline comparing your pace vs ghost pace per km

#### Subtask 8.3: Integration

- Show ghost comparison panel below the leaderboard (collapsible)
- If multiple ghosts available, let player select which ghost to compare against
- Auto-select the closest matching ghost (same distance, similar skill)

**Definition of Done:**
- ✅ Split comparison data stored with ghosts
- ✅ Live delta display during race
- ✅ Split comparison table with toggle
- ✅ Pace sparkline visualization

---

### Task 9: Adaptive Soundtrack System

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/hooks/use-adaptive-music.ts` (NEW)
- `src/audio/race-tracks.ts` (NEW)

**Estimate**: 2 days
**Priority**: P3 📈

#### Subtask 9.1: Music Track Definitions

Create `src/audio/race-tracks.ts`:

```typescript
interface RaceMusicTrack {
  id: string;
  name: string;
  phase: "start" | "mid_race" | "final_kick" | "crisis" | "victory";
  bpm: number;
  // Audio files to be added later; for now, use Web Audio API synthesis
  synthParams: {
    baseFrequency: number;
    rhythmPattern: "steady" | "accelerating" | "intense" | "minimal";
    intensity: number;  // 0-1
  };
}
```

#### Subtask 9.2: Adaptive Music Hook

Create `src/hooks/use-adaptive-music.ts`:

```typescript
function useAdaptiveMusic(racePhase: RacePhase, stats: LiveStats) {
  // Based on phase and stats, determine which track parameters to use
  // Use Web Audio API for procedural generation (no audio file dependencies)
  // Gradually transition between phases
}
```

**Phase transitions:**
- Start (0-20%): Calm, ambient, 90-100 BPM
- Mid-race (20-70%): Steady rhythm, 100-120 BPM
- Final kick (70-100%): High intensity, 130-150 BPM
- Crisis (breaking point/desperation): Minimal, heartbeat-like, 60-80 BPM
- Victory: Triumphant swell, 120 BPM

#### Subtask 9.3: Sound Effect Enhancements

- Add crowd ambiance layer (low volume, builds toward finish)
- Add heartbeat sound when energy < 20%
- Add wind whoosh when sprinting
- Add bell chime at each 5km milestone

**Definition of Done:**
- ✅ 5 music phases with smooth transitions
- ✅ Web Audio API procedural generation
- ✅ No external audio file dependencies
- ✅ Heartbeat effect at low energy

---

### Task 10: Virtual Crowd & Atmosphere System

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/crowd-atmosphere.tsx` (NEW)
- `src/hooks/use-crowd-noise.ts` (NEW)

**Estimate**: 1.5 days
**Priority**: P3 📈

#### Subtask 10.1: Crowd Intensity Engine

```typescript
interface CrowdState {
  intensity: number;  // 0-100
  dominantMood: "supportive" | "excited" | "tense" | "celebratory";
  density: number;  // 0-100, increases near finish
}
```

**Intensity triggers:**
- Player overtakes opponent: +15
- Player enters final 1km: +30
- Player uses sprint: +10
- Player enters breaking point: -10 (crowd goes quiet)
- Finish: +50
- Player is in last place: +5 (underdog support)

#### Subtask 10.2: Crowd UI Component

Create `src/components/race/crowd-atmosphere.tsx`:

**Visual elements:**
- **Crowd meter**: Horizontal bar at the top of the track visualizer
- **Crowd density dots**: Small dots at the edges of the screen that increase near finish
- **Emoji reactions**: Occasional crowd reaction emoji floating up: "🔥", "👏", "🏃"
- **Cheer burst**: When intensity > 80, show burst of emojis
- **Underdog bonus**: If player is 3+ and overtakes, extra boost animation

**Audio hook `useCrowdNoise.ts`:**
- Generate ambient crowd noise using Web Audio API (filtered noise)
- Increase volume proportionally to crowd intensity
- Add specific "cheer" bursts at intensity spikes

**Definition of Done:**
- ✅ Crowd intensity meter visible during race
- ✅ Visual crowd density effect near finish
- ✅ Emoji reaction bursts
- ✅ Underdog boost mechanic
- ✅ Ambient crowd noise

---

### Task 11: Training Flashback Mechanic

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/training-flashback.tsx` (NEW)
- `src/services/training/flashback-service.ts` (NEW)
- `src/i18n/translations/*.json`

**Estimate**: 1.5 days
**Priority**: P3 📈

#### Subtask 11.1: Flashback Service

Create `src/services/training/flashback-service.ts`:

```typescript
interface FlashbackMemory {
  id: string;
  type: "training" | "race" | "coach_advice";
  triggerKm: number;  // when this flashback can appear
  triggerCondition: (state: SimulationState) => boolean;
  message: { en: string; id: string };
  effect: {
    stat: "energy" | "confidence" | "focus" | "momentum";
    boost: number;  // percentage
  };
  icon: string;  // emoji
}
```

**Flashback triggers:**

| Trigger Condition | Message (EN) | Effect |
|------------------|--------------|--------|
| Breaking point triggered | *"Remember those 5 AM long runs... this is what they were for."* | +15% confidence |
| Energy < 20% | *"Your legs remember the hill repeats. Keep pushing."* | +10% energy |
| Being overtaken | *"Coach always said: 'Stay patient, your time will come.'"* | +15% focus |
| Final 2km | *"This is the moment you trained for. Empty the tank."* | +20% momentum |
| After consumable use | *"Good habit — your body knows what to do."* | +10% all stats |
| Overtaking a rival | *"All those sprint intervals... worth it."* | +10% confidence |

#### Subtask 11.2: Flashback UI Component

Create `src/components/race/training-flashback.tsx`:

```tsx
interface TrainingFlashbackProps {
  memory: FlashbackMemory;
  onComplete: () => void;
}
```

**Visual:**
- Semi-transparent overlay on the left side of the screen
- Film-grain texture border
- Typewriter-style text reveal
- Soft bell chime on appearance
- Auto-dismiss after 3 seconds
- Cannot overlap with decision moments (queue-based)

**Definition of Done:**
- ✅ 6 flashback triggers with conditions
- ✅ Flashback popup with typewriter text
- ✅ Stat boost applied on flashback
- ✅ No overlap with decision modals

---

### Task 12: Post-Race Detailed Analytics

**Files Affected:**
- `src/features/race/race-screen.tsx`
- `src/components/race/post-race-analytics.tsx` (NEW)
- `src/services/analytics/race-analytics.ts` (NEW)

**Estimate**: 2 days
**Priority**: P3 📈

#### Subtask 12.1: Analytics Service

Create `src/services/analytics/race-analytics.ts`:

```typescript
interface RaceAnalytics {
  splits: { km: number; pace: number; elevation?: number }[];
  bestSplit: { km: number; pace: number };
  worstSplit: { km: number; pace: number };
  averagePace: number;
  paceVariability: number;  // standard deviation
  energyDrainRate: number;  // avg % lost per km
  momentumPeaks: number[];  // km where momentum peaked
  fatigueProgression: { muscle: number[]; mental: number[] };
  consumableUsage: { km: number; item: string }[];
  criticalMoments: { km: number; event: string; impact: string }[];
}
```

#### Subtask 12.2: Analytics UI

Create `src/components/race/post-race-analytics.tsx`:

**Tabs/Sections:**

1. **Pace Chart**: Line chart of pace per km with best/worst highlighted
2. **Energy Curve**: Area chart showing energy decline with consumable usage markers
3. **Leaderboard Progression**: Position at each km (step chart)
4. **Fatigue Split**: Stacked bar chart of muscle vs mental fatigue per km
5. **Critical Moments**: Timeline of key events with impact assessment

**"What If" Simulator:**
- *"If you held a steady 4:45/km instead of surging at km 8, you would have finished 23 seconds faster."*
- *"Taking that gel at km 15 instead of km 12 would have prevented the energy crisis at km 18."*

#### Subtask 12.3: Integration

- Show analytics in a collapsible panel on the result screen
- Add a "Deep Dive" button on the `/result` page
- Store last 10 race analytics for comparison

**Definition of Done:**
- ✅ 5 analytics charts/sections implemented
- ✅ "What If" simulator with 2+ scenarios
- ✅ Analytics stored for last 10 races
- ✅ Integration with result screen

---

## 🗺️ Implementation Phasing

### Phase 1 (Week 1) — Quick Wins
| Day | Tasks |
|-----|-------|
| Day 1 | Task 1: Pace Projector |
| Day 2 | Task 2: Micro-achievements |
| Day 3 | Task 2 (cont.) + Task 7: Photo finish |

### Phase 2 (Week 2) — Core Mechanics
| Day | Tasks |
|-----|-------|
| Day 4 | Task 3: Final kick mini-game |
| Day 5 | Task 4: Bet on yourself |
| Day 6 | Task 8: Ghost split comparison |
| Day 7 | Buffer / Bug fixes |

### Phase 3 (Week 3) — Immersion & Depth
| Day | Tasks |
|-----|-------|
| Day 8 | Task 5: Dynamic weather |
| Day 9 | Task 6: Rivalry system |
| Day 10 | Task 9: Adaptive soundtrack |
| Day 11 | Task 10: Virtual crowd |
| Day 12 | Task 11: Training flashback |
| Day 13 | Task 12: Post-race analytics |

---

## 📊 Expected Impact Matrix

| Task | Addictiveness | Engagement | Retention | Dev Effort |
|------|:------------:|:----------:|:---------:|:----------:|
| 1. Pace Projector | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Low |
| 2. Micro-achievements | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Low |
| 3. Final Kick | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium |
| 4. Bet on Yourself | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium |
| 5. Dynamic Weather | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium |
| 6. Rivalry System | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High |
| 7. Photo Finish | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Low |
| 8. Ghost Splits | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Low |
| 9. Adaptive Soundtrack | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Medium |
| 10. Virtual Crowd | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Medium |
| 11. Training Flashback | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Low |
| 12. Post-race Analytics | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium |

---

## 🧪 Success Metrics

| Metric | Current Baseline | Target After Sprint |
|--------|:-:|:-:|
| Race completion rate | ~75% | >90% |
| Re-race rate (same distance) | ~20% | >40% |
| Average race screen dwell time | ~45s | >90s |
| Player "one more race" conversion | ~30% | >55% |
| Social shares per race | N/A | >15% of races |

---

## ⚠️ Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|:---------:|:------:|-----------|
| Feature bloat slows performance | Medium | High | Lazy loading for heavy components; memoization |
| Bet system imbalance | High | Medium | Conservative multipliers initially; data-driven tuning |
| Audio system complexity | Medium | Low | Use Web Audio API (no file dependencies); graceful fallback |
| Rival system scope creep | High | Medium | Start with 3 rivals; expand after validation |
| Photo finish requires timing precision | Low | Medium | Use existing simulation timestamps; no real-time clock needed |
| Mobile layout breakage | Medium | High | Responsive design for all new components |



---

## 📝 Appendix: New i18n Keys

Comprehensive list of all translation keys needed:

```json
{
  "race.pace_projector.title": "Finish Projection",
  "race.pace_projector.predicted": "Predicted Finish",
  "race.pace_projector.ahead_pb": "Ahead of PB",
  "race.pace_projector.behind_pb": "Behind PB",
  "race.pace_projector.pace_needed": "Pace Needed",
  "race.pace_projector.coach_tip": "Coach Tip",

  "race.achievement.fastest_km": "Fastest Kilometer!",
  "race.achievement.overtake_leader": "Took the Lead!",
  "race.achievement.overtake_rival": "Rival Down!",
  "race.achievement.halfway": "Halfway There!",
  "race.achievement.energy_crisis": "Running on Empty!",
  "race.achievement.clutch_gel": "Clutch Consumption!",
  "race.achievement.negative_split": "Negative Split!",
  "race.achievement.comeback": "Comeback Kid!",
  "race.achievement.on_target": "On Target!",
  "race.achievement.smooth_operator": "Smooth Operator!",
  "race.achievement.dnf_escape": "Dodged a Bullet!",
  "race.achievement.photo_finish": "Photo Finish!",

  "race.final_kick.title": "FINAL KICK!",
  "race.final_kick.kick_button": "KICK!",
  "race.final_kick.perfect": "PERFECT!",
  "race.final_kick.good": "Good!",
  "race.final_kick.miss": "Miss!",
  "race.final_kick.perfect_all": "🔥 PERFECT KICK! All 5 checkpoints!",
  "race.final_kick.meters_remaining": "m remaining",

  "race.bet.title": "Bet on Yourself",
  "race.bet.target_top3": "Finish Top 3",
  "race.bet.target_win": "Win the Race",
  "race.bet.target_pb": "Beat Personal Best",
  "race.bet.target_negative_split": "Negative Split",
  "race.bet.target_no_dnf": "No DNF",
  "race.bet.wager": "Wager",
  "race.bet.payout": "Payout",
  "race.bet.place": "Place Bet",
  "race.bet.cancel": "Cancel",
  "race.bet.won": "Bet Won!",
  "race.bet.lost": "Bet Lost",
  "race.bet.run_it_back": "Run it Back?",

  "race.weather.cloudy": "Cloudy",
  "race.weather.rain": "Rain",
  "race.weather.storm": "Storm",
  "race.weather.hot": "Hot",
  "race.weather.headwind": "Headwind",
  "race.weather.tailwind": "Tailwind",
  "race.weather.transition_to": "Weather shifting to {weather} in {km}km",

  "race.rival.pre_race": "Today's Challengers",
  "race.rival.overtake_them": "You overtook {rival}!",
  "race.rival.overtaken": "{rival} overtook you!",
  "race.rival.post_race_win": "Victory over {rival}!",
  "race.rival.post_race_lose": "{rival} got you this time.",
  "race.rival.relationship_up": "Rivalry Intensified!",

  "race.photo_finish.title": "PHOTO FINISH!",
  "race.photo_finish.winner": "WINNER",
  "race.photo_finish.by_margin": "by {seconds}s!",
  "race.photo_finish.replay": "Watch Again",

  "race.ghost_splits.title": "Ghost Comparison",
  "race.ghost_splits.delta": "vs Ghost",
  "race.ghost_splits.ahead": "ahead",
  "race.ghost_splits.behind": "behind",

  "race.flashback.training": "Training Flashback",
  "race.flashback.tip": "Coach Memory",

  "race.analytics.title": "Race Analytics",
  "race.analytics.pace_chart": "Pace Chart",
  "race.analytics.energy_curve": "Energy Curve",
  "race.analytics.position_progression": "Position Progression",
  "race.analytics.fatigue_split": "Fatigue Split",
  "race.analytics.critical_moments": "Critical Moments",
  "race.analytics.what_if": "What If...",
  "race.analytics.best_split": "Best Split",
  "race.analytics.worst_split": "Worst Split"
}
```