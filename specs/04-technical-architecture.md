# Technical Architecture

Version: 1.0.0

Status: Draft

Owner: Founder

---

# Philosophy

Architecture exists to maximize iteration speed.

Not scalability.

Not microservices.

Not enterprise complexity.

---

# Technology Stack

Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion
* Zustand

Storage

* LocalStorage

Deployment

* Vercel

Version Control

* GitHub

---

# Architecture

Browser

↓

Next.js

↓

Simulation Engine

↓

Storage Layer

↓

LocalStorage

No backend exists in Phase 0.

---

# Layer Responsibilities

## UI Layer

Responsible for:

Rendering

Animation

Navigation

Accessibility

Never performs simulation.

---

## Application Layer

Responsible for:

User flow

Screen transitions

Loading race configuration

Saving player progress

---

## Domain Layer

Responsible for:

Simulation

Fatigue

Nutrition

Weather

Pacing

Scoring

Story generation

Must contain zero React code.

---

## Infrastructure Layer

Responsible for:

Storage

JSON loading

Utilities

UUID generation

Localization

---

# Folder Structure

src/

engine/

simulation/

weather/

nutrition/

fatigue/

story/

game/

storage/

i18n/

hooks/

components/

lib/

types/

---

# Race Configuration

Every race is stored as JSON.

Example

/public/races/

2026-07-01.json

Simulation only reads data.

It never modifies race files.

---

# Storage

LocalStorage Schema

Versioned.

Migration ready.

Future backend compatible.

---

# Localization

Every UI string must come from translation dictionaries.

Never hardcode strings.

Supported languages:

English

Bahasa Indonesia

---

# Testing Strategy

Unit Tests

Simulation Engine

Integration Tests

Game Flow

Manual Testing

UI

No end-to-end testing required for Phase 0.

---

# Future Compatibility

The architecture must allow replacing:

LocalStorage

↓

REST API

without changing the Simulation Engine.
