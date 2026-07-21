"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DESERATION_OPTIONS } from "@/engine/desperation/desperation-engine";
import type { DesperationMode } from "@/engine/desperation/desperation-types";
import { useTranslation } from "@/i18n/use-translation";

interface DesperationOverlayProps {
  desperation: DesperationMode | null;
  onChoose: (optionId: string) => void;
}

export function DesperationOverlay({
  desperation,
  onChoose,
}: DesperationOverlayProps) {
  const { language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  if (!desperation) return null;

  // Contextual messaging based on condition
  let conditionTextEn = "It comes down to who wants it more!";
  let conditionTextId = "Ini ditentukan oleh siapa yang menginginkannya lebih!";

  if (desperation.condition === "winning") {
    conditionTextEn = "Don't let them catch you! Hold the line!";
    conditionTextId = "Jangan biarkan mereka menyusul! Pertahankan posisi!";
  } else if (desperation.condition === "losing") {
    conditionTextEn = "This is your last chance! Give everything!";
    conditionTextId = "Ini kesempatan terakhirmu! Berikan segalanya!";
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        {/* Pulsing Red Heartbeat Vignette */}
        <motion.div
          animate={{
            boxShadow: [
              "inset 0 0 40px rgba(220, 38, 38, 0.4)",
              "inset 0 0 100px rgba(220, 38, 38, 0.7)",
              "inset 0 0 40px rgba(220, 38, 38, 0.4)",
            ],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Shaking Container for do-or-die feel */}
        <motion.div
          animate={{
            x: [-1, 1, -1, 1, 0],
            y: [-1, -1, 1, 1, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 0.5,
            repeatType: "mirror",
          }}
          className="relative max-w-xl w-full mx-4 text-center px-6"
        >
          {/* Heart pounding icon/message */}
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="text-red-500 text-6xl mb-4"
          >
            ❤️‍🔥
          </motion.div>

          <h2 className="text-red-500 text-3xl font-black uppercase tracking-wider mb-2 animate-pulse">
            {lang === "id" ? "MODE PUTUS ASA" : "DESPERATION MODE"}
          </h2>

          <h3 className="text-white text-xl font-extrabold mb-6">
            {lang === "id" ? conditionTextId : conditionTextEn}
          </h3>

          <div className="bg-red-950/40 border border-red-500/30 rounded-3xl p-5 mb-8 backdrop-blur-sm">
            <p className="text-white/90 text-sm leading-relaxed font-semibold">
              {lang === "id"
                ? "Satu kilometer tersisa. Tubuh Anda berteriak lelah, tetapi garis akhir sudah dekat. Bagaimana Anda mendorong langkah terakhir ini?"
                : "One kilometer remaining. Your body is screaming, but the finish line is right there. How do you push through the final stretch?"}
            </p>
          </div>

          {/* Strategic Choices */}
          <div className="space-y-3">
            {DESERATION_OPTIONS.map((option, index) => {
              const borderStyles =
                option.risk === "high"
                  ? "border-red-600 bg-red-950/20 hover:bg-red-950/45 text-red-100"
                  : option.risk === "medium"
                    ? "border-orange-500 bg-orange-950/20 hover:bg-orange-950/45 text-orange-100"
                    : "border-slate-500 bg-slate-900/20 hover:bg-slate-900/45 text-slate-100";

              const riskBadgeStyles =
                option.risk === "high"
                  ? "bg-red-600"
                  : option.risk === "medium"
                    ? "bg-orange-500 text-black dark:bg-orange-400 dark:text-black"
                    : "bg-slate-500";

              return (
                <motion.button
                  key={option.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                  onClick={() => onChoose(option.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-105 active:scale-95 ${borderStyles}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm mb-1 uppercase tracking-wide">
                        {option.action[lang]}
                      </h4>
                      <p className="text-xs text-white/70 leading-snug">
                        {option.description[lang]}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full text-white ${riskBadgeStyles}`}
                    >
                      {option.risk}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
