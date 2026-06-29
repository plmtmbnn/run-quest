# Sprint 5

Goal

Implement the Race Archives and History Screen to allow players to view their past challenge completions and stats progression.

---

Epic

Race Archives (UI / UX)

---

Task 1

Add "View History" button link to `HomeScreen`'s Player Profile panel.

---

Task 2

Create Next.js route `/history` and write its page structure in `src/app/history/page.tsx`.

---

Task 3

Implement and style `HistoryScreen` inside `src/features/history/history-screen.tsx` to read `runquest.history` from local storage and render a clean, premium timeline of past races.

---

Task 4

Support viewing details of a historical run (distance, grade, score, and original headline).

---

Definition of Done

Home screen links to the History screen from the player profile widget.

History screen displays a comprehensive timeline of past runs retrieved from local storage.

Each history item displays the date, title/headline, score, grade badge, and distance.

All typescript, layout and Biome formatting checks pass successfully.
