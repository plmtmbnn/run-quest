/**
 * Weather Generation Engine
 * 
 * Generates deterministic but varied weather conditions for races based on:
 * - Race schedule ID (ensures same race has consistent weather)
 * - Day index (seasonal variations)
 * - Race tier (higher tiers may have more challenging conditions)
 * - Region (location-based weather patterns)
 */

import type { RaceTier } from "@/economy/economy-types";
import type { Weather, Environment, TimeOfDay } from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

export interface WeatherCondition {
  weather: Weather;
  temperature: number; // Celsius
  humidity: number; // 0-100%
  wind: {
    direction: "north" | "south" | "east" | "west";
    speed: number; // km/h
  };
  timeOfDay: TimeOfDay;
}

export interface WeatherImpact {
  paceModifier: number; // 0.9 = 10% slower, 1.1 = 10% faster
  staminaDrainModifier: number;
  hydrationNeedModifier: number;
  focusModifier: number;
}

/**
 * Generate weather for a specific race occurrence
 * Uses composite seed: scheduleId + dayIndex for deterministic but varied results
 */
export function generateRaceWeather(
  scheduleId: string,
  dayIndex: number,
  tier: RaceTier = "local",
  region?: string
): WeatherCondition {
  // Create composite seed for this specific race occurrence
  const compositeSeed = `${scheduleId}_${dayIndex}_${region || "default"}`;
  const random = new SeededRandom(hashString(compositeSeed));

  // Calculate season (0-3: spring, summer, fall, winter)
  const dayOfYear = dayIndex % 365;
  const season = Math.floor(dayOfYear / 91.25); // ~91 days per season

  // Base weather probabilities adjusted by season
  const weatherProbabilities = getSeasonalWeatherProbabilities(season);
  
  // Higher tier races have slightly higher chance of challenging weather
  const tierChallengeModifier = getTierChallengeModifier(tier);
  adjustProbabilitiesForTier(weatherProbabilities, tierChallengeModifier);

  // Select weather based on weighted probabilities
  const weather = selectWeightedWeather(random, weatherProbabilities);

  // Generate temperature based on weather and season
  const temperature = generateTemperature(weather, season, random);

  // Generate humidity based on weather
  const humidity = generateHumidity(weather, random);

  // Generate wind
  const windDirections: Array<"north" | "south" | "east" | "west"> = ["north", "south", "east", "west"];
  const windDirection = random.pick(windDirections);
  const windSpeed = generateWindSpeed(weather, random);

  // Determine time of day
  const timesOfDay: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];
  const timeOfDay = random.pick(timesOfDay);

  return {
    weather,
    temperature,
    humidity,
    wind: {
      direction: windDirection,
      speed: windSpeed,
    },
    timeOfDay,
  };
}

/**
 * Calculate performance impact modifiers based on weather conditions
 */
export function getWeatherImpact(conditions: WeatherCondition): WeatherImpact {
  let paceModifier = 1.0;
  let staminaDrainModifier = 1.0;
  let hydrationNeedModifier = 1.0;
  let focusModifier = 1.0;

  // Weather-specific impacts
  switch (conditions.weather) {
    case "sunny":
      if (conditions.temperature > 25) {
        paceModifier *= 0.97; // Slightly slower in heat
        hydrationNeedModifier *= 1.15;
      }
      focusModifier *= 1.02; // Good visibility
      break;

    case "hot":
      paceModifier *= 0.85; // Significantly slower
      staminaDrainModifier *= 1.25;
      hydrationNeedModifier *= 1.5;
      focusModifier *= 0.95; // Heat affects concentration
      break;

    case "cold":
      paceModifier *= 0.95;
      staminaDrainModifier *= 1.1;
      hydrationNeedModifier *= 0.8; // Less thirst
      break;

    case "rain":
      paceModifier *= 0.92;
      staminaDrainModifier *= 1.15;
      focusModifier *= 0.95; // Harder to see
      break;

    case "storm":
      paceModifier *= 0.8; // Very challenging
      staminaDrainModifier *= 1.3;
      focusModifier *= 0.85;
      break;

    case "fog":
      paceModifier *= 0.93;
      focusModifier *= 0.9; // Poor visibility
      break;

    case "cloudy":
      // Optimal conditions
      paceModifier *= 1.02;
      staminaDrainModifier *= 0.98;
      break;
  }

  // Wind impact
  if (conditions.wind.speed > 20) {
    paceModifier *= 0.95; // Strong wind slows you down
    staminaDrainModifier *= 1.1;
  } else if (conditions.wind.speed > 10) {
    paceModifier *= 0.98;
  }

  // Temperature impact (additional to weather)
  if (conditions.temperature > 30) {
    paceModifier *= 0.95;
    hydrationNeedModifier *= 1.2;
  } else if (conditions.temperature < 10) {
    paceModifier *= 0.97;
  }

  // Humidity impact
  if (conditions.humidity > 80) {
    staminaDrainModifier *= 1.1;
    paceModifier *= 0.98;
  }

  return {
    paceModifier,
    staminaDrainModifier,
    hydrationNeedModifier,
    focusModifier,
  };
}

/**
 * Convert WeatherCondition to Environment (for compatibility)
 */
export function weatherToEnvironment(conditions: WeatherCondition): Environment {
  return {
    weather: conditions.weather,
    temperature: conditions.temperature,
    humidity: conditions.humidity,
    wind: conditions.wind,
    timeOfDay: conditions.timeOfDay,
  };
}

/**
 * Get severity level of weather conditions
 */
export function getWeatherSeverity(conditions: WeatherCondition): "optimal" | "challenging" | "extreme" {
  const impact = getWeatherImpact(conditions);
  
  // Calculate overall difficulty
  const overallImpact = (2 - impact.paceModifier) + 
                        (impact.staminaDrainModifier - 1) + 
                        (impact.hydrationNeedModifier - 1);

  if (overallImpact > 1.0) return "extreme";
  if (overallImpact > 0.3) return "challenging";
  return "optimal";
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

interface WeatherProbability {
  weather: Weather;
  weight: number;
}

function getSeasonalWeatherProbabilities(season: number): WeatherProbability[] {
  // Season: 0=spring, 1=summer, 2=fall, 3=winter
  const baseProbabilities: Record<number, WeatherProbability[]> = {
    0: [ // Spring - mixed weather
      { weather: "sunny", weight: 0.25 },
      { weather: "cloudy", weight: 0.30 },
      { weather: "rain", weight: 0.25 },
      { weather: "storm", weight: 0.05 },
      { weather: "hot", weight: 0.05 },
      { weather: "cold", weight: 0.05 },
      { weather: "fog", weight: 0.05 },
    ],
    1: [ // Summer - hot and sunny
      { weather: "sunny", weight: 0.40 },
      { weather: "cloudy", weight: 0.20 },
      { weather: "rain", weight: 0.10 },
      { weather: "storm", weight: 0.05 },
      { weather: "hot", weight: 0.20 },
      { weather: "cold", weight: 0.02 },
      { weather: "fog", weight: 0.03 },
    ],
    2: [ // Fall - cooler, more rain
      { weather: "sunny", weight: 0.20 },
      { weather: "cloudy", weight: 0.30 },
      { weather: "rain", weight: 0.25 },
      { weather: "storm", weight: 0.08 },
      { weather: "hot", weight: 0.02 },
      { weather: "cold", weight: 0.10 },
      { weather: "fog", weight: 0.05 },
    ],
    3: [ // Winter - cold and harsh
      { weather: "sunny", weight: 0.15 },
      { weather: "cloudy", weight: 0.35 },
      { weather: "rain", weight: 0.15 },
      { weather: "storm", weight: 0.10 },
      { weather: "hot", weight: 0.01 },
      { weather: "cold", weight: 0.20 },
      { weather: "fog", weight: 0.04 },
    ],
  };

  return baseProbabilities[season] || baseProbabilities[0];
}

function getTierChallengeModifier(tier: RaceTier): number {
  const modifiers: Record<RaceTier, number> = {
    local: 0,
    regional: 0.05,
    state: 0.1,
    national: 0.15,
    international: 0.2,
  };
  return modifiers[tier] || 0;
}

function adjustProbabilitiesForTier(
  probabilities: WeatherProbability[],
  challengeModifier: number
): void {
  if (challengeModifier <= 0) return;

  // Reduce easy weather, increase challenging weather
  const easyWeathers: Weather[] = ["sunny", "cloudy"];
  const challengingWeathers: Weather[] = ["rain", "storm", "hot", "cold"];

  for (const prob of probabilities) {
    if (easyWeathers.includes(prob.weather)) {
      prob.weight *= (1 - challengeModifier);
    } else if (challengingWeathers.includes(prob.weather)) {
      prob.weight *= (1 + challengeModifier);
    }
  }

  // Normalize weights
  const totalWeight = probabilities.reduce((sum, p) => sum + p.weight, 0);
  for (const prob of probabilities) {
    prob.weight /= totalWeight;
  }
}

function selectWeightedWeather(
  random: SeededRandom,
  probabilities: WeatherProbability[]
): Weather {
  let roll = random.next();
  for (const prob of probabilities) {
    roll -= prob.weight;
    if (roll <= 0) {
      return prob.weather;
    }
  }
  // Fallback
  return probabilities[0].weather;
}

function generateTemperature(weather: Weather, season: number, random: SeededRandom): number {
  const baseTemps: Record<number, [number, number]> = {
    0: [12, 22], // Spring
    1: [22, 35], // Summer
    2: [10, 20], // Fall
    3: [0, 12],  // Winter
  };

  const [min, max] = baseTemps[season] || baseTemps[0];

  switch (weather) {
    case "hot":
      return Math.floor(random.nextRange(Math.max(min + 15, 30), Math.max(max, 38)));
    case "cold":
      return Math.floor(random.nextRange(Math.min(min, 5), Math.min(max - 10, 12)));
    case "rain":
    case "storm":
      return Math.floor(random.nextRange(min, max - 5));
    default:
      return Math.floor(random.nextRange(min, max));
  }
}

function generateHumidity(weather: Weather, random: SeededRandom): number {
  switch (weather) {
    case "rain":
    case "storm":
      return Math.floor(random.nextRange(75, 95));
    case "fog":
      return Math.floor(random.nextRange(80, 100));
    case "hot":
      return Math.floor(random.nextRange(60, 85));
    case "cold":
      return Math.floor(random.nextRange(40, 70));
    default:
      return Math.floor(random.nextRange(45, 75));
  }
}

function generateWindSpeed(weather: Weather, random: SeededRandom): number {
  switch (weather) {
    case "storm":
      return Math.floor(random.nextRange(25, 50));
    case "rain":
      return Math.floor(random.nextRange(15, 35));
    case "fog":
      return Math.floor(random.nextRange(0, 10));
    default:
      return Math.floor(random.nextRange(5, 25));
  }
}
