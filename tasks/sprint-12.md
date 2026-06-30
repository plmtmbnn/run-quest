# Sprint 12

Goal

Implement rare in-race simulation events, resolve dark mode contrast bugs, fix the race progress animation loop, enable simulation transparency with real-time stats, and complete the localization sweep across sharing assets and simulation screens.

---

Epic

Rare Events, Bug Fixes, and Simulation Transparency

---

Task 1

Fix the dark mode contrast bugs across the briefing, preparation, onboarding, history, and settings screens. Fix the race screen progression animation loop being stuck at 1% by stabilizing the challenge state reference.

---

Task 2

Introduce rare in-race simulation events (DNS, Booster, Accident, DNF) occurring with a 1:500 chance, complete with simulation engine rolls, outcome handlers, performance calculators, and story narrative generators.

---

Task 3

Expose simulation transparency by capturing state snapshots at each kilometer (`stateLog`), updating the Race Screen ticker animation to render actual physical stats (energy, hydration, focus) instead of a linear progression, and terminating early on DNS/DNF.

---

Task 4

Perform a full localization sweep to eliminate hardcoded English text. Localize the pre-race decisions loadout card and the post-race results card. Display the active weather and environmental details directly in the live simulation header.

---

Definition of Done

Visual and dark mode bugs are fully resolved across all views.

Ticker animation does not freeze and accurately reflects actual simulated kilometer-by-kilometer stats.

Rare events (DNS, DNF, Booster, Accident) trigger deterministically based on seed values and render correctly.

Pre-race sharing strategy (loadout) and post-race performance results are fully translated in both English and Indonesian.

Weather and temperature conditions are visibly integrated into the live simulation view.

All vitest unit tests pass and `npm run build` compiles cleanly.
