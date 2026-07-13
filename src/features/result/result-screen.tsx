"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Award, BookOpen, Clock, Home, Share2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoachQuoteCard } from "@/components/share/coach-quote-card";
import { EventHighlightCard } from "@/components/share/event-highlight-card";
import { RaceReportCard } from "@/components/share/race-report-card";
import { ShareModal } from "@/components/share/share-modal";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { useGameStore } from "@/store/game-store";
import { usePreparationStore } from "@/store/preparation-store";
import type { RaceEvent } from "@/types/engine";

export function ResultScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { lastResult, currentChallenge, clearState } = useGameStore();
  const { reset } = usePreparationStore();

  // Share States
  const [isReportShareOpen, setIsReportShareOpen] = useState(false);
  const [activeCoachQuote, setActiveCoachQuote] = useState<string | null>(null);
  const [activeEventHighlight, setActiveEventHighlight] =
    useState<RaceEvent | null>(null);

  // Safely fallback if result is missing (navigated directly)
  if (!lastResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold mb-2">
          {t("challenge.result.no_results_title" as TranslationKey)}
        </h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6 text-sm">
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

  const formatPace = (seconds: number) => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}/km`;
  };

  // Filter out km 0 and compute splits
  const splits = (lastResult.stateLog || [])
    .filter((state) => state.distanceCovered > 0)
    .map((state, index, arr) => {
      const prev = index === 0 ? lastResult.stateLog[0] : arr[index - 1];
      const splitTime = state.accumulatedTime - prev.accumulatedTime;
      return {
        km: state.distanceCovered,
        time: splitTime,
        energy: state.energy,
        hydration: state.hydration,
        focus: state.focus,
      };
    });

  const fastestSplit =
    splits.length > 0 ? Math.min(...splits.map((s) => s.time)) : 0;

  const getLeaderboard = () => {
    const finalState =
      lastResult.stateLog && lastResult.stateLog.length > 0
        ? lastResult.stateLog[lastResult.stateLog.length - 1]
        : null;

    if (!finalState || !finalState.opponents) return [];

    const entries = [
      {
        name: t("challenge.result.you" as TranslationKey) || "You",
        time: lastResult.finishTime,
        isDNF: outcome === "dnf",
        isPlayer: true,
        isNemesis: false,
      },
      ...finalState.opponents.map((opp) => ({
        name: opp.name,
        time: opp.accumulatedTime,
        isDNF: opp.isDNF,
        isPlayer: false,
        isNemesis: opp.isNemesis || false,
      })),
    ];

    // Sort by DNF at the bottom, then by time ascending
    return entries.sort((a, b) => {
      if (a.isDNF && !b.isDNF) return 1;
      if (!a.isDNF && b.isDNF) return -1;
      return a.time - b.time;
    });
  };

  const getMockComments = () => {
    const comments: {
      id: string;
      author: string;
      avatar: string;
      text: string;
      time: string;
    }[] = [];

    // Coach Sarah
    let sarahText =
      "Solid effort out there! Consistency is the foundation of improvement.";
    if (outcome === "gold") {
      sarahText =
        "Incredible race! Your pacing strategy and split times were executed to perfection. Gold medal well deserved!";
    } else if (outcome === "dnf") {
      sarahText =
        "Don't beat yourself up. Physical depletion happens. Let's adjust attributes in the Career tab and prepare properly next time.";
    } else if (outcome === "silver" || outcome === "bronze") {
      sarahText =
        "Excellent podium finish! You paced yourself well. A bit more speed attribute and you'll grab gold.";
    }
    comments.push({
      id: "coach-sarah",
      author: "Coach Sarah",
      avatar: "👩🏫",
      text: sarahText,
      time: "2m ago",
    });

    // Rival Alex
    let alexText = "Nice run today! I'm keeping an eye on your splits.";
    if (outcome === "gold") {
      alexText =
        "Wow, you flew past the pack! That final split was insane. Respect!";
    } else if (outcome === "dnf") {
      alexText =
        "Ouch, looked like a rough day out there. Rest up, we have another match tomorrow.";
    } else {
      alexText =
        "Good race! You had a solid cadence. I'm upgrading my speed stat to catch you next time.";
    }
    comments.push({
      id: "rival-alex",
      author: "Alex (Rival)",
      avatar: "🏃♂️",
      text: alexText,
      time: "10m ago",
    });

    // GritBot
    let botText = "beep boop... optimal efficiency detected. cadence stable.";
    if (outcome === "dnf") {
      botText =
        "beep boop... critical battery low. energy depletion detected at final segment. suggest hydration focus.";
    } else if (grade === "S" || grade === "A") {
      botText =
        "beep boop... precision execution! pace variance < 3%. grade validation optimal.";
    }
    comments.push({
      id: "gritbot",
      author: "GritBot",
      avatar: "🤖",
      text: botText,
      time: "1h ago",
    });

    return comments;
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
      case "dns":
        return "text-red-500 bg-red-500/10 border-red-500/30";
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
      className="min-h-screen bg-background pb-24 text-gray-900 dark:text-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-surface/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
            {t("challenge.result.title" as TranslationKey)}
          </h1>
          <button
            type="button"
            onClick={handleBackHome}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-50 active:scale-95"
            aria-label="Go Home"
          >
            <Home className="h-4.5 w-4.5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-8">
        {/* Core Stats Overview */}
        <div className="rounded-[2rem] border border-[#E5E7EB] bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-around">
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
            <span className="text-6xl font-black font-heading text-gray-900 dark:text-white">
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
            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-100 text-2xl mt-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span>{formatTime(finishTime)}</span>
            </div>
          </div>
        </div>

        {/* Visual Share Card Preview */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {t("challenge.result.share_card" as TranslationKey)}
          </h3>

          <div className="relative overflow-hidden rounded-3xl border border-slate-250 dark:border-slate-800/60 bg-slate-950 p-4 flex justify-center shadow-inner">
            <div className="scale-[0.6] sm:scale-[0.8] origin-center my-[-80px] sm:my-[-40px] pointer-events-none transition-transform duration-200">
              <RaceReportCard
                challenge={challenge}
                outcome={outcome}
                grade={grade}
                score={score}
                finishTime={finishTime}
                lang={lang}
                date={challenge.date}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReportShareOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition active:scale-[0.99] border border-slate-850"
          >
            <Share2 className="h-4 w-4" />
            <span>{t("challenge.result.download_png" as TranslationKey)}</span>
          </button>
        </div>

        {/* Rival Leaderboard */}
        {getLeaderboard().length > 0 && (
          <section className="rounded-[2rem] border border-[#E5E7EB] bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <span className="text-lg">🏆</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                Rival Leaderboard
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {getLeaderboard().map((entry, idx) => {
                const isWinner = idx === 0 && !entry.isDNF;
                return (
                  <div
                    key={entry.name}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                      entry.isPlayer
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-950 dark:text-orange-350 font-semibold"
                        : "bg-gray-55/40 dark:bg-slate-900/30 border-gray-100 dark:border-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="font-heading font-black text-sm text-gray-400 dark:text-gray-500 min-w-[20px]">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        {entry.name}
                        {entry.isNemesis && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-extrabold uppercase tracking-wide">
                            Nemesis
                          </span>
                        )}
                        {entry.isPlayer && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-extrabold uppercase tracking-wide">
                            You
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      {entry.isDNF ? (
                        <span className="text-red-500 font-black">DNF</span>
                      ) : (
                        <span className="font-bold">
                          {formatTime(entry.time)}
                        </span>
                      )}
                      {isWinner && <span className="text-sm">👑</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Narrative & Highlights Section */}
        <section className="rounded-[2rem] border border-[#E5E7EB] bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Sparkles className="h-5 w-5 text-amber-550" />
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
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
              {story.highlights.map((h) => {
                const event = lastResult.events.find(
                  (e) =>
                    h.en.includes(`At km ${e.km}:`) ||
                    h.id.includes(`Di km ${e.km}:`),
                );

                return (
                  <li
                    key={h.en}
                    className="text-xs text-gray-700 dark:text-gray-250 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-xl p-3 flex items-center justify-between gap-4"
                  >
                    <span className="flex-grow leading-relaxed">{h[lang]}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (event) {
                          setActiveEventHighlight(event);
                        } else {
                          setActiveCoachQuote(h[lang]);
                        }
                      }}
                      className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition active:scale-90 flex-shrink-0"
                      aria-label="Share race moment"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Coaching Lessons learned */}
        <section className="rounded-[2rem] border border-[#E5E7EB] bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
              {t("challenge.result.lessons_learned" as TranslationKey)}
            </h2>
          </div>
          <ul className="flex flex-col gap-3">
            {story.lessons.map((lesson) => (
              <li
                key={lesson.en}
                className="text-xs leading-relaxed text-gray-600 flex items-center justify-between gap-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 p-3 rounded-xl"
              >
                <div className="flex items-start gap-2 flex-grow">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>{lesson[lang]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCoachQuote(lesson[lang])}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition active:scale-90 flex-shrink-0"
                  aria-label="Share coaching tip"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Interactive Splits Analysis */}
        {splits.length > 0 && (
          <section className="rounded-[2rem] border border-[#E5E7EB] bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                Interactive Splits Analysis
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-500 dark:text-gray-400">
                <thead className="text-[10px] text-slate-400 dark:text-gray-550 uppercase bg-slate-55 dark:bg-gray-800/40 rounded-xl">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-center">
                      KM
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Split Time
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Energy
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Hydration
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Pace Bar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/40 dark:divide-slate-800">
                  {splits.map((s) => {
                    const isFastest = s.time === fastestSplit;
                    return (
                      <tr
                        key={s.km}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20"
                      >
                        <td className="px-4 py-3 font-bold text-center text-slate-700 dark:text-white font-mono">
                          {s.km}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-gray-250 flex items-center gap-1">
                          {formatPace(s.time)}
                          {isFastest && (
                            <span
                              className="text-[10px] text-amber-500 animate-pulse"
                              title="Fastest Split"
                            >
                              ⚡
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {s.energy.toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {s.hydration.toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 w-1/3">
                          <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isFastest ? "bg-amber-400" : "bg-orange-500"}`}
                              style={{
                                width: `${Math.min(100, Math.max(10, (fastestSplit / s.time) * 100))}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Strava-style Mock Comments Feed */}
        <section className="rounded-[2rem] border border-[#E5E7EB] bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <span className="text-lg">💬</span>
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
              Social Comments Feed
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {getMockComments().map((comment, index) => (
              <div
                key={index}
                className="flex gap-3 items-start border-b border-slate-150/40 dark:border-slate-800/40 pb-3 last:border-0 last:pb-0"
              >
                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">
                  {comment.avatar}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black text-slate-850 dark:text-white">
                      {comment.author}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {comment.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Button Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <button
            type="button"
            onClick={() => setIsReportShareOpen(true)}
            className="flex-grow flex items-center justify-center gap-2 px-6 py-4 border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 active:scale-[0.98] rounded-[1.5rem] text-base font-semibold transition duration-200"
          >
            <Share2 className="h-5 w-5" />
            <span>{t("challenge.result.share" as TranslationKey)}</span>
          </button>

          <button
            type="button"
            onClick={handleBackHome}
            className="flex-grow flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] rounded-[1.5rem] text-base font-black shadow-md shadow-orange-500/20 transition duration-200"
          >
            <span>{t("challenge.result.back_home" as TranslationKey)}</span>
          </button>
        </div>
      </main>

      {/* Main performance share modal */}
      <ShareModal
        isOpen={isReportShareOpen}
        onClose={() => setIsReportShareOpen(false)}
        shareTitle={t("share.native_title" as TranslationKey)}
        shareText={`🏃‍♂️ RunQuest Daily Challenge: ${challenge.race.title[lang]}!
🏆 ${t(`challenge.result.outcome_${outcome}` as TranslationKey)} (${grade} Grade)
⏱️ ${t("challenge.result.time" as TranslationKey)}: ${formatTime(finishTime)}
🔥 ${t("history.score" as TranslationKey)}: ${score}/1000
📖 "${story.headline[lang]}"

Play now at: https://runquest.game`}
        fileName={`runquest-result-${challenge.date}.png`}
      >
        <RaceReportCard
          challenge={challenge}
          outcome={outcome}
          grade={grade}
          score={score}
          finishTime={finishTime}
          lang={lang}
          date={challenge.date}
        />
      </ShareModal>

      {/* Coach quote lesson share modal */}
      <ShareModal
        isOpen={activeCoachQuote !== null}
        onClose={() => setActiveCoachQuote(null)}
        shareTitle={t("share.coach.title" as TranslationKey)}
        shareText={`🎓 RunQuest Coach Tip:
"${activeCoachQuote}"
🏁 ${challenge.race.title[lang]} — Grade ${grade}

Get training lessons at https://runquest.game`}
        fileName={`runquest-coach-${challenge.date}.png`}
      >
        {activeCoachQuote && (
          <CoachQuoteCard
            lesson={activeCoachQuote}
            raceTitle={challenge.race.title[lang]}
            grade={grade}
            lang={lang}
            date={challenge.date}
          />
        )}
      </ShareModal>

      {/* Event highlight moment share modal */}
      <ShareModal
        isOpen={activeEventHighlight !== null}
        onClose={() => setActiveEventHighlight(null)}
        shareTitle={t("share.event.title" as TranslationKey)}
        shareText={(() => {
          if (!activeEventHighlight) return "";
          const effects: string[] = [];
          if (activeEventHighlight.effect.stamina !== 0) {
            effects.push(
              `${activeEventHighlight.effect.stamina > 0 ? "+" : ""}${activeEventHighlight.effect.stamina} Stamina`,
            );
          }
          if (activeEventHighlight.effect.hydration !== 0) {
            effects.push(
              `${activeEventHighlight.effect.hydration > 0 ? "+" : ""}${activeEventHighlight.effect.hydration} Hydration`,
            );
          }
          if (activeEventHighlight.effect.morale !== 0) {
            effects.push(
              `${activeEventHighlight.effect.morale > 0 ? "+" : ""}${activeEventHighlight.effect.morale} Focus`,
            );
          }
          if (activeEventHighlight.effect.pace !== 0) {
            effects.push(
              `${activeEventHighlight.effect.pace > 0 ? "+" : "-"}${Math.abs(activeEventHighlight.effect.pace)}s/km Pace`,
            );
          }
          const effectsStr =
            effects.length > 0 ? effects.join(", ") : "No impact";

          return `📍 RunQuest Race Moment [Km ${activeEventHighlight.km}]:
💥 ${activeEventHighlight.title[lang]}
💬 "${activeEventHighlight.description[lang]}"
⚡ Impact: ${effectsStr}

Experience the run at https://runquest.game`;
        })()}
        fileName={`runquest-moment-${challenge.date}-km${activeEventHighlight?.km}.png`}
      >
        {activeEventHighlight && (
          <EventHighlightCard
            event={activeEventHighlight}
            raceTitle={challenge.race.title[lang]}
            lang={lang}
            date={challenge.date}
          />
        )}
      </ShareModal>
    </motion.div>
  );
}
