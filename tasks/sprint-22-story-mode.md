# Sprint 22: Career Story Mode

**Duration**: 3 weeks  
**Goal**: Add narrative progression and career arc  
**Epic**: Long-Term Investment - Phase 1  
**Expected Impact**: 15% of total engagement improvement

---

## 🎯 Sprint Objectives

1. Implement 5-chapter career story system
2. Create story-gated race progression
3. Add story milestone celebrations
4. Build career biography/legacy system
5. Implement story-driven unlocks

**Success Metrics**:
- Players can describe their "runner's journey"
- Story gates motivate continued play
- 70% complete at least Chapter 2
- Story unlocks feel earned and special

---

## 📋 Tasks

### Task 1: Design Career Story Structure
**Estimate**: 2 days  
**Priority**: Critical  
**Dependencies**: Sprint 20 (Milestones)

#### Subtasks:
1. Define story chapter types in `src/story/story-types.ts`
   ```typescript
   interface StoryChapter {
     id: string;
     number: 1 | 2 | 3 | 4 | 5;
     title: LocalizedText;
     theme: "origins" | "growth" | "trials" | "glory" | "legacy";
     unlockRequirements: ChapterRequirements;
     storyBeats: StoryBeat[];
     finalRace: ChampionshipRace;
     rewards: ChapterRewards;
   }
   
   interface StoryBeat {
     id: string;
     trigger: "chapter_start" | "mid_chapter" | "pre_final" | "chapter_complete";
     cinematicType: "text" | "dialogue" | "montage";
     content: LocalizedText;
     characterAppearances: string[]; // Coach, rivals, etc.
   }
   ```

2. Write story outline for 5 chapters:
   - **Chapter 1: "First Steps"** (Levels 1-5)
     - Theme: Discovery and determination
     - Story: Local nobody dreams of becoming a runner
     - Final Race: Local 5K Championship
     - Unlock: Regional circuit access
   
   - **Chapter 2: "Rising Star"** (Levels 6-12)
     - Theme: Competition and rivalry
     - Story: Face your first real rivals, prove yourself
     - Final Race: Regional 10K Championship
     - Unlock: Named rivals, advanced training
   
   - **Chapter 3: "Trials"** (Levels 13-18)
     - Theme: Adversity and growth
     - Story: Injury scare, doubt, comeback
     - Final Race: State Half-Marathon Championship
     - Unlock: Mental training, recovery systems
   
   - **Chapter 4: "Glory"** (Levels 19-25)
     - Theme: Championship pursuit
     - Story: National stage, ultimate rivals
     - Final Race: National Marathon Championship
     - Unlock: Elite training, sponsorships
   
   - **Chapter 5: "Legacy"** (Levels 26+)
     - Theme: Defining your place in history
     - Story: Olympic trials, career culmination
     - Final Race: Elite Ultramarathon
     - Unlock: Mentor mode, hall of fame

3. Create story beat database in `src/story/story-content.ts`
   - 3-5 story beats per chapter (20-25 total)
   - Coach dialogues
   - Rival interactions
   - Personal reflection moments

4. Document story progression flow
   - Chapter unlock conditions
   - Story beat triggers
   - Branching (if any)

**Definition of Done**:
- ✅ 5 chapters fully outlined
- ✅ 20-25 story beats written
- ✅ Unlock requirements defined
- ✅ Story feels cohesive and motivating
- ✅ Narrative review completed

---

### Task 2: Implement Story Progression System
**Estimate**: 4 days  
**Priority**: Critical  
**Dependencies**: Task 1

#### Subtasks:
1. Create story state management in `src/story/story-store.ts`
   ```typescript
   interface StoryState {
     currentChapter: number;
     completedChapters: number[];
     activeStoryBeats: string[];
     completedStoryBeats: string[];
     chapterProgress: {
       [chapterId: string]: {
         racesCompleted: number;
         milestonesAchieved: string[];
         readyForFinal: boolean;
       }
     };
   }
   ```

2. Build story progression engine in `src/story/story-engine.ts`
   - Check chapter unlock conditions
   - Trigger story beats at appropriate moments
   - Track progression through chapters
   - Handle chapter completion

3. Implement story beat triggers
   - After specific races
   - On level-up to chapter threshold
   - Pre-championship race
   - Post-championship victory/defeat

4. Create chapter transition system
   - Celebration for completing chapter
   - Preview of next chapter
   - Unlock notifications

5. Extend runner profile with story data
   ```typescript
   interface RunnerProfile {
     // ... existing
     storyProgress: {
       currentChapter: number;
       completedChapters: number[];
       unlockedStoryBeats: string[];
     };
   }
   ```

**Definition of Done**:
- ✅ Story state persists across sessions
- ✅ Chapters unlock based on requirements
- ✅ Story beats trigger correctly
- ✅ Progression tracked accurately
- ✅ Unit tests for progression logic

---

### Task 3: Create Story Cinematic Components
**Estimate**: 4 days  
**Priority**: High  
**Dependencies**: Task 1

#### Subtasks:
1. Build story cinematic modal in `src/components/story/story-cinematic.tsx`
   - Chapter intro screen
   - Story beat dialogue
   - Chapter completion celebration
   - Next chapter preview

2. Design cinematic types:
   - **Text Cinematic**: Narrative text with music
   - **Dialogue Cinematic**: Coach/rival conversations
   - **Montage Cinematic**: Training/progression sequence

3. Create dialogue system in `src/components/story/dialogue-box.tsx`
   - Character portrait/icon
   - Typewriter effect for text
   - Continue/skip controls
   - Multiple character support

4. Build chapter intro screen in `src/components/story/chapter-intro.tsx`
   - Chapter number and title
   - Theme artwork/visual
   - Requirements checklist
   - "Begin Chapter" call-to-action

5. Create chapter complete screen in `src/components/story/chapter-complete.tsx`
   - Victory celebration
   - Chapter summary
   - Rewards display
   - Next chapter tease

**Definition of Done**:
- ✅ All cinematic types implemented
- ✅ Smooth animations and transitions
- ✅ Skip functionality works
- ✅ Visual polish complete
- ✅ Both languages supported

---

### Task 4: Implement Story-Gated Challenges
**Estimate**: 2 days  
**Priority**: High  
**Dependencies**: Task 2

#### Subtasks:
1. Extend challenge generation in `src/services/challenge/generator.ts`
   - Add chapter requirements to races
   - Tag championship races
   - Story-exclusive challenges

2. Update home screen to show story gates
   - Visual indication of locked races
   - "Complete Chapter X to unlock"
   - Progress toward unlock

3. Create championship race type
   - Higher stakes
   - Special narrative context
   - Unique rewards
   - Must-win for chapter progression

4. Build story race preview in `src/components/story/story-race-preview.tsx`
   - Story context
   - Stakes explanation
   - Character appearances
   - Pressure indicator

**Definition of Done**:
- ✅ Races locked by chapter
- ✅ Championship races feel special
- ✅ Clear communication of requirements
- ✅ Story races tied to narrative
- ✅ Playtest: Gates motivate progression

---

### Task 5: Create Career Biography System
**Estimate**: 3 days  
**Priority**: Medium  
**Dependencies**: Task 2

#### Subtasks:
1. Define biography types in `src/story/biography-types.ts`
   ```typescript
   interface CareerBiography {
     runnerId: string;
     chapters: CompletedChapter[];
     careerHighlights: Highlight[];
     rivalHistory: RivalSummary[];
     legacyRating: "unknown" | "local_hero" | "regional_star" | 
                    "national_champion" | "elite_legend" | "hall_of_fame";
     personalRecords: PersonalRecord[];
     memorableMoments: MemomentSnapshot[];
   }
   ```

2. Build biography tracker in `src/story/biography-tracker.ts`
   - Record chapter completions
   - Track key moments
   - Calculate legacy rating
   - Generate career summary

3. Create biography view in `src/features/profile/biography-screen.tsx`
   - Timeline of career
   - Chapter summaries
   - Highlight reel
   - Rival relationships
   - Legacy status

4. Add legacy milestones
   - "Local Hero" (Chapter 1 complete)
   - "Regional Star" (Chapter 2 complete)
   - "National Champion" (Chapter 4 complete)
   - "Hall of Fame" (All chapters + special achievements)

5. Build career sharing
   - Share biography summary
   - Career highlight image
   - "My Runner's Journey" card

**Definition of Done**:
- ✅ Biography tracks career progression
- ✅ Legacy rating updates dynamically
- ✅ Biography view is engaging
- ✅ Shareable career summary works
- ✅ Playtest: Players proud of biography

---

### Task 6: Implement Story Unlocks System
**Estimate**: 2 days  
**Priority**: Medium  
**Dependencies**: Task 2

#### Subtasks:
1. Define unlock types in `src/story/unlock-types.ts`
   ```typescript
   interface StoryUnlock {
     id: string;
     name: LocalizedText;
     type: "feature" | "content" | "cosmetic" | "ability";
     unlockedBy: string; // chapter id
     description: LocalizedText;
     impact: LocalizedText;
   }
   ```

2. Create unlock database in `src/story/unlock-database.ts`
   - Chapter 1: Regional races, rival system
   - Chapter 2: Advanced training programs
   - Chapter 3: Injury recovery, mental training
   - Chapter 4: Elite coaching, sponsorships
   - Chapter 5: Mentor mode, legacy features

3. Build unlock notification in `src/components/story/unlock-notification.tsx`
   - Celebration animation
   - Unlock icon and name
   - Impact explanation
   - "Try it now" button

4. Integrate unlock gates
   - Check before allowing access
   - Show locked features with preview
   - Link to story progression

**Definition of Done**:
- ✅ Unlocks tied to story progression
- ✅ Clear communication of what's locked
- ✅ Unlock notifications feel rewarding
- ✅ Progression incentivizes chapter completion
- ✅ All unlocks documented

---

## 🧪 Testing & Validation

### Functional Testing
- [ ] All 5 chapters unlock correctly
- [ ] Story beats trigger at right moments
- [ ] Championship races gate progression
- [ ] Biography tracks accurately
- [ ] Story unlocks function properly

### Narrative Testing
- [ ] Story is coherent and motivating
- [ ] Character voices are consistent
- [ ] Pacing feels right (not too fast/slow)
- [ ] Emotional beats land effectively

### Engagement Testing
- [ ] 15 playtest sessions (complete Chapter 1 minimum)
- [ ] Survey: "Do you care about your runner's story?"
- [ ] Survey: "Do you want to see the next chapter?"
- [ ] Track: Chapter 2 completion rate
- [ ] Observe: Do players read story beats?

---

## 📦 Deliverables

### New Files
- `src/story/story-types.ts`
- `src/story/story-content.ts`
- `src/story/story-store.ts`
- `src/story/story-engine.ts`
- `src/components/story/story-cinematic.tsx`
- `src/components/story/dialogue-box.tsx`
- `src/components/story/chapter-intro.tsx`
- `src/components/story/chapter-complete.tsx`
- `src/components/story/story-race-preview.tsx`
- `src/story/biography-types.ts`
- `src/story/biography-tracker.ts`
- `src/features/profile/biography-screen.tsx`
- `src/story/unlock-types.ts`
- `src/story/unlock-database.ts`
- `src/components/story/unlock-notification.tsx`

### Modified Files
- `src/runner/runner-types.ts` - Add story progress
- `src/services/challenge/generator.ts` - Story-gated races
- `src/features/home/home-screen.tsx` - Show story gates
- `src/features/profile/profile-screen.tsx` - Link to biography
- `src/i18n/en.json` - Story content
- `src/i18n/id.json` - Story content

---

## 🎯 Definition of Done

### Sprint Complete When:
- ✅ All 6 tasks completed
- ✅ All 5 chapters functional
- ✅ Story beats trigger correctly
- ✅ 15 playtest sessions completed
- ✅ Survey results:
  - >70% care about story
  - >60% complete Chapter 2
  - >80% want to continue
- ✅ Narrative review approved
- ✅ Sprint demo completed

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Chapter 1 Completion | >90% | Analytics |
| Chapter 2 Completion | >60% | Analytics |
| Story Engagement | >70% | "Do you care?" survey |
| Session Length | +25% | Time tracking |
| Return Rate (Next Day) | >65% | Login tracking |

---

**Next Sprint**: Sprint 23 - Social & Competition Layer
