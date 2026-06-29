# docs/11-storage-schema.md

# Storage Schema

Version: 1.0.0

Status: Approved

Owner: Engineering

---

# Purpose

This document defines how RunQuest stores data on the client.

Phase 0 is frontend-only.

No backend.

No database.

LocalStorage is the single persistence layer.

The storage layer must be abstracted.

UI components must never access LocalStorage directly.

---

# Principles

Single Source of Truth

Versioned

Type Safe

Migratable

Framework Independent

---

# Storage Architecture

React

↓

Store (Zustand)

↓

Storage Repository

↓

Storage Adapter

↓

LocalStorage

The UI never communicates with LocalStorage directly.

---

# Storage Keys

runquest.version

runquest.player

runquest.settings

runquest.history

runquest.daily

runquest.cache

---

# Version

Every storage object contains a version.

Example

{
  "version": 1
}

This allows future migrations.

---

# Player

{
  "version": 1,

  "id": "uuid",

  "language": "en",

  "createdAt": "...",

  "lastPlayedAt": "...",

  "statistics": {

    "totalRuns": 0,

    "currentStreak": 0,

    "longestStreak": 0

  }
}

---

# Settings

{
  "version": 1,

  "theme": "system",

  "language": "en",

  "reducedMotion": false,

  "sound": true
}

---

# Daily Progress

Stores today's progress.

{
  "version": 1,

  "challengeId": "2026-07-01",

  "status": "completed",

  "completedAt": "...",

  "resultId": "..."
}

Possible Status

not_started

in_progress

completed

---

# Race History

[
  {
    "challengeId": "...",

    "playedAt": "...",

    "finishTime": 5234,

    "grade": "A",

    "headline": "...",

    "score": 91
  }
]

History is append-only.

Never modify historical entries.

---

# Cache

Cache stores static assets.

Examples

Daily Challenges

Translation

Configuration

TTL depends on asset type.

---

# Migration

Every version upgrade must define:

Current Version

Target Version

Migration Function

Rollback Strategy

Migration must never destroy user data.

---

# Storage Repository

Storage operations

load()

save()

update()

remove()

clear()

exists()

No other module accesses LocalStorage.

---

# Error Handling

Invalid JSON

↓

Recover

↓

Fallback to default

↓

Never crash

---

# Size Budget

Maximum LocalStorage usage

2 MB

Expected

<300 KB

---

# Security

Never store

Authentication Token

Password

Secret Key

Personal Information

---

# AI Rules

Never call LocalStorage directly inside React components.

Always use Storage Repository.

Always validate loaded data with Zod.

Always support future migration.