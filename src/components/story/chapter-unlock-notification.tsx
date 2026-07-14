"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { StoryChapter } from "@/story/story-types";

interface ChapterUnlockNotificationProps {
  chapter: StoryChapter;
  onContinue: () => void;
}

/**
 * Chapter Unlock Notification - Announces when a new chapter is unlocked
 */
export function ChapterUnlockNotification({
  chapter,
  onContinue,
}: ChapterUnlockNotificationProps) {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative max-w-2xl w-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400 rounded-2xl p-8 shadow-2xl"
      >
        {/* Sparkle effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-2xl blur-xl"
        />

        {/* Chapter icon with sparkles */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="relative flex justify-center mb-6"
        >
          <div className="text-7xl">{chapter.icon}</div>
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -top-4 -right-4"
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -bottom-4 -left-4"
          >
            <Sparkles className="w-6 h-6 text-blue-400" />
          </motion.div>
        </motion.div>

        {/* Chapter number badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex justify-center mb-4"
        >
          <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full font-bold">
            {lang === "en" ? `Chapter ${chapter.number}` : `Bab ${chapter.number}`}
          </div>
        </motion.div>

        {/* Unlock announcement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {lang === "en" ? "New Chapter Unlocked!" : "Bab Baru Terbuka!"}
          </h2>
        </motion.div>

        {/* Chapter details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-black/40 rounded-xl p-6 mb-6 backdrop-blur-sm"
        >
          <h3 className="text-3xl font-bold mb-2 text-center">
            {chapter.title[lang]}
          </h3>
          <p className="text-lg opacity-80 text-center mb-4">
            {chapter.subtitle[lang]}
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4" />
          <p className="text-sm opacity-70 text-center leading-relaxed">
            {chapter.synopsis[lang]}
          </p>
        </motion.div>

        {/* Unlocks preview */}
        {chapter.rewards.unlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <p className="text-xs opacity-60 text-center mb-3">
              {lang === "en" ? "Complete this chapter to unlock:" : "Selesaikan bab ini untuk membuka:"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {chapter.rewards.unlocks.slice(0, 3).map((unlock) => (
                <div
                  key={unlock.id}
                  className="px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
                >
                  <p className="text-xs font-semibold">{unlock.name[lang]}</p>
                </div>
              ))}
              {chapter.rewards.unlocks.length > 3 && (
                <div className="px-3 py-2 bg-white/5 rounded-lg">
                  <p className="text-xs opacity-60">
                    +{chapter.rewards.unlocks.length - 3} more
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={onContinue}
            className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center gap-2"
          >
            {lang === "en" ? "Begin Chapter" : "Mulai Bab"}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Estimated completion */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center text-xs opacity-50"
        >
          {lang === "en"
            ? `~${chapter.estimatedRaces} races to complete`
            : `~${chapter.estimatedRaces} lomba untuk menyelesaikan`}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
