"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Flame, Heart, MessageCircle, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settings-store";

export interface SpectatorReaction {
  id: string;
  emoji: string;
  text: string;
  count: number;
  type: "positive" | "negative" | "neutral";
}

interface SpectatorModeProps {
  playerLevel: number;
  currentKm: number;
  isRaceActive: boolean;
  recentEvent?: "overtake" | "breaking_point" | "pb_pace" | "bad_pace" | null;
}

export function calculateSpectatorCount(
  playerLevel: number,
  currentKm: number,
): number {
  const base = Math.max(5, playerLevel * 6);
  const distanceMultiplier = 1 + currentKm * 0.1;
  const variation = (Math.sin(currentKm * 3) + 1) * 0.15 + 0.85;
  return Math.round(base * distanceMultiplier * variation);
}

export function SpectatorMode({
  playerLevel,
  currentKm,
  isRaceActive,
  recentEvent,
}: SpectatorModeProps) {
  const [spectatorCount, setSpectatorCount] = useState(12);
  const [reactions, setReactions] = useState<SpectatorReaction[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (!isRaceActive) return;
    const count = calculateSpectatorCount(playerLevel, currentKm);
    setSpectatorCount(count);
  }, [playerLevel, currentKm, isRaceActive]);

  // Handle reaction popups on key race events
  useEffect(() => {
    if (!recentEvent || !isRaceActive) return;

    let reaction: SpectatorReaction | null = null;
    if (recentEvent === "overtake") {
      reaction = {
        id: `react_${Date.now()}`,
        emoji: "👏",
        text: "+12 cheers!",
        count: 12,
        type: "positive",
      };
    } else if (recentEvent === "pb_pace") {
      reaction = {
        id: `react_${Date.now()}`,
        emoji: "🔥",
        text: "PB Pace!",
        count: 18,
        type: "positive",
      };
    } else if (recentEvent === "breaking_point") {
      reaction = {
        id: `react_${Date.now()}`,
        emoji: "😬",
        text: "Crowd gasps...",
        count: 8,
        type: "negative",
      };
    } else if (recentEvent === "bad_pace") {
      reaction = {
        id: `react_${Date.now()}`,
        emoji: "💪",
        text: "Keep pushing!",
        count: 5,
        type: "neutral",
      };
    }

    if (reaction) {
      setReactions((prev) => [reaction!, ...prev.slice(0, 4)]);
      const timer = setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction!.id));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [recentEvent, isRaceActive]);

  if (!isRaceActive) return null;

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
      {/* Spectator Count Badge */}
      <button
        type="button"
        onClick={() => setShowDrawer((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-white shadow-lg backdrop-blur-md hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
      >
        <Eye className="w-4 h-4 text-sky-400 animate-pulse" />
        <span className="text-xs font-mono font-bold">
          {spectatorCount} watching
        </span>
      </button>

      {/* Floating Reaction Popups */}
      <div className="flex flex-col items-end gap-1.5 pointer-events-none">
        <AnimatePresence>
          {reactions.map((react) => (
            <motion.div
              key={react.id}
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.8 }}
              className={`px-3 py-1.5 rounded-2xl border text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md ${
                react.type === "positive"
                  ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200"
                  : react.type === "negative"
                    ? "bg-rose-950/80 border-rose-500/60 text-rose-200"
                    : "bg-slate-900/80 border-slate-700 text-slate-200"
              }`}
            >
              <span className="text-base">{react.emoji}</span>
              <span>{react.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
