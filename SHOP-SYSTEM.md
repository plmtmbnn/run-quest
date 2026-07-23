# Shop System Architecture

**Status**: 📋 Planned (Sprint 31)  
**Last Updated**: 2026-07-23

---

## Overview

The Shop System is a centralized purchasing hub where players acquire running gear, nutrition, and shoes using money earned from races, sponsors, and work. This system replaces the previous Runner Coins (RC) economy with a single-currency model.

---

## Core Principles

### Single Currency Economy
- **Money Only**: All purchases use money from `gameState.economy.currentBalance`
- **Multi-Currency Display**: Prices display in player's preferred currency (USD, IDR, EUR, JPY, etc.)
- **No Runner Coins**: RC system completely removed as of Sprint 31

### Centralized Purchasing
- **One Shop Location**: All items purchased from `/shop` route
- **No Embedded Shops**: Profile screen and other screens do not contain purchase UI
- **Clear Navigation**: Shop accessible from home screen with dedicated button

### Inventory Separation
- **Separate Storage**: Inventory stored in `runquest.inventory`, not in runner profile
- **Type Safety**: Zustand store with TypeScript interfaces for all inventory operations
- **Persistence**: LocalStorage via `storageRepository` with Zod schema validation

---

## Data Architecture

### Storage Structure

```typescript
// Storage Key: "runquest.inventory"
interface StoredInventory {
  version: 1;
  shoes: Record<Shoe, boolean>;         // One-time purchases
  nutrition: Record<Nutrition, number>; // Consumable quantities
  gear: Record<Gear, boolean>;          // One-time purchases
}
```

### Item Categories

#### Shoes (8 types)
- One-time boolean ownership
- Examples: `daily_trainer`, `carbon_racer`, `trail`, `stability`
- Price range: $120 - $280
- Some require minimum level (e.g., carbon_racer: Level 5)

#### Nutrition (8 types)
- Consumable items with quantity tracking
- Examples: `water`, `energy_gel`, `electrolyte`, `caffeine`
- Price range: FREE (water) - $5/unit
- Consumed after each race

#### Gear (8+ types)
- One-time boolean ownership
- Examples: `cap`, `sunglasses`, `hydration_vest`, `compression_socks`
- Price range: $25 - $120
- Provide situational bonuses (weather, terrain)

---

## Module Structure

```
src/shop/
├── shop-store.ts          # Zustand store for inventory state
├── shop-types.ts          # TypeScript interfaces and types
├── shop-catalog.ts        # Master item database (24+ items)
├── shop-engine.ts         # Purchase validation and processing
├── shop-migration.ts      # Data migration from RC system
└── __tests__/
    └── shop-engine.test.ts
```

---

## Key Components

### 1. Shop Store (`shop-store.ts`)

**Responsibilities**:
- Manage inventory state (owned items, quantities)
- Persist inventory to localStorage
- Provide query methods (hasItem, getQuantity, etc.)
- Handle purchase transactions
- Track consumption (nutrition after races)

**API**:
```typescript
interface ShopState {
  inventory: PlayerInventory;
  
  // Initialization
  initializeInventory: () => void;
  
  // Queries
  hasItem: (category: string, itemId: string) => boolean;
  getItemQuantity: (category: "nutrition", itemId: string) => number;
  getOwnedShoes: () => Shoe[];
  getOwnedGear: () => Gear[];
  getAvailableNutrition: () => Nutrition[];
  
  // Transactions
  purchaseItem: (itemId: string, category: string, quantity?: number) => Promise<PurchaseResult>;
  consumeNutrition: (nutritionId: Nutrition, amount: number) => void;
  
  // Admin
  resetInventory: () => void;
}
```

---

### 2. Shop Catalog (`shop-catalog.ts`)

**Responsibilities**:
- Define all purchasable items with metadata
- Provide localized names and descriptions
- Specify pricing, unlock levels, and stats
- Export helper functions for catalog queries

**Structure**:
```typescript
interface ShopItem {
  id: string;
  category: "shoes" | "nutrition" | "gear";
  name: { en: string; id: string };
  description: { en: string; id: string };
  price: number;                        // Base price in USD
  unlockLevel?: number;
  stats?: {
    paceBonus?: number;
    staminaBonus?: number;
    hydrationBonus?: number;
  };
}

export const SHOES_CATALOG: ShopItem[] = [...];
export const NUTRITION_CATALOG: ShopItem[] = [...];
export const GEAR_CATALOG: ShopItem[] = [...];
export const FULL_CATALOG = [...all items...];
```

---

### 3. Shop Engine (`shop-engine.ts`)

**Responsibilities**:
- Validate purchase requests
- Check funds availability (with currency conversion)
- Verify unlock requirements (level, prerequisites)
- Process transactions (deduct money, add to inventory)
- Handle errors gracefully

**Purchase Flow**:
```
1. Validate item exists in catalog
2. Check if already owned (shoes/gear only)
3. Check player level meets unlock requirement
4. Check sufficient funds (with currency conversion)
5. Deduct money from gameState.economy.currentBalance
6. Add item to inventory (boolean or increment quantity)
7. Save both gameState and inventory
8. Return success/error result
```

**API**:
```typescript
function validatePurchase(
  itemId: string,
  category: string,
  currentMoney: number,
  inventory: PlayerInventory,
  playerLevel: number
): { valid: boolean; error?: string };

function processPurchase(
  itemId: string,
  category: string,
  quantity?: number
): PurchaseResult;
```

---

## Integration Points

### 1. Preparation Screen

**Before (Sprint 30 and earlier)**:
- Shows all shoes, nutrition, and gear regardless of ownership
- Player could select items they don't own

**After (Sprint 31)**:
```typescript
import { useShopStore } from "@/shop/shop-store";

const { hasItem, getItemQuantity } = useShopStore();

// Filter by ownership
const availableShoes = ALL_SHOES.filter(shoe => 
  hasItem("shoes", shoe.id)
);

const availableNutrition = ALL_NUTRITION.filter(nut => 
  hasItem("nutrition", nut.id) && getItemQuantity("nutrition", nut.id) > 0
);

const availableGear = ALL_GEAR.filter(gear => 
  hasItem("gear", gear.id)
);
```

**UI Enhancement**:
- Show "🔒 Not Owned" badge on locked items
- Add "Go to Shop" button that navigates to `/shop`

---

### 2. Profile Screen

**Before (Sprint 30 and earlier)**:
- Embedded RC shop with nutrition and shoes (lines 136-607)
- Attribute upgrades cost RC

**After (Sprint 31)**:
- RC shop completely removed
- Attribute upgrades use Skill Points only
- Profile displays stats, achievements, preferences only

---

### 3. Race Completion

**After Race**:
```typescript
import { useShopStore } from "@/shop/shop-store";

// In completeChallenge or race completion logic:
const { consumeNutrition } = useShopStore.getState();

preparation.nutrition.forEach(nutritionId => {
  consumeNutrition(nutritionId, 1);
});
```

**Behavior**:
- Each nutrition item used in race is consumed (quantity - 1)
- If quantity reaches 0, item no longer appears in preparation screen
- Player must buy more from shop

---

### 4. Home Screen Navigation

**Add Shop Button**:
```typescript
<button
  onClick={() => router.push("/shop")}
  className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl"
>
  <ShoppingBag className="w-5 h-5 text-blue-600" />
  <span className="font-semibold">{t("nav.shop")}</span>
</button>
```

---

## UI/UX Design

### Shop Screen Layout

```
┌─────────────────────────────────────────┐
│  🏪 Shop                    💰 $1,250   │  ← Header (balance)
├─────────────────────────────────────────┤
│  [Shoes] [Nutrition] [Gear]             │  ← Category tabs
├─────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐         │
│  │ Carbon     │  │ Trail      │         │  ← Item grid
│  │ Racer      │  │ Runner     │         │
│  │            │  │            │         │
│  │ +3% Pace   │  │ Trail grip │         │  ← Stats
│  │ $280  [✓]  │  │ $160 🔒 L8 │         │  ← Price + status
│  └────────────┘  └────────────┘         │
├─────────────────────────────────────────┤
│  [← Back to Home]                       │  ← Navigation
└─────────────────────────────────────────┘
```

### Item Card States

| State | Visual | Interaction |
|-------|--------|-------------|
| **Purchasable** | Default style, price + "Buy" button | Click to purchase |
| **Owned** | Green checkmark ✓, light green border | No action (already owned) |
| **Locked** | Gray overlay, 🔒 + "Level X required" | No action (show tooltip) |
| **Insufficient Funds** | Red price text, disabled button | No action (earn more money) |

### Category Tabs

- **Shoes**: Blue color theme
- **Nutrition**: Green color theme
- **Gear**: Purple color theme

### Interactions

- **Purchase Success**: Toast notification + success sound effect
- **Purchase Failure**: Toast with error message + error sound
- **Category Switch**: Smooth fade transition (150ms)
- **Item Card Hover**: Scale 1.02, shadow increase

---

## Currency Handling

### Multi-Currency Support

```typescript
import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";

const { settings } = useSettingsStore();
const preferredCurrency = settings.preferredCurrency; // "USD", "IDR", "EUR", etc.

// Display price
<span>{formatCurrency(item.price, preferredCurrency)}</span>

// Check affordability
const canAfford = currentBalance >= item.price; // Price always stored in USD base
```

### Pricing Strategy

- **Base Currency**: All prices stored in USD in catalog
- **Display Currency**: Converted to player's preferred currency for display
- **Transaction Currency**: Deductions happen in USD, then converted for display

---

## Migration from RC System

### What Changed

| Before | After |
|--------|-------|
| Runner Coins (RC) + Money | Money only |
| Embedded shops in profile | Centralized `/shop` route |
| `profile.coins` field | Removed entirely |
| Attribute upgrades cost RC | Use Skill Points |
| Inventory in `profile.inventory` | Separate `runquest.inventory` storage |

### Migration Logic

```typescript
// Run once on app boot (Sprint 31+)
export function migrateToShopSystem() {
  // 1. Load existing data
  const runnerState = loadRunnerState();
  const profile = runnerState?.profile;
  
  // 2. Create default inventory if none exists
  let inventory = storageRepository.loadInventory();
  if (!inventory) {
    inventory = {
      version: 1,
      shoes: { daily_trainer: true },
      nutrition: { water: 5 },
      gear: {},
    };
    storageRepository.saveInventory(inventory);
  }
  
  // 3. Remove RC field from profile
  if (profile?.coins !== undefined) {
    delete profile.coins;
    saveRunnerState(runnerState);
  }
}
```

---

## Default Starting Inventory

Every new player receives:
- **Shoes**: `daily_trainer` (free, always available)
- **Nutrition**: `water` x 5 (free, always available)
- **Gear**: None (must purchase)

**Rationale**:
- Players can immediately race with basic equipment
- Water is free and unlimited (purchase more for free)
- Forces players to earn money for better equipment

---

## Pricing Reference

### Shoes
| Item | Price | Unlock Level | Pace Bonus |
|------|-------|--------------|------------|
| Daily Trainer | $120 | 1 (starter) | 0% |
| Lightweight | $180 | 1 | +1% |
| Stability | $150 | 1 | 0% |
| Trail | $160 | 3 | 0% |
| Max Cushion | $200 | 3 | 0% |
| Minimalist Trail | $140 | 5 | +1% |
| Aggressive Trail | $220 | 8 | +2% |
| Carbon Racer | $280 | 5 | +3% |

### Nutrition (per unit)
| Item | Price | Stamina Bonus |
|------|-------|---------------|
| Water | FREE | 0 |
| Energy Bar | $2 | +1 |
| Electrolyte | $2 | +1 |
| Salt Tablets | $3 | +1 |
| Energy Gel | $3 | +2 |
| Caffeine | $4 | +2 |
| Hydration Mix | $5 | +2 |
| Caffeine Gum | $2 | +1 |

### Gear
| Item | Price | Bonus |
|------|-------|-------|
| Cap | $25 | Heat protection |
| Arm Sleeves | $35 | UV protection |
| Compression Socks | $40 | Recovery |
| Trail Gaiters | $45 | Trail protection |
| Moisture Wicking Shirt | $50 | Hydration +1 |
| Sunglasses | $60 | Glare reduction |
| Hydration Vest | $80 | Hydration +2 |
| Lightweight Jacket | $120 | Cold/Rain protection |

---

## Testing Strategy

### Unit Tests
- Purchase validation (funds, level, ownership)
- Currency conversion in purchase checks
- Inventory updates (boolean ownership, quantity increments)
- Error handling (insufficient funds, locked items, already owned)

### Integration Tests
- Shop → Purchase → Inventory update → Preparation filter
- Race completion → Nutrition consumption → Inventory decrease
- Migration from RC system to shop system

### Manual Test Scenarios
1. **New Player**: Start game, verify default inventory, open shop, buy items
2. **Purchase Flow**: Buy shoe, buy nutrition (multiple times), buy gear
3. **Currency Switching**: Change preferred currency, verify prices convert
4. **Preparation Integration**: Buy items, go to preparation, verify they appear
5. **Race Consumption**: Use nutrition in race, complete race, verify quantity decreases
6. **Migration**: Load old save with RC, verify migration removes RC and creates inventory

---

## Performance Considerations

### LocalStorage Optimization
- Inventory stored separately from large gameState object
- Only load inventory when needed (shop, preparation screens)
- Use memoization for expensive catalog queries

### React Optimization
- Use Zustand selectors to prevent unnecessary re-renders
- Memoize filtered item lists in preparation screen
- Lazy load shop screen (code splitting)

---

## Future Enhancements

**Not in Sprint 31, but future possibilities**:
1. **Flash Sales**: Time-limited discounts (e.g., 20% off carbon_racer for 3 days)
2. **Item Bundles**: Package deals (e.g., "Race Day Kit" with gel + water + cap)
3. **Item Durability**: Shoes wear out after X races, need replacement
4. **Item Upgrades**: Enhance owned items (e.g., add insoles to shoes for +1% pace)
5. **Wishlist**: Mark items to buy later, get notified when affordable
6. **Gift System**: Send items to friends (multiplayer feature)
7. **Shop Reputation**: Unlock premium items based on total purchase history
8. **Seasonal Items**: Holiday-themed gear (Santa hat, Halloween glow sticks)
9. **Item Resale**: Sell back unwanted items for 50% value
10. **Equipment Sets**: Bonuses for wearing matching brand items

---

## Error Handling

### Purchase Errors

| Error | Message | User Action |
|-------|---------|-------------|
| `INSUFFICIENT_FUNDS` | "Not enough money. Earn more from races or work." | Earn money |
| `ALREADY_OWNED` | "You already own this item." | None (shouldn't happen in UI) |
| `LOCKED` | "Unlock at Level {X}. Keep racing to level up!" | Level up |
| `INVALID_ITEM` | "Item not found. Please refresh." | Refresh page |

### Graceful Degradation
- If localStorage is full, show warning and suggest clearing old data
- If catalog fails to load, show cached version or basic defaults
- If currency conversion fails, fall back to USD

---

## Accessibility

### Keyboard Navigation
- Tab through category tabs and item cards
- Enter/Space to activate purchase button
- Escape to close modals

### Screen Readers
- Aria labels on all interactive elements
- Announce purchase success/failure
- Describe item stats clearly

### Visual Accessibility
- High contrast mode support
- Focus indicators on all interactive elements
- Large touch targets (min 44px)

---

## Security Considerations

### Client-Side Validation
- Validate all purchases in shop-engine before updating state
- Check ownership, level, funds before allowing purchase
- Prevent negative quantities or invalid item IDs

### Data Integrity
- Use Zod schemas to validate inventory structure
- Atomic transactions (both money and inventory update or neither)
- Backup inventory before migrations

### No Server Validation (Yet)
- Current implementation is client-side only (single-player game)
- If multiplayer added, server-side validation required
- Consider anti-cheat measures if competitive features added

---

## References

- Sprint Task: `tasks/sprint-31-centralized-shop.md`
- Agent Guidelines: `AGENTS.md` (Shop & Inventory section)
- Related Sprints: Sprint 26.5 (Economy Enhancements), Sprint 26 (Economy & Scheduling)
- Currency System: `src/economy/currency-converter.ts`
- Timeline Store: `src/store/timeline-store.ts`
- Settings Store: `src/store/settings-store.ts`

---

**Document Status**: 📋 Planning Document (to be updated during implementation)
