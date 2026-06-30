import type { Effect, LocalizedText } from "@/types/engine";

export interface EventDefinition {
  id: string;
  type: "positive" | "neutral" | "negative";
  title: LocalizedText;
  description: LocalizedText;
  effect: Effect;
}

export const EVENT_DATABASE: Record<string, EventDefinition> = {
  hydration_station: {
    id: "hydration_station",
    type: "positive",
    title: {
      en: "Hydration Station",
      id: "Stasiun Hidrasi",
    },
    description: {
      en: "You grab a cool drink to refresh your stamina.",
      id: "Kamu mengambil minuman segar untuk menyegarkan stamina.",
    },
    effect: {
      stamina: 5,
      hydration: 25,
      morale: 5,
      pace: 2, // minor slowdown to grab cup
    },
  },
  crowded_corner: {
    id: "crowded_corner",
    type: "negative",
    title: {
      en: "Crowded Corner",
      id: "Tikungan Padat",
    },
    description: {
      en: "The turn is packed with runners, causing some friction.",
      id: "Tikungan dipenuhi pelari, menyebabkan sedikit hambatan.",
    },
    effect: {
      stamina: -5,
      hydration: 0,
      morale: -8,
      pace: 6,
    },
  },
  strong_wind: {
    id: "strong_wind",
    type: "negative",
    title: {
      en: "Strong Headwind",
      id: "Angin Sakal Kencang",
    },
    description: {
      en: "A fierce wind blows directly against you.",
      id: "Angin kencang bertiup langsung menghalangi jalanmu.",
    },
    effect: {
      stamina: -8,
      hydration: -5,
      morale: -6,
      pace: 12, // slows down significantly
    },
  },
  loose_gravel: {
    id: "loose_gravel",
    type: "negative",
    title: {
      en: "Loose Gravel",
      id: "Kerikil Lepas",
    },
    description: {
      en: "The terrain becomes slippery and unstable.",
      id: "Medan menjadi licin dan tidak stabil.",
    },
    effect: {
      stamina: -6,
      hydration: 0,
      morale: -4,
      pace: 10,
    },
  },
  cheering_crowd: {
    id: "cheering_crowd",
    type: "positive",
    title: {
      en: "Cheering Crowd",
      id: "Sorak Penonton",
    },
    description: {
      en: "Spectators shout words of encouragement. You feel pumped!",
      id: "Penonton meneriakkan kata-kata penyemangat. Kamu bersemangat!",
    },
    effect: {
      stamina: 8,
      hydration: 0,
      morale: 15,
      pace: -6, // runs faster
    },
  },
  sun_glare: {
    id: "sun_glare",
    type: "neutral",
    title: {
      en: "Blinding Sun",
      id: "Matahari Menyilaukan",
    },
    description: {
      en: "The bright sunlight shines directly into your eyes.",
      id: "Cahaya matahari yang terik bersinar langsung ke matamu.",
    },
    effect: {
      stamina: -4,
      hydration: -8,
      morale: -10,
      pace: 4,
    },
  },
  special_booster: {
    id: "special_booster",
    type: "positive",
    title: {
      en: "Perfect Runner High (Super Rare)",
      id: "Runner High Sempurna (Sangat Langka)",
    },
    description: {
      en: "You feel an incredible wave of energy and focus, pushing your speed to the limit!",
      id: "Kamu merasakan gelombang energi dan fokus luar biasa, mendorong kecepatanmu ke batas!",
    },
    effect: {
      stamina: 50,
      hydration: 20,
      morale: 40,
      pace: -35,
    },
  },
  special_accident: {
    id: "special_accident",
    type: "negative",
    title: {
      en: "Ankle Sprain (Super Rare)",
      id: "Pergelangan Kaki Terkilir (Sangat Langka)",
    },
    description: {
      en: "You tripped on an uneven stone and sprained your ankle, forcing you to slow down.",
      id: "Kamu tersandung batu yang tidak rata dan pergelangan kaki terkilir, memaksamu melambat.",
    },
    effect: {
      stamina: -30,
      hydration: 0,
      morale: -30,
      pace: 50,
    },
  },
  special_dnf: {
    id: "special_dnf",
    type: "negative",
    title: {
      en: "Sudden Severe Injury (DNF) (Super Rare)",
      id: "Cedera Parah Mendadak (DNF) (Sangat Langka)",
    },
    description: {
      en: "A sharp pain in your hamstring forces you to halt. You cannot continue the race.",
      id: "Rasa sakit yang tajam di hamstring memaksamu berhenti. Kamu tidak bisa melanjutkan balapan.",
    },
    effect: {
      stamina: -100,
      hydration: 0,
      morale: -100,
      pace: 999,
    },
  },
  special_dns: {
    id: "special_dns",
    type: "negative",
    title: {
      en: "Missed Transportation (DNS) (Super Rare)",
      id: "Ketinggalan Transportasi (DNS) (Sangat Langka)",
    },
    description: {
      en: "You failed to arrive at the race course on time. Did Not Start.",
      id: "Kamu gagal tiba di lokasi balapan tepat waktu. Did Not Start.",
    },
    effect: {
      stamina: 0,
      hydration: 0,
      morale: 0,
      pace: 0,
    },
  },
};
