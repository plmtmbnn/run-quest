import { describe, expect, it } from "vitest";
import { getWeatherParticleConfig } from "@/engine/weather/weather-particle-params";

describe("Weather Particle Params Engine", () => {
  it("generates rain particle config", () => {
    const config = getWeatherParticleConfig("rain", 18);
    expect(config.category).toBe("rain");
    expect(config.maxParticles).toBe(110);
    expect(config.showSplash).toBe(true);
    expect(config.showOverlay).toBe(true);
  });

  it("generates storm particle config with higher intensity", () => {
    const config = getWeatherParticleConfig("storm", 16);
    expect(config.category).toBe("rain");
    expect(config.maxParticles).toBe(160);
    expect(config.speedYMin).toBeGreaterThan(500);
  });

  it("generates snow particle config", () => {
    const config = getWeatherParticleConfig("cold", -2);
    expect(config.category).toBe("snow");
    expect(config.maxParticles).toBe(70);
    expect(config.showSplash).toBe(false);
  });

  it("generates fog particle config", () => {
    const config = getWeatherParticleConfig("fog", 12);
    expect(config.category).toBe("fog");
    expect(config.particleLengthMin).toBeGreaterThan(100);
  });

  it("generates heat particle config", () => {
    const config = getWeatherParticleConfig("hot", 35);
    expect(config.category).toBe("heat");
    expect(config.speedYMin).toBeLessThan(0); // Upward rising particles
  });

  it("calculates wind force offset on particles", () => {
    const windWest = { direction: "west" as const, speed: 25 };
    const config = getWeatherParticleConfig("rain", 15, windWest);
    expect(config.speedXMin).toBeLessThan(0); // Negative X wind push
  });
});
