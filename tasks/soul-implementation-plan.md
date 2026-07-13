# RunQuest: Soul & Engagement Implementation Plan

**Based on Analysis**: `analysis/engagement-gaps.md`  
**Created**: 2026-07-13  
**Target Timeline**: 16-20 weeks (4-5 sprints)  
**Priority**: Transform simulator into addictive experience

---

## 🎯 Implementation Strategy

### Core Philosophy
Add **emotional hooks** and **psychological reward loops** without disrupting existing mechanics. Focus on making players care about outcomes, not just optimizing stats.

### Success Metrics
- Session Length: +40% (from ~8min to ~12min)
- Return Rate: >60% next-day returns
- Race Completion: >90% finish rate
- Replay After Loss: >50% immediate retry
- Share Rate: >15% share results
- Emotional Engagement: >75% "I care about my runner"

---

## 📅 Sprint Breakdown Overview

| Sprint | Focus | Duration | Key Deliverables |
|--------|-------|----------|------------------|
| **Sprint 20** | Quick Wins + Rival Foundation | 2 weeks | Named rivals, coach radio, victory screens |
| **Sprint 21** | Emotional Race System | 2 weeks | Dramatic events, rival encounters, clutch moments |
| **Sprint 22** | Career Story Mode | 3 weeks | Story chapters, progression gates, milestones |
| **Sprint 23** | Social & Competition | 2 weeks | Rankings, ghost runs, rival progression |
| **Sprint 24** | Risk & Atmosphere | 2 weeks | Injury system, location personality, stakes |
| **Sprint 25** | Polish & Retention | 2 weeks | Training mini-events, post-race hooks, juice |

**Total Timeline**: 13 weeks (~3 months)

---

## 🚀 Phase Priorities

### Phase 1: Quick Wins (Sprint 20 - Week 1-2)
**Goal**: Immediate impact with minimal complexity  
**Impact**: 40% of total engagement improvement  
**Effort**: Low

### Phase 2: Emotional Core (Sprint 21 - Week 3-4)
**Goal**: Add drama and tension to races  
**Impact**: 30% of total engagement improvement  
**Effort**: Medium

### Phase 3: Long-Term Investment (Sprint 22-23 - Week 5-9)
**Goal**: Career arc and social competition  
**Impact**: 20% of total engagement improvement  
**Effort**: High

### Phase 4: Polish & Retention (Sprint 24-25 - Week 10-13)
**Goal**: Risk, atmosphere, and "one more run" hooks  
**Impact**: 10% of total engagement improvement  
**Effort**: Medium

---

## 🎨 Design Principles

1. **Show, Don't Tell**: Emotional moments > stat reports
2. **Personality Over Systems**: Characters > mechanics
3. **Earned Progression**: Story unlocks > level numbers
4. **Meaningful Failure**: Stakes > safe retries
5. **Atmospheric Immersion**: Feel the place > generic locations
6. **Immediate Feedback**: Visceral reactions > delayed rewards

---

## 📊 Technical Architecture Changes

### New Systems Required

1. **Rival System** (`src/rivals/`)
   - Rival database with personalities
   - Progression tracking
   - Encounter generation
   - Post-race commentary

2. **Story System** (`src/story/`)
   - Chapter progression
   - Story gates
   - Milestone tracking
   - Narrative state management

3. **Emotional Events System** (`src/engine/emotional-events/`)
   - Dramatic race moments
   - Flashback triggers
   - Coach radio system
   - Clutch mechanics

4. **Cinematic System** (`src/components/cinematics/`)
   - Victory/defeat animations
   - Milestone celebrations
   - Race replays
   - Emotional cutscenes

5. **Memory System** (`src/memory/`)
   - Trophy case
   - Photo album
   - Career highlights
   - Personal records with context

6. **Risk System** (`src/engine/risk/`)
   - Injury probability
   - Consequence tracking
   - Recovery management
   - High-stakes races

---

## 🔧 Integration Points

### Existing Systems to Enhance

1. **Race Screen** (`src/features/race/race-screen.tsx`)
   - Add rival position updates
   - Integrate coach radio
   - Show dramatic events
   - Flashback overlays

2. **Result Screen** (`src/features/result/result-screen.tsx`)
   - Victory cinematics
   - Rival reactions
   - Career milestone unlocks
   - Story progression triggers

3. **Profile Screen** (`src/features/profile/profile-screen.tsx`)
   - Trophy case section
   - Memory album
   - Rival relationship status
   - Story chapter progress

4. **Home Screen** (`src/features/home/home-screen.tsx`)
   - Story-gated challenges
   - Rival callouts
   - Season progress
   - Urgent hooks

5. **Training Screen** (`src/features/training/training-screen.tsx`)
   - Mini-event system
   - Training partner appearances
   - Breakthrough moments
   - Risk warnings

---

## 📦 Data Structure Extensions

### Runner Profile Extensions
```typescript
interface RunnerProfile {
  // ... existing fields
  
  // Story Progress
  storyChapter: number; // 1-5
  careerMilestones: string[]; // ["first_win", "sub_20_5k", ...]
  unlockedStoryBeats: string[];
  
  // Rivals
  rivals: RivalRelationship[]; // Track 5-6 named rivals
  rivalVictories: Record<string, number>;
  rivalDefeats: Record<string, number>;
  
  // Memories
  trophyCase: Trophy[];
  photoAlbum: RacePhoto[];
  careerHighlights: Highlight[];
  
  // Risk & Consequence
  injuryStatus: InjuryState | null;
  injuryHistory: InjuryRecord[];
  
  // Season Progress
  currentSeason: number;
  seasonRecord: SeasonStats;
  qualificationStatus: QualificationState;
}
```

### New Data Types
```typescript
interface RivalRelationship {
  id: string;
  name: string;
  archetype: "endurance" | "speed" | "tactical" | "mental" | "versatile";
  personality: "cocky" | "respectful" | "silent" | "friendly" | "intense";
  currentLevel: number;
  wins: number;
  losses: number;
  lastEncounter: string; // ISO date
  relationshipLevel: number; // -100 to 100
  preRaceQuotes: string[];
  postRaceQuotes: { victory: string[]; defeat: string[] };
}

interface Trophy {
  id: string;
  name: string;
  description: string;
  earnedAt: string; // ISO date
  raceId: string;
  storyContext: string; // "First championship win against Marcus"
  icon: string;
}

interface RacePhoto {
  id: string;
  raceId: string;
  momentType: "victory" | "defeat" | "milestone" | "rival_encounter";
  caption: string;
  timestamp: string;
  shareCount: number;
}

interface StoryBeat {
  id: string;
  chapter: number;
  title: string;
  description: string;
  unlockCondition: UnlockCondition;
  rewards: Reward[];
  cinematicData: CinematicScene;
}

interface InjuryState {
  type: "strain" | "stress_fracture" | "fatigue" | "overtraining";
  severity: "minor" | "moderate" | "severe";
  recoveryDays: number;
  performancePenalty: number; // %
  riskOfWorsening: number; // %
}
```

---

## 🎯 Sprint Dependencies

```
Sprint 20 (Quick Wins)
    ↓
Sprint 21 (Emotional Races) ← depends on rivals from S20
    ↓
Sprint 22 (Story Mode) ← depends on milestones from S20-21
    ↓
Sprint 23 (Social/Competition) ← depends on rivals from S20-21
    ↓
Sprint 24 (Risk & Atmosphere) ← independent, can parallel with S23
    ↓
Sprint 25 (Polish) ← integrates everything
```

---

## 🚦 Risk Assessment

### High Risk Items
1. **Story Mode Complexity** (Sprint 22)
   - Mitigation: Start with 3 chapters, expand to 5 later
   - Fallback: Linear progression without branching

2. **Injury System Balance** (Sprint 24)
   - Mitigation: Conservative penalties, easy recovery
   - Fallback: Optional "hardcore mode" toggle

3. **Performance with Cinematics** (Sprint 21, 25)
   - Mitigation: Lightweight animations, skip option
   - Fallback: Static screens with better copy

### Medium Risk Items
1. **Rival AI Progression** (Sprint 23)
   - Mitigation: Simple formula-based progression
   - Fallback: Fixed difficulty tiers

2. **Content Volume** (All sprints)
   - Mitigation: Procedural generation + handcrafted highlights
   - Fallback: Smaller content pool with rotation

---

## 📈 Testing Strategy

### Engagement Testing (Each Sprint)
1. **Playtest Sessions**: 5-10 players, 30min each
2. **Metrics Tracking**: Session length, return rate, completion rate
3. **Emotional Survey**: "Did you care about the outcome?" (1-5)
4. **Replay Observation**: Do players immediately race again after loss?

### A/B Testing Opportunities
1. **Victory Screens**: With vs without cinematics
2. **Rival Personalities**: Cocky vs respectful
3. **Story Gating**: Locked vs always available
4. **Risk Level**: High stakes vs safe retries

---

## 🎓 Learning Goals

Each sprint should answer:
1. **What makes players care?** (Sprint 20-21)
2. **What makes them return?** (Sprint 22-23)
3. **What creates tension?** (Sprint 24)
4. **What triggers "one more run"?** (Sprint 25)

---

## 📝 Documentation Updates

Each sprint must update:
1. **User-facing**: How new features work
2. **Developer docs**: System architecture
3. **Content pipeline**: How to add rivals, story beats, etc.
4. **Playtesting guide**: What to observe

---

## 🎉 Success Celebration

After Sprint 25 completion:
1. **Internal playtest tournament**: Team races with rivalry
2. **Community beta**: 50-100 early testers
3. **Metrics review**: Compare before/after engagement
4. **Retrospective**: What worked, what didn't
5. **Next phase planning**: Multiplayer? Clubs? Seasons?

---

## 📌 Quick Reference

### Files to Create
- `src/rivals/rival-system.ts`
- `src/story/story-engine.ts`
- `src/engine/emotional-events/event-generator.ts`
- `src/components/cinematics/victory-cinematic.tsx`
- `src/memory/trophy-case.ts`
- `src/engine/risk/injury-system.ts`

### Files to Modify
- `src/features/race/race-screen.tsx` - Add emotional events
- `src/features/result/result-screen.tsx` - Add cinematics
- `src/features/profile/profile-screen.tsx` - Add trophy case
- `src/features/home/home-screen.tsx` - Add story gates
- `src/runner/runner-types.ts` - Extend profile
- `src/types/engine.ts` - Add new types

### Dependencies to Add
- `framer-motion` - Already installed ✓
- `react-confetti` - Victory celebrations
- `howler.js` or native Audio API - Sound effects

---

*This plan transforms RunQuest from a well-built simulator into an emotionally engaging experience that players can't put down.*

**Next Step**: Review Sprint 20 details in `tasks/sprint-20-quick-wins.md`
