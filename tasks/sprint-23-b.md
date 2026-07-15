# Sprint 23-B: Time & Calendar Engine

**Duration**: 1.5 weeks  
**Goal**: Decouple game time from the real clock and provide a player-driven calendar (Years → Months → Weeks → Days) with a routine + fast-forward loop that compresses a full lifetime into a playable run.  
**Epic**: Long-Term Investment - Phase 2 (companion to Sprint 23: Social & Competition Layer)  
**Expected Impact**: Removes the "wait 1 real day" retention killer; makes the Social & Competition layer schedulable in-game instead of on wall-clock time.

---

## 📌 Context & Problem

The game must run on a calendar, not real time. Two problems drove this sprint:

1. **Real-time waiting is a retention killer.** Tying progression to a 24h wall-clock wait is too slow to build habit/addiction.
2. **A lifetime is huge.** With finite life (70–90) and a start age of 18–30, a lifetime spans **~13,000–24,000 days**. At one action = part of a day, that is tens of thousands of clicks — unplayable without compression.

**Core principle (locked):** *Time is a spendable resource that advances only when the player commits to an action — never by the wall clock.* Menus and being away freeze the world completely. Zero passive decay, ever.

---

## ✅ Aligned Design Decisions (locked with product owner)

| Decision | Choice |
|---|---|
| Calendar structure | Years → Months → Weeks → Days, **flat 4-week months** (Year = 12 × 4 × 7 = **336 days**) |
| Start age | Random **18–30** (productive window) |
| Lifespan / end | **Finite**, rolled **70–90** at birth → run ends at death |
| Real-clock coupling | **Pure in-game** — nothing ties to wall time |
| Day model | **Hybrid**: an intra-day `energy` meter **+** whole-day (`dayCost`) actions |
| Pacing / compression | **Routines + fast-forward** (player sets a weekly plan, fast-forwards weeks/months, intervenes at events) |
| Run end | **Summary + reroll** (roguelite loop) |

---

## 🎯 Sprint Objectives

1. Build a framework-agnostic, pure-TS time engine (calendar math + state transitions).
2. Define the starter action catalog with energy/day costs and effects.
3. Implement routines + fast-forward with event interrupts and death handling.
4. Integrate with the existing **Story system** (chapters, `ChampionshipScenario`) and **Social & Competition layer** (Sprint 23) so their beats/competitions consume in-game days instead of real time.
5. Make the engine fully unit-testable (pure functions, no UI coupling).

**Success Metrics**:
- A full lifetime can be simulated in a handful of fast-forward calls.
- No code path advances time on the real clock.
- Events correctly halt fast-forward and resume afterward.
- Engine unit tests pass (calendar rollover, age gating, death boundary).

---

## 📋 Tasks

### Task 1: Time Engine Core (calendar + state)
**Estimate**: 3 days  
**Priority**: High  
**Dependencies**: None

#### Subtasks:
1. Define `GameState` shape (saved slice): `dayIndex`, `startAge`, `lifespan`, `energy`, `energyMax`, `resources`, `stats`, `skills`, `relationships`, `routine`, `flags`.
2. Implement pure derivation: `deriveDate(s) → {age, year, month, week, dow}` from `dayIndex` (336-day year).
3. Implement `daysRemaining(s)`, `isDead(s)` (age ≥ lifespan).
4. Implement `endDay(s)` (increment `dayIndex`, reset `energy`; week/month/year are derived, no extra bookkeeping).
5. Write unit tests for calendar rollover and death boundary.

**Definition of Done**:
- ✅ Date derives correctly at year/month/week/day boundaries
- ✅ `isDead` true exactly at rolled lifespan
- ✅ `endDay` resets energy and advances calendar
- ✅ No real-clock references anywhere in the engine

---

### Task 2: Action System + Starter Catalog
**Estimate**: 3 days  
**Priority**: High  
**Dependencies**: Task 1

#### Subtasks:
1. Define `Action` type: `id`, `label`, `energyCost`, `dayCost`, `requires?` (minAge/maxAge/money/stats), `effects[]`.
2. Implement `canAfford(s, action)` (energy + resources + **age gating**) and `applyAction(s, a)` (immutably deduct energy, run effects; if `dayCost > 0`, jump calendar `N` days).
3. Author the starter catalog (`ENERGY_MAX = 100`):

| Action | energy | dayCost | requires | effects | notes |
|---|---|---|---|---|---|
| Work | 40 | 0 | age 18–64 | +money (scales w/ skill), −health tiny | breadwinner; blocked ≥65 |
| Study | 35 | 0 | age 18–30 | +intellect, unlocks better jobs | education arc |
| Train | 30 | 0 | — | +skill, −health tiny | fuels Work/Compete |
| Social | 20 | 0 | — | +relationship, +charisma | feeds social layer |
| Compete | 25 | 0/1 | event-available | chance outcome via skills; big reward/risk | ties to `ChampionshipScenario` |
| Rest | 0 | 1 | — | +health | recovery; auto-when energy low |
| Travel | 0 | 2 | — | relocate for events/comps | skips 2 meters |

4. Unit-test affordability, age gating (Work/Study blocked ≥65), and multi-day jumps.

**Definition of Done**:
- ✅ Actions apply effects immutably
- ✅ Age-gated actions reject outside productive window
- ✅ Multi-day actions skip energy meters correctly
- ✅ A day can hold e.g. `Work(40)+Train(30)+Social(20)` then Sleep

---

### Task 3: Routines + Fast-Forward Loop
**Estimate**: 3 days  
**Priority**: High  
**Dependencies**: Task 1, Task 2

#### Subtasks:
1. Define `Routine` = 7 slots (Mon..Sun), each an action id or `"Rest"`.
2. Implement `executeRoutineDay(s)` → run `routine[dow]`, then `endDay`.
3. Implement `fastForward(s, mode)` with modes `Next day` / `Next week` / `Next month` / `Until next event`; returns `{state, events[]}`.
4. Loop stops at: (a) an event day, (b) a requested week/month boundary, (c) death (`isDead`).
5. Preserve manual one-off actions: player may act any day before/instead of FF.

**Definition of Done**:
- ✅ Fast-forward runs the routine day-by-day and climbs `dayIndex`
- ✅ Stops precisely at event days and requested boundaries
- ✅ Death during FF halts and triggers run end
- ✅ Manual actions still possible between FF calls

---

### Task 4: Event Interrupts & Run End
**Estimate**: 2 days  
**Priority**: High  
**Dependencies**: Task 3

#### Subtasks:
1. Define `Event { id, dayIndex?, condition?, type: 'story'|'competition'|'random', payload }`.
2. Wire event detection into `fastForward` so an event day **halts** and surfaces the decision; after resolving, FF can resume or hand control back.
3. Implement run-end flow: on death/goal → **Summary** (career, wealth, achievements, legacy) → `New Life` rerolls `startAge` (18–30) + `lifespan` (70–90).
4. Ensure save/serialize includes only `GameState` (derived date is never stored).

**Definition of Done**:
- ✅ Events pause FF and resume cleanly
- ✅ Summary + reroll loop works end-to-end
- ✅ Serialized save is minimal and clock-free

---

### Task 5: Integration with Story & Social/Competition
**Estimate**: 2 days  
**Priority**: Medium  
**Dependencies**: Task 3, Task 4

#### Subtasks:
1. Map **Story system** chapters/`ChampionshipScenario` beats to scheduled `Event`s that consume days.
2. Expose **Social & Competition layer** actions (socialize, enter competition) as routine-action types.
3. Convert any competition cadences from real-time to in-game `dayIndex` schedules.
4. Smoke-test a full life: routine-driven weeks → story event → competition → death → reroll.

**Definition of Done**:
- ✅ Story beats appear on the in-game calendar, not wall clock
- ✅ Competitions are enterable via routine/manual action
- ✅ No real-time timers remain in social/competition flows

---

## ⚙️ Open Tuning Defaults (assumed unless changed)

- **Retirement gate**: Work / Study blocked at age ≥ 65; Social / Train / Rest remain open.
- **Study arc**: capped ~age 30 (or until a `"degree"` flag is set).
- **`ENERGY_MAX` = 100**; effect magnitudes are placeholders pending economy balance.
- **Routine slots are fixed** (not conditional, e.g. no "enter competition if available") — competitions are handled by the event system instead.

---

## 🎯 Definition of Done

- ✅ Pure-TS engine with no UI / real-clock coupling
- ✅ Full starter action catalog implemented and tested
- ✅ Routines + fast-forward compress a lifetime into a few calls
- ✅ Events interrupt and resume; death → summary → reroll
- ✅ Story + Social/Competition integrated onto the in-game calendar
- ✅ Engine unit tests green (rollover, gating, death, multi-day)
- ✅ Sprint demo: simulate a complete life in one sitting

---

**Related**: [sprint-23-social-competition.md](./sprint-23-social-competition.md) — the Social & Competition Layer this engine schedules.  
**Next Sprint**: Sprint 24 - Risk & Atmosphere (pending engine sign-off)
