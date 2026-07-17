/**
 * Atmosphere Engine (Sprint 24)
 *
 * Generates immersive atmospheric moments during races.
 */

import type { DailyChallenge, SimulationState } from "@/types/engine";
import type { GameState } from "../timeline/time-types";
import {
  COMPETITOR_INTERACTIONS,
  COMPETITOR_MOMENTS,
  CROWD_MOMENTS,
  ENVIRONMENTAL_MOMENTS,
  INTERNAL_MOMENTS,
  INTERNAL_MONOLOGUES,
  NARRATIVE_BEATS,
} from "./atmosphere-database";
import type {
  AtmosphericConfig,
  AtmosphericMoment,
  AtmosphericState,
  CompetitorMoment,
  CrowdAtmosphere,
  EnvironmentalAtmosphere,
  InternalMonologue,
  NarrativeBeat,
} from "./atmosphere-types";
import { DEFAULT_ATMOSPHERIC_CONFIG } from "./atmosphere-types";

/**
 * Generate atmospheric moments for a specific race situation.
 */
export function generateAtmosphericMoments(
  distance: number,
  totalDistance: number,
  currentPosition: number,
  energy: number,
  pace: "ahead" | "on_target" | "behind",
  pushedBreakingPoint: boolean,
  seed: number,
  config: AtmosphericConfig = DEFAULT_ATMOSPHERIC_CONFIG,
): AtmosphericMoment[] {
  const moments: AtmosphericMoment[] = [];

  const allMoments = [
    ...ENVIRONMENTAL_MOMENTS,
    ...CROWD_MOMENTS,
    ...INTERNAL_MOMENTS,
    ...COMPETITOR_MOMENTS,
  ].filter((m) => config.focusLayers.includes(m.layer));

  for (const moment of allMoments) {
    if (
      shouldTriggerMoment(
        moment,
        distance,
        currentPosition,
        energy,
        pace,
        pushedBreakingPoint,
        seed,
        config,
      )
    ) {
      moments.push(moment);
    }
  }

  const maxMoments =
    config.detailLevel === "cinematic"
      ? 4
      : config.detailLevel === "rich"
        ? 3
        : config.detailLevel === "standard"
          ? 2
          : 1;

  return moments.slice(0, maxMoments);
}

function shouldTriggerMoment(
  moment: AtmosphericMoment,
  distance: number,
  position: number,
  energy: number,
  pace: string,
  pushedBreakingPoint: boolean,
  seed: number,
  config: AtmosphericConfig,
): boolean {
  for (const trigger of moment.triggers) {
    switch (trigger.condition) {
      case "distance":
        if (typeof trigger.value === "number") {
          if (Math.abs(distance - trigger.value) > 1) return false;
        }
        break;
      case "position":
        if (typeof trigger.value === "string") {
          const [min, max] = trigger.value.split("-").map(Number);
          if (position < min || position > max) return false;
        }
        break;
      case "energy":
        if (typeof trigger.value === "string") {
          const match = trigger.value.match(/([<>]=?)(\d+)/);
          if (match) {
            const [, op, threshold] = match;
            const thresholdNum = Number(threshold);
            if (op === "<" && energy >= thresholdNum) return false;
            if (op === ">" && energy <= thresholdNum) return false;
          }
        }
        break;
      case "pace":
        if (trigger.value !== pace) return false;
        break;
      case "breaking_point":
        if (!pushedBreakingPoint) return false;
        break;
      case "random": {
        const roll = ((seed * 9301 + 49297) % 233280) / 233280;
        const probability = (trigger.probability ?? 0.5) * config.frequencyMod;
        if (roll > probability) return false;
        break;
      }
    }
  }
  return true;
}

export function buildAtmosphericState(
  gameState: GameState,
  raceContext: {
    distance: number;
    totalDistance: number;
    position: number;
    energy: number;
    pace: "ahead" | "on_target" | "behind";
    pushedBreakingPoint: boolean;
    locationTier: string;
    raceImportance: "casual" | "competitive" | "championship";
    weather: string;
    timeOfDay:
      | "dawn"
      | "morning"
      | "midday"
      | "afternoon"
      | "evening"
      | "night";
    season: "spring" | "summer" | "fall" | "winter";
  },
  config: AtmosphericConfig = DEFAULT_ATMOSPHERIC_CONFIG,
): AtmosphericState {
  const seed = gameState.seed + gameState.dayIndex;
  const moments = generateAtmosphericMoments(
    raceContext.distance,
    raceContext.totalDistance,
    raceContext.position,
    raceContext.energy,
    raceContext.pace,
    raceContext.pushedBreakingPoint,
    seed,
    config,
  );

  return {
    currentMoments: moments,
    environmentalAtmosphere: {} as EnvironmentalAtmosphere,
    crowdAtmosphere: {} as CrowdAtmosphere,
    narrativeBeats: [],
    immersionLevel: 50,
  };
}

export type { AtmosphericState, AtmosphericMoment, AtmosphericConfig };
export { DEFAULT_ATMOSPHERIC_CONFIG };

export class AtmosphereEngine {
  public generateAtmosphere(
    state: SimulationState,
    challenge: DailyChallenge,
  ): { en: string; id: string } | null {
    const km = Math.floor(state.distanceCovered);
    // Show atmosphere descriptions every 3 kilometers
    if (km === 0 || km % 3 !== 0) {
      return null;
    }

    const weather = challenge.environment.weather;
    const timeOfDay = challenge.environment.timeOfDay;
    const surface = challenge.race.surface;

    let timeStringEn = "The air";
    let timeStringId = "Udara";

    if (timeOfDay === "morning") {
      timeStringEn = "The morning dew sparkles, and the cool air";
      timeStringId = "Embun pagi berkilau, dan udara sejuk";
    } else if (timeOfDay === "afternoon") {
      timeStringEn = "Under the bright high sun, the shimmering air";
      timeStringId = "Di bawah matahari siang yang terik, udara yang berkilau";
    } else if (timeOfDay === "evening") {
      timeStringEn = "The fading twilight glows, and the evening breeze";
      timeStringId = "Senja yang memudar bersinar, dan angin malam";
    }

    let weatherStringEn = "feels calm";
    let weatherStringId = "terasa tenang";

    if (weather === "hot" || weather === "sunny") {
      weatherStringEn = "is thick with intense heat, beating down on you";
      weatherStringId = "terasa tebal dengan panas terik yang membakar";
    } else if (weather === "rain" || weather === "storm") {
      weatherStringEn = "is filled with cold rain, pelting against your face";
      weatherStringId =
        "terasa basah oleh air hujan dingin yang menerpa wajah Anda";
    } else if (weather === "cloudy") {
      weatherStringEn = "is cool and overcast, giving a welcome shade";
      weatherStringId = "terasa sejuk dan mendung, memberikan keteduhan";
    }

    let surfaceStringEn = "along the path.";
    let surfaceStringId = "di sepanjang jalan.";

    if (surface === "road") {
      surfaceStringEn = "as your shoes strike the hard asphalt.";
      surfaceStringId = "saat sepatu Anda membentur jalan aspal keras.";
    } else if (surface === "trail") {
      surfaceStringEn = "as you navigate the uneven dirt and mud trail.";
      surfaceStringId =
        "saat Anda melintasi jalan tanah dan lumpur yang tidak rata.";
    } else if (surface === "track") {
      surfaceStringEn = "as you fly around the synthetic rubber track.";
      surfaceStringId = "saat Anda melaju di atas lintasan karet sintetis.";
    }

    return {
      en: `${timeStringEn} ${weatherStringEn} ${surfaceStringEn}`,
      id: `${timeStringId} ${weatherStringId} ${surfaceStringId}`,
    };
  }
}
