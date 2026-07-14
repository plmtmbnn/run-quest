"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Award } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { ChampionshipRace } from "@/story/story-types";

interface ChampionshipUnlockNotificationProps {
  championship: ChampionshipRace;
  onAccept: () => void;
  onDismiss: () => void;
}

/**
 * Championship Unlock Notification - Announces when championship race is available
 */
export function ChampionshipUnlockNotification({
  championship,
  onAccept,
  onDismiss,
}: ChampionshipUnlockNotificationProps) {
  const { lang } = useLanguage();

  const getDifficultyColor = () => {
    switch (championship.difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-orange-400";
      case "extreme":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getDifficultyLabel = () => {
    const labels = {
      easy: { en: "Easy", id: "Mudah" },
      medium: { en: "Medium", id: "Sedang" },
      hard: { en: "Hard", id: "Sulit" },
      extreme: { en: "Extreme", id: "Ekstrem" },
    };
    return labels[championship.difficulty][lang];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative max-w-xl w-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-2xl p-8 shadow-2xl"
      >
        {/* Trophy animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <Trophy className="w-20 h-20 text-yellow-400" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl"
            />
          </div>
        </motion.div>

        {/* Unlock message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-2 text-yellow-400">
            {lang === "en" ? "Championship Unlocked!" : "Kejuaraan Terbuka!"}
          </h2>
          {championship.unlockMessage && (
            <p className="text-sm opacity-80 mb-6">
              {championship.unlockMessage[lang]}
            </p>
          )}
        </motion.div>

        {/* Championship details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-black/30 rounded-xl p-6 mb-6"
        >
          <h3 className="text-2xl font-bold mb-2">{championship.title[lang]}</h3>
          <p className="text-sm opacity-70 mb-4">{championship.description[lang]}</p>

          {/* Race details grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 opacity-60" />
              <span className="text-sm">
                {championship.distance} km
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className={`w-4 h-4 ${getDifficultyColor()}`} />
              <span className={`text-sm font-semibold ${getDifficultyColor()}`}>
                {getDifficultyLabel()}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <p className="text-xs opacity-60 mb-1">
              {lang === "en" ? "Location:" : "Lokasi:"}
            </p>
            <p className="text-sm font-semibold">📍 {championship.location}</p>
          </div>

          {/* Stakes */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs opacity-60 mb-1">
              {lang === "en" ? "What's at stake:" : "Yang dipertaruhkan:"}
            </p>
            <p className="text-sm font-semibold">{championship.stakes[lang]}</p>
          </div>

          {/* Rivals */}
          {championship.rivalLineup && championship.rivalLineup.length > 0 && (
            <div className="mt-4">
              <p className="text-xs opacity-60 mb-2">
                {lang === "en" ? "Competing rivals:" : "Rival yang ikut:"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {championship.rivalLineup.map((rivalId) => (
                  <span
                    key={rivalId}
                    className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold"
                  >
                    {rivalId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4"
        >
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
          >
            {lang === "en" ? "Later" : "Nanti"}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-lg font-bold transition-all shadow-lg"
          >
            {lang === "en" ? "Race Now!" : "Lomba Sekarang!"}
          </button>
        </motion.div>

        {/* Required to complete notice */}
        {championship.requiredToComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 text-center text-xs opacity-60"
          >
            {lang === "en"
              ? "⚠️ You must win this race to continue the story"
              : "⚠️ Kamu harus memenangkan lomba ini untuk melanjutkan cerita"}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
