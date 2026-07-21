"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatGameDate } from "@/engine/timeline/calendar";
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
        return "text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/10 border-amber-100/30 dark:border-amber-950/30";
      case "A":
        return "text-slate-600 dark:text-slate-300 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-950/10 border-slate-100/30 dark:border-slate-850/30";
      case "B":
        return "text-orange-600 dark:text-orange-400 bg-orange-50/40 dark:bg-orange-950/10 border-orange-100/30 dark:border-orange-950/30";
      case "C":
        return "text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/10 border-blue-100/30 dark:border-blue-950/30";
      case "D":
        return "text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-100/30 dark:border-indigo-950/30";
      default:
        return "text-red-600 dark:text-red-400 bg-red-50/40 dark:bg-red-950/10 border-red-100/30 dark:border-red-950/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white flex flex-col pb-16"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-gray-800 bg-white/95 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-black text-slate-900 dark:text-white">
                {t("history.title" as TranslationKey)}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("history.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 shadow-sm text-gray-600 dark:text-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
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
            <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-400 mb-4 stroke-1" />
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
              {t("history.empty" as TranslationKey)}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-sm font-semibold active:scale-95 transition-all shadow-md shadow-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              {t("history.back_home" as TranslationKey)}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry) => (
              <motion.div
                key={entry.challengeId + entry.playedAt}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Top metadata */}
                <div className="flex justify-between items-center border-b border-[#E5E7EB]/50 dark:border-slate-800/50 pb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dayjs(entry.playedAt).format("MMMM D, YYYY")}</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-full px-2.5 py-0.5">
                    {entry.challengeId.slice(0, 10)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="font-heading font-bold text-slate-800 dark:text-white text-base leading-snug">
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
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB]/40 dark:border-slate-800/40 text-center">
                  <div className="flex flex-col items-center bg-gray-50/50 dark:bg-slate-800/20 rounded-xl py-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                      {t("history.score" as TranslationKey)}
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-white">
                      {entry.score}
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50/50 dark:bg-slate-800/20 rounded-xl py-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                      {t("history.time" as TranslationKey)}
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      {formatTime(entry.finishTime)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50/50 dark:bg-slate-800/20 rounded-xl py-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                      {t("history.status" as TranslationKey)}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        entry.grade === "F"
                          ? "text-red-500 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
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
              </motion.div>
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
            date={formatGameDate(dayIndex)}
          />
        </ShareModal>
      )}
    </motion.div>
  );
}
