import type { LocalizedText } from "@/types/engine";
import type {
  EndorphinEffects,
  EndorphinIntensity,
  WithdrawalEffects,
} from "./endorphin-types";

/**
 * Endorphin effect presets by intensity level
 */
export const ENDORPHIN_EFFECTS_DATABASE: Record<
  EndorphinIntensity,
  EndorphinEffects
> = {
  mild: {
    energyBoost: 10,
    paceBonus: -2, // 2 seconds faster per km
    painSuppression: 15,
    confidenceBoost: 10,
    duration: 2, // 2km
    momentumBoost: 10,
  },
  moderate: {
    energyBoost: 20,
    paceBonus: -5, // 5 seconds faster per km
    painSuppression: 30,
    confidenceBoost: 20,
    duration: 3, // 3km
    momentumBoost: 20,
  },
  intense: {
    energyBoost: 35,
    paceBonus: -8, // 8 seconds faster per km
    painSuppression: 50,
    confidenceBoost: 35,
    duration: 4, // 4km
    momentumBoost: 35,
  },
  extreme: {
    energyBoost: 50,
    paceBonus: -12, // 12 seconds faster per km
    painSuppression: 70,
    confidenceBoost: 50,
    duration: 5, // 5km
    momentumBoost: 50,
  },
};

/**
 * Addiction progression rates by intensity
 */
export const ADDICTION_GAIN_RATES: Record<EndorphinIntensity, number> = {
  mild: 3, // +3 addiction per use
  moderate: 5, // +5 addiction per use
  intense: 8, // +8 addiction per use
  extreme: 12, // +12 addiction per use
};

/**
 * Recovery rates per day without use
 */
export const ADDICTION_RECOVERY_RATE = 2; // -2 addiction per day

/**
 * Withdrawal effect thresholds
 */
export const WITHDRAWAL_THRESHOLDS = {
  /** No withdrawal effects below this */
  none: 30,
  /** Mild withdrawal effects */
  mild: 30,
  /** Moderate withdrawal effects */
  moderate: 50,
  /** Severe withdrawal effects */
  severe: 70,
  /** Critical withdrawal effects */
  critical: 85,
};

/**
 * Calculate withdrawal effects based on addiction level and days since use
 */
export function calculateWithdrawalEffects(
  addictionLevel: number,
  daysSinceUse: number,
): WithdrawalEffects {
  // No withdrawal if addiction is low
  if (addictionLevel < WITHDRAWAL_THRESHOLDS.mild) {
    return {
      energyPenalty: 0,
      focusPenalty: 0,
      confidencePenalty: 0,
      mentalFatiguePenalty: 0,
    };
  }

  // Calculate base penalty multiplier
  let penaltyMultiplier = 1;

  if (addictionLevel >= WITHDRAWAL_THRESHOLDS.critical) {
    penaltyMultiplier = 3;
  } else if (addictionLevel >= WITHDRAWAL_THRESHOLDS.severe) {
    penaltyMultiplier = 2.5;
  } else if (addictionLevel >= WITHDRAWAL_THRESHOLDS.moderate) {
    penaltyMultiplier = 2;
  } else if (addictionLevel >= WITHDRAWAL_THRESHOLDS.mild) {
    penaltyMultiplier = 1.5;
  }

  // Withdrawal gets worse the longer you go without
  const daysMultiplier = Math.min(1 + daysSinceUse * 0.1, 2);

  const basePenalty = (addictionLevel / 100) * 15 * penaltyMultiplier * daysMultiplier;

  const effects: WithdrawalEffects = {
    energyPenalty: Math.round(basePenalty * 1.2),
    focusPenalty: Math.round(basePenalty * 1.0),
    confidencePenalty: Math.round(basePenalty * 0.8),
    mentalFatiguePenalty: Math.round(basePenalty * 1.5),
  };

  // Add craving message for higher addiction
  if (addictionLevel >= WITHDRAWAL_THRESHOLDS.moderate) {
    effects.cravingMessage = {
      en: "You feel an urge to push through the pain...",
      id: "Kamu merasa dorongan untuk menembus rasa sakit...",
    };
  }

  return effects;
}

/**
 * Calculate craving intensity based on addiction and race conditions
 */
export function calculateCravingIntensity(
  addictionLevel: number,
  energy: number,
  muscleFatigue: number,
  mentalFatigue: number,
): number {
  if (addictionLevel < WITHDRAWAL_THRESHOLDS.mild) {
    return 0;
  }

  // Base craving from addiction level
  let craving = (addictionLevel / 100) * 10;

  // Craving increases when suffering (low energy, high fatigue)
  if (energy < 30) {
    craving += 2;
  }
  if (muscleFatigue > 70) {
    craving += 2;
  }
  if (mentalFatigue > 70) {
    craving += 2;
  }

  return Math.min(Math.round(craving), 10);
}

/**
 * Get endorphin crash effects when rush ends
 */
export function getEndorphinCrashEffects(
  intensity: EndorphinIntensity,
): {
  energyDrain: number;
  fatiguePenalty: number;
  confidenceDrop: number;
  message: LocalizedText;
} {
  const crashSeverity: Record<EndorphinIntensity, number> = {
    mild: 0.5,
    moderate: 1,
    intense: 1.5,
    extreme: 2,
  };

  const severity = crashSeverity[intensity];

  return {
    energyDrain: Math.round(10 * severity),
    fatiguePenalty: Math.round(8 * severity),
    confidenceDrop: Math.round(5 * severity),
    message: {
      en: "The endorphin rush fades. Reality sets back in.",
      id: "Efek endorfin memudar. Kenyataan kembali terasa.",
    },
  };
}

/**
 * Determine endorphin intensity based on context
 */
export function determineEndorphinIntensity(
  energy: number,
  muscleFatigue: number,
  mentalFatigue: number,
  riskTaken: "low" | "medium" | "high" | "extreme",
): EndorphinIntensity {
  // More extreme situations = more intense endorphin rush
  const distressLevel =
    (100 - energy) * 0.3 + muscleFatigue * 0.4 + mentalFatigue * 0.3;

  const riskMultiplier: Record<string, number> = {
    low: 0.7,
    medium: 1.0,
    high: 1.3,
    extreme: 1.6,
  };

  const intensityScore = distressLevel * riskMultiplier[riskTaken];

  if (intensityScore < 40) return "mild";
  if (intensityScore < 60) return "moderate";
  if (intensityScore < 80) return "intense";
  return "extreme";
}

/**
 * Endorphin rush messages by intensity
 */
export const ENDORPHIN_RUSH_MESSAGES: Record<
  EndorphinIntensity,
  LocalizedText
> = {
  mild: {
    en: "A surge of energy flows through you!",
    id: "Lonjakan energi mengalir melalui tubuhmu!",
  },
  moderate: {
    en: "Pure euphoria! The pain melts away!",
    id: "Euforia murni! Rasa sakit menghilang!",
  },
  intense: {
    en: "ENDORPHIN RUSH! You feel unstoppable!",
    id: "LONJAKAN ENDORFIN! Kamu merasa tak terhentikan!",
  },
  extreme: {
    en: "ULTIMATE RUSH! Pain is just an illusion now!",
    id: "LONJAKAN MAKSIMAL! Rasa sakit hanyalah ilusi sekarang!",
  },
};

/**
 * Post-race addiction messages
 */
export function getAddictionMessage(
  addictionLevel: number,
): LocalizedText | null {
  if (addictionLevel < WITHDRAWAL_THRESHOLDS.mild) {
    return null;
  }

  if (addictionLevel >= WITHDRAWAL_THRESHOLDS.critical) {
    return {
      en: "You crave that feeling again. The urge is almost unbearable.",
      id: "Kamu mendambakan perasaan itu lagi. Dorongannya hampir tak tertahankan.",
    };
  }

  if (addictionLevel >= WITHDRAWAL_THRESHOLDS.severe) {
    return {
      en: "The memory of that rush lingers. You want to feel it again.",
      id: "Kenangan lonjakan itu masih terasa. Kamu ingin merasakannya lagi.",
    };
  }

  if (addictionLevel >= WITHDRAWAL_THRESHOLDS.moderate) {
    return {
      en: "Part of you misses pushing through the pain like that.",
      id: "Sebagian dirimu merindukan menembus rasa sakit seperti itu.",
    };
  }

  return {
    en: "You remember the euphoric feeling. It was... powerful.",
    id: "Kamu mengingat perasaan euforia itu. Itu... kuat.",
  };
}

/**
 * Endorphin visual effect colors
 */
export const ENDORPHIN_COLORS = {
  glow: "from-pink-500 via-purple-500 to-blue-500",
  text: "text-pink-300",
  border: "border-pink-500",
  bg: "bg-pink-950/90",
  particle: "bg-gradient-to-t from-pink-400 to-purple-500",
  vignette: "rgba(219, 39, 119, 0.3)", // pink-600
  lightGlow: "from-pink-400/20 via-purple-400/20 to-blue-400/20",
};
