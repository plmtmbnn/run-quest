<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Run-Quest Feature Guidelines

## 📅 Scheduling & Race Timing
- **Scheduling**: Races must be registered in advance for a future day (`dayIndex`). Players are not allowed to compete on the spot.
- **Fast-forward Halt**: The timeline advance/fast-forward routine must check scheduled races and halt precisely on a registered race day.

## 💰 Economy & Currency
- **Preferred Currency**: Never hardcode dollar symbols (`$`) or currencies. Always retrieve `preferredCurrency` from the settings store and use `formatCurrency(amount, preferredCurrency)` for all Work pay, Sponsor stipend, Race fee/prize displays, and Shop prices.
- **Single Currency System**: The game uses **money only** (from `gameState.economy.currentBalance`). Runner Coins (RC) have been **removed** as of Sprint 31.

## 🏪 Shop & Inventory System
- **Centralized Shop**: All gear, nutrition, and shoes are purchased from the dedicated Shop screen (`/shop`). Do not create purchase UI elsewhere.
- **Inventory Tracking**: Use `useShopStore()` to check item ownership. Player inventory is stored separately from runner profile in `runquest.inventory` storage key.
- **Item Ownership**: 
  - **Shoes & Gear**: One-time boolean ownership (`hasItem(category, itemId)`)
  - **Nutrition**: Consumable items with quantity tracking (`getItemQuantity("nutrition", itemId)`)
- **Preparation Screen**: Only show items that the player owns. Filter all shoes, nutrition, and gear by `hasItem()` before displaying selection options.
- **Starter Items**: Every player starts with `daily_trainer` shoe and `water` x5 nutrition by default.
- **Purchase Flow**: Shop Engine validates (level requirement, funds, ownership) → Deducts money → Updates inventory → Persists both.

## 💼 Work Limits & Cooldowns
- **Job Cooldown**: Changing jobs is subject to a strict 7-day cooldown since `lastJobChangeDay`. Disallow switching jobs during this period.
- **Daily Work Limit**: Players can work only once per day. Verify that the current day index is strictly greater than `lastWorkedDay` before processing a work transaction.

