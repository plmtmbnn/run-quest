"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Award,
  BookOpen,
  Clock,
  Copy,
  Home,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { useGameStore } from "@/store/game-store";
import { usePreparationStore } from "@/store/preparation-store";

export function ResultScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { lastResult, currentChallenge, clearState } = useGameStore();
  const { reset } = usePreparationStore();

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Safely fallback if result is missing (navigated directly)
  if (!lastResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center text-gray-900">
        <h2 className="text-xl font-bold mb-2">
          {t("challenge.result.no_results_title" as TranslationKey)}
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          {t("challenge.result.no_results_desc" as TranslationKey)}
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          {t("challenge.result.go_home" as TranslationKey)}
        </button>
      </div>
    );
  }

  const challenge =
    currentChallenge || generateDailyChallenge(dayjs().format("YYYY-MM-DD"));
  const { finishTime, score, grade, outcome, story } = lastResult;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  const getOutcomeColor = () => {
    switch (outcome) {
      case "gold":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      case "silver":
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
      case "bronze":
        return "text-amber-600 bg-amber-600/10 border-amber-600/30";
      case "finish":
        return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "dnf":
        return "text-red-500 bg-red-500/10 border-red-500/30";
    }
  };

  const handleShare = async () => {
    const titleText = challenge.race.title[lang];
    const outcomeText = t(
      `challenge.result.outcome_${outcome}` as TranslationKey,
    );
    const headlineText = story.headline[lang];

    const text = `🏃‍♂️ RunQuest Daily Challenge: ${titleText}!
🏆 ${outcomeText} (${grade} Grade)
⏱️ ${t("challenge.result.time" as TranslationKey)}: ${formatTime(finishTime)}
🔥 ${t("history.score" as TranslationKey)}: ${score}/1000
📖 "${headlineText}"

Play now at: https://runquest.game`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy result:", err);
    }
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;

    setDownloading(true);
    try {
      // Small delay to ensure styles are evaluated
      await new Promise((resolve) => setTimeout(resolve, 100));
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        style: {
          transform: "scale(1)",
        },
      });

      const link = document.createElement("a");
      link.download = `runquest-result-${challenge.date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate PNG:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleBackHome = () => {
    clearState();
    reset();
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-background pb-24 text-gray-900"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-surface/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-gray-900">
            {t("challenge.result.title" as TranslationKey)}
          </h1>
          <button
            type="button"
            onClick={handleBackHome}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:bg-gray-50 active:scale-95"
            aria-label="Go Home"
          >
            <Home className="h-4.5 w-4.5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-8">
        {/* Core Stats Overview */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-around">
          {/* Medal / DNF Icon */}
          <div
            className={`flex flex-col items-center p-6 rounded-2xl border ${getOutcomeColor()}`}
          >
            <Award className="h-16 w-16 mb-2" />
            <span className="text-xs uppercase tracking-widest font-bold">
              {t(
                `challenge.result.outcome_${outcome}` as TranslationKey,
              ).toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              {t("challenge.result.grade" as TranslationKey)}
            </span>
            <span className="text-6xl font-black font-heading text-gray-900">
              {grade}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              {t("history.score" as TranslationKey)}
            </span>
            <span className="text-4xl font-extrabold text-blue-600">
              {score}
            </span>
            <span className="text-[10px] text-gray-400">
              {t("challenge.result.score_out_of" as TranslationKey)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              {t("challenge.result.time" as TranslationKey)}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-2xl mt-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span>{formatTime(finishTime)}</span>
            </div>
          </div>
        </div>

        {/* Visual Share Card */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {t("challenge.result.share_card" as TranslationKey)}
          </h3>
          <div
            ref={cardRef}
            className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg select-none"
            style={{ minHeight: "340px" }}
          >
            {/* Absolute decorative gradient circles */}
            <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content layout */}
            <div className="flex flex-col justify-between h-full min-h-[280px]">
              {/* Logo / Title */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                    RunQuest Challenge
                  </span>
                  <h4 className="text-lg font-bold font-heading text-slate-100 mt-1">
                    {challenge.race.title[lang]}
                  </h4>
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-full px-3 py-1">
                  {challenge.date}
                </div>
              </div>

              {/* Center Medal and Grade */}
              <div className="flex items-center gap-6 my-6">
                <div
                  className={`p-4 rounded-2xl border ${getOutcomeColor()} bg-white/5`}
                >
                  <Award className="h-12 w-12" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                    {t("challenge.result.grade" as TranslationKey)}
                  </div>
                  <div className="text-4xl font-black font-heading mt-0.5">
                    {grade}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                    {t("history.score" as TranslationKey)}
                  </div>
                  <div className="text-3xl font-extrabold text-blue-400 mt-0.5">
                    {score}
                  </div>
                </div>
              </div>

              {/* Bottom stats and URL */}
              <div className="flex justify-between items-end border-t border-slate-800/60 pt-4">
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      {t("history.distance" as TranslationKey)}
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {challenge.race.distance} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      {t("history.time" as TranslationKey)}
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {formatTime(finishTime)}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-indigo-400 select-none">
                  runquest.game
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition active:scale-[0.99] border border-slate-850"
          >
            {downloading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>
                  {t("challenge.result.generating_image" as TranslationKey)}
                </span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>
                  {t("challenge.result.download_png" as TranslationKey)}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Narrative & Highlights Section */}
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Sparkles className="h-5 w-5 text-amber-550" />
            <h2 className="font-heading text-lg font-bold text-gray-800">
              {story.headline[lang]}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            {story.summary[lang]}
          </p>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t("challenge.result.story_headline" as TranslationKey)}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {story.highlights.map((h) => (
                <li
                  key={h.en}
                  className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3"
                >
                  {h[lang]}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Coaching Lessons learned */}
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h2 className="font-heading text-lg font-bold text-gray-800">
              {t("challenge.result.lessons_learned" as TranslationKey)}
            </h2>
          </div>
          <ul className="flex flex-col gap-3">
            {story.lessons.map((lesson) => (
              <li
                key={lesson.en}
                className="text-xs leading-relaxed text-gray-600 flex items-start gap-2"
              >
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>{lesson[lang]}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Action Button Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <button
            type="button"
            onClick={handleShare}
            className="flex-grow flex items-center justify-center gap-2 px-6 py-4 border-2 border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-[0.98] rounded-full text-base font-semibold transition duration-200"
          >
            {copied ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{t("challenge.result.copied" as TranslationKey)}</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span>{t("challenge.result.share" as TranslationKey)}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBackHome}
            className="flex-grow flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] rounded-full text-base font-semibold shadow-sm transition duration-200"
          >
            <span>{t("challenge.result.back_home" as TranslationKey)}</span>
          </button>
        </div>
      </main>

      {/* Hidden high-res export card */}
      <div
        className="absolute top-0 left-0 pointer-events-none opacity-0"
        style={{ position: "absolute", left: "-9999px" }}
      >
        <div
          ref={shareCardRef}
          className="w-[800px] h-[450px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-slate-800 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-between"
        >
          {/* Absolute decorative gradient circles */}
          <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo / Title */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[12px] font-extrabold uppercase tracking-widest text-indigo-400">
                RunQuest Daily Challenge
              </span>
              <h4 className="text-3xl font-black font-heading text-slate-100 mt-2">
                {challenge.race.title[lang]}
              </h4>
            </div>
            <div className="text-[12px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-full px-4 py-1.5">
              {challenge.date}
            </div>
          </div>

          {/* Center stats */}
          <div className="flex items-center gap-12 my-4">
            <div
              className={`p-5 rounded-2xl border ${getOutcomeColor()} bg-white/5`}
            >
              <Award className="h-20 w-20" />
            </div>
            <div>
              <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">
                {t("challenge.result.grade" as TranslationKey)}
              </div>
              <div className="text-7xl font-black font-heading mt-1 text-slate-100">
                {grade}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">
                {t("history.score" as TranslationKey)}
              </div>
              <div className="text-6xl font-black font-heading mt-1 text-blue-400">
                {score}
              </div>
            </div>
          </div>

          {/* Bottom stats and URL */}
          <div className="flex justify-between items-end border-t border-slate-800 pt-6">
            <div className="flex gap-8">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">
                  {t("history.distance" as TranslationKey)}
                </span>
                <span className="text-xl font-bold text-slate-200">
                  {challenge.race.distance} km
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-550 uppercase tracking-wider block">
                  {t("history.time" as TranslationKey)}
                </span>
                <span className="text-xl font-bold text-slate-200">
                  {formatTime(finishTime)}
                </span>
              </div>
            </div>
            <div className="text-lg font-black text-indigo-400 tracking-tight">
              runquest.game
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
