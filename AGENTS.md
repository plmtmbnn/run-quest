<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Run-Quest Feature & Development Guidelines

## 🎨 UI/UX Design System & Styling
- **Strict Compliance**: ALL UI components, widgets, screens, and pages MUST strictly follow the design system guidelines defined in [`docs/ui-ux-guidelines.md`](docs/ui-ux-guidelines.md).
- **Design Tokens & Patterns**:
  - **Cards & Containers**: Primary cards use `bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem]` or `rounded-2xl` with subtle shadows.
  - **Color Palette**: Use semantic color tokens (`emerald` for success, `rose` for danger/unpaid, `amber` for warnings, `indigo` for primary branding).
  - **Typography**: Page and card headers must use `font-heading font-black`. Monospace text (`font-mono font-bold`) MUST be used for numbers, currency displays, percentages, and timestamps. Uppercase badges must use `text-[10px]` or `text-[9px] font-bold uppercase tracking-wider`.
  - **Dark Mode Support**: All elements must support dark mode with high visual quality and proper contrast (`dark:text-white`, `dark:text-slate-400`, `dark:bg-slate-950`).
  - **Buttons & Micro-interactions**: Use `active:scale-95 transition-all` for interactive buttons and pill tabs.

## ⚡ React & Zustand State Management
- **Prevent Infinite Loops**: NEVER pass entire Zustand store hook references into `useEffect` dependency arrays (e.g., `useEffect(() => store.load(), [store])`). Store state updates mutate store references and will trigger infinite re-renders (`Maximum update depth exceeded`).
- **Store Initialization**: Call store persistence/initialization methods via `useStore.getState().loadFromStorage()` or `useStore.getState().initialize()` inside `useEffect` with an empty dependency array `[]`.

## 📅 Scheduling & Race Timing
- **Scheduling**: Races must be registered in advance for a future day (`dayIndex`). Players are not allowed to compete on the spot.
- **Fast-forward Halt**: The timeline advance/fast-forward routine must check scheduled races and halt precisely on a registered race day.

## 💰 Economy, Currency & Recurring Expenses
- **Preferred Currency**: Never hardcode dollar symbols (`$`) or currencies. Always retrieve `preferredCurrency` from the settings store and use `formatCurrency(amount, preferredCurrency)` for all Work pay, Sponsor stipend, Race fee/prize displays, and Shop prices.
- **Single Currency System**: The game uses **money only** (from `gameState.economy.currentBalance`). Runner Coins (RC) have been **removed** as of Sprint 31.
- **Recurring Expenses**: Weekly living and optional benefit expenses must be processed via timeline advances. Unpaid mandatory expenses restrict training and race entries until settled.

## 🏪 Shop & Inventory System
- **Centralized Shop**: All gear, nutrition, and shoes are purchased from the dedicated Shop screen (`/shop`). Do not create purchase UI elsewhere.
- **Inventory Tracking**: Use `useShopStore()` to check item ownership. Player inventory is stored separately from runner profile in `runquest.inventory` storage key.
- **Item Ownership**: 
  - **Shoes & Gear**: One-time boolean ownership (`hasItem(category, itemId)`).
  - **Nutrition**: Consumable items with quantity tracking (`getItemQuantity("nutrition", itemId)`).
- **Preparation Screen**: Only show items that the player owns. Filter all shoes, nutrition, and gear by `hasItem()` before displaying selection options.
- **Starter Items**: Every player starts with `daily_trainer` shoe and `water` x5 nutrition by default.
- **Purchase Flow**: Shop Engine validates (level requirement, funds, ownership) → Deducts money → Updates inventory → Persists both.

## 💼 Work Limits & Cooldowns
- **Job Cooldown**: Changing jobs is subject to a strict 7-day cooldown since `lastJobChangeDay`. Disallow switching jobs during this period.
- **Daily Work Limit**: Players can work only once per day. Verify that the current day index is strictly greater than `lastWorkedDay` before processing a work transaction.
