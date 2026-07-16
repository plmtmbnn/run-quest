# Sprint 26: Economy & Race Scheduling System

**Duration**: 2 weeks
**Goal**: Implement comprehensive economy and race scheduling mechanics
**Priority**: Critical (fills major gameplay loop gaps)

---

## 🎯 Problem Statement

Current issues identified:
1. No race entry costs - players can race unlimited times without resource management
2. No money earning system - `money` exists in GameState but no way to earn it
3. Races available anytime - no scheduled race calendar or time-gated events
4. No race prerequisites - all races accessible if unlocked (no skill/rating gates)
5. Dual currency confusion - both `money` (timeline) and `coins` (runner profile)

---

## 📊 Current State Analysis

### Existing Systems:
- `GameState.resources.money: number` (Sprint 23 - Timeline)
- `RunnerProfile.coins: number` (existing)
- `dayIndex` from timeline engine (Sprint 23)
- Actions with `energyCost` and `dayCost` (Sprint 23)
- Championship qualification system (Sprint 24)
- Location unlock requirements (Sprint 24)

### Missing Systems:
- Race entry fees
- Money earning mechanisms
- Race scheduling (when races are available)
- Prize money distribution
- Economic balance (costs vs earnings)
- Race registration/entry system

---

## 🎯 Sprint Objectives

1. **Unify Currency System** - Consolidate to single economy
2. **Implement Money Earning** - Multiple ways to earn currency
3. **Add Race Entry Costs** - Tiered pricing by race level
4. **Create Race Scheduling** - Time-gated race availability
5. **Build Economic Balance** - Sustainable earn/spend loop
6. **Add Prize Money** - Rewards for race performance

---

## 📋 Tasks

### Task 1: Unify Currency & Design Economy (2 days)

**Key Decision**: Use `money` from timeline system, deprecate `coins`

**Files**: `economy-types.ts`, `economy-balance.ts`

### Task 2: Implement Money Earning Systems (3 days)

**Earning Sources**: Work, race prizes, sponsorships, championships, achievements, streaks

**Files**: `earning-engine.ts`, `sponsorship-types.ts`, `sponsorship-engine.ts`

### Task 3: Implement Race Entry Costs (2 days)

**Entry Validation**: Money, energy, level, rating, story, qualification

**File**: `race-entry-engine.ts`

### Task 4: Implement Race Scheduling System (3 days)

**Frequencies**: Daily, weekly, monthly, seasonal, annual, one-time

**Files**: `race-calendar-types.ts`, `race-calendar-engine.ts`, `race-schedule-database.ts`

### Task 5: Economic Balance & Testing (2 days)

**Testing**: 4 player archetypes over 90 simulated days

**File**: `economy-simulator.ts`

### Task 6: UI Integration (2 days)

**Components**: Calendar, entry modal, transaction log, sponsorship screen

**Files**: `race-calendar.tsx`, `race-entry-modal.tsx`, `transaction-log.tsx`, `sponsorship-screen.tsx`

---

## 🎮 Economic Loop Design

### Player Journey:

**Early Game (Days 1-7)**:
- Starting money: 500
- Local races: $50 entry
- Work earns: $50
- Can afford 10 races OR 5 races + 5 work sessions

**Mid Game (Days 8-30)**:
- Regional races: $150 entry
- Win prize money: $200-300
- Unlock sponsor: +$10-30 per session
- Net positive if winning 50%+ of races

**Late Game (Days 31-100)**:
- State/national races: $400-1,000 entry
- Prize money: $1,000-3,000
- High-tier sponsor: +$50-100 per session

**End Game (Days 100+)**:
- International races: $2,500+ entry
- Prize money: $10,000+
- Top sponsor + winnings = comfortable

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Can afford 1 race/day minimum | Yes (with work) |
| Winners earn more than spent | Yes (prize > entry) |
| Sponsors provide 20-30% of income | Yes (mid-late game) |
| Players run out of money | Rare (<5% of players) |
| Economic choices feel meaningful | Yes (playtest verified) |

---

**Sprint 26 Priority**: 🔥 **CRITICAL**
**Fills**: Major gameplay loop gaps
