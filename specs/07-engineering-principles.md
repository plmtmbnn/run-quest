# Engineering Principles

Version: 1.0.0

Status: Approved

Owner: Founder

Last Updated: 2026-06-29

---

# Purpose

This document defines the engineering philosophy of RunQuest.

Its purpose is not to enforce coding style.

Its purpose is to ensure that every engineering decision produces software that is maintainable, testable, predictable, and easy to evolve.

Whenever multiple implementations are possible, these principles should guide the decision.

---

# Principle 1

## Product Before Technology

Technology exists to support the product.

Never introduce technology simply because it is modern or popular.

Choose the simplest solution that satisfies the product goals.

---

# Principle 2

## Simplicity Wins

Prefer simple code over clever code.

Future maintainers—including AI—should understand the code without additional explanation.

Readable code is more valuable than short code.

---

# Principle 3

## Pure Business Logic

Game calculations must be pure functions.

The same input must always produce the same output.

Business logic must never:

- read LocalStorage
- access browser APIs
- manipulate the DOM
- depend on React

---

# Principle 4

## UI Is a Renderer

The UI displays information.

The UI never decides game outcomes.

The UI never contains business rules.

The UI should be replaceable without changing gameplay.

---

# Principle 5

## Configuration Over Hardcoding

Anything likely to change belongs in configuration.

Examples:

- Race definitions
- Weather
- Equipment
- Nutrition
- Translation
- Story templates

Never hardcode gameplay content inside TypeScript files.

---

# Principle 6

## One Responsibility

Each module should have one reason to change.

Examples:

Simulation Engine

Calculates race outcomes.

Storage Layer

Reads and writes player data.

Localization

Provides translated strings.

Story Engine

Creates race narratives.

Do not mix responsibilities.

---

# Principle 7

## Composition Over Inheritance

Prefer composing small reusable modules.

Avoid deep inheritance hierarchies.

Small modules are easier to understand, test, and replace.

---

# Principle 8

## Deterministic Simulation

The Simulation Engine must be deterministic.

Given:

- identical race configuration
- identical player decisions
- identical engine version

the result must always be identical.

If randomness is required, it must come from a reproducible seed.

---

# Principle 9

## Data Is Immutable

Never mutate input objects.

Always return new objects.

Immutable data makes debugging and testing easier.

---

# Principle 10

## Explicit Over Implicit

Avoid hidden behavior.

Function inputs and outputs should be obvious.

Avoid magic side effects.

---

# Principle 11

## Small Files

Large files become difficult to maintain.

Recommended limits:

Component

< 250 lines

Business module

< 200 lines

Utility

< 100 lines

These are guidelines, not strict rules.

---

# Principle 12

## Strong Typing

Avoid "any".

Use meaningful TypeScript types.

Model the domain explicitly.

Types are documentation.

---

# Principle 13

## Error Handling

Every recoverable error should provide:

- clear reason
- actionable solution
- safe fallback

Never silently ignore errors.

---

# Principle 14

## Test Business Logic

Business logic must be testable independently from the UI.

Priority:

Simulation Engine

Story Engine

Storage Migration

Localization

UI testing is secondary.

---

# Principle 15

## One Source of Truth

Every piece of data should have exactly one owner.

Examples:

Race configuration

JSON

Translations

Dictionary

Player progress

Storage

Simulation result

Simulation Engine

Avoid duplicated state.

---

# Principle 16

## Version Everything

Every persistent structure should have a version.

Examples:

Storage

Race schema

Simulation Engine

This enables future migrations.

---

# Principle 17

## Backward Compatibility

When possible,

new versions should continue to read old data.

Breaking changes require explicit migration.

---

# Principle 18

## Performance Through Simplicity

Do not optimize prematurely.

Measure first.

Optimize only where necessary.

Maintainability is preferred over micro-optimizations.

---

# Principle 19

## Accessibility

Accessibility is a requirement.

Not an enhancement.

The application should support:

- keyboard navigation
- screen readers where practical
- sufficient color contrast
- reduced motion preferences

---

# Principle 20

## Offline First

Phase 0 must work entirely without a backend.

The application should remain functional after the initial load.

Network availability should never affect gameplay.

---

# Principle 21

## Internationalization First

Every user-facing string must support localization.

Never concatenate translated strings.

Prefer interpolation.

Bad:

"Hello " + playerName

Good:

"Hello, {{name}}"

---

# Principle 22

## Explainability

The system should always be explainable.

Players may not know every formula,

but developers should always be able to explain why a result occurred.

Opaque logic is technical debt.

---

# Principle 23

## AI-Friendly Code

Code should be optimized for human understanding and AI collaboration.

Prefer:

- descriptive names
- explicit structures
- predictable patterns
- consistent architecture

Avoid clever shortcuts that reduce readability.

---

# Principle 24

## Documentation Is Part of the Feature

A feature is incomplete if it requires documentation updates but none are made.

Engineering documentation should evolve with the codebase.

---

# Principle 25

## Build for Evolution

Every module should be replaceable.

Examples:

LocalStorage → Backend

JSON → API

Anonymous Player → Authenticated Player

The architecture should allow evolution without rewriting the entire system.

---

# Engineering Checklist

Before merging any feature, verify:

- Product Principles are respected.
- Constitution is respected.
- Business logic is pure.
- No duplicated logic exists.
- No hardcoded user-facing text.
- Supports EN and ID.
- Uses TypeScript types.
- No unnecessary dependencies.
- Tests pass.
- Documentation updated if required.

---

# Final Principle

We optimize for clarity.

Clear architecture.

Clear code.

Clear responsibilities.

Future contributors—including AI—should understand the project without needing its original author.

## Tooling Principles

RunQuest uses Biome as the single source of truth for formatting and linting.

Do not introduce Prettier or ESLint unless Biome cannot support a required capability.

Formatting discussions should never happen during code review.

Biome is responsible for formatting decisions.