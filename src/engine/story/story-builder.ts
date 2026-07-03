import {
  detectActiveSynergies,
  PREP_SYNERGIES,
} from "@/engine/scoring/preparation-score";
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

  const activeSynergies = detectActiveSynergies(
    prep,
    challenge.race.surface,
    challenge.environment.weather,
  );

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

    let prefixEn = "";
    let prefixId = "";

    if (grade === "S" && outcome === "gold") {
      prefixEn = "🏆 FLAWLESS VICTORY! ";
      prefixId = "🏆 KEMENANGAN SEMPURNA! ";
    } else if (grade === "A" && outcome === "gold") {
      prefixEn = "🔥 ELITE RUN! ";
      prefixId = "🔥 LARI KELAS ELIT! ";
    } else if (state.energy < 15 || state.hydration < 15) {
      prefixEn = "🥵 SURVIVAL FINISH! ";
      prefixId = "🥵 BERTAHAN HIDUP! ";
    } else if (grade === "B" || grade === "C") {
      prefixEn = "✨ STRONG FINISH! ";
      prefixId = "✨ FINISH KUAT! ";
    }

    headline = {
      en: `${prefixEn}${medalTextEn} finish at ${raceTitleEn}!`,
      id: `${prefixId}Finish ${medalTextId} di ${raceTitleId}!`,
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
      en: `Unfortunately, you collapsed at km ${state.distanceCovered.toFixed(1)} due to extreme physical depletion (Energy: ${state.energy.toFixed(0)}%, Hydration: ${state.hydration.toFixed(0)}%). Better preparation next time!`,
      id: `Sayang sekali, kamu kolaps di km ${state.distanceCovered.toFixed(1)} karena kelelahan fisik ekstrem (Energi: ${state.energy.toFixed(0)}%, Hidrasi: ${state.hydration.toFixed(0)}%). Persiapan lebih baik di kesempatan berikutnya!`,
    };
  } else {
    // Generate narrative sentence based on pacing strategy and shoes
    let paceDetailEn = "";
    let paceDetailId = "";
    if (prep.pacing === "negative_split") {
      paceDetailEn =
        "Executing a calculated negative split, you conserved energy early and finished with a strong surge.";
      paceDetailId =
        "Menjalankan ritme split negatif yang terukur, kamu menghemat energi sejak awal dan mengakhirinya dengan lonjakan kuat.";
    } else if (prep.pacing === "aggressive") {
      paceDetailEn =
        "Charging ahead at an aggressive pace from the gun, you traded stamina for maximum velocity.";
      paceDetailId =
        "Melesat maju dengan ritme agresif sejak awal, kamu menukar stamina untuk kecepatan maksimum.";
    } else if (prep.pacing === "conservative") {
      paceDetailEn =
        "Prioritizing physical preservation, your conservative strategy ensured you finished with energy to spare.";
      paceDetailId =
        "Memprioritaskan pemeliharaan fisik, strategi konservatifmu memastikan kamu finish dengan energi tersisa.";
    } else {
      paceDetailEn =
        "Maintaining a steady and consistent pace, you methodically ticked off the kilometers.";
      paceDetailId =
        "Menjaga ritme yang stabil dan konsisten, kamu melewati setiap kilometer dengan metodis.";
    }

    let shoeDetailEn = "";
    let shoeDetailId = "";
    if (prep.shoes === "carbon_racer") {
      shoeDetailEn =
        " The Carbon Racers provided an elite speed injection on flats, though your calves felt the severe fatigue burden.";
      shoeDetailId =
        " Sepatu Carbon Racer memberikan injeksi kecepatan elit di jalan datar, meskipun betismu merasakan beban kelelahan yang berat.";
    } else if (prep.shoes === "trail" && challenge.race.surface === "trail") {
      shoeDetailEn =
        " Your trail shoes provided superior traction on the mud and loose gravel segments.";
      shoeDetailId =
        " Sepatu trailmu memberikan traksi unggul di segmen lumpur dan kerikil longgar.";
    }

    let statusDetailEn = "";
    let statusDetailId = "";
    if (state.energy < 15 || state.hydration < 15) {
      statusDetailEn =
        " It was a grueling final stretch as you crossed the line on absolute fumes.";
      statusDetailId =
        " Ini adalah bentangan akhir yang melelahkan saat kamu melintasi garis finish dengan sisa tenaga terakhir.";
    } else if (state.energy > 60) {
      statusDetailEn =
        " You finished looking incredibly strong and fresh, ready for another lap.";
      statusDetailId =
        " Kamu menyelesaikan balapan dengan tampak sangat kuat dan segar, siap untuk putaran berikutnya.";
    }

    summary = {
      en: `${paceDetailEn}${shoeDetailEn}${statusDetailEn} You completed the ${challenge.race.distance} km course in ${finalTimeStr} (Grade ${grade}).`,
      id: `${paceDetailId}${shoeDetailId}${statusDetailId} Kamu menyelesaikan lintasan ${challenge.race.distance} km dalam ${finalTimeStr} (Nilai ${grade}).`,
    };

    // Generate a shareable emoji block (Run Card)
    const getRunCard = () => {
      const outcomeEmoji =
        outcome === "gold"
          ? "🥇"
          : outcome === "silver"
            ? "🥈"
            : outcome === "bronze"
              ? "🥉"
              : "🏃‍♂️ Finish";

      const shoesLabel =
        prep.shoes === "carbon_racer"
          ? "👟 Carbon Racer"
          : prep.shoes === "trail"
            ? "🥾 Trail Shoes"
            : prep.shoes === "lightweight"
              ? "👟 Lightweight"
              : "👟 Daily Trainer";

      const synergyLabel =
        activeSynergies.length > 0
          ? `\n✨ Synergy: ${activeSynergies.map((s) => PREP_SYNERGIES[s]?.name.en.split(" ")[0]).join(", ")}`
          : "";

      return `\n\n---
🏃‍♂️ **RUN CARD**
📍 Race: ${challenge.race.title.en}
🏅 Result: ${outcomeEmoji} (${grade}-Grade)
⏱️ Time: ${finalTimeStr}
👟 Gear: ${shoesLabel}${synergyLabel}
🔋 Energy: ${state.energy.toFixed(0)}% | 💧 Hydration: ${state.hydration.toFixed(0)}%
⚡ RunQuest.game`;
    };

    const getRunCardId = () => {
      const outcomeEmoji =
        outcome === "gold"
          ? "🥇"
          : outcome === "silver"
            ? "🥈"
            : outcome === "bronze"
              ? "🥉"
              : "🏃‍♂️ Finish";

      const shoesLabel =
        prep.shoes === "carbon_racer"
          ? "👟 Carbon Racer"
          : prep.shoes === "trail"
            ? "🥾 Sepatu Trail"
            : prep.shoes === "lightweight"
              ? "👟 Ringan"
              : "👟 Harian";

      const synergyLabel =
        activeSynergies.length > 0
          ? `\n✨ Sinergi: ${activeSynergies.map((s) => PREP_SYNERGIES[s]?.name.id.split(" ")[0]).join(", ")}`
          : "";

      return `\n\n---
🏃‍♂️ **RUN CARD**
📍 Lomba: ${challenge.race.title.id}
🏅 Hasil: ${outcomeEmoji} (Nilai-${grade})
⏱️ Waktu: ${finalTimeStr}
👟 Perlengkapan: ${shoesLabel}${synergyLabel}
🔋 Energi: ${state.energy.toFixed(0)}% | 💧 Hidrasi: ${state.hydration.toFixed(0)}%
⚡ RunQuest.game`;
    };

    summary.en += getRunCard();
    summary.id += getRunCardId();
  }

  // 3. Highlights
  const highlights: LocalizedText[] = [];

  // Add active synergy highlights at the top
  for (const synId of activeSynergies) {
    const syn = PREP_SYNERGIES[synId];
    if (syn) {
      highlights.push({
        en: `🌟 SYNERGY UNLOCKED: ${syn.name.en} — ${syn.description.en}`,
        id: `🌟 SINERGI TERBUKA: ${syn.name.id} — ${syn.description.id}`,
      });
    }
  }

  if (prep.shoes === "carbon_racer" && activeSynergies.length === 0) {
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
