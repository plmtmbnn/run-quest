"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Flame,
  MapPin,
  Share2,
  Sparkles,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  ShieldAlert,
  Compass,
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
        return <Flame className="w-5 h-5 text-red-500" />;
      case "descent":
        return <Compass className="w-5 h-5 text-blue-500" />;
      case "sprint":
        return <Zap className="w-5 h-5 text-amber-500 font-bold" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSegmentColor = (type: string) => {
    switch (type) {
      case "climb":
        return "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/40";
      case "descent":
        return "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40";
      case "sprint":
        return "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40";
      default:
        return "bg-gray-50 border-gray-150 dark:bg-slate-900/55 dark:border-slate-800";
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
      className="min-h-screen bg-background pb-24 text-gray-900"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                router.back();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:bg-gray-50 active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="h-4.5 w-4.5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900">
                {t("analysis.title" as TranslationKey)}
              </h1>
              <p className="text-xs text-gray-500">
                {t("analysis.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setIsShareOpen(true);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:bg-gray-50 active:scale-95"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-8">
        {/* Race Overview Card */}
        <section className="rounded-3xl border-2 border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {t(`challenge.surface.${currentChallenge.race.surface}` as TranslationKey).toUpperCase()}
              </span>
              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-2">
                {currentChallenge.race.title[lang]}
              </h2>
            </div>
            <div className="bg-orange-50 rounded-2xl px-4 py-2 flex flex-col items-center">
              <span className="text-[10px] text-orange-600 uppercase font-black">
                {t("challenge.briefing.target_time" as TranslationKey)}
              </span>
              <span className="font-bold text-orange-700 text-sm mt-0.5">
                Under {formatTargetTime(currentChallenge.objective.targetTime)}
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            {currentChallenge.race.description[lang]}
          </p>
        </section>

        {/* Coach Briefing section */}
        {analysis?.briefing && (
          <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50/40 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold font-heading text-indigo-900">
                {analysis.briefing.title[lang]}
              </h3>
            </div>
            <p className="text-sm text-indigo-950 font-medium mb-4 leading-relaxed">
              &quot;{analysis.briefing.summary[lang]}&quot;
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-2xl p-4 border border-indigo-100">
                <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider block mb-2">
                  {t("analysis.key_recommendations" as TranslationKey)}
                </span>
                <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1.5 leading-relaxed">
                  {analysis.briefing.recommendations.map((rec, i) => (
                    <li key={i}>{rec[lang]}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 rounded-2xl p-4 border border-indigo-100">
                <span className="text-xs text-red-700 font-bold uppercase tracking-wider block mb-2">
                  {t("analysis.tactical_warnings" as TranslationKey)}
                </span>
                <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1.5 leading-relaxed">
                  {analysis.briefing.warnings.map((warn, i) => (
                    <li key={i} className="text-red-700 font-medium">{warn[lang]}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Course Segments Breakdown */}
        {analysis?.segments && (
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-heading text-gray-900">
                {t("analysis.course_segments" as TranslationKey)}
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                {currentChallenge.race.distance} KM Total
              </span>
            </div>

            <div className="grid gap-3">
              {analysis.segments.map((seg: RaceSegment, i: number) => (
                <div
                  key={seg.id}
                  className={`border-2 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition shadow-sm ${getSegmentColor(
                    seg.type
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border shadow-sm">
                      {getSegmentIcon(seg.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 capitalize">
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
                      <p className="text-xs text-gray-500">
                        {t(`challenge.surface.${seg.terrain}` as TranslationKey)} • {t(`challenge.elevation.${seg.elevation}` as TranslationKey)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        {t("analysis.distance" as TranslationKey)}
                      </span>
                      <span className="font-bold text-sm text-gray-700">{seg.distance} km</span>
                    </div>

                    <div className="text-right border-l pl-4">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        {t("analysis.difficulty" as TranslationKey)}
                      </span>
                      <span className="font-bold text-sm text-gray-700">★ {seg.difficulty}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weather Timeline Forecast */}
        {analysis?.weather && (
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold font-heading text-gray-900">
              {t("analysis.weather_forecast" as TranslationKey)}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {analysis.weather.checkpoints.map((kmMark, idx) => {
                const isRain = analysis.weather.rain[idx];
                const tempVal = analysis.weather.temperature[idx];
                const windObj = analysis.weather.wind[idx];
                const humVal = analysis.weather.humidity[idx];

                return (
                  <div
                    key={idx}
                    className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-4 text-center shadow-sm"
                  >
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      KM {kmMark}
                    </span>

                    <div className="flex justify-center my-3 text-gray-700">
                      {isRain ? (
                        <CloudRain className="w-8 h-8 text-blue-500" />
                      ) : tempVal >= 30 ? (
                        <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
                      ) : (
                        <Compass className="w-8 h-8 text-gray-500" />
                      )}
                    </div>

                    <span className="font-bold text-gray-800 block text-lg">{tempVal}°C</span>
                    <span className="text-[10px] text-gray-450 uppercase font-bold block mt-1">
                      {t(`challenge.weather.${isRain ? "rain" : currentChallenge.environment.weather}` as TranslationKey)}
                    </span>

                    <div className="border-t mt-3 pt-3 flex flex-col gap-1 text-[10px] text-gray-500 font-semibold align-middle justify-center">
                      <div className="flex items-center justify-between gap-1">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span>{humVal}% RH</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <Wind className="w-3 h-3 text-blue-400" />
                        <span>{windObj.speed} km/h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Hazards Warnings */}
        {analysis?.hazards && analysis.hazards.length > 0 && (
          <section className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-orange-850 font-bold mb-3">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              <span>{t("analysis.hazards_detected" as TranslationKey)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.hazards.map((haz, idx) => (
                <span
                  key={idx}
                  className="bg-white text-orange-700 border border-orange-200 font-bold text-xs px-3 py-1 rounded-full shadow-sm"
                >
                  ⚠ {haz[lang]}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA to start Preparation */}
        <section className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.push("/preparation");
            }}
            className="w-full bg-blue-600 hover:bg-blue-750 active:scale-[0.99] text-white font-bold text-lg py-4.5 rounded-full shadow-md transition duration-200 flex items-center justify-center gap-2"
          >
            <span>{t("challenge.briefing.start_prep" as TranslationKey)}</span>
            <span>→</span>
          </button>
        </section>
      </main>

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
