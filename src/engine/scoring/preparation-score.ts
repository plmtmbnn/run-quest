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

  return modifiers;
}
