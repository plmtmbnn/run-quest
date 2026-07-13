import type { SimulationState } from "@/types/engine";
import type { ClutchMoment } from "./clutch-types";

/**
 * Database of clutch moments
 * High-stakes, all-or-nothing situations
 */
export const CLUTCH_MOMENTS: ClutchMoment[] = [
  {
    id: "final_300m_sprint",
    situation: "final_sprint",
    requirements: {
      minKm: 0, // Will be calculated as totalDistance - 0.3
      energyBelow: 40,
    },
    stakes: {
      en: "300 meters to go. Everything is on the line.",
      id: "300 meter lagi. Semuanya dipertaruhkan.",
    },
    setup: {
      en: "You can see the finish line. Your legs are screaming. This is the moment. Give EVERYTHING?",
      id: "Anda bisa melihat garis finish. Kaki Anda berteriak. Ini saatnya. Berikan SEMUANYA?",
    },
    decision: {
      attempt: {
        en: "FULL SPRINT! EVERYTHING I HAVE!",
        id: "SPRINT PENUH! SEMUA YANG SAYA PUNYA!",
      },
      holdBack: {
        en: "Maintain pace, play it safe",
        id: "Pertahankan kecepatan, main aman",
      },
    },
    outcome: {
      success: {
        en: "You DIG DEEPER than ever before! Your legs find SPEED you didn't know you had! FLYING to the finish!",
        id: "Anda MENGGALI LEBIH DALAM dari sebelumnya! Kaki Anda menemukan KECEPATAN yang tidak Anda tahu Anda miliki! TERBANG ke finish!",
      },
      failure: {
        en: "You give everything... but your body betrays you. Your legs lock up. You're fighting just to finish.",
        id: "Anda memberikan segalanya... tapi tubuh Anda mengkhianati Anda. Kaki Anda terkunci. Anda berjuang hanya untuk menyelesaikan.",
      },
      successEffects: {
        momentum: 50,
        confidence: 30,
        pace: -15, // Faster
        energy: -25,
      },
      failureEffects: {
        momentum: -30,
        confidence: -20,
        pace: 20, // Slower
        energy: -30,
        muscleFatigue: 40,
      },
    },
    successProbability: (state) => {
      // Base probability from willpower and confidence
      const baseProbability = 0.5;
      const confidenceBonus = (state.confidence - 50) / 200; // -0.25 to +0.25
      const momentumBonus = (state.momentum - 50) / 200;
      const energyPenalty = state.energy < 20 ? -0.2 : 0;

      return Math.max(
        0.1,
        Math.min(
          0.9,
          baseProbability + confidenceBonus + momentumBonus + energyPenalty,
        ),
      );
    },
    priority: 10,
  },
  {
    id: "overtake_rival_final_km",
    situation: "overtake_rival",
    requirements: {
      minKm: 0, // Will check if within final 2km
      rivalWithin: 50, // 50 meters ahead
      energyBelow: 50,
    },
    stakes: {
      en: "Your rival is right there. If you don't make your move NOW, you'll lose.",
      id: "Rival Anda tepat di sana. Jika Anda tidak bergerak SEKARANG, Anda akan kalah.",
    },
    setup: {
      en: "They're 30 meters ahead. You've got one shot at this. Surge NOW and catch them?",
      id: "Mereka 30 meter di depan. Anda punya satu kesempatan untuk ini. Melesat SEKARANG dan tangkap mereka?",
    },
    decision: {
      attempt: {
        en: "SURGE! Catch them NOW!",
        id: "MELESAT! Tangkap mereka SEKARANG!",
      },
      holdBack: {
        en: "Too risky, hold current pace",
        id: "Terlalu berisiko, pertahankan kecepatan saat ini",
      },
    },
    outcome: {
      success: {
        en: "You EXPLODE forward! Your rival doesn't see you coming! You're PAST them! The look on their face!",
        id: "Anda MELEDAK maju! Rival Anda tidak melihat Anda datang! Anda MELEWATI mereka! Ekspresi wajah mereka!",
      },
      failure: {
        en: "You surge... but they respond! They pull away even more! The gap is widening!",
        id: "Anda melesat... tapi mereka merespons! Mereka menjauh lebih jauh! Jarak semakin lebar!",
      },
      successEffects: {
        momentum: 40,
        confidence: 35,
        pace: -20,
        energy: -20,
      },
      failureEffects: {
        momentum: -25,
        confidence: -25,
        pace: 10,
        energy: -25,
        mentalFatigue: 30,
      },
    },
    successProbability: (state) => {
      const baseProbability = 0.55;
      const energyBonus = state.energy > 30 ? 0.15 : -0.15;
      const confidenceBonus = state.confidence > 60 ? 0.1 : -0.1;
      const momentumBonus = state.momentum > 60 ? 0.1 : 0;

      return Math.max(
        0.2,
        Math.min(
          0.8,
          baseProbability + energyBonus + confidenceBonus + momentumBonus,
        ),
      );
    },
    priority: 9,
  },
  {
    id: "survival_finish",
    situation: "survival",
    requirements: {
      minKm: 0, // Last 2km
      energyBelow: 15,
    },
    stakes: {
      en: "You're running on FUMES. Can you even FINISH?",
      id: "Anda berlari dengan ASAP. Bisakah Anda bahkan SELESAI?",
    },
    setup: {
      en: "Your body is DONE. Every step is AGONY. But you're SO CLOSE. Dig into your SOUL?",
      id: "Tubuh Anda SELESAI. Setiap langkah adalah SIKSAAN. Tapi Anda SANGAT DEKAT. Gali ke JIWA Anda?",
    },
    decision: {
      attempt: {
        en: "I. WILL. NOT. QUIT!",
        id: "SAYA. TIDAK. AKAN. BERHENTI!",
      },
      holdBack: {
        en: "Walk if I have to...",
        id: "Jalan jika harus...",
      },
    },
    outcome: {
      success: {
        en: "PURE. WILLPOWER. Your body is dead but your SPIRIT carries you! You WILL finish!",
        id: "MURNI. KEMAUAN. Tubuh Anda mati tapi SEMANGAT Anda membawa Anda! Anda AKAN selesai!",
      },
      failure: {
        en: "You try... but there's nothing left. You're barely shuffling. This is going to take forever.",
        id: "Anda coba... tapi tidak ada yang tersisa. Anda hampir tidak berjalan. Ini akan memakan waktu lama.",
      },
      successEffects: {
        confidence: 40,
        energy: 10,
        momentum: 20,
        mentalFatigue: -30,
      },
      failureEffects: {
        confidence: -15,
        momentum: -20,
        pace: 30,
      },
    },
    successProbability: (state) => {
      // Survival is mostly mental
      const baseProbability = 0.6;
      const confidenceBonus = state.confidence > 40 ? 0.2 : -0.2;
      const mentalFatigueBonus = state.mentalFatigue < 60 ? 0.15 : -0.15;

      return Math.max(
        0.3,
        Math.min(0.9, baseProbability + confidenceBonus + mentalFatigueBonus),
      );
    },
    priority: 9,
  },
  {
    id: "comeback_impossible",
    situation: "comeback",
    requirements: {
      minKm: 0, // Final 3km
      positionRequirement: "losing",
      confidenceAbove: 40,
    },
    stakes: {
      en: "You're BEHIND. Way behind. This should be impossible. But is it?",
      id: "Anda TERTINGGAL. Jauh tertinggal. Ini seharusnya mustahil. Tapi apakah itu?",
    },
    setup: {
      en: "Everyone thinks you've lost. Maybe they're right. Or maybe... you pull off the IMPOSSIBLE?",
      id: "Semua orang pikir Anda kalah. Mungkin mereka benar. Atau mungkin... Anda menarik MUSTAHIL?",
    },
    decision: {
      attempt: {
        en: "I DON'T BELIEVE IN IMPOSSIBLE!",
        id: "SAYA TIDAK PERCAYA MUSTAHIL!",
      },
      holdBack: {
        en: "It's too far gone...",
        id: "Sudah terlalu jauh...",
      },
    },
    outcome: {
      success: {
        en: "WHAT. A. MOVE! You're FLYING! They're looking back in DISBELIEF! THIS IS HAPPENING!",
        id: "APA. YANG. BERGERAK! Anda TERBANG! Mereka melihat ke belakang dengan TIDAK PERCAYA! INI TERJADI!",
      },
      failure: {
        en: "You try for the miracle... but the gap is too big. You gave it everything. Sometimes that's not enough.",
        id: "Anda mencoba untuk keajaiban... tapi jaraknya terlalu besar. Anda memberikan segalanya. Kadang itu tidak cukup.",
      },
      successEffects: {
        momentum: 60,
        confidence: 45,
        pace: -25,
        energy: -35,
      },
      failureEffects: {
        momentum: -15,
        confidence: -10,
        energy: -30,
      },
    },
    successProbability: (state) => {
      // Comebacks are hard
      const baseProbability = 0.3;
      const energyBonus = state.energy > 40 ? 0.25 : 0;
      const momentumBonus = state.momentum > 60 ? 0.2 : 0;
      const confidenceBonus = state.confidence > 70 ? 0.15 : 0;

      return Math.max(
        0.15,
        Math.min(
          0.7,
          baseProbability + energyBonus + momentumBonus + confidenceBonus,
        ),
      );
    },
    priority: 8,
  },
  {
    id: "hold_off_surge",
    situation: "final_sprint",
    requirements: {
      minKm: 0, // Final 1km
      positionRequirement: "winning",
      energyBelow: 35,
    },
    stakes: {
      en: "You're winning... but they're charging. Hold them off?",
      id: "Anda menang... tapi mereka menyerang. Tahan mereka?",
    },
    setup: {
      en: "You're in the lead but exhausted. You hear footsteps behind you. Growing LOUDER. Respond?",
      id: "Anda di depan tapi kelelahan. Anda dengar langkah kaki di belakang Anda. Tumbuh LEBIH KERAS. Respons?",
    },
    decision: {
      attempt: {
        en: "MATCH THEIR SURGE! HOLD THE LEAD!",
        id: "SAMAKAN SERANGAN MEREKA! PERTAHANKAN PIMPINAN!",
      },
      holdBack: {
        en: "Trust my lead, don't panic",
        id: "Percaya pimpinan saya, jangan panik",
      },
    },
    outcome: {
      success: {
        en: "You ANSWER their challenge! Every time they surge, YOU SURGE! They can't break you!",
        id: "Anda JAWAB tantangan mereka! Setiap kali mereka melesat, ANDA MELESAT! Mereka tidak bisa mematahkan Anda!",
      },
      failure: {
        en: "You try to respond but you're SPENT! They blow past you! All you can do is watch!",
        id: "Anda coba merespons tapi Anda HABIS! Mereka meledak melewati Anda! Yang bisa Anda lakukan adalah menonton!",
      },
      successEffects: {
        confidence: 35,
        momentum: 30,
        pace: -15,
        energy: -25,
      },
      failureEffects: {
        confidence: -30,
        momentum: -35,
        pace: 15,
        energy: -20,
      },
    },
    successProbability: (state) => {
      const baseProbability = 0.55;
      const energyBonus = state.energy > 25 ? 0.15 : -0.2;
      const confidenceBonus = state.confidence > 65 ? 0.15 : -0.1;

      return Math.max(
        0.2,
        Math.min(0.85, baseProbability + energyBonus + confidenceBonus),
      );
    },
    priority: 9,
  },
];

/**
 * Get clutch moment that matches conditions
 */
export function getClutchMoment(
  state: SimulationState,
  rivalAhead: boolean,
  position: "winning" | "losing" | "tied",
  shownClutch: Set<string>,
): ClutchMoment | null {
  // Only trigger in final portion of race (last 20%)
  const percentComplete = state.distanceCovered / state.totalDistance;
  if (percentComplete < 0.8) {
    return null;
  }

  // Filter clutch moments that haven't been shown and match requirements
  const matchingMoments = CLUTCH_MOMENTS.filter((clutch) => {
    if (shownClutch.has(clutch.id)) {
      return false;
    }

    const { requirements } = clutch;

    // Check energy requirement
    if (requirements.energyBelow && state.energy >= requirements.energyBelow) {
      return false;
    }

    // Check position requirement
    if (
      requirements.positionRequirement &&
      requirements.positionRequirement !== position
    ) {
      return false;
    }

    // Check confidence requirement
    if (
      requirements.confidenceAbove &&
      state.confidence < requirements.confidenceAbove
    ) {
      return false;
    }

    return true;
  });

  if (matchingMoments.length === 0) {
    return null;
  }

  // Sort by priority
  matchingMoments.sort((a, b) => b.priority - a.priority);

  return matchingMoments[0];
}
