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
  const isDNS = outcome === "dns";
  const raceTitleEn = challenge.race.title.en;
  const raceTitleId = challenge.race.title.id;

  // 1. Headline
  let headline: LocalizedText;
  if (isDNS) {
    headline = {
      en: `DNS: Did Not Start at ${challenge.race.title.en}`,
      id: `DNS: Gagal Start di ${challenge.race.title.id}`,
    };
  } else if (isDNF) {
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
  if (isDNS) {
    summary = {
      en: `Unfortunately, you missed the start of the race. Did Not Start. Better luck next time!`,
      id: `Sayang sekali, kamu ketinggalan start perlombaan. Did Not Start. Semoga beruntung di lain waktu!`,
    };
  } else if (isDNF) {
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

  // Analyze decision behaviors for narrative summary
  if (state.decisionHistory && state.decisionHistory.length > 0) {
    const counts = { aggressive: 0, balanced: 0, conservative: 0 };
    for (const b of state.decisionHistory) {
      counts[b] = (counts[b] || 0) + 1;
    }
    if (
      counts.aggressive > counts.conservative &&
      counts.aggressive > counts.balanced
    ) {
      highlights.push({
        en: "Tactical style: Aggressive. You pushed through challenges relentlessly, trading energy for speed.",
        id: "Gaya taktis: Agresif. Kamu menerobos rintangan tanpa henti, menukar energi dengan kecepatan.",
      });
    } else if (
      counts.conservative > counts.aggressive &&
      counts.conservative > counts.balanced
    ) {
      highlights.push({
        en: "Tactical style: Conservative. You played it safe, prioritizing pacing and physical preservation.",
        id: "Gaya taktis: Konservatif. Kamu bermain aman, memprioritaskan ritme dan menjaga kondisi fisik.",
      });
    } else {
      highlights.push({
        en: "Tactical style: Balanced. You managed your efforts evenly throughout the race conditions.",
        id: "Gaya taktis: Seimbang. Kamu mengatur usahamu dengan merata di seluruh kondisi perlombaan.",
      });
    }
  }

  for (const event of state.eventsResolved) {
    highlights.push({
      en: `At km ${event.km}: ${event.title.en} — ${event.description.en}`,
      id: `Di km ${event.km}: ${event.title.id} — ${event.description.id}`,
    });
  }

  // 4. Lessons
  const lessons: LocalizedText[] = [];
  if (prep.nutrition.length === 0) {
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
    !prep.nutrition.includes("electrolyte")
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
