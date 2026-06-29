import type { DailyChallenge, EnvironmentModifiers } from "@/types/engine";

/**
 * Calculates how environmental conditions (weather, temperature, humidity, wind, surface, elevation)
 * affect running parameters like pace, fatigue, hydration, and focus.
 */
export function calculateEnvironmentModifiers(
  challenge: DailyChallenge,
): EnvironmentModifiers {
  const env = challenge.environment;
  const race = challenge.race;

  const modifiers: EnvironmentModifiers = {
    paceModifier: 0,
    fatigueModifier: 0,
    hydrationModifier: 0,
    focusModifier: 0,
    confidenceModifier: 0,
  };

  // 1. Weather Effect
  switch (env.weather) {
    case "sunny":
      modifiers.hydrationModifier += 0.8;
      break;
    case "cloudy":
      modifiers.paceModifier -= 4; // Cooler weather is great for running
      modifiers.fatigueModifier -= 0.3;
      break;
    case "rain":
      modifiers.paceModifier += 12; // Slippery
      modifiers.fatigueModifier += 0.5;
      modifiers.focusModifier -= 1.0; // Distracting
      break;
    case "storm":
      modifiers.paceModifier += 35; // Dangerous
      modifiers.fatigueModifier += 2.5;
      modifiers.focusModifier -= 3.0;
      modifiers.confidenceModifier -= 15;
      break;
    case "hot":
      modifiers.paceModifier += 15; // Slow down to prevent heatstroke
      modifiers.hydrationModifier += 3.0; // High sweat
      modifiers.fatigueModifier += 1.2;
      break;
    case "cold":
      modifiers.paceModifier += 3; // Stiff muscles
      modifiers.hydrationModifier -= 0.8;
      break;
    case "fog":
      modifiers.paceModifier += 8; // Low visibility
      modifiers.focusModifier -= 1.5;
      break;
  }

  // 2. Temperature & Humidity scaling
  if (env.temperature > 25) {
    const excessHeat = env.temperature - 25;
    modifiers.hydrationModifier += excessHeat * 0.25;
    modifiers.paceModifier += excessHeat * 1.5;
    modifiers.fatigueModifier += excessHeat * 0.1;
  } else if (env.temperature < 10) {
    const excessCold = 10 - env.temperature;
    modifiers.paceModifier += excessCold * 0.8;
    modifiers.fatigueModifier += excessCold * 0.05;
  }

  if (env.humidity > 70) {
    const excessHumidity = env.humidity - 70;
    modifiers.fatigueModifier += excessHumidity * 0.05; // Harder to sweat/cool down
    modifiers.hydrationModifier += excessHumidity * 0.05;
  }

  // 3. Wind speed drag
  if (env.wind.speed > 10) {
    // Simple drag simulation
    modifiers.paceModifier += (env.wind.speed - 10) * 0.4;
    modifiers.focusModifier -= (env.wind.speed - 10) * 0.05;
  }

  // 4. Surface modifiers
  switch (race.surface) {
    case "road":
      // Baseline
      break;
    case "track":
      modifiers.paceModifier -= 10; // Elastic return, flat surface
      modifiers.fatigueModifier -= 0.5;
      break;
    case "trail":
      modifiers.paceModifier += 25; // Technical terrain
      modifiers.fatigueModifier += 1.8; // Heavy stabilizing muscle load
      modifiers.confidenceModifier -= 5;
      break;
  }

  // 5. Elevation modifiers
  switch (race.elevation) {
    case "flat":
      // Baseline
      break;
    case "rolling":
      modifiers.paceModifier += 6;
      modifiers.fatigueModifier += 0.8;
      break;
    case "hilly":
      modifiers.paceModifier += 22;
      modifiers.fatigueModifier += 2.2;
      break;
  }

  return modifiers;
}
