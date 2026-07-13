"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/use-translation";
import type { ActiveFlashback } from "@/memory/memory-types";

interface FlashbackOverlayProps {
  flashback: ActiveFlashback | null;
  onDismiss: () => void;
}

/**
 * Flashback Overlay Component
 * Shows memory-based emotional moments with sepia/blur effect
 */
export function FlashbackOverlay({
  flashback,
  onDismiss,
}: FlashbackOverlayProps) {
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  useEffect(() => {
    if (flashback && !flashback.dismissed) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [flashback, onDismiss]);

  if (!flashback || flashback.dismissed) return null;

  const { memory } = flashback;
  const impactStyles = getImpactStyles(memory.emotionalImpact);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      >
        {/* Blurred background with sepia tone */}
        <div className="absolute inset-0 backdrop-blur-md bg-black/40" />

        {/* Sepia vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(112, 66, 20, 0.4) 100%)",
          }}
        />

        {/* Memory content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative max-w-2xl w-full mx-4 px-8 py-12 text-center"
        >
          {/* Memory type badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${impactStyles.badge}`}
            >
              💭 {memory.type.toUpperCase()} MEMORY
            </span>
          </motion.div>

          {/* Flashback title */}
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-5xl font-black mb-8 ${impactStyles.title} drop-shadow-lg`}
          >
            {memory.title[lang]}
          </motion.h2>

          {/* Memory text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div
              className={`${impactStyles.textBg} rounded-3xl p-8 backdrop-blur-sm border-2 ${impactStyles.border}`}
            >
              <p
                className={`text-2xl leading-relaxed italic font-medium ${impactStyles.text}`}
              >
                "{memory.text[lang]}"
              </p>
            </div>
          </motion.div>

          {/* Effects indicator */}
          {(memory.effect.confidence ||
            memory.effect.willpower ||
            memory.effect.focus) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-4"
            >
              {memory.effect.confidence && (
                <div
                  className={`px-4 py-2 rounded-full ${impactStyles.effectBg}`}
                >
                  <span className="text-white font-bold">
                    +{memory.effect.confidence} Confidence
                  </span>
                </div>
              )}
              {memory.effect.willpower && (
                <div
                  className={`px-4 py-2 rounded-full ${impactStyles.effectBg}`}
                >
                  <span className="text-white font-bold">
                    +{memory.effect.willpower} Willpower
                  </span>
                </div>
              )}
              {memory.effect.focus && (
                <div
                  className={`px-4 py-2 rounded-full ${impactStyles.effectBg}`}
                >
                  <span className="text-white font-bold">
                    +{memory.effect.focus} Focus
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Click to continue hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-white/50 text-sm"
          >
            Click anywhere to continue
          </motion.div>
        </motion.div>

        {/* Film grain effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuNSIvPjwvc3ZnPg==)",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get styling based on emotional impact
 */
function getImpactStyles(
  impact: "motivating" | "haunting" | "inspiring" | "warning",
) {
  switch (impact) {
    case "motivating":
      return {
        badge: "bg-orange-600 text-white",
        title: "text-orange-200",
        text: "text-orange-100",
        textBg: "bg-orange-950/80",
        border: "border-orange-600/50",
        effectBg: "bg-orange-600",
      };
    case "haunting":
      return {
        badge: "bg-red-700 text-white",
        title: "text-red-200",
        text: "text-red-100",
        textBg: "bg-red-950/80",
        border: "border-red-600/50",
        effectBg: "bg-red-600",
      };
    case "inspiring":
      return {
        badge: "bg-blue-600 text-white",
        title: "text-blue-200",
        text: "text-blue-100",
        textBg: "bg-blue-950/80",
        border: "border-blue-600/50",
        effectBg: "bg-blue-600",
      };
    case "warning":
      return {
        badge: "bg-yellow-600 text-black",
        title: "text-yellow-200",
        text: "text-yellow-100",
        textBg: "bg-yellow-950/80",
        border: "border-yellow-600/50",
        effectBg: "bg-yellow-600",
      };
  }
}
