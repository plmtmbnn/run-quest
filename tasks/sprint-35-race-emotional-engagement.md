# Sprint 35: Race Emotional Engagement & Core Feel

**Goal**: Transform the race from a data dashboard into an immersive emotional experience by adding heart rate visualization, mental commentary, split callouts, and critical alerts.

**Focus**: Quick wins that immediately make races feel more alive and addictive.

---

## 🎯 Sprint Objectives
- Add physiological feedback (heart rate, breathing)
- Implement emotional narrative system (mental commentary)
- Create urgency with DNF warnings and critical alerts
- Enhance split time feedback with dramatic callouts
- Add collapse/recovery animation at finish line

---

## 📋 Tasks

### 1. Heart Rate Visualization System
**Priority**: HIGH  
**Estimate**: 5 points

**Description**:  
Add a real-time heart rate (BPM) indicator that responds dynamically to race conditions, creating physiological immersion.

**Implementation Details**:
- Create `HeartRateMonitor` component in `src/components/race/heart-rate-monitor.tsx`
- Calculate BPM based on:
  - Base rate: 120 bpm (jog) → 150 bpm (cruise) → 170 bpm (push) → 190+ bpm (sprint)
  - Fatigue multiplier: +1 bpm per 1% muscle fatigue
  - Breaking point: +20 bpm spike
  - Final kick: +30 bpm surge
- Visual design:
  - Position: Top-left corner alongside pace controls
  - Display: Large monospace BPM number with pulsing ❤️ icon
  - Color transitions: `text-emerald-500` (120-150) → `text-amber-500` (150-170) → `text-rose-500` (170-190) → `text-red-600 animate-pulse` (190+)
  - Pulsing animation speed matches BPM (faster = more urgent)
- Audio: Optional subtle heartbeat SFX (toggle in settings)

**Acceptance Criteria**:
- [x] BPM updates every simulation tick
- [x] Color and animation respond to intensity zones
- [x] Visible stress increase during breaking points
- [x] Maximum BPM warning at 200+ (danger zone)

**Files to modify**:
- `src/features/race/race-screen.tsx` (integrate component)
- `src/components/race/heart-rate-monitor.tsx` (new)
- `src/engine/simulation/engine.ts` (calculate BPM)

---

### 2. Mental Commentary System
**Priority**: HIGH  
**Estimate**: 8 points

**Description**:  
Add internal monologue system that delivers motivational, contextual thoughts during key race moments.

**Implementation Details**:
- Create `MentalCommentary` component in `src/components/race/mental-commentary.tsx`
- Commentary triggers:
  1. **Race start**: "This is it. All the training comes down to now."
  2. **Halfway point**: "You're halfway there. Don't stop now."
  3. **Low energy (<30%)**: "Your legs are screaming, but you're NOT giving up!"
  4. **Overtaking rival**: "YES! Keep pushing, don't let them back in!"
  5. **Being overtaken**: "Stay focused. This isn't over yet."
  6. **Final 2km**: "This is what separates the good from the great."
  7. **Final kick**: "EVERYTHING you have. NOW!"
  8. **Breaking point**: "Pain is temporary. Quitting lasts forever."
  9. **Near PB pace**: "You're on track for a personal record!"
  10. **Behind pace**: "Remember why you started..."

- Visual design:
  - Toast-style notification at bottom-center
  - Dark overlay with white text: `bg-slate-900/90 backdrop-blur-sm`
  - Italic font: `italic text-white text-sm`
  - Auto-dismiss after 4 seconds
  - Fade in/out animation

- Translation support:
  - Add keys to `src/i18n/translations/` for all commentary
  - Support contextual variables (e.g., rival name, time difference)

**Acceptance Criteria**:
- [x] Commentary triggers at appropriate race moments
- [x] No more than one message per km (avoid spam)
- [x] Messages are contextual to player performance
- [x] Fully translated in all supported languages
- [x] Can be toggled in settings

**Files to create/modify**:
- `src/components/race/mental-commentary.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate triggers)
- `src/i18n/translations/en.json` (add keys)
- `src/i18n/translations/id.json` (add keys)
- `src/store/settings-store.ts` (add toggle option)

---

### 3. Split Time Dramatic Callouts
**Priority**: HIGH  
**Estimate**: 5 points

**Description**:  
Replace plain km markers with large, animated split time notifications that compare to PB pace and create dramatic feedback.

**Implementation Details**:
- Create `SplitCallout` component in `src/components/race/split-callout.tsx`
- Display at each kilometer completion:
  - **Current split time**: "3:45" (large, monospace, bold)
  - **Comparison to PB**: "🔥 12s FASTER than your PB pace!" or "⚠️ 8s slower - pick it up!"
  - **Cumulative time**: "Total: 11:15"
  
- Visual design:
  - Full-width banner animation from top
  - Size: `text-4xl font-mono font-black` for split time
  - Background: 
    - Faster than PB: `bg-gradient-to-r from-emerald-500 to-green-600`
    - Slower than PB: `bg-gradient-to-r from-amber-500 to-orange-600`
    - Way slower: `bg-gradient-to-r from-rose-500 to-red-600`
  - Auto-dismiss after 3 seconds
  - Framer Motion: slide down, bounce, slide up

- Audio: Distinct beep sound on each km

**Acceptance Criteria**:
- [x] Callout appears at every km milestone
- [x] Comparison is accurate to player's PB for that distance
- [x] Color coding matches performance quality
- [x] Doesn't block critical UI elements
- [x] Works during 2x and 5x speed

**Files to create/modify**:
- `src/components/race/split-callout.tsx` (new)
- `src/features/race/race-screen.tsx` (trigger on km completion)
- `src/engine/simulation/engine.ts` (calculate split comparisons)
- `public/audio/split-beep.mp3` (new audio asset)

---

### 4. DNF Warning & Critical Alert System
**Priority**: HIGH  
**Estimate**: 6 points

**Description**:  
Create progressive danger alerts when player is at risk of DNF (Did Not Finish), adding urgency and tension.

**Implementation Details**:
- Create `CriticalAlert` component in `src/components/race/critical-alert.tsx`
- Warning levels:
  1. **Warning (energy 30-40%)**: Yellow banner "⚠️ CAUTION - Energy Low"
  2. **Critical (energy 15-30%)**: Orange banner "🚨 CRITICAL - Collapse Risk"
  3. **Emergency (energy 0-15%)**: Red pulsing banner "💀 EMERGENCY - DNF Imminent! {{distance}} to finish"
  
- Emergency Action Button:
  - "🔥 BURN RESERVES" (one-time use per race)
  - Effect: +20% energy, -10% max stamina for remainder
  - Only available in Emergency state
  - Cooldown: Cannot be used in last 500m (too late)

- Visual design:
  - Fixed position top banner below header
  - Width: `w-full`
  - Height: `h-16` (Warning) → `h-20` (Critical) → `h-24` (Emergency)
  - Background: Warning `bg-amber-500` → Critical `bg-orange-600` → Emergency `bg-red-600 animate-pulse`
  - Text: `font-heading font-black uppercase tracking-wider`
  - Button: `bg-white text-red-600 hover:bg-red-50 px-6 py-2 rounded-xl font-bold`

- Screen effects:
  - Vignette overlay at Emergency level: `fixed inset-0 pointer-events-none border-8 border-red-500/50`
  - Screen shake animation at Critical/Emergency

**Acceptance Criteria**:
- [x] Alerts trigger at correct energy thresholds
- [x] Burn Reserves button functional (one-time use)
- [x] Distance to finish calculated accurately
- [x] Visual urgency escalates appropriately
- [x] Doesn't obscure decision moments

**Files to create/modify**:
- `src/components/race/critical-alert.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate alert system)
- `src/engine/simulation/engine.ts` (add burnReserves action)
- `src/engine/simulation/types.ts` (add emergency state)

---

### 5. Finish Line Collapse & Recovery Animation
**Priority**: MEDIUM  
**Estimate**: 4 points

**Description**:  
Add emotional payoff at finish line with realistic collapse, breathing recovery, and gradual stats reveal.

**Implementation Details**:
- Create `FinishLineSequence` component in `src/components/race/finish-line-sequence.tsx`
- Animation sequence (total ~5 seconds):
  1. **Crossing line (0-1s)**: Runner avatar crosses finish, slow-motion effect
  2. **Collapse (1-2s)**: Runner bends over, hands on knees
  3. **Heavy breathing (2-4s)**: Pulsing breathing indicator, heart rate slowly decreasing
  4. **Recovery (4-5s)**: Runner stands upright, fade in to results screen

- Visual elements:
  - Center-screen animated runner silhouette
  - Breathing rate indicator: Fast → Slow
  - Heart rate: 190+ bpm → 140 bpm
  - Screen blur background during sequence
  - Audio: Heavy breathing SFX (optional)

- Text overlays:
  - "Race Complete!" (1s)
  - "Time: {{finalTime}}" (2s)
  - "Calculating results..." (3s)

- Skip option: "Press any key to skip" after 2 seconds

**Acceptance Criteria**:
- [x] Sequence plays after crossing finish line
- [x] Animation smooth and realistic
- [x] Can be skipped after 2 seconds
- [x] Stats are hidden until sequence completes
- [x] Works for all race outcomes (finish, DNF, etc.)

**Files to create/modify**:
- `src/components/race/finish-line-sequence.tsx` (new)
- `src/features/race/race-screen.tsx` (trigger on race complete)
- `public/audio/heavy-breathing.mp3` (new audio asset)

---

### 6. Personal Record Celebration
**Priority**: MEDIUM  
**Estimate**: 4 points

**Description**:  
Create special celebration animation and feedback when player achieves a new personal record.

**Implementation Details**:
- Create `PRCelebration` component in `src/components/race/pr-celebration.tsx`
- Trigger: When final time < existing PB for that distance
- Animation elements:
  1. **Confetti burst**: Full-screen confetti particles (use `canvas-confetti` library)
  2. **"NEW PR!" banner**: Large, bold, animated text
  3. **Before/After comparison**: 
     - "Previous: 22:45"
     - "New: 21:58"
     - "Improvement: -47 seconds! 🎉"
  4. **Achievement badge**: Gold medal icon with shine effect
  5. **Social share prompt**: "Share your achievement?"

- Visual design:
  - Full-screen overlay: `bg-slate-950/80 backdrop-blur-md`
  - Central card: `bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600`
  - Text: `text-white font-heading font-black text-5xl`
  - Auto-dismiss after 6 seconds or on click

- Audio: Triumphant fanfare sound

**Acceptance Criteria**:
- [x] Only triggers on actual new PR
- [x] Displays accurate time comparison
- [x] Confetti animation smooth and celebratory
- [x] Can be dismissed early
- [x] Social share opens result card generator

**Files to create/modify**:
- `src/components/race/pr-celebration.tsx` (new)
- `src/features/race/race-screen.tsx` (trigger on PR detection)
- `package.json` (add `canvas-confetti` dependency)
- `public/audio/pr-fanfare.mp3` (new audio asset)

---

## 🎨 Design System Compliance

All components MUST follow:
- **Cards**: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]`
- **Typography**: 
  - Headers: `font-heading font-black`
  - Numbers/Stats: `font-mono font-bold`
  - Badges: `text-[10px] font-bold uppercase tracking-wider`
- **Colors**: 
  - Success: `emerald-500`
  - Warning: `amber-500`
  - Danger: `rose-500`/`red-600`
  - Primary: `indigo-500`
- **Dark Mode**: All elements MUST have dark variants
- **Animations**: Use `transition-all duration-200` for interactions

---

## 🧪 Testing Requirements

### Unit Tests
- Heart rate calculation accuracy
- Commentary trigger conditions
- DNF threshold detection
- PR comparison logic

### Integration Tests
- Heart rate updates during simulation
- Split callouts at correct km markers
- Critical alerts don't block decisions
- Finish sequence transitions correctly

### Manual QA Checklist
- [ ] Test all commentary triggers in one race
- [ ] Verify DNF warning at all thresholds
- [ ] Burn Reserves button works once only
- [ ] PR celebration only on actual new record
- [ ] All animations smooth at 2x and 5x speed
- [ ] Dark mode rendering correct for all new components
- [ ] Audio toggles work (heartbeat, breathing, fanfare)

---

## 📦 Dependencies

```json
{
  "canvas-confetti": "^1.6.0"
}
```

---

## 🚀 Definition of Done

- [ ] All 6 tasks completed and tested
- [ ] Design system guidelines followed
- [ ] Dark mode fully supported
- [ ] Translations complete (EN, ID)
- [ ] Audio assets integrated with toggle controls
- [ ] No performance regression (60fps maintained)
- [ ] Code reviewed and merged to master
- [ ] User feedback collected on "feel" improvement

---

## 📊 Success Metrics

Track in analytics:
- Average race completion rate (target: +15%)
- DNF rate (should remain stable or decrease)
- "Burn Reserves" usage rate
- Time spent on finish sequence (engagement indicator)
- PR achievement celebration views
- Settings: % users who enable/disable commentary

---

## 🎯 Next Sprint Preview

Sprint 36 will focus on **Flow State & Rhythm Systems** to capture the runner's high and create meditative engagement during cruise segments.
