# Sprint 7

Goal

Implement the Daily Race Board and Daily Entry limit systems. Decouple the simulation engine scenario from the choice layer.

---

Epic

Daily Race Board

---

Task 1

Update domain models and schemas to introduce `Scenario` (replacing `DailyChallenge`), `RaceEntry`, and `DailyRaceBoard` objects.

---

Task 2

Extend player storage schema and the `usePlayerStore` to track `dailyEntries` and handle consumption/resets.

---

Task 3

Re-engineer `generator.ts` to output a list of 4 distinct `RaceEntry` items mapped from the deterministic daily seed.

---

Task 4

Redesign `HomeScreen` into the "Daily Race Board" layout, allowing selection of one race and locking the rest once entries are exhausted.

---

Definition of Done

HomeScreen renders 4 varied race entries (Morning Tempo, Jungle Escape, etc.).

Total daily entries are limited to 1 (consumes upon starting a race, locking all others).

No modifications to the Simulation Engine itself.

All lint, formatting, and unit tests execute cleanly.
