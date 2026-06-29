"use client";

import {
  Award,
  BookOpen,
  Clock,
  Copy,
  Home,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useGameStore } from "@/store/game-store";
import { usePreparationStore } from "@/store/preparation-store";

export function ResultScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { lastResult, clearState } = useGameStore();
  const { reset } = usePreparationStore();

  const [copied, setCopied] = useState(false);

  // Safely fallback if result is missing (navigated directly)
  if (!lastResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center text-gray-900">
        <h2 className="text-xl font-bold mb-2">No active results found</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Please complete a challenge first.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          Go Home
        </button>
      </div>
    );
  }

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
    const text = `🏃‍♂️ RunQuest Daily Challenge Result!
🏆 Outcome: ${outcome.toUpperCase()} (${grade} Grade)
⏱️ Finish Time: ${formatTime(finishTime)}
🔥 Score: ${score}/1000
📖 "${story.headline[lang]}"

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

  const handleBackHome = () => {
    clearState();
    reset();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white/90 px-6 py-4 backdrop-blur-md">
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
              {outcome.toUpperCase()}
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
              Score
            </span>
            <span className="text-4xl font-extrabold text-blue-600">
              {score}
            </span>
            <span className="text-[10px] text-gray-400">out of 1000</span>
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

        {/* Narrative & Highlights Section */}
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
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
                <span>Copied!</span>
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
    </div>
  );
}
