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
};
