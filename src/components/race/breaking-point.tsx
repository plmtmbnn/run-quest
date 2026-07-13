"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ActiveBreakingPoint } from "@/engine/breaking-points/breaking-types";
import { useTranslation } from "@/i18n/use-translation";

interface BreakingPointOverlayProps {
  breakingPoint: ActiveBreakingPoint | null;
  onRecovery: (optionId: string) => void;
}

/**
 * Breaking Point Overlay Component
 * Shows physical/mental crisis with recovery options
 */
export function BreakingPointOverlay({
  breakingPoint,
  onRecovery,
}: BreakingPointOverlayProps) {
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  if (!breakingPoint || breakingPoint.resolved) return null;

  const { breakingPoint: bp } = breakingPoint;
  const severityStyles = getSeverityStyles(bp.severity);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      >
        {/* Pain vignette effect */}
        <div
          className={`absolute inset-0 ${severityStyles.vignette} pointer-events-none`}
        />

        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative max-w-2xl w-full mx-4"
        >
          {/* Warning Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center mb-6"
          >
            <div
              className={`inline-block px-6 py-3 rounded-full text-sm font-black uppercase ${severityStyles.badge}`}
            >
              ⚠️ {bp.severity} - {bp.type.replace("_", " ")}
            </div>
          </motion.div>

          {/* Onset Message */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 text-center"
          >
            <h2
              className={`text-4xl font-black ${severityStyles.title} uppercase`}
            >
              {bp.onsetMessage[lang]}
            </h2>
          </motion.div>

          {/* Symptoms */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`${severityStyles.bg} backdrop-blur-sm rounded-3xl p-6 mb-6 border-2 ${severityStyles.border}`}
          >
            <p className="text-xl text-white leading-relaxed text-center font-medium">
              {bp.symptoms[lang]}
            </p>
          </motion.div>

          {/* Recovery Options */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <p className="text-center text-white/80 font-semibold mb-4">
              How do you respond?
            </p>

            {bp.recoveryOptions.map((option, index) => {
              const riskColor =
                option.risk === "high"
                  ? "border-red-500 bg-red-900/30 hover:bg-red-900/50"
                  : option.risk === "medium"
                    ? "border-yellow-500 bg-yellow-900/30 hover:bg-yellow-900/50"
                    : "border-green-500 bg-green-900/30 hover:bg-green-900/50";

              return (
                <motion.button
                  key={option.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  onClick={() => onRecovery(option.id)}
                  className={`w-full p-4 rounded-xl border-2 ${riskColor} transition-all duration-200 hover:scale-105 active:scale-95`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-left flex-1">
                      {option.action[lang]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/70">
                        {Math.round(option.recoveryChance * 100)}% success
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          option.risk === "high"
                            ? "bg-red-500"
                            : option.risk === "medium"
                              ? "bg-yellow-500 text-black"
                              : "bg-green-500"
                        } text-white font-bold uppercase`}
                      >
                        {option.risk}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get styling based on severity
 */
function getSeverityStyles(severity: "warning" | "onset" | "critical") {
  switch (severity) {
    case "warning":
      return {
        vignette: "bg-gradient-radial from-transparent to-yellow-900/30",
        badge: "bg-yellow-600 text-white",
        title: "text-yellow-300",
        bg: "bg-yellow-950/60",
        border: "border-yellow-600/50",
      };
    case "onset":
      return {
        vignette: "bg-gradient-radial from-transparent to-orange-900/40",
        badge: "bg-orange-600 text-white",
        title: "text-orange-300",
        bg: "bg-orange-950/60",
        border: "border-orange-600/50",
      };
    case "critical":
      return {
        vignette: "bg-gradient-radial from-transparent to-red-900/50",
        badge: "bg-red-700 text-white",
        title: "text-red-300",
        bg: "bg-red-950/70",
        border: "border-red-600/50",
      };
  }
}
