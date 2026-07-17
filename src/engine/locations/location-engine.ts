/**
 * Location Engine (Sprint 24)
 *
 * Manages location discovery, unlocking, and narrative generation.
 */

import type { GameState } from "../timeline/time-types";
import {
  getRandomText,
  getRandomWeather,
  LOCATION_PERSONALITIES,
  LOCATIONS,
} from "./location-database";
import type {
  Location,
  LocationHistory,
  LocationState,
  WeatherImpact,
} from "./location-types";

/**
 * Check if a location is unlocked for the player.
 */
export function isLocationUnlocked(
  location: Location,
  gameState: GameState,
  locationState: LocationState,
): boolean {
  // Check if already unlocked
  if (locationState.unlocked.includes(location.id)) return true;

  // Check unlock requirements
  const req = location.unlockRequirements;
  if (!req) return true; // No requirements = always unlocked

  // Check level requirement (derived from skills)
  if (req.minLevel) {
    const runningSkill = gameState.skills.running ?? 0;
    if (runningSkill < req.minLevel) return false;
  }

  // Check story chapter (from flags)
  if (req.storyChapter) {
    const currentChapter = gameState.flags.storyChapter ?? 0;
    if (
      typeof currentChapter === "number" &&
      currentChapter < req.storyChapter
    ) {
      return false;
    }
  }

  // Check rating (from flags)
  if (req.minRating) {
    const rating = gameState.flags.rating ?? 0;
    if (typeof rating === "number" && rating < req.minRating) {
      return false;
    }
  }

  return true;
}

/**
 * Discover a new location (make it visible but not necessarily unlocked).
 */
export function discoverLocation(
  locationState: LocationState,
  locationId: string,
): LocationState {
  if (locationState.discovered.includes(locationId)) {
    return locationState;
  }

  return {
    ...locationState,
    discovered: [...locationState.discovered, locationId],
  };
}

/**
 * Unlock a location for racing.
 */
export function unlockLocation(
  locationState: LocationState,
  locationId: string,
): LocationState {
  let updated = locationState;

  // Discover if not already discovered
  if (!locationState.discovered.includes(locationId)) {
    updated = discoverLocation(updated, locationId);
  }

  // Unlock if not already unlocked
  if (!updated.unlocked.includes(locationId)) {
    updated = {
      ...updated,
      unlocked: [...updated.unlocked, locationId],
    };
  }

  return updated;
}

/**
 * Get or initialize location history.
 */
export function getLocationHistory(
  locationState: LocationState,
  locationId: string,
): LocationHistory {
  return (
    locationState.history[locationId] ?? {
      locationId,
      timesRaced: 0,
      victories: 0,
      defeats: 0,
      personalBests: 0,
      memorableMoments: [],
      lastRaceDate: 0,
    }
  );
}

/**
 * Record a race at a location.
 */
export function recordRace(
  locationState: LocationState,
  locationId: string,
  dayIndex: number,
  finishTime: number,
  victory: boolean,
  isPersonalBest: boolean = false,
): LocationState {
  const history = getLocationHistory(locationState, locationId);

  const updatedHistory: LocationHistory = {
    ...history,
    timesRaced: history.timesRaced + 1,
    lastRaceDate: dayIndex,
    victories: victory ? history.victories + 1 : history.victories,
    defeats: !victory ? history.defeats + 1 : history.defeats,
    personalBests: isPersonalBest
      ? history.personalBests + 1
      : history.personalBests,
    bestTime:
      !history.bestTime || finishTime < history.bestTime
        ? finishTime
        : history.bestTime,
  };

  return {
    ...locationState,
    history: {
      ...locationState.history,
      [locationId]: updatedHistory,
    },
  };
}

/**
 * Add a memorable moment to location history.
 */
export function addMemorableMoment(
  locationState: LocationState,
  locationId: string,
  dayIndex: number,
  description: string,
  significance: "triumph" | "breakthrough" | "disaster" | "rivalry",
): LocationState {
  const history = getLocationHistory(locationState, locationId);

  const updatedHistory: LocationHistory = {
    ...history,
    memorableMoments: [
      ...history.memorableMoments,
      { dayIndex, description, significance },
    ].slice(-10), // Keep last 10 moments
  };

  return {
    ...locationState,
    history: {
      ...locationState.history,
      [locationId]: updatedHistory,
    },
  };
}

/**
 * Generate pre-race narrative for a location.
 */
export function generatePreRaceNarrative(
  locationId: string,
  seed: number,
): {
  arrivalText: string;
  weather: WeatherImpact;
  lore?: string;
} {
  const location = LOCATIONS[locationId];
  const personality = LOCATION_PERSONALITIES[locationId];

  if (!location || !personality) {
    return {
      arrivalText: "You arrive at the race venue.",
      weather: {
        condition: "perfect",
        label: "Perfect",
        description: "",
        speedModifier: 1,
        staminaModifier: 1,
        mentalImpact: 0,
        icon: "☀️",
      },
    };
  }

  const arrivalText = getRandomText(personality.arrivalTexts, seed);
  const weather = getRandomWeather(location, seed + 1);
  const lore =
    location.lore.length > 0
      ? getRandomText(location.lore, seed + 2)
      : undefined;

  return { arrivalText, weather, lore };
}

/**
 * Generate during-race atmosphere text.
 */
export function generateRaceAtmosphere(
  locationId: string,
  distance: number,
  seed: number,
): string {
  const personality = LOCATION_PERSONALITIES[locationId];
  if (!personality) {
    return "You push forward through the course.";
  }

  // Check for landmark-specific text
  const landmark = personality.landmarks.find(
    (lm) => Math.abs(lm.distance - distance) < 0.5,
  );

  if (landmark) {
    return `📍 ${landmark.name}: ${landmark.description}`;
  }

  // General atmosphere
  return getRandomText(personality.raceAtmosphere, seed);
}

/**
 * Generate post-race reflection.
 */
export function generatePostRaceReflection(
  locationId: string,
  victory: boolean,
  seed: number,
): string {
  const personality = LOCATION_PERSONALITIES[locationId];
  if (!personality) {
    return victory
      ? "You finished the race successfully."
      : "You completed the race but didn't achieve your goal.";
  }

  const texts = victory ? personality.victoryTexts : personality.defeatTexts;
  return getRandomText(texts, seed);
}

/**
 * Get available locations for the player.
 */
export function getAvailableLocations(
  gameState: GameState,
  locationState: LocationState,
): Location[] {
  return Object.values(LOCATIONS).filter(
    (location) =>
      locationState.discovered.includes(location.id) &&
      isLocationUnlocked(location, gameState, locationState),
  );
}

/**
 * Get locked but discovered locations (visible but not accessible).
 */
export function getLockedLocations(
  gameState: GameState,
  locationState: LocationState,
): Location[] {
  return Object.values(LOCATIONS).filter(
    (location) =>
      locationState.discovered.includes(location.id) &&
      !isLocationUnlocked(location, gameState, locationState),
  );
}

/**
 * Get location familiarity level (for UI display).
 */
export function getLocationFamiliarity(
  locationState: LocationState,
  locationId: string,
): {
  level: "new" | "familiar" | "veteran" | "master";
  label: string;
  timesRaced: number;
} {
  const history = getLocationHistory(locationState, locationId);
  const times = history.timesRaced;

  if (times === 0) {
    return { level: "new", label: "First Time", timesRaced: times };
  }
  if (times < 5) {
    return { level: "familiar", label: "Familiar", timesRaced: times };
  }
  if (times < 15) {
    return { level: "veteran", label: "Veteran", timesRaced: times };
  }
  return { level: "master", label: "Master", timesRaced: times };
}

/**
 * Calculate location-specific performance modifier.
 */
export function calculateLocationModifier(
  location: Location,
  weather: WeatherImpact,
): {
  totalSpeedModifier: number;
  totalStaminaModifier: number;
  mentalImpact: number;
  breakdown: {
    terrain: number;
    weather: number;
    difficulty: number;
  };
} {
  const terrainModifier = location.difficultyModifier;
  const weatherSpeed = weather.speedModifier;
  const weatherStamina = weather.staminaModifier;

  return {
    totalSpeedModifier: terrainModifier * weatherSpeed,
    totalStaminaModifier: terrainModifier * weatherStamina,
    mentalImpact: weather.mentalImpact,
    breakdown: {
      terrain: terrainModifier,
      weather: (weatherSpeed + weatherStamina) / 2,
      difficulty: location.difficultyModifier,
    },
  };
}

// Re-export types and data
export { LOCATIONS, LOCATION_PERSONALITIES };
export type { Location, LocationState, LocationHistory };
