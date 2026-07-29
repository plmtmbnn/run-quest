# Sprint 39: Race Enhancements & Route Profiles

**Goal**: Deliver unique 2D route profiles with elevation visualizer, parallax background rendering, SVG terrain paths, real-time incline/decline indicators, and optimized strategic race pace timing (10s/km) across 30+ signature world and regional races.

**Focus**: Boost race visual immersion and tactical depth by mapping every scheduled race and challenge to realistic terrain topology (flat, rolling hills, mountain climb, downhill, undulating) and giving players clear visual feedback during race execution.

---

## 🎯 Sprint Objectives
- **Route Profile System**: Define full TypeScript schemas (`src/types/route-profile.ts`) and create comprehensive dataset (`src/data/route-profiles.ts`) for 30+ race routes (World Majors like Boston Heartbreak Hill, Berlin Flat, London Marathon, plus Indonesian signature routes like Bromo Marathon, Rinjani Skyrace, Mount Arjuno Trail, etc.).
- **2D Elevation Visualizer**: Upgrade `TrackPositionVisualizer` (`src/components/race/track-position-visualizer.tsx`) with dynamic elevation curves, parallax layer graphics, gradient fill terrain paths, and uphill/downhill gradient indicators.
- **Race Schedule Database Integration**: Assign `routeProfileId` to every category and schedule across `src/scheduling/race-schedule-database.ts` and update `src/scheduling/race-calendar-types.ts`.
- **Strategic Pace Optimization**: Adjust strategic mode 1x tick timer from 20s/km to 10s/km in `src/features/race/race-screen.tsx` to provide faster, more responsive gameplay pacing.
- **Event Throttling & Stability**: Implement notification throttling and state deduplication during fast-forward mode to prevent popup spam.

---

## 📋 Technical Architecture & Components

### 1. Route Profile Types & Data Engine
- **File**: [`src/types/route-profile.ts`](file:///c:/Work/Me/run-quest/src/types/route-profile.ts)
  - `RouteProfile`: ID, name, description, totalDistanceKm, elevationGainMeters, elevationLossMeters, maxElevationMeters, minElevationMeters, terrainType (`flat` | `rolling` | `mountain` | `downhill` | `undulating`), elevationPoints (`distanceKm`, `elevationMeters`).
  - Helper functions for grade percentage calculation, current segment elevation, and terrain difficulty multipliers.
- **File**: [`src/data/route-profiles.ts`](file:///c:/Work/Me/run-quest/src/data/route-profiles.ts)
  - 30+ handcrafted route profiles with realistic elevation profiles.

### 2. Enhanced Track & Elevation Visualizer
- **File**: [`src/components/race/track-position-visualizer.tsx`](file:///c:/Work/Me/run-quest/src/components/race/track-position-visualizer.tsx)
  - Interactive SVG elevation canvas showing current runner position on topography map.
  - Grade indicators: ▲ Uphill (+ slope%), ▼ Downhill (- slope%), ➖ Flat.
  - Smooth parallax background elements reflecting mountain, city, or forest terrain types.
  - Runner milestone indicators, finish line flag, and micro-animations.

### 3. Calendar & Database Mapping
- **Files**: [`src/scheduling/race-calendar-types.ts`](file:///c:/Work/Me/run-quest/src/scheduling/race-calendar-types.ts), [`src/scheduling/race-schedule-database.ts`](file:///c:/Work/Me/run-quest/src/scheduling/race-schedule-database.ts)
  - Extended `RaceCategory` and `RaceSchedule` interfaces with optional `routeProfileId`.
  - Linked every race item in `race-schedule-database` to its corresponding `RouteProfile`.

### 4. Race Screen & Strategic Pace Adjustments
- **File**: [`src/features/race/race-screen.tsx`](file:///c:/Work/Me/run-quest/src/features/race/race-screen.tsx)
  - Reduced 1x pace tick from 20s/km down to 10s/km.
  - Dynamic route profile resolver with fallback options (`getRouteProfileForChallenge`).
  - Throttled toast/popup event generation during high-speed fast-forward simulation.

---

## 🧪 Verification & Acceptance Criteria
- [x] All 30+ race categories have assigned route profiles in `race-schedule-database.ts`.
- [x] 2D Elevation Visualizer renders SVG curve, grade percentage, and parallax background accurately.
- [x] Strategic pace simulation advances smoothly at 10s/km at 1x speed.
- [x] Zero console warnings or TypeScript type errors on `race-calendar.tsx` or `race-screen.tsx`.
