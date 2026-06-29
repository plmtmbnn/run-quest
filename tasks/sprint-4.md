# Sprint 4

Goal

Enforce the "One Daily Race" rule, persist race history, and finalize the "Share" feature with a visual share card.

---

Epic

Persistence & Share Card

---

Task 1

Update `player-store.ts` to handle completed runs, statistics calculation, daily status, and history storage.

---

Task 2

Implement daily lockout logic on `HomeScreen` (disable starting a new race if completed today).

---

Task 3

Implement navigation guards on `/briefing` and `/preparation` to prevent re-entering once today's run is completed.

---

Task 4

Implement a beautiful, downloadable visual Share Card in `result-screen.tsx` (using `html-to-image` library).

---

Definition of Done

Players can only run today's challenge once; subsequents visits on the same day redirect/display the completed state.

Player statistics (runs, streaks, total distance) and history logs are updated on local storage upon race completion.

Briefing and preparation pages cannot be accessed once the daily race is completed.

Result screen provides a gorgeous visual share card that can be downloaded as a PNG image.

All linter and TypeScript checks pass cleanly.
