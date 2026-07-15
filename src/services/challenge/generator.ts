import { generateRaceAnalysis } from "@/engine/intelligence/intelligence-engine";
import type {
  Checkpoint,
  DailyChallenge,
  DailyRaceBoard,
  DailyTheme,
  Elevation,
  RaceEntry,
  Scenario,
  Surface,
  Weather,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

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

export const DAILY_THEMES: DailyTheme[] = [
  {
    id: "monsoon",
    name: { en: "Monsoon Season ⛈️", id: "Musim Monsun ⛈️" },
    description: {
      en: "The skies are dark. High chances of rain and storm. Double rewards for all finishers!",
      id: "Langit gelap. Peluang tinggi hujan dan badai. Hadiah ganda untuk semua finisher!",
    },
    weatherOverride: "rain",
    rewardMultiplier: 2.0,
  },
  {
    id: "heatwave",
    name: { en: "Heatwave Challenge ☀️", id: "Tantangan Gelombang Panas ☀️" },
    description: {
      en: "Scorching sun and high temperatures. Hydration is key! 1.5x rewards today.",
      id: "Terik matahari dan suhu tinggi. Hidrasi adalah kunci! Hadiah 1.5x hari ini.",
    },
    weatherOverride: "hot",
    rewardMultiplier: 1.5,
  },
  {
    id: "misty_morning",
    name: { en: "Misty Morning 🌫️", id: "Pagi Berkabut 🌫️" },
    description: {
      en: "Thick fog covers the course. Focus is crucial to navigate safely. 1.3x rewards.",
      id: "Kabut tebal menyelimuti lintasan. Fokus sangat penting untuk navigasi dengan aman. Hadiah 1.3x.",
    },
    weatherOverride: "fog",
    rewardMultiplier: 1.3,
  },
  {
    id: "altitude_camp",
    name: { en: "Altitude Camp 🏔️", id: "Kamp Dataran Tinggi 🏔️" },
    description: {
      en: "All races are hilly. Prepare your muscles for tough climbs. 1.6x rewards.",
      id: "Semua perlombaan berbukit. Persiapkan otot Anda untuk tanjakan sulit. Hadiah 1.6x.",
    },
    elevationOverride: "hilly",
    rewardMultiplier: 1.6,
  },
  {
    id: "night_run",
    name: { en: "Midnight Madness 🌙", id: "Kegilaan Tengah Malam 🌙" },
    description: {
      en: "Night races under the stars. Focus decays faster, but the air is cool. 1.4x rewards.",
      id: "Lari malam di bawah bintang-bintang. Fokus berkurang lebih cepat, tapi udara sejuk. Hadiah 1.4x.",
    },
    rewardMultiplier: 1.4,
  },
  {
    id: "perfect_day",
    name: { en: "Perfect Running Day 🏃‍♂️", id: "Hari Lari Sempurna 🏃‍♂️" },
    description: {
      en: "Clear skies and mild temperatures. Great day to set a personal record!",
      id: "Langit cerah dan suhu sedang. Hari yang luar biasa untuk mencetak rekor pribadi!",
    },
    weatherOverride: "sunny",
    rewardMultiplier: 1.1,
  },
];

interface Rarity {
  id: "common" | "rare" | "epic" | "legendary";
  prefix: { en: string; id: string };
  rewardMultiplier: number;
}

const RARITIES: Rarity[] = [
  { id: "common", prefix: { en: "", id: "" }, rewardMultiplier: 1.0 },
  {
    id: "rare",
    prefix: { en: "✨ [RARE] ", id: "✨ [LANGKA] " },
    rewardMultiplier: 1.5,
  },
  {
    id: "epic",
    prefix: { en: "🔥 [EPIC] ", id: "🔥 [EPIK] " },
    rewardMultiplier: 2.5,
  },
  {
    id: "legendary",
    prefix: { en: "🏆 [LEGENDARY] ", id: "🏆 [LEGENDA] " },
    rewardMultiplier: 4.0,
  },
];

function generateScenarioForEntry(
  dateStr: string,
  seed: number,
  distance: number,
  surface: Surface,
  displayName: { en: string; id: string },
  dailyTheme?: DailyTheme,
): Scenario {
  const random = new SeededRandom(seed);

  // 1. Course details (themed)
  const elevations: Elevation[] = ["flat", "rolling", "hilly"];
  let elevation = dailyTheme?.elevationOverride ?? random.pick(elevations);
  if (dailyTheme?.id === "altitude_camp") {
    elevation = random.pick(["rolling", "hilly"]);
  }

  // 2. Weather (themed)
  const weathers: Weather[] = [
    "sunny",
    "cloudy",
    "rain",
    "storm",
    "hot",
    "cold",
    "fog",
  ];
  let weather = dailyTheme?.weatherOverride ?? random.pick(weathers);
  if (dailyTheme?.id === "monsoon") {
    weather = random.pick(["rain", "storm"]);
  }

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
  const timeOfDay =
    dailyTheme?.id === "night_run" ? "evening" : random.pick(timesOfDay);

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

  // 5. Procedural Bonus Objective
  const bonusObjectives = [
    {
      en: "Finish with focus above 50%",
      id: "Selesaikan dengan fokus di atas 50%",
    },
    {
      en: "Finish with hydration above 40%",
      id: "Selesaikan dengan hidrasi di atas 40%",
    },
    {
      en: "Finish with energy above 30%",
      id: "Selesaikan dengan energi di atas 30%",
    },
    {
      en: "Beat target time by 15 seconds",
      id: "Kalahkan target waktu sebanyak 15 detik",
    },
    {
      en: "Maintain steady pacing strategy",
      id: "Pertahankan strategi lari stabil",
    },
  ];
  const bonusIndex = Math.floor(random.nextRange(0, bonusObjectives.length));
  const bonusObjectiveText = bonusObjectives[bonusIndex];
  const bonusCondition = `${bonusObjectiveText.en} | ${bonusObjectiveText.id}`;

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
      bonusCondition,
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

export function generateDailyRaceBoard(
  dateSeed: string | number,
): DailyRaceBoard {
  const dateStr = dateSeed.toString();
  const cleanDate = dateStr.replace(/-/g, "");
  const baseSeed =
    typeof dateSeed === "number"
      ? dateSeed
      : Number.parseInt(cleanDate, 10) || 12345;
  const boardRandom = new SeededRandom(baseSeed);

  // Pick Daily Theme based on board seed
  const themeIndex = Math.floor(boardRandom.nextRange(0, DAILY_THEMES.length));
  const dailyTheme = DAILY_THEMES[themeIndex];

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
    const surface = idx < 3 ? surfaces[idx] : entryRandom.pick(surfaces);

    // Determine distance based on surface type
    let distance = 5;
    if (surface === "road") {
      distance = entryRandom.pick([5, 10, 15]);
    } else if (surface === "trail") {
      distance = entryRandom.pick([8, 12, 20]);
    } else if (surface === "track") {
      distance = entryRandom.pick([1.5, 3, 5]);
    }

    const proceduralName = generateProceduralName(entryRandom);

    // Rarity rolls
    let rarity = RARITIES[0]; // Common default
    const roll = entryRandom.nextRange(0, 100);
    if (idx === 0) {
      if (roll < 20) rarity = RARITIES[1]; // 20% Rare
    } else if (idx === 1) {
      if (roll < 30) rarity = RARITIES[1]; // 30% Rare
    } else if (idx === 2) {
      if (roll < 15)
        rarity = RARITIES[2]; // 15% Epic, 35% Rare
      else if (roll < 50) rarity = RARITIES[1];
    } else if (idx === 3) {
      if (roll < 5)
        rarity = RARITIES[3]; // 5% Legendary, 15% Epic, 30% Rare
      else if (roll < 20) rarity = RARITIES[2];
      else if (roll < 50) rarity = RARITIES[1];
    }

    const title = {
      en: `${rarity.prefix.en}${proceduralName.en}`,
      id: `${rarity.prefix.id}${proceduralName.id}`,
    };

    // Calculate difficulty (1-5 scale)
    let difficultyBase = 1;
    if (distance > 15) difficultyBase = 5;
    else if (distance > 8) difficultyBase = 3;
    else if (distance > 4) difficultyBase = 2;

    if (surface === "trail") difficultyBase += 1;

    // Rarity increases difficulty slightly
    if (rarity.id === "epic") difficultyBase += 1;
    else if (rarity.id === "legendary") difficultyBase += 2;

    const difficulty = Math.min(5, Math.max(1, difficultyBase));

    return {
      id: `procedural_race_${idx}`,
      title,
      category: surface,
      surface,
      distance,
      difficulty,
      rarity,
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
      dailyTheme,
    );

    // Calculate scaled rewards
    const baseReward = 100 * cfg.difficulty;
    const reward = Math.round(
      baseReward * cfg.rarity.rewardMultiplier * dailyTheme.rewardMultiplier,
    );

    // Tags
    const tags = [cfg.category, `${cfg.distance}K`].concat(
      cfg.rarity.id !== "common" ? [cfg.rarity.id.toUpperCase()] : [],
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
      reward,
      tags,
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
    theme: dailyTheme,
  };
}

/**
 * Backward compatibility fallback. Returns the first entry scenario from the daily board.
 */
export function generateDailyChallenge(dateStr: string): DailyChallenge {
  const board = generateDailyRaceBoard(dateStr);
  return board.entries[0].scenario;
}
