import type {
  CoachBriefing,
  DailyChallenge,
  Elevation,
  LocalizedText,
  RaceAnalysis,
  RaceSegment,
  Surface,
  Weather,
  WeatherTimeline,
  Wind,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

/**
 * Generate a dynamic weather timeline for the race.
 * Weather changes deterministically at distinct checkpoints.
 */
export function generateWeatherTimeline(
  seed: number,
  distance: number,
  baseWeather: Weather,
  baseTemp: number,
  baseHumidity: number,
  baseWind: Wind,
): WeatherTimeline {
  const random = new SeededRandom(seed);

  // Decide checkpoints (in km)
  const checkpoints: number[] = [0];
  if (distance <= 5) {
    checkpoints.push(distance);
  } else if (distance <= 12) {
    checkpoints.push(Math.round(distance / 2), distance);
  } else {
    checkpoints.push(
      Math.round(distance / 3),
      Math.round((2 * distance) / 3),
      distance,
    );
  }

  const temperature: number[] = [];
  const humidity: number[] = [];
  const wind: Wind[] = [];
  const rain: boolean[] = [];
  const visibility: number[] = [];

  for (let i = 0; i < checkpoints.length; i++) {
    // Temperature evolves slightly (e.g. +/- 3 degrees)
    const tempShift = Math.floor(random.nextRange(-3, 4));
    temperature.push(Math.max(0, baseTemp + tempShift));

    // Humidity evolves (e.g. +/- 10%)
    const humShift = Math.floor(random.nextRange(-10, 11));
    humidity.push(Math.max(10, Math.min(100, baseHumidity + humShift)));

    // Wind speed evolves
    const windSpeedShift = Math.floor(random.nextRange(-5, 6));
    const nextWindSpeed = Math.max(0, baseWind.speed + windSpeedShift);
    const windDirections = ["north", "south", "east", "west"] as const;
    const nextWindDir =
      random.next() > 0.7 ? random.pick(windDirections) : baseWind.direction;
    wind.push({ speed: nextWindSpeed, direction: nextWindDir });

    // Rain status
    let isRaining = baseWeather === "rain" || baseWeather === "storm";
    if (baseWeather === "cloudy" && i > 0) {
      // Chance of rain starting mid-race
      isRaining = random.next() > 0.6;
    }
    rain.push(isRaining);

    // Visibility
    let vis = 100;
    if (baseWeather === "fog") vis = 40;
    else if (isRaining) vis = 70;
    if (baseWeather === "storm") vis = 50;
    visibility.push(vis);
  }

  return {
    id: `weather_${seed}`,
    checkpoints,
    temperature,
    humidity,
    wind,
    rain,
    visibility,
  };
}

/**
 * Generate distinct segments of the race, determining modifiers for simulation.
 */
export function generateRaceSegments(
  seed: number,
  distance: number,
  elevation: Elevation,
  surface: Surface,
  baseWeather: Weather,
): RaceSegment[] {
  const random = new SeededRandom(seed);

  // Decide number of segments
  let segmentCount = 3;
  if (distance <= 3) segmentCount = 2;
  else if (distance <= 8) segmentCount = 3;
  else if (distance <= 15) segmentCount = 4;
  else segmentCount = 5;

  // Allocate distances to segments ensuring sum equals total distance
  const segments: RaceSegment[] = [];
  let remainingDistance = distance;

  // Assign segment types based on elevation
  let segmentTypes: ("flat" | "rolling" | "climb" | "descent" | "sprint")[] =
    [];
  if (elevation === "flat") {
    segmentTypes = Array(segmentCount).fill("flat");
    segmentTypes[segmentTypes.length - 1] = "sprint";
  } else if (elevation === "rolling") {
    segmentTypes = ["flat", "rolling", "rolling", "flat", "sprint"].slice(
      0,
      segmentCount,
    ) as ("flat" | "rolling" | "climb" | "descent" | "sprint")[];
  } else {
    // hilly
    segmentTypes = ["climb", "rolling", "descent", "climb", "sprint"].slice(
      0,
      segmentCount,
    ) as ("flat" | "rolling" | "climb" | "descent" | "sprint")[];
  }

  for (let i = 0; i < segmentCount; i++) {
    const isLast = i === segmentCount - 1;
    let segDist = 0;
    if (isLast) {
      segDist = Math.round(remainingDistance * 10) / 10;
    } else {
      const avg = distance / segmentCount;
      segDist =
        Math.round((avg + random.nextRange(-avg * 0.3, avg * 0.3)) * 10) / 10;
      segDist = Math.max(0.5, segDist);
      remainingDistance -= segDist;
    }

    const type = segmentTypes[i];

    // Assign segment elevation matching type
    let segElevation: Elevation = "flat";
    if (type === "rolling") segElevation = "rolling";
    else if (type === "climb" || type === "descent") segElevation = "hilly";

    // Difficulty
    let diff = 2;
    if (type === "climb") diff = 4;
    else if (type === "descent") diff = 3;
    else if (type === "flat") diff = 1;
    else if (type === "sprint") diff = 3;

    segments.push({
      id: `segment_${seed}_${i}`,
      type,
      distance: segDist,
      elevation: segElevation,
      weather: baseWeather,
      terrain: surface,
      difficulty: diff,
      eventWeight: type === "sprint" ? 0.5 : 1.0,
    });
  }

  return segments;
}

/**
 * Generate contextual briefing recommendations & warnings from coach.
 */
export function generateCoachBriefing(
  seed: number,
  distance: number,
  elevation: Elevation,
  surface: Surface,
  weather: Weather,
  temp: number,
): CoachBriefing {
  const recommendations: LocalizedText[] = [];
  const warnings: LocalizedText[] = [];

  // Weather Recommendations
  if (temp >= 30) {
    recommendations.push({
      en: "The intense heat will rapidly drain hydration. Bring extra Electrolytes.",
      id: "Panas terik akan menguras hidrasi dengan cepat. Bawa Elektrolit tambahan.",
    });
    warnings.push({
      en: "Extreme temperature warning. Pace yourself to prevent early exhaustion.",
      id: "Peringatan suhu ekstrem. Atur ritme lari Anda untuk mencegah kelelahan dini.",
    });
  } else if (weather === "rain" || weather === "storm") {
    recommendations.push({
      en: "Rain will compromise traction. Ensure you wear shoes with high grip.",
      id: "Hujan akan mengurangi traksi. Pastikan Anda memakai sepatu dengan cengkeraman tinggi.",
    });
    warnings.push({
      en: "Slippery wet surfaces increase pacing instability and muscle strain.",
      id: "Permukaan basah yang licin meningkatkan ketidakstabilan ritme dan ketegangan otot.",
    });
  } else {
    recommendations.push({
      en: "Optimal weather conditions expected. Aim for a balanced and steady pace.",
      id: "Kondisi cuaca optimal diperkirakan. Targetkan ritme yang seimbang dan stabil.",
    });
  }

  // Surface Recommendations
  if (surface === "trail") {
    recommendations.push({
      en: "Uneven trail trails require strong focus. Run with high ankle stability shoes.",
      id: "Lintasan setapak yang tidak rata membutuhkan fokus kuat. Lari dengan sepatu stabilitas tinggi.",
    });
  } else if (surface === "road") {
    recommendations.push({
      en: "Firm road surfaces allow for high speed. Carbon racers can provide huge pacing boosts.",
      id: "Permukaan jalan raya yang keras mendukung kecepatan tinggi. Sepatu carbon racer dapat memberi dorongan ritme besar.",
    });
  }

  // Elevation Recommendations
  if (elevation === "hilly") {
    recommendations.push({
      en: "Save mental energy and pace defensively during steep early climbs.",
      id: "Hemat energi mental dan lakukan pacing defensif selama tanjakan terjal di awal.",
    });
    warnings.push({
      en: "Steep hills will significantly spike muscle fatigue if pushed too aggressively.",
      id: "Bukit terjal akan meningkatkan kelelahan otot secara signifikan jika dipaksakan terlalu agresif.",
    });
  } else if (elevation === "rolling") {
    recommendations.push({
      en: "Use rolling descents to recover confidence and momentum naturally.",
      id: "Gunakan turunan bukit landai untuk memulihkan kepercayaan diri dan momentum secara alami.",
    });
  }

  // Fallbacks if empty
  if (recommendations.length === 0) {
    recommendations.push({
      en: "Study the course layout and adjust pacing dynamically based on fatigue.",
      id: "Pelajari tata letak lintasan dan sesuaikan ritme secara dinamis berdasarkan kelelahan.",
    });
  }
  if (warnings.length === 0) {
    warnings.push({
      en: "Stay alert for unexpected hazards in the second half of the race.",
      id: "Tetap waspada terhadap bahaya tak terduga di paruh kedua balapan.",
    });
  }

  return {
    id: `coach_${seed}`,
    title: {
      en: "Coach's Pre-Race Briefing",
      id: "Pengarahan Pra-Balap Pelatih",
    },
    summary: {
      en: `A ${distance}K race on ${surface} under ${weather} conditions requires careful tactical balancing.`,
      id: `Balapan ${distance}K di atas ${surface} dalam kondisi ${weather} membutuhkan keseimbangan taktis yang cermat.`,
    },
    recommendations,
    warnings,
  };
}

/**
 * Generate a complete RaceAnalysis object for a Daily Challenge.
 */
export function generateRaceAnalysis(
  challenge: Omit<DailyChallenge, "analysis">,
  seed: number,
): RaceAnalysis {
  const weatherTimeline = generateWeatherTimeline(
    seed,
    challenge.race.distance,
    challenge.environment.weather,
    challenge.environment.temperature,
    challenge.environment.humidity,
    challenge.environment.wind,
  );

  const segments = generateRaceSegments(
    seed,
    challenge.race.distance,
    challenge.race.elevation,
    challenge.race.surface,
    challenge.environment.weather,
  );

  const briefing = generateCoachBriefing(
    seed,
    challenge.race.distance,
    challenge.race.elevation,
    challenge.race.surface,
    challenge.environment.weather,
    challenge.environment.temperature,
  );

  // Determine potential hazards based on conditions
  const hazards: LocalizedText[] = [];
  if (challenge.environment.temperature >= 32) {
    hazards.push({ en: "Severe Heat Exhaustion", id: "Kelelahan Panas Parah" });
  }
  if (challenge.environment.weather === "storm") {
    hazards.push({ en: "Flash Flood Risk", id: "Risiko Banjir Bandang" });
  }
  if (challenge.race.elevation === "hilly") {
    hazards.push({
      en: "Steep Mountain Gradients",
      id: "Kemiringan Gunung Terjal",
    });
  }
  if (
    challenge.race.surface === "trail" &&
    (challenge.environment.weather === "rain" ||
      challenge.environment.weather === "storm")
  ) {
    hazards.push({ en: "Deep Mud Slippage", id: "Licin Lumpur Dalam" });
  }

  if (hazards.length === 0) {
    hazards.push({ en: "None Detected", id: "Tidak Terdeteksi" });
  }

  // Known conditions visible to the strategist
  const knownConditions = [
    "distance",
    "surface",
    "elevation",
    "weather_timeline",
  ];

  // Hidden conditions resolved mid-race
  const hiddenConditions: string[] = [];
  if (challenge.environment.weather === "cloudy") {
    hiddenConditions.push("unexpected_rain");
  }
  if (challenge.environment.wind.speed > 15) {
    hiddenConditions.push("sudden_gale");
  }
  hiddenConditions.push("equipment_malfunction", "muscle_cramping");

  return {
    id: `analysis_${seed}`,
    raceId: challenge.id,
    weather: weatherTimeline,
    elevation: challenge.race.elevation,
    segments,
    hazards,
    briefing,
    knownConditions,
    hiddenConditions,
  };
}
