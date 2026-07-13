# Sprint 24: Risk & Atmosphere

**Duration**: 2 weeks  
**Goal**: Add meaningful stakes and immersive atmosphere  
**Epic**: Polish & Retention - Phase 1  
**Expected Impact**: 7% of total engagement improvement

---

## 🎯 Sprint Objectives

1. Implement injury and risk system
2. Add location personality and storytelling
3. Create high-stakes race mechanics
4. Build season/qualification structure
5. Add atmospheric details and immersion

**Success Metrics**:
- Players feel consequences of risky decisions
- Locations feel distinct and memorable
- High-stakes races create tension
- Season structure motivates long-term play

---

## 📋 Tasks

### Task 1: Implement Injury & Risk System
**Estimate**: 3 days  
**Priority**: Critical  
**Dependencies**: Sprint 21 (Breaking points)

#### Subtasks:
1. Define injury types in `src/engine/risk/injury-types.ts`
   ```typescript
   interface Injury {
     id: string;
     type: "muscle_strain" | "stress_fracture" | "tendinitis" | 
           "fatigue_syndrome" | "minor_pain";
     severity: "minor" | "moderate" | "severe";
     affectedAttribute: "speed" | "stamina" | "all";
     performancePenalty: number; // %
     recoveryDays: number;
     riskOfWorsening: number; // % if racing injured
     treatmentOptions: Treatment[];
   }
   ```

2. Build injury probability system in `src/engine/risk/injury-calculator.ts`
   - Calculate injury risk based on:
     - Training load (overtraining)
     - Race frequency (insufficient recovery)
     - Pushing through breaking points
     - Equipment condition (worn shoes)
     - Random factor (5-10%)

3. Create injury management UI in `src/components/risk/injury-panel.tsx`
   - Injury status indicator
   - Recovery timeline
   - Treatment options (rest, active recovery, medical)
   - Risk warnings before races

4. Implement recovery system in `src/engine/risk/recovery-engine.ts`
   - Days to full recovery
   - Active vs passive recovery
   - Racing injured consequences

5. Add injury warnings
   - Pre-race: "You're carrying a muscle strain - high risk of worsening"
   - During race: "Pain flaring up - continue at your own risk"
   - Post-race: "Injury worsened - 7 days recovery needed"

6. Balance injury system
   - Conservative probabilities (3-8% per risky race)
   - Clear risk communication
   - Always recoverable (no permanent damage)
   - Optional "Casual Mode" with no injuries

**Definition of Done**:
- ✅ Injury system functional and balanced
- ✅ Clear communication of risks
- ✅ Recovery system works
- ✅ Players understand cause and effect
- ✅ Playtest: Feels fair, not punishing
- ✅ Optional toggle for casual players

---

### Task 2: Add Location Personality & Storytelling
**Estimate**: 3 days  
**Priority**: High  
**Dependencies**: None

#### Subtasks:
1. Define location data in `src/content/locations/location-types.ts`
   ```typescript
   interface Location {
     id: string;
     name: LocalizedText;
     region: "local" | "regional" | "national" | "international";
     description: LocalizedText;
     history: LocalizedText; // Famous moments, past champions
     atmosphere: LocationAtmosphere;
     homeAdvantage: boolean;
     unlockRequirement: string;
   }
   
   interface LocationAtmosphere {
     crowdSize: "intimate" | "moderate" | "massive";
     crowdType: "supportive" | "neutral" | "hostile";
     scenicValue: "urban" | "coastal" | "mountain" | "rural";
     signature: LocalizedText; // "The roar of the home crowd"
   }
   ```

2. Create location database in `src/content/locations/location-database.ts`
   - 15+ locations with distinct personalities:
     - **"Riverside 5K"**: Local, supportive crowd, where you started
     - **"City Marathon"**: Urban challenge, massive crowds, prestige
     - **"Coastal Trail"**: Scenic beauty, moderate difficulty
     - **"Mountain Challenge"**: Elite test, thin crowds, legendary
     - **"National Championship"**: Everything on the line
     - **"Boston Qualifier"**: Historic course, intense competition

3. Build location preview in `src/components/race/location-preview.tsx`
   - Location image/artwork
   - History and significance
   - Atmospheric description
   - Past champions / records
   - "This is where legends are made"

4. Add location-specific commentary
   - During race: "The coastal breeze is in your face"
   - During race: "Thousands watching from skyscrapers"
   - During race: "This is where you first fell in love with running"

5. Implement home advantage mechanic
   - Race at familiar location: +10 confidence, +5 focus
   - First time at location: -5 confidence (nerves)
   - Return after defeat: "Time to redeem yourself here"

6. Create location unlock progression
   - Start: Local races only
   - Chapter 2: Regional unlocked
   - Chapter 3: National unlocked
   - Chapter 4: Elite international

**Definition of Done**:
- ✅ 15+ locations with complete data
- ✅ Each location feels distinct
- ✅ Location preview is engaging
- ✅ Home advantage works
- ✅ Progression through locations motivating
- ✅ Playtest: Can identify locations by atmosphere

---

### Task 3: Create High-Stakes Race Mechanics
**Estimate**: 2 days  
**Priority**: High  
**Dependencies**: Sprint 22 (Story mode)

#### Subtasks:
1. Define high-stakes race types in `src/types/engine.ts`
   ```typescript
   interface HighStakesRace {
     type: "championship" | "qualifier" | "rivalry_showdown" | 
           "comeback" | "legacy_defining";
     stakes: LocalizedText; // What's on the line
     consequences: {
       victory: Consequence[];
       defeat: Consequence[];
     };
     pressure: number; // Affects starting confidence
     attemptsRemaining?: number; // Limited tries
   }
   ```

2. Build high-stakes UI indicators in `src/components/race/stakes-indicator.tsx`
   - Visual pressure meter
   - Stakes clearly stated
   - Consequences preview
   - "This matters" messaging

3. Implement limited-attempt races
   - Championship: Only 1 attempt per season
   - Qualifier: 3 attempts total
   - Track attempts remaining
   - Add urgency

4. Add pre-race pressure effects
   - High stakes: -15 starting confidence, +20 focus
   - Shows in preparation screen
   - Coach advice on managing pressure

5. Create high-stakes outcomes
   - Victory: Special celebration, major unlocks
   - Defeat: Consolation, alternate path, redemption setup

**Definition of Done**:
- ✅ High-stakes races feel different
- ✅ Stakes clearly communicated
- ✅ Limited attempts add tension
- ✅ Consequences meaningful
- ✅ Playtest: Players feel pressure

---

### Task 4: Build Season & Qualification Structure
**Estimate**: 2 days  
**Priority**: Medium  
**Dependencies**: Sprint 22 (Story mode)

#### Subtasks:
1. Define season structure in `src/progression/season-types.ts`
   ```typescript
   interface Season {
     number: number;
     startDate: string;
     races: SeasonRace[];
     championship: ChampionshipRace;
     qualificationRequirement: QualificationReq;
     seasonRecord: SeasonRecord;
   }
   
   interface QualificationReq {
     type: "win_count" | "ranking" | "time_standard" | "direct_qualify";
     threshold: number;
     description: LocalizedText;
   }
   ```

2. Build season tracker in `src/progression/season-tracker.ts`
   - Track races in current season
   - Calculate qualification status
   - Show progress toward championship

3. Create season UI in `src/components/progression/season-panel.tsx`
   - Season number and progress
   - Qualification status
   - Races remaining
   - Championship countdown

4. Implement off-season system
   - Post-championship: 7-day off-season
   - Recovery and reflection
   - Season summary
   - Next season preview

5. Add season goals
   - "Qualify for Championship"
   - "Win 5 races this season"
   - "Defeat all rivals at least once"

**Definition of Done**:
- ✅ Season structure functional
- ✅ Qualification system works
- ✅ Progress visible and motivating
- ✅ Off-season provides closure
- ✅ Seasons create long-term goals

---

### Task 5: Add Atmospheric Details & Immersion
**Estimate**: 2 days  
**Priority**: Low  
**Dependencies**: Task 2 (Locations)

#### Subtasks:
1. Create atmosphere engine in `src/engine/atmosphere/atmosphere-engine.ts`
   - Dynamic descriptions based on:
     - Weather + time of day
     - Location + crowd
     - Race position
     - Energy level

2. Build atmospheric event library
   - Weather shifts: "The sun breaks through clouds"
   - Crowd reactions: "The crowd holds its breath"
   - Physical sensations: "Your breath forms mist in the cold air"
   - Time-of-day: "Sunrise paints the sky orange"

3. Add micro-moments to race
   - Every 5km: Atmospheric flavor text
   - Doesn't affect mechanics
   - Creates sense of place
   - Adds variety to similar races

4. Implement location-specific details
   - Beach race: "Sand and salt in the air"
   - Mountain: "Thin air burns your lungs"
   - City: "Traffic noise, urban energy"
   - Trail: "Forest sounds, earthy smell"

5. Create weather mood system
   - Sunny: Optimistic descriptions
   - Rainy: Gritty, determination language
   - Stormy: Survival, adversity tone
   - Perfect conditions: Flow state descriptions

**Definition of Done**:
- ✅ Atmospheric details appear during races
- ✅ Descriptions match conditions
- ✅ Adds immersion without clutter
- ✅ Location personality comes through
- ✅ Playtest: Players notice and appreciate details

---

## 🧪 Testing & Validation

### Functional Testing
- [ ] Injury system works correctly
- [ ] Locations unlock in order
- [ ] High-stakes races function properly
- [ ] Season tracking accurate
- [ ] Atmospheric details display

### Balance Testing
- [ ] Injury probability feels fair
- [ ] Risk warnings are clear
- [ ] High-stakes pressure is balanced
- [ ] Season length appropriate

### Engagement Testing
- [ ] 10 playtest sessions
- [ ] Survey: "Do decisions feel consequential?"
- [ ] Survey: "Do locations feel distinct?"
- [ ] Survey: "Do you care about season goals?"
- [ ] Observe: Do players play cautiously when injured?

---

## 📦 Deliverables

### New Files
- `src/engine/risk/injury-types.ts`
- `src/engine/risk/injury-calculator.ts`
- `src/engine/risk/recovery-engine.ts`
- `src/components/risk/injury-panel.tsx`
- `src/content/locations/location-types.ts`
- `src/content/locations/location-database.ts`
- `src/components/race/location-preview.tsx`
- `src/components/race/stakes-indicator.tsx`
- `src/progression/season-types.ts`
- `src/progression/season-tracker.ts`
- `src/components/progression/season-panel.tsx`
- `src/engine/atmosphere/atmosphere-engine.ts`

### Modified Files
- `src/runner/runner-types.ts` - Add injury state
- `src/features/home/home-screen.tsx` - Show season progress
- `src/features/race/race-screen.tsx` - Add atmospheric details
- `src/features/preparation/preparation-screen.tsx` - Injury warnings
- `src/types/engine.ts` - Add location, stakes types

---

## 🎯 Definition of Done

### Sprint Complete When:
- ✅ All 5 tasks completed
- ✅ All tests passing
- ✅ 10 playtest sessions completed
- ✅ Survey results:
  - >65% feel consequences matter
  - >70% notice location personality
  - >60% engaged with season goals
- ✅ Balance approved
- ✅ Sprint demo completed

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Risk Awareness | >75% | "Do you consider injury risk?" |
| Location Recognition | >70% | "Can you name 3 locations?" |
| Season Engagement | >60% | Track qualification attempts |
| Cautious Behavior | >50% | Rest when injured |

---

**Next Sprint**: Sprint 25 - Polish & Retention Hooks
