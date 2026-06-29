# docs/19-ai-coding-playbook.md

# AI Coding Playbook

Version: 1.0.0

Status: Approved

Owner: Engineering

---

# Purpose

This document defines how AI coding agents contribute to the RunQuest codebase.

Every AI-generated change must follow this playbook.

Consistency is more important than speed.

Readability is more important than cleverness.

Architecture is more important than shortcuts.

---

# Core Principles

1. Preserve architecture.
2. Prefer simple solutions.
3. Never guess business logic.
4. Never duplicate code.
5. Every change must be explainable.

---

# AI Workflow

Before writing code, AI must understand:

1. Vision
2. Product Principles
3. Domain Model
4. Game Rules
5. Simulation Engine
6. Design System
7. Folder Convention

If any specification is missing, AI should stop and request clarification.

---

# Decision Priority

When two rules conflict, follow this priority.

1. Product Vision
2. Game Rules
3. Domain Model
4. Engineering Principles
5. Design System
6. Performance
7. Developer Preference

---

# Architecture Rules

AI must never redesign project architecture without explicit approval.

Never move folders because "it looks cleaner."

Never rename public interfaces without approval.

Never introduce breaking changes silently.

---

# Business Logic

Business logic belongs only inside:

* engine/
* services/
* compiler/

Never inside:

* React components
* Pages
* Layouts
* Shared UI
* Hooks

---

# React Rules

React is responsible only for rendering.

React components must remain declarative.

Components should receive data, not calculate data.

Never perform gameplay calculations inside React.

---

# State Management

React State

Temporary UI state only.

Zustand

Application state only.

Simulation State

Engine only.

Never duplicate state.

Never mirror state unnecessarily.

---

# Component Rules

Components should:

* be reusable
* be composable
* be predictable

Components should never:

* access LocalStorage
* calculate gameplay
* call random()
* mutate global state

---

# Folder Rules

AI must respect the existing folder structure.

Never create:

helpers.ts

common.ts

misc.ts

utils2.ts

new-utils.ts

Every file must have a clear responsibility.

---

# File Size

Recommended maximum

300 lines

Maximum

500 lines

If exceeded,

split into smaller modules.

---

# Function Size

Recommended

20–30 lines

Maximum

50 lines

Functions should perform one task.

---

# Complexity

Maximum nesting

3

Maximum cyclomatic complexity

10

Prefer early returns.

Avoid deeply nested conditions.

---

# Naming Rules

Folders

kebab-case

Files

kebab-case

Variables

camelCase

Functions

camelCase

Types

PascalCase

Enums

PascalCase

Constants

UPPER_SNAKE_CASE

---

# Imports

Prefer absolute imports.

Avoid circular dependencies.

Import only what is required.

Sort imports consistently.

---

# TypeScript

Strict Mode required.

Never use:

any

Prefer:

unknown

generic types

union types

discriminated unions

Never suppress compiler errors.

---

# Zod

Every external input must be validated.

Examples:

JSON

LocalStorage

URL parameters

Future API responses

No exceptions.

---

# Error Handling

Errors should be recoverable.

Never swallow exceptions.

Every unexpected state should provide context.

User-facing errors should remain friendly.

Developer-facing errors should be descriptive.

---

# Logging

Development

Verbose.

Production

Minimal.

Never log secrets.

Never log personal information.

---

# Randomness

Never use:

Math.random()

Always use:

SeededRandom

Gameplay must remain deterministic.

---

# Storage

Never access LocalStorage directly.

Always use Storage Repository.

Every stored object must have a version.

Every load operation must validate data.

---

# Performance

Avoid unnecessary renders.

Memoize only when needed.

Measure before optimizing.

Avoid premature optimization.

---

# Accessibility

Every button must be keyboard accessible.

Every image requires alternative text.

Every interactive element requires focus state.

Respect reduced motion settings.

---

# Internationalization

Never hardcode user-facing strings.

Every string belongs inside translation files.

Never concatenate translated strings.

Use interpolation.

Use namespaces.

---

# Styling

Use Tailwind CSS.

Use design tokens.

Do not hardcode colors.

Do not hardcode spacing.

Reuse existing UI components.

---

# shadcn/ui

Prefer shadcn/ui before creating custom components.

Extend existing primitives.

Never fork components unnecessarily.

---

# Biome

Formatting

Biome.

Linting

Biome.

Never disable lint rules without explanation.

---

# Testing

Every Engine module requires unit tests.

Every bug fix should include a regression test.

UI snapshot tests are optional.

Business logic tests are mandatory.

---

# Documentation

Every exported function requires documentation.

Complex algorithms require explanation.

Business rules must reference documentation.

---

# Refactoring

AI may refactor only if:

Behavior remains identical.

Tests continue passing.

Architecture improves.

If behavior changes,

request approval first.

---

# Dependencies

Do not introduce new dependencies unless:

1. Existing solution is insufficient.
2. Maintenance cost is justified.
3. Package is actively maintained.
4. Bundle size impact is acceptable.

Always explain why a dependency is needed.

---

# Security

Never trust external input.

Escape user-generated content.

Never expose secrets.

Never embed credentials.

Never bypass validation.

---

# Git

One logical change per commit.

Commit messages follow Conventional Commits.

Examples

feat:

fix:

refactor:

docs:

test:

chore:

---

# Pull Requests

Every PR should include:

Purpose

Scope

Files Changed

Risks

Testing

Screenshots (if UI changes)

---

# AI Communication

Before implementing major changes,

AI should explain:

Current problem

Proposed solution

Trade-offs

Expected impact

After implementation,

AI should summarize:

What changed

Why it changed

Potential risks

---

# Anti-Patterns

AI must never:

* Duplicate business logic
* Duplicate utilities
* Duplicate types
* Introduce magic numbers
* Hardcode configuration
* Create God Objects
* Create God Components
* Create God Hooks
* Disable TypeScript
* Disable Biome
* Ignore failing tests
* Ignore design tokens
* Ignore i18n
* Mix UI with Engine
* Access LocalStorage directly
* Use Math.random()
* Add TODO comments without issue references

---

# AI Definition of Done

A task is complete only if:

✓ Code compiles

✓ Types are valid

✓ Lint passes

✓ Tests pass

✓ Documentation updated

✓ i18n applied

✓ Accessibility preserved

✓ Design System respected

✓ No duplicated logic

✓ No dead code

✓ No unused imports

✓ No console.log

✓ No hardcoded strings

✓ No architecture violations

---

# AI Review Checklist

Before submitting code, AI must verify:

* Does this follow the Product Vision?
* Does this follow the Domain Model?
* Does this respect the Simulation Engine?
* Is the code deterministic?
* Is the code testable?
* Is the code reusable?
* Is the code readable?
* Is the code documented?
* Is the code localized?
* Is the code accessible?

If any answer is "No", revise before completion.

---

# Long-Term Vision

RunQuest is designed to evolve for years.

Every AI-generated contribution should make the codebase easier to understand, easier to test, and easier to extend.

The best code is not the most clever.

The best code is the one that another engineer—or another AI—can understand immediately.
