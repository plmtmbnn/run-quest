"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Flame,
  MapPin,
  Share2,
  Sparkles,
  Wind,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RaceChoiceCard } from "@/components/share/race-choice-card";
import { ShareModal } from "@/components/share/share-modal";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { type GhostRun, loadGhostRun } from "@/social/ghost-engine";
import { storageRepository } from "@/storage/storage-repository";
import { useGameStore } from "@/store/game-store";
import { useTimelineStore } from "@/store/timeline-store";

export function BriefingScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { currentChallenge, setActiveGhost } = useGameStore();
  const { playSound } = useSound();
  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);

  const formatTargetTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const challenge =
    currentChallenge || generateDailyChallenge(dayIndex.toString());

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [ghost, setGhost] = useState<GhostRun | null>(null);
  const [enableGhost, setEnableGhost] = useState(false);

  useEffect(() => {
    const loadedGhost = loadGhostRun(challenge.id, challenge.race.distance);
    setGhost(loadedGhost);
  }, [challenge.id, challenge.race.distance]);

  const shareTitle = t("share.race_choice.title" as TranslationKey);
  const shareText = `🏃 RunQuest — ${t("share.race_choice.title" as TranslationKey)}
🏁 ${challenge.race.title[lang]}
🛣️ ${t(`challenge.surface.${challenge.race.surface}` as TranslationKey)} • ☀️ ${t(`challenge.weather.${challenge.environment.weather}` as TranslationKey)} ${challenge.environment.temperature}°C • ⛰️ ${t(`challenge.elevation.${challenge.race.elevation}` as TranslationKey)}
🎯 ${t("home.target_time" as TranslationKey)}: Under ${formatTargetTime(challenge.objective.targetTime)}

${t("share.race_choice.cta" as TranslationKey)} https://runquest.game`;

  useEffect(() => {
    const daily = storageRepository.loadDaily();
    if (
      daily &&
      daily.challengeId === challenge.id &&
      daily.status === "completed"
    ) {
      router.replace("/");
    }
  }, [challenge.id, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-[#fffdf8] dark:bg-[#090d16] pb-24 text-gray-900 dark:text-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 bg-[#ffffff]/90 dark:bg-[#111827]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.back();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
              {t("challenge.briefing.title" as TranslationKey)}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300">
              {t("challenge.briefing.subtitle" as TranslationKey)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 flex flex-col gap-6">
        <div className="rounded-3xl border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>Today&apos;s Race Details</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading mb-2">
            {challenge.race.title[lang]}
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-6">
            {challenge.race.description[lang]}
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 dark:border-slate-800 py-6 mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  {t("challenge.briefing.distance" as TranslationKey)}
                </p>
                <p className="font-bold text-gray-800 dark:text-gray-100">
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
                <p className="font-bold text-gray-800 dark:text-gray-100">
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
                <p className="font-bold text-gray-800 dark:text-gray-100">
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
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  {t(
                    `challenge.elevation.${challenge.race.elevation}` as TranslationKey,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50/50 dark:bg-[#431407]/40 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] text-orange-400 dark:text-[#fdba74] uppercase font-bold mb-1">
                {t("challenge.briefing.target_time" as TranslationKey)}
              </span>
              <div className="flex items-center gap-1.5 text-orange-800 dark:text-[#fed7aa] font-bold text-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>
                  Under {formatTargetTime(challenge.objective.targetTime)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-[#172554]/40 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-[10px] text-blue-400 dark:text-[#93c5fd] uppercase font-bold mb-1">
                {t("challenge.briefing.wind_speed" as TranslationKey)}
              </span>
              <div className="flex items-center gap-1.5 text-blue-800 dark:text-[#bfdbfe] font-bold text-lg">
                <Wind className="w-5 h-5 text-blue-500" />
                <span>
                  {challenge.environment.wind.speed} km/h{" "}
                  {challenge.environment.wind.direction}
                </span>
              </div>
            </div>
          </div>

          {ghost && (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/30 rounded-[2rem] p-5 mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👻</span>
                <div>
                  <h3 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200 leading-tight">
                    Race against PB Ghost
                  </h3>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">
                    Your personal best: {Math.floor(ghost.finishTime / 60)}m{" "}
                    {Math.floor(ghost.finishTime % 60)}s (Recorded on Day{" "}
                    {ghost.recordedAt})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setEnableGhost(!enableGhost);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all ${
                  enableGhost
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 border-indigo-550 border"
                    : "bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50"
                }`}
              >
                {enableGhost ? "ENABLED" : "ENABLE"}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setIsShareOpen(true);
              }}
              className="flex-grow flex items-center justify-center gap-2 px-6 py-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-[0.98] rounded-full text-base font-semibold transition duration-200"
            >
              <Share2 className="w-5 h-5" />
              <span>{t("share.race_choice.button" as TranslationKey)}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                if (enableGhost && ghost) {
                  setActiveGhost({
                    runnerName: ghost.runnerName,
                    splits: ghost.splits,
                  });
                } else {
                  setActiveGhost(null);
                }
                router.push("/preparation");
              }}
              className="flex-grow bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-full transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>
                {t("challenge.briefing.start_prep" as TranslationKey)}
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      </main>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareText={shareText}
        shareTitle={shareTitle}
        fileName={`runquest-choice-${challenge.date}.png`}
      >
        <RaceChoiceCard
          challenge={challenge}
          lang={lang}
          date={challenge.date}
        />
      </ShareModal>
    </motion.div>
  );
}
