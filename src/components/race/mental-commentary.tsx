"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { SimulationState } from "@/types/engine";

export type CommentaryTrigger =
  | "race_start"
  | "halfway"
  | "low_energy"
  | "overtake_rival"
  | "being_overtaken"
  | "final_2km"
  | "final_kick"
  | "breaking_point"
  | "near_pb"
  | "behind_pace"
  | "high_fatigue"
  | "desperation"
  | "runners_high";

export interface CommentaryMessage {
  id: string;
  trigger: CommentaryTrigger;
  message: string;
  timestamp: number;
}

interface MentalCommentaryProps {
  trigger: CommentaryTrigger | null;
  customMessage?: string;
  onDismiss?: () => void;
}

/**
 * Get commentary message for a given trigger
 * Returns localized message based on trigger type
 */
function getCommentaryMessage(trigger: CommentaryTrigger): string {
  const messages: Record<CommentaryTrigger, string[]> = {
    race_start: [
      "This is it. All the training comes down to now.",
      "Remember your training. Trust the process.",
      "You've prepared for this. Time to execute.",
    ],
    halfway: [
      "You're halfway there. Don't stop now.",
      "The hard part is coming. Stay strong.",
      "Keep the momentum. You've got this.",
    ],
    low_energy: [
      "Your legs are screaming, but you're NOT giving up!",
      "Pain is temporary. Keep pushing!",
      "Dig deep. Find what's left in the tank.",
    ],
    overtake_rival: [
      "YES! Keep pushing, don't let them back in!",
      "That's what I'm talking about! Maintain this pace!",
      "You just passed them! Now make them suffer!",
    ],
    being_overtaken: [
      "Stay focused. This isn't over yet.",
      "Don't panic. Stay in your rhythm.",
      "Let them go. Run your own race.",
    ],
    final_2km: [
      "This is what separates the good from the great.",
      "Everything you have. Leave nothing behind.",
      "Two kilometers to glory. Make it count.",
    ],
    final_kick: [
      "EVERYTHING you have. NOW!",
      "This is YOUR moment! GIVE IT ALL!",
      "No regrets. EMPTY THE TANK!",
    ],
    breaking_point: [
      "Pain is temporary. Quitting lasts forever.",
      "Your body is testing you. Prove it wrong!",
      "This is the moment that defines you!",
    ],
    near_pb: [
      "You're on track for a personal record!",
      "New PR in sight! Keep this pace!",
      "This could be your best time yet!",
    ],
    behind_pace: [
      "Remember why you started...",
      "Every step forward is still progress.",
      "Adjust and adapt. There's still time.",
    ],
    high_fatigue: [
      "Your body wants to quit, but your mind won't let it.",
      "Fatigue makes cowards of us all. Be brave.",
      "This is when champions are made.",
    ],
    desperation: [
      "Last chance. Give everything you have left!",
      "No holding back now. ALL IN!",
      "This is do or die. FIGHT!",
    ],
    runners_high: [
      "Everything clicks. You feel invincible.",
      "This is the zone. Pure flow state.",
      "Your body and mind are perfectly aligned.",
    ],
  };

  const options = messages[trigger];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * MentalCommentary - Internal monologue system
 * Displays motivational thoughts at key race moments
 */
export function MentalCommentary({
  trigger,
  customMessage,
  onDismiss,
}: MentalCommentaryProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (trigger) {
      const commentaryText = customMessage || getCommentaryMessage(trigger);
      setMessage(commentaryText);
      setVisible(true);

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onDismiss?.();
        }, 300); // Wait for fade out animation
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [trigger, customMessage, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 max-w-md px-4"
        >
          <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-sm border border-slate-700 dark:border-slate-800 rounded-2xl px-6 py-4 shadow-2xl">
            <p className="text-white dark:text-slate-100 text-sm md:text-base italic font-medium text-center leading-relaxed">
              "{message}"
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage commentary queue and prevent spam
 */
export function useCommentaryQueue() {
  const [activeCommentary, setActiveCommentary] = useState<CommentaryTrigger | null>(null);
  const [lastTriggerKm, setLastTriggerKm] = useState<Record<string, number>>({});

  const triggerCommentary = (
    trigger: CommentaryTrigger,
    currentKm: number,
    state: SimulationState
  ) => {
    // Prevent spam: No more than one message per km
    const lastKm = lastTriggerKm[trigger] || -2;
    if (currentKm - lastKm < 1) {
      return;
    }

    // Check if trigger conditions are met
    let shouldTrigger = false;

    switch (trigger) {
      case "race_start":
        shouldTrigger = currentKm <= 0.1;
        break;
      case "halfway":
        const halfwayPoint = state.totalDistance / 2;
        shouldTrigger = Math.abs(currentKm - halfwayPoint) < 0.1;
        break;
      case "low_energy":
        shouldTrigger = state.energy < 30 && state.energy > 15;
        break;
      case "final_2km":
        shouldTrigger = state.distanceCovered >= state.totalDistance - 2.1 && 
                       state.distanceCovered <= state.totalDistance - 1.9;
        break;
      case "near_pb":
        // This should be triggered externally when pace comparison is calculated
        shouldTrigger = true;
        break;
      case "behind_pace":
        shouldTrigger = true;
        break;
      case "high_fatigue":
        shouldTrigger = state.muscleFatigue > 70;
        break;
      case "breaking_point":
        shouldTrigger = !!state.activeBreakingPoint;
        break;
      case "desperation":
        shouldTrigger = !!state.desperationMode;
        break;
      case "runners_high":
        shouldTrigger = !!state.isRunnersHighActive;
        break;
      default:
        shouldTrigger = true;
    }

    if (shouldTrigger) {
      setActiveCommentary(trigger);
      setLastTriggerKm((prev) => ({ ...prev, [trigger]: currentKm }));
    }
  };

  const dismissCommentary = () => {
    setActiveCommentary(null);
  };

  return {
    activeCommentary,
    triggerCommentary,
    dismissCommentary,
  };
}
