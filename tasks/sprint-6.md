# Sprint 6

Goal

Implement a 3-card onboarding carousel for new users on first load and lock the application language to English only.

---

Epic

FTUE & English Optimization

---

Task 1

Create the onboarding splash screen component in `src/features/onboarding/onboarding-screen.tsx` containing the introduction, rules, and outcomes card carousel.

---

Task 2

Configure application settings to automatically lock into English.

---

Task 3

Modify Next.js boot entry page `src/app/page.tsx` to mount OnboardingScreen on first load.

---

Task 4

Clean up and delete `src/features/language/language-selection-screen.tsx`.

---

Definition of Done

First-time players see a clean, interactive 3-card splash tutorial explaining intro, mechanics, and outcomes.

The language selection step is bypassed, and the game works exclusively in English.

All tests compile, and formatting checks are valid.
