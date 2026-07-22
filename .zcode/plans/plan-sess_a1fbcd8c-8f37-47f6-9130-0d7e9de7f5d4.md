# Implementation Plan: Endorphins, Addiction & Mobile-First UX

## 📋 Overview
This plan adds an endorphins/addiction mechanic to the race system and improves mobile-first UX across all race components. The system integrates seamlessly with existing breaking points, desperation mode, and runner's high mechanics.

---

## 🎯 Phase 1: Core Endorphins System (Foundation)

### 1.1 Create Type Definitions
**File: `src/engine/endorphins/endorphin-types.ts` (NEW)**
- Define `EndorphinState` interface with:
  - `currentLevel: number` (0-100, current endorphin intensity)
  - `addictionLevel: number` (0-100, long-term addiction)
  - `cravingIntensity: number` (0-10, desire to push)
  - `lastEndorphinKm: number` (track when last triggered)
  - `totalEndorphinUses: number` (lifetime counter)
  - `isActive: boolean` (currently in endorphin rush)
  - `activeEffects: EndorphinEffects` (current buffs)
  
- Define `EndorphinEffects` interface:
  - `energyBoost: number`
  - `paceBonus: number` (seconds per km)
  - `painSuppression: number` (reduces fatigue impact)
  - `confidenceBoost: number`
  - `duration: number` (km remaining)

- Define `WithdrawalEffects` interface:
  - `energyPenalty: number`
  - `focusPenalty: number`
  - `confidencePenalty: number`
  - `mentalFatiguePenalty: number`

### 1.2 Add Endorphin State to SimulationState
**File: `src/types/engine.ts` (MODIFY)**
- Add to `SimulationState` interface:
  ```typescript
  endorphinState?: EndorphinState;
  hasUsedEndorphins?: boolean;
  ```

### 1.3 Add Addiction to Runner Profile
**File: `src/runner/runner-types.ts` (MODIFY)**
- Add to `RunnerProfile` interface:
  ```typescript
  addictionProfile?: {
    addictionLevel: number; // 0-100
    lastEndorphinRaceDay: number | null;
    totalEndorphinUses: number;
    recoveryDays: number;
    withdrawalActive: boolean;
  };
  ```
- Update `DEFAULT_RUNNER_PROFILE` with null/zero defaults

---

## 🎯 Phase 2: Endorphin Engine & Logic

### 2.1 Create Endorphin Engine
**File: `src/engine/endorphins/endorphin-engine.ts` (NEW)**
- Create `EndorphinEngine` class with methods:
  - `triggerEndorphinRush(state, intensity)` - Activate endorphin effects
  - `updateEndorphinEffects(state, km)` - Decay effects over distance
  - `calculateWithdrawalEffects(addictionLevel, daysSinceUse)` - Get penalties
  - `checkCravingTrigger(state, addictionLevel)` - Determine if craving prompt shows
  - `applyEndorphinEffects(state, effects)` - Modify stats
  - `resolveEndorphinCrash(state)` - Post-rush effects

### 2.2 Create Endorphin Database
**File: `src/engine/endorphins/endorphin-database.ts` (NEW)**
- Define endorphin intensity levels (mild, moderate, intense, extreme)
- Define effect curves (duration, power, crash severity)
- Define addiction progression formulas
- Define withdrawal effect calculations

### 2.3 Integrate with Simulation Engine
**File: `src/engine/simulation/engine.ts` (MODIFY)**
- Import `EndorphinEngine`
- Initialize endorphin state at race start
- Apply withdrawal effects if addiction > 50 and no recent use
- Update endorphin effects each km (duration decay)
- Check for endorphin crash conditions
- Add endorphin events to event feed

---

## 🎯 Phase 3: UI Components - Breaking Points Enhancement

### 3.1 Add "Push Through Pain" Option
**File: `src/components/race/breaking-point.tsx` (MODIFY)**
- Add new recovery option with endorphin trigger:
  ```typescript
  {
    id: "push_through_endorphins",
    action: { 
      en: "Push Through Pain 💪", 
      id: "Terobos Rasa Sakit 💪" 
    },
    description: {
      en: "Ignore the pain and push harder. Triggers endorphin rush.",
      id: "Abaikan rasa sakit dan dorong lebih keras. Memicu aliran endorfin."
    },
    risk: "high",
    triggersEndorphins: true
  }
  ```

- Update `BreakingPointEffects` type:
  ```typescript
  interface BreakingPointEffects {
    // ... existing
    triggersEndorphins?: boolean;
    endorphinIntensity?: "mild" | "moderate" | "intense" | "extreme";
  }
  ```

- Add visual indicator for endorphin option (pink/purple glow)
- Increase button touch targets from current to `min-h-[48px]`
- Add `active:scale-95` for touch feedback

### 3.2 Mobile UX Improvements
- Change text sizing: `text-xs` → `text-sm sm:text-base`
- Add safe area padding: `px-4 safe-area-inset`
- Increase modal padding on mobile
- Larger emoji/icons on small screens

---

## 🎯 Phase 4: Endorphin Rush Overlay Component

### 4.1 Create Endorphin Rush Overlay
**File: `src/components/race/endorphin-rush.tsx` (NEW)**
- Full-screen overlay with visual effects:
  - **Background**: Pink/purple gradient vignette pulsing
  - **Particle system**: Rising sparkles (using framer-motion)
  - **Center message**: "ENDORPHIN RUSH!" with glow effect
  - **Effects display**: Show buffs being applied
  - **Warning**: Addiction risk indicator
  
- Animation sequence:
  1. Flash of light (0.2s)
  2. Particles rise (0.5s)
  3. Stats boost animation (0.3s)
  4. Auto-dismiss after 2s total

- Mobile optimizations:
  - Reduce particle count on mobile
  - Simpler animations for performance
  - Larger text for readability

### 4.2 Create Endorphin Crash Overlay
**File: `src/components/race/endorphin-crash.tsx` (NEW)**
- Shows when endorphin effects wear off during race
- Visual: Desaturated colors, slight vignette
- Message: "The rush fades..." with stat penalties
- Auto-dismiss after 3s

---

## 🎯 Phase 5: Post-Race Addiction System

### 5.1 Create Post-Race Craving Screen
**File: `src/components/race/post-race-craving.tsx` (NEW)**
- Shows after race if addiction > 30
- Display:
  - Current addiction level with progress bar
  - Craving intensity visualization
  - Message about next race urge
  - "The urge to push harder grows..."
  
- Mobile-first design:
  - Card-based layout
  - Large touch-friendly "Continue" button
  - Swipeable to dismiss

### 5.2 Update Race Screen Integration
**File: `src/features/race/race-screen.tsx` (MODIFY)**
- Import new overlays
- Add endorphin state management
- Integrate endorphin rush triggers
- Show post-race craving if applicable
- Track endorphin use in race result

### 5.3 Update Runner Engine
**File: `src/runner/runner-engine.ts` (MODIFY)**
- Update addiction profile after race
- Calculate recovery days
- Apply withdrawal effects for next race
- Persist addiction state

---

## 🎯 Phase 6: Mobile UX Polish (All Components)

### 6.1 Track Position Visualizer
**File: `src/components/race/track-position-visualizer.tsx` (MODIFY)**
- Increase height: `h-28` → `h-36 sm:h-40 md:h-48`
- Larger runner avatars on mobile
- Bigger text labels: `text-[8.5px]` → `text-xs sm:text-sm`
- Touch-friendly view mode toggle buttons

### 6.2 Coach Radio
**File: `src/components/race/coach-radio.tsx` (MODIFY)**
- Increase icon size: `w-10 h-10` → `w-12 h-12`
- Larger text: `text-sm` → `text-base`
- Better mobile positioning: `bottom-20` → `bottom-24 sm:bottom-20`
- Touch dismiss area

### 6.3 Desperation Mode
**File: `src/components/race/desperation-mode.tsx` (MODIFY)**
- Add endorphin integration (desperation = high endorphin potential)
- Larger buttons: `p-4` → `p-5 min-h-[56px]`
- Bigger text: `text-sm` → `text-base sm:text-lg`
- Add haptic feedback triggers

### 6.4 Clutch Moment
**File: `src/components/race/clutch-moment.tsx` (MODIFY)**
- "Go For It" option triggers endorphins
- Larger decision buttons for mobile
- Increase touch targets
- Better mobile layout

### 6.5 Dramatic Event
**File: `src/components/race/dramatic-event.tsx` (MODIFY)**
- Responsive text sizing
- Larger buttons: `min-h-[48px]`
- Better modal scrolling on mobile

### 6.6 Flashback Overlay
**File: `src/components/race/flashback-overlay.tsx` (MODIFY)**
- No major changes needed (already well-designed)
- Just ensure touch targets are adequate

---

## 🎯 Phase 7: Haptic Feedback System

### 7.1 Create Haptic Hook
**File: `src/hooks/use-haptic.ts` (NEW)**
- Create `useHaptic()` hook similar to `useSound()`
- Support vibration patterns:
  - `light`: 10ms tap
  - `medium`: 20ms tap
  - `heavy`: 30ms tap
  - `success`: [10, 50, 20]
  - `error`: [20, 100, 20, 100, 20]
  - `endorphinRush`: [30, 50, 40, 50, 50] (escalating)

### 7.2 Integrate Haptics
- Breaking point decisions: medium haptic
- Endorphin rush: custom pattern
- Button presses: light haptic
- Race events: contextual haptics

---

## 🎯 Phase 8: Settings & Configuration

### 8.1 Update Settings Store
**File: `src/store/settings-store.ts` (MODIFY)**
- Add `hapticFeedback: boolean` setting
- Add `endorphinWarnings: boolean` setting (show addiction warnings)

### 8.2 Update Settings UI
- Add haptic feedback toggle
- Add endorphin warnings toggle
- Mobile-friendly settings layout

---

## 📊 Implementation Order

### **Week 1: Foundation** ✅
1. Create endorphin types (`endorphin-types.ts`)
2. Update `SimulationState` and `RunnerProfile` types
3. Create `EndorphinEngine` class
4. Create endorphin database
5. Add "Push Through Pain" option to breaking points

### **Week 2: Visual Effects & Integration** ✅
6. Create endorphin rush overlay component
7. Create endorphin crash overlay component
8. Integrate with simulation engine
9. Update breaking point component with endorphin option

### **Week 3: Addiction & Post-Race** ✅
10. Create post-race craving component
11. Update runner engine for addiction tracking
12. Integrate desperation mode with endorphins
13. Integrate clutch moments with endorphins

### **Week 4: Mobile UX Polish** ✅
14. Update all component touch targets to 48px minimum
15. Improve text sizing across all components
16. Create and integrate haptic feedback hook
17. Test on actual mobile devices
18. Performance optimization for mobile

---

## 🔧 Technical Considerations

### State Management
- Use existing pattern: React state in `race-screen.tsx` for active race
- Persist addiction in `RunnerProfile` via `runner-store.ts`
- No new Zustand stores needed (keep it simple)

### Performance
- Endorphin particles: Limit to 20 particles on mobile
- Use `will-change` CSS for animations
- Debounce haptic feedback to avoid spam
- Lazy load overlays (code splitting if needed)

### Backward Compatibility
- All new fields are optional with `?`
- Existing saves work without endorphin data
- Graceful degradation if features disabled

### Testing Strategy
- Unit tests for endorphin engine calculations
- Visual tests for mobile layouts
- Test on real devices (iOS Safari, Android Chrome)
- Test with different addiction levels
- Test withdrawal effects

---

## 🎨 Visual Design Tokens

### Endorphin Colors
```typescript
const ENDORPHIN_COLORS = {
  glow: "from-pink-500 via-purple-500 to-blue-500",
  text: "text-pink-300",
  border: "border-pink-500",
  bg: "bg-pink-950/90",
  particle: "bg-gradient-to-t from-pink-400 to-purple-500",
  vignette: "rgba(219, 39, 119, 0.3)" // pink-600
};
```

### Touch Targets
```typescript
const TOUCH_SIZES = {
  minimum: "min-h-[44px] min-w-[44px]", // iOS minimum
  comfortable: "min-h-[48px] min-w-[48px]", // Recommended
  large: "min-h-[56px] min-w-[56px]" // For primary actions
};
```

---

## ✅ Success Criteria

1. **Endorphins trigger correctly** from breaking points and desperation
2. **Visual effects work smoothly** on mobile (60fps)
3. **Addiction tracks properly** across races
4. **Withdrawal effects apply** when appropriate
5. **All touch targets** are minimum 44px
6. **Text is readable** on smallest mobile screens
7. **Haptic feedback enhances** experience without being annoying
8. **No performance regression** on low-end devices

---

## 🚀 Quick Wins for Immediate Testing

After Phase 1-2 complete:
1. Add one endorphin option to breaking points
2. Simple pink flash effect (no particles yet)
3. Basic addiction tracking
4. Test the core mechanic

This allows early user feedback before building full visual system.

---

## 📝 Files Summary

### New Files (8)
1. `src/engine/endorphins/endorphin-types.ts`
2. `src/engine/endorphins/endorphin-engine.ts`
3. `src/engine/endorphins/endorphin-database.ts`
4. `src/components/race/endorphin-rush.tsx`
5. `src/components/race/endorphin-crash.tsx`
6. `src/components/race/post-race-craving.tsx`
7. `src/hooks/use-haptic.ts`
8. `src/components/ui/particle-system.tsx` (reusable)

### Modified Files (12)
1. `src/types/engine.ts`
2. `src/runner/runner-types.ts`
3. `src/engine/simulation/engine.ts`
4. `src/components/race/breaking-point.tsx`
5. `src/components/race/track-position-visualizer.tsx`
6. `src/components/race/coach-radio.tsx`
7. `src/components/race/desperation-mode.tsx`
8. `src/components/race/clutch-moment.tsx`
9. `src/components/race/dramatic-event.tsx`
10. `src/features/race/race-screen.tsx`
11. `src/runner/runner-engine.ts`
12. `src/store/settings-store.ts`

**Total: 20 files (8 new, 12 modified)**

---

Ready to implement! Starting with Phase 1: Type definitions and foundation.