"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CloudRain,
  Compass,
  Droplets,
  Flame,
  MapPin,
  Share2,
  ShieldAlert,
  Sparkles,
  Sun,
  Wind,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RaceChoiceCard } from "@/components/share/race-choice-card";
import { ShareModal } from "@/components/share/share-modal";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useGameStore } from "@/store/game-store";
import type { RaceSegment } from "@/types/engine";

export function RaceAnalysisScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { currentChallenge } = useGameStore();
  const { playSound } = useSound();

  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!currentChallenge) {
    return null;
  }

  const analysis = currentChallenge.analysis;

  const formatTargetTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSegmentIcon = (type: string) => {
    switch (type) {
      case "climb":
        return <Flame className="w-5 h-5 text-rose-500" />;
      case "descent":
        return <Compass className="w-5 h-5 text-sky-500" />;
      case "sprint":
        return <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />;
      default:
        return <MapPin className="w-5 h-5 text-slate-500" />;
    }
  };

  const getSegmentColor = (type: string) => {
    switch (type) {
      case "climb":
        return "bg-rose-50/60 border-rose-200/80 dark:bg-rose-950/30 dark:border-rose-900/50";
      case "descent":
        return "bg-sky-50/60 border-sky-200/80 dark:bg-sky-950/30 dark:border-sky-900/50";
      case "sprint":
        return "bg-amber-50/60 border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/50";
      default:
        return "bg-slate-50/60 border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800";
    }
  };

  const shareTitle = t("share.race_choice.title" as TranslationKey);
  const shareText = `🏃 RunQuest — ${t("share.race_choice.title" as TranslationKey)}
🏁 ${currentChallenge.race.title[lang]}
🛣️ ${t(`challenge.surface.${currentChallenge.race.surface}` as TranslationKey)} • ☀️ ${t(`challenge.weather.${currentChallenge.environment.weather}` as TranslationKey)} ${currentChallenge.environment.temperature}°C • ⛰️ ${t(`challenge.elevation.${currentChallenge.race.elevation}` as TranslationKey)}
🎯 ${t("home.target_time" as TranslationKey)}: Under ${formatTargetTime(currentChallenge.objective.targetTime)}

${t("share.race_choice.cta" as TranslationKey)} https://runquest.game`;

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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-4">
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
                {t("analysis.title" as TranslationKey)}
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("analysis.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("click");
              setIsShareOpen(true);
            }}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
            aria-label="Share"
          >
            <Share2 className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Race Overview Card */}
        <section className="rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-heading bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                {t(
                  `challenge.surface.${currentChallenge.race.surface}` as TranslationKey,
                ).toUpperCase()}
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white mt-2 leading-tight">
                {currentChallenge.race.title[lang]}
              </h2>
            </div>
            <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 rounded-2xl px-4 py-3 flex flex-col sm:items-end shrink-0">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-bold tracking-wider">
                {t("challenge.briefing.target_time" as TranslationKey)}
              </span>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base mt-0.5">
                Under {formatTargetTime(currentChallenge.objective.targetTime)}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {currentChallenge.race.description[lang]}
          </p>
        </section>

        {/* Coach Briefing section */}
        {analysis?.briefing && (
          <section className="rounded-[2rem] border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-heading font-black text-indigo-950 dark:text-indigo-100">
                {analysis.briefing.title[lang]}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 font-medium mb-4 leading-relaxed italic">
              &quot;{analysis.briefing.summary[lang]}&quot;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider block mb-2">
                  {t("analysis.key_recommendations" as TranslationKey)}
                </span>
                <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  {analysis.briefing.recommendations.map((rec) => (
                    <li key={rec.en}>{rec[lang]}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/40 shadow-sm">
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider block mb-2">
                  {t("analysis.tactical_warnings" as TranslationKey)}
                </span>
                <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  {analysis.briefing.warnings.map((warn) => (
                    <li key={warn.en} className="text-rose-600 dark:text-rose-400 font-semibold">
                      {warn[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Course Segments Breakdown */}
        {analysis?.segments && (
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-heading font-black text-slate-900 dark:text-white">
                {t("analysis.course_segments" as TranslationKey)}
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {currentChallenge.race.distance} KM Total
              </span>
            </div>

            <div className="grid gap-3">
              {analysis.segments.map((seg: RaceSegment, i: number) => (
                <div
                  key={seg.id}
                  className={`border rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition shadow-sm ${getSegmentColor(
                    seg.type,
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                      {getSegmentIcon(seg.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-heading font-black text-slate-900 dark:text-white capitalize">
                        {`${lang === "id" ? "Segmen" : "Segment"} ${i + 1}: ${
                          seg.type === "climb"
                            ? t("analysis.segment_climb" as TranslationKey)
                            : seg.type === "descent"
                              ? t("analysis.segment_descent" as TranslationKey)
                              : seg.type === "sprint"
                                ? t("analysis.segment_sprint" as TranslationKey)
                                : t("analysis.segment_flat" as TranslationKey)
                        }`}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t(
                          `challenge.surface.${seg.terrain}` as TranslationKey,
                        )}{" "}
                        •{" "}
                        {t(
                          `challenge.elevation.${seg.elevation}` as TranslationKey,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        {t("analysis.distance" as TranslationKey)}
                      </span>
                      <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                        {seg.distance} km
                      </span>
                    </div>

                    <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        {t("analysis.difficulty" as TranslationKey)}
                      </span>
                      <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                        ★ {seg.difficulty}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weather Timeline Forecast ("Prakiraan Cuaca Race") */}
        {analysis?.weather && (
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-heading font-black text-slate-900 dark:text-white px-1">
              {t("analysis.weather_forecast" as TranslationKey)}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {analysis.weather.checkpoints.map((kmMark, idx) => {
                const isRain = analysis.weather.rain[idx];
                const tempVal = analysis.weather.temperature[idx];
                const windObj = analysis.weather.wind[idx];
                const humVal = analysis.weather.humidity[idx];

                return (
                  <div
                    key={kmMark}
                    className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block text-[10px] font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 px-2.5 py-0.5 rounded-full mb-3">
                        KM {kmMark}
                      </span>

                      <div className="flex justify-center my-2 text-slate-700 dark:text-slate-200">
                        {isRain ? (
                          <CloudRain className="w-8 h-8 text-sky-500" />
                        ) : tempVal >= 30 ? (
                          <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
                        ) : (
                          <Compass className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>

                      <span className="font-mono font-bold text-slate-900 dark:text-white block text-lg sm:text-xl">
                        {tempVal}°C
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block mt-1">
                        {t(
                          `challenge.weather.${isRain ? "rain" : currentChallenge.environment.weather}` as TranslationKey,
                        )}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3 flex flex-col gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 font-mono font-bold">
                      <div className="flex items-center justify-between gap-1">
                        <Droplets className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                        <span>{humVal}% RH</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <Wind className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                        <span>{windObj.speed} km/h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Hazards Warnings ("Sektor Kritis") */}
        {analysis?.hazards && analysis.hazards.length > 0 && (
          <section className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-heading font-black mb-3 text-base">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>{t("analysis.hazards_detected" as TranslationKey)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.hazards.map((haz) => (
                <span
                  key={haz.en}
                  className="bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm"
                >
                  ⚠ {haz[lang]}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Action CTAs for Desktop & Tablet */}
        <section className="hidden lg:flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.push("/preparation");
            }}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-black text-sm uppercase tracking-wider py-4 px-6 rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>{t("challenge.briefing.start_prep" as TranslationKey)}</span>
            <span>→</span>
          </button>
        </section>
      </main>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 border-t border-[#E5E7EB] dark:border-slate-800 backdrop-blur-md z-30 lg:hidden flex items-center gap-3 shadow-lg">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.push("/preparation");
          }}
          className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white shadow-indigo-500/20 flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>{t("challenge.briefing.start_prep" as TranslationKey)}</span>
          <span>→</span>
        </button>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareText={shareText}
        shareTitle={shareTitle}
        fileName={`runquest-choice-${currentChallenge.date}.png`}
      >
        <RaceChoiceCard
          challenge={currentChallenge}
          lang={lang}
          date={currentChallenge.date}
        />
      </ShareModal>
    </motion.div>
  );
}

