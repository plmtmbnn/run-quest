# Sprint 26.5: Economy Quality of Life Enhancements

**Date**: 2026-07-17  
**Status**: 📋 PLANNED  
**Priority**: Medium  
**Effort**: 5-7 days  
**Dependencies**: Sprint 26 (Economy & Scheduling) ✅ Complete

---

## 🎯 Goals

Enhance the economy system based on Sprint 26 bugfix findings:

1. **Multiple Work Types** - Add variety and progression to income sources
2. **Sponsor Approval Flow** - Give players agency in accepting/rejecting sponsors
3. **Multi-Currency Display** - Support IDR, USD, EUR, JPY with dynamic conversion

---

## 📋 Tasks

### Task 1: Multiple Work Types System (2 days)

**Problem**: Only one work action exists ($50 fixed), no variety or progression.

**Solution**: Implement 6 work types with varying requirements, pay, and energy costs.

#### Subtasks

1.1. **Create work types configuration** (1 hour)
- File: `src/economy/work-types.ts`
- Define 6 work types with requirements, pay ranges, energy costs
- Add unlock conditions based on age, skills, relationships

1.2. **Update work earning engine** (2 hours)
- File: `src/economy/earning-engine.ts`
- Modify `earnFromWork()` to accept work type parameter
- Add dynamic pay calculation based on player stats
- Add work history tracking

1.3. **Update timeline actions** (2 hours)
- File: `src/engine/timeline/actions.ts`
- Replace single `work` action with dynamic work actions
- Add unlock logic for advanced work types
- Maintain backward compatibility

1.4. **Add work selection UI** (3 hours)
- File: `src/components/economy/work-selector-modal.tsx`
- Show available work types with pay ranges
- Display requirements and unlock conditions
- Show earnings history/statistics

#### Acceptance Criteria
- ✅ 6 work types available with different pay/energy profiles
- ✅ Work types unlock based on player progression
- ✅ Higher-skill work pays more (coaching, corporate)
- ✅ UI shows all options and explains locked work types
- ✅ Earnings vary based on player stats (intellect, running skill)

#### Files Created
```
src/economy/work-types.ts                      (new)
src/components/economy/work-selector-modal.tsx (new)
```

#### Files Modified
```
src/economy/earning-engine.ts                  (modify)
src/engine/timeline/actions.ts                 (modify)
```

---

### Task 2: Sponsor Approval Flow (2 days)

**Problem**: Sponsors auto-sign when requirements met, no player choice.

**Solution**: Add offer → review → accept/reject flow with notifications.

#### Subtasks

2.1. **Extend sponsorship state** (1 hour)
- File: `src/economy/sponsorship-types.ts`
- Add `pendingOffers: string[]`
- Add `rejectedOffers: string[]`
- Add `offerReceivedDay: Record<string, number>`
- Add `rejectionCount: Record<string, number>`

2.2. **Implement offer system** (2 hours)
- File: `src/economy/sponsorship-engine.ts`
- Add `checkForNewOffers()` - triggers when requirements met
- Add `acceptOffer()` - signs contract
- Add `rejectOffer()` - declines but keeps available
- Add `canReOffer()` - logic for rejected sponsors approaching again

2.3. **Add sponsor offer modal** (3 hours)
- File: `src/components/economy/sponsor-offer-modal.tsx`
- Show sponsor details (name, tier, benefits, signature)
- Display brand colors and visual identity
- Accept/Reject buttons with consequences explained
- "View Later" option to defer decision

2.4. **Add notification system** (2 hours)
- File: `src/components/economy/sponsor-notification.tsx`
- Toast/banner when new sponsor offer arrives
- Badge on economy/sponsor screen showing pending offers
- Integrate with existing UI patterns

#### Acceptance Criteria
- ✅ Sponsors send offers when requirements met (not auto-sign)
- ✅ Player can accept, reject, or defer offers
- ✅ Rejected sponsors can re-approach after 30 days
- ✅ Notification shows when new offer arrives
- ✅ Pending offers visible in sponsor screen

#### Files Created
```
src/components/economy/sponsor-offer-modal.tsx       (new)
src/components/economy/sponsor-notification.tsx      (new)
```

#### Files Modified
```
src/economy/sponsorship-types.ts                     (modify)
src/economy/sponsorship-engine.ts                    (modify)
src/components/economy/sponsorship-screen.tsx        (modify)
```

---

### Task 3: Multi-Currency Display System (2 days)

**Problem**: All values hardcoded in USD, not accessible to international players.

**Solution**: Display-only currency conversion with user preference.

#### Subtasks

3.1. **Create currency configuration** (1 hour)
- File: `src/economy/currency-config.ts`
- Define 4 currencies (USD, EUR, JPY, IDR)
- Set conversion rates, symbols, formatting rules
- Add decimal/thousands separator configurations

3.2. **Implement currency converter** (2 hours)
- File: `src/economy/currency-converter.ts`
- Add `convertToDisplayCurrency()` - base units → display
- Add `formatCurrency()` - apply locale formatting
- Add `parseCurrencyInput()` - display → base units
- Handle large numbers (IDR) gracefully

3.3. **Add currency preference setting** (2 hours)
- File: `src/store/settings-store.ts`
- Add `preferredCurrency: CurrencyCode` to settings
- Add `setCurrency()` action
- Persist to localStorage
- Default to USD for existing users

3.4. **Create currency selector component** (2 hours)
- File: `src/components/economy/currency-selector.tsx`
- Dropdown showing 4 currency options
- Display example conversion (e.g., "$500 = Rp 7,850,000")
- Explain that it's display-only (doesn't affect game balance)

3.5. **Apply currency formatting globally** (3 hours)
- Files: All economy components
- Replace hardcoded `$` symbols with `formatCurrency()`
- Update transaction log, sponsorship screen, race entry
- Update work selector, balance display
- Ensure consistency across entire economy UI

#### Acceptance Criteria
- ✅ Players can select USD, EUR, JPY, or IDR
- ✅ All money values display in chosen currency
- ✅ Formatting matches locale conventions (1.000.000 vs 1,000,000)
- ✅ Internal economy balance unchanged (display-only)
- ✅ Setting persists across sessions
- ✅ Existing saves default to USD

#### Files Created
```
src/economy/currency-config.ts                       (new)
src/economy/currency-converter.ts                    (new)
src/components/economy/currency-selector.tsx         (new)
```

#### Files Modified
```
src/store/settings-store.ts                          (modify)
src/components/economy/transaction-log.tsx           (modify)
src/components/economy/sponsorship-screen.tsx        (modify)
src/components/scheduling/race-entry-modal.tsx       (modify)
src/components/economy/work-selector-modal.tsx       (modify)
...all economy UI components                         (modify)
```

---

### Task 4: Integration & Testing (1 day)

**Problem**: New features need thorough testing and documentation.

**Solution**: Comprehensive testing and updated documentation.

#### Subtasks

4.1. **Unit tests** (2 hours)
- Test work type unlocking logic
- Test sponsor offer/reject/re-offer flow
- Test currency conversion accuracy
- Test currency formatting edge cases

4.2. **Integration tests** (2 hours)
- Test work → earn → balance flow
- Test sponsor offer → accept → benefits flow
- Test currency preference → UI update flow

4.3. **Manual testing** (2 hours)
- Play through early game with different work types
- Accept/reject multiple sponsor offers
- Switch currencies and verify all UI updates
- Test with existing save files

4.4. **Update documentation** (2 hours)
- Update implementation summary
- Add work types guide
- Add sponsor system guide
- Add currency selection guide
- Update Sprint 26 documentation with 26.5 addendum

#### Acceptance Criteria
- ✅ All unit tests pass
- ✅ Integration tests cover main flows
- ✅ Manual playtest confirms good UX
- ✅ Documentation updated
- ✅ No regressions in existing economy features

---

## 🎮 User Flows

### Work Selection Flow
```
Day starts → Player has energy
→ Opens action menu → Sees work options
→ Part-time ($30, 25 energy) - Always available
→ Full-time ($50, 40 energy) - Current standard
→ Coaching ($80, 35 energy) - LOCKED (Need Running 30)
→ Corporate ($100, 50 energy) - LOCKED (Need Age 25, Intellect 60)
→ Selects available work → Earns money → Energy depleted
```

### Sponsor Offer Flow
```
Win 3rd race → Reach 1600 rating
→ 🔔 "Runner's Corner wants to sponsor you!"
→ Opens notification → Sponsor offer modal appears
→ Shows: $5/train, $10/race, $25/win, $50/month
→ Options: Accept | Reject | View Later
→ Accepts → Contract signed → Benefits active immediately
→ Next training earns bonus $5
```

### Currency Selection Flow
```
Opens Settings → Economy section
→ Currency: [USD ▼]
→ Clicks dropdown → Shows 4 options
   - 🇺🇸 USD ($)
   - 🇪🇺 EUR (€)
   - 🇯🇵 JPY (¥)
   - 🇮🇩 IDR (Rp)
→ Selects IDR → Example: "$500 = Rp 7,850,000"
→ Confirms → All UI updates instantly
→ Balance shows: Rp 7,850,000
→ Race entry: Rp 785,000 (was $50)
```

---

## 📊 Economic Balance Impact

### Work Types Income Range

| Work Type | Min Pay | Max Pay | Average | Energy | Break-even vs Full-time |
|-----------|---------|---------|---------|--------|-------------------------|
| Part-time | $30 | $30 | $30 | 25 | 1.6x jobs needed |
| Full-time | $50 | $50 | $50 | 40 | Baseline |
| Freelance | $40 | $80 | $60 | 30 | 1.2x pay/energy |
| Coaching | $60 | $120 | $90 | 35 | 1.8x baseline |
| Sponsor Events | $100 | $300 | $200 | 20 | 4x baseline |
| Corporate | $100 | $100 | $100 | 50 | 2x baseline |

**Analysis**: 
- Early game: Part-time + Full-time available
- Mid game: Unlock Freelance + Coaching (better pay/energy)
- Late game: Sponsor Events (best pay/energy, requires sponsor)
- Corporate: High pay but high energy (emergency cash)

### Sponsor Rejection Impact

**Scenario**: Player rejects Runner's Corner at Day 10, waits for FitTrack

**Without Approval System**:
- Auto-signed Runner's Corner at Day 10
- Earnings Day 10-20: $50 + ($5×10 training) = $100
- Total by Day 20: Base + $100 bonus

**With Approval System (rejection)**:
- Rejected Runner's Corner at Day 10
- No sponsor bonus Day 10-20: $0
- Unlocks FitTrack at Day 20 (if requirements met)
- Earnings Day 20-30: ($15×10 training) = $150
- Net difference: -$100 (Days 10-20) + $150 (Days 20-30) = +$50

**Strategic value**: Player choice enables optimization, risk/reward tradeoff

### Currency Display Impact

**No gameplay balance impact** - pure cosmetic conversion.

Example race entry (Local $50):
- USD: $50
- EUR: €46
- JPY: ¥7,500
- IDR: Rp 785,000

All players pay same "50 base units" - just displayed differently.

---

## 🚨 Risks & Mitigations

### Risk 1: Work Type Balance
**Risk**: Some work types too efficient, others unused  
**Mitigation**: 
- Monitor player choice data
- Balance pay/energy ratios in post-launch patch
- Start conservative (can buff later)

### Risk 2: Sponsor Rejection Confusion
**Risk**: Players reject all sponsors, hurt own economy  
**Mitigation**:
- Clear UI explaining benefits
- Warning if rejecting sponsor with no higher tier unlocked
- "View Later" option reduces pressure

### Risk 3: Currency Conversion Bugs
**Risk**: Large numbers (IDR) cause display issues  
**Mitigation**:
- Extensive testing with max values
- Use proper number formatting libraries
- Cap display at reasonable max (billions)

### Risk 4: Existing Save Migration
**Risk**: Saves from Sprint 26 break with new features  
**Mitigation**:
- Default missing fields (pendingOffers = [])
- Currency defaults to USD for existing players
- Work types available immediately (no progression loss)

---

## 📦 Technical Architecture

### Module Structure

```
src/economy/
├── economy-types.ts              (existing - Sprint 26)
├── economy-balance.ts            (existing - Sprint 26)
├── earning-engine.ts             (existing - modify)
├── sponsorship-types.ts          (existing - modify)
├── sponsorship-engine.ts         (existing - modify)
├── work-types.ts                 (NEW - Task 1)
├── currency-config.ts            (NEW - Task 3)
└── currency-converter.ts         (NEW - Task 3)

src/components/economy/
├── sponsorship-screen.tsx        (existing - modify)
├── transaction-log.tsx           (existing - modify)
├── work-selector-modal.tsx       (NEW - Task 1)
├── sponsor-offer-modal.tsx       (NEW - Task 2)
├── sponsor-notification.tsx      (NEW - Task 2)
└── currency-selector.tsx         (NEW - Task 3)

src/store/
└── settings-store.ts             (existing - modify)

src/engine/timeline/
└── actions.ts                    (existing - modify)
```

### Data Flow

**Work Selection**:
```
UI (work-selector-modal) 
→ actions.ts (applyAction) 
→ earning-engine.ts (earnFromWork) 
→ GameState.economy.currentBalance updated
```

**Sponsor Offers**:
```
Game tick → sponsorship-engine (checkForNewOffers)
→ GameState.sponsorship.pendingOffers updated
→ UI shows notification
→ Player clicks → sponsor-offer-modal
→ Accept → sponsorship-engine (acceptOffer)
→ GameState.sponsorship.currentSponsor updated
```

**Currency Display**:
```
GameState.economy.currentBalance (base units)
→ settings-store.preferredCurrency (USD/EUR/JPY/IDR)
→ currency-converter.formatCurrency()
→ UI displays converted + formatted value
```

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Work type variety used | >60% players use 3+ types | Analytics |
| Sponsor acceptance rate | 70-85% accept first offer | Telemetry |
| Currency feature adoption | >20% change from USD | Settings data |
| Player satisfaction | No critical bugs, positive feedback | Support tickets |
| Economy balance maintained | Net worth progression unchanged | Simulation |

---

## 📝 Implementation Order

### Phase 1: Foundation (Day 1-2)
1. Create work-types.ts configuration
2. Create currency-config.ts + converter
3. Extend sponsorship types (pending/rejected offers)

### Phase 2: Core Logic (Day 3-4)
4. Update earning-engine for work types
5. Update sponsorship-engine for offers
6. Update actions.ts for dynamic work

### Phase 3: UI (Day 5-6)
7. Build work-selector-modal
8. Build sponsor-offer-modal + notification
9. Build currency-selector
10. Update all economy components for currency

### Phase 4: Integration (Day 7)
11. Testing (unit + integration + manual)
12. Documentation updates
13. Migration script for existing saves
14. Final verification

---

## 🔗 Related Sprints

- **Sprint 26** ✅ - Economy & Scheduling (base system)
- **Sprint 26 Bugfix** ✅ - Fixed starting balance from $0 → $500
- **Sprint 26.5** 📋 - This sprint (quality of life)
- **Sprint 27** 🔮 - TBD (possibly progression/achievements)

---

**Created**: 2026-07-17  
**Author**: AI Assistant  
**Status**: 📋 **READY FOR IMPLEMENTATION**  
**Approval Required**: Product Owner / Tech Lead

---

## 🚀 Ready to Start?

Once approved, implementation will begin with:
1. `work-types.ts` - Define 6 work options
2. `currency-config.ts` - Define 4 currency formats
3. Modify `sponsorship-types.ts` - Add offer state

Estimated completion: **7 days** from start
