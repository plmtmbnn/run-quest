# docs/25-scenario-dsl.md

# Scenario DSL Specification

Version: 1.0.0

Status: Approved

Owner: Product & Engineering

---

# Purpose

Scenario DSL (Domain Specific Language) defines race scenarios in a human-readable format.

The Simulation Engine never reads DSL directly.

Instead, the DSL is compiled into Scenario JSON before execution.

This separation allows game designers, content creators, and AI agents to create new race scenarios without modifying application code.

---

# Philosophy

Scenario describes the world.

Simulation determines the outcome.

Story describes what happened.

Each layer has a single responsibility.

```
Scenario DSL
        │
        ▼
Compiler
        │
        ▼
Scenario JSON
        │
        ▼
Simulation Engine
        │
        ▼
Race Timeline
        │
        ▼
Story Engine
```

---

# Goals

* Human readable
* AI friendly
* Git friendly
* Versioned
* Easy to review
* Deterministic
* Extensible

---

# Non Goals

Scenario DSL is NOT:

* programming language
* scripting language
* simulation engine
* business logic

---

# File Extension

Recommended

```
*.rq.yml
```

Example

```
morning-tempo.rq.yml
```

---

# Basic Structure

```yaml
version: 1

id: morning_tempo

title:
  en: Morning Tempo
  id: Tempo Pagi

description:
  en: Stay patient and survive the heat.
  id: Bertahan menghadapi panas pagi.
```

---

# Metadata

```yaml
metadata:

  author: RunQuest

  difficulty: medium

  estimatedDuration: 120

  tags:

    - road

    - heat

    - half-marathon
```

---

# Environment

```yaml
environment:

  weather: hot

  temperature: 31

  humidity: 84

  wind:

    speed: 16

    direction: east

  timeOfDay: morning
```

---

# Course

```yaml
course:

  distance: 21.1

  surface: road

  elevation: rolling

  difficulty: medium
```

---

# Objective

```yaml
objective:

  finishUnder: 120

  bonus:

    negativeSplit

  fail:

    dnf
```

---

# Race Timeline

Timeline defines where events may occur.

```yaml
timeline:

  - km: 4

    pool: hydration

  - km: 8

    pool: heat

  - km: 13

    pool: crowd

  - km: 18

    pool: fatigue

  - km: 20

    pool: final_push
```

Timeline does not define the event.

It defines the possible event pool.

---

# Event Pool

```yaml
eventPools:

  hydration:

    probability:

      drink: 70

      miss: 20

      crowded: 10

  heat:

    probability:

      strongHeat: 60

      mildHeat: 40
```

Probabilities inside a pool must always total 100%.

---

# Story Hint

Story hints help Story Engine determine narrative tone.

```yaml
story:

  mood: inspiring

  ending: comeback

  narrator: second_person
```

---

# Difficulty Levels

Allowed values

```
easy

medium

hard

expert

legend
```

Difficulty affects scenario generation only.

Simulation Engine receives normalized values.

---

# Constraints

Scenario must satisfy:

* At least one timeline event
* Distance greater than zero
* Supported weather only
* Supported terrain only
* Supported objective only

Compiler rejects invalid scenarios.

---

# Validation

Every DSL file must pass:

* YAML syntax validation
* JSON Schema validation
* Zod validation
* Business Rule validation

Compilation stops immediately if validation fails.

---

# Compiler Output

Compiler converts DSL into Scenario JSON.

Example

DSL

```yaml
weather: hot
```

Compiled JSON

```json
{
  "weather": {
    "id": "hot",
    "temperatureModifier": 12,
    "hydrationModifier": -8
  }
}
```

The Simulation Engine consumes only compiled JSON.

---

# Future Extensions

Scenario DSL may support:

* AI generated races
* Seasonal events
* Community races
* World Marathon Majors
* Ultra Marathon
* Trail Running
* Team Relay

No engine changes should be required.

---

# AI Rules

AI must never write Scenario JSON manually.

AI always writes Scenario DSL.

Compiler is responsible for normalization.

Business rules belong to the compiler, not the content.

Scenario files must remain declarative.

Never embed executable code.

---

# Example

```yaml
version: 1

id: morning_tempo

title:
  en: Morning Tempo
  id: Tempo Pagi

metadata:
  difficulty: medium

environment:
  weather: hot
  temperature: 31
  humidity: 84

course:
  distance: 21.1
  surface: road
  elevation: rolling

objective:
  finishUnder: 120

timeline:
  - km: 5
    pool: hydration

  - km: 10
    pool: crowd

  - km: 18
    pool: fatigue

story:
  mood: inspiring
```

---

# Design Principles

Content creators define scenarios.

Engine executes scenarios.

Story Engine narrates scenarios.

UI presents scenarios.

Each subsystem has one responsibility.

This separation ensures scalability, maintainability, and AI-assisted content creation.
