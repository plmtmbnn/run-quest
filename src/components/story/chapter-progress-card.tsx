"use client";

import { motion } from "framer-motion";
import { Lock, CheckCircle, Circle } from "lucide-react";
import { useTranslation } from "@/i18n/use-translation";
import type { StoryChapter } from "@/story/story-types";
import type { StoryProgress } from "@/story/story-types";

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
      return "bg-green-500/10 border-green-500/50 hover:bg-green-500/20";
    }
    if (isCurrent) {
      return "bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20";
    }
    if (!isUnlocked) {
      return "bg-gray-500/5 border-gray-500/20 opacity-60 cursor-not-allowed";
    }
    return "bg-neutral-500/10 border-neutral-500/30 hover:bg-neutral-500/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: chapter.number * 0.1 }}
      className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${getCardStyles()}`}
      onClick={isUnlocked ? onClick : undefined}
    >
      {/* Chapter number badge */}
      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-lg shadow-lg">
        {chapter.number}
      </div>

      {/* Status icon */}
      <div className="absolute top-4 right-4">{getStatusIcon()}</div>

      {/* Chapter icon */}
      <div className="text-4xl mb-3">{chapter.icon}</div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-1">{chapter.title[lang]}</h3>

      {/* Subtitle */}
      <p className="text-sm opacity-70 mb-3">{chapter.subtitle[lang]}</p>

      {/* Synopsis (if unlocked) */}
      {isUnlocked && (
        <p className="text-xs opacity-60 mb-4 line-clamp-2">
          {chapter.synopsis[lang]}
        </p>
      )}

      {/* Progress bar (if current chapter) */}
      {isCurrent && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="opacity-70">
              {lang === "en" ? "Progress" : "Progres"}
            </span>
            <span className="font-semibold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Requirements (if locked) */}
      {!isUnlocked && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg">
          <p className="text-xs opacity-60">
            {lang === "en" ? "Requires:" : "Membutuhkan:"}
          </p>
          <p className="text-xs font-semibold mt-1">
            {lang === "en" ? `Level ${chapter.unlockRequirements.minLevel}` : `Level ${chapter.unlockRequirements.minLevel}`}
          </p>
          {chapter.unlockRequirements.previousChapterComplete && (
            <p className="text-xs mt-1">
              {lang === "en"
                ? `Complete Chapter ${chapter.unlockRequirements.previousChapterComplete}`
                : `Selesaikan Bab ${chapter.unlockRequirements.previousChapterComplete}`}
            </p>
          )}
        </div>
      )}

      {/* Rewards (if completed) */}
      {isCompleted && (
        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="px-2 py-1 bg-yellow-500/20 rounded text-xs">
            {chapter.rewards.xp} XP
          </span>
          <span className="px-2 py-1 bg-yellow-500/20 rounded text-xs">
            {chapter.rewards.coins} 💰
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
        const isUnlocked = storyProgress.unlockedChapters.includes(chapter.number);
        const isCurrent = storyProgress.currentChapter === chapter.number;
        const isCompleted = storyProgress.completedChapters.includes(chapter.number);
        const progressPercent = isCurrent
          ? Math.min(100, (storyProgress.totalStoryRaces / chapter.estimatedRaces) * 100)
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
