# Epic 014 — Race Intelligence

## Vision

Running is not only about physical ability.

Great runners study the race before it begins.

They understand the terrain, weather, elevation, pacing opportunities, and possible risks before making any decisions.

RunQuest should simulate this experience.

The player should feel like a race strategist rather than simply selecting equipment.

This Epic introduces the concept of **Race Intelligence**, allowing players to analyze today's race before entering the Preparation Phase.

This phase does not calculate outcomes.

It provides information that influences player decisions.

---

# Design Philosophy

Preparation should no longer happen in isolation.

Instead, Preparation should be informed by Race Analysis.

The player should constantly ask:

- Which shoes fit today's course?
- Should I bring extra nutrition?
- Will the weather change?
- Should I conserve energy early?

Good preparation starts with understanding the race.

---

# New Gameplay Loop

Daily Race Board

↓

Race Analysis

↓

Preparation

↓

Simulation

↓

Interactive Decisions

↓

Race Report

↓

Coach Reflection

↓

History

---

# Epic Goals

Introduce strategic planning before every race.

Encourage players to study the race.

Create uncertainty without frustration.

Increase replayability.

Improve immersion.

Prepare the foundation for adaptive coaching.

---

# Sprint 14.1 — Race Analysis

## Goal

Create a dedicated Race Analysis screen.

This screen appears immediately after selecting a race.

The player should feel like studying a real race briefing.

---

## Display

Race Name

Race Category

Distance

Estimated Duration

Difficulty

Surface

Elevation Profile

Weather

Temperature

Humidity

Wind Speed

Known Hazards

Coach Insight

---

## Example

Morning Tempo

Distance

21.1 KM

Difficulty

★★★★☆

Surface

Road

Elevation

Moderate Hills

Weather

31°C

Humidity

85%

Wind

18 km/h

Coach Insight

"The second half of this course is significantly harder than the first."

---

## Acceptance Criteria

- Fully localized
- Responsive
- Read-only
- No calculations
- Scenario-driven
- No backend dependency

---

# Sprint 14.2 — Partial Information System

## Goal

Introduce uncertainty.

Not every race condition should be known before the race.

Players should make decisions using incomplete information.

---

## Known Information

Distance

Surface

Elevation

Expected Temperature

Difficulty

---

## Hidden Information

Unexpected Weather

Wind Direction Changes

Crowd Density

Aid Station Quality

Road Incidents

Late Fatigue Zones

These become visible only during the race.

---

## Acceptance Criteria

Unknown information should remain hidden until triggered by the Simulation Engine.

---

# Sprint 14.3 — Dynamic Weather Timeline

## Goal

Weather should evolve naturally during the race.

Preparation becomes more meaningful when weather is dynamic.

---

## Example

Start

27°C

↓

Mid Race

30°C

↓

Finish

33°C

---

Another Example

Cloudy

↓

Light Rain

↓

Heavy Rain

---

Weather properties

Temperature

Humidity

Wind

Rain

Visibility

Heat Index

---

## Acceptance Criteria

Weather Timeline is generated before the race.

Weather changes remain deterministic.

Different races generate different weather timelines.

---

# Sprint 14.4 — Race Segments

## Goal

Replace a single continuous race with multiple race segments.

Every segment creates different tactical opportunities.

---

## Example

Start

↓

Flat Road

↓

Rolling Hills

↓

Long Climb

↓

Technical Descent

↓

Final Sprint

---

Segment Properties

Surface

Gradient

Difficulty

Weather

Expected Pace

Decision Probability

---

Decision events should be generated according to segments rather than random intervals.

---

## Acceptance Criteria

Every race contains multiple segments.

Segments influence

- pace
- fatigue
- event generation
- decision opportunities

---

# Sprint 14.5 — Risk System

## Goal

Introduce hidden race risk.

Every player decision influences overall race risk.

Risk should become a strategic resource.

---

## Examples

Aggressive Pace

Increase Risk

Skip Hydration

Increase Risk

Safe Strategy

Reduce Risk

Late Nutrition

Reduce Risk

---

Risk influences

Probability of

- Cramp
- Injury
- Mistakes
- Fatigue
- Equipment Issues

---

## Acceptance Criteria

Risk is continuously recalculated.

Risk modifies event probabilities.

Risk never guarantees outcomes.

---

# Sprint 14.6 — Confidence & Momentum

## Goal

Introduce emotional state into simulation.

Running is psychological as much as physical.

---

## Confidence

Confidence changes after important moments.

Examples

Successful Overtake

+ Confidence

Crowd Support

+ Confidence

Failed Push

- Confidence

Long Climb Success

+ Confidence

---

Confidence influences

Decision Quality

Recovery

Aggressive Choices

Focus

---

## Momentum

Momentum reflects how the race currently feels.

Good decisions

Increase Momentum

Poor decisions

Reduce Momentum

Momentum affects

Energy Efficiency

Average Pace

Confidence Recovery

Mental Stability

---

## Acceptance Criteria

Both values are visible in the live HUD.

Both continuously change during the race.

Both influence simulation outcomes.

---

# Sprint 14.7 — Coach Briefing

## Goal

Upgrade coach messages.

The coach should analyze today's race.

Not the player.

Player analysis comes in future Epics.

---

Examples

"The weather will become much hotter after halfway."

"Your pacing strategy will be important on today's climbs."

"Electrolytes could become valuable in this humidity."

"Saving energy early may pay off later."

Coach Briefings should reference

Weather

Elevation

Distance

Surface

Difficulty

---

## Acceptance Criteria

Every race generates a contextual coach briefing.

No generic messages.

---

# Sprint 14.8 — Race Intelligence Integration

## Goal

Integrate every Race Intelligence component into one seamless flow.

---

Flow

Daily Board

↓

Race Analysis

↓

Coach Briefing

↓

Preparation

↓

Simulation

↓

Decision Events

↓

Result

---

Requirements

Preparation choices should naturally reflect race analysis.

Weather should match briefing.

Segments should match elevation.

Coach insights should remain consistent with actual race events.

---

# Technical Requirements

Race Intelligence must remain completely independent from React.

No business logic inside UI.

No direct LocalStorage access.

Scenario

↓

Race Intelligence Engine

↓

Preparation

↓

Simulation

The engine should return immutable objects.

Never mutate inputs.

---

# Domain Additions

RaceAnalysis

- id
- raceId
- weather
- elevation
- segments
- hazards
- briefing
- knownConditions
- hiddenConditions

RaceSegment

- id
- type
- distance
- elevation
- weather
- terrain
- difficulty
- eventWeight

WeatherTimeline

- id
- checkpoints
- temperature
- humidity
- wind
- rain
- visibility

CoachBriefing

- id
- title
- summary
- recommendations
- warnings

---

# Future Compatibility

This architecture should support

- Seasonal weather
- Night races
- AI-generated race briefings
- Dynamic disasters
- Live race modifiers
- Community scenarios
- Professional race modes

without redesigning the domain model.

---

# Definition of Done

Epic 014 is complete when

- Every race starts with a Race Analysis.
- Players understand the course before preparing.
- Weather evolves naturally during races.
- Segments influence race behavior.
- Risk affects probability rather than certainty.
- Confidence and Momentum become living attributes.
- Coach Briefings feel contextual.
- Every race feels strategically different.
- The architecture remains deterministic and framework independent.

The objective of Epic 014 is not to increase complexity.

The objective is to make every preparation decision feel informed, intentional, and meaningful.
