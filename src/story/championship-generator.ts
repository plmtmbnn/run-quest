import type {
  Checkpoint,
  Environment,
  Objective,
  Race,
  Scenario,
  StorySeed,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";
import type { ChampionshipRace } from "./story-types";

/**
 * Extended scenario type for championship races
 */
export interface ChampionshipScenario extends Scenario {
  isChampionship: true;
  championshipData: {
    location: string;
    stakes: { en: string; id: string };
    rivalLineup: string[];
    difficulty: "easy" | "medium" | "hard" | "extreme";
    requiredToComplete: boolean;
  };
}

/**
 * Generate a championship race scenario from story chapter data
 */
export function generateChampionshipChallenge(
  championship: ChampionshipRace,
  seed?: string,
): ChampionshipScenario {
  // Convert string seed to number using hash
  const seedNumber = seed
    ? seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : championship.id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const rng = new SeededRandom(seedNumber);

  // Determine race difficulty parameters
  const difficultySettings = {
    easy: { targetPace: 330, variance: 20, competitorStrength: 0.8 },
    medium: { targetPace: 300, variance: 15, competitorStrength: 0.9 },
    hard: { targetPace: 270, variance: 10, competitorStrength: 1.0 },
    extreme: { targetPace: 240, variance: 5, competitorStrength: 1.1 },
  };

  const settings = difficultySettings[championship.difficulty];
  const targetTime =
    championship.distance * 1000 * (settings.targetPace / 1000);

  // Create race object
  const race: Race = {
    title: championship.title,
    description: championship.description,
    distance: championship.distance,
    surface: determineSurface(championship.location),
    elevation: determineElevation(championship.difficulty),
    checkpoints: generateCheckpoints(championship.distance),
  };

  // Create environment based on difficulty
  const environment: Environment = {
    weather: determineWeather(championship.difficulty, rng),
    temperature: rng.nextRange(15, 28),
    humidity: rng.nextRange(40, 70),
    wind: {
      direction: rng.pick(["north", "south", "east", "west"] as const),
      speed: rng.nextRange(5, 15),
    },
    timeOfDay: determineTimeOfDay(championship.location),
  };

  const tier: "regional" | "state" | "national" | "international" =
    championship.difficulty === "easy"
      ? "regional"
      : championship.difficulty === "medium"
        ? "state"
        : championship.difficulty === "hard"
          ? "national"
          : "international";

  const entryFee =
    championship.difficulty === "easy"
      ? 150
      : championship.difficulty === "medium"
        ? 400
        : championship.difficulty === "hard"
          ? 1000
          : 2500;

  const scenario: ChampionshipScenario = {
    id: championship.id,
    date: String(seedNumber),
    race,
    environment,
    objective: {
      targetTime,
      bonusCondition: "gold_medal",
    },
    storySeed: {
      mood: championship.difficulty === "extreme" ? "tense" : "competitive",
    },
    isChampionship: true,
    tier,
    entryFee,
    scheduleId: championship.id,
    championshipData: {
      location: championship.location,
      stakes: championship.stakes,
      rivalLineup: championship.rivalLineup,
      difficulty: championship.difficulty,
      requiredToComplete: championship.requiredToComplete,
    },
  };

  return scenario;
}

/**
 * Determine surface based on location
 */
function determineSurface(location: string): "road" | "track" | "trail" {
  const lower = location.toLowerCase();
  if (lower.includes("stadium") || lower.includes("track")) {
    return "track";
  }
  if (
    lower.includes("trail") ||
    lower.includes("mountain") ||
    lower.includes("forest")
  ) {
    return "trail";
  }
  return "road";
}

/**
 * Determine elevation based on difficulty
 */
function determineElevation(
  difficulty: "easy" | "medium" | "hard" | "extreme",
): "flat" | "rolling" | "hilly" {
  switch (difficulty) {
    case "easy":
      return "flat";
    case "medium":
      return "rolling";
    case "hard":
    case "extreme":
      return "hilly";
  }
}

/**
 * Determine weather based on difficulty
 */
function determineWeather(
  difficulty: "easy" | "medium" | "hard" | "extreme",
  rng: SeededRandom,
): "sunny" | "cloudy" | "rain" | "hot" | "cold" | "fog" | "storm" {
  const weatherOptions = {
    easy: ["sunny", "cloudy"] as const,
    medium: ["sunny", "cloudy", "hot"] as const,
    hard: ["cloudy", "rain", "hot", "cold"] as const,
    extreme: ["rain", "hot", "cold", "storm", "fog"] as const,
  };

  return rng.pick(weatherOptions[difficulty]);
}

/**
 * Determine time of day based on location
 */
function determineTimeOfDay(
  location: string,
): "morning" | "afternoon" | "evening" {
  const lower = location.toLowerCase();
  if (lower.includes("olympic") || lower.includes("national")) {
    return "afternoon"; // Prime time
  }
  if (lower.includes("local") || lower.includes("regional")) {
    return "morning";
  }
  return "morning";
}

/**
 * Generate checkpoints for a race distance
 */
function generateCheckpoints(distance: number): Checkpoint[] {
  const checkpoints: Checkpoint[] = [];
  const interval = distance <= 10 ? 1 : distance <= 21 ? 2 : 5;

  for (let km = interval; km < distance; km += interval) {
    checkpoints.push({
      km,
      eventPool: [
        "pace_check",
        "hydration_reminder",
        "rival_encounter",
        "mental_check",
      ],
    });
  }

  return checkpoints;
}

/**
 * Check if a scenario is a championship race
 */
export function isChampionshipRace(
  scenario: Scenario,
): scenario is ChampionshipScenario {
  return (scenario as ChampionshipScenario).isChampionship === true;
}

/**
 * Get championship data from a scenario
 */
export function getChampionshipData(scenario: Scenario): {
  location: string;
  stakes: { en: string; id: string };
  rivalLineup: string[];
  difficulty: "easy" | "medium" | "hard" | "extreme";
  requiredToComplete: boolean;
} | null {
  if (isChampionshipRace(scenario)) {
    return scenario.championshipData;
  }
  return null;
}
