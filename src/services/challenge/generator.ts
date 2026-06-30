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
import { generateRaceAnalysis } from "@/engine/intelligence/intelligence-engine";

const ADJECTIVES = [
  { en: "Dawn", id: "Pagi" },
  { en: "Twilight", id: "Senja" },
  { en: "Crimson", id: "Merah Bara" },
  { en: "Misty", id: "Berkabut" },
  { en: "Silent", id: "Sunyi" },
  { en: "Emerald", id: "Zamrud" },
  { en: "Golden", id: "Emas" },
  { en: "Cosmic", id: "Kosmik" },
  { en: "Shadow", id: "Bayangan" },
  { en: "Glacial", id: "Gletser" },
  { en: "Whispering", id: "Berbisik" },
  { en: "Thunder", id: "Guntur" },
];

const LOCATIONS = [
  { en: "Ridge", id: "Punggung Bukit" },
  { en: "Valley", id: "Lembah" },
  { en: "Coast", id: "Pesisir" },
  { en: "Peak", id: "Puncak" },
  { en: "Forest", id: "Hutan" },
  { en: "Stadium", id: "Stadion" },
  { en: "Canyon", id: "Ngarai" },
  { en: "Boulevard", id: "Jalan Layang" },
  { en: "Creek", id: "Sungai" },
  { en: "Highlands", id: "Dataran Tinggi" },
  { en: "Bay", id: "Teluk" },
  { en: "Meadow", id: "Padang Rumput" },
];

const RUN_TYPES = [
  { en: "Sprint", id: "Sprint" },
  { en: "Dash", id: "Lari Cepat" },
  { en: "Tempo", id: "Tempo" },
  { en: "Endurance", id: "Ketahanan" },
  { en: "Escape", id: "Pelarian" },
  { en: "Quest", id: "Misi" },
  { en: "Challenge", id: "Tantangan" },
  { en: "Climb", id: "Pendakian" },
  { en: "Interval", id: "Interval" },
  { en: "Loop", id: "Putaran" },
];

const WEATHER_MAP: Record<Weather, { en: string; id: string }> = {
  sunny: { en: "sunny", id: "cerah" },
  cloudy: { en: "cloudy", id: "berawan" },
  rain: { en: "rainy", id: "hujan" },
  storm: { en: "stormy", id: "badai" },
  hot: { en: "hot", id: "panas" },
  cold: { en: "cold", id: "dingin" },
  fog: { en: "foggy", id: "berkabut" },
};

const ELEVATION_MAP: Record<Elevation, { en: string; id: string }> = {
  flat: { en: "flat", id: "datar" },
  rolling: { en: "rolling hills", id: "bukit landai" },
  hilly: { en: "hilly", id: "berbukit" },
};

const SURFACE_MAP: Record<Surface, { en: string; id: string }> = {
  road: { en: "road", id: "jalan raya" },
  trail: { en: "trail", id: "jalan setapak" },
  track: { en: "track", id: "lintasan lari" },
};

function generateScenarioForEntry(
  dateStr: string,
  seed: number,
  distance: number,
  surface: Surface,
  displayName: { en: string; id: string },
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
    en: `${displayName.en} (${distance}K)`,
    id: `${displayName.id} (${distance}K)`,
  };

  const weatherLabel = WEATHER_MAP[weather];
  const elevationLabel = ELEVATION_MAP[elevation];
  const surfaceLabel = SURFACE_MAP[surface];

  const description = {
    en: `Run a ${distance}km course on a ${elevationLabel.en} ${surfaceLabel.en} under ${weatherLabel.en} conditions. Target: ${Math.floor(
      targetTime / 60,
    )}m ${targetTime % 60}s.`,
    id: `Lari lintasan ${distance}km di atas ${surfaceLabel.id} ${elevationLabel.id} dalam kondisi ${weatherLabel.id}. Target: ${Math.floor(
      targetTime / 60,
    )}m ${targetTime % 60}s.`,
  };

  const scenarioBase: Omit<Scenario, "analysis"> = {
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

  const analysis = generateRaceAnalysis(scenarioBase, seed);

  return {
    ...scenarioBase,
    analysis,
  };
}

export function generateDailyRaceBoard(dateStr: string): DailyRaceBoard {
  const cleanDate = dateStr.replace(/-/g, "");
  const baseSeed = Number.parseInt(cleanDate, 10) || 12345;

  // Helper to generate a unique random localized name
  const generateProceduralName = (seedRandom: SeededRandom) => {
    const adj = seedRandom.pick(ADJECTIVES);
    const loc = seedRandom.pick(LOCATIONS);
    const run = seedRandom.pick(RUN_TYPES);
    return {
      en: `${adj.en} ${loc.en} ${run.en}`,
      id: `${run.id} ${loc.id} ${adj.id}`,
    };
  };

  // Define 4 configs procedurally
  const surfaces: Surface[] = ["road", "trail", "track"];

  const configList = Array.from({ length: 4 }).map((_, idx) => {
    const entrySeed = baseSeed + idx * 1000;
    const entryRandom = new SeededRandom(entrySeed);

    // Ensure slot coverage:
    // Slot 0: Road
    // Slot 1: Trail
    // Slot 2: Track
    // Slot 3: Random wildcard surface
    const surface = idx < 3 ? surfaces[idx] : entryRandom.pick(surfaces);

    // Determine distance based on surface type
    let distance = 5;
    if (surface === "road") {
      // 5K, 10K, or 15K
      distance = entryRandom.pick([5, 10, 15]);
    } else if (surface === "trail") {
      // 8K, 12K, or 20K
      distance = entryRandom.pick([8, 12, 20]);
    } else if (surface === "track") {
      // 1.5K, 3K, or 5K
      distance = entryRandom.pick([1.5, 3, 5]);
    }

    const title = generateProceduralName(entryRandom);

    // Calculate difficulty (1-5 scale) based on distance, surface difficulty, and entry random variation
    let difficultyBase = 1;
    if (distance > 15) difficultyBase = 5;
    else if (distance > 8) difficultyBase = 3;
    else if (distance > 4) difficultyBase = 2;

    if (surface === "trail") difficultyBase += 1;

    const difficulty = Math.min(5, Math.max(1, difficultyBase));

    return {
      id: `procedural_race_${idx}`,
      title,
      category: surface,
      surface,
      distance,
      difficulty,
    };
  });

  const entries: RaceEntry[] = configList.map((cfg, idx) => {
    const entrySeed = baseSeed + idx * 1000;
    const scenario = generateScenarioForEntry(
      dateStr,
      entrySeed,
      cfg.distance,
      cfg.surface,
      cfg.title,
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
