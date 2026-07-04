# Sprint 15 — Runner Profile & Long-Term Progression Foundation

## Objective

This sprint begins Epic 2.

The goal is to transform RunQuest from a standalone race simulation into a long-term running career.

Players are no longer simply playing races.

They are managing a runner.

This sprint does NOT introduce training plans or permanent stat upgrades.

Instead, it establishes the persistent runner profile that future systems will build upon.

---

# Design Philosophy

RunQuest is not an RPG.

The player should never grind experience points.

The player should never permanently increase Speed or Stamina through repetitive play.

Instead, the game models long-term athletic development.

The runner evolves through consistency, recovery, knowledge, and decision quality.

The long-term progression should feel similar to managing a real runner rather than leveling up a game character.

---

# Core Principles

The Runner Profile should represent the current condition of the athlete.

Not the player's level.

Avoid RPG mechanics.

Avoid permanent stat inflation.

Avoid collectible power.

Every variable should have a meaningful relationship with endurance running.

---

# Runner Profile

Create a persistent Runner Profile stored locally.

The profile should survive browser refreshes and future application updates.

Suggested structure:

**RunnerProfile**

- `id`: Unique identifier for the runner.
- `displayName`: Name displayed in the UI.
- `createdAt`: Timestamp of profile creation.
- `totalRuns`: Total number of races completed.
- `totalDistance`: Total distance run in all races (in kilometers).
- `totalRaceTime`: Total time spent racing (in seconds).
- `totalTrainingDays`: Total number of training days.
- `currentWeek`: Current week in the training cycle.
- `currentSeason`: Current season in the training cycle.
- `currentFitness`: Long-term aerobic development metric.
- `currentFatigue`: Accumulated training stress metric.
- `currentReadiness`: Today's ability to perform, calculated from Fitness, Fatigue, and other factors.
- `consistency`: Measure of training consistency.
- `preferredSurface`: Preferred running surface (e.g., road, trail).
- `preferredDistance`: Preferred race distance (e.g., 5K, 10K).
- `preferredStrategy`: Preferred race strategy (e.g., negative split, even pace).
- `runningIdentity`: Locked initially, unlocks in future updates.
- `coachRelationship`: Future feature for coach interactions.
- `knowledgeProgress`: Future feature for knowledge unlocks.

---

# Persistent Variables

Introduce three core long-term variables.

## Fitness

Represents long-term aerobic development.

**Characteristics**

- Changes slowly.
- Cannot increase dramatically in one day.
- Decreases slowly after inactivity.
- Affects race efficiency.
- Hidden calculations may use Fitness.

Fitness is NOT a temporary race buff.

---

## Fatigue

Represents accumulated training stress.

**Characteristics**

- Changes daily.
- Increases after races.
- Increases after hard training.
- Decreases through recovery.
- Directly affects Race Readiness.

Fatigue is expected.
High fatigue is not always bad.

---

## Race Readiness

Represents today's ability to perform.

**Calculated from**

- Fitness
- Fatigue
- Recent Recovery
- Consistency
- Recent Training

Readiness changes every day.
Readiness should never be directly editable.

---

# Derived Relationship

```
Fitness
↓
Training
↓
Fatigue
↓
Recovery
↓
Readiness
↓
Race Performance
```

The engine should avoid circular dependencies.

---

# Current UI

Add a new Runner Profile screen.

**Display**

- Runner Name
- Lifetime Distance
- Total Runs
- Current Fitness
- Current Fatigue
- Today's Race Readiness
- Current Running Streak

Do not overload the screen.
Keep the presentation minimal.

---

# Long-Term Philosophy

Players should immediately understand:

> "I am managing a runner."

not

> "I am leveling up."

---

# Technical Requirements

Create a new domain:

```
runner/
```

Suggested files:

- `runner-profile.ts`: Core Runner Profile logic.
- `runner-store.ts`: State management and persistence.
- `runner-engine.ts`: Business logic and calculations.
- `runner-types.ts`: TypeScript types for the Runner Profile.
- `runner-selectors.ts`: Derived state calculations.
- `runner-persistence.ts`: Local storage operations.

The engine must remain framework independent.
Business logic must not depend on React.

---

# Future Compatibility

The Runner Profile must support future systems without breaking changes.

Future integrations include:

- Weekly Planning
- Coach Intelligence
- Knowledge Unlocks
- Running Identity
- Seasonal Calendar
- Injury System
- Training Plans
- AI Coach
- Community Events

---

# Acceptance Criteria

✓ Runner Profile persists locally.
✓ Fitness persists across races.
✓ Fatigue persists across races.
✓ Race Readiness is calculated automatically.
✓ Runner Profile screen is implemented.
✓ Business logic is isolated from UI.
✓ No permanent RPG stat upgrades exist.
✓ The architecture is extensible for future career systems.

---

# Success Criteria

Players should finish this sprint feeling that they now own a persistent runner rather than simply replaying isolated races.

This sprint establishes the foundation for every long-term gameplay mechanic in RunQuest.