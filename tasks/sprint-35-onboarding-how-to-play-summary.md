# Sprint 35: Onboarding Enhancement, "How to Play" Page & Race Nutrition Quantity Sync

**Date**: 2026-07-26  
**Status**: ✅ Fully Complete  
**Priority**: High  

---

## 🎯 Sprint Overview

Sprint 35 focused on improving player onboarding, delivering a dedicated bilingual **"How to Play"** guide page, ensuring seamless quick navigation across screens, and fixing nutrition item quantity synchronization between preparation and live race screens.

---

## 📦 Deliverables Summary

### Files Created (2):
- `src/app/how-to-play/page.tsx` - Route component for `/how-to-play` with metadata
- `src/features/how-to-play/how-to-play-screen.tsx` - Interactive, tabbed guide screen component with Framer Motion animations

### Files Modified (6):
- `src/features/onboarding/onboarding-screen.tsx` - Upgraded onboarding to 5 informative slides with visual feature pills and "How to Play" guide button
- `src/features/home/home-screen.tsx` - Integrated `📖 How to Play →` button in quick navigation bar
- `src/features/settings/settings-screen.tsx` - Added dedicated "How to Play Guide" row under general settings
- `src/content/translations/en.json` - Comprehensive English translations for Onboarding & How to Play
- `src/content/translations/id.json` - Comprehensive Indonesian translations for Onboarding & How to Play
- `src/i18n/types.ts` - Added type-safe `Dictionary` definitions for `how_to_play` and expanded `onboarding`

### Documentation (1):
- `tasks/sprint-35-onboarding-how-to-play-summary.md` - Complete summary report of Sprint 35 changes and architecture updates

---

## 🚀 Detailed Feature Breakdown

### 1. 📖 Dedicated "How to Play" Page (`/how-to-play`)
- **Tabbed Visual Guide**: 6 interactive section tabs covering core game mechanics:
  1. 🗓️ **Race Scheduling & Timeline**: Registering future races, day advances, fast-forward halts.
  2. 💼 **Jobs, Economy & Sponsors**: Working once per day, 7-day job cooldown, preferred currency ($/€/¥/Rp), sponsor stipends.
  3. 🏪 **Shop & Equipment**: Shoes ownership, consumable nutrition (water, gels, bars) purchased in `/shop`.
  4. 🏃 **Daily Workouts & Energy**: Workout types, Energy Points (EP), coach guidance.
  5. ⏱️ **Race Day Briefing & Pacing Strategy**: Weather conditions, pacing tactics (Negative Split, Steady, Surge), checkpoint nutrition.
  6. 🏆 **Progression & Social**: XP leveling, personal bests, shareable stats cards.
- **Language Switcher**: Dedicated EN / ID pill toggle in header.
- **Pro Runner Tip Banner**: Highlighted callout encouraging nutrition prep before race day.

### 2. 🌟 Enhanced Onboarding Screen
- Expanded slider from 4 to 5 structured slides with custom icons, color gradients, and feature details.
- Integrated a `📖 How to Play Guide` header button for immediate access to full documentation.
- Slide 5 collects Runner Name, Country (with auto-locale detection), Preferred Currency, and Date of Birth with age randomizer.

### 3. 🌐 Navigation & i18n Translations
- Added quick navigation entry points in `HomeScreen` and `SettingsScreen`.
- Fully typed `Dictionary` interface in `types.ts` providing full autocomplete for `t("how_to_play...")`.
- Complete English (`en.json`) and Indonesian (`id.json`) translation coverage.

### 4. 🧪 Race Nutrition Quantity Sync
- Verified and fixed selected nutrition item quantities across Preparation, Briefing, and live Race screens.
- Selected quantities in preparation now accurately reflect the consumable amounts usable during live race checkpoints.

---

## 🧪 Verification & Build Status

- **Type Check**: Executed `npx tsc --noEmit` -> **0 errors**.
- **Compilation**: All imports, dynamic routes, and stores compile cleanly.
