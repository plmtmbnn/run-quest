"use client";

import { motion, type Transition } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/i18n/use-translation";
import type { StoryBeat } from "@/story/story-types";

interface StoryBeatCinematicProps {
  storyBeat: StoryBeat;
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * Story Beat Cinematic - Displays narrative moments with emotional styling
 */
export function StoryBeatCinematic({
  storyBeat,
  onComplete,
  onSkip,
}: StoryBeatCinematicProps) {
  const { language: lang } = useTranslation();

  const getToneStyles = () => {
    switch (storyBeat.emotionalTone) {
      case "inspiring":
        return "bg-gradient-to-b from-blue-500/20 to-purple-500/20 border-blue-400";
      case "tense":
        return "bg-gradient-to-b from-red-500/20 to-orange-500/20 border-red-400";
      case "triumphant":
        return "bg-gradient-to-b from-yellow-500/20 to-amber-500/20 border-yellow-400";
      case "reflective":
        return "bg-gradient-to-b from-gray-500/20 to-slate-500/20 border-gray-400";
      default:
        return "bg-gradient-to-b from-neutral-500/20 to-neutral-600/20 border-neutral-400";
    }
  };

  const getTextAnimation = () => {
    if (storyBeat.cinematicType === "flashback") {
      return {
        initial: { opacity: 0, scale: 1.2, filter: "blur(10px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        transition: {
          duration: 1.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        } as Transition,
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      } as Transition,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={storyBeat.skipable ? onSkip : undefined}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative max-w-2xl w-full mx-4 p-8 rounded-2xl border-2 ${getToneStyles()} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Skip button */}
        {storyBeat.skipable && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Skip"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Cinematic type indicator */}
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-wider opacity-60">
            {storyBeat.cinematicType === "dialogue" && "💬 Dialogue"}
            {storyBeat.cinematicType === "text" && "📖 Story"}
            {storyBeat.cinematicType === "montage" && "🎬 Montage"}
            {storyBeat.cinematicType === "flashback" && "⏪ Flashback"}
          </span>
        </div>

        {/* Title */}
        <motion.h2
          {...getTextAnimation()}
          className="text-3xl font-bold text-center mb-6"
        >
          {storyBeat.title[lang]}
        </motion.h2>

        {/* Content */}
        <motion.div
          {...getTextAnimation()}
          transition={
            {
              delay: 0.3,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            } as Transition
          }
          className={`text-lg leading-relaxed text-center ${
            storyBeat.cinematicType === "flashback" ? "italic opacity-80" : ""
          }`}
        >
          <p className="whitespace-pre-line">{storyBeat.content[lang]}</p>
        </motion.div>

        {/* Voice over (optional) */}
        {storyBeat.voiceOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              {
                delay: 1,
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
              } as Transition
            }
            className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <p className="text-sm italic opacity-70">
              {storyBeat.voiceOver[lang]}
            </p>
          </motion.div>
        )}

        {/* Character appearances */}
        {storyBeat.characterAppearances &&
          storyBeat.characterAppearances.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                {
                  delay: 0.6,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                } as Transition
              }
              className="mt-6 flex justify-center gap-2"
            >
              {storyBeat.characterAppearances.map((character) => (
                <span
                  key={character}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs"
                >
                  {character}
                </span>
              ))}
            </motion.div>
          )}

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            {
              delay: 1.5,
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            } as Transition
          }
          className="mt-8 text-center"
        >
          <button
            type="button"
            onClick={onComplete}
            className="px-8 py-3 bg-white text-black dark:bg-slate-900 dark:text-white rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            {lang === "en" ? "Continue" : "Lanjut"}
          </button>
        </motion.div>

        {/* Skip hint */}
        {storyBeat.skipable && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              {
                delay: 2,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              } as Transition
            }
            className="mt-4 text-center text-xs opacity-50"
          >
            {lang === "en"
              ? "Click anywhere to skip"
              : "Klik di mana saja untuk melewati"}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
