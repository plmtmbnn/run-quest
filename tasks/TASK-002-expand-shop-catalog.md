# TASK-002: Expand Shop Catalog with New Items

## Priority: MEDIUM
## Sprint: 41
## Estimated Effort: 4-6 hours

---

## Problem Statement

The shop catalog currently has limited items across all three categories (Nutrition, Shoes, Gear). Players need more variety and progression options as they level up. Additionally, new items need to be properly integrated across the entire codebase including translations, race UI, events, and breaking points.

### Current State:
- **Nutrition**: 9 items (water, energy_bar, energy_gel, electrolyte, salt_tablets, caffeine, hydration_mix, caffeine_gum, recovery_shake)
- **Shoes**: 9 items (daily_trainer, lightweight, stability, trail, max_cushion, minimalist_trail, carbon_racer, aggressive_trail, recovery_slides)
- **Gear**: 5 items (gps_watch, heart_rate_monitor, compression_socks, running_cap, hydration_vest, lightweight_jacket)

### Goal:
Add 3-5 new items per category (total: ~12-15 new items) with proper integration across all systems.

---

## New Items Design

### 1. NUTRITION_CATALOG Additions (5 new items)

#### A. Beetroot Juice
```typescript
{
  id: "beetroot_juice",
  category: "nutrition",
  name: { 
    en: "Beetroot Juice", 
    id: "Jus Bit" 
  },
  description: {
    en: "Natural nitrate booster improves oxygen efficiency and endurance.",
    id: "Peningkat nitrat alami untuk efisiensi oksigen dan daya tahan.",
  },
  price: 45,
  unlockLevel: 6,
  stats: { 
    staminaBonus: 2,
    paceBonus: 1 
  },
}
```

#### B. Isotonic Sports Drink
```typescript
{
  id: "isotonic_drink",
  category: "nutrition",
  name: { 
    en: "Isotonic Sports Drink", 
    id: "Minuman Isotonik" 
  },
  description: {
    en: "Fast-absorbing electrolytes with optimal carb balance for sustained effort.",
    id: "Elektrolit cepat serap dengan keseimbangan karbo optimal.",
  },
  price: 35,
  unlockLevel: 3,
  stats: { 
    hydrationBonus: 2,
    energyBonus: 1 
  },
}
```

#### C. Protein Energy Bar
```typescript
{
  id: "protein_bar",
  category: "nutrition",
  name: { 
    en: "Protein Energy Bar", 
    id: "Protein Bar" 
  },
  description: {
    en: "High-protein snack for muscle support during ultra-distance efforts.",
    id: "Camilan tinggi protein untuk dukungan otot jarak ultra.",
  },
  price: 40,
  unlockLevel: 7,
  stats: { 
    staminaBonus: 2,
    focusBonus: 1 
  },
}
```

#### D. Carb Chews
```typescript
{
  id: "carb_chews",
  category: "nutrition",
  name: { 
    en: "Fast Carb Chews", 
    id: "Permen Karbohidrat" 
  },
  description: {
    en: "Quick-digesting glucose chews for instant energy mid-race.",
    id: "Permen glukosa cepat cerna untuk energi instan saat lomba.",
  },
  price: 30,
  unlockLevel: 4,
  stats: { 
    energyBonus: 3 
  },
}
```

#### E. Endurance Gel Plus
```typescript
{
  id: "endurance_gel_plus",
  category: "nutrition",
  name: { 
    en: "Endurance Gel Plus", 
    id: "Gel Daya Tahan Plus" 
  },
  description: {
    en: "Premium gel with BCAAs and electrolytes for marathons and ultras.",
    id: "Gel premium dengan BCAA dan elektrolit untuk maraton dan ultra.",
  },
  price: 55,
  unlockLevel: 8,
  stats: { 
    energyBonus: 2,
    staminaBonus: 2,
    hydrationBonus: 1 
  },
}
```

### 2. SHOES_CATALOG Additions (4 new items)

#### A. Marathon Racer
```typescript
{
  id: "marathon_racer",
  category: "shoes",
  name: { 
    en: "Marathon Racer", 
    id: "Sepatu Marathon Racer" 
  },
  description: {
    en: "Balanced race shoe optimized for 26.2-mile efforts with cushioning.",
    id: "Sepatu balap seimbang dioptimalkan untuk maraton dengan bantalan.",
  },
  price: 220,
  unlockLevel: 5,
  stats: { 
    paceBonus: 2,
    staminaBonus: 1 
  },
}
```

#### B. Ultra Trail Beast
```typescript
{
  id: "ultra_trail",
  category: "shoes",
  name: { 
    en: "Ultra Trail Beast", 
    id: "Sepatu Ultra Trail" 
  },
  description: {
    en: "Maximum grip and protection for extreme mountain ultras.",
    id: "Cengkeraman dan perlindungan maksimal untuk ultra gunung ekstrem.",
  },
  price: 240,
  unlockLevel: 8,
  stats: { 
    staminaBonus: 3,
    paceBonus: 1 
  },
}
```

#### C. Speed Flats
```typescript
{
  id: "speed_flats",
  category: "shoes",
  name: { 
    en: "Speed Flats", 
    id: "Sepatu Speed Flats" 
  },
  description: {
    en: "Minimal racing flats for 5K-10K speed demons.",
    id: "Sepatu balap minimal untuk pelari cepat 5K-10K.",
  },
  price: 140,
  unlockLevel: 4,
  stats: { 
    paceBonus: 3 
  },
}
```

#### D. Plated Supershoe
```typescript
{
  id: "plated_supershoe",
  category: "shoes",
  name: { 
    en: "Carbon Plated Supershoe", 
    id: "Sepatu Super Carbon" 
  },
  description: {
    en: "Elite racing shoe with dual carbon plates for maximum energy return.",
    id: "Sepatu balap elit dengan pelat karbon ganda untuk pengembalian energi maksimal.",
  },
  price: 350,
  unlockLevel: 10,
  stats: { 
    paceBonus: 4,
    staminaBonus: 1 
  },
}
```

### 3. GEAR_CATALOG Additions (5 new items)

#### A. Running Sunglasses
```typescript
{
  id: "sunglasses",
  category: "gear",
  name: { 
    en: "Sport Sunglasses", 
    id: "Kacamata Olahraga" 
  },
  description: {
    en: "UV protection and reduced glare for bright day racing.",
    id: "Perlindungan UV dan pengurangan silau untuk lomba siang hari.",
  },
  price: 60,
  unlockLevel: 3,
  stats: { 
    focusBonus: 2 
  },
}
```

#### B. Arm Sleeves
```typescript
{
  id: "arm_sleeves",
  category: "gear",
  name: { 
    en: "Compression Arm Sleeves", 
    id: "Lengan Kompresi" 
  },
  description: {
    en: "Temperature regulation and muscle support for long runs.",
    id: "Regulasi suhu dan dukungan otot untuk lari jauh.",
  },
  price: 40,
  unlockLevel: 4,
  stats: { 
    staminaBonus: 1,
    hydrationBonus: 1 
  },
}
```

#### C. Running Belt
```typescript
{
  id: "running_belt",
  category: "gear",
  name: { 
    en: "Race Belt with Pockets", 
    id: "Sabuk Lari dengan Kantong" 
  },
  description: {
    en: "Lightweight belt for carrying gels, phone, and essentials bounce-free.",
    id: "Sabuk ringan untuk membawa gel, ponsel tanpa bounce.",
  },
  price: 35,
  unlockLevel: 2,
  stats: { 
    focusBonus: 1 
  },
}
```

#### D. Performance Headband
```typescript
{
  id: "headband",
  category: "gear",
  name: { 
    en: "Performance Headband", 
    id: "Bandana Performa" 
  },
  description: {
    en: "Sweat-wicking headband keeps vision clear in hot conditions.",
    id: "Bandana penyerap keringat menjaga penglihatan jernih di kondisi panas.",
  },
  price: 25,
  unlockLevel: 2,
  stats: { 
    focusBonus: 1,
    hydrationBonus: 1 
  },
}
```

#### E. Running Backpack
```typescript
{
  id: "running_backpack",
  category: "gear",
  name: { 
    en: "Ultra Running Backpack", 
    id: "Tas Lari Ultra" 
  },
  description: {
    en: "High-capacity hydration pack for ultras with storage for nutrition and gear.",
    id: "Tas hidrasi kapasitas tinggi untuk ultra dengan penyimpanan nutrisi.",
  },
  price: 140,
  unlockLevel: 7,
  stats: { 
    hydrationBonus: 4,
    staminaBonus: 1 
  },
}
```

---

## Integration Checklist

### Phase 1: Core Catalog & Types

#### 1.1: Update `src/shop/shop-catalog.ts`
- [ ] Add 5 new nutrition items to `NUTRITION_CATALOG`
- [ ] Add 4 new shoes to `SHOES_CATALOG`
- [ ] Add 5 new gear items to `GEAR_CATALOG`
- [ ] Verify `FULL_CATALOG` merges all three arrays
- [ ] Test `getItemById()` and `getItemsByCategory()` functions

#### 1.2: Update Type Definitions
**File**: `src/types/engine.ts` or `src/shop/shop-types.ts`

Add new item IDs to type unions:
```typescript
export type Shoe = 
  | "daily_trainer"
  | "lightweight"
  // ... existing
  | "marathon_racer"    // NEW
  | "ultra_trail"       // NEW
  | "speed_flats"       // NEW
  | "plated_supershoe"; // NEW

export type NutritionItem = 
  | "water"
  | "energy_bar"
  // ... existing
  | "beetroot_juice"      // NEW
  | "isotonic_drink"      // NEW
  | "protein_bar"         // NEW
  | "carb_chews"          // NEW
  | "endurance_gel_plus"; // NEW

export type GearItem = 
  | "gps_watch"
  // ... existing
  | "sunglasses"        // NEW
  | "arm_sleeves"       // NEW
  | "running_belt"      // NEW
  | "headband"          // NEW
  | "running_backpack"; // NEW
```

---

### Phase 2: Translation Files

#### 2.1: English Translations (`src/content/translations/en.json`)

Add to `shop.items` section:
```json
{
  "shop": {
    "items": {
      "beetroot_juice": {
        "name": "Beetroot Juice",
        "description": "Natural nitrate booster improves oxygen efficiency and endurance."
      },
      "isotonic_drink": {
        "name": "Isotonic Sports Drink",
        "description": "Fast-absorbing electrolytes with optimal carb balance for sustained effort."
      },
      "protein_bar": {
        "name": "Protein Energy Bar",
        "description": "High-protein snack for muscle support during ultra-distance efforts."
      },
      "carb_chews": {
        "name": "Fast Carb Chews",
        "description": "Quick-digesting glucose chews for instant energy mid-race."
      },
      "endurance_gel_plus": {
        "name": "Endurance Gel Plus",
        "description": "Premium gel with BCAAs and electrolytes for marathons and ultras."
      },
      "marathon_racer": {
        "name": "Marathon Racer",
        "description": "Balanced race shoe optimized for 26.2-mile efforts with cushioning."
      },
      "ultra_trail": {
        "name": "Ultra Trail Beast",
        "description": "Maximum grip and protection for extreme mountain ultras."
      },
      "speed_flats": {
        "name": "Speed Flats",
        "description": "Minimal racing flats for 5K-10K speed demons."
      },
      "plated_supershoe": {
        "name": "Carbon Plated Supershoe",
        "description": "Elite racing shoe with dual carbon plates for maximum energy return."
      },
      "sunglasses": {
        "name": "Sport Sunglasses",
        "description": "UV protection and reduced glare for bright day racing."
      },
      "arm_sleeves": {
        "name": "Compression Arm Sleeves",
        "description": "Temperature regulation and muscle support for long runs."
      },
      "running_belt": {
        "name": "Race Belt with Pockets",
        "description": "Lightweight belt for carrying gels, phone, and essentials bounce-free."
      },
      "headband": {
        "name": "Performance Headband",
        "description": "Sweat-wicking headband keeps vision clear in hot conditions."
      },
      "running_backpack": {
        "name": "Ultra Running Backpack",
        "description": "High-capacity hydration pack for ultras with storage for nutrition and gear."
      }
    }
  }
}
```

#### 2.2: Indonesian Translations (`src/content/translations/id.json`)

Add corresponding Indonesian translations with the same structure.

---

### Phase 3: Race UI Integration

#### 3.1: Update `src/components/race/mobile-race-navbar.tsx`

Add new nutrition items to `NUTRITION_META` (lines 74-84):
```typescript
const NUTRITION_META: Record<string, { label: string; icon: string }> = {
  water: { label: "Purified Water", icon: "💧" },
  energy_bar: { label: "Energy Bar", icon: "🍫" },
  // ... existing items
  beetroot_juice: { label: "Beetroot Juice", icon: "🧃" },
  isotonic_drink: { label: "Isotonic Drink", icon: "🥤" },
  protein_bar: { label: "Protein Bar", icon: "🍫" },
  carb_chews: { label: "Carb Chews", icon: "🍬" },
  endurance_gel_plus: { label: "Endurance Gel+", icon: "⚡" },
};
```

#### 3.2: Update `src/features/race/race-screen.tsx`

Find `CONSUMABLE_META` (similar location) and add new items:
```typescript
const CONSUMABLE_META: Record<string, { label: string; icon: string }> = {
  // ... existing
  beetroot_juice: { label: "Beetroot Juice", icon: "🧃" },
  isotonic_drink: { label: "Isotonic", icon: "🥤" },
  protein_bar: { label: "Protein Bar", icon: "🍫" },
  carb_chews: { label: "Carb Chews", icon: "🍬" },
  endurance_gel_plus: { label: "Enduro Gel+", icon: "⚡" },
};
```

---

### Phase 4: Event & Breaking Point Systems

#### 4.1: Update `src/content/events/decision-database.ts`

Add new nutrition items to event triggers where nutrition is referenced:
```typescript
// Example: Weather-based events
{
  id: "hot_weather_nutrition",
  triggers: [/* ... */],
  options: [
    {
      label: "Use isotonic drink",
      requirement: { hasItem: "isotonic_drink" },
      effects: { hydration: +15 }
    },
    {
      label: "Use beetroot juice",
      requirement: { hasItem: "beetroot_juice" },
      effects: { stamina: +10, pace: +5 }
    }
  ]
}
```

#### 4.2: Update `src/engine/breaking-points/breaking-database.ts`

Add gear-based mitigations:
```typescript
// Example: Vision impairment in bright sun
{
  id: "glare_blindness",
  condition: (state) => state.environment.weather === "sunny" && state.km > 15,
  severity: "medium",
  mitigations: [
    {
      item: "sunglasses",
      reduction: 0.7,
      message: "Your sport sunglasses cut the glare significantly."
    }
  ]
}
```

---

### Phase 5: Preparation & Shop Screens

#### 5.1: Update `src/features/preparation/preparation-screen.tsx`

Ensure new shoes appear in shoe selection (lines 98-120):
```typescript
const getShoeOptions = () => {
  const roadShoes: { id: Shoe; disabled: boolean }[] = [
    { id: "daily_trainer", disabled: false },
    { id: "carbon_racer", disabled: false },
    { id: "marathon_racer", disabled: false },    // NEW
    { id: "speed_flats", disabled: false },        // NEW
    { id: "plated_supershoe", disabled: false },   // NEW
    // ... rest
  ];

  const trailShoes: { id: Shoe; disabled: boolean }[] = [
    { id: "trail", disabled: false },
    { id: "ultra_trail", disabled: false },        // NEW
    // ... rest
  ];
  
  return isTrailRace ? trailShoes : roadShoes;
};
```

Add new nutrition/gear to inventory filters (check if they're using `hasItem()` correctly).

#### 5.2: Verify Shop Display

No changes needed if `shop-catalog.ts` is the single source of truth. The shop should automatically display new items.

---

## Testing Plan

### Unit Tests:
1. ✅ `getItemById("beetroot_juice")` returns correct item
2. ✅ `getItemsByCategory("nutrition")` includes 14 items (9 old + 5 new)
3. ✅ `getItemsByCategory("shoes")` includes 13 items (9 old + 4 new)
4. ✅ `getItemsByCategory("gear")` includes 10 items (5 old + 5 new)
5. ✅ All new items have required fields: id, category, name, description, price, unlockLevel, stats

### Integration Tests:
1. ✅ Shop displays all new items in correct categories
2. ✅ Purchase flow works for all new items
3. ✅ Inventory correctly tracks new items
4. ✅ Preparation screen shows owned new shoes
5. ✅ Preparation screen shows owned new nutrition with quantities
6. ✅ Race screen nutrition menu includes new items
7. ✅ Mobile race navbar shows new nutrition items
8. ✅ Translations work for both EN and ID
9. ✅ Level locks prevent early purchase
10. ✅ New gear items apply stat bonuses correctly

### Visual/UX Tests:
1. ✅ New item icons render correctly
2. ✅ New item names don't overflow UI
3. ✅ New shoe options appear in preparation
4. ✅ New nutrition appears in race consumables
5. ✅ Tooltips/descriptions display properly

---

## Files to Modify

### Phase 1: Core
1. `src/shop/shop-catalog.ts` - Add new items
2. `src/types/engine.ts` or `src/shop/shop-types.ts` - Update type unions

### Phase 2: Translations
3. `src/content/translations/en.json` - English names/descriptions
4. `src/content/translations/id.json` - Indonesian names/descriptions

### Phase 3: Race UI
5. `src/components/race/mobile-race-navbar.tsx` - Add nutrition metadata
6. `src/features/race/race-screen.tsx` - Add consumable metadata

### Phase 4: Events
7. `src/content/events/decision-database.ts` - Add new item triggers
8. `src/engine/breaking-points/breaking-database.ts` - Add gear mitigations

### Phase 5: Preparation
9. `src/features/preparation/preparation-screen.tsx` - Ensure new shoes appear

---

## Success Criteria

- [ ] 14+ new items added across all categories
- [ ] All items have proper EN/ID translations
- [ ] Shop displays and sells new items correctly
- [ ] Inventory tracks new items properly
- [ ] Preparation screen shows new owned items
- [ ] Race screen allows consuming new nutrition
- [ ] Events/breaking points reference new items
- [ ] No TypeScript errors
- [ ] All unlock levels are balanced
- [ ] Stats bonuses are balanced and meaningful

---

## Notes

- Keep prices proportional to unlock level and stat bonuses
- Ensure new shoes don't break road/trail logic in preparation
- Test nutrition consumption in race to verify effects apply
- Consider adding 1-2 "joke" items at high levels for fun
- Future: Add item durability/degradation system for shoes
