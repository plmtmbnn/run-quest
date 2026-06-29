# Sprint 10

Goal

Introduce dynamic daily variety through procedural race generators, localize onboarding splash slides, and add a "Come Back Tomorrow" daily countdown to improve player retention.

---

Epic

Retention, Variety & Localization Completion

---

Task 1

Overhaul the Daily Race Board generator (`generator.ts`) to procedurally construct 4 distinct daily races with random names, distances, surfaces, and difficulty, localized in both English and Indonesian.

---

Task 2

Extract the onboarding slide contents into translation keys in `en.json` and `id.json`, and localize `onboarding-screen.tsx`.

---

Task 3

Add a dynamic countdown timer in `home-screen.tsx` that displays when a player completes their daily run, showing the time remaining until the daily board resets at local midnight.

---

Definition of Done

Procedurally generated races are unique and seeded to the current YYYY-MM-DD.

Onboarding screen is fully bilingual and localizes dynamically.

Countdown timer accurately ticks down to local midnight and displays a friendly re-engagement prompt.

Code successfully passes Biome checks, TSC build, and unit tests.
