import type {
  Checkpoint,
  DailyChallenge,
  Elevation,
  Surface,
  Weather,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

/**
 * Generates a deterministic DailyChallenge based on a date string.
 * This guarantees all players globally receive the same daily run.
 */
export function generateDailyChallenge(dateStr: string): DailyChallenge {
  // Convert date string (YYYY-MM-DD) into a numeric seed
  // e.g. "2026-06-29" -> 20260629
  const cleanDate = dateStr.replace(/-/g, "");
  const seed = Number.parseInt(cleanDate, 10) || 12345;

  const random = new SeededRandom(seed);

  // 1. Pick course properties
  const distances = [5, 10, 15, 21.1];
  const distance = random.pick(distances);

  const surfaces: Surface[] = ["road", "track", "trail"];
  const surface = random.pick(surfaces);

  const elevations: Elevation[] = ["flat", "rolling", "hilly"];
  const elevation = random.pick(elevations);

  // 2. Pick weather properties
  const weathers: Weather[] = [
    "sunny",
    "cloudy",
    "rain",
    "storm",
    "hot",
    "cold",
    "fog",
  ];
  const weather = random.pick(weathers);

  const temperature =
    weather === "hot"
      ? Math.floor(random.nextRange(31, 38))
      : weather === "cold"
        ? Math.floor(random.nextRange(5, 12))
        : Math.floor(random.nextRange(15, 28));

  const humidity =
    weather === "rain" || weather === "storm"
      ? Math.floor(random.nextRange(80, 95))
      : Math.floor(random.nextRange(40, 75));

  const windDirections = ["north", "south", "east", "west"] as const;
  const windDirection = random.pick(windDirections);
  const windSpeed = Math.floor(random.nextRange(0, 30));

  const timesOfDay = ["morning", "afternoon", "evening"] as const;
  const timeOfDay = random.pick(timesOfDay);

  // 3. Compute baseline target pacing (seconds/km)
  let basePaceKm = 300; // 5:00 min/km baseline
  if (surface === "trail") basePaceKm += 30; // slower terrain
  if (surface === "track") basePaceKm -= 10; // faster
  if (elevation === "rolling") basePaceKm += 10;
  if (elevation === "hilly") basePaceKm += 35;

  if (weather === "hot") basePaceKm += 15;
  if (weather === "rain") basePaceKm += 10;
  if (weather === "storm") basePaceKm += 45;

  const targetTime = Math.floor(distance * basePaceKm);

  // 4. Generate checkpoints with event pools
  const checkpoints: Checkpoint[] = [];
  const kmInterval = distance > 10 ? 5 : 2;
  const maxKms = Math.floor(distance);

  // Available events we can distribute
  const eventPoolList = [
    ["cheering_crowd", "sun_glare"],
    ["hydration_station", "strong_wind"],
    ["crowded_corner", "loose_gravel"],
    ["cheering_crowd", "loose_gravel"],
  ];

  for (let km = kmInterval; km < maxKms; km += kmInterval) {
    const poolIndex = Math.floor(random.nextRange(0, eventPoolList.length));
    checkpoints.push({
      km,
      eventPool: eventPoolList[poolIndex],
    });
  }

  // 5. Localized names based on combinations
  const title = {
    en: `The Daily ${distance}K ${surface.toUpperCase()} Challenge`,
    id: `Tantangan Harian ${distance}K ${surface.toUpperCase()}`,
  };

  const description = {
    en: `Run a ${distance}km course on a ${elevation} ${surface} under ${weather} conditions. Target: ${Math.floor(targetTime / 60)}m ${targetTime % 60}s.`,
    id: `Lari lintasan ${distance}km di atas ${surface} ${elevation} dalam kondisi ${weather}. Target: ${Math.floor(targetTime / 60)}m ${targetTime % 60}s.`,
  };

  return {
    id: `challenge_${cleanDate}`,
    date: dateStr,
    environment: {
      weather,
      temperature,
      humidity,
      wind: {
        direction: windDirection,
        speed: windSpeed,
      },
      timeOfDay,
    },
    race: {
      title,
      description,
      distance,
      surface,
      elevation,
      checkpoints,
    },
    objective: {
      targetTime,
    },
    storySeed: {
      mood: weather === "storm" ? "survival" : "optimistic",
    },
  };
}
