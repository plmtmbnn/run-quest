# Sprint 20: Quick Wins + Rival Foundation

**Duration**: 2 weeks  
**Goal**: Add immediate emotional impact with minimal complexity  
**Epic**: Emotional Core - Phase 1  
**Expected Impact**: 40% of total engagement improvement

---

## 🎯 Sprint Objectives

1. Create named rival system foundation
2. Add coach radio during races
3. Implement victory/defeat cinematics
4. Add career milestone celebrations
5. Display rival positions during races

**Success Metrics**:
- Players can identify rivals by name
- 80% of players notice and react to coach radio
- Victory screen feels celebratory (survey)
- At least 3 milestones trigger celebrations

---

## 📋 Tasks

### Task 1: Create Rival System Foundation
**Estimate**: 3 days  
**Priority**: Critical  
**Dependencies**: None

#### Subtasks:
1. Define rival data types in `src/rivals/rival-types.ts`
   ```typescript
   interface Rival {
     id: string;
     name: string;
     archetype: "endurance" | "speed" | "tactical" | "mental" | "versatile";
     personality: "cocky" | "respectful" | "silent" | "friendly" | "intense";
     baseSpeed: number;
     preRaceQuotes: LocalizedText[];
     postRaceQuotes: { victory: LocalizedText[]; defeat: LocalizedText[] };
   }
   ```

2. Create rival database in `src/rivals/rival-database.ts`
   - 6 named rivals with distinct personalities:
     - Marcus "The Machine" Rivera (endurance, cocky)
     - Ellie "Lightning" Park (speed, friendly)
     - Kenji "Silent Storm" Nakamura (tactical, silent)
     - Sarah "Ironheart" Chen (mental, intense)
     - Alex "The Natural" Santos (versatile, respectful)
     - Maria "Momentum" Gonzalez (speed, cocky)

3. Implement rival selection logic in `src/rivals/rival-selector.ts`
   - Match rivals to race difficulty
   - Ensure variety (don't always face same rival)
   - Track encounter history

4. Extend `RunnerProfile` type in `src/runner/runner-types.ts`
   ```typescript
   interface RunnerProfile {
     // ... existing
     rivalRelationships: {
       [rivalId: string]: {
         wins: number;
         losses: number;
         lastEncounter: string;
       }
     };
   }
   ```

5. Create rival store in `src/rivals/rival-store.ts`
   - Track active rival for current race
   - Update win/loss records
   - Persist rivalry data

**Definition of Done**:
- ✅ 6 named rivals with complete data
- ✅ Rival selection works based on difficulty
- ✅ Rivalry stats persist across races
- ✅ Types compile without errors
- ✅ Unit tests for rival selection logic

---

### Task 2: Implement Coach Radio System
**Estimate**: 2 days  
**Priority**: High  
**Dependencies**: None

#### Subtasks:
1. Create coach radio types in `src/coach/coach-radio-types.ts`
   ```typescript
   interface CoachRadioMessage {
     km: number;
     condition: (state: SimulationState) => boolean;
     message: LocalizedText;
     tone: "encouraging" | "warning" | "excited" | "concerned" | "proud";
   }
   ```

2. Build coach radio message database in `src/coach/coach-radio-messages.ts`
   - 30+ contextual messages based on:
     - Pace vs plan
     - Energy levels
     - Position vs rival
     - Weather conditions
     - Milestone moments (halfway, final km, etc.)

3. Create radio trigger system in `src/coach/coach-radio-engine.ts`
   - Evaluate conditions during race
   - Select appropriate message
   - Prevent spam (max 1 per 2km)
   - Priority system for multiple triggers

4. Add radio UI component in `src/components/race/coach-radio.tsx`
   - Animated slide-in from bottom
   - Coach icon + speech bubble
   - Auto-dismiss after 4 seconds
   - Sound effect (optional)

5. Integrate into race screen `src/features/race/race-screen.tsx`
   - Check for radio triggers each km
   - Display radio component
   - Track shown messages to avoid repeats

6. Add translations to `src/i18n/en.json` and `src/i18n/id.json`

**Definition of Done**:
- ✅ 30+ contextual coach messages
- ✅ Radio appears during race based on conditions
- ✅ Messages are relevant to current situation
- ✅ UI animates smoothly
- ✅ Both English and Indonesian translations
- ✅ Playtest confirms messages feel supportive

---

### Task 3: Create Victory/Defeat Cinematics
**Estimate**: 3 days  
**Priority**: High  
**Dependencies**: None

#### Subtasks:
1. Create cinematic component in `src/components/cinematics/race-outcome-cinematic.tsx`
   - Victory variant (confetti, celebration)
   - Defeat variant (consolation, motivation)
   - Personal best variant (fireworks, milestone)

2. Design victory animations
   - Confetti rain effect (use `react-confetti` or CSS)
   - Trophy icon bounce-in
   - Grade badge shine effect
   - Triumphant color scheme (gold, green)

3. Design defeat animations
   - Subtle grey overlay
   - Consolation message fade-in
   - "Next time" motivational text
   - Revenge race callout

4. Add audio triggers in `src/hooks/use-sound.ts`
   - Victory fanfare
   - Defeat consolation tone
   - Personal best celebration

5. Integrate into result screen `src/features/result/result-screen.tsx`
   - Show cinematic before result details
   - Skip button (after 2 seconds)
   - Remember preference (skip all)

6. Add coach reactions
   - Victory: "I KNEW you had it in you!"
   - Defeat: "We learn more from losses. Let's analyze."
   - Personal best: "You just rewrote your own record!"

**Definition of Done**:
- ✅ Victory cinematic feels celebratory
- ✅ Defeat cinematic feels motivating (not punishing)
- ✅ Personal best triggers special celebration
- ✅ Animations are smooth (60fps)
- ✅ Skip option works after 2 seconds
- ✅ Playtest: Players feel emotional difference

---

### Task 4: Implement Career Milestone System
**Estimate**: 2 days  
**Priority**: Medium  
**Dependencies**: None

#### Subtasks:
1. Define milestone types in `src/progression/milestone-types.ts`
   ```typescript
   interface Milestone {
     id: string;
     name: LocalizedText;
     description: LocalizedText;
     category: "distance" | "speed" | "wins" | "streak" | "level" | "rivalry";
     trigger: (profile: RunnerProfile) => boolean;
     icon: string;
     celebrationText: LocalizedText;
   }
   ```

2. Create milestone database in `src/progression/milestone-database.ts`
   - 20+ milestones:
     - "First Victory"
     - "First Sub-20 5K"
     - "10 Races Completed"
     - "5-Day Streak"
     - "Defeated Marcus"
     - "First Marathon Finish"
     - "100km Lifetime Distance"
     - "Level 10 Achieved"
     - "Perfect Week" (7 days training)

3. Build milestone checker in `src/progression/milestone-checker.ts`
   - Check after race completion
   - Check after training session
   - Return newly achieved milestones

4. Create milestone celebration modal in `src/components/progression/milestone-celebration.tsx`
   - Large icon animation
   - Milestone name and description
   - Reward display (XP, coins, unlock)
   - Share button

5. Integrate milestone checking
   - After race in `src/store/player-store.ts::completeChallenge`
   - After training in `src/training/training-engine.ts::recordTrainingActivity`
   - Show celebration modal

6. Add milestone history to profile
   - Extend `RunnerProfile` with `achievedMilestones: string[]`
   - Display in profile screen

**Definition of Done**:
- ✅ 20+ milestones defined
- ✅ Milestones trigger correctly based on conditions
- ✅ Celebration modal appears and feels special
- ✅ Milestone history visible in profile
- ✅ Both race and training milestones work
- ✅ Playtest: Players notice and appreciate milestones

---

### Task 5: Add Rival Position Updates During Race
**Estimate**: 2 days  
**Priority**: Medium  
**Dependencies**: Task 1 (Rival System)

#### Subtasks:
1. Extend simulation state in `src/types/engine.ts`
   ```typescript
   interface SimulationState {
     // ... existing
     rivalPosition?: {
       name: string;
       distanceAhead: number; // negative if behind
       lastSeenKm: number;
     };
   }
   ```

2. Add rival simulation logic in `src/engine/simulation/engine.ts`
   - Simulate rival pace based on archetype
   - Calculate relative position
   - Update every 2-5km
   - Add some randomness for drama

3. Create rival position component in `src/components/race/rival-position.tsx`
   - "Marcus is 50m ahead"
   - "You passed Ellie!"
   - Color-coded (red=ahead, green=behind)
   - Animated slide-in

4. Add rivalry effect to focus/confidence
   - Seeing rival ahead: +10 focus, +5 confidence
   - Passing rival: +20 confidence, +10 momentum
   - Rival passing you: -10 confidence

5. Integrate into race screen
   - Show rival updates in event feed
   - Highlight rival encounters
   - Play sound effect on rival sighting

**Definition of Done**:
- ✅ Rival position calculated during simulation
- ✅ Position updates appear during race
- ✅ Rival encounters affect stats (focus, confidence)
- ✅ UI clearly shows ahead/behind status
- ✅ Playtest: Players react to rival updates

---

### Task 6: Add Post-Race Rival Commentary
**Estimate**: 1 day  
**Priority**: Low  
**Dependencies**: Task 1 (Rival System)

#### Subtasks:
1. Create rival commentary component in `src/components/result/rival-commentary.tsx`
   - Rival avatar/icon
   - Speech bubble with quote
   - Personality-appropriate styling

2. Build commentary selection logic
   - Victory: Rival's defeat quote
   - Defeat: Rival's victory quote
   - Close race: Special quotes
   - First encounter: Introduction quote

3. Add commentary database to rival profiles
   - 3-5 victory quotes per rival
   - 3-5 defeat quotes per rival
   - Personality-specific tone

4. Integrate into result screen
   - Show after cinematic
   - Before detailed results
   - Builds anticipation for rematch

**Definition of Done**:
- ✅ Rival commentary appears on result screen
- ✅ Quotes match rival personality
- ✅ Different quotes for win/loss
- ✅ Players can identify rival by voice/personality

---

## 🧪 Testing & Validation

### Functional Testing
- [ ] All 6 rivals appear in races
- [ ] Coach radio triggers appropriately
- [ ] Victory cinematic plays on win
- [ ] Defeat cinematic plays on loss
- [ ] Milestones trigger correctly
- [ ] Rival positions update during race
- [ ] Rival commentary matches outcome

### Engagement Testing
- [ ] 10 playtest sessions (5 players, 2 races each)
- [ ] Survey: "Did you notice the coach's encouragement?"
- [ ] Survey: "Did victory feel special?"
- [ ] Survey: "Do you want to beat [rival name] next time?"
- [ ] Observe: Do players smile/react during cinematics?

### Performance Testing
- [ ] Race screen maintains 60fps with radio/rival updates
- [ ] Cinematics don't cause jank
- [ ] Milestone checks don't delay result screen

---

## 📦 Deliverables

### New Files
- `src/rivals/rival-types.ts`
- `src/rivals/rival-database.ts`
- `src/rivals/rival-selector.ts`
- `src/rivals/rival-store.ts`
- `src/coach/coach-radio-types.ts`
- `src/coach/coach-radio-messages.ts`
- `src/coach/coach-radio-engine.ts`
- `src/components/race/coach-radio.tsx`
- `src/components/cinematics/race-outcome-cinematic.tsx`
- `src/progression/milestone-types.ts`
- `src/progression/milestone-database.ts`
- `src/progression/milestone-checker.ts`
- `src/components/progression/milestone-celebration.tsx`
- `src/components/race/rival-position.tsx`
- `src/components/result/rival-commentary.tsx`

### Modified Files
- `src/runner/runner-types.ts` - Add rival relationships
- `src/features/race/race-screen.tsx` - Integrate radio + rival updates
- `src/features/result/result-screen.tsx` - Add cinematics + commentary
- `src/features/profile/profile-screen.tsx` - Show milestone history
- `src/store/player-store.ts` - Track rival records
- `src/types/engine.ts` - Add rival position to simulation
- `src/engine/simulation/engine.ts` - Simulate rival position
- `src/i18n/en.json` - Add translations
- `src/i18n/id.json` - Add translations

### Dependencies to Add
```json
{
  "react-confetti": "^6.1.0"
}
```

---

## 🎯 Definition of Done

### Sprint Complete When:
- ✅ All 6 tasks completed
- ✅ All tests passing
- ✅ Build succeeds without errors
- ✅ Biome checks pass
- ✅ 10 playtest sessions completed
- ✅ Engagement survey shows positive results:
  - >80% noticed coach radio
  - >75% felt victory was special
  - >70% want to beat specific rival
- ✅ Documentation updated
- ✅ Sprint demo completed

### Ready for Sprint 21:
- ✅ Rival system fully functional
- ✅ Players can name at least 3 rivals
- ✅ Victory feels celebratory
- ✅ Coach feels like a character, not a tutorial

---

## 📊 Success Metrics (Baseline vs Target)

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Session Length | ~8 min | ~10 min | Analytics |
| Return Rate | ~40% | ~50% | Next-day logins |
| Race Completion | ~85% | ~90% | Finish vs abandon |
| Share Rate | ~5% | ~10% | Share clicks |
| Emotional Survey | N/A | >75% | "I care about beating [rival]" |

---

## 🔄 Retrospective Questions

After sprint completion:
1. Which feature had the most emotional impact?
2. Did players actually notice the coach radio?
3. Are rival personalities distinct enough?
4. Do victory/defeat cinematics enhance or interrupt flow?
5. Which milestones felt most rewarding?
6. What surprised us about player reactions?

---

**Next Sprint**: Sprint 21 - Emotional Race System (Dramatic events, flashbacks, clutch moments)
