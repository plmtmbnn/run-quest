"use client";

import { useEffect, useRef } from "react";
import type { Weather, Wind } from "@/types/engine";
import { getWeatherParticleConfig } from "@/engine/weather/weather-particle-params";
import { useSettingsStore } from "@/store/settings-store";

interface WeatherParticlesProps {
  weather?: Weather;
  temperature?: number;
  wind?: Wind;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  radius: number;
  opacity: number;
  active: boolean;
  phase: number;
}

export function WeatherParticles({
  weather = "sunny",
  temperature = 20,
  wind,
  className = "",
}: WeatherParticlesProps) {
  const { weatherEffectsEnabled, reducedMotion } = useSettingsStore(
    (state) => state.settings,
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (weatherEffectsEnabled === false || reducedMotion === true) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const config = getWeatherParticleConfig(weather, temperature, wind);

    if (config.maxParticles === 0) {
      return () => window.removeEventListener("resize", handleResize);
    }

    // Adjust particle count for mobile screens
    const isMobile = width < 768;
    const activeCount = isMobile
      ? Math.floor(config.maxParticles * 0.5)
      : config.maxParticles;

    // Particle Object Pool pre-allocation
    const pool: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      pool.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: config.speedXMin + Math.random() * (config.speedXMax - config.speedXMin),
        vy: config.speedYMin + Math.random() * (config.speedYMax - config.speedYMin),
        length:
          config.particleLengthMin +
          Math.random() * (config.particleLengthMax - config.particleLengthMin),
        radius: Math.random() * 2 + 1,
        opacity: config.particleOpacity * (0.6 + Math.random() * 0.4),
        active: i < activeCount,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let lastTime = Date.now();

    const render = () => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < activeCount; i++) {
        const p = pool[i];
        if (!p.active) continue;

        // Physics updates
        p.phase += dt * 2;

        if (config.category === "snow") {
          // Floating sin-wave movement
          p.x += (p.vx + Math.sin(p.phase) * 15) * dt;
          p.y += p.vy * dt;
        } else if (config.category === "fog") {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        } else if (config.category === "heat") {
          // Rising shimmer
          p.y += p.vy * dt;
          p.x += Math.sin(p.phase * 3) * 10 * dt;
        } else {
          // Rain or Wind
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        // Screen wrap-around & pool reset
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.y < -30 && config.category === "heat") {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 50) {
          p.x = -50;
        } else if (p.x < -50) {
          p.x = width + 50;
        }

        // Draw particle based on category
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (config.category === "rain") {
          ctx.strokeStyle = config.particleColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 0.03, p.y + p.length);
          ctx.stroke();

          // Puddle ripple splash on bottom ground
          if (config.showSplash && p.y > height - 60 && Math.random() < 0.05) {
            ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
            ctx.beginPath();
            ctx.ellipse(p.x, height - 10, 6, 2, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (config.category === "snow") {
          ctx.fillStyle = config.particleColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (config.category === "fog") {
          ctx.fillStyle = config.particleColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.length * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (config.category === "heat") {
          ctx.fillStyle = config.particleColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (config.category === "wind") {
          // Leaf / debris particle
          ctx.fillStyle = config.particleColor;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.length * 0.4, p.length * 0.2, p.phase, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [weather, temperature, wind, weatherEffectsEnabled, reducedMotion]);

  if (weatherEffectsEnabled === false || reducedMotion === true) {
    return null;
  }

  const config = getWeatherParticleConfig(weather, temperature, wind);

  return (
    <div className={`fixed inset-0 pointer-events-none z-10 overflow-hidden ${className}`}>
      {/* Dynamic Screen Edge Gradient Overlay */}
      {config.showOverlay && (
        <div className={`absolute inset-0 bg-gradient-to-b ${config.overlayGradient} transition-opacity duration-700`} />
      )}

      {/* Canvas Particle Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
