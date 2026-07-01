# Sprint 15 — Anticipation Engine

## Vision

A successful daily game should not only provide a satisfying experience today.

It should also create curiosity about tomorrow.

The purpose of the Anticipation Engine is to give players a reason to return every day without relying on artificial rewards, login streak pressure, or pay-to-win mechanics.

Instead of asking:

> "What race do I have today?"

Players should naturally begin asking:

> "What will happen tomorrow?"

The anticipation should feel authentic to the world of running.

---

# Design Philosophy

RunQuest is a running strategy simulator.

The anticipation system should remain grounded in realistic race preparation.

Avoid fantasy mechanics.

Avoid loot boxes.

Avoid random reward wheels.

Avoid surprise chests.

The anticipation should come from uncertainty surrounding the next race.

---

# Core Objectives

The Anticipation Engine should:

- Encourage players to return tomorrow.
- Build curiosity without revealing everything.
- Support strategic preparation.
- Increase immersion.
- Remain deterministic.
- Be independent from the Simulation Engine.

---

# Gameplay Flow

```
Race Result
    ↓
Coach Reflection
    ↓
Tomorrow Preview
    ↓
Player Leaves
    ↓
Returns Tomorrow
    ↓
Today's Race Unlocks
```

The Tomorrow Preview should become the final screen before the player exits the application.

---

# Tomorrow Preview

After finishing today's race, display a preview of tomorrow's race.

The preview intentionally contains incomplete information.

The player should receive enough information to become curious, but not enough to fully understand tomorrow's challenge.

---

# Known Information

The player may see:

- Race Category
- Distance
- Surface
- Difficulty
- Weather Forecast
- Estimated Temperature

### Example
```
Tomorrow
Road Race
10 KM
★★★★☆

Forecast
29°C
Possible Rain
```

---

# Hidden Information

The following information should remain unknown until tomorrow:

- Actual Weather
- Wind Direction
- Hidden Hazards
- Unexpected Incidents
- Aid Station Conditions
- Dynamic Race Events
- Decision Timeline
- Coach Tactical Notes

Display hidden information using placeholders.

### Example
```
Tomorrow
Hidden Events
???

Unknown Conditions
???

Special Situation
???
```

---

# Forecast System

Forecasts should not always be perfectly accurate.

Just like real-world weather forecasts.

### Examples
- **Forecast**: Sunny / **Actual Race**: Light Rain
- **Forecast**: Heavy Rain / **Actual Race**: Cloudy
- **Forecast**: Hot / **Actual Race**: Hotter Than Expected

Forecast accuracy should be configurable.

Forecasts should influence preparation, but never guarantee reality.

---

# Race Intelligence Integration

Tomorrow Preview should consume information from the Race Intelligence Engine:

```
Race Intelligence
    ↓
Forecast Engine
    ↓
Tomorrow Preview
    ↓
Player
```

The Anticipation Engine must never duplicate race generation logic.

---

# Unknown Course Philosophy

Players should know the overall course.

Players should NOT know every detail.

### Known
- Distance
- Surface
- Elevation Profile
- Estimated Weather
- Overall Difficulty

### Unknown
- Wind Changes
- Weather Shifts
- Hazard Locations
- Crowd Density
- Aid Station Quality
- Critical Decision Moments

Preparation should become risk management rather than optimization.

---

# Coach Preview

The coach may provide one contextual message.

### Examples
- "The second half of tomorrow's race may become much more demanding."
- "Weather conditions appear unstable."
- "Consider bringing additional hydration."
- "I expect several tactical opportunities tomorrow."

Coach messages should never reveal hidden mechanics.

---

# Suspense Rules

The Tomorrow Preview should generate curiosity without creating frustration.

Avoid messages such as:
- "Something amazing is waiting tomorrow."

Instead, prefer realistic race-oriented communication.

### Examples
- "Weather conditions remain uncertain."
- "Several course conditions are still being assessed."
- "Officials have not finalized tomorrow's race briefing."
- "Strong winds are possible."

The player should feel intrigued rather than manipulated.

---

# User Experience Principles

- The Tomorrow Preview should take less than 15 seconds to read.
- Players should leave the application wanting to return.
- Do not overwhelm players with information.
- Use visual hierarchy.
- Highlight uncertainty rather than hiding everything.

---

# Technical Requirements

The Anticipation Engine must be completely independent:
- No React dependency.
- No Zustand dependency.
- No LocalStorage access.
- No browser APIs.

### Input
- Tomorrow Scenario
- Weather Forecast
- Race Intelligence
- Forecast Accuracy
- Seed

### Output: TomorrowPreview
- Summary
- Forecast
- Known Conditions
- Hidden Conditions
- Coach Preview

The engine must be deterministic. Never use `Math.random()`.

---

# Domain Model

```typescript
export interface TomorrowPreview {
  id: string;
  raceId: string;
  category: RaceEntry["category"];
  distance: number;
  surface: Surface;
  difficulty: number;
  forecast: Forecast;
  knownConditions: string[];
  hiddenConditions: HiddenCondition[];
  coachPreview: CoachPreview;
}

export interface Forecast {
  temperature: number;
  weather: Weather;
  humidity: number;
  windProbability: number;
  rainProbability: number;
  confidence: number;
}

export interface HiddenCondition {
  id: string;
  category: string;
  visibility: "hidden" | "revealed";
  revealTrigger: string;
}

export interface CoachPreview {
  title: LocalizedText;
  summary: LocalizedText;
  recommendation: LocalizedText;
}
```

---

# Acceptance Criteria

- Every completed race generates a Tomorrow Preview.
- The preview displays only partial race information.
- Forecasts are informative but not perfectly accurate.
- Hidden information is revealed only during tomorrow's race.
- Coach previews remain contextual and realistic.
- The feature integrates with the Race Intelligence Engine.
- The architecture remains deterministic.
- The Anticipation Engine remains framework independent.
- The Tomorrow Preview creates curiosity without relying on artificial rewards or gambling mechanics.

---

# Future Compatibility

The Anticipation Engine should support future features without architectural changes.

### Examples
- Seasonal races
- Community events
- Elite race weekends
- Dynamic weather systems
- AI-generated coach briefings
- Multi-day race series
- Tournament calendars
- Marathon weekend specials

---

# Success Criteria

This sprint is successful when players finish today's race and naturally become curious about tomorrow's race.

The objective is not to reveal tomorrow.

The objective is to make players look forward to discovering it.
