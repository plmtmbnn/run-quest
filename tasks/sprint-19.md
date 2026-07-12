# Sprint 19 — RPG progression, Economy, & Quests Revamp

## Objective

Enhance RunQuest's core progression loop, transform it into a full Running RPG simulator, and introduce gameplay elements that make running feel rewarding and addicting.

Specifically, introduce:
- A Timing-based Warm-up timing minigame to start races with a dynamic stamina/energy boost.
- Real-time mid-race Consumables (Energy Gels, Electrolyte Chews, Caffeine Gum) to actively manage runner stats.
- A functional Coin/Reward Economy with a Gear & Nutrition Shop on the profile page.
- An Interactive Splits table and Social Comment Feed summarizing race outcomes.
- A Daily Quest board widget on the homepage to encourage daily engagement.

---

## Design Philosophy

Progression should feel earned and choices should feel impactful. 
The warm-up, nutrition, training, and racing loops should form a cohesive cycle:
```
Home (Daily Quests)
  ↓
Briefing / Preparation (Warm-up Minigame)
  ↓
Race (Active Pacing & Live Consumables)
  ↓
Result Screen (Splits Analysis & Social Feedback)
  ↓
Profile Page (Shop purchases & Attribute upgrades)
```

---

## Implemented Features

### 1. Warm-up Timing Challenge
- **Minigame Modal (`src/features/preparation/preparation-screen.tsx`):** Sweeps an indicator back and forth. Clicking in the target zone awards a timing rating:
  - **Perfect (+15% starting energy offset):** Center green sweet spot.
  - **Good (+5% starting energy offset):** Outer yellow zones.
  - **Normal (No bonus):** Gray boundary zones.
- **Simulation Start (`src/engine/simulation/engine.ts`):** Checks the loadout's `warmupBonus` rating at kilometer 0 and modifies starting energy values (up to 115 max starting energy).

### 2. Live Mid-Race Consumables HUD
- **Consumables Dock (`src/features/race/race-screen.tsx`):** Located below the pacing strategies panel, allowing manual activation of equipped items during the race:
  - **Energy Gel (🔋):** Restores +25% stamina/energy.
  - **Electrolyte Chews (💧):** Restores +20% hydration.
  - **Caffeine Gum (🧠):** Restores +20% focus/morale.
- **Logic:** Instantly triggers audio feedback, updates current HUD statistics, appends a record of consumption to the race feed, and saves inventory deductions to LocalStorage.

### 3. Economy & Nutrition Shop
- **Coin Rewards (`src/store/player-store.ts`, `runner-engine.ts`, `training-engine.ts`):** 
  - **Race Placement:** Gold (150 RC), Silver (100 RC), Bronze (75 RC), Finish (50 RC), DNF (20 RC).
  - **Workouts:** Completing a daily workout grants 30 RC alongside the 20 XP reward.
- **Nutrition Shop (`src/features/profile/profile-screen.tsx`):** Displays available RC and allows buying Gels (30 RC), Electrolytes (25 RC), and Caffeine Gum (40 RC) to restock inventory.

### 4. Interactive Splits & Activity Comments Feed
- **Interactive Splits (`src/features/result/result-screen.tsx`):** Details segment pace, ending energy levels, ending hydration levels, and visual split comparison bars. Highlights the fastest segment split.
- **Strava Comments Feed (`src/features/result/result-screen.tsx`):** Renders reactive comments from Coach Sarah, Alex the Rival, and GritBot based on your race outcome or failure.

### 5. Daily Quest Board
- **Homepage Widget (`src/features/home/home-screen.tsx`):** Challenges runners with three objectives:
  1. *Race Completion* (Complete today's daily board challenge)
  2. *Career Upgrade* (Upgrade career attribute levels)
  3. *Daily Training* (Complete a daily workout session)
- **Quest Claims:** Clicking claim awards **+50 RC & +50 XP** per quest, updating stats and check-in history.

### 6. UI Redesign (EcoThrive Style Layouts)
- **Theme Color Transformation (`src/app/globals.css`):** Migrated branding from primary blue to warm orange (`#F97316`).
- **Dashboard & Quests Board (`src/features/home/home-screen.tsx`):** Styled into rounded-pill panels (`rounded-[2rem]`) with custom pastel action grids and gradient titles.
- **Loadout Selection & Timing Modal (`src/features/preparation/preparation-screen.tsx`):** Swapped selection cards to orange active borders, pills layout, and redesigned timing slider overlays.
- **Race Simulator HUD (`src/features/race/race-screen.tsx`):** Reformatted stats HUD, strategy options, and live track progress nodes using high-contrast orange tokens and custom dark/light border layouts.
- **Result Details (`src/features/result/result-screen.tsx`):** Re-styled split tables, pace columns, and comments feed layouts to match the warm-toned aesthetic.
- **Career RPG Upgrades & Nutrition Shop (`src/features/profile/profile-screen.tsx`):** Converted upgrade sliders and buy grids into individual pastel backgrounds (Speed: gold; Stamina: rose; Hydration: sky; Willpower: purple).

---

## Technical Files Modified

### Core Styling & Theme
- `src/app/globals.css` — Swapped global theme variables from blue to orange.

### Core State & Types
- `src/runner/runner-types.ts` — Added `coins`, `inventory`, and `questClaims` tracking schemas to `RunnerProfile`.
- `src/types/engine.ts` — Added `warmupBonus` field to the loadout configuration.
- `src/store/preparation-store.ts` — Implemented state and actions for `warmupBonus`.
- `src/store/player-store.ts` — Updated completion rewards to distribute coins.
- `src/runner/runner-engine.ts` — Wired career completion triggers to handle coin allocations.
- `src/training/training-engine.ts` — Wired workout rewards to allocate training coins.

### Features & Screen Panels
- `src/features/preparation/preparation-screen.tsx` — Built timing minigame Modal, dynamic cards, and state hooks.
- `src/features/race/race-screen.tsx` — Built Consumables Panel, dynamic pacing buttons, boost state modifiers, event logs, and success sound hooks.
- `src/features/profile/profile-screen.tsx` — Built header coins indicator, custom color attributes cards, and Buy card list with sound hooks.
- `src/features/result/result-screen.tsx` — Built Splits table metrics and mock social comment loops.
- `src/features/home/home-screen.tsx` — Built Daily Quest Board cards and claim rewards logic.

---

## Verification & Acceptance Criteria

### Automated Testing
- Created unit tests in `tests/unit/engine/economy.test.ts` to cover coin additions, training rewards, and starting energy warmup offsets.
- **84 / 84 Vitest unit tests pass successfully.**

### Production Compilation
- **Successfully compiled Next.js production build (`pnpm build`) with zero errors or warnings.**
