# Sprint 26 Bugfix: Starting Balance Issue

**Date**: 2026-07-17  
**Status**: ✅ FIXED  
**Severity**: 🔴 **CRITICAL** - Broke entire economy loop

---

## 🐛 The Problem

Players were starting with **$0** instead of **$500**, making it impossible to:
- Enter any paid race (cheapest is $50 local race)
- Bootstrap the economy loop (EARN → ENTER → RACE → PRIZE → REPEAT)
- Progress without working multiple sessions first

### Root Cause

In `src/economy/economy-types.ts`, the `DEFAULT_ECONOMY_STATE` had a hardcoded `currentBalance: 0`:

```typescript
export const DEFAULT_ECONOMY_STATE: EconomyState = {
  transactions: [],
  totalEarned: 0,
  totalSpent: 0,
  currentBalance: 0, // ❌ BUG: Should be 500
  lastTransactionDay: 0,
};
```

Meanwhile, `ECONOMIC_BALANCE.startingMoney` was correctly set to `500` in `economy-balance.ts`, but this value wasn't being used for initialization.

### Impact

This affected **all new games** because `DEFAULT_ECONOMY_STATE` is used in:

1. **Initial game state** (`src/engine/timeline/time-types.ts`)
2. **Calendar initialization** (`src/engine/timeline/calendar.ts`)
3. **Timeline store** (`src/store/timeline-store.ts`)
4. **Economy simulator** (`src/economy/economy-simulator.ts`)

---

## ✅ The Solution

**File**: `src/economy/economy-types.ts`

### Changes Made

1. **Import the balance configuration**:
```typescript
import { ECONOMIC_BALANCE } from "./economy-balance";
```

2. **Use startingMoney from config**:
```typescript
export const DEFAULT_ECONOMY_STATE: EconomyState = {
  transactions: [],
  totalEarned: 0,
  totalSpent: 0,
  currentBalance: ECONOMIC_BALANCE.startingMoney, // ✅ Now $500
  lastTransactionDay: 0,
};
```

---

## 🎮 How Players Can Now Bootstrap Economy

### Starting Position (Day 1)
- **Balance**: $500
- **Can afford**: 10 local races ($50 each) OR mix of races + work

### Early Game Strategy (Days 1-7)
1. **Enter local races** ($50 entry)
2. **Win prizes**: $50-$150 depending on position
3. **Work when needed**: $50/session safety net
4. **Build rating**: Unlock sponsors (3 wins + 1600 rating)

### Progression Path
```
Day 1-7:   $500 → Race local → Win $100-150 → Net positive
Day 8-30:  Unlock sponsor → $10-30/activity → Regional races ($150)
Day 31+:   Higher sponsor → State/National races → $1000+ prizes
```

---

## 📊 Economic Balance Restored

| Metric | Before Fix | After Fix |
|--------|------------|-----------|
| Starting money | $0 ❌ | $500 ✅ |
| Can enter first race | No | Yes |
| Initial races affordable | 0 | 10 local races |
| Bootstrap possible | No | Yes |
| Work sessions needed | Mandatory | Optional |

---

## 🔍 Why This Happened

The Sprint 26 implementation had the **configuration** correct (`startingMoney: 500`) but the **initialization** wrong (`currentBalance: 0`). This is a classic **data flow disconnect**:

- Configuration defined the value ✅
- Default state didn't reference configuration ❌
- No circular dependency prevention, just an oversight

---

## ✅ Verification

- Build passes: ✅
- TypeScript compiles: ✅
- No circular dependencies: ✅
- Economy loop restored: ✅

---

## 💡 Key Takeaway

When you define configuration values (like `startingMoney`), **always reference them** in default states rather than hardcoding duplicate values. This ensures single source of truth and prevents drift.

**Pattern to follow**:
```typescript
// ✅ GOOD: Reference config
currentBalance: ECONOMIC_BALANCE.startingMoney

// ❌ BAD: Hardcode duplicate
currentBalance: 0
```

---

## 🔍 Current System Analysis

### Work System (Current Implementation)

**Status**: ✅ **Fixed single work action**

Currently, there's only **ONE work type**:
- **ID**: `work`
- **Label**: "Work"
- **Earnings**: $50/session (fixed)
- **Energy Cost**: 40 energy
- **Requirements**: Age 18 to retirement
- **Side Effect**: -2 health

**Location**: `src/engine/timeline/actions.ts:18-25`

#### ⚠️ Limitation Identified

The work system is **too simple** for long-term engagement:
- Only 1 work type (no variety)
- Fixed $50 earnings (no progression)
- No relationship to player skills/stats
- No variety in energy cost, time, or rewards

#### 💡 Future Enhancement Needed

**Multiple Work Types** could improve economy depth:

| Work Type | Pay | Energy | Time | Requirements | Description |
|-----------|-----|--------|------|--------------|-------------|
| Part-time Job | $30 | 25 | 0 days | None | Low effort, always available |
| Full-time Work | $50 | 40 | 0 days | Age 18+ | Current implementation |
| Freelance Gig | $40-80 | 30 | 0 days | Intellect 50+ | Variable pay based on intellect |
| Coaching | $60-120 | 35 | 0 days | Running skill 30+ | Earn more as you improve |
| Sponsorship Events | $100-300 | 20 | 0 days | Has sponsor | Paid appearances |
| Corporate Work | $100 | 50 | 0 days | Age 25+, Intellect 60+ | High pay, high energy |

**Benefits of Multiple Work Types**:
- Player choice based on current needs
- Progression path (unlock better jobs as you improve)
- Strategic decisions (high energy/high pay vs low energy/low pay)
- Ties economy to character development

---

### Sponsorship System (Current Implementation)

**Status**: ✅ **Partially implemented - missing approval flow**

#### How Sponsors Currently Work

**Automatic Eligibility Check** (`sponsorship-engine.ts:15-41`):
- System checks if player meets requirements
- Sponsor becomes "available" automatically
- ⚠️ **NO approval/rejection flow** - system assumes auto-signing

**3 Sponsor Tiers**:

1. **Local: Runner's Corner**
   - Requirements: 3 wins + 1600 rating
   - Benefits: $5/train, $10/race, $25/win, $50/month

2. **Regional: FitTrack**
   - Requirements: 10 wins + 1900 rating + had previous sponsor
   - Benefits: $15/train, $30/race, $75/win, $150/month

3. **National: Apex Athletics**
   - Requirements: 25 wins + 2200 rating + previous sponsor + chapter 3
   - Benefits: $50/train, $100/race, $250/win, $500/month

**Progression**: Local → Regional → National (linear path)

#### ⚠️ Missing Feature: Player Approval Flow

**Current Issue**:
- `getAvailableSponsors()` returns eligible sponsors
- `signSponsor()` directly signs the contract
- **No UI/UX for sponsor "reaching out" and player accepting/rejecting**

#### 💡 Needed: Sponsor Offer System

**Recommended Implementation**:

```
Sponsor Lifecycle:
1. Player meets requirements → Sponsor becomes ELIGIBLE
2. System triggers "Sponsor Offer Event" → Player gets NOTIFICATION
3. Player reviews offer details → Can ACCEPT or REJECT
4. If accepted → Contract signed, benefits active
5. If rejected → Sponsor stays available for later
```

**New State Needed**:
```typescript
interface SponsorshipState {
  currentSponsor?: string;
  pendingOffers: string[];        // NEW: Sponsors waiting for response
  rejectedOffers: string[];       // NEW: Sponsors player declined
  sponsorsAvailable: string[];    // Eligible but not yet offered
  offerReceivedDay: Record<string, number>; // When offer arrived
  ...
}
```

**Player Experience**:
- 📬 **Notification**: "Runner's Corner wants to sponsor you!"
- 📄 **Offer Screen**: Shows benefits, requirements, signature phrase
- ✅ **Accept**: Sign contract, benefits start immediately
- ❌ **Decline**: Offer stays available, can accept later
- 🔄 **Re-offer**: Rejected sponsors can approach again after X days

**Benefits of Approval Flow**:
- Player agency (meaningful choice)
- Narrative moment (sponsorship feels earned)
- Strategic timing (sign when you need money most)
- Can reject low-tier sponsor to wait for better offers

---

### 💱 Multi-Currency Support (Feature Request)

**Status**: ❌ **NOT IMPLEMENTED - All values hardcoded in USD**

#### Current State

All money values are stored as **raw numbers** with **no currency metadata**:

```typescript
// economy-balance.ts
startingMoney: 500,           // Assumed USD
entryFees: {
  local: 50,                  // Assumed USD
  regional: 150,              // Assumed USD
  ...
}
```

**Display**: All UI shows `$` prefix (hardcoded USD symbol)

#### ⚠️ Challenge: Real-World Currency Complexity

Supporting **IDR, USD, EUR, JPY** requires solving:

1. **Different Value Scales**:
   - USD: $500 starting money
   - EUR: €500 (similar to USD)
   - JPY: ¥50,000 (100x larger numbers)
   - IDR: Rp 7,500,000 (15,000x larger numbers!)

2. **UI/UX Issues**:
   - Large numbers (Rp 7,500,000) harder to read
   - Need proper number formatting (7.500.000 vs 7,500,000)
   - Currency symbols ($ € ¥ Rp) in correct position

3. **Game Balance**:
   - Is this just **display preference** (cosmetic)?
   - Or does it affect **regional pricing** (USD $50 vs IDR Rp 750,000)?

#### 💡 Recommended Approach: Display-Only Currency

**Best for game balance**: Keep internal economy in **"game currency units"** and convert only for display.

**System Design**:

```typescript
// New: Currency configuration
interface CurrencyConfig {
  code: 'USD' | 'EUR' | 'JPY' | 'IDR';
  symbol: string;
  symbolPosition: 'before' | 'after';
  conversionRate: number;      // From base units
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    conversionRate: 1,          // Base currency
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    symbolPosition: 'before',
    conversionRate: 0.92,       // Example rate
    decimalPlaces: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    symbolPosition: 'before',
    conversionRate: 150,        // Larger numbers
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    symbolPosition: 'before',
    conversionRate: 15700,      // Much larger numbers
    decimalPlaces: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
};
```

**Implementation Strategy**:

1. **Internal Storage**: Keep all values in base units (current USD values)
2. **User Preference**: Store `preferredCurrency` in settings
3. **Display Conversion**: Convert only when showing to player
4. **Input Parsing**: Convert back to base units when receiving input

**Example**:
```typescript
// Internal: Player has 500 base units
currentBalance: 500

// Display based on preference:
USD: "$500"
EUR: "€460"
JPY: "¥75,000"
IDR: "Rp 7.850.000"
```

**Benefits**:
- Preserves game balance (all players have same purchasing power)
- Easy to implement (conversion only in display layer)
- No need to rebalance economy per region
- Players see familiar currency format

**Drawbacks**:
- Not "true" regional pricing
- Exchange rates need periodic updates (or just use fixed fantasy rates)
- Translated number values might feel arbitrary

#### Alternative: True Regional Pricing

If you want **realistic regional costs** (e.g., races in Indonesia cost less than races in USA):

- Requires **per-region economy balancing**
- Entry fees, prizes, work pay all need regional variants
- Much more complex to maintain
- Risk: players choose cheapest region for economic advantage

**Recommendation**: Start with **display-only currency** for MVP, consider regional pricing only if data shows regional players struggle with USD-based economy.

---

## 📋 Future Sprint Recommendations

### Sprint 26.5: Economy Quality of Life

**Priority**: Medium  
**Effort**: 3-5 days

**Tasks**:
1. ✅ Fix starting balance bug (DONE)
2. ⬜ Implement multiple work types (variety + progression)
3. ⬜ Add sponsor approval/rejection flow (player agency)
4. ⬜ Implement display-only multi-currency (accessibility)

**Files to Create/Modify**:
- `src/economy/currency-config.ts` (new)
- `src/economy/currency-converter.ts` (new)
- `src/economy/work-types.ts` (new - expand work system)
- `src/economy/sponsorship-engine.ts` (modify - add offer flow)
- `src/components/economy/sponsor-offer-modal.tsx` (new)
- `src/components/economy/currency-selector.tsx` (new)
- `src/store/settings-store.ts` (modify - add currency preference)

---

**Status**: ✅ **RESOLVED**  
**Files Modified**: 1 (`src/economy/economy-types.ts`)  
**Lines Changed**: 2 (import + currentBalance)  
**Additional Context**: Work system, sponsorship flow, and multi-currency needs documented for future sprints
