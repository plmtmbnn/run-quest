import type { DailyChallenge, SimulationState } from "@/types/engine";

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
