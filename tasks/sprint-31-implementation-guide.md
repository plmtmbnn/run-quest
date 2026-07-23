# Sprint 31: Centralized Shop System - Implementation Reference

**Quick Start Guide for Developers**

---

## 🎯 What You're Building

A centralized shop where players buy running gear using money (not Runner Coins).

**Route**: `/shop`  
**Navigation**: Home screen → Shop button → Shop screen  
**Currency**: Money only (from work, races, sponsors)

---

## 📁 File Checklist

### ✅ Create These Files

```bash
# Shop Module
src/shop/shop-store.ts              # Zustand store for inventory
src/shop/shop-types.ts              # TypeScript interfaces
src/shop/shop-catalog.ts            # 24+ items with prices
src/shop/shop-engine.ts             # Purchase validation
src/shop/shop-migration.ts          # Data migration
src/shop/__tests__/shop-engine.test.ts

# UI
src/features/shop/shop-screen.tsx   # Main shop UI
src/app/shop/page.tsx               # Next.js route
```

### ✏️ Modify These Files

```bash
# Storage
src/storage/types.ts                # Add "runquest.inventory" key
src/storage/schemas.ts              # Add StoredInventorySchema
src/storage/storage-repository.ts  # Add loadInventory/saveInventory

# Runner Profile
src/runner/runner-types.ts          # Remove coins: number field

# Screens
src/features/profile/profile-screen.tsx    # Remove RC shop (lines 136-607)
src/features/preparation/preparation-screen.tsx  # Add inventory filter
src/features/home/home-screen.tsx          # Add shop navigation button

# Localization
src/i18n/translations/en.ts         # Add shop.* keys
src/i18n/translations/id.ts         # Add shop.* keys
```

### 📚 Documentation Files Created

```bash
tasks/sprint-31-centralized-shop.md    # Full sprint task
tasks/sprint-31-summary.md             # This summary
SHOP-SYSTEM.md                         # Architecture doc
AGENTS.md                              # Updated guidelines
```

---

## 🏗️ Implementation Steps

### Phase 1: Foundation (Day 1-2)

**1. Create Type Definitions**  
File: `src/shop/shop-types.ts`

```typescript
export interface ShopItem {
  id: string;
  category: "shoes" | "nutrition" | "gear";
  name: { en: string; id: string };
  description: { en: string; id: string };
  price: number;
  unlockLevel?: number;
  stats?: {
    paceBonus?: number;
    staminaBonus?: number;
    hydrationBonus?: number;
  };
}

export interface PlayerInventory {
  shoes: Record<Shoe, boolean>;
  nutrition: Record<Nutrition, number>;
  gear: Record<Gear, boolean>;
}

export interface PurchaseResult {
  success: boolean;
  error?: "INSUFFICIENT_FUNDS" | "ALREADY_OWNED" | "LOCKED" | "INVALID_ITEM";
  newBalance?: number;
}
```

**2. Create Item Catalog**  
File: `src/shop/shop-catalog.ts`

Define all 24+ items:
- 8 shoes ($120-$280)
- 8 nutrition ($0-$5/unit)
- 8+ gear ($25-$120)

**3. Create Purchase Engine**  
File: `src/shop/shop-engine.ts`

```typescript
export function validatePurchase(...) { /* check funds, level, ownership */ }
export function processPurchase(...) { /* deduct money, add to inventory */ }
```

**4. Create Zustand Store**  
File: `src/shop/shop-store.ts`

```typescript
export const useShopStore = create<ShopState>((set, get) => ({
  inventory: DEFAULT_INVENTORY,
  initializeInventory: () => { /* load from storage */ },
  hasItem: (category, itemId) => { /* check ownership */ },
  purchaseItem: async (itemId, category) => { /* buy item */ },
  consumeNutrition: (nutritionId, amount) => { /* decrease qty */ },
}));
```

---

### Phase 2: Storage (Day 2)

**5. Add Storage Schema**  
Files: `src/storage/schemas.ts`, `src/storage/types.ts`

```typescript
// schemas.ts
export const StoredInventorySchema = z.object({
  version: z.literal(1),
  shoes: z.record(z.boolean()),
  nutrition: z.record(z.number()),
  gear: z.record(z.boolean()),
});

// types.ts
export type StoredInventory = z.infer<typeof StoredInventorySchema>;
export type StorageKey = "runquest.inventory" | ... // add to union
```

**6. Add Repository Methods**  
File: `src/storage/storage-repository.ts`

```typescript
loadInventory(): StoredInventory | null { ... }
saveInventory(inventory: StoredInventory): void { ... }
```

---

### Phase 3: Shop UI (Day 3-4)

**7. Create Shop Screen**  
File: `src/features/shop/shop-screen.tsx`

```typescript
export function ShopScreen() {
  const [category, setCategory] = useState("shoes");
  const { inventory, purchaseItem } = useShopStore();
  const { gameState } = useTimelineStore();
  const { settings } = useSettingsStore();
  
  const items = getItemsByCategory(category);
  const balance = gameState?.economy.currentBalance ?? 0;
  
  return (
    <div>
      {/* Category tabs */}
      {/* Item grid */}
      {/* Purchase buttons */}
    </div>
  );
}
```

**8. Create Route**  
File: `src/app/shop/page.tsx`

```typescript
import { ShopScreen } from "@/features/shop/shop-screen";
export default function ShopPage() {
  return <ShopScreen />;
}
```

**9. Add Navigation**  
File: `src/features/home/home-screen.tsx`

```typescript
<button onClick={() => router.push("/shop")}>
  <ShoppingBag className="w-5 h-5" />
  {t("nav.shop")}
</button>
```

---

### Phase 4: Integration (Day 4-5)

**10. Remove RC from Profile**  
File: `src/features/profile/profile-screen.tsx`

- Delete lines 136-150 (Speed upgrade RC)
- Delete lines 170-174 (Stamina upgrade RC)
- Delete lines 245-248 (RC balance display)
- Delete lines 462-607 (RC shop sections)

**11. Remove RC from Runner Types**  
File: `src/runner/runner-types.ts`

```typescript
// Remove this line:
coins: number;
```

**12. Update Preparation Screen**  
File: `src/features/preparation/preparation-screen.tsx`

```typescript
import { useShopStore } from "@/shop/shop-store";

const { hasItem, getItemQuantity } = useShopStore();

const availableShoes = ALL_SHOES.filter(shoe => hasItem("shoes", shoe.id));
const availableNutrition = ALL_NUTRITION.filter(nut => 
  hasItem("nutrition", nut.id) && getItemQuantity("nutrition", nut.id) > 0
);
const availableGear = ALL_GEAR.filter(gear => hasItem("gear", gear.id));
```

**13. Add Nutrition Consumption**  
File: Race completion logic (likely in `src/store/player-store.ts`)

```typescript
const { consumeNutrition } = useShopStore.getState();
preparation.nutrition.forEach(nutritionId => {
  consumeNutrition(nutritionId, 1);
});
```

---

### Phase 5: Localization (Day 5-6)

**14. Add Translations**  
Files: `src/i18n/translations/en.ts`, `src/i18n/translations/id.ts`

```typescript
shop: {
  title: { en: "Shop", id: "Toko" },
  buy: { en: "Buy", id: "Beli" },
  owned: { en: "Owned", id: "Dimiliki" },
  locked: { en: "Unlock at Level {level}", id: "Buka di Level {level}" },
  // ... etc
}
```

---

### Phase 6: Migration & Testing (Day 6-7)

**15. Create Migration**  
File: `src/shop/shop-migration.ts`

```typescript
export function migrateToShopSystem() {
  // Load inventory or create default
  // Remove profile.coins
  // One-time execution
}
```

**16. Write Tests**  
File: `src/shop/__tests__/shop-engine.test.ts`

Test purchase validation, currency conversion, inventory updates.

**17. Manual Testing**
- [ ] New player flow
- [ ] Purchase flow (shoes, nutrition, gear)
- [ ] Currency switching
- [ ] Preparation integration
- [ ] Race consumption
- [ ] Migration from old saves

---

## 🎨 UI Components

### Category Tabs
```typescript
const categories = [
  { id: "shoes", icon: "👟", color: "blue" },
  { id: "nutrition", icon: "🍫", color: "green" },
  { id: "gear", icon: "🎽", color: "purple" },
];
```

### Item Card
```typescript
<div className="border rounded-2xl p-4">
  <h3>{item.name[lang]}</h3>
  <p>{item.description[lang]}</p>
  {item.stats && <span>+{item.stats.paceBonus}% Pace</span>}
  <div>
    <span>{formatCurrency(item.price, preferredCurrency)}</span>
    {hasItem(item.category, item.id) ? (
      <span>✓ Owned</span>
    ) : (
      <button onClick={() => purchaseItem(item.id, item.category)}>
        Buy
      </button>
    )}
  </div>
</div>
```

---

## 💡 Key Patterns

### Always Use formatCurrency
```typescript
import { formatCurrency } from "@/economy/currency-converter";
const { settings } = useSettingsStore();

<span>{formatCurrency(price, settings.preferredCurrency)}</span>
```

### Check Ownership Before Display
```typescript
const { hasItem } = useShopStore();

{hasItem("shoes", "carbon_racer") ? (
  <span>✓ Owned</span>
) : (
  <button>Buy</button>
)}
```

### Validate Before Purchase
```typescript
const canAfford = balance >= item.price;
const meetsLevel = playerLevel >= (item.unlockLevel ?? 1);
const notOwned = !hasItem(item.category, item.id);

const canPurchase = canAfford && meetsLevel && notOwned;
```

---

## 🐛 Common Issues & Solutions

### Issue: "Item already owned" error
**Solution**: Check UI doesn't show purchase button for owned items

### Issue: Currency not converting
**Solution**: Verify `preferredCurrency` from settings store, use `formatCurrency()`

### Issue: Items not appearing in preparation
**Solution**: Check `hasItem()` filter logic, verify inventory loaded

### Issue: Nutrition not consuming
**Solution**: Add consumption logic in race completion handler

### Issue: Migration not running
**Solution**: Call `migrateToShopSystem()` in app initialization (`layout.tsx` or `useEffect`)

---

## 🔍 Debugging Tips

### Check Inventory State
```typescript
console.log("Inventory:", useShopStore.getState().inventory);
```

### Check Balance
```typescript
console.log("Balance:", useTimelineStore.getState().gameState?.economy.currentBalance);
```

### Check Item Ownership
```typescript
console.log("Has carbon_racer:", useShopStore.getState().hasItem("shoes", "carbon_racer"));
```

### Verify Storage
```typescript
console.log("Stored Inventory:", localStorage.getItem("runquest.inventory"));
```

---

## ✅ Testing Checklist

### Unit Tests
- [ ] `validatePurchase()` returns correct errors
- [ ] `processPurchase()` deducts money correctly
- [ ] `hasItem()` checks ownership correctly
- [ ] `consumeNutrition()` decreases quantity

### Integration Tests
- [ ] Purchase → Inventory updates → Storage saves
- [ ] Shop → Buy item → Appears in preparation
- [ ] Race → Consume nutrition → Quantity decreases

### Manual Tests
1. **New Player**: Start game, check default inventory (daily_trainer, water x5)
2. **Buy Shoe**: Go to shop, buy carbon_racer, check it appears in preparation
3. **Buy Nutrition**: Buy 3x energy_gel, verify quantity increments
4. **Currency**: Switch to IDR, verify prices convert
5. **Locked Item**: Try to select locked item at low level
6. **Consumption**: Use gel in race, complete race, verify quantity -1
7. **Migration**: Load old save with RC, verify RC removed

---

## 📊 Item Pricing Guide

### Shoes (One-Time Purchase)
- Starter: $120 (daily_trainer)
- Mid-tier: $150-200 (stability, trail, max_cushion)
- High-end: $220-280 (aggressive_trail, carbon_racer)

### Nutrition (Per Unit, Consumable)
- Free: water
- Basic: $2 (energy_bar, electrolyte, caffeine_gum)
- Advanced: $3-5 (energy_gel, hydration_mix, caffeine)

### Gear (One-Time Purchase)
- Basic: $25-45 (cap, arm_sleeves, trail_gaiters)
- Mid-tier: $50-80 (sunglasses, hydration_vest)
- Premium: $120 (lightweight_jacket)

---

## 🎓 Best Practices

### 1. Use Zustand Selectors
```typescript
// Good
const hasItem = useShopStore(state => state.hasItem);

// Avoid (causes re-renders)
const { inventory } = useShopStore();
```

### 2. Memoize Filtered Lists
```typescript
const availableShoes = useMemo(
  () => ALL_SHOES.filter(shoe => hasItem("shoes", shoe.id)),
  [hasItem]
);
```

### 3. Handle Loading States
```typescript
if (!inventory) return <Loading />;
if (!gameState) return <Error />;
```

### 4. Provide Feedback
```typescript
// Success
toast.success(t("shop.purchase_success"));
playSound("purchase");

// Error
toast.error(t("shop.insufficient_funds"));
playSound("error");
```

---

## 📞 Need Help?

### Documentation
- **Full Sprint Task**: `tasks/sprint-31-centralized-shop.md`
- **Architecture**: `SHOP-SYSTEM.md`
- **Guidelines**: `AGENTS.md`

### Key References
- Economy System: `src/economy/`
- Storage System: `src/storage/`
- Timeline Store: `src/store/timeline-store.ts`
- Settings Store: `src/store/settings-store.ts`

---

**Ready to Start?**  
Begin with Phase 1 → Create `shop-types.ts` and `shop-catalog.ts`

**Stuck on Something?**  
Check the sprint task document for detailed acceptance criteria and subtasks.

**Done with Implementation?**  
Run the testing checklist before marking complete!
