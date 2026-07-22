"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ENDORPHIN_COLORS } from "@/engine/endorphins/endorphin-database";
import type { ActiveEndorphinRush } from "@/engine/endorphins/endorphin-types";
import { useTranslation } from "@/i18n/use-translation";

interface EndorphinRushOverlayProps {
  rush: ActiveEndorphinRush | null;
  onDismiss?: () => void;
}

/**
 * Endorphin Rush Overlay Component
 * Shows dramatic visual effects when player triggers endorphin rush
 */
export function EndorphinRushOverlay({
  rush,
  onDismiss,
}: EndorphinRushOverlayProps) {
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (rush && !rush.dismissed) {
      // Generate particles (fewer on mobile for performance)
      const particleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 12 : 20;
      setParticles(Array.from({ length: particleCount }, (_, i) => i));

      // Auto-dismiss after 2.5 seconds
      const timer = setTimeout(() => {
        if (onDismiss) {
          onDismiss();
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [rush, onDismiss]);

  if (!rush || rush.dismissed) return null;

  const messages = {
    mild: {
      en: "A surge of energy flows through you!",
      id: "Lonjakan energi mengalir melalui tubuhmu!",
    },
    moderate: {
      en: "Pure euphoria! The pain melts away!",
      id: "Euforia murni! Rasa sakit menghilang!",
    },
    intense: {
      en: "ENDORPHIN RUSH! You feel unstoppable!",
      id: "LONJAKAN ENDORFIN! Kamu merasa tak terhentikan!",
    },
    extreme: {
      en: "ULTIMATE RUSH! Pain is just an illusion now!",
      id: "LONJAKAN MAKSIMAL! Rasa sakit hanyalah ilusi sekarang!",
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
      >
        {/* Pink/Purple gradient vignette pulsing */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: 2,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 20%, ${ENDORPHIN_COLORS.vignette} 80%)`,
          }}
        />

        {/* Flash effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 bg-gradient-to-br ${ENDORPHIN_COLORS.glow} opacity-20`}
        />

        {/* Particle system */}
        {particles.map((i) => (
          <motion.div
            key={i}
            initial={{
              x: typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
              y: typeof window !== "undefined" ? window.innerHeight + 50 : 0,
              opacity: 0,
            }}
            animate={{
              y: -100,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5 + Math.random() * 0.5,
              delay: Math.random() * 0.5,
              ease: "easeOut",
            }}
            className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full ${ENDORPHIN_COLORS.particle} blur-sm`}
          />
        ))}

        {/* Center content */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative z-10 text-center px-6 sm:px-8 pointer-events-auto"
        >
          {/* Main badge */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: 3,
            }}
            className={`inline-block px-8 py-4 sm:px-12 sm:py-6 rounded-3xl bg-gradient-to-br ${ENDORPHIN_COLORS.glow} shadow-2xl border-4 ${ENDORPHIN_COLORS.border}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Icon */}
              <div className="text-6xl sm:text-8xl mb-2 sm:mb-4 animate-pulse">⚡</div>

              {/* Title */}
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider mb-2 sm:mb-3 drop-shadow-lg">
                {rush.intensity === "extreme" || rush.intensity === "intense"
                  ? "ENDORPHIN RUSH!"
                  : "Power Surge!"}
              </h2>

              {/* Message */}
              <p className={`text-base sm:text-xl font-bold ${ENDORPHIN_COLORS.text} mb-3 sm:mb-4`}>
                {messages[rush.intensity][lang]}
              </p>

              {/* Effects display */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-2 sm:gap-3"
              >
                {rush.effects.energyBoost > 0 && (
                  <div className="px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-green-500/90 text-white text-xs sm:text-sm font-bold">
                    ⚡ +{rush.effects.energyBoost} Energy
                  </div>
                )}
                {rush.effects.paceBonus < 0 && (
                  <div className="px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-blue-500/90 text-white text-xs sm:text-sm font-bold">
                    🏃 {Math.abs(rush.effects.paceBonus)}s/km Faster
                  </div>
                )}
                {rush.effects.painSuppression > 0 && (
                  <div className="px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-purple-500/90 text-white text-xs sm:text-sm font-bold">
                    🛡️ Pain Blocked
                  </div>
                )}
                {rush.effects.confidenceBoost > 0 && (
                  <div className="px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-yellow-500/90 text-white text-xs sm:text-sm font-bold">
                    ⭐ +{rush.effects.confidenceBoost} Confidence
                  </div>
                )}
              </motion.div>

              {/* Duration indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 sm:mt-4 text-xs sm:text-sm text-pink-200/80"
              >
                Duration: {rush.effects.duration}km
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Warning text for high intensity */}
          {(rush.intensity === "intense" || rush.intensity === "extreme") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 sm:mt-6"
            >
              <p className="text-xs sm:text-sm text-yellow-400 font-semibold">
                ⚠️ {lang === "en" ? "High risk - crash may follow" : "Risiko tinggi - mungkin crash setelahnya"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
