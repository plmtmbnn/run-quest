# 🧭 Feature Documentation: RunQuest Product Tour & Feature Showcase

## 📋 Overview
The **Product Tour & Feature Showcase** provides an interactive, sequential walkthrough for players on the main Home screen. It introduces core gameplay mechanics in step-by-step order leading up to their first race date.

---

## 🎯 Objectives & Key Features
- **Sequential Feature Tour**: Guides players through all major dashboard widgets in a logical gameplay order.
- **Manual Trigger**: Can be launched on demand by clicking the **🧭 Tour** button in the header or quick navigation bar.
- **New Player Guidance**: The Tour button pulses and is highlighted for new players until they complete their **first race** (`player.statistics.totalRuns === 0`).
- **Next / Back / Skip Functionality**: Players can navigate forward, backward, or close/skip the tour at any time.
- **Full i18n Localization**: Supports both English (`en`) and Indonesian (`id`) with full string translations.
- **UI/UX Design Compliance**: Custom tooltips styled to match the RunQuest design system (`docs/ui-ux-guidelines.md`).

---

## 🗺️ Tour Sequential Steps

| Step | Target Element ID | Title | Description |
| :--- | :--- | :--- | :--- |
| **1** | `body` (Center Modal) | Welcome to RunQuest! 🏃 | Introduces the game and tour purpose. |
| **2** | `#tour-game-stats` | Time is Money (and Fitness) ⏱️ | Highlights the game clock, showing current Day, Week, Month, and Year. |
| **3** | `#tour-health-status` | Health & Energy ⚡ | Explains Energy Points (EP), workout costs, and health maintenance. |
| **4** | `#tour-expenses` | Economy & Expenses 💰 | Explains account balance, recurring expenses, and working for income. |
| **5** | `#tour-daily-training` | Daily Training 📋 | Shows the recommended workout plan and fitness/XP gains. |
| **6** | `#tour-race-calendar` | Race Calendar 🏆 | Demonstrates finding and registering for upcoming races. |
| **7** | `#tour-rest-controls` | Rest & Advance Time 🌙 | Teaches how to rest to recover EP and advance the timeline to race day. |

---

## ⚙️ Technical Architecture

### 1. Component Structure
- `src/components/tour/product-tour.tsx`: The primary wrapper around `react-joyride` 3.x.
  - Implements a custom `Tooltip` component styled using Tailwind CSS (`bg-white dark:bg-slate-900`, `rounded-2xl`, `font-heading font-black`).
  - Includes a `mounted` guard (`useEffect`) to ensure SSR hydration safety in Next.js.
  - Uses `useSound` hook for interactive audio feedback on button clicks.

### 2. Integration Points
- `src/features/home/home-screen.tsx`:
  - Encloses target widgets with container IDs (`#tour-game-stats`, `#tour-health-status`, `#tour-expenses`, `#tour-daily-training`, `#tour-race-calendar`, `#tour-rest-controls`).
  - Renders the header **🧭 Tour** button and `<ProductTour />` component.

### 3. Internationalization (i18n)
- `src/i18n/types.ts`: `tour` interface definition added to `Dictionary`.
- `src/content/translations/en.json`: English dictionary under `"tour"`.
- `src/content/translations/id.json`: Indonesian dictionary under `"tour"`.

---

## 🎨 UI/UX Guidelines Adherence
- **Color Palette**: Uses `bg-indigo-500` for primary action buttons, `bg-white dark:bg-slate-900` for cards, and `border-[#E5E7EB] dark:border-slate-800` for borders.
- **Typography**: Header titles use `font-heading font-black text-sm`. Step counters use `font-mono font-bold text-xs`.
- **Accessibility & Micro-interactions**: Includes clear focus rings, touch targets (`min-h-[38px]`), sound triggers, and smooth scale transitions (`active:scale-95`).

---

## 🧪 Verification & Testing
1. **Unit & Build Testing**:
   - `pnpm test`: Runs Vitest suite (28 test files passed).
   - `pnpm run build`: Next.js Turbopack compilation & TypeScript type check.
2. **Manual QA Steps**:
   - Change app language to **ID** or **EN** in Settings and confirm all step headers and buttons translate seamlessly.
   - Click **🧭 Tour** in the top header to run through all 7 steps.
   - Click "Back" and "Next" to verify step navigation and spotlight positioning.
