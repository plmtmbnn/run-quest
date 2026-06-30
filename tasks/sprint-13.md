# Sprint 13.1 — Interactive Decision Engine (Phase 1)

## Objective

This sprint evolves the current simulation into an interactive strategic experience.
The player should no longer be a passive observer after pressing "Start Race".
Instead, the player becomes the race strategist by making tactical decisions during carefully selected moments throughout the simulation.
The race should feel alive, dynamic, and unpredictable while remaining deterministic.

---

## Important Sprint Scope

This sprint is NOT about adding more screens.
This sprint is about introducing a completely new gameplay layer that sits between the Simulation Engine and the Race UI.
Focus on gameplay quality rather than quantity.

---

## Temporary UI Constraint

Force the application to use **Light Theme only**.
Dark Mode is currently incomplete and contains visual inconsistencies.
Requirements:
- Remove all theme switching logic from the UI.
- Force light mode globally.
- Keep the architecture flexible so Dark Mode can be restored in a future sprint.
- Do NOT remove existing dark theme tokens. Simply disable them temporarily.

---

## Core Requirements

### 1. Force Light Theme
Temporarily restrict the app to Light Theme only. No theme toggles should be visible to the user.

### 2. Multi-Choice Nutrition Selection
Let the player select multiple nutrition options (Water, Electrolytes, Energy Gel, Caffeine) during preparation with combined cumulative effects:
- Plain Water: stable hydration
- Electrolytes: reduces muscle cramp risk and hydration loss
- Energy Gel: boosts early speed but has stomach stress risk
- Caffeine: boosts early focus and speed, but risks crash later

### 3. Expanded Simulation State & Physics
Expand state to track: `muscleFatigue`, `mentalFatigue`, `momentum`, `paceStability`, and `riskLevel`.
Evolve these attributes each kilometer step.

### 4. Interactive Choices with Immediate/Delayed Consequences
Choice decisions modify risk levels, momentum, and fatigue. Schedule delayed consequences.

### 5. Live Simulation HUD
Show Pace, Distance, Position, Energy, Hydration, Focus, Weather, Terrain, and Active Effects in real-time.

---

## Definition of Done

- Forced light theme works flawlessly.
- Multi-nutrition selection accumulates correctly.
- Extended runner attributes simulate deterministically.
- Live Simulation HUD shows real-time gauges.
- Story summary includes choices and consequences.
- All unit tests pass and build succeeds.
