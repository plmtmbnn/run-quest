# Sprint 3

Goal

Integrate the Simulation Engine into a complete, playable Game Loop UI.

---

Epic

Game Loop UI

---

Task 1

Implement `game-store` to hold Challenge and Result state in `src/store/game-store.ts`

---

Task 2

Implement static daily challenge generator/mock in `src/services/challenge/generator.ts`

---

Task 3

Implement `/race` page and UI to execute simulation engine in `src/app/race/page.tsx` and `src/features/race/race-screen.tsx`

---

Task 4

Implement `/result` page and UI to display outcomes in `src/app/result/page.tsx` and `src/features/result/result-screen.tsx`

---

Task 5

Implement `/briefing` page and update Home routing in `src/app/briefing/page.tsx` and `src/features/briefing/briefing-screen.tsx`

---

Definition of Done

End-to-end game flow is playable: Home -> Briefing -> Preparation -> Race -> Result.

Challenge parameters, weather condition cards, and elapsed timings display dynamically.

Race screen live progress ring ticks and logs event feed outputs deterministically.

Result screen provides grading, medal visual cards, coaching logs, and sharing options.

All linter rules and compiler type constraints pass cleanly.
