"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Rival } from "@/engine/rivals/rival-types";
import type { TranslationKey } from "@/i18n/use-translation";
import { useTranslation } from "@/i18n/use-translation";

interface RivalDialogProps {
  rival: Rival;
  text: string;
  context: "pre_race" | "overtake_player" | "overtaken_by_player";
  onDismiss: () => void;
}

/**
 * Rival speech bubble dialog shown during races.
 * Appears as a small card beside the leaderboard with auto-dismiss.
 */
export function RivalDialog({
  rival,
  text,
  context,
  onDismiss,
}: RivalDialogProps) {
  const { t, language } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const isPreRace = context === "pre_race";
  const isOvertake = context === "overtake_player";
  const isOvertaken = context === "overtaken_by_player";

  const dismissDuration = isPreRace ? 4000 : 3500;

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Allow exit animation
    }, dismissDuration);

    return () => clearTimeout(timer);
  }, [dismissDuration, onDismiss]);

  // Determine the border color based on context
  const borderColor = isOvertake
    ? "border-emerald-500/50 bg-emerald-950/20"
    : isOvertaken
      ? "border-red-500/50 bg-red-950/20"
      : "border-orange-500/30 bg-orange-950/10";

  const accentColor = isOvertake
    ? "text-emerald-400"
    : isOvertaken
      ? "text-red-400"
      : "text-orange-400";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`relative flex items-start gap-3 p-3 rounded-2xl border backdrop-blur-sm ${borderColor} shadow-lg max-w-[260px]`}
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 200);
          }}
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.5, rotate: isOvertake ? -10 : 10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg border-2
              ${isOvertake ? "border-emerald-500/50" : isOvertaken ? "border-red-500/50" : "border-orange-500/30"}
              bg-slate-800/50`}
          >
            {rival.avatar}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name + context badge */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-black text-white">
                {rival.name} &ldquo;{rival.nickName}&rdquo;
              </span>
              {isOvertake && (
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ⚔️ Overtook
                </span>
              )}
              {isOvertaken && (
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Overtaken
                </span>
              )}
            </div>

            {/* Dialog text */}
            <p className={`text-xs leading-snug ${accentColor}`}>
              &ldquo;{text}&rdquo;
            </p>
          </div>

          {/* Context icon */}
          <div
            className={`shrink-0 text-lg ${isOvertake ? "animate-bounce" : ""}`}
          >
            {isOvertake ? "⚡" : isOvertaken ? "💨" : "💬"}
          </div>

          {/* Shimmer effect for overtakes */}
          {(isOvertake || isOvertaken) && (
            <motion.div
              initial={{ opacity: 0.8, x: -30 }}
              animate={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Pre-race rival lineup
// ---------------------------------------------------------------------------

interface RivalLineupProps {
  rivals: Rival[];
  onIntroComplete: () => void;
}

/**
 * Pre-race "Today's Rivals" panel shown for a few seconds before the race starts.
 */
export function RivalLineup({ rivals, onIntroComplete }: RivalLineupProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onIntroComplete, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onIntroComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 max-w-xs"
        >
          <p className="text-[10px] uppercase tracking-wider font-bold text-orange-400 mb-2">
            {t("challenge.race.rival.pre_race" as TranslationKey)}
          </p>
          <div className="flex flex-col gap-2">
            {rivals.map((rival, index) => (
              <motion.div
                key={rival.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-base">{rival.avatar}</span>
                <div>
                  <span className="font-bold text-white">{rival.name}</span>
                  <span className="text-slate-400 ml-1">
                    &ldquo;{rival.nickName}&rdquo;
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Post-race rival status update
// ---------------------------------------------------------------------------

interface RivalStatusUpdateProps {
  rival: Rival;
  relationshipLevel: number;
  playerBeatRival: boolean;
  margin: number;
  onDismiss: () => void;
}

/**
 * Post-race card showing how a rival relationship changed.
 */
export function RivalStatusUpdate({
  rival,
  relationshipLevel,
  playerBeatRival,
  margin,
  onDismiss,
}: RivalStatusUpdateProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const beatEmoji = playerBeatRival ? "🏆" : "💪";
  const beatText = playerBeatRival
    ? t("challenge.race.rival.victory" as TranslationKey)
    : t("challenge.race.rival.defeated" as TranslationKey);

  const marginText =
    margin < Infinity
      ? t("challenge.race.rival.by_margin" as TranslationKey, {
          seconds: margin.toFixed(1),
        })
      : t("challenge.race.rival.decisively" as TranslationKey);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-3 max-w-[220px] cursor-pointer"
          onClick={() => {
            setShow(false);
            setTimeout(onDismiss, 200);
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{rival.avatar}</span>
            <div>
              <p className="text-xs font-bold text-white">
                {rival.name} &ldquo;{rival.nickName}&rdquo;
              </p>
              <p className="text-[10px] text-slate-400">
                {t("challenge.race.rival.relationship_level" as TranslationKey)}
                : {relationshipLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white flex items-center gap-1">
              {beatEmoji} {beatText}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {marginText}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
