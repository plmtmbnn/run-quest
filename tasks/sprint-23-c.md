# Sprint 23-C: Calendar UI HUD & Loop Overhaul

**Duration**: 0.5 week  
**Goal**: Overhaul the UI layer to visually present the in-game calendar, remove real-world timers, and integrate Energy Point (EP) constraints into core gameplay actions.
**Epic**: Long-Term Investment - Phase 3 (UI & Pacing)  
**Expected Impact**: Connects the player visually to the in-game timeline, ensures immediate gameplay progression without real-world daily locking, and introduces meaningful strategic energy management.

---

## 🎯 Objectives

1. Create a persistent in-game **Game Clock HUD** displaying derived calendar coordinates, runner age, and stamina (EP) status.
2. Replace all real-world date reliance (`dayjs`, midnight countdown timers, daily locks) on the Home Screen with in-game `dayIndex` seeds.
3. Establish EP cost controls on the primary gameplay buttons (Compete: 25 EP, Train: 30 EP) with clear error feedback and disabled states.
4. Add manual calendar progression triggers ("Rest" action) to let the player step through days, refill EP, and regenerate challenges.

---

## 📋 Completed Tasks

### Task 1: `GameClock` HUD Component
- **Implementation**: Created the `GameClock` component at [game-clock.tsx](file:///c:/Work/Me/run-quest/src/components/ui/game-clock.tsx).
- **Features**:
  - Displays `Year X, Month Y, Week Z, Day W` calculated from `dayIndex`.
  - Shows current `Age` dynamically.
  - Renders a responsive, color-coded EP (Energy Points) Stamina Bar.
  - Renders an explicit **"Rest (1 Day)"** button calling `doAction("rest")`.
- **UI Integration**: Anchored the widget at the top of the main container in [home-screen.tsx](file:///c:/Work/Me/run-quest/src/features/home/home-screen.tsx).

### Task 2: Remove Real-World Timers & Overhaul Daily Race Board
- **Implementation**:
  - Removed `dayjs` import and `getSecondsUntilMidnight` count-down loop from [home-screen.tsx](file:///c:/Work/Me/run-quest/src/features/home/home-screen.tsx).
  - Modified [generator.ts](file:///c:/Work/Me/run-quest/src/services/challenge/generator.ts) so `generateDailyRaceBoard` accepts numeric seeds (`dayIndex`) instead of calendar dates.
  - Overhauled the daily lock banner: replaced the countdown with a **"Day's Races Completed!"** card advising the player to click "Rest" to advance the day.
  - Standardized fallback challenges on briefing, preparation, race, and result screens to compile fallback scenarios using the numerical `dayIndex` seed.

### Task 3: Hook Up Action Costs & EP Warnings
- **Race Cost**: Selecting a race now subtracts **25 EP** (firing `doAction("compete")`). If `energy < 25`, the button is disabled and displays `"Need 25 EP to Compete"`.
- **Training Cost**: Recording daily training now subtracts **30 EP** (firing `doAction("train")`). If `energy < 30`, the button in [training-screen.tsx](file:///c:/Work/Me/run-quest/src/features/training/training-screen.tsx) is disabled and displays `"Need 30 EP to Train"`.
- **History Mapping**: Fixed date formatting on the training history list to display in-game day numbers (`Day X`) rather than Unix epoch date objects.

---

## 🎯 Verification & Build Results

- **Biome Formatting**: Ran `pnpm format` which completed successfully with zero syntax errors.
- **Production Build**: Production build completes **100% successfully** (`pnpm build`).
- **Retroactive Compatibility**: Kept schemas compatible with string-based legacy saves by upgrading `boardId` to `z.union([z.string(), z.number()])` in [schemas.ts](file:///c:/Work/Me/run-quest/src/storage/schemas.ts).
