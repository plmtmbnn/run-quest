# Sprint 2

Goal

Create the Core Simulation Engine.

---

Epic

Simulation Engine

---

Task 1

Implement seeded random generator in `src/utils/random/seeded-random.ts`

---

Task 2

Define domain interfaces/types for Simulation in `src/types/engine.ts`

---

Task 3

Implement preparation scoring calculations in `src/engine/scoring/preparation-score.ts`

---

Task 4

Implement environmental modifiers in `src/engine/environment/environment-modifier.ts`

---

Task 5

Implement event resolution and checkpoints loop in `src/engine/simulation/checkpoint-loop.ts`

---

Task 6

Implement finish time and grading calculations in `src/engine/performance/calculator.ts`

---

Task 7

Implement orchestrator `simulateRace` in `src/engine/simulation/engine.ts`

---

Task 8

Write unit tests for simulation engine in `tests/unit/engine/simulation.test.ts`

---

Definition of Done

Headless deterministic simulation runs successfully.

Decoupled from React, Next.js, and browser storage APIs.

Unit test coverage verifies determinism, environmental modifiers, and DNF scenarios.

Biome lint checks and TypeScript compiler runs pass without errors.
