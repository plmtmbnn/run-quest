"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Brain,
  Dumbbell,
  Flame,
  Gauge,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { advanceSimulation } from "@/engine/simulation/engine";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import { usePreparationStore } from "@/store/preparation-store";
import type {
  DecisionCard,
  DecisionPrompt,
  RaceEvent,
  SimulationResult,
  SimulationState,
  SimulationStepResult,
} from "@/types/engine";

export function RaceScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { currentChallenge, setResult } = useGameStore();
  const completeChallenge = usePlayerStore((state) => state.completeChallenge);
  const { preparation } = usePreparationStore();
  const { playSound } = useSound();

  // Load/Generate today's challenge once on mount
  const [challenge] = useState(() => {
    return (
      currentChallenge || generateDailyChallenge(dayjs().format("YYYY-MM-DD"))
    );
  });

  const [currentKm, setCurrentKm] = useState(0);
  const [targetKm, setTargetKm] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [runningEvents, setRunningEvents] = useState<RaceEvent[]>([]);
  const [stats, setStats] = useState({
    energy: 100,
    hydration: 100,
    focus: 100,
    confidence: 100,
    muscleFatigue: 0,
    mentalFatigue: 0,
    momentum: 50,
    paceStability: 80,
    riskLevel: 20,
    pace: 0,
  });

  // State elements for decision moments
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [activeDecision, setActiveDecision] = useState<DecisionCard | null>(
    null,
  );
  const [countdown, setCountdown] = useState<number>(30);
  const [timeoutAlert, setTimeoutAlert] = useState<boolean>(false);
  const [pendingPrompt, setPendingPrompt] = useState<DecisionPrompt | null>(
    null,
  );

  const simStateRef = useRef<SimulationState | null>(null);
  const fullStateLogRef = useRef<
    Omit<SimulationState, "accumulatedStateLog">[]
  >([]);

  // Trigger to advance simulation chunk
  const handleAdvance = useCallback(
    (choiceId?: string) => {
      const seed = Number.parseInt(challenge.date.replace(/-/g, ""), 10) || 42;
      const input = {
        player: { id: "player_local" },
        challenge,
        preparation,
        seed,
      };

      let nextStep: SimulationStepResult;
      try {
        nextStep = advanceSimulation(
          input,
          simStateRef.current || undefined,
          choiceId,
        );
      } catch (error) {
        console.error("Simulation failed:", error);
        router.push("/preparation");
        return;
      }

      if (nextStep.type === "decision") {
        simStateRef.current = nextStep.state;
        setSimState(nextStep.state);
        fullStateLogRef.current = nextStep.state.accumulatedStateLog || [];
        setTargetKm(nextStep.state.distanceCovered);
        setPendingPrompt(nextStep.prompt);
      } else {
        simStateRef.current = null;
        setSimState(null);
        setSimResult(nextStep.result);
        fullStateLogRef.current = nextStep.result.stateLog || [];
        setTargetKm(nextStep.result.stateLog.length - 1);
        setPendingPrompt(null);
      }
    },
    [challenge, preparation, router],
  );

  // Initial simulation load on mount
  useEffect(() => {
    handleAdvance();
  }, [handleAdvance]);

  // Ticker animation that catches up to targetKm one by one
  useEffect(() => {
    if (fullStateLogRef.current.length === 0) return;

    if (currentKm >= targetKm) {
      // Ticker has caught up to the simulated chunk
      if (pendingPrompt) {
        setActiveDecision(pendingPrompt.decisionCard);
        setCountdown(30);
      } else if (simResult) {
        setIsFinished(true);
        playSound("success");

        // Save result and auto-redirect to results screen
        setResult(simResult);
        completeChallenge(
          challenge.id,
          challenge.race.distance,
          simResult,
          language,
        );
        setTimeout(() => {
          router.push("/result");
        }, 1500);
      }
      return;
    }

    // Ticker needs to advance
    const intervalMs = Math.max(150, 1500 / challenge.race.distance); // scaled ticker delay
    const timer = setTimeout(() => {
      const nextKmValue = currentKm + 1;
      playSound("tick");
      setCurrentKm(nextKmValue);

      // Extract events resolved at nextKmValue
      const events = simResult
        ? simResult.events
        : simState
          ? simState.eventsResolved
          : [];

      const matchedEvents = events.filter((e) => e.km === nextKmValue);
      if (matchedEvents.length > 0) {
        setRunningEvents((prev) => [...prev, ...matchedEvents]);
      }

      // Read actual stats from log snapshot
      const snapshot = fullStateLogRef.current[nextKmValue];
      if (snapshot) {
        const prevSnapshot = fullStateLogRef.current[nextKmValue - 1];
        const elapsedSeconds = prevSnapshot
          ? snapshot.accumulatedTime - prevSnapshot.accumulatedTime
          : snapshot.accumulatedTime;

        setStats({
          energy: Math.round(snapshot.energy),
          hydration: Math.round(snapshot.hydration),
          focus: Math.round(snapshot.focus),
          confidence: Math.round(snapshot.confidence),
          muscleFatigue: Math.round(snapshot.muscleFatigue ?? 0),
          mentalFatigue: Math.round(snapshot.mentalFatigue ?? 0),
          momentum: Math.round(snapshot.momentum ?? 50),
          paceStability: Math.round(snapshot.paceStability ?? 80),
          riskLevel: Math.round(snapshot.riskLevel ?? 20),
          pace: elapsedSeconds,
        });
      }
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [
    currentKm,
    targetKm,
    pendingPrompt,
    simResult,
    simState,
    challenge,
    playSound,
    setResult,
    completeChallenge,
    language,
    router,
  ]);

  // Countdown timer decrement
  useEffect(() => {
    if (!activeDecision) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeDecision, countdown]);

  // Handle timeout resolution
  useEffect(() => {
    if (activeDecision && countdown <= 0) {
      setTimeoutAlert(true);
      const timer = setTimeout(() => {
        setTimeoutAlert(false);
        setActiveDecision(null);
        handleAdvance(undefined); // undefined choice forces getFallbackChoice auto-pick
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeDecision, countdown, handleAdvance]);

  // Selection callback for user choices
  const selectChoice = (choiceId: string) => {
    setActiveDecision(null);
    handleAdvance(choiceId);
  };

  const progressPercentage = Math.min(
    100,
    (currentKm / challenge.race.distance) * 100,
  );

  const getStatCardStyle = (value: number) => {
    if (value < 20) {
      return "bg-red-950/20 border-red-900/50 text-red-500 animate-pulse transition-all duration-300";
    }
    return "bg-gray-900/60 border-gray-800 transition-all duration-300";
  };

  const getStatTextColor = (value: number, defaultColor: string) => {
    if (value < 20) return "text-red-500 font-extrabold";
    return defaultColor;
  };

  const formatPace = (seconds: number) => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white flex flex-col justify-between overflow-hidden relative">
      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-500 dark:text-blue-400 font-semibold">
              {t("challenge.race.live_simulation" as TranslationKey)}
            </span>
            <h1 className="font-heading text-lg font-bold text-slate-800 dark:text-gray-100">
              {challenge.race.title[lang]}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-gray-400">
              <span className="capitalize">
                {t(
                  `challenge.weather.${challenge.environment.weather}` as TranslationKey,
                )}
              </span>
              <span>•</span>
              <span>{challenge.environment.temperature}°C</span>
              <span>•</span>
              <span className="capitalize">
                {t(
                  `challenge.surface.${challenge.race.surface}` as TranslationKey,
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400 text-xs font-semibold">
            <Activity className="h-4.5 w-4.5 animate-pulse" />
            <span>{t("challenge.race.simulating" as TranslationKey)}</span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-8 flex flex-col justify-center gap-6 relative">
        {/* Distance Circular Tracker */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              role="img"
              aria-label="Race progress circle"
            >
              <title>Race progress circle</title>
              <circle
                cx="80"
                cy="80"
                r="72"
                className="stroke-slate-200 dark:stroke-gray-800 fill-none"
                strokeWidth="6"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="72"
                className="stroke-blue-500 fill-none"
                strokeWidth="6"
                strokeDasharray="452"
                initial={{ strokeDashoffset: 452 }}
                animate={{
                  strokeDashoffset: 452 - (452 * progressPercentage) / 100,
                }}
                transition={{ duration: 0.1 }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold tracking-tight font-heading">
                {currentKm}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-gray-400 uppercase tracking-widest">
                {t("challenge.race.of_distance" as TranslationKey).replace(
                  "{{distance}}",
                  challenge.race.distance.toString(),
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Live Simulation HUD Dashboard */}
        <div className="flex flex-col gap-6 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          {/* Main Attributes Panel */}
          <div>
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500 mb-3">
              Runner Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-slate-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 text-[10px] uppercase font-bold mb-1">
                  Pace
                </span>
                <div className="flex items-center gap-1 text-slate-800 dark:text-gray-200">
                  <Gauge className="h-4.5 w-4.5 text-blue-500" />
                  <span className="text-lg font-bold">
                    {formatPace(stats.pace)} /km
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 text-[10px] uppercase font-bold mb-1">
                  Energy
                </span>
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                  <Flame className="h-4.5 w-4.5" />
                  <span className="text-lg font-bold">{stats.energy}%</span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 text-[10px] uppercase font-bold mb-1">
                  Hydration
                </span>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-500">
                  <Activity className="h-4.5 w-4.5" />
                  <span className="text-lg font-bold">{stats.hydration}%</span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 text-[10px] uppercase font-bold mb-1">
                  Focus
                </span>
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-500">
                  <TrendingUp className="h-4.5 w-4.5" />
                  <span className="text-lg font-bold">{stats.focus}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-attributes / Indicators */}
          <div className="grid sm:grid-cols-2 gap-6 border-t border-slate-100 dark:border-gray-800 pt-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500">
                Fatigue & Stability
              </span>
              <div className="flex flex-col gap-2.5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    <span>Muscle Fatigue</span>
                    <span>{stats.muscleFatigue}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-350"
                      style={{ width: `${stats.muscleFatigue}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    <span>Mental Fatigue</span>
                    <span>{stats.mentalFatigue}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-350"
                      style={{ width: `${stats.mentalFatigue}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    <span>Pace Stability</span>
                    <span>{stats.paceStability}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full transition-all duration-350"
                      style={{ width: `${stats.paceStability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500">
                Strategy & Status
              </span>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-gray-950">
                  <span className="text-slate-500 dark:text-gray-400">
                    Risk Level
                  </span>
                  <span
                    className={`font-bold ${stats.riskLevel > 50 ? "text-red-500 font-extrabold" : "text-slate-700 dark:text-gray-300"}`}
                  >
                    {stats.riskLevel}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-gray-950">
                  <span className="text-slate-500 dark:text-gray-400">
                    Momentum
                  </span>
                  <span className="font-bold text-slate-700 dark:text-gray-300">
                    {stats.momentum}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-gray-950">
                  <span className="text-slate-500 dark:text-gray-400">
                    Confidence
                  </span>
                  <span className="font-bold text-slate-700 dark:text-gray-300">
                    {stats.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Effects List */}
          <div className="border-t border-slate-100 dark:border-gray-800 pt-4 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-550 mr-2">
              Active Effects:
            </span>
            {preparation.nutrition.map((item) => (
              <span
                key={item}
                className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-md capitalize"
              >
                {t(`preparation.nutrition.${item}.name` as TranslationKey)}
              </span>
            ))}
            {preparation.nutrition.includes("caffeine") && currentKm < 6 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-md animate-pulse">
                ⚡ Caffeine Surge
              </span>
            )}
            {preparation.nutrition.includes("caffeine") && currentKm >= 6 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md">
                💤 Caffeine Crash
              </span>
            )}
            {preparation.nutrition.includes("energy_gel") && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-md">
                🤢 Stomach Stress Risk
              </span>
            )}
            {stats.energy < 40 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-md">
                🚨 Exhaustion
              </span>
            )}
            {preparation.nutrition.length === 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 rounded-md">
                💀 No Nutrition
              </span>
            )}
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs overflow-y-auto max-h-[160px] text-slate-200 shadow-inner">
          <div className="text-gray-500 mb-2">
            {t("challenge.race.feed" as TranslationKey)}
          </div>
          <div className="flex flex-col gap-2">
            <div>
              &gt;{" "}
              {t("challenge.race.started_on" as TranslationKey).replace(
                "{{surface}}",
                t(
                  `challenge.surface.${challenge.race.surface}` as TranslationKey,
                ),
              )}
            </div>
            <AnimatePresence>
              {runningEvents.map((event, index) => (
                <motion.div
                  key={`${event.km}-${index}`}
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
                &gt; {t("challenge.race.finished_rendering" as TranslationKey)}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Decision moments Overlay Modal */}
      {activeDecision && (
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-6 z-40">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-blue-500 dark:text-amber-400 font-bold">
                  {t(`challenge.race.decision_title` as TranslationKey)} •{" "}
                  {activeDecision.category}
                </span>
                <h2 className="font-heading text-xl font-black text-slate-805 dark:text-white mt-0.5">
                  {activeDecision.title[lang]}
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                  {t("challenge.race.remaining_seconds" as TranslationKey)}
                </span>
                <span
                  className={`text-2xl font-black font-mono ${countdown <= 3 ? "text-red-500 animate-pulse" : "text-blue-500 dark:text-amber-400"}`}
                >
                  {countdown}s
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed">
              {activeDecision.description[lang]}
            </p>

            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-450 dark:text-gray-500 font-bold">
                {t("challenge.race.strategic_choices" as TranslationKey)}
              </span>
              {activeDecision.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => selectChoice(choice.id)}
                  disabled={timeoutAlert}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-slate-250 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-950/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-500/50 transition-all group duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-slate-700 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {choice.label[lang]}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400">
                      {choice.behavior}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-450 mt-1 leading-normal">
                    {choice.description[lang]}
                  </p>

                  {/* Visual micro trade-offs list */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {choice.effects.stamina !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.stamina > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.stamina > 0 ? "+" : ""}
                        {choice.effects.stamina}% Energy
                      </span>
                    )}
                    {choice.effects.hydration !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.hydration > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.hydration > 0 ? "+" : ""}
                        {choice.effects.hydration}% Hydration
                      </span>
                    )}
                    {choice.effects.morale !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.morale > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.morale > 0 ? "+" : ""}
                        {choice.effects.morale}% Focus
                      </span>
                    )}
                    {choice.effects.pace !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.pace < 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.pace < 0
                          ? "Faster Pace"
                          : "Slower Pace"}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Timeout Overlay Alert */}
      {timeoutAlert && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center gap-4 max-w-sm w-full"
          >
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-500 text-3xl animate-bounce">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {t("challenge.race.timeout" as TranslationKey)}
            </h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm">
              {t("challenge.race.timeout_instinct" as TranslationKey)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-6 border-t border-slate-200 dark:border-gray-900 bg-white dark:bg-gray-900/30 text-center text-xs text-slate-400 dark:text-gray-500">
        {t("challenge.race.engine_version" as TranslationKey)}
      </footer>
    </div>
  );
}
