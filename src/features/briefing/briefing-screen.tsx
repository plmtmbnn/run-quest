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
import { useGameStore } from "@/store/game-store";
import { useTimelineStore } from "@/store/timeline-store";
import { makeRegistrationKey } from "@/scheduling/race-calendar-engine";

export function BriefingScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { currentChallenge, setActiveGhost } = useGameStore();
  const { playSound } = useSound();
  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);
  const schedulingState = useTimelineStore(
    (state) => state.gameState?.scheduling,
  );

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
    if (!schedulingState) return;

    const scheduleId = currentChallenge?.scheduleId;
    if (!scheduleId) {
      return;
    }

    const instanceKey = makeRegistrationKey(scheduleId, dayIndex);
    const isThisOccurrenceDone =
      schedulingState.completedRaces[instanceKey] !== undefined ||
      schedulingState.completedRaces[`${scheduleId}_${dayIndex}`] !== undefined;

    if (isThisOccurrenceDone) {
      router.replace("/");
    }
  }, [schedulingState, currentChallenge?.scheduleId, dayIndex, router]);

  const surfaceColorClass =
    challenge.race.surface === "trail"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40"
      : challenge.race.surface === "track"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40"
      : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 lg:pb-16 text-slate-800 dark:text-white flex flex-col"
    >
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 sm:px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.back();
            }}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="font-heading font-black text-lg sm:text-xl md:text-2xl text-slate-800 dark:text-white">
              {t("challenge.briefing.title" as TranslationKey)}
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("challenge.briefing.subtitle" as TranslationKey)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Hero Card Container */}
        <div className="rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          {/* Surface Category Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-heading mb-4 ${surfaceColorClass}`}>
            <Flame className="w-3.5 h-3.5" />
            <span>Today&apos;s Race Details</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white mb-2 leading-tight">
            {challenge.race.title[lang]}
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-6">
            {challenge.race.description[lang]}
          </p>

          {/* 4 Metric Mini Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t border-b border-[#E5E7EB] dark:border-slate-800/80 py-6 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  {t("challenge.briefing.distance" as TranslationKey)}
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate block">
                  {challenge.race.distance} km
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Flame className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  {t("challenge.briefing.weather_temp" as TranslationKey)}
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate block">
                  {t(
                    `challenge.weather.${challenge.environment.weather}` as TranslationKey,
                  )}{" "}
                  {challenge.environment.temperature}°C
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                <Wind className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  {t("challenge.briefing.surface_type" as TranslationKey)}
                </span>
                <span className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white capitalize truncate block">
                  {t(
                    `challenge.surface.${challenge.race.surface}` as TranslationKey,
                  )}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  {t("challenge.briefing.elevation_profile" as TranslationKey)}
                </span>
                <span className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white capitalize truncate block">
                  {t(
                    `challenge.elevation.${challenge.race.elevation}` as TranslationKey,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Highlight Stat Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                  {t("challenge.briefing.target_time" as TranslationKey)}
                </span>
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-mono font-bold text-lg sm:text-xl">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    Under {formatTargetTime(challenge.objective.targetTime)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 block mb-1">
                  {t("challenge.briefing.wind_speed" as TranslationKey)}
                </span>
                <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-mono font-bold text-lg sm:text-xl">
                  <Wind className="w-5 h-5 text-sky-500 shrink-0" />
                  <span>
                    {challenge.environment.wind.speed} km/h{" "}
                    {challenge.environment.wind.direction}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PB Ghost Card */}
          {ghost && (
            <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-[2rem] p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl shrink-0">👻</span>
                <div>
                  <h3 className="font-heading font-black text-sm text-indigo-950 dark:text-indigo-100">
                    Race against PB Ghost
                  </h3>
                  <p className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 mt-1">
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
                className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all min-h-[44px] ${
                  enableGhost
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 border border-indigo-500 active:scale-95"
                    : "bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95"
                }`}
              >
                {enableGhost ? "ENABLED" : "ENABLE"}
              </button>
            </div>
          )}

          {/* Action CTAs for Desktop & Tablet */}
          <div className="hidden lg:flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setIsShareOpen(true);
              }}
              className="flex-grow border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 font-bold text-xs py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
              className="flex-grow bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>
                {t("challenge.briefing.start_prep" as TranslationKey)}
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 border-t border-[#E5E7EB] dark:border-slate-800 backdrop-blur-md z-30 lg:hidden flex items-center gap-3 shadow-lg">
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
          className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white shadow-indigo-500/20 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>{t("challenge.briefing.start_prep" as TranslationKey)}</span>
          <span>→</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setIsShareOpen(true);
          }}
          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 active:scale-95 transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
          aria-label={t("share.race_choice.button" as TranslationKey)}
        >
          <Share2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

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


