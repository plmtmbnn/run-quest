# Sprint 28: Mobile UI/UX, Realism, and Rest Controls

**Goal**: Improve mobile usability, refine race registration realism, vary race economics, use real-world race names with dynamic year postfixes, and add floating rest controls.

---

## 🎯 Objectives & Tasks

### 1. Fix Player Stats Panel Mobile UI/UX
- [ ] Modify `src/features/home/home-screen.tsx`
- [ ] Refactor player stats panel from horizontal layout to vertical/grid layout:
  - Stack header info (Player Name/Profile) at the top.
  - Create a `grid grid-cols-3 gap-3` for stats (Money, Runs, Distance) on mobile viewports.
  - Wrap buttons cleanly to prevent overflow on 375px screens.

### 2. Random Starting Money (Max $100)
- [ ] Modify `src/engine/timeline/calendar.ts`
- [ ] Adjust `createInitialState(seed)` to generate random starting money between $10 and $100 using the `SeededRandom` instance.
- [ ] Align `resources.money` and `economy.currentBalance` with the rolled starting money.
- [ ] Update `startingMoney` in `src/economy/economy-balance.ts` to reflect the new starting balance range.

### 3. Advance Race Registration Realism
- [ ] Modify `src/components/scheduling/race-calendar.tsx` and `src/scheduling/race-calendar-engine.ts`
- [ ] Today's Races tab renamed to "🏁 Race Day".
- [ ] Restrict "Race Day" tab to only display races scheduled for today **that the player has already registered for**.
- [ ] Adjust registration windows in `src/scheduling/race-schedule-database.ts`:
  - Daily/weekly races: Registration opens 30 days before, closes 7 days before.
  - Ensure all non-tutorial races enforce at least a 7-day advance registration window.
  - Exclude tutorial/milestone races (`one_time_debut`) so they remain joinable instantly.

### 4. Registered Tab Status Badges
- [ ] Modify `src/components/scheduling/race-calendar.tsx`
- [ ] Replace clickable "End Race" / "Enter Race" buttons on the Registered tab with status badges:
  - `Soon`: Day index is in the future.
  - `Race Day`: Day index is today (renders clickable "Enter Race").
  - `Finished`: Race has been completed.
  - `DNS` (Did Not Start): Day index is in the past, but the race is not completed.

### 5. Unique Race Pricing and Indonesian/World Popular Race Names
- [ ] Modify `src/scheduling/race-schedule-database.ts`
- [ ] Vary entry fees across all individual races so they are not uniform per tier.
- [ ] Update race names with Indonesian popular races (local/regional) and world popular races (national/international):
  - e.g. "Jakarta Fun Run 5K", "Bali Marathon Saturday Series", "Mandalika Coastal Half Marathon", "Tokyo Marathon", "Boston Marathon".
  - Ensure all race names are unique.
- [ ] Update `getRaceOccurrence` in `src/scheduling/race-calendar-engine.ts` to dynamically calculate the game year from the `dayIndex` and append it as a postfix (e.g. `2026`, `2027`, etc.) to the name.

### 6. Floating Rest controls
- [ ] Modify `src/components/ui/game-clock.tsx` to remove the inline rest button.
- [ ] Create new component `src/components/ui/rest-controls.tsx`:
  - Fixed float bar at the bottom of the screen (`fixed bottom-0 left-0 right-0 z-50`).
  - Styled with premium glassmorphism.
  - Two buttons: `Rest (1 Day)` and `Rest (1 Week)`.
  - `Rest (1 Day)` triggers `doAction("rest")`.
  - `Rest (1 Week)` triggers `ff("week")` (fast-forwarding 7 days and halting on scheduled races).
- [ ] Adjust `src/features/home/home-screen.tsx` main container layout padding to accommodate the floating bar.
