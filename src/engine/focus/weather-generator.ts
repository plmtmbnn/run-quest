import type { Environment, Weather } from "@/types/engine";

/**
 * Dynamic Weather and Environment Generation
 * Creates varied race conditions for replayability
 */

export interface WeatherCondition {
  weather: Weather;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  performanceImpact: {
    paceModifier: number; // 0.95 = 5% faster, 1.05 = 5% slower
    fatigueModifier: number;
    hydrationModifier: number;
  };
}

export interface CourseProfile {
  name: string;
  elevation: "flat" | "rolling" | "hilly" | "mountainous";
  surface: "road" | "track" | "trail" | "mixed";
  description: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  performanceImpact: {
    paceModifier: number;
    technicalDifficulty: number; // 0-1 scale
  };
}

const WEATHER_CONDITIONS: Record<Weather, WeatherCondition> = {
  sunny: {
    weather: "sunny",
    description: "Clear skies, perfect racing weather",
    difficulty: "easy",
    performanceImpact: {
      paceModifier: 1.0,
      fatigueModifier: 1.0,
      hydrationModifier: 1.1,
    },
  },
  cloudy: {
    weather: "cloudy",
    description: "Overcast skies, ideal conditions",
    difficulty: "easy",
    performanceImpact: {
      paceModifier: 0.98, // Slightly faster (cooler)
      fatigueModifier: 0.95,
      hydrationModifier: 1.0,
    },
  },
  rain: {
    weather: "rain",
    description: "Light rain, slippery conditions",
    difficulty: "medium",
    performanceImpact: {
      paceModifier: 1.03,
      fatigueModifier: 1.1,
      hydrationModifier: 0.9,
    },
  },
  storm: {
    weather: "storm",
    description: "Heavy rain and wind, brutal conditions",
    difficulty: "extreme",
    performanceImpact: {
      paceModifier: 1.12,
      fatigueModifier: 1.25,
      hydrationModifier: 0.8,
    },
  },
  hot: {
    weather: "hot",
    description: "High heat and humidity, challenging",
    difficulty: "hard",
    performanceImpact: {
      paceModifier: 1.08,
      fatigueModifier: 1.2,
      hydrationModifier: 1.5,
    },
  },
  cold: {
    weather: "cold",
    description: "Cold temperatures, need to warm up",
    difficulty: "medium",
    performanceImpact: {
      paceModifier: 1.02,
      fatigueModifier: 1.05,
      hydrationModifier: 0.95,
    },
  },
  fog: {
    weather: "fog",
    description: "Dense fog, limited visibility",
    difficulty: "medium",
    performanceImpact: {
      paceModifier: 1.04,
      fatigueModifier: 1.08,
      hydrationModifier: 1.0,
    },
  },
};

const COURSE_PROFILES: CourseProfile[] = [
  {
    name: "City Streets",
    elevation: "flat",
    surface: "road",
    description: "Fast, flat urban course with wide roads",
    difficulty: "easy",
    performanceImpact: {
      paceModifier: 0.98,
      technicalDifficulty: 0.2,
    },
  },
  {
    name: "Park Loop",
    elevation: "rolling",
    surface: "road",
    description: "Scenic park with gentle hills",
    difficulty: "medium",
    performanceImpact: {
      paceModifier: 1.02,
      technicalDifficulty: 0.4,
    },
  },
  {
    name: "Coastal Path",
    elevation: "rolling",
    surface: "road",
    description: "Oceanside route with sea breeze",
    difficulty: "medium",
    performanceImpact: {
      paceModifier: 1.03,
      technicalDifficulty: 0.3,
    },
  },
  {
    name: "Hill Challenge",
    elevation: "hilly",
    surface: "road",
    description: "Challenging terrain with steep climbs",
    difficulty: "hard",
    performanceImpact: {
      paceModifier: 1.15,
      technicalDifficulty: 0.7,
    },
  },
  {
    name: "Forest Trail",
    elevation: "rolling",
    surface: "trail",
    description: "Technical trail through forest",
    difficulty: "hard",
    performanceImpact: {
      paceModifier: 1.12,
      technicalDifficulty: 0.8,
    },
  },
  {
    name: "Mountain Pass",
    elevation: "mountainous",
    surface: "trail",
    description: "Extreme elevation gain, rocky terrain",
    difficulty: "extreme",
    performanceImpact: {
      paceModifier: 1.25,
      technicalDifficulty: 0.9,
    },
  },
];

/**
 * Generate random weather conditions
 */
export function generateWeather(
  seasonalBias?: "spring" | "summer" | "fall" | "winter",
): Environment {
  let weatherOptions: Weather[] = ["sunny", "cloudy", "rain"];

  // Adjust weather probabilities based on season
  if (seasonalBias === "summer") {
    weatherOptions = ["sunny", "sunny", "hot", "cloudy"];
  } else if (seasonalBias === "winter") {
    weatherOptions = ["cold", "cloudy", "rain", "fog"];
  } else if (seasonalBias === "spring" || seasonalBias === "fall") {
    weatherOptions = ["cloudy", "rain", "sunny"];
  }

  const weather =
    weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

  // Generate temperature based on weather
  const tempRanges = {
    sunny: { min: 18, max: 25 },
    cloudy: { min: 15, max: 22 },
    rain: { min: 12, max: 18 },
    storm: { min: 10, max: 16 },
    hot: { min: 28, max: 35 },
    cold: { min: 2, max: 10 },
    fog: { min: 8, max: 15 },
  };

  const range = tempRanges[weather];
  const temperature =
    Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  // Generate humidity
  const humidity =
    weather === "hot" ? 60 + Math.random() * 30 : 40 + Math.random() * 40;

  // Generate wind
  const windSpeeds = {
    sunny: { min: 0, max: 15 },
    cloudy: { min: 5, max: 20 },
    rain: { min: 10, max: 25 },
    storm: { min: 25, max: 50 },
    hot: { min: 0, max: 10 },
    cold: { min: 10, max: 30 },
    fog: { min: 0, max: 10 },
  };

  const windRange = windSpeeds[weather];
  const windSpeed =
    Math.floor(Math.random() * (windRange.max - windRange.min + 1)) +
    windRange.min;

  const directions: Array<"north" | "south" | "east" | "west"> = [
    "north",
    "south",
    "east",
    "west",
  ];
  const windDirection =
    directions[Math.floor(Math.random() * directions.length)];

  const timeOptions: Array<"morning" | "afternoon" | "evening" | "night"> = [
    "morning",
    "afternoon",
    "evening",
  ];
  const timeOfDay = timeOptions[Math.floor(Math.random() * timeOptions.length)];

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
 * Get random course profile
 */
export function generateCourse(
  difficultyPreference?: "easy" | "medium" | "hard" | "extreme",
): CourseProfile {
  let courses = COURSE_PROFILES;

  if (difficultyPreference) {
    courses = COURSE_PROFILES.filter(
      (c) => c.difficulty === difficultyPreference,
    );
    if (courses.length === 0) courses = COURSE_PROFILES; // Fallback
  }

  return courses[Math.floor(Math.random() * courses.length)];
}

/**
 * Get weather condition details
 */
export function getWeatherCondition(weather: Weather): WeatherCondition {
  return WEATHER_CONDITIONS[weather];
}

/**
 * Calculate combined performance impact from weather and course
 */
export function calculateEnvironmentImpact(
  weather: Weather,
  course: CourseProfile,
): {
  totalPaceModifier: number;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
} {
  const weatherCondition = WEATHER_CONDITIONS[weather];
  const weatherImpact = weatherCondition.performanceImpact.paceModifier;
  const courseImpact = course.performanceImpact.paceModifier;

  const totalPaceModifier = weatherImpact * courseImpact;

  // Determine overall difficulty
  const difficultyScores = {
    easy: 1,
    medium: 2,
    hard: 3,
    extreme: 4,
  };

  const avgDifficulty =
    (difficultyScores[weatherCondition.difficulty] +
      difficultyScores[course.difficulty]) /
    2;
  let difficulty: "easy" | "medium" | "hard" | "extreme";

  if (avgDifficulty <= 1.5) difficulty = "easy";
  else if (avgDifficulty <= 2.5) difficulty = "medium";
  else if (avgDifficulty <= 3.5) difficulty = "hard";
  else difficulty = "extreme";

  const description = `${course.description} with ${weatherCondition.description.toLowerCase()}`;

  return {
    totalPaceModifier,
    description,
    difficulty,
  };
}
