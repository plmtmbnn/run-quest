"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { useTranslation } from "@/i18n/use-translation";
import type { StoryChapter, StoryProgress } from "@/story/story-types";

interface ChapterProgressCardProps {
  chapter: StoryChapter;
  storyProgress: StoryProgress;
  isUnlocked: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
  progressPercent: number;
  onClick?: () => void;
}

/**
 * Chapter Progress Card - Shows individual chapter status
 */
export function ChapterProgressCard({
  chapter,
  storyProgress,
  isUnlocked,
  isCurrent,
  isCompleted,
  progressPercent,
  onClick,
}: ChapterProgressCardProps) {
  const { language: lang } = useTranslation();

  const getStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (isCurrent) {
      return <Circle className="w-6 h-6 text-blue-500 fill-blue-500" />;
    }
    if (!isUnlocked) {
      return <Lock className="w-6 h-6 text-gray-500" />;
    }
    return <Circle className="w-6 h-6 text-gray-400" />;
  };

  const getCardStyles = () => {
    if (isCompleted) {
      return "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 hover:scale-[1.01] shadow-sm";
    }
    if (isCurrent) {
      return "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 hover:scale-[1.01] shadow-md shadow-blue-500/5 ring-2 ring-blue-500/20";
    }
    if (!isUnlocked) {
      return "bg-slate-50/40 dark:bg-slate-950/10 border-slate-200/50 dark:border-slate-800/50 opacity-60 cursor-not-allowed grayscale-[0.5]";
    }
    return "bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-800 hover:scale-[1.01] shadow-sm";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: chapter.number * 0.1 }}
      className={`relative p-6 md:p-8 rounded-[2rem] border transition-transform duration-300 cursor-pointer ${getCardStyles()}`}
      onClick={isUnlocked ? onClick : undefined}
    >
      {/* Chapter number badge */}
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center font-black font-heading text-lg shadow-lg shadow-indigo-500/20 border-2 border-white dark:border-slate-900 text-white z-10">
        {chapter.number}
      </div>

      {/* Status icon */}
      <div className="absolute top-4 right-4">{getStatusIcon()}</div>

      {/* Chapter icon */}
      <div className="text-5xl mb-4 p-4 bg-white/50 dark:bg-slate-800/30 rounded-2xl inline-block border border-slate-200/50 dark:border-slate-700/30 shadow-sm">{chapter.icon}</div>

      {/* Title */}
      <h3 className="text-xl font-black font-heading tracking-tight text-slate-800 dark:text-white mb-1.5">{chapter.title[lang]}</h3>

      {/* Subtitle */}
      <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{chapter.subtitle[lang]}</p>

      {/* Synopsis (if unlocked) */}
      {isUnlocked && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
          {chapter.synopsis[lang]}
        </p>
      )}

      {/* Progress bar (if current chapter) */}
      {isCurrent && (
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
            <span className="text-slate-500 dark:text-slate-400">
              {lang === "en" ? "Progress" : "Progres"}
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-300/50 dark:border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements (if locked) */}
      {!isUnlocked && (
        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-[#E5E7EB] dark:border-slate-700/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {lang === "en" ? "Requires:" : "Membutuhkan:"}
          </p>
          <div className="flex flex-col gap-1.5 mt-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="text-amber-500">⭐</span>
              {lang === "en"
                ? `Level ${chapter.unlockRequirements.minLevel}`
                : `Level ${chapter.unlockRequirements.minLevel}`}
            </p>
            {chapter.unlockRequirements.previousChapterComplete && (
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="text-blue-500">📖</span>
                {lang === "en"
                  ? `Complete Chapter ${chapter.unlockRequirements.previousChapterComplete}`
                  : `Selesaikan Bab ${chapter.unlockRequirements.previousChapterComplete}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Rewards (if completed) */}
      {isCompleted && (
        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 font-bold uppercase tracking-wider text-[10px] rounded-xl flex items-center gap-1">
            ⭐ {chapter.rewards.xp} XP
          </span>
          <span className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-500 font-bold uppercase tracking-wider text-[10px] rounded-xl flex items-center gap-1">
            💰 {chapter.rewards.coins}
          </span>
        </div>
      )}

      {/* Estimated races */}
      {isUnlocked && !isCompleted && (
        <div className="mt-3 text-xs opacity-50">
          {lang === "en"
            ? `~${chapter.estimatedRaces} races`
            : `~${chapter.estimatedRaces} lomba`}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Chapter Overview Grid - Shows all chapters
 */
interface ChapterOverviewProps {
  chapters: StoryChapter[];
  storyProgress: StoryProgress;
  onChapterClick: (chapter: StoryChapter) => void;
}

export function ChapterOverview({
  chapters,
  storyProgress,
  onChapterClick,
}: ChapterOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chapters.map((chapter) => {
        const isUnlocked = storyProgress.unlockedChapters.includes(
          chapter.number,
        );
        const isCurrent = storyProgress.currentChapter === chapter.number;
        const isCompleted = storyProgress.completedChapters.includes(
          chapter.number,
        );
        const progressPercent = isCurrent
          ? Math.min(
              100,
              (storyProgress.totalStoryRaces / chapter.estimatedRaces) * 100,
            )
          : 0;

        return (
          <ChapterProgressCard
            key={chapter.id}
            chapter={chapter}
            storyProgress={storyProgress}
            isUnlocked={isUnlocked}
            isCurrent={isCurrent}
            isCompleted={isCompleted}
            progressPercent={progressPercent}
            onClick={() => onChapterClick(chapter)}
          />
        );
      })}
    </div>
  );
}
