"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CoachFeedbackMessage } from "@/training/training-types";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : "{" + k + "}",
  );
}

interface CoachFeedbackPanelProps {
  feedback: readonly (CoachFeedbackMessage | string)[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function CoachFeedbackPanel({
  feedback,
  isExpanded = true,
  onToggle,
}: CoachFeedbackPanelProps) {
  const { t } = useTranslation();

  // Categorize feedback by type
  const getFeedbackType = (msg: CoachFeedbackMessage) => {
    const key = msg.key;
    if (key.includes("good_") || key.includes("solid") || key.includes("great")) return "positive";
    if (key.includes("overtraining") || key.includes("no_rest") || key.includes("back_to_back") || key.includes("high_fatigue")) return "warning";
    if (key.includes("tip") || key.includes("add_") || key.includes("more_") || key.includes("decent")) return "tip";
    if (key.includes("great_race")) return "celebration";
    if (key.includes("taper")) return "race";
    return "neutral";
  };

  // Get icon and color for feedback type
  const getFeedbackIcon = (type: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      positive: { icon: "✅", color: "text-green-600 dark:text-green-400" },
      warning: { icon: "⚠️", color: "text-yellow-600 dark:text-yellow-400" },
      tip: { icon: "💡", color: "text-blue-600 dark:text-blue-400" },
      celebration: { icon: "🎉", color: "text-purple-600 dark:text-purple-400" },
      race: { icon: "🏁", color: "text-red-600 dark:text-red-400" },
      neutral: { icon: "👍", color: "text-slate-600 dark:text-slate-400" },
    };
    return icons[type] || icons.neutral;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-4 md:p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
          <span>👨🏫</span> {t("training.coach_feedback" as TranslationKey)}
        </h3>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {feedback.length > 0 ? (
              <div className="space-y-3">
                {feedback.map((item, index) => {
                  // Backward compat: legacy plans store raw strings
                  const msg: CoachFeedbackMessage = typeof item === "string"
                    ? { key: item }
                    : item;

                  const type = getFeedbackType(msg);
                  const { icon, color } = getFeedbackIcon(type);
                  const translated = msg.vars
                    ? interpolate(t(msg.key as TranslationKey), msg.vars)
                    : t(msg.key as TranslationKey);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-3 p-3 rounded-xl ${type === 'warning' ? 'bg-yellow-50/50 dark:bg-yellow-950/10' : type === 'positive' ? 'bg-green-50/50 dark:bg-green-950/10' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}
                    >
                      <span className={`text-xl ${color}`}>{icon}</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                        {translated}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-2xl mb-2 block">🤔</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("training.no_feedback" as TranslationKey)}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
