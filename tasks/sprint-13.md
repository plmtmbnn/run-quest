# Epic 013 — Interactive Decision Engine

## Vision

Transform the race experience from a passive simulation into an interactive strategy experience.

Players should make meaningful decisions during the race, not only before it.

The race should become a sequence of strategic moments where every decision contributes to the final story.

The Simulation Engine must remain deterministic and framework independent.

---

# Sprint 13.1 — Engine Foundation

## Goal

Build the technical foundation for interactive race events.

## Deliverables

- Introduce Decision Engine
- Create DecisionCard domain model
- Create Choice domain model
- Create DecisionResult model
- Event Timeline Generator
- Deterministic Event Scheduler
- Unit tests

## Acceptance Criteria

- No UI
- No countdown
- No React dependency
- No Zustand dependency
- No browser API
- Uses existing seeded random generator
- Fully deterministic

---

# Sprint 13.2 — Interactive Race UI

## Goal

Allow players to interact with race events.

## Deliverables

- Decision Modal
- Countdown Timer
- Pause Simulation
- Resume Simulation
- Timeout Handling
- Keyboard Support
- Mobile Touch Support

## Acceptance Criteria

- Countdown defaults to 10 seconds
- Timeout automatically selects a decision
- Countdown pauses when simulation pauses
- Responsive layout
- Accessible

---

# Sprint 13.3 — Multi-Nutrition System

## Goal

Upgrade preparation by allowing multiple nutrition selections.

## Deliverables

Preparation should support selecting multiple nutrition items.

Examples

✔ Water

✔ Electrolyte

✔ Energy Gel

✖ Caffeine

Each nutrition contributes independent modifiers.

## Requirements

Nutrition effects must stack naturally.

Example

Water

+ Hydration

Electrolyte

+ Cramp Resistance

Energy Gel

+ Mid-race Energy

- Stomach Risk

Caffeine

+ Focus

+ Aggression

- Crash Risk

There should never be a perfect combination.

## Acceptance Criteria

- Multi-select UI
- Persistent storage
- Combined modifiers
- No duplicate selections
- Fully localized

---

# Sprint 13.4 — Runner Attribute Expansion

## Goal

Expand runner state beyond Energy, Hydration and Focus.

## New Attributes

- Confidence
- Muscle Fatigue
- Mental Fatigue
- Momentum
- Pace Stability
- Risk Level

## Deliverables

- RunnerState update
- Live HUD update
- Modifier system
- Attribute balancing

## Acceptance Criteria

Every attribute should influence at least one simulation mechanic.

---

# Sprint 13.5 — Event Library

## Goal

Create reusable race events.

## Categories

Environment

- Heat
- Rain
- Wind
- Fog

Physical

- Cramp
- Side Stitch
- Heavy Legs

Mental

- Crowd Support
- Self Doubt

Tactical

- Aid Station
- Climb
- Descent
- Sharp Corner

Unexpected

- Loose Shoelace
- Animal Crossing
- Dropped Bottle

## Deliverables

25–30 reusable Decision Cards.

## Acceptance Criteria

Every event has

- conditions
- choices
- trade-offs
- rarity

---

# Sprint 13.6 — Dynamic Event Generator

## Goal

Generate different races every day.

## Event Generation Inputs

- Distance
- Surface
- Weather
- Difficulty
- Scenario Tags
- Runner State
- Seed

## Deliverables

Dynamic event selection.

## Acceptance Criteria

Two races with different seeds should never generate identical timelines.

---

# Sprint 13.7 — Decision Consequences

## Goal

Introduce delayed consequences.

Example

Skip Water

Immediate

+ Pace

Later

- Hydration

Example

Push Hard

Immediate

+ Position

Later

- Muscle Fatigue

## Deliverables

- Delayed effect queue
- Effect expiration
- Effect stacking

## Acceptance Criteria

Consequences may appear several events later.

---

# Sprint 13.8 — Story Integration

## Goal

Connect player decisions to race storytelling.

## Deliverables

Race Report should reference

- preparation
- nutrition
- important decisions
- delayed consequences

Example

"You skipped the aid station and maintained your pace, but dehydration caught up with you during the final climb."

## Acceptance Criteria

Every race report references at least three meaningful decisions made by the player.

---

# Global Technical Constraints

Throughout all Sprint 13 tasks:

## Theme

Temporarily force Light Theme only.

Dark Mode remains in the codebase but must be disabled until visual issues are resolved.

## Simulation

Never use Math.random().

Use deterministic seeded randomness only.

## Architecture

Simulation Engine

↓

Decision Engine

↓

Runner State

↓

Race UI

↓

Story Engine

The Decision Engine must remain completely independent from React, Zustand and LocalStorage.

## Quality Gates

- TypeScript strict
- No any
- No hardcoded strings
- Fully localized
- Unit tests for engine logic
- Immutable state updates
- Framework-independent domain layer

---

# Definition of Done

Epic 013 is complete when:

- Players make strategic decisions during races.
- Every race contains dynamic decision moments.
- Nutrition supports multiple selections.
- Decision outcomes feel meaningful.
- Delayed consequences create long-term strategy.
- Story reports explain player decisions.
- Simulation remains deterministic.
- Light Theme is enforced globally.
- The game feels significantly more interactive than previous versions.
