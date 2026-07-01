import type {
  CoachPreview,
  Forecast,
  HiddenCondition,
  RaceAnalysis,
  RaceEntry,
  Scenario,
  TomorrowPreview,
  Weather,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

// List of all valid weather types
const WEATHER_TYPES: Weather[] = [
  "sunny",
  "cloudy",
  "rain",
  "storm",
  "hot",
  "cold",
  "fog",
];

/**
 * Generates a perturbed weather forecast based on the true environment and configurable accuracy.
 */
export function generateForecast(
  seed: number,
  environment: Scenario["environment"],
  accuracy: number,
): Forecast {
  const random = new SeededRandom(seed);

  // accuracy is typically between 0.0 and 1.0. Clamp it just in case.
  const clampedAccuracy = Math.max(0, Math.min(1, accuracy));
  const shouldPerturb = random.next() > clampedAccuracy;

  let forecastedWeather = environment.weather;
  let forecastedTemp = environment.temperature;
  let forecastedHumidity = environment.humidity;

  if (shouldPerturb) {
    // 1. Weather perturbation: choose a random weather that is NOT the true one
    const alternativeWeathers = WEATHER_TYPES.filter(
      (w) => w !== environment.weather,
    );
    forecastedWeather = random.pick(alternativeWeathers);

    // 2. Temperature perturbation (up to +/- 8 degrees based on deviation from accuracy)
    const maxTempDev = Math.round((1 - clampedAccuracy) * 8);
    const tempDev = Math.round(random.nextRange(-maxTempDev, maxTempDev + 1));
    forecastedTemp = Math.max(
      -5,
      Math.min(50, environment.temperature + tempDev),
    );

    // 3. Humidity perturbation (up to +/- 30% based on deviation from accuracy)
    const maxHumDev = Math.round((1 - clampedAccuracy) * 30);
    const humDev = Math.round(random.nextRange(-maxHumDev, maxHumDev + 1));
    forecastedHumidity = Math.max(
      0,
      Math.min(100, environment.humidity + humDev),
    );
  }

  // Calculate rain probability based on forecasted conditions
  let rainProbability = 0;
  if (forecastedWeather === "rain") {
    rainProbability = Math.round(random.nextRange(60, 90));
  } else if (forecastedWeather === "storm") {
    rainProbability = Math.round(random.nextRange(85, 100));
  } else if (forecastedWeather === "cloudy") {
    rainProbability = Math.round(random.nextRange(15, 45));
  } else if (forecastedWeather === "fog") {
    rainProbability = Math.round(random.nextRange(10, 30));
  } else {
    rainProbability = Math.round(random.nextRange(0, 10));
  }

  // Calculate wind probability based on actual wind speed
  let windProbability = 0;
  const trueWindSpeed = environment.wind.speed;
  if (trueWindSpeed > 20) {
    windProbability = Math.round(random.nextRange(70, 95));
  } else if (trueWindSpeed > 10) {
    windProbability = Math.round(random.nextRange(40, 70));
  } else {
    windProbability = Math.round(random.nextRange(5, 30));
  }

  // If perturbed, we may also perturb the probabilities slightly
  if (shouldPerturb) {
    rainProbability = Math.max(
      0,
      Math.min(100, rainProbability + Math.round(random.nextRange(-15, 16))),
    );
    windProbability = Math.max(
      0,
      Math.min(100, windProbability + Math.round(random.nextRange(-15, 16))),
    );
  }

  return {
    weather: forecastedWeather,
    temperature: forecastedTemp,
    humidity: forecastedHumidity,
    rainProbability,
    windProbability,
    confidence: Math.round(clampedAccuracy * 100),
  };
}

/**
 * Generates HiddenCondition list based on the scenario analysis.
 */
export function generateHiddenConditions(
  seed: number,
  analysis: RaceAnalysis,
): HiddenCondition[] {
  const random = new SeededRandom(seed);
  const hidden: HiddenCondition[] = [];

  // 1. Hazards from analysis (e.g. "Severe Heat Exhaustion")
  if (analysis.hazards && analysis.hazards.length > 0) {
    analysis.hazards.forEach((hazard, idx) => {
      if (hazard.en !== "None Detected" && hazard.en !== "None") {
        const triggers = [
          "mid_race",
          "start_line",
          "climb_segment",
          "descent_segment",
        ];
        hidden.push({
          id: `hazard_${idx}_${seed}`,
          category: "hazard",
          visibility: "hidden",
          revealTrigger: random.pick(triggers),
        });
      }
    });
  }

  // 2. Hidden conditions from analysis
  if (analysis.hiddenConditions && analysis.hiddenConditions.length > 0) {
    analysis.hiddenConditions.forEach((_, idx) => {
      const triggers = [
        "weather_shift",
        "stamina_low",
        "pacing_change",
        "checkpoint",
      ];
      hidden.push({
        id: `cond_${idx}_${seed}`,
        category: "condition",
        visibility: "hidden",
        revealTrigger: random.pick(triggers),
      });
    });
  }

  // Fallback if none are generated
  if (hidden.length === 0) {
    hidden.push({
      id: `generic_event_${seed}`,
      category: "event",
      visibility: "hidden",
      revealTrigger: "checkpoint",
    });
  }

  return hidden;
}

/**
 * Generates a contextual coach preview based on tomorrow's race details and forecast.
 */
export function generateCoachPreview(
  seed: number,
  scenario: Scenario,
  forecast: Forecast,
): CoachPreview {
  const random = new SeededRandom(seed);
  const distance = scenario.race.distance;
  const surface = scenario.race.surface;
  const elevation = scenario.race.elevation;

  interface MessageOption {
    title: { en: string; id: string };
    summary: { en: string; id: string };
    recommendation: { en: string; id: string };
  }

  const pool: MessageOption[] = [];

  // Distance based warnings
  if (distance >= 15) {
    pool.push({
      title: { en: "Endurance Warning", id: "Peringatan Ketahanan" },
      summary: {
        en: "Tomorrow's long course will severely test your pacing discipline.",
        id: "Lintasan panjang besok akan sangat menguji disiplin ritme Anda.",
      },
      recommendation: {
        en: "The second half of tomorrow's race may become much more demanding.",
        id: "Paruh kedua balapan besok mungkin menjadi jauh lebih menuntut.",
      },
    });
  }

  // Elevation based warnings
  if (elevation === "hilly") {
    pool.push({
      title: { en: "Hilly Terrain Ahead", id: "Medan Berbukit Menanti" },
      summary: {
        en: "Elevations indicate significant climbs throughout the course.",
        id: "Elevasi menunjukkan tanjakan signifikan di sepanjang lintasan.",
      },
      recommendation: {
        en: "I expect several tactical opportunities tomorrow. Save energy for the hills.",
        id: "Saya memperkirakan beberapa peluang taktis besok. Hemat energi untuk bukit.",
      },
    });
  }

  // Weather based warnings
  if (forecast.weather === "rain" || forecast.weather === "storm") {
    pool.push({
      title: {
        en: "Unstable Weather Forecast",
        id: "Perkiraan Cuaca Tidak Stabil",
      },
      summary: {
        en: "Precipitation probability is elevated for tomorrow's race.",
        id: "Probabilitas curah hujan tinggi untuk balapan besok.",
      },
      recommendation: {
        en: "Weather conditions appear unstable. Prepare appropriate wet-weather footwear.",
        id: "Kondisi cuaca tampak tidak stabil. Siapkan sepatu cuaca basah yang sesuai.",
      },
    });
  }

  if (forecast.weather === "hot" || forecast.temperature >= 30) {
    pool.push({
      title: { en: "Heat Management Advice", id: "Saran Pengelolaan Panas" },
      summary: {
        en: "High temperatures are forecasted. Hydration rates will be critical.",
        id: "Suhu tinggi diperkirakan. Tingkat hidrasi akan sangat penting.",
      },
      recommendation: {
        en: "Consider bringing additional hydration and electrolytes tomorrow.",
        id: "Pertimbangkan untuk membawa hidrasi dan elektrolit tambahan besok.",
      },
    });
  }

  // Surface based warning
  if (surface === "trail") {
    pool.push({
      title: { en: "Trail Surface Notes", id: "Catatan Permukaan Lintasan" },
      summary: {
        en: "Trail courses have uneven terrain that changes with the weather.",
        id: "Lintasan alam memiliki medan tidak rata yang berubah seiring cuaca.",
      },
      recommendation: {
        en: "Several course conditions are still being assessed. Focus on stability.",
        id: "Beberapa kondisi lintasan masih dinilai. Fokus pada stabilitas.",
      },
    });
  }

  // Suspenseful coach previews / Generic ones
  pool.push({
    title: {
      en: "Coach's Strategic Preview",
      id: "Pratinjau Strategis Pelatih",
    },
    summary: {
      en: "The race organizers are finalizing the course details.",
      id: "Penyelenggara balapan sedang memfinalisasi detail lintasan.",
    },
    recommendation: {
      en: "Officials have not finalized tomorrow's race briefing. Stay flexible.",
      id: "Panitia belum menyelesaikan pengarahan balapan besok. Tetap fleksibel.",
    },
  });

  pool.push({
    title: {
      en: "Pre-Race Briefing Update",
      id: "Pembaruan Pengarahan Pra-Balap",
    },
    summary: {
      en: "Tomorrow's environmental factors remain highly dynamic.",
      id: "Faktor lingkungan besok tetap sangat dinamis.",
    },
    recommendation: {
      en: "Weather conditions remain uncertain. Keep an eye on the morning update.",
      id: "Kondisi cuaca tetap tidak pasti. Pantau pembaruan pagi hari.",
    },
  });

  const chosen = random.pick(pool);
  return chosen;
}

/**
 * Creates the TomorrowPreview.
 */
export function generateTomorrowPreview(
  seed: number,
  scenario: Scenario,
  analysis: RaceAnalysis,
  forecastAccuracy: number,
  category: RaceEntry["category"],
  difficulty: number,
): TomorrowPreview {
  const forecast = generateForecast(
    seed,
    scenario.environment,
    forecastAccuracy,
  );
  const hiddenConditions = generateHiddenConditions(seed, analysis);
  const coachPreview = generateCoachPreview(seed, scenario, forecast);

  // knownConditions: list of general properties known by default in tomorrow preview
  const knownConditions = ["distance", "surface", "elevation", "forecast"];

  return {
    id: `preview_${scenario.id}_${seed}`,
    raceId: scenario.id,
    category,
    distance: scenario.race.distance,
    surface: scenario.race.surface,
    difficulty,
    forecast,
    knownConditions,
    hiddenConditions,
    coachPreview,
  };
}
