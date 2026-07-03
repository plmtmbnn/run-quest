import type { Preparation, Surface, Weather } from "@/types/engine";

export interface PrepScoreModifiers {
  basePaceModifier: number; // in seconds/km (negative is faster)
  fatigueModifier: number; // points/km (positive is more fatigue)
  hydrationModifier: number; // points/km (negative is less dehydration)
  focusModifier: number; // points/km (positive is better focus)
  confidenceModifier: number; // adjustment to initial confidence (0-100 scale)
  initialEnergyOffset: number; // e.g. full warmup costs some initial energy
}

/**
 * Calculates the internal preparation score modifiers based on chosen equipment and strategy,
 * matching environmental conditions (surface and weather).
 */
export function calculatePreparationScore(
  prep: Preparation,
  surface: Surface,
  weather: Weather,
): PrepScoreModifiers {
  const modifiers: PrepScoreModifiers = {
    basePaceModifier: 0,
    fatigueModifier: 0,
    hydrationModifier: 0,
    focusModifier: 0,
    confidenceModifier: 0,
    initialEnergyOffset: 0,
  };

  // 1. Shoes
  switch (prep.shoes) {
    case "daily_trainer":
      // Standard baseline
      break;
    case "carbon_racer":
      modifiers.basePaceModifier -= 15; // Fast
      modifiers.fatigueModifier += 3.0; // High fatigue
      modifiers.confidenceModifier += 5;
      break;
    case "lightweight":
      modifiers.basePaceModifier -= 8;
      modifiers.fatigueModifier += 1.2;
      break;
    case "trail":
      if (surface === "trail") {
        modifiers.basePaceModifier -= 5;
        modifiers.fatigueModifier -= 1.0; // Grip prevents fatigue
        modifiers.confidenceModifier += 10;
      } else {
        // Penalty on road / track
        modifiers.basePaceModifier += 15;
        modifiers.fatigueModifier += 1.0;
        modifiers.confidenceModifier -= 10;
      }
      break;
  }

  // 2. Nutrition (Sprint 13.1 Multi-select scoring)
  if (prep.nutrition.length === 0) {
    modifiers.hydrationModifier += 2.0; // Fast dehydration
    modifiers.fatigueModifier += 2.0;
  } else {
    for (const item of prep.nutrition) {
      switch (item) {
        case "water":
          modifiers.hydrationModifier -= 2.0; // Water: + Hydration Stability
          break;
        case "electrolyte":
          modifiers.hydrationModifier -= 3.5; // Electrolytes: + Reduced Cramp Risk
          modifiers.fatigueModifier -= 0.5;
          break;
        case "energy_gel":
          modifiers.basePaceModifier -= 5; // Energy Gel: + Mid-Race Energy Boost
          modifiers.fatigueModifier -= 0.8;
          break;
        case "caffeine":
          modifiers.focusModifier += 2.0; // Caffeine: + Early Focus
          modifiers.basePaceModifier -= 8; // Caffeine: + Aggressive Pace Potential
          modifiers.fatigueModifier += 0.5; // Caffeine: higher strain/fatigue
          break;
      }
    }
  }

  // 3. Gear (Multi-select)
  for (const item of prep.gear) {
    switch (item) {
      case "cap":
        if (weather === "hot" || weather === "sunny") {
          modifiers.hydrationModifier -= 0.8;
          modifiers.basePaceModifier -= 2;
        } else if (weather === "rain" || weather === "storm") {
          modifiers.focusModifier += 1.0; // Protects face from rain
        }
        break;
      case "sunglasses":
        if (weather === "sunny" || weather === "hot") {
          modifiers.focusModifier += 1.5;
          modifiers.basePaceModifier -= 1;
        }
        break;
      case "arm_sleeves":
        if (weather === "cold") {
          modifiers.basePaceModifier -= 4; // Keeps muscles warm
          modifiers.fatigueModifier -= 0.5;
        }
        break;
      case "hydration_vest":
        modifiers.hydrationModifier -= 3.0; // Huge hydration capacity
        modifiers.fatigueModifier += 0.8; // Extra weight burden
        break;
    }
  }

  // 4. Warm-up
  switch (prep.warmup) {
    case "none":
      modifiers.basePaceModifier += 6; // Slow initial pace
      modifiers.fatigueModifier += 1.5; // Unprepared muscles
      break;
    case "dynamic":
      modifiers.basePaceModifier -= 2;
      modifiers.fatigueModifier -= 0.5;
      break;
    case "full":
      modifiers.basePaceModifier -= 5;
      modifiers.fatigueModifier -= 1.0;
      modifiers.initialEnergyOffset = -10; // Peak ready but slightly tired
      break;
  }

  // 5. Pacing Strategy
  switch (prep.pacing) {
    case "negative_split":
      modifiers.fatigueModifier -= 1.0;
      modifiers.basePaceModifier -= 2;
      break;
    case "steady":
      // Standard baseline
      break;
    case "aggressive":
      modifiers.basePaceModifier -= 12; // Push hard
      modifiers.fatigueModifier += 3.5; // High strain
      break;
    case "conservative":
      modifiers.basePaceModifier += 15; // Safe speed
      modifiers.fatigueModifier -= 2.5; // Save energy
      break;
  }

  // 6. Mindset
  switch (prep.mindset) {
    case "calm":
      modifiers.fatigueModifier -= 0.5;
      modifiers.focusModifier += 1.5;
      break;
    case "confident":
      modifiers.confidenceModifier += 15;
      modifiers.basePaceModifier -= 3;
      break;
    case "fearless":
      modifiers.confidenceModifier += 25;
      modifiers.fatigueModifier += 1.5; // Ignores safety limits
      break;
  }

  // 7. Apply Synergies (dynamic combos)
  const activeSynergies = detectActiveSynergies(prep, surface, weather);
  for (const syn of activeSynergies) {
    switch (syn) {
      case "speed_demon":
        modifiers.basePaceModifier -= 12;
        modifiers.fatigueModifier += 1.5;
        modifiers.hydrationModifier += 1.0;
        break;
      case "zen_runner":
        modifiers.fatigueModifier -= 1.0;
        modifiers.hydrationModifier -= 0.5;
        modifiers.focusModifier += 1.0;
        break;
      case "storm_rider":
        modifiers.basePaceModifier -= 10;
        modifiers.focusModifier += 2.0;
        break;
      case "desert_fox":
        modifiers.hydrationModifier -= 2.0;
        modifiers.basePaceModifier -= 4;
        modifiers.focusModifier += 1.5;
        break;
      case "caffeine_machine":
        modifiers.focusModifier += 2.0;
        modifiers.basePaceModifier -= 6;
        modifiers.fatigueModifier += 0.8;
        break;
      case "peak_condition":
        modifiers.initialEnergyOffset = 5; // Negates -10 and turns into +5
        modifiers.confidenceModifier += 10;
        break;
      case "trail_master":
        modifiers.basePaceModifier -= 8;
        modifiers.fatigueModifier -= 0.8;
        modifiers.confidenceModifier += 10;
        break;
      case "injury_risk":
        modifiers.fatigueModifier += 2.0;
        modifiers.basePaceModifier += 8;
        modifiers.confidenceModifier -= 15;
        break;
    }
  }

  return modifiers;
}

export interface SynergyDef {
  id: string;
  name: { en: string; id: string };
  description: { en: string; id: string };
}

export const PREP_SYNERGIES: Record<string, SynergyDef> = {
  speed_demon: {
    id: "speed_demon",
    name: { en: "Speed Demon 🔥", id: "Iblis Kecepatan 🔥" },
    description: {
      en: "Aggressive pace, carbon racer shoes, and caffeine trigger an intense speed injection at the cost of rapid fatigue.",
      id: "Ritme agresif, sepatu carbon racer, dan kafein memicu injeksi kecepatan tinggi dengan konsekuensi kelelahan cepat.",
    },
  },
  zen_runner: {
    id: "zen_runner",
    name: { en: "Zen Runner 🧘‍♂️", id: "Pelari Zen 🧘‍♂️" },
    description: {
      en: "A calm mindset, conservative pacing, and a warm-up maximize efficiency, minimizing fatigue and hydration loss.",
      id: "Pikiran tenang, ritme konservatif, dan pemanasan memaksimalkan efisiensi, mengurangi kelelahan dan hidrasi.",
    },
  },
  storm_rider: {
    id: "storm_rider",
    name: { en: "Storm Rider ⛈️", id: "Penantang Badai ⛈️" },
    description: {
      en: "Trail shoes and a cap in rainy/stormy conditions allow you to cut through the weather with perfect traction.",
      id: "Sepatu trail dan topi dalam kondisi hujan/badai memungkinkan Anda menerobos cuaca dengan cengkeraman sempurna.",
    },
  },
  desert_fox: {
    id: "desert_fox",
    name: { en: "Desert Fox 🏜️", id: "Rubah Gurun 🏜️" },
    description: {
      en: "Caps, sunglasses, electrolytes, and water in hot/sunny conditions keep you cool and sustain hydration.",
      id: "Topi, kacamata hitam, elektrolit, dan air dalam kondisi panas/cerah menjaga tubuh tetap sejuk dan hidrasi stabil.",
    },
  },
  caffeine_machine: {
    id: "caffeine_machine",
    name: { en: "Caffeine Machine ⚡", id: "Mesin Kafein ⚡" },
    description: {
      en: "Caffeine combined with energy gel and a confident mindset locks in ultimate alertness and high pace stability.",
      id: "Kafein dikombinasikan dengan gel energi dan pikiran percaya diri mengunci fokus penuh dan kestabilan ritme lari.",
    },
  },
  peak_condition: {
    id: "peak_condition",
    name: { en: "Peak Condition 🥇", id: "Kondisi Puncak 🥇" },
    description: {
      en: "A full warm-up combined with steady pacing and a confident mindset eliminates the initial fatigue cost of warming up.",
      id: "Pemanasan penuh dikombinasikan dengan ritme stabil dan pikiran percaya diri menghilangkan konsekuensi kelelahan awal pemanasan.",
    },
  },
  trail_master: {
    id: "trail_master",
    name: { en: "Trail Master 🌲", id: "Master Trail 🌲" },
    description: {
      en: "Trail shoes, dynamic warm-up, and steady strategy on trail terrain grant flawless grip and speed.",
      id: "Sepatu trail, pemanasan dinamis, dan strategi stabil di medan trail memberikan cengkeraman dan kecepatan sempurna.",
    },
  },
  injury_risk: {
    id: "injury_risk",
    name: { en: "Injury Risk ⚠️", id: "Risiko Cedera ⚠️" },
    description: {
      en: "Running with carbon racers without any warm-up is highly dangerous, causing early tightness and pace penalties.",
      id: "Berlari dengan sepatu carbon racer tanpa pemanasan apa pun sangat berbahaya, menyebabkan kekakuan otot awal dan penalti ritme.",
    },
  },
};

export function detectActiveSynergies(
  prep: Preparation,
  surface: Surface,
  weather: Weather,
): string[] {
  const synergies: string[] = [];

  // 1. Speed Demon
  if (
    prep.shoes === "carbon_racer" &&
    prep.pacing === "aggressive" &&
    prep.nutrition.includes("caffeine")
  ) {
    synergies.push("speed_demon");
  }

  // 2. Zen Runner
  if (
    prep.mindset === "calm" &&
    prep.pacing === "conservative" &&
    prep.warmup !== "none"
  ) {
    synergies.push("zen_runner");
  }

  // 3. Storm Rider
  if (
    prep.shoes === "trail" &&
    prep.gear.includes("cap") &&
    (weather === "rain" || weather === "storm")
  ) {
    synergies.push("storm_rider");
  }

  // 4. Desert Fox
  if (
    prep.gear.includes("sunglasses") &&
    prep.gear.includes("cap") &&
    prep.nutrition.includes("electrolyte") &&
    prep.nutrition.includes("water") &&
    (weather === "hot" || weather === "sunny")
  ) {
    synergies.push("desert_fox");
  }

  // 5. Caffeine Machine
  if (
    prep.nutrition.includes("caffeine") &&
    prep.nutrition.includes("energy_gel") &&
    prep.mindset === "confident"
  ) {
    synergies.push("caffeine_machine");
  }

  // 6. Peak Condition
  if (
    prep.warmup === "full" &&
    prep.mindset === "confident" &&
    prep.pacing === "steady"
  ) {
    synergies.push("peak_condition");
  }

  // 7. Trail Master
  if (
    prep.shoes === "trail" &&
    prep.pacing === "steady" &&
    surface === "trail" &&
    prep.warmup === "dynamic"
  ) {
    synergies.push("trail_master");
  }

  // 8. Anti-synergy: Injury Risk
  if (prep.shoes === "carbon_racer" && prep.warmup === "none") {
    synergies.push("injury_risk");
  }

  return synergies;
}
