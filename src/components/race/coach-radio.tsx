"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ActiveCoachRadio } from "@/coach/coach-radio-types";
import { useTranslation } from "@/i18n/use-translation";

interface CoachRadioProps {
  message: ActiveCoachRadio | null;
  onDismiss?: () => void;
}

/**
 * Coach Radio Component
 * Displays contextual coaching messages during races with animations
 */
export function CoachRadio({ message, onDismiss }: CoachRadioProps) {
  const { language } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  // Get tone-specific styling
  const toneStyles = getToneStyles(message.tone);
  const messageText =
    language === "id" ? message.message.id : message.message.en;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
        >
          <div
            className={`rounded-lg shadow-xl p-4 border-2 ${
              toneStyles.bg
            } ${toneStyles.border}`}
          >
            {/* Coach Icon and Header */}
            <div className="flex items-start gap-3">
              {/* Coach Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  toneStyles.iconBg
                }`}
              >
                <span className="text-xl">{toneStyles.icon}</span>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      toneStyles.label
                    }`}
                  >
                    🎙️ Coach Radio • Km {Math.round(message.km)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVisible(false);
                      if (onDismiss) onDismiss();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
                <p
                  className={`text-sm font-medium leading-snug ${
                    toneStyles.text
                  }`}
                >
                  {messageText}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div
              className="h-1 bg-gray-200 rounded-full mt-3 overflow-hidden"
              initial={{ width: "100%" }}
            >
              <motion.div
                className={toneStyles.progress}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Get styling based on message tone
 */
function getToneStyles(tone: ActiveCoachRadio["tone"]) {
  switch (tone) {
    case "encouraging":
      return {
        bg: "bg-blue-50",
        border: "border-blue-300",
        iconBg: "bg-blue-100",
        label: "text-blue-700",
        text: "text-blue-900",
        progress: "bg-blue-500 h-full",
        icon: "💪",
      };
    case "warning":
      return {
        bg: "bg-orange-50",
        border: "border-orange-300",
        iconBg: "bg-orange-100",
        label: "text-orange-700",
        text: "text-orange-900",
        progress: "bg-orange-500 h-full",
        icon: "⚠️",
      };
    case "excited":
      return {
        bg: "bg-green-50",
        border: "border-green-300",
        iconBg: "bg-green-100",
        label: "text-green-700",
        text: "text-green-900",
        progress: "bg-green-500 h-full",
        icon: "🔥",
      };
    case "concerned":
      return {
        bg: "bg-red-50",
        border: "border-red-300",
        iconBg: "bg-red-100",
        label: "text-red-700",
        text: "text-red-900",
        progress: "bg-red-500 h-full",
        icon: "😰",
      };
    case "proud":
      return {
        bg: "bg-purple-50",
        border: "border-purple-300",
        iconBg: "bg-purple-100",
        label: "text-purple-700",
        text: "text-purple-900",
        progress: "bg-purple-500 h-full",
        icon: "⭐",
      };
    case "tactical":
      return {
        bg: "bg-gray-50",
        border: "border-gray-300",
        iconBg: "bg-gray-100",
        label: "text-gray-700",
        text: "text-gray-900",
        progress: "bg-gray-500 h-full",
        icon: "🎯",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-300",
        iconBg: "bg-gray-100",
        label: "text-gray-700",
        text: "text-gray-900",
        progress: "bg-gray-500 h-full",
        icon: "🎙️",
      };
  }
}
