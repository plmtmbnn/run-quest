import type {
  DailyChallenge,
  Grade,
  LocalizedText,
  Outcome,
  Preparation,
  SimulationState,
  Story,
} from "@/types/engine";

/**
 * Generates a localized story summary based on the simulation results.
 */
export function generateStory(
  state: SimulationState,
  challenge: DailyChallenge,
  prep: Preparation,
  grade: Grade,
  outcome: Outcome,
): Story {
  const isDNF = outcome === "dnf";
  const raceTitleEn = challenge.race.title.en;
  const raceTitleId = challenge.race.title.id;

  // 1. Headline
  let headline: LocalizedText;
  if (isDNF) {
    headline = {
      en: `DNF: Race cut short at ${challenge.race.title.en}`,
      id: `DNF: Perlombaan terhenti di ${challenge.race.title.id}`,
    };
  } else {
    const medalTextEn =
      outcome === "gold"
        ? "Gold Medal 🥇"
        : outcome === "silver"
          ? "Silver Medal 🥈"
          : "Bronze Medal 🥉";
    const medalTextId =
      outcome === "gold"
        ? "Medali Emas 🥇"
        : outcome === "silver"
          ? "Medali Perak 🥈"
          : "Medali Perunggu 🥉";

    headline = {
      en: `${medalTextEn} finish at ${raceTitleEn}!`,
      id: `Finish ${medalTextId} di ${raceTitleId}!`,
    };
  }

  // Format final time to hh:mm:ss or mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const finalTimeStr = formatTime(state.accumulatedTime);

  // 2. Summary
  let summary: LocalizedText;
  if (isDNF) {
    summary = {
      en: `Unfortunately, you collapsed at km ${state.distanceCovered.toFixed(0)} due to extreme physical depletion. Better preparation next time!`,
      id: `Sayang sekali, kamu kolaps di km ${state.distanceCovered.toFixed(0)} karena kelelahan fisik ekstrem. Persiapan lebih baik di kesempatan berikutnya!`,
    };
  } else {
    summary = {
      en: `You finished the ${challenge.race.distance} km course in ${finalTimeStr}. Your preparation grade was ${grade}.`,
      id: `Kamu menyelesaikan lintasan ${challenge.race.distance} km dalam ${finalTimeStr}. Nilai persiapanmu adalah ${grade}.`,
    };
  }

  // 3. Highlights
  const highlights: LocalizedText[] = [];

  if (prep.shoes === "carbon_racer") {
    highlights.push({
      en: "The Carbon Racer shoes gave you a notable speed injection on flat sections.",
      id: "Sepatu Carbon Racer memberikan suntikan kecepatan yang nyata di jalanan datar.",
    });
  }

  for (const event of state.eventsResolved) {
    highlights.push({
      en: `At km ${event.km}: ${event.title.en} — ${event.description.en}`,
      id: `Di km ${event.km}: ${event.title.id} — ${event.description.id}`,
    });
  }

  // 4. Lessons
  const lessons: LocalizedText[] = [];
  if (prep.nutrition === "none") {
    lessons.push({
      en: "Running without nutrition severely affected your stamina and hydration.",
      id: "Berlari tanpa nutrisi sangat menguras stamina dan hidrasi kamu.",
    });
  }

  if (prep.warmup === "none") {
    lessons.push({
      en: "Skipping warmup caused muscular stiffness during the initial kilometers.",
      id: "Melewatkan pemanasan menyebabkan kekakuan otot pada kilometer pertama.",
    });
  }

  if (
    challenge.environment.weather === "hot" &&
    prep.nutrition !== "electrolyte"
  ) {
    lessons.push({
      en: "Under scorching heat, electrolytes are superior to plain water to prevent cramps.",
      id: "Di bawah terik panas, elektrolit lebih baik daripada air biasa untuk mencegah kram.",
    });
  }

  if (challenge.race.surface === "trail" && prep.shoes !== "trail") {
    lessons.push({
      en: "Road shoes on trail terrain reduce stability and slow down speed.",
      id: "Sepatu aspal di medan trail mengurangi stabilitas dan memperlambat kecepatan.",
    });
  }

  if (lessons.length === 0) {
    lessons.push({
      en: "Your strategy was extremely solid. Keep up the great decisions!",
      id: "Strategimu sangat solid. Pertahankan keputusan yang baik ini!",
    });
  }

  return {
    headline,
    summary,
    highlights,
    lessons,
  };
}
