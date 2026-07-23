# Sprint 31 — Centralized Shop System

**Date**: 2026-07-23  
**Status**: ✅ COMPLETE  
**Priority**: High  
**Effort**: 5-7 days  
**Dependencies**: Sprint 26.5 (Economy Enhancements) ✅ Complete

---

## 🎯 Goals

Create a centralized shop system that consolidates all purchasing into one place, uses only money (removing Runner Coins), and provides a better player experience for acquiring gear, nutrition, and shoes.

**Key Objectives:**
1. **Remove Runner Coins (RC)** - Eliminate RC currency entirely, use money only
2. **Centralized Shop** - New dedicated shop screen with all purchasable items
3. **Master Item Catalog** - Define all shoes, nutrition, and gear with pricing
4. **Inventory System** - Track owned items separately from runner profile
5. **Preparation Integration** - Filter available items in preparation screen based on ownership

---

## 📋 Problem Statement

**Current Issues:**
- Runner Coins (RC) exist alongside money, creating currency confusion
- Shop functionality is embedded in profile screen (lines 136-607 in `profile-screen.tsx`)
- Attribute upgrades use RC instead of skill points
- Preparation screen shows all items regardless of ownership
- No centralized place to browse and purchase equipment
- Inconsistent with the game's primary economy (money from work/sponsors/races)

**Proposed Solution:**
- Single shop screen accessible from main navigation
- Use money only (with multi-currency support via `formatCurrency`)
- Master catalog with 24+ items (8 shoes, 8 nutrition, 8+ gear)
- Inventory persistence in separate storage
- Preparation screen respects owned items

---

## 🏗️ Architecture Overview

### New Directory Structure
```
src/
├── shop/
│   ├── shop-store.ts              # Zustand store for inventory
│   ├── shop-types.ts              # Type definitions
│   ├── shop-catalog.ts            # Master item database
│   └── shop-engine.ts             # Purchase logic
├── features/shop/
│   └── shop-screen.tsx            # Main shop UI
└── app/shop/
    └── page.tsx                   # Next.js route
```

### Data Flow
```
Player Money (gameState.economy.currentBalance)
    ↓
Shop Screen → Purchase Item → Shop Engine (validate/deduct)
    ↓
Update Inventory (shop-store) + Save to Storage
    ↓
Preparation Screen → Filter by Owned Items → Show Available
```

---

## 📋 Tasks

### Phase 1: Data Architecture & Engine (2 days)

#### Task 1.1: Create Shop Type Definitions
**File**: `src/shop/shop-types.ts` (NEW)

**Types to Define**:
```typescript
export interface ShopItem {
  id: string;                           // "carbon_racer"
  category: "shoes" | "nutrition" | "gear";
  name: LocalizedText;
  description: LocalizedText;
  price: number;                        // Base price in USD
  unlockLevel?: number;                 // Min level required
  image?: string;
  stats?: {
    paceBonus?: number;
    staminaBonus?: number;
    hydrationBonus?: number;
    willpowerBonus?: number;
  };
}

export interface PlayerInventory {
  shoes: Record<Shoe, boolean>;         // One-time purchase
  nutrition: Record<Nutrition, number>; // Consumable quantity
  gear: Record<Gear, boolean>;          // One-time purchase
}

export interface PurchaseResult {
  success: boolean;
  error?: "INSUFFICIENT_FUNDS" | "ALREADY_OWNED" | "LOCKED" | "INVALID_ITEM";
  newBalance?: number;
  newQuantity?: number;
}
```

**Acceptance Criteria**:
- [x] All interfaces properly typed
- [x] Export all types for use in other modules
- [x] Add JSDoc comments
- [x] No TypeScript errors

---

#### Task 1.2: Create Shop Item Catalog
**File**: `src/shop/shop-catalog.ts` (NEW)

**Master Data to Define**:
- **8 Shoe Types**: daily_trainer ($120), carbon_racer ($280), lightweight ($180), trail ($160), stability ($150), max_cushion ($200), aggressive_trail ($220), minimalist_trail ($140)
- **8 Nutrition Types**: water (FREE), electrolyte ($2/unit), energy_gel ($3/unit), caffeine ($4/unit), energy_bar ($2/unit), hydration_mix ($5/unit), salt_tablets ($3/unit), caffeine_gum ($2/unit)
- **8 Gear Types**: cap ($25), sunglasses ($60), arm_sleeves ($35), hydration_vest ($80), lightweight_jacket ($120), compression_socks ($40), trail_gaiters ($45), moisture_wicking_shirt ($50)

**Implementation**:
```typescript
export const SHOES_CATALOG: ShopItem[] = [
  {
    id: "daily_trainer",
    category: "shoes",
    name: { en: "Daily Trainer", id: "Sepatu Latihan" },
    description: { en: "Versatile all-around training shoe", id: "..." },
    price: 120,
    stats: { paceBonus: 0 }
  },
  // ... all 8 shoes
];

export const NUTRITION_CATALOG: ShopItem[] = [...];
export const GEAR_CATALOG: ShopItem[] = [...];

export const FULL_CATALOG = [
  ...SHOES_CATALOG,
  ...NUTRITION_CATALOG,
  ...GEAR_CATALOG,
];

export function getItemById(id: string): ShopItem | undefined;
export function getItemsByCategory(category: string): ShopItem[];
```

**Acceptance Criteria**:
- [x] All 24+ items defined with localized names/descriptions
- [x] Pricing balanced (shoes: $120-280, nutrition: $2-5/unit, gear: $25-120)
- [x] Stats properly assigned (pace, stamina, hydration bonuses)
- [x] Unlock levels assigned to advanced items (carbon_racer: level 5, aggressive_trail: level 8)
- [x] Helper functions for catalog queries

---

#### Task 1.3: Create Shop Purchase Engine
**File**: `src/shop/shop-engine.ts` (NEW)

**Functions to Implement**:
```typescript
export function validatePurchase(
  itemId: string,
  category: string,
  currentMoney: number,
  inventory: PlayerInventory,
  playerLevel: number
): { valid: boolean; error?: string };

export function processPurchase(
  itemId: string,
  category: string,
  quantity?: number  // For nutrition
): PurchaseResult;

export function canAffordItem(
  price: number,
  currentBalance: number,
  preferredCurrency: CurrencyCode
): boolean;
```

**Purchase Flow**:
1. Validate item exists in catalog
2. Check if already owned (shoes/gear) or can add quantity (nutrition)
3. Check unlock level requirement
4. Check sufficient funds (with currency conversion)
5. Deduct money from `gameState.economy.currentBalance`
6. Add item to inventory
7. Save both gameState and inventory
8. Return success result

**Acceptance Criteria**:
- [x] Validation prevents invalid purchases
- [x] Money deduction works with multi-currency
- [x] Inventory updates correctly
- [x] Nutrition quantity increments properly
- [x] Error messages are clear and actionable
- [x] Transaction is atomic (both money and inventory update or neither)

---

#### Task 1.4: Create Shop Zustand Store
**File**: `src/shop/shop-store.ts` (NEW)

**Store Interface**:
```typescript
interface ShopState {
  inventory: PlayerInventory;
  
  // Initialize from storage on app boot
  initializeInventory: () => void;
  
  // Query methods
  hasItem: (category: string, itemId: string) => boolean;
  getItemQuantity: (category: "nutrition", itemId: string) => number;
  getOwnedShoes: () => Shoe[];
  getOwnedGear: () => Gear[];
  getAvailableNutrition: () => Nutrition[];
  
  // Transaction methods
  purchaseItem: (itemId: string, category: string, quantity?: number) => Promise<PurchaseResult>;
  consumeNutrition: (nutritionId: Nutrition, amount: number) => void;
  
  // Admin
  resetInventory: () => void;
}
```

**Default Starting Inventory**:
```typescript
const DEFAULT_INVENTORY: PlayerInventory = {
  shoes: { daily_trainer: true },  // Free starter shoe
  nutrition: { water: 5 },         // 5 free water
  gear: {},                        // No gear
};
```

**Acceptance Criteria**:
- [x] Store persists to localStorage via `storageRepository`
- [x] Initialization loads saved inventory or creates default
- [x] All query methods work correctly
- [x] Purchase methods integrate with shop-engine
- [x] Consumption reduces nutrition quantity
- [x] Store updates trigger React re-renders

---

### Phase 2: Storage Integration (0.5 days)

#### Task 2.1: Add Inventory Storage Schema
**File**: `src/storage/schemas.ts`

**Add Schema**:
```typescript
export const StoredInventorySchema = z.object({
  version: z.literal(1),
  shoes: z.record(z.boolean()),
  nutrition: z.record(z.number()),
  gear: z.record(z.boolean()),
});
```

**File**: `src/storage/types.ts`

**Add Type**:
```typescript
export type StoredInventory = z.infer<typeof StoredInventorySchema>;

export type StorageKey =
  | "runquest.version"
  | "runquest.player"
  | "runquest.settings"
  | "runquest.history"
  | "runquest.daily"
  | "runquest.board"
  | "runquest.cache"
  | "runquest.timeline"
  | "runquest.inventory";  // NEW
```

**File**: `src/storage/storage-repository.ts`

**Add Methods**:
```typescript
export const storageRepository = {
  // ... existing methods
  
  loadInventory(): StoredInventory | null {
    return load("runquest.inventory", StoredInventorySchema);
  },
  
  saveInventory(inventory: StoredInventory): void {
    save("runquest.inventory", inventory, StoredInventorySchema);
  },
};
```

**Acceptance Criteria**:
- [x] Schema validates inventory structure
- [x] Storage key added to type union
- [x] Load/save methods work correctly
- [x] Zod validation catches invalid data

---

### Phase 3: Shop UI (2 days)

#### Task 3.1: Create Shop Screen Component
**File**: `src/features/shop/shop-screen.tsx` (NEW)

**UI Layout**:
```
┌─────────────────────────────────────────┐
│  🏪 Shop                    💰 $1,250   │  ← Header
├─────────────────────────────────────────┤
│  [Shoes] [Nutrition] [Gear]             │  ← Category tabs
├─────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐         │
│  │ Carbon     │  │ Trail      │         │
│  │ Racer      │  │ Trail runner│        │  ← Item cards
│  │            │  │            │         │
│  │ +3% Pace   │  │ Trail grip │         │  ← Stats
│  │ $280  [✓]  │  │ $160 🔒 L8 │         │  ← Price/status
│  └────────────┘  └────────────┘         │
├─────────────────────────────────────────┤
│  [← Back to Home]                       │  ← Navigation
└─────────────────────────────────────────┘
```

**Component Structure**:
```typescript
export function ShopScreen() {
  const [activeCategory, setActiveCategory] = useState<"shoes" | "nutrition" | "gear">("shoes");
  const { inventory, purchaseItem, hasItem } = useShopStore();
  const { gameState } = useTimelineStore();
  const { settings } = useSettingsStore();
  const { runnerState } = useRunnerStore();
  
  const currentBalance = gameState?.economy.currentBalance ?? 0;
  const playerLevel = runnerState?.profile.level ?? 1;
  const preferredCurrency = settings.preferredCurrency;
  
  // Filter items by category
  const items = getItemsByCategory(activeCategory);
  
  // Render item cards with purchase buttons
}
```

**Item Card States**:
- **Owned**: ✓ checkmark, disabled button, green border
- **Locked**: 🔒 icon + "Unlock at Level X", grayed out
- **Purchasable**: Price + "Buy" button, default style
- **Insufficient Funds**: Price in red, disabled button

**Acceptance Criteria**:
- [x] Category tabs switch item display
- [x] Balance displays in preferred currency
- [x] Item cards show name, description, stats, price
- [x] Purchase button triggers shop engine
- [x] Success/error feedback (toast notifications)
- [x] Responsive mobile-first design
- [x] Dark mode support
- [x] Smooth animations (Framer Motion)
- [x] Sound effects on purchase (use `useSound` hook)

---

#### Task 3.2: Create Shop Page Route
**File**: `src/app/shop/page.tsx` (NEW)

**Implementation**:
```typescript
import { ShopScreen } from "@/features/shop/shop-screen";

export default function ShopPage() {
  return <ShopScreen />;
}
```

**Metadata**:
```typescript
export const metadata = {
  title: "Shop | Run Quest",
  description: "Purchase running gear, nutrition, and shoes",
};
```

**Acceptance Criteria**:
- [x] Route accessible at `/shop`
- [x] Page loads without errors
- [x] Metadata set correctly

---

#### Task 3.3: Add Shop Navigation Button
**File**: `src/features/home/home-screen.tsx`

**Add Button to Main Menu** (around line 500-600 where other navigation exists):
```typescript
<button
  onClick={() => router.push("/shop")}
  className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
>
  <ShoppingBag className="w-5 h-5 text-blue-600" />
  <span className="font-semibold">{t("nav.shop")}</span>
</button>
```

**Acceptance Criteria**:
- [x] Shop button appears in home screen navigation
- [x] Button navigates to `/shop` route
- [x] Icon and text properly styled
- [x] Accessible and keyboard-navigable

---

### Phase 4: Integration & Cleanup (1.5 days)

#### Task 4.1: Remove RC Shop from Profile Screen
**File**: `src/features/profile/profile-screen.tsx`

**Remove the Following**:
- Lines 136-150: Speed upgrade RC purchase logic
- Lines 170-174: Stamina upgrade RC purchase logic  
- Lines 245-248: RC balance display
- Lines 462-607: Entire shop sections (nutrition/shoes cards)

**Keep Attribute Upgrade Cards, but Change**:
```typescript
// OLD: Check RC balance
const canUpgrade = skillPoints > 0 && speedAttr < 100;

// Update button text from "Upgrade (50 RC)" to "Upgrade (1 SP)"
```

**Acceptance Criteria**:

---

#### Task 4.2: Remove RC from Runner Profile
**File**: `src/runner/runner-types.ts`

**Remove**:
```typescript
// Delete this line:
coins: number;
```

**File**: `src/runner/runner-persistence.ts` or migration logic

**Add Migration**:
```typescript
// On load, if old profile has coins field, remove it
if (profile.coins !== undefined) {
  delete profile.coins;
  saveRunnerState(runnerState);
}
```

**Acceptance Criteria**:
- [x] `coins` field removed from RunnerProfile interface
- [x] Migration cleans up existing saves
- [x] No TypeScript errors from missing coins references

---

#### Task 4.3: Integrate Shop with Preparation Screen (Enhanced UX)
**File**: `src/features/preparation/preparation-screen.tsx`

**Add Shop Store**:
```typescript
import { useShopStore } from "@/shop/shop-store";

const { hasItem, getOwnedShoes, getAvailableNutrition, getOwnedGear } = useShopStore();
```

**Filter Available Items**:
```typescript
// Filter shoes by ownership
const availableShoes = ALL_SHOES.filter(shoe => 
  hasItem("shoes", shoe.id)
);

// Filter nutrition by ownership and quantity
const availableNutrition = ALL_NUTRITION.filter(nut => 
  hasItem("nutrition", nut.id) && getItemQuantity("nutrition", nut.id) > 0
);

// Filter gear by ownership
const availableGear = ALL_GEAR.filter(gear => 
  hasItem("gear", gear.id)
);
```

**UI Strategy - Show Only Owned Items**:
```typescript
// Only display owned items in selection lists
// Add "Get More Items" button at the bottom of each section
<div className="mt-4">
  <button 
    onClick={() => router.push("/shop")}
    className="w-full py-3 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30"
  >
    <ShoppingBag className="w-4 h-4" />
    Get More {category === "shoes" ? "Shoes" : category === "nutrition" ? "Nutrition" : "Gear"}
  </button>
</div>
```

**Alternative - Show Locked Items with Info**:
```typescript
// If showing all items (locked + owned), add info badges
{!hasItem("shoes", shoeId) ? (
  <div className="absolute inset-0 bg-gray-900/60 dark:bg-gray-900/80 rounded-xl flex flex-col items-center justify-center">
    <Lock className="w-6 h-6 text-gray-300 mb-2" />
    <span className="text-xs text-gray-200 font-semibold">Not Owned</span>
    <button 
      onClick={() => router.push("/shop")}
      className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg"
    >
      Go to Shop
    </button>
  </div>
) : null}
```

**Acceptance Criteria**:
- [x] **PREFERRED**: Only owned items appear in selection lists (cleaner UX)
- [x] "Get More Items" button appears at bottom of each section (Shoes, Nutrition, Gear)
- [x] Button navigates to `/shop` with appropriate tab pre-selected (optional enhancement)
- [x] If locked items shown, they have clear "Not Owned" badge with reason
- [x] "Go to Shop" button functional and styled consistently
- [x] Default items (daily_trainer, water) always available
- [x] No visual glitches or layout issues
- [x] Mobile-friendly touch targets

---

#### Task 4.4: Change Nutrition Selection from Radio to Checkbox
**File**: `src/features/preparation/preparation-screen.tsx`

**Problem**: Current implementation uses radio buttons, allowing only one nutrition item. Players should be able to bring multiple nutrition items to a race.

**Solution**: Replace radio button pattern with checkbox pattern.

**Implementation**:
```typescript
// Current (radio - single selection):
const [nutrition, setNutrition] = useState<Nutrition>("water");

// New (checkbox - multiple selection):
const [selectedNutrition, setSelectedNutrition] = useState<Nutrition[]>(["water"]);

// Toggle function
const toggleNutrition = (nutritionId: Nutrition) => {
  setSelectedNutrition(prev => 
    prev.includes(nutritionId)
      ? prev.filter(id => id !== nutritionId)
      : [...prev, nutritionId]
  );
};
```

**UI Changes**:
```typescript
// Checkbox instead of radio button
<input 
  type="checkbox" 
  checked={selectedNutrition.includes(nutritionId)}
  onChange={() => toggleNutrition(nutritionId)}
/>

// Visual indicator (checkmark instead of radio dot)
{selectedNutrition.includes(nutritionId) && (
  <Check className="w-4 h-4 text-green-600" />
)}
```

**Acceptance Criteria**:
- [x] Nutrition selection uses checkboxes instead of radio buttons
- [x] Multiple nutrition items can be selected simultaneously
- [x] Visual feedback shows all selected items (checkmarks)
- [x] Selected nutrition items stored as array in preparation state
- [x] Minimum 1 nutrition required (water is default)
- [x] UI clearly indicates multiple selection is allowed
- [x] State syncs correctly with `usePreparationStore()`

---

#### Task 4.5: Add Quantity Selector for Nutrition Items
**File**: `src/features/preparation/preparation-screen.tsx`

**Problem**: Players can select nutrition items but cannot specify how many of each to bring (e.g., 2 energy gels, 3 water bottles).

**Solution**: Add quantity selector (1-4) for each selected nutrition item.

**Data Structure**:
```typescript
// Current:
nutrition: Nutrition[]  // ["water", "energy_gel"]

// New:
nutrition: Array<{ id: Nutrition; quantity: number }>
// [{ id: "water", quantity: 2 }, { id: "energy_gel", quantity: 3 }]

// Or use Record:
nutritionQuantities: Record<Nutrition, number>
// { water: 2, energy_gel: 3 }
```

**UI Implementation**:
```typescript
// Show quantity selector only for checked items
{selectedNutrition.includes(nutritionId) && (
  <div className="mt-2 flex items-center gap-2">
    <span className="text-xs text-gray-600 dark:text-gray-400">Quantity:</span>
    <div className="flex items-center gap-1">
      <button 
        onClick={() => decreaseQuantity(nutritionId)}
        disabled={getQuantity(nutritionId) <= 1}
        className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-8 text-center font-mono font-semibold">
        {getQuantity(nutritionId)}
      </span>
      <button 
        onClick={() => increaseQuantity(nutritionId)}
        disabled={getQuantity(nutritionId) >= 4 || getQuantity(nutritionId) >= getItemQuantity("nutrition", nutritionId)}
        className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
    <span className="text-xs text-gray-500">
      (Available: {getItemQuantity("nutrition", nutritionId)})
    </span>
  </div>
)}
```

**Validation**:
```typescript
// Cannot bring more than owned
const maxQuantity = Math.min(4, getItemQuantity("nutrition", nutritionId));

// Warn if insufficient inventory
if (selectedQuantity > availableQuantity) {
  toast.warning("Not enough in inventory. Go to shop to buy more.");
}
```

**Acceptance Criteria**:
- [x] Quantity selector appears below each selected nutrition item
- [x] Default quantity is 1 when item is first selected
- [x] Min quantity is 1, max quantity is 4 per item
- [x] Cannot exceed available inventory quantity
- [x] Plus/minus buttons are disabled at min/max limits
- [x] Shows available quantity from inventory (e.g., "Available: 5")
- [x] Visual feedback for increment/decrement actions
- [x] Quantity data persists in preparation state
- [x] Mobile-friendly touch targets (buttons ≥ 44px)
- [x] Keyboard accessible (arrow keys to adjust)

---

#### Task 4.6: Update Preparation Store for Multi-Nutrition
**File**: `src/store/preparation-store.ts`

**Update Store Type**:
```typescript
// Old:
nutrition: Nutrition[];

// New:
nutrition: Array<{ id: Nutrition; quantity: number }>;
```

**Update Store Methods**:
```typescript
setNutrition: (nutrition: Array<{ id: Nutrition; quantity: number }>) => void;

addNutrition: (nutritionId: Nutrition, quantity?: number) => void;

removeNutrition: (nutritionId: Nutrition) => void;

updateNutritionQuantity: (nutritionId: Nutrition, quantity: number) => void;
```

**Acceptance Criteria**:
- [x] Preparation store supports nutrition with quantities
- [x] Store methods handle add/remove/update operations
- [x] State persists correctly
- [x] Backward compatible (migration for old saves)
- [x] No TypeScript errors

---

#### Task 4.7: Update Nutrition Consumption Logic
**File**: `src/store/player-store.ts` or race completion logic

**After Race Completion**:
```typescript
import { useShopStore } from "@/shop/shop-store";

// In completeChallenge method:
const { consumeNutrition } = useShopStore.getState();

// Consume nutrition used in preparation (with quantities)
preparation.nutrition.forEach(({ id, quantity }) => {
  consumeNutrition(id, quantity);
});
```

**Acceptance Criteria**:
- [x] Nutrition quantity decreases by correct amount after race
- [x] Multiple nutrition items all get consumed with their quantities
- [x] Quantity cannot go below 0
- [x] UI updates immediately after race
- [x] If insufficient inventory, show warning before race starts

---

### Phase 5: Localization & Polish (1 day)

#### Task 5.1: Add Shop Translations
**Files**: `src/i18n/translations/en.ts` and `src/i18n/translations/id.ts`

**Add Keys**:
```typescript
{
  "shop": {
    "title": { en: "Shop", id: "Toko" },
    "balance": { en: "Balance", id: "Saldo" },
    "buy": { en: "Buy", id: "Beli" },
    "buy_for": { en: "Buy for {price}", id: "Beli {price}" },
    "owned": { en: "Owned", id: "Dimiliki" },
    "locked": { en: "Unlock at Level {level}", id: "Buka di Level {level}" },
    "insufficient_funds": { en: "Not enough money", id: "Uang tidak cukup" },
    "purchase_success": { en: "Purchase successful!", id: "Pembelian berhasil!" },
    "purchase_failed": { en: "Purchase failed", id: "Pembelian gagal" },
    "quantity": { en: "Quantity: {count}", id: "Jumlah: {count}" },
    
    "category": {
      "shoes": { en: "Shoes", id: "Sepatu" },
      "nutrition": { en: "Nutrition", id: "Nutrisi" },
      "gear": { en: "Gear", id: "Perlengkapan" }
    },
    
    "stats": {
      "pace_bonus": { en: "+{value}% Pace", id: "+{value}% Kecepatan" },
      "stamina_bonus": { en: "+{value}% Stamina", id: "+{value}% Stamina" },
      "hydration_bonus": { en: "+{value}% Hydration", id: "+{value}% Hidrasi" }
    }
  },
  
  "nav": {
    "shop": { en: "Shop", id: "Toko" }
  }
}
```

**Acceptance Criteria**:
- [x] All UI text has both EN and ID translations
- [x] Dynamic values (price, level, count) interpolate correctly
- [x] Translations match game's tone and style

---

#### Task 5.2: Add Item Names and Descriptions
**File**: `src/shop/shop-catalog.ts`

**Localize All Items**:
- Translate all 24+ item names and descriptions
- Keep EN and ID consistent with existing game terminology
- Use running-specific terminology accurately

**Example**:
```typescript
{
  id: "carbon_racer",
  name: { 
    en: "Carbon Racer", 
    id: "Sepatu Carbon" 
  },
  description: { 
    en: "Lightweight racing shoe with carbon plate for maximum speed",
    id: "Sepatu balap ringan dengan pelat karbon untuk kecepatan maksimal"
  }
}
```

**Acceptance Criteria**:
- [x] All items have localized names
- [x] All items have localized descriptions
- [x] Descriptions are clear and informative
- [x] Terminology consistent with rest of game

---

### Phase 6: Testing & Migration (1 day)

#### Task 6.1: Write Unit Tests
**File**: `src/shop/__tests__/shop-engine.test.ts` (NEW)

**Test Cases**:
- Purchase validation (funds, level, already owned)
- Purchase processing (money deduction, inventory update)
- Currency conversion in purchase checks
- Nutrition quantity increments
- Error handling

**Acceptance Criteria**:
- [x] All critical paths covered
- [x] Edge cases tested (zero balance, max quantity, etc.)
- [x] Tests pass consistently

---

#### Task 6.2: Create Data Migration
**File**: `src/shop/shop-migration.ts` (NEW)

**Migration Logic**:
```typescript
export function migrateToShopSystem() {
  // 1. Load runner state
  const runnerState = loadRunnerState();
  const profile = runnerState?.profile;
  
  if (!profile) return;
  
  // 2. Convert old inventory if exists
  let inventory = storageRepository.loadInventory();
  
  if (!inventory) {
    inventory = {
      version: 1,
      shoes: { daily_trainer: true },
      nutrition: { water: 5 },
      gear: {},
    };
    
    // Give bonus items based on old RC balance
    if (profile.coins && profile.coins > 100) {
      inventory.shoes.carbon_racer = true;
      inventory.nutrition.energy_gel = 3;
    }
    
    storageRepository.saveInventory(inventory);
  }
  
  // 3. Remove coins from profile
  if (profile.coins !== undefined) {
    delete profile.coins;
    saveRunnerState(runnerState);
  }
  
  console.log("✅ Shop system migration complete");
}
```

**Call Migration**:
In `src/app/layout.tsx` or app initialization:
```typescript
useEffect(() => {
  migrateToShopSystem();
}, []);
```

**Acceptance Criteria**:
- [x] Existing players get default inventory
- [x] Old inventory preserved if valuable
- [x] RC removed without breaking saves
- [x] Migration runs only once (idempotent)

---

#### Task 6.3: End-to-End Testing
**Manual Test Scenarios**:

1. **New Player Flow**:
   - Start new game
   - Verify default inventory (daily_trainer, water x5)
   - Open shop, try to buy locked item (should fail)
   - Earn money, buy a shoe (should succeed)
   - Go to preparation, verify new shoe appears

2. **Existing Player Flow**:
   - Load existing save with RC
   - Verify migration removes RC
   - Verify inventory initialized
   - Verify profile screen no longer shows RC shop

3. **Currency Testing**:
   - Change preferred currency (USD → IDR → EUR)
   - Verify shop prices convert correctly
   - Verify purchase works with all currencies

4. **Purchase Flow**:
   - Buy shoe (one-time purchase, should show owned)
   - Buy nutrition multiple times (quantity increases)
   - Try to buy with insufficient funds (should fail)
   - Complete race, verify nutrition consumed

5. **Integration Testing**:
   - Buy items in shop
   - Navigate to preparation
   - Verify only owned items appear
   - Select items and complete race
   - Verify consumables decrease

**Acceptance Criteria**:
- [x] All test scenarios pass
- [x] No console errors or warnings
- [x] Responsive on mobile and desktop
- [x] Dark mode works correctly
- [x] Animations smooth
- [x] Sound effects play

---

## 🎨 UI/UX Specifications

### Color Scheme
- **Category Tabs**: Blue (shoes), Green (nutrition), Purple (gear)
- **Owned Items**: Green checkmark, light green border
- **Locked Items**: Gray overlay, lock icon
- **Insufficient Funds**: Red text, disabled state

### Typography
- **Item Names**: `font-heading font-extrabold text-base`
- **Descriptions**: `text-xs text-gray-600 dark:text-gray-400`
- **Prices**: `font-mono font-bold text-lg`
- **Stats**: `text-xs font-semibold text-blue-600`

### Interactions
- **Purchase Success**: Toast notification + success sound
- **Purchase Failure**: Toast with error message + error sound
- **Category Switch**: Smooth fade transition (150ms)
- **Item Card Hover**: Scale 1.02, shadow increase

---

## 📊 Success Metrics

**Technical Metrics**:
- ✅ 0 TypeScript errors
- ✅ All tests passing
- ✅ No console errors or warnings
- ✅ Lighthouse score > 90

**Functionality Metrics**:
- ✅ All 24+ items purchasable
- ✅ Currency conversion works for all 4+ currencies
- ✅ Inventory persists across sessions
- ✅ Migration successful for existing players
- ✅ Preparation screen only shows owned items

**User Experience Metrics**:
- ✅ Shop accessible in < 2 clicks from home
- ✅ Purchase flow < 3 clicks (navigate → select → buy)
- ✅ Clear feedback on every action
- ✅ Mobile-friendly (touch targets > 44px)
- ✅ Dark mode fully supported

---

## 📝 Files Summary

### Files to Create (10 new files)
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

### Files to Modify (8 files)
```
src/storage/types.ts                       (add inventory key)
src/storage/schemas.ts                     (add inventory schema)
src/storage/storage-repository.ts          (add load/save methods)
src/runner/runner-types.ts                 (remove coins field)
src/features/profile/profile-screen.tsx    (remove RC shop)
src/features/preparation/preparation-screen.tsx (filter by inventory)
src/features/home/home-screen.tsx          (add shop nav button)
src/i18n/translations/en.ts                (add shop translations)
src/i18n/translations/id.ts                (add shop translations)
```

### Files to Delete
```
None - this is additive, only removing code sections
```

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tasks completed and tested
- [ ] Code reviewed (self-review minimum)
- [ ] TypeScript compiles without errors
- [ ] All unit tests passing
- [ ] Manual testing complete (all 5 scenarios)
- [ ] Translations complete (EN + ID)
- [ ] Migration tested with real save data

### Deployment
- [ ] Commit changes with descriptive message
- [ ] Push to repository
- [ ] Deploy to staging environment
- [ ] Smoke test in staging
- [ ] Deploy to production

### Post-deployment
- [ ] Monitor error logs for 24 hours
- [ ] Verify migration success rate
- [ ] Gather user feedback
- [ ] Fix any critical bugs immediately

---

## 📚 Related Documentation

**To Update**:
- `architecture.md` - Add shop system architecture
- `project-context.md` - Update economy section
- `AGENTS.md` - Update feature guidelines (remove RC references)

**References**:
- Sprint 26.5: Economy Enhancements (work types, currencies)
- Sprint 26: Economy & Scheduling (base economy system)
- Preparation Screen: Integration point for owned items

---

## 💡 Future Enhancements (Post-Sprint)

**Not in scope for Sprint 31, but worth noting**:
1. **Flash Sales**: Time-limited discounts on items
2. **Bundles**: Package deals (race day kit: gel + water + cap)
3. **Item Durability**: Shoes wear out over races, need replacement
4. **Item Upgrades**: Enhance owned items with better stats
5. **Wishlist**: Mark items to buy later
6. **Gift System**: Send items to other players (multiplayer)
7. **Shop Reputation**: Unlock better items based on purchases
8. **Seasonal Items**: Limited-time gear for holidays/events

---

## ✅ Definition of Done

- [x] All tasks completed and acceptance criteria met
- [x] Code compiles without TypeScript errors
- [x] All unit tests passing
- [x] Manual testing complete (all 5 scenarios pass)
- [x] Responsive design works on mobile and desktop
- [x] Dark mode fully supported
- [x] Translations complete (EN + ID)
- [x] Migration successful for existing players
- [x] No console errors or warnings
- [x] Documentation updated (architecture, context, agents)
- [x] Ready for deployment

---

**Estimated Total Effort**: 5-7 days  
**Priority**: High (blocks progression features, improves core economy)  
**Risk Level**: Medium (touches core economy, requires migration)
