import type { SimulationState } from "@/types/engine";
import type { SeededRandom } from "@/utils/random/seeded-random";
import type { DesperationMode, DesperationOption } from "./desperation-types";

export const DESPERATION_OPTIONS: DesperationOption[] = [
  {
    id: "desperation_sprint",
    action: {
      en: "All-Out Sprint",
      id: "Sprint Habis-habisan",
    },
    description: {
      en: "Push beyond your limits. Massive speed boost, but high collapse risk.",
      id: "Dorong melampaui batas kemampuan Anda. Kecepatan meningkat masif, tetapi risiko kolaps tinggi.",
    },
    effects: {
      pace: -35,
      energy: -30,
      muscleFatigue: 25,
      confidence: 20,
    },
    failureEffects: {
      pace: 45,
      energy: -15,
      muscleFatigue: 45,
      confidence: -30,
    },
    successChance: 0.8, // Adjusted dynamically by willpower
    risk: "high",
  },
  {
    id: "desperation_surge",
    action: {
      en: "Desperate Surge",
      id: "Lonjakan Putus Asa",
    },
    description: {
      en: "A strong pace surge. Balanced speed boost and fatigue trade-off.",
      id: "Lonjakan ritme yang kuat. Kecepatan seimbang dengan kelelahan.",
    },
    effects: {
      pace: -15,
      energy: -15,
      muscleFatigue: 12,
      confidence: 10,
    },
    failureEffects: {
      pace: 20,
      energy: -10,
      muscleFatigue: 22,
      confidence: -15,
    },
    successChance: 0.9, // Adjusted dynamically by willpower
    risk: "medium",
  },
  {
    id: "desperation_maintain",
    action: {
      en: "Maintain Rhythm",
      id: "Pertahankan Ritme",
    },
    description: {
      en: "Hold your current pacing safely. Low risk, no speed boost.",
      id: "Pertahankan ritme saat ini dengan aman. Risiko rendah, tanpa peningkatan kecepatan.",
    },
    effects: {
      pace: 0,
      energy: -5,
      muscleFatigue: 5,
    },
    failureEffects: {
      pace: 0,
      energy: -5,
      muscleFatigue: 5,
    },
    successChance: 1.0,
    risk: "low",
  },
];

export class DesperationEngine {
  /**
   * Determine race condition based on closest active competitor
   */
  public calculateCondition(
    state: SimulationState,
  ): "winning" | "losing" | "close" {
    if (!state.opponents || state.opponents.length === 0) return "winning";

    const activeOpponents = state.opponents.filter((o) => !o.isDNF);
    if (activeOpponents.length === 0) return "winning";

    let minDiff = Number.POSITIVE_INFINITY;
    let closestOpponent = activeOpponents[0];

    for (const opp of activeOpponents) {
      const diff = Math.abs(state.accumulatedTime - opp.accumulatedTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestOpponent = opp;
      }
    }

    if (minDiff <= 5) {
      return "close";
    }

    return state.accumulatedTime < closestOpponent.accumulatedTime
      ? "winning"
      : "losing";
  }

  /**
   * Calculate player's last-kilometer mental state
   */
  public calculateMentalState(
    state: SimulationState,
  ): "determined" | "desperate" | "resigned" {
    if (state.energy <= 15 && state.confidence <= 25) {
      return "resigned";
    }
    if (state.energy <= 40 || state.confidence <= 50) {
      return "desperate";
    }
    return "determined";
  }

  /**
   * Check if desperation mode should trigger
   */
  public checkDesperationTrigger(
    state: SimulationState,
    willpowerAttr = 10,
  ): DesperationMode | null {
    // Only trigger in the final kilometer
    const maxKms = Math.ceil(state.totalDistance);
    const isFinalKm = state.distanceCovered + 1 >= maxKms;

    if (!isFinalKm) {
      return null;
    }

    const condition = this.calculateCondition(state);
    const mentalState = this.calculateMentalState(state);

    return {
      trigger: "final_km",
      condition,
      mentalState,
      boostAvailable: willpowerAttr >= 15 || state.energy > 20,
    };
  }

  public resolveChoice(
    optionId: string,
    willpowerAttr = 10,
    random?: SeededRandom,
  ): {
    recovered: boolean;
    effects: {
      energy?: number;
      pace?: number;
      muscleFatigue?: number;
      mentalFatigue?: number;
      confidence?: number;
    };
  } | null {
    const option = DESPERATION_OPTIONS.find((o) => o.id === optionId);
    if (!option) return null;

    // Scale success chance based on willpower
    let successChance = option.successChance;
    if (option.id === "desperation_sprint") {
      successChance = Math.min(0.95, 0.45 + (willpowerAttr / 100) * 0.45);
    } else if (option.id === "desperation_surge") {
      successChance = Math.min(0.98, 0.65 + (willpowerAttr / 100) * 0.3);
    }

    const roll = random ? random.nextRange(0, 1) : Math.random();
    const recovered = roll < successChance;

    return {
      recovered,
      effects: recovered ? option.effects : option.failureEffects || {},
    };
  }
}
