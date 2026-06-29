"use client";

import dayjs from "dayjs";
import { Clock, Flame, MapPin, Trophy, Wind } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { storageRepository } from "@/storage/storage-repository";
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";

/**
 * Home screen — shows today's daily challenge summary and primary CTA.
 */
export function HomeScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const player = usePlayerStore((state) => state.player);

  const { currentChallenge, setChallenge } = useGameStore();
  const [dailyCompleted, setDailyCompleted] = useState(false);

  // Determine today's challenge
  const todayStr = dayjs().format("YYYY-MM-DD");
  const challenge = currentChallenge || generateDailyChallenge(todayStr);

  useEffect(() => {
    if (!currentChallenge) {
      setChallenge(challenge);
    }
  }, [currentChallenge, challenge, setChallenge]);

  useEffect(() => {
    const daily = storageRepository.loadDaily();
    if (
      daily &&
      daily.challengeId === challenge.id &&
      daily.status === "completed"
    ) {
      setDailyCompleted(true);
    }
  }, [challenge.id]);

  const formatTargetTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
          RunQuest
        </p>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">
          {dailyCompleted
            ? t("home.completed" as TranslationKey)
            : t("home.title" as TranslationKey)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {dailyCompleted
            ? t("home.completed_subtitle" as TranslationKey)
            : t("home.subtitle" as TranslationKey)}
        </p>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-6 py-4 flex flex-col gap-6">
        {/* Player Stats Panel */}
        {player && (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
                  Player Profile
                </span>
                <span className="text-lg font-bold font-heading">
                  Runner #{player.id.slice(0, 5).toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1 rounded-full transition-all border border-white/10"
              >
                View History →
              </button>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs text-blue-200 uppercase font-medium">
                  {t("home.stats.streak" as TranslationKey)}
                </span>
                <span className="text-xl font-bold flex items-center gap-1 mt-0.5">
                  🔥 {player.statistics.currentStreak}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-blue-200 uppercase font-medium">
                  {t("home.stats.runs" as TranslationKey)}
                </span>
                <span className="text-xl font-bold mt-0.5">
                  {player.statistics.totalRuns}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-blue-200 uppercase font-medium">
                  {t("home.stats.distance" as TranslationKey)}
                </span>
                <span className="text-xl font-bold mt-0.5">
                  {player.statistics.totalDistance} km
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Daily Challenge Card */}
        <div className="bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-6">
          {/* Date badge */}
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>Daily Challenge</span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 font-heading mb-1">
            {challenge.race.title[lang]}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {challenge.race.description[lang]}
          </p>

          {/* Race details */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatChip
              icon={<MapPin className="w-4 h-4" />}
              label={t("challenge.briefing.distance" as TranslationKey)}
              value={`${challenge.race.distance} km`}
            />
            <StatChip
              icon={<Flame className="w-4 h-4" />}
              label={t("challenge.briefing.weather_temp" as TranslationKey)}
              value={`${t(`challenge.weather.${challenge.environment.weather}` as TranslationKey)} ${challenge.environment.temperature}°`}
            />
            <StatChip
              icon={<Wind className="w-4 h-4" />}
              label={t("challenge.briefing.surface_type" as TranslationKey)}
              value={t(
                `challenge.surface.${challenge.race.surface}` as TranslationKey,
              )}
            />
          </div>

          {/* Target time */}
          <div className="flex items-center gap-2 bg-orange-50 rounded-2xl p-3 mb-6">
            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-orange-800 font-medium">
              Target: finish under{" "}
              {formatTargetTime(challenge.objective.targetTime)}
            </span>
          </div>

          {/* Primary CTA / Locked Info */}
          {dailyCompleted ? (
            <div className="bg-emerald-50 border-2 border-emerald-250 rounded-2xl p-4 text-center text-emerald-800 font-semibold text-sm flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-500 animate-bounce" />
              <span>You completed today&apos;s challenge successfully!</span>
            </div>
          ) : (
            <button
              id="start-race-cta"
              type="button"
              onClick={() => router.push("/briefing")}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-full transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {t("common.start" as TranslationKey)} Today&apos;s Race
            </button>
          )}
        </div>

        {/* Player ID (dev helper) */}
        {player && (
          <p className="text-xs text-center text-gray-300 select-all">
            ID: {player.id.slice(0, 8)}
          </p>
        )}
      </main>
    </div>
  );
}

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatChip({ icon, label, value }: StatChipProps) {
  return (
    <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-2xl p-3">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider text-center">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-800 text-center">
        {value}
      </span>
    </div>
  );
}
