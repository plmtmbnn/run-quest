"use client";

import dayjs from "dayjs";
import { ArrowLeft, Clock, Flame, MapPin, Sparkles, Wind } from "lucide-react";
import { useRouter } from "next/navigation";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { useGameStore } from "@/store/game-store";

export function BriefingScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { currentChallenge } = useGameStore();

  const challenge =
    currentChallenge || generateDailyChallenge(dayjs().format("YYYY-MM-DD"));

  const formatTargetTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-[#FFFDF8]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:bg-gray-50 active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">
              {t("challenge.briefing.title" as TranslationKey)}
            </h1>
            <p className="text-xs text-gray-500">
              {t("challenge.briefing.subtitle" as TranslationKey)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 flex flex-col gap-6">
        <div className="rounded-3xl border-2 border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>Today&apos;s Race Details</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-2">
            {challenge.race.title[lang]}
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 mb-6">
            {challenge.race.description[lang]}
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-6 mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  {t("challenge.briefing.distance" as TranslationKey)}
                </p>
                <p className="font-bold text-gray-800">
                  {challenge.race.distance} km
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  {t("challenge.briefing.weather_temp" as TranslationKey)}
                </p>
                <p className="font-bold text-gray-800">
                  {t(
                    `challenge.weather.${challenge.environment.weather}` as TranslationKey,
                  )}{" "}
                  {challenge.environment.temperature}°C
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Wind className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  {t("challenge.briefing.surface_type" as TranslationKey)}
                </p>
                <p className="font-bold text-gray-800">
                  {t(
                    `challenge.surface.${challenge.race.surface}` as TranslationKey,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  {t("challenge.briefing.elevation_profile" as TranslationKey)}
                </p>
                <p className="font-bold text-gray-800">
                  {t(
                    `challenge.elevation.${challenge.race.elevation}` as TranslationKey,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50/50 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] text-orange-400 uppercase font-bold mb-1">
                {t("challenge.briefing.target_time" as TranslationKey)}
              </span>
              <div className="flex items-center gap-1.5 text-orange-800 font-bold text-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>
                  Under {formatTargetTime(challenge.objective.targetTime)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] text-blue-400 uppercase font-bold mb-1">
                {t("challenge.briefing.wind_speed" as TranslationKey)}
              </span>
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-lg">
                <Wind className="w-5 h-5 text-blue-500" />
                <span>
                  {challenge.environment.wind.speed} km/h{" "}
                  {challenge.environment.wind.direction}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/preparation")}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-full transition-all duration-200 shadow-sm"
          >
            {t("challenge.briefing.start_prep" as TranslationKey)} →
          </button>
        </div>
      </main>
    </div>
  );
}
