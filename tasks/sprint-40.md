# Sprint 40: Enhanced Track Progress Visualization & Mobile UI Optimization

**Sprint Goal**: Enhance race track progress visualization with GPX-style horizontal track display and optimize mobile UI with collapsible floating navbar for improved focus on track progress and in-game statistics.

**Priority**: High  
**Complexity**: Medium-High  
**Target Completion**: Sprint 40

---

## 📋 Overview

This sprint focuses on two major improvements:
1. **Track Progress Visualization**: Transform the current track position visualizer into a horizontal, flag-to-flag style display inspired by GPX route previews, with enhanced visual clarity and unique track profiles for each race.
2. **Mobile UI Optimization**: Implement a collapsible floating navbar for mobile view that allows players to focus on track progress and statistics while keeping controls accessible.

---

## 🎯 Task Breakdown

### Task 1: Horizontal Flag Track Progress System
**Priority**: High  
**Estimated Effort**: 4-6 hours

#### Acceptance Criteria:
- [ ] Replace current vertical/circular track visualizer with horizontal flag-to-flag layout
- [ ] Track spans full width with start flag (🚩) on left and finish flag (🏁) on right
- [ ] Runner positions displayed as animated avatars/dots moving horizontally across track
- [ ] Elevation profile rendered as a subtle background silhouette beneath the track
- [ ] Distance markers (km splits) displayed along the track at regular intervals
- [ ] Player runner highlighted with distinct styling (e.g., glowing border, larger size)
- [ ] Ghost runners displayed with semi-transparent styling
- [ ] Smooth animation transitions as runners progress (tied to `simSpeed`)
- [ ] Terrain indicators (uphill ⛰️, downhill ⬇️, flat ➡️) shown at appropriate sections
- [ ] Responsive design: full-width on desktop, optimized scrolling on mobile

#### Implementation Notes:
```typescript
// Component: src/components/race/horizontal-track-progress.tsx

interface HorizontalTrackProgressProps {
  runners: Array<{
    id: string;
    name: string;
    isPlayer: boolean;
    distance: number;
    accumulatedTime: number;
    isDNF: boolean;
    isGhost?: boolean;
  }>;
  currentKm: number;
  raceDistance: number;
  simSpeed: 1 | 2 | 5;
  isPaused: boolean;
  routeProfileId?: string;
  surface: "road" | "trail" | "track";
  playerEnergy: number;
}

// Visual Structure:
// 🚩 [====TRACK-WITH-ELEVATION-PROFILE====] 🏁
//    👤  🏃  👤   (animated runner positions)
//    0km  5km  10km  15km  21km (distance markers)
```

#### Design Tokens:
- Track background: `bg-slate-100 dark:bg-slate-800`
- Elevation profile: Semi-transparent SVG path with `fill-slate-300/30 dark:fill-slate-600/30`
- Player runner: `bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg ring-2 ring-emerald-400`
- Ghost runner: `bg-slate-400/50 dark:bg-slate-500/50 opacity-70`
- Distance markers: `text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400`
- Flags: Large emoji or custom SVG icons

---

### Task 2: Ensure Unique Track Profiles for All Races
**Priority**: High  
**Estimated Effort**: 2-3 hours

#### Acceptance Criteria:
- [ ] Verify all races in `race-schedule-database.ts` have assigned `routeProfileId`
- [ ] Ensure no duplicate or generic placeholder profiles for major races
- [ ] Each race category within a race schedule should have appropriate terrain variation
- [ ] Add missing route profiles to `src/data/route-profiles.ts` if needed
- [ ] Test that track visualizer correctly renders different elevation profiles for:
  - World Majors (Boston Heartbreak Hill, Berlin Flat, NYC Verrazzano, etc.)
  - Indonesian Signature Races (Bromo, Rinjani, Tahura, Bali Coastal, etc.)
  - Generic fallbacks (flat city, rolling hills, mountain trail, coastal, etc.)

#### Implementation Notes:
```typescript
// File: src/scheduling/race-schedule-database.ts
// Ensure ALL RaceSchedule entries have routeProfileId set

// Example:
{
  id: "monthly_nusantara_10k",
  routeProfileId: "generic_rolling_hills", // ✅ Unique profile
  categories: [
    { id: "5k", routeProfileId: "generic_flat_city" },  // ✅ Can override per category
    { id: "10k", routeProfileId: "generic_rolling_hills" },
    { id: "hm", routeProfileId: "generic_rolling_hills" },
    { id: "fm", routeProfileId: "generic_rolling_hills" },
  ]
}

// Validation script to run:
// Check all races have routeProfileId, no undefined or "generic_track" overuse
```

#### Validation Checklist:
- [ ] All monthly/community races have unique profiles
- [ ] All national championships have unique profiles
- [ ] All world majors have signature profiles (Boston ≠ Berlin ≠ NYC)
- [ ] All Indonesian signature races have distinct terrain profiles
- [ ] Generic fallbacks used only for truly generic/placeholder races

---

### Task 3: Mobile Floating Navbar with Collapsible Sections
**Priority**: High  
**Estimated Effort**: 5-7 hours

#### Acceptance Criteria:
- [ ] Create `<MobileRaceNavbar>` component that appears only on mobile breakpoints (`md:hidden`)
- [ ] Navbar floats at bottom of screen with semi-transparent backdrop blur
- [ ] Collapsible sections for:
  - **Stats Panel**: Energy, Hydration, Focus, Heart Rate, Pace (collapsible)
  - **Actions Panel**: Nutrition consumption, Pacing adjustments, Emergency actions (collapsible)
  - **Leaderboard Panel**: Live standings, rival positions (collapsible)
- [ ] Each section has toggle button with expand/collapse animation
- [ ] Default state: All sections collapsed to maximize track visibility
- [ ] Smooth slide-up/slide-down animations using Framer Motion
- [ ] Semi-transparent background with backdrop blur for readability
- [ ] Sticky positioning that stays visible during scrolling
- [ ] Minimal height when collapsed (e.g., 60px), expands to ~300px when open
- [ ] Only one section can be expanded at a time (accordion behavior)
- [ ] Quick-access mini indicators visible even when collapsed (e.g., energy %, current km)

#### Implementation Notes:
```typescript
// Component: src/components/race/mobile-race-navbar.tsx

interface MobileRaceNavbarProps {
  stats: {
    energy: number;
    hydration: number;
    focus: number;
    pace: number;
  };
  currentKm: number;
  raceDistance: number;
  runners: Array<{ id: string; name: string; distance: number; isPlayer: boolean }>;
  activeConsumables: Record<string, number>;
  onConsumeItem: (itemKey: string) => void;
  onPacingChange: (pacing: PacingPlan) => void;
  isFinished: boolean;
}

// Visual Structure:
// ┌─────────────────────────────────┐
// │  [Stats ▼] [Actions] [Board]   │  ← Collapsed tabs
// └─────────────────────────────────┘
//
// When expanded:
// ┌─────────────────────────────────┐
// │  [Stats ▲] [Actions] [Board]   │
// │  ┌───────────────────────────┐ │
// │  │ Energy: ████████░░ 80%    │ │
// │  │ Hydration: ██████░░░░ 60% │ │
// │  │ Focus: ███████████ 100%   │ │
// │  │ Pace: 5:30/km             │ │
// │  └───────────────────────────┘ │
// └─────────────────────────────────┘
```

#### Design Tokens:
- Navbar background: `bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg`
- Border: `border-t border-slate-200 dark:border-slate-800`
- Tab buttons: `px-3 py-2 rounded-t-lg bg-slate-100 dark:bg-slate-800`
- Active tab: `bg-white dark:bg-slate-900 border-t-2 border-emerald-500`
- Expanded panel: `max-h-[300px] overflow-y-auto`
- Collapsed height: `h-[60px]`
- Shadow: `shadow-[0_-4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)]`

---

### Task 4: Desktop vs Mobile Layout Optimization
**Priority**: Medium  
**Estimated Effort**: 2-3 hours

#### Acceptance Criteria:
- [ ] Desktop view: Keep existing sidebar/column layout for stats and actions (unchanged)
- [ ] Mobile view: Hide desktop stats panels, show only `<MobileRaceNavbar>`
- [ ] Track progress display takes full width on mobile (remove side margins)
- [ ] Mobile header condensed: Race name truncated, speed controls smaller
- [ ] Ensure no duplicate UI elements between desktop and mobile views
- [ ] Test on common mobile screen sizes: iPhone SE (375px), iPhone 14 (390px), Android medium (412px)

#### Implementation Notes:
```typescript
// In race-screen.tsx:

return (
  <div className="min-h-screen ...">
    {/* ... existing code ... */}
    
    {/* Desktop Stats Sidebar - Hidden on Mobile */}
    <aside className="hidden md:block ...">
      {/* Existing stats panels */}
    </aside>
    
    {/* Mobile Floating Navbar - Hidden on Desktop */}
    <MobileRaceNavbar 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      {...props}
    />
    
    {/* Track Progress - Full width on mobile */}
    <div className="w-full px-0 md:px-4">
      <HorizontalTrackProgress {...props} />
    </div>
  </div>
);
```

---

### Task 5: Integration & Testing
**Priority**: High  
**Estimated Effort**: 3-4 hours

#### Acceptance Criteria:
- [ ] Replace `<TrackPositionVisualizer>` with `<HorizontalTrackProgress>` in `race-screen.tsx`
- [ ] Add `<MobileRaceNavbar>` to race screen layout
- [ ] Test horizontal track progress with all sim speeds (1x, 2x, 5x)
- [ ] Test with different race distances (5K, 10K, HM, FM, 50K, 100K)
- [ ] Test with different terrain profiles (flat, hilly, mountain, coastal)
- [ ] Test ghost runner display on horizontal track
- [ ] Test mobile navbar on real mobile devices or browser dev tools
- [ ] Verify no performance regression with animations
- [ ] Test collapsible sections: smooth animations, no layout jank
- [ ] Test accessibility: keyboard navigation, screen reader labels
- [ ] Verify dark mode styling for all new components

#### Testing Checklist:
- [ ] Desktop (1920x1080): Track spans full width, elevation visible, runners animate smoothly
- [ ] Tablet (768px): Track adapts to width, navbar starts appearing
- [ ] Mobile (375px): Track full width, navbar sticky at bottom, sections collapse properly
- [ ] Ghost race: Ghost runner displayed with transparency on horizontal track
- [ ] Fast speed (5x): Animations keep up, no stuttering
- [ ] Long race (100K ultra): Track handles long distances, distance markers scale appropriately
- [ ] Mountain profile: Elevation profile shows significant ups/downs
- [ ] Flat profile: Minimal elevation variation visible

---

## 🎨 UI/UX Design Compliance

All components must strictly follow `docs/ui-ux-guidelines.md`:

### Color Palette:
- Primary: `emerald-500` for player highlights
- Secondary: `slate-400` for ghosts and opponents
- Surface: `bg-white dark:bg-slate-900`
- Borders: `border-slate-200 dark:border-slate-800`

### Typography:
- Headers: `font-heading font-black`
- Numbers/Stats: `font-mono font-bold`
- Distance markers: `text-[9px] md:text-[10px] font-mono uppercase tracking-wider`

### Micro-interactions:
- Runner position transitions: `transition-all duration-500 ease-out`
- Navbar expand/collapse: `transition-all duration-300 ease-in-out`
- Tab switches: `transition-colors duration-200`

### Dark Mode:
- All components must support dark mode with proper contrast
- Elevation profiles adjust opacity for dark backgrounds
- Navbar backdrop blur works in both light and dark themes

---

## 📁 Files to Modify

### New Files:
- `src/components/race/horizontal-track-progress.tsx`
- `src/components/race/mobile-race-navbar.tsx`

### Modified Files:
- `src/features/race/race-screen.tsx` (integrate new components)
- `src/scheduling/race-schedule-database.ts` (verify routeProfileId for all races)
- `src/data/route-profiles.ts` (add missing profiles if needed)

---

## 🚀 Testing & Validation

### Manual Testing:
1. Run race with 5K distance on flat profile → Verify horizontal track renders correctly
2. Run race with 42K distance on hilly profile → Verify elevation profile visible
3. Run race with ghost active → Verify ghost runner displayed with transparency
4. Switch to mobile view (375px) → Verify navbar appears, track is full width
5. Expand Stats panel on mobile → Verify smooth animation, other panels collapse
6. Switch to 5x speed → Verify runner animations keep up without lag

### Performance Testing:
- Monitor FPS during race simulation with horizontal track
- Ensure navbar animations don't cause jank on low-end mobile devices
- Verify memory usage doesn't increase significantly with new components

---

## 📝 Definition of Done

- [ ] All acceptance criteria met for Tasks 1-5
- [ ] Code reviewed and approved
- [ ] UI/UX design guidelines followed
- [ ] Dark mode tested and working
- [ ] Mobile responsiveness verified on real devices
- [ ] No console errors or warnings
- [ ] Performance benchmarks meet standards (60fps on desktop, 30fps on mobile)
- [ ] Documentation updated (if needed)
- [ ] Sprint demo prepared with before/after comparison

---

## 🔄 Dependencies

- Requires existing `route-profiles.ts` data structure (Sprint 39)
- Requires `race-schedule-database.ts` race data (existing)
- Requires Framer Motion library (already installed)
- Requires Tailwind CSS (already configured)

---

## 📊 Success Metrics

- **Visual Clarity**: Players can easily identify their position on the horizontal track
- **Mobile Usability**: Players can access stats/actions without obscuring track view
- **Performance**: Smooth animations at all sim speeds with no frame drops
- **Uniqueness**: Each race feels distinct with unique elevation profiles
- **Engagement**: Improved focus on track progress leads to more immersive race experience

---

## 🎯 Sprint Retrospective Notes

**What went well:**
- [To be filled after sprint completion]

**What could be improved:**
- [To be filled after sprint completion]

**Action items for next sprint:**
- [To be filled after sprint completion]

---

**Sprint Start Date**: [To be filled]  
**Sprint End Date**: [To be filled]  
**Sprint Lead**: [To be assigned]  
**Reviewers**: [To be assigned]
