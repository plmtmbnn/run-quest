"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  Medal,
  Play,
  RotateCcw,
  Settings,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  generateChallengesForDistance,
  getAIFieldStrength,
} from "@/engine/focus/challenge-generator";
import {
  generateCourse,
  generateWeather,
} from "@/engine/focus/weather-generator";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateRaceChallenge } from "@/services/challenge/generator";
import {
  type Difficulty,
  type Distance,
  useFocusProgressionStore,
} from "@/store/focus-progression-store";
import { useGameStore } from "@/store/game-store";
import { useLoadoutStore } from "@/store/loadout-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";
import type { Elevation, Surface } from "@/types/engine";

type DistanceOption = {
  id: string;
  label: string;
  distance: Distance;
  locked: boolean;
};

type DifficultyOption = {
  id: Difficulty;
  label: string;
  description: string;
  locked: boolean;
};

export function EnhancedFocusScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { playSound } = useSound();
  const setGameMode = useSettingsStore((state) => state.setGameMode);
  const { setChallenge } = useGameStore();
  const { preparation } = usePreparationStore();
  const currentDayIndex = useTimelineStore(
    (state) => state.gameState?.dayIndex ?? 0,
  );

  // Focus progression store
  const {
    unlockedDistances,
    unlockedDifficulties,
    currentDifficulty,
    personalBests,
    achievements,
    totalRaces,
    totalPodiums,
    bestFinishes,
    sessionStats,
    setDifficulty,
    resetSessionStats,
  } = useFocusProgressionStore();

  // Loadout store
  const { getLoadoutsForDistance } = useLoadoutStore();

  const [selectedDistance, setSelectedDistance] = useState<Distance>(5);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(
    null,
  );
  const [showStats, setShowStats] = useState(false);
  const [showLoadouts, setShowLoadouts] = useState(false);

  // Generate distance options based on unlocks
  const distanceOptions: DistanceOption[] = [
    {
      id: "5k",
      label: "5K",
      distance: 5,
      locked: !unlockedDistances.includes(5),
    },
    {
      id: "10k",
      label: "10K",
      distance: 10,
      locked: !unlockedDistances.includes(10),
    },
    {
      id: "half",
      label: "Half Marathon",
      distance: 21.1,
      locked: !unlockedDistances.includes(21.1),
    },
    {
      id: "full",
      label: "Marathon",
      distance: 42.2,
      locked: !unlockedDistances.includes(42.2),
    },
  ];

  // Generate difficulty options based on unlocks
  const difficultyOptions: DifficultyOption[] = [
    {
      id: "recreational",
      label: "Recreational",
      description: "Casual racing, easier competition",
      locked: !unlockedDifficulties.includes("recreational"),
    },
    {
      id: "competitive",
      label: "Competitive",
      description: "Serious competition, skilled field",
      locked: !unlockedDifficulties.includes("competitive"),
    },
    {
      id: "elite",
      label: "Elite",
      description: "High-level racing, tough opponents",
      locked: !unlockedDifficulties.includes("elite"),
    },
    {
      id: "professional",
      label: "Professional",
      description: "World-class field, brutal competition",
      locked: !unlockedDifficulties.includes("professional"),
    },
  ];

  // Get challenges for selected distance
  const availableChallenges = generateChallengesForDistance(
    selectedDistance,
    currentDifficulty,
    {
      totalRaces,
      bestFinish: bestFinishes[selectedDistance],
      personalBest: personalBests[selectedDistance]?.time || null,
    },
  );

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRace = () => {
    playSound("success");

    // Generate dynamic weather and course
    const weather = generateWeather("spring");
    const course = generateCourse();

    // Get AI field strength based on difficulty
    const fieldStrength = getAIFieldStrength(currentDifficulty);

    // Generate race challenge
    const challenge = generateRaceChallenge({
      scheduleId: "focus_race",
      dayIndex: currentDayIndex,
      distance: selectedDistance,
      surface: course.surface as Surface,
      elevation:
        course.elevation === "flat"
          ? "flat"
          : course.elevation === "hilly"
            ? "hilly"
            : ("rolling" as Elevation),
      tier: (currentDifficulty === "recreational"
        ? "local"
        : currentDifficulty === "competitive"
          ? "regional"
          : currentDifficulty === "elite"
            ? "national"
            : "international") as any,
      raceName: { en: "Focus Race", id: "Lomba Fokus" },
      entryFee: 0,
    });

    setChallenge(challenge);
    router.push("/race");
  };

  const handleBack = () => {
    playSound("click");
    setGameMode("career");
    router.push("/");
  };

  const pb = personalBests[selectedDistance];
  const loadouts = getLoadoutsForDistance(selectedDistance);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="font-heading font-black text-lg">
                {t("focus_mode.title" as TranslationKey)}
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">
                {t("focus_mode.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trophy className="w-5 h-5 text-amber-500" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Session Stats Banner */}
        {sessionStats.racesCompleted > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-mono font-bold text-2xl">
                    {sessionStats.racesCompleted}
                  </div>
                  <div className="text-[10px] uppercase font-bold opacity-90">
                    {t("focus_mode.races" as TranslationKey)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-2xl">
                    {sessionStats.prsAchieved}
                  </div>
                  <div className="text-[10px] uppercase font-bold opacity-90">
                    {t("focus_mode.prs" as TranslationKey)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-2xl">
                    {sessionStats.podiumFinishes}
                  </div>
                  <div className="text-[10px] uppercase font-bold opacity-90">
                    {t("focus_mode.podiums" as TranslationKey)}
                  </div>
                </div>
                {sessionStats.currentStreak > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <Flame className="w-4 h-4" />
                    <span className="font-mono font-bold">
                      {sessionStats.currentStreak}x Streak
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => resetSessionStats()}
                className="text-[10px] uppercase font-bold opacity-75 hover:opacity-100 transition-opacity"
              >
                {t("focus_mode.reset_session" as TranslationKey)}
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Distance & Difficulty Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Distance Selection */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-black text-xl">
                  {t("focus_mode.select_distance" as TranslationKey)}
                </h2>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  {t("focus_mode.unlocked_count" as TranslationKey, {
                    unlocked: unlockedDistances.length,
                    total: 4,
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {distanceOptions.map((option) => {
                  const pb = personalBests[option.distance];
                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        !option.locked && setSelectedDistance(option.distance)
                      }
                      disabled={option.locked}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all
                        ${
                          option.locked
                            ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50 cursor-not-allowed"
                            : selectedDistance === option.distance
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                        }
                      `}
                    >
                      {option.locked && (
                        <Lock className="absolute top-2 right-2 w-4 h-4 text-slate-400" />
                      )}
                      <div className="font-heading font-black text-2xl">
                        {option.label}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">
                        {option.distance}km
                      </div>

                      {!option.locked && pb && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-[9px] uppercase font-bold text-slate-400">
                            {t("focus_mode.pb" as TranslationKey)}
                          </div>
                          <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            {formatTime(pb.time)}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-black text-xl">
                  {t("focus_mode.difficulty" as TranslationKey)}
                </h2>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i <
                        difficultyOptions.findIndex(
                          (d) => d.id === currentDifficulty,
                        ) +
                          1
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => !option.locked && setDifficulty(option.id)}
                    disabled={option.locked}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all text-left
                      ${
                        option.locked
                          ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50 cursor-not-allowed"
                          : currentDifficulty === option.id
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-heading font-black">
                          {option.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {option.description}
                        </div>
                      </div>
                      {option.locked && (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Challenges */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-6">
              <h2 className="font-heading font-black text-xl mb-4">
                {t("focus_mode.available_challenges" as TranslationKey)}
              </h2>

              <div className="space-y-3">
                {availableChallenges.slice(0, 5).map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      p-4 rounded-xl border-2 transition-all cursor-pointer
                      ${
                        selectedChallenge === challenge.id
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700"
                      }
                    `}
                    onClick={() => setSelectedChallenge(challenge.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {Array.from({ length: challenge.difficulty }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-amber-400 text-amber-400"
                              />
                            ),
                          )}
                        </div>
                        <div className="font-bold text-sm">
                          {challenge.description}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">
                          {t("focus_mode.reward" as TranslationKey, {
                            value: challenge.reward.value,
                          })}
                        </div>
                      </div>
                      <Target className="w-5 h-5 text-amber-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-6">
              <h2 className="font-heading font-black text-xl mb-4">
                {t("focus_mode.your_progress" as TranslationKey)}
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("focus_mode.total_races" as TranslationKey)}
                  </div>
                  <div className="font-mono font-bold text-3xl">
                    {totalRaces}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("focus_mode.podium_finishes" as TranslationKey)}
                  </div>
                  <div className="font-mono font-bold text-3xl text-amber-600 dark:text-amber-400">
                    {totalPodiums}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {t("focus_mode.achievements" as TranslationKey)}
                  </div>
                  <div className="font-mono font-bold text-3xl text-indigo-600 dark:text-indigo-400">
                    {achievements.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Bests */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
              <h2 className="font-heading font-black text-xl mb-4">
                {t("focus_mode.personal_bests" as TranslationKey)}
              </h2>

              <div className="space-y-3">
                {distanceOptions
                  .filter((d) => !d.locked)
                  .map((option) => {
                    const pb = personalBests[option.distance];
                    return (
                      <div
                        key={option.id}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-bold">{option.label}</div>
                        {pb ? (
                          <div className="font-mono font-bold">
                            {formatTime(pb.time)}
                          </div>
                        ) : (
                          <div className="text-xs opacity-75">
                            {t("focus_mode.no_pb_yet" as TranslationKey)}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Start Race Button */}
            <button
              onClick={handleStartRace}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-heading font-black text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              {t("focus_mode.start_race" as TranslationKey)}
            </button>

            {getLoadoutsForDistance(selectedDistance).length > 0 && (
              <button
                onClick={() => setShowLoadouts(true)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t("focus_mode.use_loadout" as TranslationKey, {
                  count: getLoadoutsForDistance(selectedDistance).length,
                })}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
