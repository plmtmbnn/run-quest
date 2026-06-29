# Sprint 8

Goal

Implement the Player Settings & Preferences system. This includes language selection, sound toggling, race distance/surface preferences, data resets, and preference-based sorting on the Daily Race Board.

---

Epic

Player Settings & Preferences

---

Task 1

Extend settings storage schema to track preferred surface ("road" | "trail" | "track" | "any") and preferred distance ("short" | "medium" | "long" | "any").

---

Task 2

Extend settings store state and add support for resetting all game/player state from LocalStorage.

---

Task 3

Create the Settings screen and wire it up to the Home Screen navigation.

---

Task 4

Implement the sorting and highlighting logic for the Daily Race Board on the Home Screen based on the player's preferences.

---

Definition of Done

Settings screen allows selection of language, sound, and preferences.

"Reset All Data" wipes all progress and sets board lockout back to fresh.

Daily Race Board displays matched preference races at the top with a "✨ Recommended" badge.

All lint, formatting, and unit tests execute cleanly.
