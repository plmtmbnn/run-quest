import type { FlashbackMemory, RaceMemory } from "./memory-types";

/**
 * Generic flashback templates
 * These work without specific race history
 */
export const GENERIC_FLASHBACKS: FlashbackMemory[] = [
  {
    id: "remember_why_started",
    trigger: {
      type: "emotional",
      emotionalState: {
        energyBelow: 40,
        confidenceBelow: 50,
      },
    },
    type: "struggle",
    title: {
      en: "Remember Why You Started",
      id: "Ingat Mengapa Anda Memulai",
    },
    text: {
      en: "You remember the first day you decided to become a runner. That fire inside you. It's still there.",
      id: "Anda ingat hari pertama Anda memutuskan untuk menjadi pelari. Api di dalam Anda. Itu masih ada.",
    },
    emotionalImpact: "inspiring",
    effect: {
      confidence: 15,
      focus: 10,
      mentalFatigue: -15,
    },
    priority: 7,
  },
  {
    id: "trained_for_this",
    trigger: {
      type: "situation",
      situation: "struggling",
    },
    type: "struggle",
    title: {
      en: "You Trained for This Exact Moment",
      id: "Anda Berlatih untuk Momen Ini",
    },
    text: {
      en: "All those early mornings. The long runs. The tough workouts. They were preparing you for RIGHT NOW.",
      id: "Semua pagi-pagi itu. Lari panjang. Latihan berat. Mereka mempersiapkan Anda untuk SEKARANG.",
    },
    emotionalImpact: "motivating",
    effect: {
      confidence: 20,
      willpower: 15,
      focus: 10,
    },
    priority: 8,
  },
  {
    id: "not_same_person",
    trigger: {
      type: "emotional",
      emotionalState: {
        energyBelow: 30,
      },
    },
    type: "breakthrough",
    title: {
      en: "You're Not the Same Person",
      id: "Anda Bukan Orang yang Sama",
    },
    text: {
      en: "You're stronger now. Faster. More experienced. The old you would have quit already. But you're not that person anymore.",
      id: "Anda lebih kuat sekarang. Lebih cepat. Lebih berpengalaman. Anda yang lama sudah menyerah. Tapi Anda bukan orang itu lagi.",
    },
    emotionalImpact: "inspiring",
    effect: {
      confidence: 25,
      willpower: 20,
    },
    priority: 9,
  },
  {
    id: "pain_temporary",
    trigger: {
      type: "situation",
      situation: "breaking_point",
    },
    type: "struggle",
    title: {
      en: "Pain Is Temporary",
      id: "Rasa Sakit Sementara",
    },
    text: {
      en: "This pain? It's temporary. But quitting? That regret lasts forever. Choose wisely.",
      id: "Rasa sakit ini? Sementara. Tapi menyerah? Penyesalan itu berlangsung selamanya. Pilih dengan bijak.",
    },
    emotionalImpact: "motivating",
    effect: {
      confidence: 15,
      willpower: 25,
      mentalFatigue: -10,
    },
    priority: 9,
  },
  {
    id: "trust_the_process",
    trigger: {
      type: "situation",
      situation: "close_race",
    },
    type: "breakthrough",
    title: {
      en: "Trust the Process",
      id: "Percaya Prosesnya",
    },
    text: {
      en: "You've prepared. You've trained. Now trust your body. Trust your mind. Trust the process.",
      id: "Anda telah bersiap. Anda telah berlatih. Sekarang percaya tubuh Anda. Percaya pikiran Anda. Percaya prosesnya.",
    },
    emotionalImpact: "inspiring",
    effect: {
      confidence: 20,
      focus: 15,
    },
    priority: 7,
  },
];

/**
 * Generate personalized flashback from race memory
 */
export function generatePersonalizedFlashback(
  memory: RaceMemory,
  currentKm: number,
  rivalName?: string,
): FlashbackMemory {
  if (memory.outcome === "defeat" && memory.wasClose) {
    // Close defeat - redemption opportunity
    return {
      id: `flashback_${memory.id}_redemption`,
      trigger: {
        type: "location",
        location: memory.location,
      },
      type: "redemption",
      title: {
        en: "Remember This Place?",
        id: "Ingat Tempat Ini?",
      },
      text: {
        en: memory.rival
          ? `Last time here, ${rivalName || "your rival"} beat you. Not today. Today you get your revenge.`
          : "Last time here, you fell short. But you've grown since then. This is your redemption.",
        id: memory.rival
          ? `Terakhir kali di sini, ${rivalName || "rival Anda"} mengalahkan Anda. Tidak hari ini. Hari ini Anda mendapat balas dendam.`
          : "Terakhir kali di sini, Anda gagal. Tapi Anda telah tumbuh sejak itu. Ini penebusan Anda.",
      },
      emotionalImpact: "motivating",
      effect: {
        confidence: 30,
        focus: 20,
        willpower: 25,
      },
      priority: 10,
    };
  }

  if (memory.outcome === "victory" && memory.hadBreakthrough) {
    // Victory with breakthrough - inspiring callback
    return {
      id: `flashback_${memory.id}_triumph`,
      trigger: {
        type: "location",
        location: memory.location,
      },
      type: "victory",
      title: {
        en: "Where You Made History",
        id: "Di Mana Anda Membuat Sejarah",
      },
      text: {
        en: "This is where you broke through. Where you proved you belong. You can do it again.",
        id: "Ini di mana Anda terobosan. Di mana Anda membuktikan Anda pantas. Anda bisa melakukannya lagi.",
      },
      emotionalImpact: "inspiring",
      effect: {
        confidence: 25,
        momentum: 20,
      },
      priority: 8,
    };
  }

  if (memory.hadStruggle && memory.outcome === "victory") {
    // Struggled but won - resilience reminder
    return {
      id: `flashback_${memory.id}_resilience`,
      trigger: {
        type: "situation",
        situation: "struggling",
      },
      type: "struggle",
      title: {
        en: "You've Been Here Before",
        id: "Anda Pernah Di Sini Sebelumnya",
      },
      text: {
        en: "You felt like this before—exhausted, hurting, wanting to quit. But you didn't. And you WON.",
        id: "Anda merasa seperti ini sebelumnya—kelelahan, sakit, ingin berhenti. Tapi Anda tidak. Dan Anda MENANG.",
      },
      emotionalImpact: "motivating",
      effect: {
        willpower: 30,
        confidence: 20,
        energy: 10,
      },
      priority: 9,
    };
  }

  if (memory.criticalKm && Math.abs(currentKm - memory.criticalKm) < 1) {
    // At the critical kilometer from past race
    return {
      id: `flashback_${memory.id}_critical_km`,
      trigger: {
        type: "distance",
        km: memory.criticalKm,
      },
      type: memory.outcome === "victory" ? "victory" : "defeat",
      title: {
        en: "This Kilometer...",
        id: "Kilometer Ini...",
      },
      text: {
        en:
          memory.outcome === "victory"
            ? `Kilometer ${memory.criticalKm}. This is where you made your winning move last time. Lightning can strike twice.`
            : `Kilometer ${memory.criticalKm}. Last time, this is where it fell apart. Not making that mistake again.`,
        id:
          memory.outcome === "victory"
            ? `Kilometer ${memory.criticalKm}. Ini di mana Anda membuat gerakan kemenangan terakhir kali. Petir bisa menyambar dua kali.`
            : `Kilometer ${memory.criticalKm}. Terakhir kali, ini di mana semuanya hancur. Tidak membuat kesalahan itu lagi.`,
      },
      emotionalImpact: memory.outcome === "victory" ? "inspiring" : "warning",
      effect: {
        focus: 25,
        confidence: memory.outcome === "victory" ? 20 : -10,
      },
      priority: 9,
    };
  }

  // Default memory
  return {
    id: `flashback_${memory.id}_default`,
    trigger: {
      type: "location",
      location: memory.location,
    },
    type: memory.outcome,
    title: {
      en: "Been Here Before",
      id: "Pernah Di Sini Sebelumnya",
    },
    text: {
      en:
        memory.outcome === "victory"
          ? "You've won here before. You know this course. Use that knowledge."
          : "You've raced here before. Every race is a chance to improve.",
      id:
        memory.outcome === "victory"
          ? "Anda telah menang di sini sebelumnya. Anda tahu jalur ini. Gunakan pengetahuan itu."
          : "Anda telah balapan di sini sebelumnya. Setiap balapan adalah kesempatan untuk meningkatkan.",
    },
    emotionalImpact: memory.outcome === "victory" ? "inspiring" : "motivating",
    effect: {
      confidence: 15,
      focus: 10,
    },
    priority: 6,
  };
}

/**
 * Get all available flashbacks (generic + personalized)
 */
export function getAllFlashbacks(
  raceMemories: RaceMemory[],
  currentKm: number,
  currentLocation: string,
  rivalName?: string,
): FlashbackMemory[] {
  const flashbacks: FlashbackMemory[] = [...GENERIC_FLASHBACKS];

  // Generate personalized flashbacks from race history
  const relevantMemories = raceMemories.filter(
    (mem) => mem.location === currentLocation,
  );

  for (const memory of relevantMemories) {
    const personalized = generatePersonalizedFlashback(
      memory,
      currentKm,
      rivalName,
    );
    flashbacks.push(personalized);
  }

  return flashbacks;
}
