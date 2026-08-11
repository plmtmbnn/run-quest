"use client";

import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import type { PacingPlan, Surface, TimeOfDay } from "@/types/engine";

export type EnvironmentType = "stadium" | "road" | "trail" | "beach";

interface ParallaxEnvironmentProps {
  surface?: Surface;
  environmentType?: EnvironmentType;
  pacing?: PacingPlan;
  timeOfDay?: TimeOfDay;
  currentKm?: number;
  className?: string;
}

export function ParallaxEnvironment({
  surface = "track",
  environmentType,
  pacing = "cruise",
  timeOfDay = "afternoon",
  currentKm = 0,
  className = "",
}: ParallaxEnvironmentProps) {
  const { parallaxEnabled, reducedMotion } = useSettingsStore(
    (state) => state.settings,
  );

  // Map surface to EnvironmentType if environmentType is not explicitly passed
  const activeEnvironment: EnvironmentType =
    environmentType ||
    (surface === "road"
      ? "road"
      : surface === "trail"
        ? "trail"
        : surface === "track"
          ? "stadium"
          : "road");

  // Determine scroll speed multiplier based on pacing mode
  const getSpeedMultiplier = (pacingPlan: PacingPlan): number => {
    switch (pacingPlan) {
      case "sprint":
        return 2.0;
      case "push":
      case "aggressive":
        return 1.5;
      case "jog":
      case "conservative":
        return 0.5;
      default:
        return 1.0;
    }
  };

  const speedMultiplier = getSpeedMultiplier(pacing);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [offset, setOffset] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!mounted || parallaxEnabled === false || reducedMotion === true) {
      return;
    }

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Base scroll rate: 60px per second * speedMultiplier
      const scrollDelta = 60 * speedMultiplier * delta;
      setOffset((prev) => (prev + scrollDelta) % 1200);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [mounted, parallaxEnabled, reducedMotion, speedMultiplier]);

  // Time of Day lighting overlay styling
  const getTimeOfDayOverlay = () => {
    switch (timeOfDay) {
      case "morning":
        return "bg-gradient-to-b from-amber-500/10 via-orange-400/10 to-transparent";
      case "evening":
        return "bg-gradient-to-b from-indigo-600/15 via-purple-600/15 to-transparent";
      case "night":
        return "bg-gradient-to-b from-slate-950/40 via-indigo-950/30 to-transparent";
      default:
        return "bg-transparent";
    }
  };

  if (!mounted || parallaxEnabled === false || reducedMotion === true) {
    return (
      <div
        className={`absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20 dark:opacity-15 bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-800 dark:to-slate-950 ${className}`}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-20 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Time of Day Lighting Tint */}
      <div className={`absolute inset-0 z-10 ${getTimeOfDayOverlay()}`} />

      {/* Parallax Layer 1: Background (Distant Mountains / Sky) - 0.1x */}
      <div
        className="absolute inset-0 w-[2400px] h-full flex"
        style={{
          transform: `translate3d(-${(offset * 0.1) % 1200}px, 0, 0)`,
          willChange: "transform",
        }}
      >
        <ParallaxSvgLayer environment={activeEnvironment} layer={1} />
        <ParallaxSvgLayer environment={activeEnvironment} layer={1} />
      </div>

      {/* Parallax Layer 2: Midground (Trees / Buildings / Stadium Stands) - 0.3x */}
      <div
        className="absolute inset-0 w-[2400px] h-full flex"
        style={{
          transform: `translate3d(-${(offset * 0.3) % 1200}px, 0, 0)`,
          willChange: "transform",
        }}
      >
        <ParallaxSvgLayer environment={activeEnvironment} layer={2} />
        <ParallaxSvgLayer environment={activeEnvironment} layer={2} />
      </div>

      {/* Parallax Layer 3: Foreground (Spectators / Fences / Roadside Details) - 0.6x */}
      <div
        className="absolute inset-0 w-[2400px] h-full flex"
        style={{
          transform: `translate3d(-${(offset * 0.6) % 1200}px, 0, 0)`,
          willChange: "transform",
        }}
      >
        <ParallaxSvgLayer environment={activeEnvironment} layer={3} />
        <ParallaxSvgLayer environment={activeEnvironment} layer={3} />
      </div>

      {/* Parallax Layer 4: Ground (Track / Road / Trail Surface) - 1.0x */}
      <div
        className="absolute bottom-0 left-0 w-[2400px] h-24 flex"
        style={{
          transform: `translate3d(-${offset % 1200}px, 0, 0)`,
          willChange: "transform",
        }}
      >
        <ParallaxSvgLayer environment={activeEnvironment} layer={4} />
        <ParallaxSvgLayer environment={activeEnvironment} layer={4} />
      </div>
    </div>
  );
}

function ParallaxSvgLayer({
  environment,
  layer,
}: {
  environment: EnvironmentType;
  layer: 1 | 2 | 3 | 4;
}) {
  if (environment === "stadium") {
    if (layer === 1) {
      return (
        <svg
          className="w-[1200px] h-full fill-slate-400 dark:fill-slate-600"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Stadium Floodlights & Roof Outline */}
          <polygon points="0,400 0,180 150,150 300,190 450,140 600,180 750,130 900,170 1050,140 1200,180 1200,400" />
          <line
            x1="150"
            y1="150"
            x2="150"
            y2="40"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="750"
            y1="130"
            x2="750"
            y2="30"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
      );
    }
    if (layer === 2) {
      return (
        <svg
          className="w-[1200px] h-full fill-slate-500 dark:fill-slate-500"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Stadium Stands & Seating Tiers */}
          <rect x="0" y="240" width="1200" height="160" opacity="0.6" />
          <polygon points="0,400 0,260 200,240 400,270 600,230 800,260 1000,235 1200,260 1200,400" />
        </svg>
      );
    }
    if (layer === 3) {
      return (
        <svg
          className="w-[1200px] h-full fill-slate-600 dark:fill-slate-400"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Crowd Silhouettes & Perimeter Fence */}
          <path d="M0,320 Q30,310 60,320 T120,320 T180,310 T240,320 T300,315 T360,320 T420,310 T480,320 T540,315 T600,320 T660,310 T720,320 T780,315 T840,320 T900,310 T960,320 T1020,315 T1080,320 T1140,310 T1200,320 L1200,400 L0,400 Z" />
        </svg>
      );
    }
    return (
      <svg
        className="w-[1200px] h-24 fill-red-600/40 dark:fill-red-700/40"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        {/* Tartan Track Lanes */}
        <rect x="0" y="0" width="1200" height="100" />
        <line
          x1="0"
          y1="25"
          x2="1200"
          y2="25"
          stroke="#ffffff"
          strokeWidth="2"
          strokeDasharray="20 15"
          opacity="0.8"
        />
        <line
          x1="0"
          y1="50"
          x2="1200"
          y2="50"
          stroke="#ffffff"
          strokeWidth="2"
          strokeDasharray="20 15"
          opacity="0.8"
        />
        <line
          x1="0"
          y1="75"
          x2="1200"
          y2="75"
          stroke="#ffffff"
          strokeWidth="2"
          strokeDasharray="20 15"
          opacity="0.8"
        />
      </svg>
    );
  }

  if (environment === "road") {
    if (layer === 1) {
      return (
        <svg
          className="w-[1200px] h-full fill-slate-400 dark:fill-slate-700"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* City Skyline */}
          <polygon points="0,400 0,200 80,200 80,120 140,120 140,200 220,200 220,90 310,90 310,200 400,200 400,150 480,150 480,200 600,200 600,100 700,100 700,200 820,200 820,130 920,130 920,200 1050,200 1050,110 1150,110 1150,200 1200,200 1200,400" />
        </svg>
      );
    }
    if (layer === 2) {
      return (
        <svg
          className="w-[1200px] h-full fill-slate-500 dark:fill-slate-600"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Midground Trees & Commercial Buildings */}
          <rect x="50" y="180" width="100" height="220" />
          <rect x="250" y="160" width="120" height="240" />
          <circle cx="500" cy="280" r="60" />
          <circle cx="650" cy="270" r="70" />
          <rect x="800" y="170" width="110" height="230" />
          <circle cx="1050" cy="285" r="55" />
        </svg>
      );
    }
    if (layer === 3) {
      return (
        <svg
          className="w-[1200px] h-full fill-slate-600 dark:fill-slate-500"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Street Lights & Barriers */}
          <line
            x1="200"
            y1="360"
            x2="200"
            y2="240"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="600"
            y1="360"
            x2="600"
            y2="240"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="1000"
            y1="360"
            x2="1000"
            y2="240"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-[1200px] h-24 fill-slate-700 dark:fill-slate-800"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        {/* Asphalt Road & White Dashed Lines */}
        <rect x="0" y="0" width="1200" height="100" />
        <line
          x1="0"
          y1="50"
          x2="1200"
          y2="50"
          stroke="#facc15"
          strokeWidth="4"
          strokeDasharray="30 25"
        />
      </svg>
    );
  }

  if (environment === "trail") {
    if (layer === 1) {
      return (
        <svg
          className="w-[1200px] h-full fill-slate-400 dark:fill-slate-700"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Mountain Peaks */}
          <polygon points="0,400 0,220 180,100 350,240 520,80 700,220 880,110 1050,250 1200,160 1200,400" />
        </svg>
      );
    }
    if (layer === 2) {
      return (
        <svg
          className="w-[1200px] h-full fill-emerald-800/50 dark:fill-emerald-900/60"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Dense Pine Forest */}
          <polygon points="0,400 0,260 40,200 80,260 120,180 160,260 200,190 240,260 280,170 320,260 360,210 400,260 440,180 480,260 520,200 560,260 600,170 640,260 680,210 720,260 760,190 800,260 840,180 880,260 920,210 960,260 1000,170 1040,260 1080,200 1120,260 1160,180 1200,260 1200,400" />
        </svg>
      );
    }
    if (layer === 3) {
      return (
        <svg
          className="w-[1200px] h-full fill-emerald-700/60 dark:fill-emerald-800/70"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          {/* Foreground Bushes & Rocks */}
          <circle cx="100" cy="350" r="45" />
          <circle cx="350" cy="340" r="55" />
          <circle cx="650" cy="345" r="50" />
          <circle cx="950" cy="340" r="60" />
        </svg>
      );
    }
    return (
      <svg
        className="w-[1200px] h-24 fill-amber-900/50 dark:fill-amber-950/60"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        {/* Dirt Trail Surface */}
        <rect x="0" y="0" width="1200" height="100" />
        <ellipse cx="200" cy="40" rx="30" ry="6" fill="#78350f" opacity="0.4" />
        <ellipse cx="600" cy="60" rx="40" ry="8" fill="#78350f" opacity="0.4" />
        <ellipse
          cx="1000"
          cy="30"
          rx="35"
          ry="7"
          fill="#78350f"
          opacity="0.4"
        />
      </svg>
    );
  }

  // Beach environment fallback
  if (layer === 1) {
    return (
      <svg
        className="w-[1200px] h-full fill-sky-300/40 dark:fill-sky-800/30"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        {/* Ocean Horizon & Distant Clouds */}
        <rect x="0" y="0" width="1200" height="400" />
        <path
          d="M0,280 Q300,270 600,280 T1200,280 L1200,400 L0,400 Z"
          fill="#0284c7"
          opacity="0.5"
        />
      </svg>
    );
  }
  if (layer === 2) {
    return (
      <svg
        className="w-[1200px] h-full fill-emerald-600/40 dark:fill-emerald-700/40"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        {/* Palm Trees Silhouettes */}
        <path d="M150,400 Q140,250 180,160 L200,160 Q160,250 170,400 Z" />
        <circle cx="180" cy="150" r="35" />
        <path d="M750,400 Q740,240 790,150 L810,150 Q760,240 770,400 Z" />
        <circle cx="790" cy="140" r="40" />
      </svg>
    );
  }
  if (layer === 3) {
    return (
      <svg
        className="w-[1200px] h-full fill-amber-300/60 dark:fill-amber-600/40"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        {/* Sand Dunes */}
        <path d="M0,330 Q250,300 500,330 T1000,320 T1200,330 L1200,400 L0,400 Z" />
      </svg>
    );
  }
  return (
    <svg
      className="w-[1200px] h-24 fill-amber-200 dark:fill-amber-900/40"
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
    >
      {/* Sandy Beach Path */}
      <rect x="0" y="0" width="1200" height="100" />
    </svg>
  );
}
