/**
 * Race Day Alert Component
 * Sprint 33 - Feature 2: Race Day Alert Popup
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface RaceDayAlertProps {
  isOpen: boolean;
  onClose: () => void;
  raceTitle: string;
  raceDistance: number;
  autoCloseDelay?: number; // milliseconds
}

export function RaceDayAlert({
  isOpen,
  onClose,
  raceTitle,
  raceDistance,
  autoCloseDelay = 5000,
}: RaceDayAlertProps) {
  const { t } = useTranslation();
  const { playSound } = useSound();
  const [countdown, setCountdown] = useState(autoCloseDelay / 1000);

  useEffect(() => {
    if (!isOpen) return;

    // Play notification sound
    playSound("click");

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close after delay
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(autoCloseTimer);
    };
  }, [isOpen, autoCloseDelay, onClose, playSound]);

  // Reset countdown when reopened
  useEffect(() => {
    if (isOpen) {
      setCountdown(autoCloseDelay / 1000);
    }
  }, [isOpen, autoCloseDelay]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            {/* Alert Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl p-6 shadow-2xl shadow-indigo-500/20 max-w-sm w-full relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <X className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border-2 border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center animate-bounce">
                  <Flag className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">
                🏁 {t("alert.race_today.title" as TranslationKey)}
              </h3>

              {/* Message */}
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm mb-4">
                {t("alert.race_today.message" as TranslationKey, {
                  title: raceTitle,
                  distance: raceDistance,
                })}
              </p>

              {/* Race Info Box */}
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                    Today's Race
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {raceTitle}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {raceDistance} km
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                {t("alert.race_today.button" as TranslationKey)}
              </button>

              {/* Auto-close countdown */}
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                Auto-closing in {countdown}s...
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
