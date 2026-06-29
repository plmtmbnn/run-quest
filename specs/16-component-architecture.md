# docs/13-component-architecture.md

# Component Architecture

Version: 1.0.0

Status: Approved

Owner: Engineering

---

# Purpose

This document defines the architecture of the RunQuest frontend.

The objective is to separate business logic from presentation logic.

React is responsible for rendering.

The Engine is responsible for gameplay.

Storage is responsible for persistence.

Content is responsible for scenarios.

Each layer has exactly one responsibility.

---

# High-Level Architecture

```text
                    Browser
                       │
                       ▼
                 React Application
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Features      Shared UI       App Shell
        │
        ▼
 Application Services
        │
        ▼
 Domain Engine
        │
        ▼
 Scenario Compiler
        │
        ▼
 Content Repository
        │
        ▼
 Local Storage
```

---

# Layer Overview

## App

Responsible for:

* Routing
* Providers
* Theme
* Layout
* Bootstrapping

Must NOT contain business logic.

---

## Features

Every user-facing capability belongs to a feature.

Example

```
features/

home/

preparation/

race/

report/

settings/
```

Each feature owns:

* Components
* Hooks
* ViewModel
* Tests

---

## Shared Components

Reusable UI only.

```
components/

button/

card/

dialog/

badge/

hero/

progress/

```

Components never know gameplay.

---

## Engine

Engine is pure TypeScript.

No React.

No Browser API.

No Zustand.

No Storage.

```
engine/

simulation/

story/

events/

weather/

score/

timeline/

```

---

## Scenario

Scenario is immutable.

Scenario never changes during simulation.

Scenario is read-only.

---

## Compiler

Compiler transforms:

DSL

↓

Scenario JSON

Compiler does not simulate.

---

## Story Engine

Input

Race Timeline

↓

Output

Narrative

Story Engine does not calculate gameplay.

---

## Storage

Storage is abstract.

UI never accesses LocalStorage.

Only Repository layer may access storage.

---

# Data Flow

```text
React

↓

Feature

↓

Application Service

↓

Simulation Engine

↓

Story Engine

↓

Repository

↓

UI
```

---

# Component Categories

## Screen

Entire page.

Examples

HomePage

PreparationPage

RacePage

ReportPage

---

## Section

Logical grouping.

Examples

Today's Briefing

Preparation Form

Race Timeline

Statistics

---

## Card

Visual container.

Single responsibility.

---

## Widget

Small reusable UI.

Examples

WeatherBadge

DifficultyChip

ProgressRing

Countdown

---

## Primitive

Lowest reusable component.

Button

Text

Input

Icon

Separator

---

# State Management

React State

↓

UI only

---

Zustand

↓

Application State

---

Simulation State

↓

Engine Only

Never stored inside React.

---

# Business Logic

Allowed

Engine

Application Service

Repository

Not Allowed

React Component

Hook

UI Component

Layout

---

# Communication Rules

UI

↓

Service

↓

Engine

↓

Result

Never

UI

↓

Engine

Directly

---

# Folder Example

```
features/

race/

components/

hooks/

services/

types/

pages/

tests/
```

---

# Dependency Rules

Allowed

```
UI

↓

Feature

↓

Service

↓

Engine
```

Forbidden

```
Engine

↓

React

```

Forbidden

```
Engine

↓

Storage

```

Forbidden

```
Component

↓

LocalStorage

```

---

# AI Rules

Never place gameplay logic inside React.

Never import Engine into shared components.

Never access LocalStorage directly.

Prefer composition over inheritance.

Prefer pure functions.

Prefer immutable data.

Every module must have one responsibility.

---

# Future Extensions

Architecture must support:

* Backend
* Multiplayer
* Authentication
* AI Challenge Generator
* Community Challenges

without changing the Engine.
