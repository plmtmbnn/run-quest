# docs/12-json-schema.md

# JSON Schema

Version: 1.0.0

Status: Approved

Owner: Engineering

---

# Purpose

This document defines every JSON format used by RunQuest.

JSON is the contract between content and engine.

Engine must never depend on hardcoded races.

Everything should be data-driven.

---

# Daily Challenge

{
  "id": "2026-07-01",

  "date": "2026-07-01",

  "title": {

    "en": "...",

    "id": "..."

  },

  "briefing": {

    "en": "...",

    "id": "..."

  },

  "environment": {},

  "race": {},

  "objective": {},

  "eventPools": []
}

---

# Environment

{
  "weather": "hot",

  "temperature": 32,

  "humidity": 85,

  "wind": {

    "direction": "east",

    "speed": 14

  },

  "timeOfDay": "morning"
}

---

# Race

{
  "distance": 21.1,

  "surface": "road",

  "elevation": "rolling",

  "difficulty": "medium"
}

---

# Objective

{
  "targetTime": 115,

  "bonus": "negative_split"
}

---

# Event Pool

{
  "id": "hydration",

  "probability": 0.3,

  "events": [

    "drink_water",

    "miss_station",

    "crowded_station"

  ]
}

---

# Event

{
  "id": "drink_water",

  "title": {

    "en": "...",

    "id": "..."

  },

  "description": {

    "en": "...",

    "id": "..."

  },

  "effects": {

    "hydration": 15,

    "fatigue": -5

  }
}

---

# Equipment

{
  "id": "carbon_racer",

  "name": {

    "en": "...",

    "id": "..."

  },

  "category": "shoes",

  "modifiers": {

    "pace": 8,

    "fatigue": 4,

    "stability": -2
  }
}

---

# Nutrition

{
  "id": "electrolyte",

  "modifiers": {

    "hydration": 15,

    "energy": 5
  }
}

---

# Mindset

{
  "id": "focused",

  "modifiers": {

    "confidence": 12,

    "risk": -5
  }
}

---

# Translation

{
  "common": {

    "start": "...",

    "cancel": "..."
  },

  "home": {

    "title": "...",

    "subtitle": "..."
  }
}

---

# Validation Rules

Every JSON

must have

id

must have

version

must pass

Zod Schema

must never contain executable code

---

# File Organization

/public

/races

2026-07-01.json

2026-07-02.json

...

/equipment

shoes.json

nutrition.json

gear.json

/events

hydration.json

weather.json

terrain.json

/locales

en.json

id.json

---

# Loading Flow

Load Challenge

↓

Validate

↓

Normalize

↓

Simulation

If validation fails

↓

Abort

↓

Show Error

---

# AI Rules

Never hardcode challenge data.

Always load JSON.

Always validate using Zod.

Never assume optional fields exist.

Every schema must support future extension.