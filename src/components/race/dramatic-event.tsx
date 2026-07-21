"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ActiveDramaticEvent } from "@/engine/emotional-events/event-types";
import { useTranslation } from "@/i18n/use-translation";

interface DramaticEventProps {
  event: ActiveDramaticEvent | null;
  onChoice?: (choiceId: string) => void;
  onDismiss?: () => void;
}

/**
 * Dramatic Event Component
 * Displays emotional race moments with optional player choices
 */
export function DramaticEventOverlay({
  event,
  onChoice,
  onDismiss,
}: DramaticEventProps) {
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  if (!event || event.resolved) return null;

  const { event: dramaticEvent } = event;
  const toneStyles = getToneStyles(dramaticEvent.emotionalTone);

  const handleChoice = (choiceId: string) => {
    if (onChoice) {
      onChoice(choiceId);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`max-w-lg w-full rounded-3xl border-4 ${toneStyles.border} ${toneStyles.bg} p-8 shadow-2xl`}
        >
          {/* Event Type Badge */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4"
          >
            <span
              className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${toneStyles.badge}`}
            >
              {dramaticEvent.emotionalTone}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-3xl font-black text-center mb-4 ${toneStyles.title}`}
          >
            {dramaticEvent.title[lang]}
          </motion.h2>

          {/* Kilometer Badge */}
          <div className="text-center mb-6">
            <span className="text-sm text-white/60">
              📍 Kilometer {Math.round(event.km)}
            </span>
          </div>

          {/* Description */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`${toneStyles.descBg} rounded-2xl p-6 mb-6`}
          >
            <p className="text-white text-lg leading-relaxed">
              {dramaticEvent.description[lang]}
            </p>
          </motion.div>

          {/* Choices or Auto-Continue */}
          {dramaticEvent.choices && dramaticEvent.choices.length > 0 ? (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {dramaticEvent.choices.map((choice, index) => (
                <motion.button
                  key={choice.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => handleChoice(choice.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    choice.risk === "high"
                      ? "border-red-500/50 bg-red-900/20 hover:bg-red-900/40 hover:border-red-400"
                      : choice.risk === "medium"
                        ? "border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-900/40 hover:border-yellow-400"
                        : "border-green-500/50 bg-green-900/20 hover:bg-green-900/40 hover:border-green-400"
                  } hover:scale-105 active:scale-95`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">
                      {choice.text[lang]}
                    </span>
                    {choice.risk && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          choice.risk === "high"
                            ? "bg-red-500 text-white"
                            : choice.risk === "medium"
                              ? "bg-yellow-500 text-black dark:bg-yellow-400 dark:text-black"
                              : "bg-green-500 text-white"
                        }`}
                      >
                        {choice.risk}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleDismiss}
              className="w-full py-4 rounded-xl bg-white/20 hover:bg-white/30 border-2 border-white/30 text-white font-bold transition-all hover:scale-105 active:scale-95"
            >
              Continue
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get styling based on emotional tone
 */
function getToneStyles(
  tone: "tense" | "inspiring" | "challenging" | "triumphant",
) {
  switch (tone) {
    case "tense":
      return {
        bg: "bg-gradient-to-br from-red-900 to-red-950",
        border: "border-red-500",
        badge: "bg-red-600 text-white",
        title: "text-red-200",
        descBg: "bg-black/30 border border-red-500/30",
      };
    case "inspiring":
      return {
        bg: "bg-gradient-to-br from-blue-900 to-blue-950",
        border: "border-blue-400",
        badge: "bg-blue-600 text-white",
        title: "text-blue-200",
        descBg: "bg-black/30 border border-blue-500/30",
      };
    case "challenging":
      return {
        bg: "bg-gradient-to-br from-orange-900 to-orange-950",
        border: "border-orange-500",
        badge: "bg-orange-600 text-white",
        title: "text-orange-200",
        descBg: "bg-black/30 border border-orange-500/30",
      };
    case "triumphant":
      return {
        bg: "bg-gradient-to-br from-green-900 to-green-950",
        border: "border-green-400",
        badge: "bg-green-600 text-white",
        title: "text-green-200",
        descBg: "bg-black/30 border border-green-500/30",
      };
  }
}
