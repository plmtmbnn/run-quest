# Sprint 36: Flow State, Rhythm & Environmental Immersion

**Goal**: Capture the runner's high and create meditative engagement through flow state mechanics, rhythm systems, and rich environmental immersion.

**Focus**: Transform cruise segments from passive watching into engaging, almost meditative experiences while adding visual depth to the race environment.

---

## 🎯 Sprint Objectives
- Implement flow state meter with visual/audio rewards
- Add rhythm/cadence mini-game for optimal efficiency
- Create environmental parallax backgrounds
- Add weather particle effects and atmospheric conditions
- Implement breathing control mechanics
- Build body stress visualization system

---

## 📋 Tasks

### 1. Flow State Meter & The Zone Mode
**Priority**: HIGH  
**Estimate**: 8 points

**Description**:  
Create a flow state system that rewards consistent, smart racing with a zone mode that makes players feel unstoppable.

**Implementation Details**:
- Create `FlowStateMeter` component in `src/components/race/flow-state-meter.tsx`
- Flow state calculation:
  ```typescript
  flowScore = 0-100 based on:
  - Pace consistency: +5 per km within 5% of target pace
  - Good decisions: +10 per optimal decision
  - No breaking points: +3 per km without crisis
  - Energy management: +5 if energy between 40-70%
  - Penalty: -20 on breaking point, -10 on bad decision
  ```

- Flow state levels:
  1. **Building (0-30)**: Meter visible, neutral state
  2. **Flowing (31-60)**: Subtle screen edge glow (blue-purple gradient)
  3. **The Zone (61-100)**: Full immersion mode activated

- The Zone Mode effects:
  - **Visual**: Screen edges glow with animated blue-purple gradient `from-blue-500/20 via-purple-500/20 to-indigo-500/20`
  - **UI Simplification**: Fade out secondary stats, focus on essentials (pace, position, distance)
  - **Slight slow-mo**: Reduce simulation speed by 5% (feels more controlled)
  - **Audio**: Deep, resonant ambient tone (optional, toggle in settings)
  - **Mechanical benefit**: -15% fatigue accumulation rate, +5% efficiency
  - **Duration**: Lasts until flow drops below 50

- Visual design:
  - Position: Right sidebar below stats
  - Vertical progress bar: `h-32 w-4`
  - Gradient fill: `bg-gradient-to-t from-slate-300 via-blue-400 to-purple-500`
  - Label: "FLOW STATE" with current level text
  - Pulsing animation when in The Zone

**Acceptance Criteria**:
- [x] Flow score calculates accurately based on performance
- [x] The Zone activates at 61+ and deactivates at <50
- [x] Visual effects smooth and non-distracting
- [x] Fatigue reduction applies correctly in The Zone
- [x] Flow meter visible throughout race

**Files to create/modify**:
- `src/components/race/flow-state-meter.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate meter)
- `src/engine/simulation/engine.ts` (calculate flow score, apply benefits)
- `src/engine/simulation/types.ts` (add FlowState type)

---

### 2. Cadence & Rhythm System
**Priority**: HIGH  
**Estimate**: 6 points

**Description**:  
Add interactive rhythm mechanic during cruise segments that rewards players for maintaining optimal cadence, creating meditative engagement.

**Implementation Details**:
- Create `CadenceRhythm` component in `src/components/race/cadence-rhythm.tsx`
- Activation: Only during "Cruise" pace mode
- Mechanic:
  - Display metronome indicator with optimal cadence (170-180 steps/min based on runner stats)
  - Visual: Pulsing circle that expands/contracts at optimal rhythm
  - Player can tap spacebar or click in rhythm with footfalls
  - Perfect timing window: ±50ms of beat
  - Combo counter: Consecutive perfect hits

- Rhythm accuracy tracking:
  ```typescript
  Perfect hit (±25ms): +2% efficiency for 10 seconds
  Good hit (±50ms): +1% efficiency for 10 seconds
  Miss: Break combo, no penalty
  Combo bonus: 10+ hits = additional +3% efficiency
  ```

- Visual design:
  - Position: Bottom-center, above event log
  - Pulsing circle: `w-16 h-16 rounded-full border-4 border-emerald-500`
  - Combo display: "×12 PERFECT RHYTHM 🎵"
  - Color feedback: Green (perfect) → Yellow (good) → Gray (miss)
  - Can be minimized/hidden without penalty

- Audio: Subtle metronome tick (optional)

**Acceptance Criteria**:
- [x] Metronome beats at optimal cadence for runner level
- [x] Hit detection accurate within timing windows
- [x] Efficiency bonus applies correctly
- [x] Combo counter resets on miss
- [x] Only active during Cruise pace
- [x] Doesn't interfere with decision moments

**Files to create/modify**:
- `src/components/race/cadence-rhythm.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate during cruise)
- `src/engine/simulation/engine.ts` (apply rhythm bonuses)
- `public/audio/metronome-tick.mp3` (new audio asset)

---

### 3. Environmental Parallax Backgrounds
**Priority**: MEDIUM  
**Estimate**: 7 points

**Description**:  
Replace static backgrounds with dynamic parallax environments that respond to race progress, creating depth and immersion.

**Implementation Details**:
- Create `ParallaxEnvironment` component in `src/components/race/parallax-environment.tsx`
- Environment types (based on race location):
  1. **Stadium Track**: Stands, crowds, stadium lights
  2. **Road Race**: City buildings, trees, spectators
  3. **Trail Run**: Forest, mountains, nature elements
  4. **Beach Run**: Ocean, palm trees, sand dunes

- Parallax layers (3-4 layers per environment):
  ```typescript
  Layer 1 (Background): Mountains/sky - slowest scroll (0.1x speed)
  Layer 2 (Midground): Trees/buildings - medium scroll (0.3x speed)
  Layer 3 (Foreground): Track/road details - faster scroll (0.6x speed)
  Layer 4 (Ground): Track surface - full scroll (1x speed)
  ```

- Animation:
  - Layers scroll horizontally based on current pace
  - Sprint: 2x scroll speed
  - Jog: 0.5x scroll speed
  - Seamless looping backgrounds
  - CSS transform for GPU acceleration: `transform: translateX(-${offset}px) translateZ(0)`

- Visual design:
  - Position: Absolute behind all race UI
  - Low opacity to not distract: `opacity-30 dark:opacity-20`
  - Gradient overlays for readability
  - SVG or optimized image assets

- Time of day variation:
  - Morning: Warm orange/yellow tones, long shadows
  - Midday: Bright, high contrast
  - Evening: Cool blues, golden hour lighting

**Acceptance Criteria**:
- [x] Parallax scrolls smoothly without jank
- [x] Scroll speed matches current pace intensity
- [x] All 4 environment types implemented
- [x] Doesn't impact performance (maintain 60fps)
- [x] Works in dark mode with adjusted opacity
- [x] Can be disabled in settings (accessibility)

**Files to create/modify**:
- `src/components/race/parallax-environment.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate background)
- `public/images/environments/` (new directory with SVG assets)
- `src/store/settings-store.ts` (add parallax toggle)

---

### 4. Weather Particle Effects System
**Priority**: MEDIUM  
**Estimate**: 6 points

**Description**:  
Add dynamic weather particle effects (rain, snow, wind indicators) that respond to weather conditions and create atmospheric immersion.

**Implementation Details**:
- Create `WeatherParticles` component in `src/components/race/weather-particles.tsx`
- Weather types with effects:
  1. **Rain**: 
     - Falling raindrop particles (100-150 particles)
     - Puddle splash effects on ground
     - Screen "wetness" overlay (subtle gradient)
  2. **Snow**:
     - Falling snowflakes (50-80 particles)
     - Slower fall rate than rain
     - Gentle drift with wind
  3. **Wind**:
     - Directional arrow indicators
     - Animated leaves/debris particles
     - Screen edge wind streaks (headwind vs tailwind)
  4. **Fog**:
     - Drifting fog layers
     - Reduced visibility (fade effect on distant elements)
  5. **Heat**:
     - Heat wave distortion effect
     - Sun glare overlay
     - Shimmering ground effect

- Particle system:
  - Use Canvas API for performance
  - Particle pooling (reuse particles)
  - Physics: Gravity, wind force, turbulence
  - GPU-accelerated rendering

- Visual design:
  - Full-screen canvas overlay: `fixed inset-0 pointer-events-none z-10`
  - Particle opacity based on weather severity
  - Blend mode: `mix-blend-mode: screen` for rain, `normal` for snow
  - Performance: Reduce particle count on low-end devices

**Acceptance Criteria**:
- [x] All 5 weather types have distinct particle effects
- [x] Particles respond to wind direction/speed
- [x] Performance optimized (no frame drops)
- [x] Severity scales with weather intensity
- [x] Works on mobile devices (reduced particles)
- [x] Can be disabled in settings

**Files to create/modify**:
- `src/components/race/weather-particles.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate particles)
- `src/engine/weather/weather-engine.ts` (expose particle data)
- `src/store/settings-store.ts` (add weather effects toggle)

---

### 5. Breathing Control Mini-Mechanic
**Priority**: MEDIUM  
**Estimate**: 5 points

**Description**:  
Add interactive breathing visualization and control mechanic that helps players manage stress and recover during cruise segments.

**Implementation Details**:
- Create `BreathingControl` component in `src/components/race/breathing-control.tsx`
- Breathing states:
  1. **Calm (HR <150)**: Slow, regular breathing (12-14 breaths/min)
  2. **Elevated (HR 150-170)**: Faster breathing (18-22 breaths/min)
  3. **Labored (HR 170-190)**: Rapid breathing (25-30 breaths/min)
  4. **Gasping (HR >190)**: Erratic, fast breathing (35+ breaths/min)

- Interactive mechanic:
  - Display animated breathing indicator (expanding/contracting circle)
  - During high stress (HR >180), player can click to "Control Breathing"
  - Mini-game: Match 3 slow, deep breaths with visual guide
  - Success: -10 BPM, +5% focus recovery
  - Cooldown: 2 minutes between uses

- Visual design:
  - Position: Left side near heart rate monitor
  - Breathing indicator: Concentric circles that pulse in/out
  - Size changes with breath: `scale-75` (exhale) → `scale-100` (inhale)
  - Color: Calm `emerald-500` → Stressed `rose-500`
  - Control prompt: "Press B to control breathing" when available

- Audio: Optional breath sounds (inhale/exhale)

**Acceptance Criteria**:
- [x] Breathing rate matches heart rate accurately
- [x] Control mechanic available at correct times
- [x] Successful control reduces HR and improves focus
- [x] Visual animation smooth and calming
- [x] Cooldown prevents spam
- [x] Keyboard shortcut (B key) works

**Files to create/modify**:
- `src/components/race/breathing-control.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate mechanic)
- `src/engine/simulation/engine.ts` (apply breathing benefits)
- `public/audio/breath-in.mp3` (new audio asset)
- `public/audio/breath-out.mp3` (new audio asset)

---

### 6. Body Stress Visualization System
**Priority**: MEDIUM  
**Estimate**: 7 points

**Description**:  
Create visual runner avatar showing real-time body part stress zones, injuries, and form breakdown for physical immersion.

**Implementation Details**:
- Create `BodyStressAvatar` component in `src/components/race/body-stress-avatar.tsx`
- Runner avatar:
  - Simplified humanoid silhouette (SVG)
  - Body zones: Head, Chest/Lungs, Core, Quads, Calves, Feet
  - Each zone has stress level: Normal → Fatigued → Stressed → Critical

- Stress calculation:
  ```typescript
  Legs (Quads/Calves): Based on muscle fatigue %
  Lungs: Based on hydration + energy levels
  Core: Based on overall fatigue + poor decisions
  Feet: Based on shoe durability + distance covered
  Head: Based on mental fatigue + focus level
  ```

- Visual design:
  - Position: Bottom-right corner, collapsible panel
  - Avatar size: `w-24 h-48`
  - Color coding zones:
    - Normal: `fill-slate-300 dark:fill-slate-700`
    - Fatigued: `fill-amber-400 dark:fill-amber-600`
    - Stressed: `fill-orange-500 dark:fill-orange-600`
    - Critical: `fill-red-500 dark:fill-red-600 animate-pulse`
  - Hover tooltip: Shows exact stress % for each zone
  - Warning icons for injuries: ⚠️ next to affected zone

- Injury system integration:
  - If breaking point occurs, highlight affected body part
  - Show visible "injury indicator" (crossed bandage icon)
  - Injury persists visually until race end
  - Affects post-race recovery time

**Acceptance Criteria**:
- [x] All 6 body zones track stress accurately
- [x] Color transitions smooth between stress levels
- [x] Injuries from breaking points display correctly
- [x] Hover tooltips show detailed information
- [x] Panel can be collapsed/expanded
- [x] Works on mobile (touch-friendly)

**Files to create/modify**:
- `src/components/race/body-stress-avatar.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate avatar)
- `src/engine/simulation/engine.ts` (calculate body zone stress)
- `src/engine/simulation/types.ts` (add BodyStress type)

---

## 🎨 Design System Compliance

All components MUST follow:
- **Backgrounds**: Subtle, not distracting - `opacity-20` to `opacity-40`
- **Animations**: 60fps target, GPU-accelerated transforms
- **Colors**: 
  - Flow/Calm: `blue-500`, `purple-500`, `emerald-500`
  - Stress: `amber-500` → `orange-500` → `red-500`
- **Typography**: `font-mono font-bold` for numerical stats
- **Dark Mode**: All elements must maintain visual quality in dark mode
- **Accessibility**: All interactive mechanics must have keyboard shortcuts

---

## 🧪 Testing Requirements

### Performance Tests
- Parallax rendering maintains 60fps
- Weather particles don't cause frame drops
- Multiple simultaneous animations (flow + weather + parallax)
- Mobile performance on mid-range devices

### Unit Tests
- Flow state calculation accuracy
- Rhythm timing windows correct
- Body stress zone mapping
- Breathing control cooldown logic

### Integration Tests
- Flow state benefits apply to simulation
- Rhythm bonuses stack correctly
- Weather particles sync with weather transitions
- Body stress updates real-time during race

### Manual QA Checklist
- [ ] Flow state The Zone activates/deactivates smoothly
- [ ] Rhythm system only active during Cruise
- [ ] All 4 parallax environments render correctly
- [ ] Weather particles match current conditions
- [ ] Breathing control reduces stress as expected
- [ ] Body avatar shows injuries after breaking points
- [ ] All effects work in dark mode
- [ ] Keyboard shortcuts functional (B for breathing)
- [ ] Settings toggles work (disable parallax, weather, etc.)

---

## 📦 Dependencies

No new dependencies required (use existing libraries).

---

## 🚀 Definition of Done

- [ ] All 6 tasks completed and tested
- [ ] Performance benchmarks met (60fps)
- [ ] Design system guidelines followed
- [ ] Dark mode fully supported
- [ ] Accessibility features implemented (keyboard shortcuts, toggles)
- [ ] Mobile optimization complete
- [ ] Code reviewed and merged to master
- [ ] User feedback collected on immersion quality

---

## 📊 Success Metrics

Track in analytics:
- Flow State The Zone activation rate (target: 30% of races)
- Rhythm mechanic engagement (% of races where used)
- Breathing control usage rate
- Settings: % users who disable effects (should be <10%)
- Average race engagement time (should increase)
- User reported "immersion score" (survey)

---

## 🎯 Next Sprint Preview

Sprint 37 will focus on **Social Competition & Community Features** including live ghost runners, global leaderboards, spectator mode, and rival proximity alerts.
