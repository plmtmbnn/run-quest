"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ActiveClutchMoment } from "@/engine/clutch/clutch-types";
import { useTranslation } from "@/i18n/use-translation";

interface ClutchMomentProps {
  clutchMoment: ActiveClutchMoment | null;
  onDecision: (attempted: boolean) => void;
}

/**
 * Clutch Moment Component
 * High-stakes, do-or-die decision with dramatic presentation
 */
export function ClutchMomentOverlay({
  clutchMoment,
  onDecision,
}: ClutchMomentProps) {
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const [intensity, setIntensity] = useState(0);

  // Pulsing intensity effect
  useEffect(() => {
    if (clutchMoment && !clutchMoment.resolved) {
      const interval = setInterval(() => {
        setIntensity((prev) => (prev + 0.1) % 1);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [clutchMoment]);

  if (!clutchMoment || clutchMoment.resolved) return null;

  const { clutchMoment: moment } = clutchMoment;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        {/* Pulsing red vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(220, 38, 38, ${intensity * 0.3}) 100%)`,
          }}
        />

        {/* Screen shake effect container */}
        <motion.div
          animate={{
            x: [0, -2, 2, -2, 2, 0],
            y: [0, 2, -2, 2, -2, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="relative max-w-3xl w-full mx-4"
        >
          {/* CLUTCH badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block"
            >
              <span className="text-8xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                ⚡ CLUTCH MOMENT ⚡
              </span>
            </motion.div>
          </motion.div>

          {/* Stakes */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-center"
          >
            <div className="inline-block bg-red-900/50 backdrop-blur-sm border-4 border-red-500 rounded-2xl px-8 py-4">
              <p className="text-3xl font-black text-red-100 uppercase tracking-wide">
                {moment.stakes[lang]}
              </p>
            </div>
          </motion.div>

          {/* Situation */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-black/70 backdrop-blur-sm rounded-3xl p-8 mb-8 border-2 border-white/20"
          >
            <p className="text-2xl text-white leading-relaxed text-center font-semibold">
              {moment.setup[lang]}
            </p>
          </motion.div>

          {/* Decision buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* ATTEMPT button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDecision(true)}
              className="relative group"
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Button content */}
              <div className="relative bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 border-4 border-red-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔥</div>
                  <p className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                    {moment.decision.attempt[lang]}
                  </p>
                  <p className="text-sm text-red-200 font-semibold">
                    RISKY - All or Nothing
                  </p>
                </div>
              </div>
            </motion.button>

            {/* HOLD BACK button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDecision(false)}
              className="relative group"
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

              {/* Button content */}
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-8 border-4 border-slate-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🛡️</div>
                  <p className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                    {moment.decision.holdBack[lang]}
                  </p>
                  <p className="text-sm text-slate-300 font-semibold">
                    SAFE - Conservative Approach
                  </p>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Warning text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mt-8"
          >
            <p className="text-red-400 font-bold text-lg">
              ⚠️ THIS DECISION CANNOT BE UNDONE ⚠️
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
