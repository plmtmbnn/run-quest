import type { DailyChallenge, Race, Environment, Checkpoint } from "@/types/engine";
import type { ChampionshipRace } from "./story-types";
import { SeededRandom } from "@/utils/random/seeded-random";

/**
 * Generate a championship race challenge from story chapter data
 */
export function generateChampionshipChallenge(
  championship: ChampionshipRace,
  seed?: string,
): DailyChallenge {
  const rng = new SeededRandom(seed || championship.id);

  // Determine race difficulty parameters
  const difficultySettings = {
    easy: { targetPace: 330, variance: 20, competitorStrength: 0.8 },
    medium: { targetPace: 300, variance: 15, competitorStrength: 0.9 },
    hard: { targetPace: 270, variance: 10, competitorStrength: 1.0 },
    extreme: { targetPace: 240, variance: 5, competitorStrength: 1.1 },
  };

  const settings = difficultySettings[championship.difficulty];
  const targetTime = championship.distance * 1000 * (settings.targetPace / 1000);

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
      direction: rng.choice(["north", "south", "east", "west"] as const),
      speed: rng.nextRange(5, 15),
    },
    timeOfDay: determineTimeOfDay(championship.location),
  };

  return {
    id: championship.id,
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
    championshipData: {
      location: championship.location,
      stakes: championship.stakes,
      rivalLineup: championship.rivalLineup,
      difficulty: championship.difficulty,
      requiredToComplete: championship.requiredToComplete,
    },
  };
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

  return rng.choice(weatherOptions[difficulty]);
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
 * Check if a race is a championship race
 */
export function isChampionshipRace(challenge: DailyChallenge): boolean {
  return (challenge as any).isChampionship === true;
}

/**
 * Get championship data from a challenge
 */
export function getChampionshipData(challenge: DailyChallenge): {
  location: string;
  stakes: { en: string; id: string };
  rivalLineup: string[];
  difficulty: "easy" | "medium" | "hard" | "extreme";
  requiredToComplete: boolean;
} | null {
  return (challenge as any).championshipData || null;
}
