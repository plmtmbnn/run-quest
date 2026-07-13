"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/use-translation";
import type { MilestoneAchievement } from "@/progression/milestone-types";

interface MilestoneCelebrationProps {
  achievement: MilestoneAchievement | null;
  onComplete: () => void;
}

/**
 * Milestone Celebration Modal
 * Celebrates player achievements with style
 */
export function MilestoneCelebration({
  achievement,
  onComplete,
}: MilestoneCelebrationProps) {
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  useEffect(() => {
    if (achievement) {
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  if (!achievement) return null;

  const { milestone } = achievement;
  const rarityColors = getRarityColors(milestone.rarity || "common");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onComplete}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 blur-3xl opacity-50 ${rarityColors.glow}`}
          />

          {/* Main Card */}
          <div
            className={`relative bg-gradient-to-br ${rarityColors.bg} rounded-3xl p-8 border-4 ${rarityColors.border} shadow-2xl`}
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-4"
            >
              <div
                className={`text-sm font-bold uppercase tracking-wider ${rarityColors.text} mb-2`}
              >
                🎉 Milestone Achieved
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${rarityColors.badge}`}
              >
                {milestone.rarity?.toUpperCase() || "COMMON"}
              </div>
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.3, duration: 0.7 }}
              className="text-center mb-4"
            >
              <div className="text-8xl mb-2">{milestone.icon}</div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-black text-center text-white mb-3"
            >
              {milestone.name[lang]}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-white/80 text-sm mb-4"
            >
              {milestone.description[lang]}
            </motion.p>

            {/* Celebration Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20"
            >
              <p className="text-white text-center italic font-medium">
                "{milestone.celebrationText[lang]}"
              </p>
            </motion.div>

            {/* Rewards */}
            {milestone.rewards && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-4"
              >
                {milestone.rewards.xp && milestone.rewards.xp > 0 && (
                  <div className="bg-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="text-white font-bold">
                      +{milestone.rewards.xp} XP
                    </span>
                  </div>
                )}
                {milestone.rewards.coins && milestone.rewards.coins > 0 && (
                  <div className="bg-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-white font-bold">
                      +{milestone.rewards.coins}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Continue Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center mt-6 text-white/50 text-xs"
            >
              Click anywhere to continue
            </motion.div>
          </div>
        </motion.div>

        {/* Particle Effects */}
        <ParticleEffect color={rarityColors.particleColor} />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get rarity-specific colors
 */
function getRarityColors(rarity: "common" | "rare" | "epic" | "legendary") {
  switch (rarity) {
    case "common":
      return {
        bg: "from-blue-600 to-blue-800",
        border: "border-blue-400",
        text: "text-blue-200",
        badge: "bg-blue-500 text-white",
        glow: "bg-blue-500",
        particleColor: "#60A5FA",
      };
    case "rare":
      return {
        bg: "from-purple-600 to-purple-800",
        border: "border-purple-400",
        text: "text-purple-200",
        badge: "bg-purple-500 text-white",
        glow: "bg-purple-500",
        particleColor: "#A78BFA",
      };
    case "epic":
      return {
        bg: "from-orange-600 to-red-800",
        border: "border-orange-400",
        text: "text-orange-200",
        badge: "bg-orange-500 text-white",
        glow: "bg-orange-500",
        particleColor: "#FB923C",
      };
    case "legendary":
      return {
        bg: "from-yellow-500 via-orange-500 to-red-600",
        border: "border-yellow-400",
        text: "text-yellow-200",
        badge: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
        glow: "bg-yellow-500",
        particleColor: "#FBBF24",
      };
  }
}

/**
 * Particle Effect Component
 */
function ParticleEffect({ color }: { color: string }) {
  const particles = Array.from({ length: 30 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
            y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x:
              typeof window !== "undefined"
                ? (Math.random() - 0.5) * window.innerWidth
                : 0,
            y:
              typeof window !== "undefined"
                ? (Math.random() - 0.5) * window.innerHeight
                : 0,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: Math.random() * 1.5 + 1,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
