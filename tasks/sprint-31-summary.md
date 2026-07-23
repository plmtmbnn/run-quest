# Sprint 31: Centralized Shop System - Summary

**Created**: 2026-07-23  
**Status**: 📋 PLANNED  
**Type**: Major Feature Addition

---

## 📚 Documentation Overview

This sprint introduces a centralized shop system that consolidates all purchasing into one location and removes the Runner Coins (RC) currency system in favor of a single money-based economy.

### Key Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **Sprint Task** | Detailed implementation plan with all tasks, subtasks, and acceptance criteria | `tasks/sprint-31-centralized-shop.md` |
| **Architecture** | Technical design, data flow, API specifications | `SHOP-SYSTEM.md` |
| **Agent Guidelines** | Updated rules for AI agents working on the codebase | `AGENTS.md` |

---

## 🎯 Quick Summary

### What's Being Built
A centralized shop screen (`/shop`) where players purchase:
- **Shoes** (8 types): $120-$280, one-time purchases
- **Nutrition** (8 types): $0-$5/unit, consumable quantities
- **Gear** (8+ types): $25-$120, one-time purchases

### Key Changes
1. **Remove Runner Coins (RC)** entirely from the game
2. **Create Shop Module** (`src/shop/`) with store, engine, catalog, types
3. **Add Shop UI** (`/shop` route) with category tabs and item cards
4. **Update Profile Screen** - Remove embedded RC shop
5. **Update Preparation Screen** - Filter items by ownership
6. **Add Inventory System** - Separate storage for owned items
7. **Migration** - Convert existing players from RC to shop system

---

## 📊 Effort Breakdown

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1**: Data Architecture & Engine | 2 days | Types, catalog, engine, store |
| **Phase 2**: Storage Integration | 0.5 days | Schemas, repository methods |
| **Phase 3**: Shop UI | 2 days | Shop screen, route, navigation |
| **Phase 4**: Integration & Cleanup | 1.5 days | Remove RC, update prep screen |
| **Phase 5**: Localization & Polish | 1 day | Translations, item descriptions |
| **Phase 6**: Testing & Migration | 1 day | Tests, migration script, QA |
| **Total** | **5-7 days** | |

---

## 🏗️ Architecture at a Glance

### Module Structure
```
src/shop/
├── shop-store.ts          # Zustand store (inventory state)
├── shop-types.ts          # TypeScript interfaces
├── shop-catalog.ts        # 24+ item database
├── shop-engine.ts         # Purchase validation & processing
└── shop-migration.ts      # RC → Shop migration

src/features/shop/
└── shop-screen.tsx        # Main shop UI

src/app/shop/
└── page.tsx               # Next.js route
```

### Data Flow
```
Money (gameState.economy.currentBalance)
    ↓
Shop Screen → Shop Engine (validate)
    ↓
Deduct Money + Add to Inventory
    ↓
Save to Storage (runquest.inventory)
    ↓
Preparation Screen (filter by ownership)
```

---

## 🔧 Integration Points

### 1. Profile Screen
**Before**: RC balance, embedded shop, RC-based upgrades  
**After**: Remove RC entirely, upgrades use Skill Points

**Files Modified**: `src/features/profile/profile-screen.tsx`

---

### 2. Preparation Screen
**Before**: All items available regardless of ownership  
**After**: Filter by `hasItem()`, show "Go to Shop" for locked items

**Files Modified**: `src/features/preparation/preparation-screen.tsx`

---

### 3. Home Screen
**Before**: No shop navigation  
**After**: Add "Shop" button that routes to `/shop`

**Files Modified**: `src/features/home/home-screen.tsx`

---

### 4. Runner Profile
**Before**: `profile.coins` field exists  
**After**: `coins` field removed from `RunnerProfile` interface

**Files Modified**: `src/runner/runner-types.ts`

---

### 5. Storage System
**Before**: No inventory storage  
**After**: Add `runquest.inventory` storage key with Zod schema

**Files Modified**: 
- `src/storage/types.ts`
- `src/storage/schemas.ts`
- `src/storage/storage-repository.ts`

---

## 💰 Economy Changes

### Currency Model

| Aspect | Before | After |
|--------|--------|-------|
| **Currencies** | Money + Runner Coins (RC) | Money only |
| **Attribute Upgrades** | Cost RC | Use Skill Points |
| **Shop Purchases** | RC for items | Money for items |
| **Money Source** | Work, races, sponsors | Work, races, sponsors |
| **Money Storage** | `gameState.economy.currentBalance` | Same |
| **Display** | Hardcoded $ | `formatCurrency()` with preferred currency |

### Starter Inventory
Every new player receives:
- **Shoes**: `daily_trainer` (free)
- **Nutrition**: `water` x5 (free)
- **Gear**: None

---

## 🎨 UI Design

### Shop Screen Layout
```
┌─────────────────────────────────────┐
│  🏪 Shop            💰 $1,250       │  ← Header
├─────────────────────────────────────┤
│  [Shoes] [Nutrition] [Gear]         │  ← Tabs
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐        │
│  │  Carbon  │  │ Trail    │        │  ← Item
│  │  Racer   │  │ Runner   │        │    Cards
│  │ $280 ✓   │  │ $160 🔒  │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

### Item States
- ✓ **Owned**: Green checkmark, disabled button
- 🔒 **Locked**: Gray + level requirement
- 💰 **Purchasable**: Price + "Buy" button
- ❌ **Insufficient Funds**: Red text, disabled

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Purchase validation (funds, level, ownership)
- [ ] Currency conversion
- [ ] Inventory updates (boolean, quantity)
- [ ] Error handling

### Integration Tests
- [ ] Shop → Purchase → Inventory → Preparation
- [ ] Race completion → Nutrition consumption
- [ ] Migration from RC system

### Manual Tests
1. **New Player**: Default inventory, first purchase
2. **Currency**: Switch currency, verify prices
3. **Purchase Flow**: Buy shoes, nutrition, gear
4. **Preparation**: Owned items appear, locked items hidden
5. **Consumption**: Use nutrition, verify decrease
6. **Migration**: Load old save, verify RC removed

---

## 📝 Files Summary

### New Files (10)
```
src/shop/shop-store.ts
src/shop/shop-types.ts
src/shop/shop-catalog.ts
src/shop/shop-engine.ts
src/shop/shop-migration.ts
src/shop/__tests__/shop-engine.test.ts
src/features/shop/shop-screen.tsx
src/app/shop/page.tsx
```

### Modified Files (9)
```
src/storage/types.ts
src/storage/schemas.ts
src/storage/storage-repository.ts
src/runner/runner-types.ts
src/features/profile/profile-screen.tsx
src/features/preparation/preparation-screen.tsx
src/features/home/home-screen.tsx
src/i18n/translations/en.ts
src/i18n/translations/id.ts
```

### Documentation (3)
```
SHOP-SYSTEM.md                         (NEW - architecture doc)
tasks/sprint-31-centralized-shop.md    (NEW - sprint task)
tasks/sprint-31-summary.md             (NEW - this file)
AGENTS.md                              (UPDATED - shop guidelines)
```

---

## 🚀 Implementation Order

### Recommended Sequence

1. **Foundation** (Phase 1-2)
   - Create types and interfaces
   - Build shop catalog with all items
   - Implement shop engine (validation, purchase)
   - Create Zustand store
   - Add storage integration

2. **UI** (Phase 3)
   - Build shop screen component
   - Add category tabs and item cards
   - Implement purchase flow
   - Add navigation button

3. **Integration** (Phase 4)
   - Remove RC from profile screen
   - Update preparation screen filtering
   - Remove RC from runner types
   - Add nutrition consumption

4. **Polish** (Phase 5-6)
   - Add translations (EN + ID)
   - Write tests
   - Create migration script
   - QA testing

---

## ✅ Success Criteria

### Technical
- [ ] Zero TypeScript errors
- [ ] All unit tests passing
- [ ] No console errors/warnings
- [ ] Lighthouse score > 90

### Functional
- [ ] All 24+ items purchasable
- [ ] Multi-currency working
- [ ] Inventory persists
- [ ] Migration successful
- [ ] Preparation filters correctly

### User Experience
- [ ] Shop accessible < 2 clicks from home
- [ ] Purchase flow < 3 clicks
- [ ] Clear feedback on all actions
- [ ] Mobile-friendly
- [ ] Dark mode supported

---

## 🔗 Related Sprints

- **Sprint 26**: Economy & Scheduling (base economy system)
- **Sprint 26.5**: Economy Enhancements (work types, currencies)
- **Sprint 29**: Bug fixes and enhancements
- **Sprint 30**: Weekly training planner

---

## 📞 Questions & Clarifications

### During Implementation, Ask:
- Should water be truly unlimited (free replenish) or one-time free starter?
- Should there be a "Sell Back" feature for unwanted items?
- Should shoes have durability and wear out over time?
- Should there be achievement unlocks for shop items?
- Should there be a shop tutorial for new players?

### Design Decisions to Confirm:
- Pricing balance (are prices fair for game economy?)
- Unlock levels (are level gates appropriate?)
- Starter inventory (is it generous enough?)
- Item stats (do bonuses feel meaningful?)

---

## 🎯 Definition of Done

Sprint 31 is complete when:
- [ ] All tasks in sprint task document completed
- [ ] All acceptance criteria met
- [ ] Code compiles without errors
- [ ] Tests passing (unit + integration)
- [ ] Manual testing complete (all 5 scenarios)
- [ ] Responsive design verified
- [ ] Dark mode verified
- [ ] Translations complete (EN + ID)
- [ ] Migration tested with real saves
- [ ] Documentation updated
- [ ] Code committed and pushed
- [ ] Ready for production deployment

---

## 📚 Additional Resources

- **Sprint Task**: `tasks/sprint-31-centralized-shop.md` (detailed implementation)
- **Architecture**: `SHOP-SYSTEM.md` (technical design)
- **Guidelines**: `AGENTS.md` (updated with shop rules)
- **Economy System**: `src/economy/` (currency, earning, work)
- **Storage System**: `src/storage/` (persistence layer)
- **Timeline Store**: `src/store/timeline-store.ts` (game state)

---

**Status**: 📋 Ready for Implementation  
**Next Step**: Begin Phase 1 (Data Architecture & Engine)  
**Estimated Completion**: 5-7 days from start
