# Game Rules

Version: 1.0.0

Status: Approved

Owner: Product

---

# Purpose

This document defines every gameplay rule of RunQuest.

These rules are the single source of truth.

The Simulation Engine must never violate these rules.

---

# Design Philosophy

RunQuest is a decision game.

Players do not control the runner directly.

Players prepare a race plan.

The simulation evaluates those decisions.

Good preparation increases the probability of success.

There is no perfect strategy.

Every race should feel unique.

---

# Daily Challenge

A new Daily Challenge is generated every day.

One challenge per calendar day.

Every player receives exactly the same challenge.

The challenge cannot change after publication.

---

# Daily Reset

Daily Challenge resets at:

00:00 UTC

Future versions may support regional reset times.

---

# Play Limitation

Phase 0

Players may complete the Daily Challenge only once.

Replay is not allowed.

Reason:

Prevent optimization through trial and error.

Encourage thoughtful preparation.

---

# Preparation Phase

Players must complete preparation before starting the race.

Preparation consists of selecting:

- Shoes
- Nutrition
- Gear
- Warm-up
- Pacing Strategy
- Mindset

Preparation is locked after race start.

---

# Equipment Rules

Every equipment has advantages.

Every equipment has disadvantages.

There are no universally best items.

Example

Carbon Shoes

Pros

+ Faster pace

Cons

- Higher fatigue

Trail Shoes

Pros

+ Stable on trail

Cons

- Slower on road

---

# Weather Rules

Weather affects race outcome.

Weather modifies:

- Pace
- Hydration
- Fatigue
- Energy Consumption

Weather never guarantees victory or defeat.

---

# Course Rules

Course contains:

Distance

Surface

Elevation

Checkpoint Events

Course characteristics influence decision quality.

---

# Randomness

RunQuest uses deterministic randomness.

Every race has a seed.

Players with identical:

Preparation

Daily Challenge

Seed

must obtain identical results.

This guarantees fairness.

---

# Event Resolution

Race Events occur at checkpoints.

Events are selected from an event pool.

Events may be:

Positive

Neutral

Negative

Probability depends on preparation.

---

# Decision Quality

Each preparation item contributes to a hidden score.

Example

Weather = Hot

Water

+20

Electrolytes

+35

Energy Gel

+10

No Nutrition

-25

The player never sees these values.

---

# Hidden Information

Players should not know exact formulas.

Players should learn through experience.

The game rewards understanding.

Not memorization.

---

# Simulation Length

Preparation

60–90 seconds

Simulation

10–20 seconds

Results

30–60 seconds

Preparation is intentionally longer than simulation.

---

# Result Grades

S

Outstanding

A

Excellent

B

Good

C

Average

D

Poor

F

Failed

Grades are determined by:

Preparation Quality

Event Handling

Finish Time

Objective Completion

---

# Winning

Winning does not always mean fastest time.

Winning means making high-quality decisions.

---

# Losing

A poor result is never permanent.

The next day always offers a new opportunity.

---

# Story Generation

Every completed race produces a story.

Stories summarize:

Preparation

Key Events

Lessons

Outcome

Stories are generated from structured data.

Never from LLM responses.

---

# Fairness Principles

No Pay-to-Win.

No hidden premium advantages.

No impossible challenges.

Every challenge must be theoretically solvable.

---

# Phase 0 Restrictions

No Login

No Leaderboard

No Multiplayer

No Inventory

No XP

No Coins

No Shop

No Ads

Gameplay only.

---

# AI Rules

Never hardcode gameplay values.

Never implement game logic inside React components.

All gameplay decisions belong inside the Simulation Engine.