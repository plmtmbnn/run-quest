import type { Weather, Wind } from "@/types/engine";

export type WeatherEffectCategory =
  | "rain"
  | "snow"
  | "wind"
  | "fog"
  | "heat"
  | "clear";

export interface WeatherParticleConfig {
  category: WeatherEffectCategory;
  maxParticles: number;
  speedYMin: number;
  speedYMax: number;
  speedXMin: number;
  speedXMax: number;
  particleLengthMin: number;
  particleLengthMax: number;
  particleColor: string;
  particleOpacity: number;
  showSplash: boolean;
  showOverlay: boolean;
  overlayGradient: string;
}

export function getWeatherParticleConfig(
  weather: Weather = "sunny",
  temperature: number = 20,
  wind?: Wind,
): WeatherParticleConfig {
  const windSpeed = wind?.speed ?? 5;
  const isHeadwind = wind?.direction === "north" || wind?.direction === "west";
  const windDirX = isHeadwind ? -1 : 1;
  const windForceX = (windSpeed / 30) * windDirX * 80;

  switch (weather) {
    case "rain":
    case "storm": {
      const isStorm = weather === "storm";
      return {
        category: "rain",
        maxParticles: isStorm ? 160 : 110,
        speedYMin: isStorm ? 600 : 400,
        speedYMax: isStorm ? 900 : 650,
        speedXMin: windForceX - 20,
        speedXMax: windForceX + 20,
        particleLengthMin: isStorm ? 18 : 10,
        particleLengthMax: isStorm ? 30 : 20,
        particleColor: isStorm ? "#93c5fd" : "#60a5fa",
        particleOpacity: isStorm ? 0.7 : 0.5,
        showSplash: true,
        showOverlay: true,
        overlayGradient: "from-blue-900/15 via-slate-900/10 to-transparent",
      };
    }
    case "cold": {
      return {
        category: "snow",
        maxParticles: 70,
        speedYMin: 60,
        speedYMax: 140,
        speedXMin: windForceX - 15,
        speedXMax: windForceX + 15,
        particleLengthMin: 3,
        particleLengthMax: 7,
        particleColor: "#ffffff",
        particleOpacity: 0.8,
        showSplash: false,
        showOverlay: true,
        overlayGradient: "from-cyan-900/10 via-slate-800/10 to-transparent",
      };
    }
    case "fog": {
      return {
        category: "fog",
        maxParticles: 25,
        speedYMin: -5,
        speedYMax: 5,
        speedXMin: windForceX * 0.3 - 10,
        speedXMax: windForceX * 0.3 + 10,
        particleLengthMin: 120,
        particleLengthMax: 260,
        particleColor: "#cbd5e1",
        particleOpacity: 0.25,
        showSplash: false,
        showOverlay: true,
        overlayGradient: "from-slate-400/20 via-slate-300/15 to-transparent",
      };
    }
    case "hot": {
      return {
        category: "heat",
        maxParticles: 40,
        speedYMin: -60,
        speedYMax: -20,
        speedXMin: -5,
        speedXMax: 5,
        particleLengthMin: 4,
        particleLengthMax: 12,
        particleColor: "#fde047",
        particleOpacity: 0.35,
        showSplash: false,
        showOverlay: true,
        overlayGradient: "from-amber-500/15 via-orange-500/10 to-transparent",
      };
    }
    default: {
      const hasStrongWind = windSpeed > 15;
      return {
        category: hasStrongWind ? "wind" : "clear",
        maxParticles: hasStrongWind ? 35 : 0,
        speedYMin: 10,
        speedYMax: 40,
        speedXMin: windForceX - 30,
        speedXMax: windForceX + 30,
        particleLengthMin: 6,
        particleLengthMax: 14,
        particleColor: "#a7f3d0",
        particleOpacity: 0.4,
        showSplash: false,
        showOverlay: false,
        overlayGradient: "to-transparent",
      };
    }
  }
}
