"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Flame, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { simulateRace } from "@/engine/simulation/engine";
import { useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import { usePreparationStore } from "@/store/preparation-store";
import type { RaceEvent, SimulationResult } from "@/types/engine";

export function RaceScreen() {
  const router = useRouter();
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { currentChallenge, setResult } = useGameStore();
  const completeChallenge = usePlayerStore((state) => state.completeChallenge);
  const { preparation } = usePreparationStore();

  // Load/Generate today's challenge
  const challenge =
    currentChallenge || generateDailyChallenge(dayjs().format("YYYY-MM-DD"));

  const [currentKm, setCurrentKm] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [runningEvents, setRunningEvents] = useState<RaceEvent[]>([]);
  const [stats, setStats] = useState({
    energy: 100,
    hydration: 100,
    focus: 100,
  });

  const simResultRef = useRef<SimulationResult | null>(null);

  useEffect(() => {
    // 1. Run the headless simulation instantly on mount
    const seed = Number.parseInt(challenge.date.replace(/-/g, ""), 10) || 42;
    try {
      const result = simulateRace({
        player: { id: "player_local" },
        challenge,
        preparation,
        seed,
      });
      simResultRef.current = result;
    } catch (error) {
      console.error("Simulation failed:", error);
      router.push("/preparation");
      return;
    }

    // 2. Play a ticker animation to show the progress to the user
    const totalDist = Math.ceil(challenge.race.distance);
    const intervalMs = Math.max(100, 3000 / totalDist); // scale so it takes ~3s max

    let kmCounter = 0;
    const interval = setInterval(() => {
      kmCounter += 1;
      if (kmCounter > totalDist) {
        clearInterval(interval);
        setIsFinished(true);

        // Save result and auto-redirect to results screen after 1.2s
        if (simResultRef.current) {
          setResult(simResultRef.current);
          completeChallenge(
            challenge.id,
            challenge.race.distance,
            simResultRef.current,
            language,
          );
          setTimeout(() => {
            router.push("/result");
          }, 1200);
        }
        return;
      }

      setCurrentKm(kmCounter);

      // Check if any event resolved at this kilometer
      const matchedEvents =
        simResultRef.current?.events.filter((e) => e.km === kmCounter) || [];
      if (matchedEvents.length > 0) {
        setRunningEvents((prev) => [...prev, ...matchedEvents]);
      }

      // Simulate a visual drain of stats for display purposes during ticking
      setStats(() => {
        const percentProgress = kmCounter / totalDist;
        return {
          energy: Math.max(5, Math.floor(100 - percentProgress * 60)),
          hydration: Math.max(5, Math.floor(100 - percentProgress * 70)),
          focus: Math.max(10, Math.floor(100 - percentProgress * 40)),
        };
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [challenge, preparation, setResult, router, completeChallenge, language]);

  const progressPercentage = Math.min(
    100,
    (currentKm / challenge.race.distance) * 100,
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              Live Simulation
            </span>
            <h1 className="font-heading text-lg font-bold text-gray-100">
              {challenge.race.title[lang]}
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Activity className="h-4.5 w-4.5 animate-pulse" />
            <span>Simulating</span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-8 flex flex-col justify-center gap-8">
        {/* Distance Circular Tracker */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg
              className="w-full h-full transform -rotate-90"
              role="img"
              aria-label="Race progress circle"
            >
              <title>Race progress circle</title>
              <circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-gray-800 fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-blue-500 fill-none"
                strokeWidth="8"
                strokeDasharray="552"
                initial={{ strokeDashoffset: 552 }}
                animate={{
                  strokeDashoffset: 552 - (552 * progressPercentage) / 100,
                }}
                transition={{ duration: 0.1 }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-extrabold tracking-tight font-heading">
                {currentKm}
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                of {challenge.race.distance} km
              </span>
            </div>
          </div>
        </div>

        {/* Real-time stats display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-gray-400 text-xs mb-1">Energy</span>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame className="h-4.5 w-4.5" />
              <span className="text-xl font-bold">{stats.energy}%</span>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-gray-400 text-xs mb-1">Hydration</span>
            <div className="flex items-center gap-1.5 text-blue-400">
              <Activity className="h-4.5 w-4.5" />
              <span className="text-xl font-bold">{stats.hydration}%</span>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-gray-400 text-xs mb-1">Focus</span>
            <div className="flex items-center gap-1.5 text-purple-400">
              <TrendingUp className="h-4.5 w-4.5" />
              <span className="text-xl font-bold">{stats.focus}%</span>
            </div>
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="flex-grow bg-gray-950 border border-gray-800 rounded-2xl p-5 font-mono text-xs overflow-y-auto max-h-[160px]">
          <div className="text-gray-500 mb-2">{"// Race Feed"}</div>
          <div className="flex flex-col gap-2">
            <div>&gt; Race started on {challenge.race.surface} terrain...</div>
            <AnimatePresence>
              {runningEvents.map((event) => (
                <motion.div
                  key={event.km}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-2 ${
                    event.effect.stamina < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  <span>[{event.km} km]</span>
                  <span className="flex-grow">
                    {event.title[lang]} — {event.description[lang]}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {isFinished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-400 font-semibold"
              >
                &gt; Finish line crossed! Rendering report...
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-gray-900 bg-gray-900/30 text-center text-xs text-gray-500">
        RunQuest Simulation Engine v1.0.0
      </footer>
    </div>
  );
}
