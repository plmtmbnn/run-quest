# RunQuest Constitution

**Version:** 1.0.0 (Draft)

---

# Purpose

This document is the highest-level source of truth for the RunQuest project.

Every architectural decision, UI decision, gameplay mechanic, and future feature must follow this constitution.

If a proposed feature conflicts with this document, this document always wins.

---

# Vision

RunQuest is a daily running decision game.

It is not an endless game.

It is not a running simulator.

It is not an idle game.

It is a daily ritual that challenges players to think like runners.

---

# Product Identity

RunQuest is closer to:

* Wordle
* Reigns
* Duolingo

than:

* Subway Surfers
* Temple Run
* Candy Crush

The gameplay focuses on strategic decisions rather than reflexes.

---

# Core Principle

One Daily Race.

One Official Attempt.

One Story.

Every player receives exactly the same race every day.

What makes every experience unique is the player's decisions.

---

# Player Experience

The player journey should feel like this:

Read today's race.

Prepare.

Make decisions.

Discover the consequences.

Share the story.

Come back tomorrow.

---

# Design Principles

## 1. Decisions Matter

Every decision must have meaningful consequences.

No decision should exist only for decoration.

---

## 2. No Perfect Strategy

There must never be one objectively correct strategy.

Every option must include trade-offs.

Players should discuss strategies after finishing.

---

## 3. Hidden Information

Players never know everything.

The game intentionally provides incomplete information.

Uncertainty creates interesting decisions.

---

## 4. Story Over Numbers

Results should explain what happened.

Not only display statistics.

The player should remember:

"I bonked because I skipped nutrition."

instead of

"Energy = 3."

---

## 5. Short Sessions

A complete Daily Race should take between

2 and 3 minutes.

Never exceed 5 minutes.

---

## 6. Daily Ritual

The goal is not endless play.

The goal is creating a habit.

Players should want to return tomorrow.

---

## 7. Shareability

Every completed race should generate a result worth sharing.

Sharing is a core gameplay outcome.

Not an extra feature.

---

## 8. Simplicity

Every new feature must simplify the experience.

Not complicate it.

Complex systems are acceptable.

Complex interfaces are not.

---

# Gameplay Principles

Preparation is as important as racing.

Players should win or lose because of decisions made before the race.

The race only reveals the consequences.

---

# Simulation Principles

Simulation must be deterministic.

Given:

* identical race configuration
* identical player decisions
* identical engine version

the result must always be identical.

Randomness may exist internally but must always be driven by a reproducible seed.

---

# Daily Race Principles

There is only one official Daily Race every day.

No retries.

No alternative routes.

No difficulty selection.

The challenge is shared globally.

---

# Technical Principles

Game logic must never depend on UI.

UI must never contain business logic.

Simulation must remain a pure domain module.

Data sources must be replaceable.

Phase 0 must work entirely offline.

---

# Localization Principles

Internationalization is mandatory.

English and Bahasa Indonesia are supported from day one.

No user-facing string may be hardcoded.

Every new feature must support localization before implementation is considered complete.

---

# Storage Principles

Phase 0 uses LocalStorage only.

Storage must be versioned.

Migration paths must always exist.

Player identity begins as an anonymous local UUID.

Future authentication must preserve player progress.

---

# Product Principles

The first release is a prototype.

Its purpose is validation.

Not monetization.

Not scalability.

Not optimization.

Success is measured by player behavior.

Not technical complexity.

---

# Success Metrics

The first release should answer:

Do players finish today's race?

Do players understand the mechanics?

Do players share their results?

Do players come back tomorrow?

Nothing else matters before these questions are answered.

---

# Features That Are Explicitly Out of Scope

The following features are intentionally excluded from Phase 0:

* Multiplayer
* Friends
* Guilds
* Chat
* Marketplace
* Inventory
* Equipment Collection
* Character Customization
* Cloud Save
* Backend
* Database
* Authentication
* Push Notification
* Real GPS Tracking
* Strava Integration

These features may be reconsidered after gameplay validation.

---

# Decision Filter

Before implementing any feature, ask:

Does this improve daily retention?

Does this improve decision making?

Does this improve emotional engagement?

Does this improve shareability?

If all answers are "No",

do not build it.

---

# Final Principle

RunQuest is not about running faster.

RunQuest is about making better decisions.

Every race should teach something.
