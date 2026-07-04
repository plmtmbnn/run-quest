# Sprint 16 — Training & Recovery System

## Objective

Introduce the first long-term gameplay loop outside of race simulation.

Players should no longer wait for races.

Every day becomes meaningful through training, recovery, and preparation.

Training should never become a repetitive "click to gain XP" mechanic.

Instead, each training decision should involve trade-offs.

The player is managing an athlete, not farming experience.

---

# Design Philosophy

Training is not a reward.

Training creates stress.

Recovery converts stress into adaptation.

The player must constantly balance improvement against fatigue.

This system should introduce meaningful daily decisions.

There is no universally correct choice.

---

# Gameplay Loop

```
Daily Login
↓
Coach Recommendation
↓
Choose Today's Activity
↓
Training Simulation
↓
Immediate Effects
↓
Recovery Phase
↓
Runner Profile Updated
↓
Tomorrow
```

---

# Daily Activities

Every day, the player chooses ONE primary activity.

Suggested activities:

- Recovery Run
- Easy Run
- Tempo Run
- Interval Training
- Long Run
- Hill Repeats
- Strength Training
- Mobility Session
- Full Rest

Each activity should have different effects.

---

# Activity Effects

### Example

**Easy Run**
- Fitness: +Small
- Fatigue: +Low
- Readiness Tomorrow: +Medium

**Intervals**
- Fitness: +High
- Fatigue: +High
- Readiness Tomorrow: -Low

**Recovery Run**
- Fitness: +Very Small
- Fatigue: -Low
- Readiness Tomorrow: +High

**Rest Day**
- Fitness: No Change
- Fatigue: -Large Reduction
- Readiness Tomorrow: +Very High

---

# Training Characteristics

Training should not always improve the runner immediately.

Some activities create delayed adaptation.

### Example

```
Monday
Intervals
↓
Fatigue +20
↓
No immediate fitness gain
↓
Wednesday
Adaptation Complete
Fitness +1
```

This delayed reward should make recovery meaningful.

---

# Daily Coach Recommendation

Before choosing today's activity, display a recommendation.

### Examples

- "You are still recovering from yesterday."
- "A tempo run would be beneficial today."
- "I recommend avoiding another hard session."

The recommendation is advisory.

Players may ignore it.

---

# Weekly Training Balance

Introduce training distribution.

### Current Week

- Easy Sessions: ■■■
- Hard Sessions: ■■
- Recovery: ■■
- Strength: ■
- Long Runs: ■

The player should naturally see whether their week is balanced.

Avoid scoring the player.

Simply visualize the distribution.

---

# Overtraining

Training is beneficial until it is excessive.

### Signs of excessive training

- Fatigue remains high
- Readiness decreases
- Coach warnings increase
- Weekend race risk increases

Do NOT punish players immediately.

Overtraining should emerge naturally through poor decisions.

---

# Recovery

Recovery should be equally important.

### Recovery methods

- Rest Day
- Recovery Run
- Mobility
- Sleep (future)
- Nutrition (future)

Recovery should reduce fatigue.

Recovery should improve readiness.

Recovery should NOT instantly increase fitness.

---

# Adaptation Engine

Introduce delayed adaptation.

```
Training Stress
↓
Recovery
↓
Adaptation
↓
Fitness Increase
```

Without recovery:

```
↓
Little or no adaptation
```

This is one of the defining mechanics of RunQuest.

---

# Technical Requirements

Create a new domain:

```
training/
```

Suggested files:

- `training-engine.ts`: Core training logic.
- `training-types.ts`: TypeScript types for the Training & Recovery System.
- `training-store.ts`: State management and persistence.
- `training-effects.ts`: Effects of each activity.
- `adaptation-engine.ts`: Delayed adaptation logic.
- `coach-recommendation.ts`: Daily coach recommendations.

No React dependencies.

No UI logic inside business rules.

---

# Future Compatibility

This sprint should support:

- Sleep System
- Nutrition System
- Weekly Plans
- AI Coach
- Injury System
- Seasonal Periodization

without architectural changes.

---

# Acceptance Criteria

✓ Players choose one daily activity.
✓ Every activity has meaningful trade-offs.
✓ Fatigue changes immediately.
✓ Fitness may change after a delay.
✓ Coach provides contextual recommendations.
✓ Weekly training balance is visualized.
✓ Recovery becomes a strategic choice.
✓ No XP or level system exists.

---

# Success Criteria

Players should begin planning beyond today's race.

The objective is to create the feeling of preparing for future performance rather than simply completing today's activities.