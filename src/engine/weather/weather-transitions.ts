import type { Weather, WeatherTransition } from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

/**
 * Sprint 34 – Task 5: Dynamic Mid-Race Weather System
 *
 * Defines all possible weather transitions and provides the utility to
 * pre-roll them at challenge generation time so the simulation engine
 * can apply their effects deterministically.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Transition Table
// ─────────────────────────────────────────────────────────────────────────────

interface TransitionTemplate {
  from: Weather;
  to: Weather;
  transitionDuration: number;
  effect: {
    temperatureDelta: number;
    energyCostMultiplier: number;
    moraleModifier: number;
  };
  /** 0-1 weight for how often this transition is selected */
  weight: number;
}

export const WEATHER_TRANSITION_TEMPLATES: TransitionTemplate[] = [
  // ── Clear/Sunny ───────────────────────────────────────────────────────────
  {
    from: "sunny",
    to: "cloudy",
    transitionDuration: 2,
    effect: {
      temperatureDelta: -3,
      energyCostMultiplier: 0.95,
      moraleModifier: 5,
    },
    weight: 0.35,
  },
  {
    from: "sunny",
    to: "rain",
    transitionDuration: 1,
    effect: {
      temperatureDelta: -5,
      energyCostMultiplier: 1.15,
      moraleModifier: -10,
    },
    weight: 0.2,
  },
  {
    from: "sunny",
    to: "hot",
    transitionDuration: 2,
    effect: {
      temperatureDelta: 6,
      energyCostMultiplier: 1.2,
      moraleModifier: -5,
    },
    weight: 0.15,
  },
  // ── Cloudy ────────────────────────────────────────────────────────────────
  {
    from: "cloudy",
    to: "rain",
    transitionDuration: 1,
    effect: {
      temperatureDelta: -2,
      energyCostMultiplier: 1.15,
      moraleModifier: -5,
    },
    weight: 0.35,
  },
  {
    from: "cloudy",
    to: "sunny",
    transitionDuration: 2,
    effect: {
      temperatureDelta: 4,
      energyCostMultiplier: 1.05,
      moraleModifier: 10,
    },
    weight: 0.2,
  },
  {
    from: "cloudy",
    to: "fog",
    transitionDuration: 1,
    effect: {
      temperatureDelta: -1,
      energyCostMultiplier: 1.05,
      moraleModifier: -5,
    },
    weight: 0.15,
  },
  // ── Rain ──────────────────────────────────────────────────────────────────
  {
    from: "rain",
    to: "storm",
    transitionDuration: 1,
    effect: {
      temperatureDelta: -2,
      energyCostMultiplier: 1.3,
      moraleModifier: -15,
    },
    weight: 0.2,
  },
  {
    from: "rain",
    to: "cloudy",
    transitionDuration: 2,
    effect: {
      temperatureDelta: 2,
      energyCostMultiplier: 1.05,
      moraleModifier: 5,
    },
    weight: 0.35,
  },
  // ── Storm ─────────────────────────────────────────────────────────────────
  {
    from: "storm",
    to: "rain",
    transitionDuration: 2,
    effect: {
      temperatureDelta: 1,
      energyCostMultiplier: 1.1,
      moraleModifier: 10,
    },
    weight: 0.4,
  },
  // ── Hot ───────────────────────────────────────────────────────────────────
  {
    from: "hot",
    to: "cloudy",
    transitionDuration: 2,
    effect: {
      temperatureDelta: -4,
      energyCostMultiplier: 0.95,
      moraleModifier: 8,
    },
    weight: 0.3,
  },
  {
    from: "hot",
    to: "sunny",
    transitionDuration: 1,
    effect: {
      temperatureDelta: -2,
      energyCostMultiplier: 1.0,
      moraleModifier: 5,
    },
    weight: 0.2,
  },
  // ── Cold ──────────────────────────────────────────────────────────────────
  {
    from: "cold",
    to: "cloudy",
    transitionDuration: 2,
    effect: {
      temperatureDelta: 3,
      energyCostMultiplier: 0.97,
      moraleModifier: 5,
    },
    weight: 0.3,
  },
  {
    from: "cold",
    to: "fog",
    transitionDuration: 1,
    effect: {
      temperatureDelta: 0,
      energyCostMultiplier: 1.05,
      moraleModifier: -5,
    },
    weight: 0.2,
  },
  // ── Fog ───────────────────────────────────────────────────────────────────
  {
    from: "fog",
    to: "cloudy",
    transitionDuration: 2,
    effect: {
      temperatureDelta: 2,
      energyCostMultiplier: 0.97,
      moraleModifier: 8,
    },
    weight: 0.35,
  },
  {
    from: "fog",
    to: "sunny",
    transitionDuration: 2,
    effect: {
      temperatureDelta: 5,
      energyCostMultiplier: 1.0,
      moraleModifier: 12,
    },
    weight: 0.2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Weather emoji lookup
// ─────────────────────────────────────────────────────────────────────────────

export const WEATHER_EMOJI: Record<Weather, string> = {
  sunny: "☀️",
  cloudy: "⛅",
  rain: "🌧️",
  storm: "⛈️",
  hot: "🌡️",
  cold: "❄️",
  fog: "🌫️",
};

// ─────────────────────────────────────────────────────────────────────────────
// Generator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pre-rolls 0, 1, or 2 weather transitions for a given race.
 * Called during challenge generation so the simulation has deterministic data.
 *
 * Rules:
 * - Short races (< 6 km): 0 transitions (not enough time)
 * - Medium races (6-12 km): 0-1 transitions
 * - Long races (> 12 km): 0-2 transitions
 * - Transitions never occur in the first 15% or final 20% of the race
 * - At least 3 km gap between any two transitions
 */
export function generateWeatherTransitions(
  startingWeather: Weather,
  totalDistance: number,
  seed: number,
): WeatherTransition[] {
  if (totalDistance < 6) return [];

  const random = new SeededRandom(seed + 99991); // offset seed so it doesn't clash with other rolls

  // Determine max transitions
  const maxTransitions = totalDistance > 12 ? 2 : 1;
  // 50% chance of no transition, 35% one, 15% two (for long races)
  const weights = totalDistance > 12 ? [0.45, 0.4, 0.15] : [0.5, 0.5];
  const numRoll = random.next();
  let numTransitions = 0;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (numRoll < cumulative) {
      numTransitions = Math.min(i, maxTransitions);
      break;
    }
  }

  if (numTransitions === 0) return [];

  const transitions: WeatherTransition[] = [];
  let currentWeather = startingWeather;

  // Safe km window: 15% to 80% of race distance
  const minKm = Math.max(1, Math.ceil(totalDistance * 0.15));
  const maxKm = Math.floor(totalDistance * 0.8);
  const usedKms: number[] = [];

  for (let i = 0; i < numTransitions; i++) {
    const candidates = WEATHER_TRANSITION_TEMPLATES.filter(
      (t) => t.from === currentWeather,
    );
    if (candidates.length === 0) break;

    // Weighted pick
    const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
    let roll = random.next() * totalWeight;
    let picked: TransitionTemplate | null = null;
    for (const c of candidates) {
      roll -= c.weight;
      if (roll <= 0) {
        picked = c;
        break;
      }
    }
    if (!picked) picked = candidates[0];

    // Pick a km that is at least 3 km away from any already chosen km
    let attemptKm = -1;
    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = Math.floor(random.nextRange(minKm, maxKm + 1));
      const tooClose = usedKms.some((k) => Math.abs(k - candidate) < 3);
      if (!tooClose) {
        attemptKm = candidate;
        break;
      }
    }
    if (attemptKm === -1) break; // couldn't find a valid km

    usedKms.push(attemptKm);
    transitions.push({
      id: `wt_${seed}_${i}`,
      km: attemptKm,
      from: picked.from,
      to: picked.to,
      transitionDuration: picked.transitionDuration,
      effect: { ...picked.effect },
      alertShown: false,
    });

    currentWeather = picked.to;
  }

  // Sort by km so they fire in order
  transitions.sort((a, b) => a.km - b.km);
  return transitions;
}
