# Simulation Engine

Version: 1.0.0

Status: Approved

Owner: Engineering

---

# Purpose

This document defines the Simulation Engine.

The engine transforms player decisions into race outcomes.

The engine must be deterministic.

The engine must not depend on React, Next.js or LocalStorage.

---

# Principles

Pure Functions

Deterministic

Framework Independent

Testable

Composable

---

# Pipeline

Player

↓

Daily Challenge

↓

Preparation

↓

Validation

↓

Score Calculation

↓

Race Simulation

↓

Event Resolution

↓

Finish Time

↓

Result

↓

Story Generation

---

# Engine Input

SimulationInput

Player

Challenge

Preparation

Seed

---

# Validation

The engine validates:

Required fields

Preparation completeness

Challenge integrity

Seed availability

Invalid inputs immediately stop simulation.

---

# Phase 1

Preparation Scoring

Each preparation item receives an internal score.

Example

Weather

Hot

Shoes

Carbon

+5

Nutrition

Water

+15

Mindset

Focused

+10

Warm-up

Dynamic

+5

These values remain hidden.

---

# Phase 2

Environment Modifier

Weather

Temperature

Humidity

Wind

Surface

Elevation

Each modifier affects:

Fatigue

Hydration

Confidence

Speed

---

# Phase 3

Race Initialization

Initial values

Energy

100

Hydration

100

Focus

100

Fatigue

0

Confidence

100

---

# Phase 4

Checkpoint Loop

For every checkpoint

Update fatigue

Update hydration

Resolve event

Apply modifiers

Update pace

Continue

---

# Event Resolution

Every checkpoint contains an Event Pool.

Example

Hydration Station

Crowded Corner

Strong Wind

Loose Gravel

Spectator Support

Only one event is selected.

Probability depends on preparation.

---

# Phase 5

Performance Calculation

Performance Score

=

Preparation Score

+

Weather Bonus

+

Gear Bonus

+

Mindset Bonus

-

Fatigue

-

Random Variation

---

# Random Variation

Randomness exists.

But it is controlled.

Maximum deviation

±5%

The engine should reward preparation.

Not luck.

---

# Phase 6

Finish Time

Finish Time

=

Base Time

+

Modifiers

+

Events

Finish Time determines ranking.

---

# Phase 7

Grade

Grades

S

A

B

C

D

F

Calculated using

Finish Time

Preparation Quality

Decision Accuracy

Objective Completion

---

# Phase 8

Story Builder

Story Builder converts structured race data into:

Headline

Summary

Highlights

Lessons

Stories never invent events.

Stories only describe actual simulation output.

---

# Engine Modules

engine/

simulation/

validation/

scoring/

environment/

events/

performance/

story/

grade/

result/

types/

utils/

Each module has one responsibility.

---

# Function Design

Every function should be pure.

Example

calculatePreparationScore()

calculateWeatherModifier()

resolveCheckpoint()

calculateFatigue()

calculateFinishTime()

generateStory()

calculateGrade()

Never create a monolithic simulateRace() containing all logic.

---

# State Flow

SimulationInput

↓

SimulationState

↓

CheckpointState

↓

SimulationResult

State objects should be immutable.

---

# Performance Goal

One simulation

< 10 milliseconds

Memory

< 2 MB

No asynchronous operations.

---

# Testing

Every module requires unit tests.

Deterministic inputs must always produce deterministic outputs.

100% reproducible.

---

# AI Rules

Never use Math.random() directly.

Always use seeded random generation.

Never mutate objects.

Prefer composition over inheritance.

Never place gameplay logic inside UI.

Every engine function must have one responsibility.

Every public function must be documented.