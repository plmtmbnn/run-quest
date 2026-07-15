"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DailyStatsCard } from "@/components/share/daily-stats-card";
import { ShareModal } from "@/components/share/share-modal";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { storageRepository } from "@/storage/storage-repository";
import type { RaceHistoryEntry } from "@/storage/types";
import { usePlayerStore } from "@/store/player-store";
import { useTimelineStore } from "@/store/timeline-store";

export function HistoryScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [entries, setEntries] = useState<RaceHistoryEntry[]>([]);
  const player = usePlayerStore((state) => state.player);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);

  const shareTitle = t("share.stats.title" as TranslationKey);
  const shareText = `📊 RunQuest — ${t("share.stats.title" as TranslationKey)}:
🏃 Runner #${player?.id.slice(0, 8).toUpperCase()}

🔥 Streak: ${player?.statistics.currentStreak} Days
⚡ Total Runs: ${player?.statistics.totalRuns}
📏 Total Distance: ${player?.statistics.totalDistance} km
⭐ Perfect Runs: ${player?.statistics.perfectRuns || 0}

${t("share.stats.cta" as TranslationKey)} https://runquest.game`;

  useEffect(() => {
    const history = storageRepository.loadHistory();
    if (history) {
      // Sort entries so most recent is first
      const sorted = [...history.entries].sort(
        (a, b) =>
          new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
      );
      setEntries(sorted);
    }
  }, []);

  const formatTime = (secs: number) => {
    if (secs === 0) return "DNF";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "S":
        return "text-amber-500 bg-amber-50 border-amber-200";
      case "A":
        return "text-slate-650 bg-slate-50 border-slate-200";
      case "B":
        return "text-orange-500 bg-orange-50 border-orange-200";
      case "C":
        return "text-blue-500 bg-blue-50 border-blue-250";
      case "D":
        return "text-indigo-500 bg-indigo-50 border-indigo-200";
      default:
        return "text-red-500 bg-red-50 border-red-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-background flex flex-col pb-16"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-surface/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-50 active:scale-95"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                {t("history.title" as TranslationKey)}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                {t("history.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 shadow-sm text-gray-650 dark:text-gray-300"
            aria-label="Share career stats"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 flex flex-col">
        {entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <Trophy className="h-16 w-16 text-gray-350 mb-4 stroke-1" />
            <p className="text-gray-500 max-w-sm text-sm">
              {t("history.empty" as TranslationKey)}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
            >
              {t("history.back_home" as TranslationKey)}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <div
                key={entry.challengeId + entry.playedAt}
                className="bg-white rounded-3xl border-2 border-[#E5E7EB] p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Top metadata */}
                <div className="flex justify-between items-center border-b border-[#E5E7EB]/50 pb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dayjs(entry.playedAt).format("MMMM D, YYYY")}</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-full px-2.5 py-0.5">
                    {entry.challengeId.slice(0, 10)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base font-heading leading-snug">
                      {entry.headline}
                    </h3>
                  </div>

                  {/* Grade badge */}
                  <div
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 font-black font-heading text-lg shadow-sm ${getGradeColor(
                      entry.grade,
                    )}`}
                  >
                    {entry.grade}
                  </div>
                </div>

                {/* Bottom Stats details */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB]/40 text-center">
                  <div className="flex flex-col items-center bg-gray-50/50 rounded-xl py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      {t("history.score" as TranslationKey)}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {entry.score}
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50/50 rounded-xl py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      {t("history.time" as TranslationKey)}
                    </span>
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatTime(entry.finishTime)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50/50 rounded-xl py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                      {t("history.status" as TranslationKey)}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        entry.grade === "F"
                          ? "text-red-500"
                          : "text-emerald-600"
                      }`}
                    >
                      {entry.outcome === "dns"
                        ? t("history.dns_status" as TranslationKey)
                        : entry.outcome === "dnf"
                          ? t("history.dnf_status" as TranslationKey)
                          : t("history.completed_status" as TranslationKey)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {player && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          shareText={shareText}
          shareTitle={shareTitle}
          fileName={`runquest-stats-${player.id.slice(0, 8)}.png`}
        >
          <DailyStatsCard
            player={player}
            lang={language as "en" | "id"}
            date={`Day ${dayIndex}`}
          />
        </ShareModal>
      )}
    </motion.div>
  );
}
