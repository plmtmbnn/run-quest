# Sprint 21: Emotional Race System

**Duration**: 2 weeks  
**Goal**: Add dramatic tension and emotional moments during races  
**Epic**: Emotional Core - Phase 2  
**Expected Impact**: 30% of total engagement improvement

---

## 🎯 Sprint Objectives

1. Implement dramatic race events with story context
2. Add flashback memory system
3. Create clutch moment mechanics
4. Add breaking point simulation (the wall, cramps)
5. Implement last-kilometer desperation mode

**Success Metrics**:
- Players experience at least 2 dramatic moments per race
- 60% of players report feeling "tension" during races
- Clutch moments trigger emotional reactions
- Breaking points feel authentic (playtester feedback)

---

## 📋 Tasks

### Task 1: Create Dramatic Race Event System
**Estimate**: 3 days  
**Priority**: Critical  
**Dependencies**: Sprint 20 (Rival system)

#### Subtasks:
1. Define dramatic event types in `src/engine/emotional-events/event-types.ts`
   ```typescript
   interface DramaticEvent {
     id: string;
     type: "rival_encounter" | "flashback" | "crowd_moment" | 
           "weather_shift" | "mental_battle" | "physical_crisis";
     trigger: (state: SimulationState, context: RaceContext) => boolean;
     title: LocalizedText;
     description: LocalizedText;
     emotionalTone: "tense" | "inspiring" | "challenging" | "triumphant";
     effects: StateModifiers;
     choices?: DecisionPrompt;
   }
   ```

2. Create dramatic event database in `src/engine/emotional-events/event-database.ts`
   - 40+ dramatic events:
     - **Rival Encounters**: "Marcus appears beside you, matching your pace..."
     - **Weather Drama**: "Storm clouds burst—rain pelts your face"
     - **Crowd Moments**: "The home crowd roars as you pass"
     - **Internal Battles**: "Your mind screams to stop. Your body can continue."
     - **Physical Crises**: "Sharp pain in your calf—warning sign?"

3. Build event trigger system in `src/engine/emotional-events/event-engine.ts`
   - Evaluate trigger conditions each km
   - Prioritize high-drama events
   - Prevent event spam (max 1 every 3km)
   - Chain events for story (encounter rival → duel → resolution)

4. Create dramatic event UI in `src/components/race/dramatic-event.tsx`
   - Full-screen overlay (semi-transparent)
   - Event title and description
   - Emotional tone styling (colors, fonts)
   - Quick decision buttons if choices
   - Dramatic pause (2 seconds) before continuing

5. Integrate into race simulation
   - Check for events in `src/engine/simulation/engine.ts`
   - Pause simulation for player response
   - Apply event effects to state
   - Track event history for story continuity

**Definition of Done**:
- ✅ 40+ dramatic events defined
- ✅ Events trigger based on race conditions
- ✅ UI creates emotional pause and focus
- ✅ Events affect simulation state meaningfully
- ✅ Playtest: Players report feeling drama

---

### Task 2: Implement Flashback Memory System
**Estimate**: 2 days  
**Priority**: High  
**Dependencies**: None

#### Subtasks:
1. Define memory types in `src/memory/memory-types.ts`
   ```typescript
   interface FlashbackMemory {
     id: string;
     trigger: MemoryTrigger;
     type: "victory" | "defeat" | "breakthrough" | "struggle";
     title: LocalizedText;
     text: LocalizedText;
     emotionalImpact: "motivating" | "haunting" | "inspiring";
     effect: { confidence?: number; focus?: number; willpower?: number };
   }
   
   interface MemoryTrigger {
     location?: string; // Same course
     rival?: string; // Same rival
     situation?: "struggling" | "leading" | "close_race";
     km?: number; // Specific location
   }
   ```

2. Create memory database in `src/memory/flashback-database.ts`
   - Procedural memories based on past races:
     - "Remember when you gave up here last time?"
     - "This is where you broke your personal best"
     - "Marcus beat you here—not this time"
   - Generic motivational flashbacks:
     - "Remember why you started running"
     - "You trained for this exact moment"

3. Build memory trigger system in `src/memory/flashback-engine.ts`
   - Check player's race history
   - Match current situation to past experiences
   - Generate personalized flashback
   - Track triggered flashbacks (no repeats in same race)

4. Create flashback UI component in `src/components/race/flashback-overlay.tsx`
   - Blur current race view
   - Fade in memory text
   - Sepia or monochrome filter
   - Slow fade back to present
   - Show stat boost from memory

5. Integrate flashbacks into race
   - Trigger at critical moments (low energy, facing rival, final km)
   - Apply emotional boost to stats
   - Add to race story/narrative

**Definition of Done**:
- ✅ Flashbacks trigger based on past races
- ✅ Memories feel personal and relevant
- ✅ UI creates emotional "remembering" moment
- ✅ Stat boosts are meaningful but balanced
- ✅ Playtest: Players report connection to past

---

### Task 3: Create Clutch Moment Mechanics
**Estimate**: 3 days  
**Priority**: High  
**Dependencies**: Sprint 20 (Rival system)

#### Subtasks:
1. Define clutch moment conditions in `src/engine/clutch/clutch-types.ts`
   ```typescript
   interface ClutchMoment {
     id: string;
     situation: "final_sprint" | "overtake_rival" | "survival" | "comeback";
     requirements: ClutchRequirements;
     stakes: LocalizedText; // "Everything is on the line"
     decision: ClutchDecision;
     success: ClutchOutcome;
     failure: ClutchOutcome;
   }
   
   interface ClutchRequirements {
     minKm: number; // Usually 80%+ into race
     energyBelow?: number;
     rivalWithin?: number; // meters
     positionRequirement?: "winning" | "losing" | "tied";
   }
   ```

2. Create clutch moment database in `src/engine/clutch/clutch-database.ts`
   - **Final Sprint**: "300m to go. Marcus is 10m ahead. Give everything?"
   - **Overtake**: "You're beside Sarah. Now or never."
   - **Survival**: "Your body is shutting down. Can you finish?"
   - **Comeback**: "You're 30s behind. Impossible... or not?"

3. Build clutch mechanics in `src/engine/clutch/clutch-engine.ts`
   - Detect clutch situations
   - Calculate success probability based on:
     - Current energy/stats
     - Attributes (willpower, speed)
     - Previous performance
     - RNG for drama (20% swing)
   - Apply dramatic outcomes

4. Create clutch UI in `src/components/race/clutch-moment.tsx`
   - Intense visual treatment (screen shake, color shift)
   - High-stakes messaging
   - Clear risk/reward choice
   - Slow-motion effect on decision
   - Dramatic outcome reveal

5. Implement risk/reward system
   - Success: Massive stat boost, likely victory
   - Failure: Energy crash, likely defeat
   - Creates memorable moments either way

**Definition of Done**:
- ✅ Clutch moments trigger in final race stages
- ✅ Stakes feel high and clear
- ✅ Success/failure outcomes are dramatic
- ✅ UI creates tension and anticipation
- ✅ Playtest: Players remember clutch moments

---

### Task 4: Simulate Breaking Points (The Wall)
**Estimate**: 2 days  
**Priority**: Medium  
**Dependencies**: None

#### Subtasks:
1. Define breaking point types in `src/engine/breaking-points/breaking-types.ts`
   ```typescript
   interface BreakingPoint {
     type: "the_wall" | "cramp" | "bonk" | "mental_break" | "stitch";
     probability: (state: SimulationState) => number;
     onset: "gradual" | "sudden";
     symptoms: LocalizedText;
     effects: StateModifiers;
     recovery: RecoveryOptions[];
   }
   ```

2. Implement breaking point calculations in `src/engine/breaking-points/breaking-engine.ts`
   - **The Wall**: Low energy + high fatigue + distance > 30km
   - **Cramp**: Poor hydration + aggressive pace
   - **Bonk**: No nutrition + long distance
   - **Mental Break**: Low focus + mental fatigue
   - **Stitch**: Too fast too early

3. Create breaking point progression
   - Warning signs (1-2km before)
   - Onset (sudden stat drop)
   - Crisis management (player decisions)
   - Recovery or collapse

4. Build breaking point UI in `src/components/race/breaking-point.tsx`
   - Visual indicators (screen desaturation, vignette)
   - Physical sensation descriptions
   - Management options:
     - Push through (high risk)
     - Slow down (safe recovery)
     - Emergency nutrition (if available)
     - Mental focus technique

5. Add authentic descriptions
   - "Your legs feel like lead weights"
   - "Cramp seizing your right calf—excruciating"
   - "You're out of gas. Empty tank."
   - "Every fiber of your being wants to stop"

**Definition of Done**:
- ✅ Breaking points occur based on race conditions
- ✅ Descriptions feel authentic (runner feedback)
- ✅ Player has meaningful choices
- ✅ Recovery/collapse feels realistic
- ✅ Adds tension without feeling punishing

---

### Task 5: Implement Last-Kilometer Desperation Mode
**Estimate**: 2 days  
**Priority**: Medium  
**Dependencies**: Task 3 (Clutch mechanics)

#### Subtasks:
1. Define desperation mode triggers in `src/engine/desperation/desperation-types.ts`
   ```typescript
   interface DesperationMode {
     trigger: "final_km" | "final_500m" | "final_100m";
     condition: "winning" | "losing" | "close";
     mentalState: "determined" | "desperate" | "resigned";
     boostAvailable: boolean; // Based on willpower reserves
   }
   ```

2. Create desperation mechanics in `src/engine/desperation/desperation-engine.ts`
   - Unlock at final 1km
   - Calculate desperation boost potential:
     - Based on willpower attribute
     - Affected by mental fatigue
     - One-time emergency reserves
   - Risk: Everything or nothing

3. Build desperation UI in `src/components/race/desperation-mode.tsx`
   - Screen effects (tunnel vision, intensity)
   - Heart pounding audio cue
   - "Final push" button
   - Clear messaging: "This is it. Everything you have."

4. Implement narrative variations
   - **Winning + desperation**: "Don't let them catch you!"
   - **Losing + desperation**: "This is your last chance!"
   - **Close + desperation**: "It comes down to who wants it more!"

5. Add spectacle to outcome
   - Success: Dramatic surge, photo finish
   - Failure: Collapse, "left it all out there"
   - Always memorable

**Definition of Done**:
- ✅ Desperation mode unlocks in final kilometer
- ✅ Boost is significant but risky
- ✅ UI creates do-or-die feeling
- ✅ Outcomes are dramatic
- ✅ Playtest: Players describe "intense final push"

---

### Task 6: Add Crowd and Atmosphere Reactions
**Estimate**: 1 day  
**Priority**: Low  
**Dependencies**: None

#### Subtasks:
1. Create crowd reaction system in `src/engine/atmosphere/crowd-engine.ts`
   - Home crowd (based on location familiarity)
   - Underdog support (when losing)
   - Champion pressure (when winning)
   - Rival tensions (when facing known rival)

2. Build atmosphere descriptions
   - "The home crowd is going WILD!"
   - "Thousands of eyes watching your struggle"
   - "Dead silence—everyone holding their breath"
   - "The roar is deafening as you push"

3. Add atmospheric flavor to events
   - Weather descriptions (beyond stats)
   - Time of day impact (sunrise finish, sunset beauty)
   - Location character (beach, mountain, city)

4. Integrate into event system
   - Crowd reactions during dramatic events
   - Atmosphere shifts with race drama
   - Adds immersion without mechanical impact

**Definition of Done**:
- ✅ Crowd reactions appear during key moments
- ✅ Atmosphere descriptions enhance immersion
- ✅ Feels like running IN a place, not on a track
- ✅ Playtest: Players notice and appreciate flavor

---

## 🧪 Testing & Validation

### Functional Testing
- [ ] Dramatic events trigger appropriately
- [ ] Flashbacks reference actual past races
- [ ] Clutch moments appear in final kilometers
- [ ] Breaking points occur based on conditions
- [ ] Desperation mode unlocks and works
- [ ] Crowd reactions match situations

### Engagement Testing
- [ ] 10 playtest sessions (2 races each)
- [ ] Survey: "Did you feel tension during the race?"
- [ ] Survey: "Did any moment stick with you?"
- [ ] Survey: "Did you feel like you were THERE?"
- [ ] Observe: Physical reactions (leaning forward, expressions)

### Balance Testing
- [ ] Breaking points aren't too punishing
- [ ] Clutch moments have ~50% success rate
- [ ] Desperation boost feels earned
- [ ] Events don't overwhelm simulation

---

## 📦 Deliverables

### New Files
- `src/engine/emotional-events/event-types.ts`
- `src/engine/emotional-events/event-database.ts`
- `src/engine/emotional-events/event-engine.ts`
- `src/components/race/dramatic-event.tsx`
- `src/memory/memory-types.ts`
- `src/memory/flashback-database.ts`
- `src/memory/flashback-engine.ts`
- `src/components/race/flashback-overlay.tsx`
- `src/engine/clutch/clutch-types.ts`
- `src/engine/clutch/clutch-database.ts`
- `src/engine/clutch/clutch-engine.ts`
- `src/components/race/clutch-moment.tsx`
- `src/engine/breaking-points/breaking-types.ts`
- `src/engine/breaking-points/breaking-engine.ts`
- `src/components/race/breaking-point.tsx`
- `src/engine/desperation/desperation-types.ts`
- `src/engine/desperation/desperation-engine.ts`
- `src/components/race/desperation-mode.tsx`
- `src/engine/atmosphere/crowd-engine.ts`

### Modified Files
- `src/features/race/race-screen.tsx` - Integrate all emotional systems
- `src/engine/simulation/engine.ts` - Check for dramatic events
- `src/types/engine.ts` - Add emotional event types
- `src/store/player-store.ts` - Track memories for flashbacks
- `src/i18n/en.json` - Event descriptions
- `src/i18n/id.json` - Event descriptions

---

## 🎯 Definition of Done

### Sprint Complete When:
- ✅ All 6 tasks completed
- ✅ All tests passing
- ✅ Build succeeds without errors
- ✅ 10 playtest sessions completed
- ✅ Engagement survey shows:
  - >60% felt tension during races
  - >70% remember at least one dramatic moment
  - >50% describe races as "intense" vs "mechanical"
- ✅ Balance testing confirms fair difficulty
- ✅ Sprint demo completed

---

## 📊 Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| "Felt Tension" | N/A | >60% | Survey |
| Memorable Moments | N/A | >70% | "What do you remember?" |
| Emotional Engagement | 3/10 | 7/10 | "How invested were you?" |
| Race Completion | ~90% | ~95% | Finish rate |
| Immediate Replay | ~30% | ~50% | Play again after loss |

---

**Next Sprint**: Sprint 22 - Career Story Mode
