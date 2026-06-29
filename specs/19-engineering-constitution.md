# docs/26-engineering-constitution.md

# Engineering Constitution

Version: 1.0.0

Status: Ratified

Owner: Engineering

Last Updated: 2026-06-29

---

# Preamble

RunQuest is built for the long term.

Every engineering decision should improve maintainability, clarity, reliability, and developer experience.

We optimize for sustainability rather than speed.

Architecture is considered a product feature.

---

# Mission

Build software that remains understandable after five years.

Code should be written for humans first.

Computers only execute it.

---

# Core Values

## Simplicity

Prefer the simplest solution that satisfies the requirement.

Complexity must always be justified.

---

## Predictability

Every function should behave consistently.

Users should never be surprised.

Developers should never be surprised.

---

## Readability

Readable code is preferred over clever code.

Explicit is better than implicit.

---

## Determinism

Game logic must always produce reproducible results.

Randomness must always be seeded.

---

## Composition

Favor composition over inheritance.

Favor small modules over large frameworks.

---

## Single Responsibility

Every module should have exactly one responsibility.

---

## Documentation

Documentation is part of the implementation.

Undocumented architecture is incomplete architecture.

---

# Product Principles

Engineering serves the product.

Not the other way around.

When technical purity conflicts with user experience,

user experience wins,

unless it compromises maintainability.

---

# Engineering Principles

Every decision should improve at least one of:

Maintainability

Reliability

Performance

Developer Experience

Scalability

If it improves none,

do not implement it.

---

# Architecture Principles

Business logic belongs in the Engine.

Rendering belongs in React.

Persistence belongs in Storage.

Content belongs in Scenario DSL.

Each layer has one responsibility.

---

# Coding Principles

Functions should be:

Pure whenever possible.

Small.

Predictable.

Testable.

Composable.

---

# Naming Principles

Names should explain intent.

Avoid abbreviations.

Avoid generic names.

Bad

helper()

Good

calculateFatigue()

---

# Dependency Principles

Every dependency increases maintenance cost.

Add dependencies only when they provide significant value.

Remove unused dependencies immediately.

---

# Data Principles

Data is immutable whenever practical.

State changes should be explicit.

Implicit mutations are forbidden.

---

# Error Philosophy

Errors are expected.

Crashes are failures.

Recover whenever possible.

Fail loudly during development.

Fail gracefully in production.

---

# Testing Philosophy

Business logic is tested.

Critical paths are tested.

Tests should document behavior.

Coverage is a metric.

Confidence is the goal.

---

# Refactoring

Refactoring should:

Reduce complexity.

Improve readability.

Preserve behavior.

If behavior changes,

it is not a refactor.

---

# Performance

Measure before optimizing.

Optimize bottlenecks.

Avoid premature optimization.

Performance should never reduce readability unnecessarily.

---

# Accessibility

Accessibility is not optional.

Accessibility is a feature.

Every release must preserve accessibility.

---

# Internationalization

Every user-facing string is translatable.

No hardcoded language.

Localization is part of feature completion.

---

# Security

Trust nothing.

Validate everything.

Escape everything.

Least privilege by default.

---

# Privacy

Collect the minimum data required.

Never collect data "just in case."

User trust is more valuable than analytics.

---

# Git Philosophy

Every commit should represent one logical change.

Every commit should be reversible.

History should tell a story.

---

# Documentation Philosophy

Architecture decisions belong in documentation.

Business rules belong in documentation.

Game rules belong in documentation.

Never hide knowledge inside code.

---

# AI Collaboration

AI is an engineering assistant.

AI must follow the same standards as humans.

Human review remains responsible for final approval.

---

# Code Review Principles

Review behavior.

Review architecture.

Review maintainability.

Do not review personal style.

Assume positive intent.

---

# Long-Term Compatibility

Backward compatibility is preferred.

Breaking changes require justification.

Migration paths should exist whenever possible.

---

# Success Criteria

A successful release is one that:

Works correctly.

Can be understood quickly.

Can be safely modified.

Can be confidently tested.

Can be maintained by a new engineer.

---

# Final Principle

Every line of code is a long-term commitment.

Write only the code you are willing to maintain.
