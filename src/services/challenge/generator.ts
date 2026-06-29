import type {
  Checkpoint,
  DailyChallenge,
  DailyRaceBoard,
  Elevation,
  RaceEntry,
  Scenario,
  Surface,
  Weather,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

function generateScenarioForEntry(
  dateStr: string,
  seed: number,
  distance: number,
  surface: Surface,
  displayName: string,
): Scenario {
  const random = new SeededRandom(seed);

  // 1. Course details
  const elevations: Elevation[] = ["flat", "rolling", "hilly"];
  const elevation = random.pick(elevations);

  // 2. Weather
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

  // 3. Pacing calculation
  let basePaceKm = 300; // 5:00 min/km
  if (surface === "trail") basePaceKm += 30;
  if (surface === "track") basePaceKm -= 10;
  if (elevation === "rolling") basePaceKm += 10;
  if (elevation === "hilly") basePaceKm += 35;

  if (weather === "hot") basePaceKm += 15;
  if (weather === "rain") basePaceKm += 10;
  if (weather === "storm") basePaceKm += 45;

  const targetTime = Math.floor(distance * basePaceKm);

  // 4. Checkpoints
  const checkpoints: Checkpoint[] = [];
  const kmInterval = distance > 10 ? 5 : 2;
  const maxKms = Math.floor(distance);

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

  const title = {
    en: `${displayName} (${distance}K)`,
    id: `${displayName} (${distance}K)`,
  };

  const description = {
    en: `Run a ${distance}km course on a ${elevation} ${surface} under ${weather} conditions. Target: ${Math.floor(
      targetTime / 60,
    )}m ${targetTime % 60}s.`,
    id: `Lari lintasan ${distance}km di atas ${surface} ${elevation} dalam kondisi ${weather}. Target: ${Math.floor(
      targetTime / 60,
    )}m ${targetTime % 60}s.`,
  };

  return {
    id: `challenge_${seed}`,
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

export function generateDailyRaceBoard(dateStr: string): DailyRaceBoard {
  const cleanDate = dateStr.replace(/-/g, "");
  const baseSeed = Number.parseInt(cleanDate, 10) || 12345;

  const configList = [
    {
      id: "morning_tempo",
      title: { en: "Morning Tempo", id: "Tempo Pagi" },
      category: "road" as const,
      surface: "road" as const,
      distance: 10,
      difficulty: 3,
    },
    {
      id: "jungle_escape",
      title: { en: "Jungle Escape", id: "Pelarian Hutan" },
      category: "trail" as const,
      surface: "trail" as const,
      distance: 15,
      difficulty: 5,
    },
    {
      id: "track_intervals",
      title: { en: "Track Intervals", id: "Interval Lintasan" },
      category: "track" as const,
      surface: "track" as const,
      distance: 5,
      difficulty: 4,
    },
    {
      id: "city_explorer",
      title: { en: "City Explorer", id: "Penjelajah Kota" },
      category: "road" as const,
      surface: "road" as const,
      distance: 21.1,
      difficulty: 4,
    },
  ];

  const entries: RaceEntry[] = configList.map((cfg, idx) => {
    const entrySeed = baseSeed + idx * 1000;
    const scenario = generateScenarioForEntry(
      dateStr,
      entrySeed,
      cfg.distance,
      cfg.surface,
      cfg.title.en,
    );
    return {
      id: `${cfg.id}_${cleanDate}`,
      scenarioId: scenario.id,
      title: cfg.title,
      category: cfg.category,
      surface: cfg.surface,
      distance: cfg.distance,
      difficulty: cfg.difficulty,
      estimatedDuration: cfg.distance * 300,
      reward: 100 * cfg.difficulty,
      tags: [cfg.category, `${cfg.distance}K`],
      featured: idx === 0,
      availability: "available",
      scenario,
    };
  });

  return {
    id: cleanDate,
    publishedAt: dateStr,
    title: { en: "Today's Race Board", id: "Papan Balap Hari Ini" },
    entries,
    entryPolicy: {
      maxEntries: 1,
    },
  };
}

/**
 * Backward compatibility fallback. Returns the first entry scenario from the daily board.
 */
export function generateDailyChallenge(dateStr: string): DailyChallenge {
  const board = generateDailyRaceBoard(dateStr);
  return board.entries[0].scenario;
}
