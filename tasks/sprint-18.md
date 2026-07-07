# Sprint 18 — Coach Intelligence & Training Feedback

## Objective

Introduce the first intelligent coaching system in RunQuest.

The Coach is not a narrator.

The Coach is not a tutorial.

The Coach is not an achievement system.

The Coach acts as an experienced running coach who observes the player's decisions, explains outcomes, and helps players become better runners over time.

The Coach should teach.

Not praise.

Not punish.

The goal is to transform every race and training session into a learning opportunity.

---

# Design Philosophy

RunQuest is about becoming a smarter runner.

The Coach exists to explain cause and effect.

The Coach should never simply tell players they succeeded or failed.

Instead, every message should answer one question:

> "Why did this happen?"

---

# Coaching Philosophy

The Coach should:

- Observe
- Analyze
- Explain
- Recommend

The Coach should never:

- Judge
- Give meaningless compliments
- Reveal hidden mechanics
- Provide perfect solutions

The player should still discover optimal strategies independently.

---

# Gameplay Loop

```
Training
↓
Race
↓
Simulation Data
↓
Coach Analysis
↓
Player Reflection
↓
Knowledge Growth
↓
Next Decision
```

The Coach becomes the bridge between gameplay and learning.

---

# Analysis Categories

The Coach may analyze:

- Pacing
- Heart Rate Management
- Hydration Timing
- Nutrition Timing
- Fatigue Management
- Recovery Choices
- Environmental Adaptation
- Decision Making
- Risk Management
- Weekly Balance

The Coach should only discuss topics that actually occurred.

Avoid generic advice.

---

# Post-Race Feedback

### Examples

- "You maintained an excellent aerobic effort during the first half."
- "You stayed in Heart Rate Zone 5 for too long before the final climb."
- "You delayed hydration until dehydration had already started affecting performance."
- "You attacked too early considering today's temperature."
- "Your pacing became inconsistent after the second aid station."
- "The recovery decision at KM 14 prevented significant fatigue accumulation."

---

# Post-Training Feedback

### Examples

- "You completed two demanding sessions in consecutive days."
- "I recommend an easier session tomorrow."
- "Today's recovery run reduced fatigue but produced little training stimulus."
- "The interval session generated a strong adaptation stimulus, but recovery is now essential."

---

# Coaching Style

The Coach should speak professionally.

Avoid motivational quotes.

Avoid exaggerated praise.

Avoid artificial positivity.

The Coach should sound like an experienced endurance coach.

---

# Coach Confidence

Every recommendation includes a confidence level.

### High Confidence

> "I strongly recommend a recovery session tomorrow."

### Medium Confidence

> "You may benefit from reducing your pace earlier."

### Low Confidence

> "Several strategies could have worked in today's conditions."

This prevents the Coach from appearing omniscient.

---

# Observation Engine

The Coach builds observations using race telemetry.

### Possible Inputs

- Average Pace
- Pace Variability
- Heart Rate Zones
- Hydration Timeline
- Nutrition Usage
- Environmental Conditions
- Decision History
- Fatigue Progression
- Finish Result
- Target Achievement

The Coach should never invent observations.

Every statement must be supported by gameplay data.

---

# Knowledge Discovery

Repeated patterns should unlock educational insights.

These are milestones, not rewards.

They do NOT increase player stats.

### Examples

**Heat Management**
Unlocked after successfully completing multiple hot races.

**Negative Split**
Unlocked after consistently improving pace in the second half.

**Efficient Hydration**
Unlocked after demonstrating effective hydration timing.

---

# Runner Tendencies

The Coach should quietly monitor player behavior over time.

### Examples

- Frequently attacks too early
- Usually races conservatively
- Often delays nutrition
- Excellent hydration discipline
- Strong hill pacing
- Poor recovery habits

Tendencies remain hidden until enough evidence exists.

Later they may contribute to the Running Identity system.

---

# Weekly Review

At the end of each week, generate a summary.

### Example

```
Weekly Review

Training Load    → Optimal
Recovery         → Needs Improvement
Consistency      → Excellent
Nutrition        → Improving
Race Readiness   → Stable

Suggested Focus Next Week:
Improve recovery between hard sessions.
```

The review should be concise.

---

# Coach Memory

The Coach should remember previous observations across weeks.

### Examples

- "I noticed this is the third week in which fatigue accumulated before the weekend race."
- "You've become significantly better at controlling your effort on climbs."

This creates continuity and learning across sessions.

---

# Technical Requirements

Create a new domain:

```
coach/
```

### Suggested Files

- `coach-types.ts` — TypeScript types for all Coach domain concepts.
- `coach-rules.ts` — Rule definitions that map telemetry conditions to insights.
- `coach-engine.ts` — Core observation evaluation and insight selection logic.
- `coach-analysis.ts` — Post-race and post-training analysis pipeline.
- `coach-memory.ts` — Persistence of tendencies, observations, and weekly history.
- `coach-feedback.ts` — Structured feedback assembly (confidence, message, category).
- `coach-selectors.ts` — Derived queries over coach state (e.g., latest feedback, active tendencies).

### Architecture Layers

```
Telemetry
↓
Rule Evaluation     (coach-rules.ts)
↓
Coach Insight       (coach-engine.ts)
↓
Localized Presentation (coach-feedback.ts)
```

This separation allows future AI upgrades without replacing business logic.

### Constraints

- No React dependencies.
- No browser dependencies.
- Business logic must remain framework independent.
- The Coach must remain deterministic.
- Every generated statement must be traceable to a gameplay input.

---

# AI-Ready Architecture

The Coach initially uses deterministic rule-based analysis.

Later versions may optionally integrate LLM-generated explanations.

The architecture must keep the following concerns strictly separated:

- **Telemetry** — raw gameplay data collected during races and training.
- **Rule Evaluation** — deterministic logic that detects patterns and conditions.
- **Coach Insight** — structured output (what happened, why, what to consider).
- **Localized Presentation** — human-readable text, optionally AI-generated.

---

# Integration Points

The Coach domain should consume from:

- `training/` — daily activity history, adaptation queue, weekly balance.
- `runner/` — current fitness, fatigue, readiness, consistency.
- `engine/` — race simulation telemetry (pace, heart rate, hydration, decisions).

The Coach domain should produce:

- Post-race feedback objects
- Post-training feedback objects
- Weekly review summaries
- Tendency updates
- Knowledge discovery events

---

# Future Compatibility

The Coach should eventually support:

- AI-powered natural language explanations
- Personalized Weekly Plans
- Injury Prevention alerts
- Race Predictions
- Mental Coaching
- Goal Setting
- Marathon Planning
- Seasonal Reviews

without architectural redesign.

---

# Acceptance Criteria

✓ Every race generates meaningful coaching feedback.
✓ Every training session generates contextual feedback.
✓ Feedback is based only on actual gameplay data.
✓ The Coach never generates generic praise.
✓ Confidence level is included in every recommendation.
✓ Weekly Review is implemented.
✓ Knowledge discoveries can be unlocked through repeated patterns.
✓ Runner tendencies accumulate silently over time.
✓ Coach memory persists across sessions.
✓ Architecture cleanly separates telemetry, rules, insights, and presentation.
✓ No React or browser dependencies inside the coach domain.

---

# Success Criteria

Players should finish every race feeling that they learned something.

The Coach should become one of the reasons players return — not because it gives rewards, but because it helps them understand themselves as runners.
